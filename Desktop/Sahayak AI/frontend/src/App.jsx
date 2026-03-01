import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ChatWindow from './components/ChatWindow';
import SkillTree from './components/SkillTree';
import StatsPanel from './components/StatsPanel';
import LanguageToggle from './components/LanguageToggle';
import { getConcepts, startSession, sendMessage } from './api/client';

function App() {
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));
  const [sessionId, setSessionId] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConcept, setCurrentConcept] = useState(null);
  const [hintLevel, setHintLevel] = useState(1);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    initializeSession();
  }, []);

  async function initializeSession() {
    try {
      setLoading(true);
      const data = await getConcepts(userId);
      setConcepts(data.concepts);
      setCurrentConcept(data.concepts[0]);

      const session = await startSession(userId, data.concepts[0].id);
      setSessionId(session.session_id);

      setMessages([{
        role: 'assistant',
        content: session.initial_question,
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
      setApiError(true);
      setMessages([{
        role: 'assistant',
        content: language === 'en' ? 'Error connecting to backend. Is Django running on port 8000?' : 'बैकएंड से कनेक्ट करने में त्रुटि। क्या Django पोर्ट 8000 पर चल रहा है?',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(message) {
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      const response = await sendMessage(userId, sessionId, message, currentConcept.id);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }]);

      setHintLevel(response.hint_level);

      setConcepts(prev => prev.map(c =>
        c.id === currentConcept.id
          ? { ...c, mastery: response.mastery }
          : c
      ));

      // Update unlocked states
      setConcepts(prev => prev.map(c => {
        if (!c.prerequisites || c.prerequisites.length === 0) return c;
        let unlocked = true;
        for (const pre of c.prerequisites) {
          const preConcept = prev.find(p => p.id === pre);
          if (preConcept && preConcept.mastery < 0.7) unlocked = false;
        }
        return { ...c, is_unlocked: unlocked };
      }));

      if (response.is_correct && response.mastery >= 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      console.error("Chat error:", e);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col overflow-hidden font-sans">
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xl">S</div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Sahayak<span className="text-blue-600">AI</span></h1>
        </div>
        <LanguageToggle language={language} onChange={setLanguage} />
      </header>

      <main className="flex-1 flex w-full overflow-hidden">
        <SkillTree concepts={concepts} currentConcept={currentConcept} language={language} />

        <div className="flex-1 flex flex-col relative">
          <div className="bg-white border-b p-4 shadow-sm z-10 flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-gray-700">{language === 'en' ? 'Current Topic' : 'वर्तमान विषय'}</span>
              <div className="text-blue-600 font-bold">{currentConcept?.name || (language === 'en' ? "Loading..." : "लोड हो रहा है...")}</div>
            </div>

            <div className="md:hidden flex space-x-4">
              <span className="font-semibold text-gray-600">{language === 'en' ? 'Mastery' : 'महारत'}: {Math.round((currentConcept?.mastery || 0) * 100)}%</span>
            </div>
          </div>

          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            language={language}
            loading={loading}
            error={apiError}
          />
        </div>

        <StatsPanel
          mastery={currentConcept?.mastery || 0}
          hintLevel={hintLevel}
          streak={3}
          language={language}
        />
      </main>
    </div>
  );
}

export default App;
