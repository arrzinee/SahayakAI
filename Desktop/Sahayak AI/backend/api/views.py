import json
import uuid
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import openai
import os
from dotenv import load_dotenv

load_dotenv()

# Setup OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY", "your-api-key")

# IN-MEMORY STORAGE (No database needed for prototype)
students = {}  # user_id -> { mastery: {concept: float}, history: [] }
sessions = {}  # session_id -> conversation history

# CONCEPT DEFINITIONS
CONCEPTS = [
    {
        "id": "expanding",
        "name": "Expanding Expressions",
        "prerequisites": [],
        "initial_mastery": 0.45
    },
    {
        "id": "linear",
        "name": "Linear Equations", 
        "prerequisites": ["expanding"],
        "initial_mastery": 0.0
    },
    {
        "id": "quadratic",
        "name": "Quadratic Equations",
        "prerequisites": ["linear"],
        "initial_mastery": 0.0
    }
]

SYSTEM_PROMPT = """You are a Socratic tutor teaching math to Class 10 students.

CRITICAL RULES:
1. NEVER give direct answers
2. Guide with questions and hints
3. Progress through 5 hint levels:
   - Level 1: Very vague ("What do you know about this?")
   - Level 2: Concept hint ("Think about distributive property")
   - Level 3: Specific guidance ("What is x times (x-2)?")
   - Level 4: Near-complete ("You have x² - 2x. What about 3 times (x-2)?")
   - Level 5: Worked example (show steps but ask them to finish)

4. Detect language (English or Hindi) and respond in same language
5. If student says "I don't know" or struggles, give next hint level
6. Celebrate partial progress: "Good start!", "You're on the right track!"
7. Keep responses SHORT (2-3 sentences max)

Current hint level: {hint_level}
Student's last 3 responses: {history}

Respond as the tutor would."""

def update_mastery(current: float, is_correct: bool) -> float:
    """Super simple mastery update"""
    if is_correct:
        return min(1.0, current + 0.15)  # +15% when correct
    else:
        return max(0.0, current + 0.05)  # +5% for trying

def check_answer_correct(answer: str, concept_id: str) -> bool:
    """Simple answer checking for demo"""
    answer = answer.lower().replace(" ", "")
    
    # For expanding (x+3)(x-2) = x²+x-6
    if concept_id == "expanding":
        correct_answers = ["x²+x-6", "x^2+x-6", "x2+x-6", "x^2+1x-6"]
        return any(ca in answer for ca in correct_answers)
    
    return False

@csrf_exempt
def get_concepts(request, user_id):
    if request.method != 'GET':
        return JsonResponse({"error": "GET required"}, status=405)

    if user_id not in students:
        students[user_id] = {
            "mastery": {c["id"]: c["initial_mastery"] for c in CONCEPTS},
            "history": []
        }
    
    student = students[user_id]
    
    concepts_with_mastery = []
    for concept in CONCEPTS:
        mastery = student["mastery"][concept["id"]]
        
        is_unlocked = True
        if concept["prerequisites"]:
            for prereq in concept["prerequisites"]:
                if student["mastery"][prereq] < 0.7:
                    is_unlocked = False
                    break
        
        concepts_with_mastery.append({
            **concept,
            "mastery": mastery,
            "is_unlocked": is_unlocked
        })
    
    return JsonResponse({"concepts": concepts_with_mastery})

@csrf_exempt
def start_session(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)
    
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        concept_id = data.get('concept_id')
        
        if not user_id or not concept_id:
            return JsonResponse({"error": "user_id and concept_id required"}, status=400)
            
        session_id = str(uuid.uuid4())
        
        sessions[session_id] = {
            "messages": [],
            "hint_level": 1,
            "concept_id": concept_id,
            "started_at": datetime.now()
        }
        
        opening = f"Let's work on {CONCEPTS[0]['name']}. What is (x+3)(x-2)?"
        
        return JsonResponse({
            "session_id": session_id,
            "initial_question": opening
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def chat(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)
        
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        session_id = data.get('session_id')
        message = data.get('message')
        concept_id = data.get('concept_id')
        
        if not all([user_id, session_id, message, concept_id]):
            return JsonResponse({"error": "Missing required fields"}, status=400)
            
        if user_id not in students:
            students[user_id] = {
                "mastery": {c["id"]: c["initial_mastery"] for c in CONCEPTS},
                "history": []
            }
            
        if session_id not in sessions:
            sessions[session_id] = {
                "messages": [],
                "hint_level": 1
            }
            
        session = sessions[session_id]
        student = students[user_id]
        
        session["messages"].append({"role": "user", "content": message})
        
        is_correct = check_answer_correct(message, concept_id)
        
        current_mastery = student["mastery"][concept_id]
        new_mastery = update_mastery(current_mastery, is_correct)
        student["mastery"][concept_id] = new_mastery
        
        if "don't know" in message.lower() or "not sure" in message.lower() or "kya" in message.lower() or "nahi" in message.lower():
            session["hint_level"] = min(5, session["hint_level"] + 1)
            
        recent_history = session["messages"][-6:]
        
        prompt = SYSTEM_PROMPT.format(
            hint_level=session["hint_level"],
            history=recent_history
        )
        
        client = openai.OpenAI(api_key=openai.api_key)
        
        # In a real environment we would make an async call, but synchronous is fine for demo
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                *recent_history
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        ai_response = completion.choices[0].message.content
        session["messages"].append({"role": "assistant", "content": ai_response})
        
        return JsonResponse({
            "response": ai_response,
            "hint_level": session["hint_level"],
            "mastery": new_mastery,
            "is_correct": is_correct
        })
    except Exception as e:
        print(e)
        return JsonResponse({"error": str(e)}, status=500)
