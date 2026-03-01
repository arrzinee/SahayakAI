const API_BASE = 'http://localhost:8000';

export async function sendMessage(userId, sessionId, message, conceptId) {
    const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, session_id: sessionId, message, concept_id: conceptId })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
}

export async function getConcepts(userId) {
    const res = await fetch(`${API_BASE}/api/concepts/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch concepts');
    return res.json();
}

export async function startSession(userId, conceptId) {
    const res = await fetch(`${API_BASE}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, concept_id: conceptId })
    });
    if (!res.ok) throw new Error('Failed to start session');
    return res.json();
}
