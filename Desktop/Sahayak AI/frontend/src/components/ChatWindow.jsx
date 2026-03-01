import React, { useRef, useEffect, useState } from 'react';

export default function ChatWindow({ messages, onSendMessage, language, loading, error }) {
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !loading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 relative min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`animate-slide-in-up opacity-0 flex max-w-[80%] ${msg.role === 'user' ? 'ml-auto justify-end' : ''}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 shadow-md flex-shrink-0 animate-float">
                                🤖
                            </div>
                        )}

                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed transition-all hover:shadow-md ${msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-sm'
                            : 'bg-white border text-gray-800 rounded-bl-sm'
                            }`}>
                            {msg.content}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center ml-3 mt-1 shadow-inner flex-shrink-0">
                                👤
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 shadow flex-shrink-0">
                            🤖
                        </div>
                        <div className="p-4 rounded-2xl shadow-sm bg-white border rounded-bl-sm flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-center p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg max-w-[80%] mx-auto mt-4 transition-all">
                        {language === 'en' ? 'Connection Error: Unable to reach the AI.' : 'कनेक्शन त्रुटि: AI तक पहुँचने में असमर्थ।'}
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div className="p-4 bg-white border-t z-20">
                <form onSubmit={handleSubmit} className="flex relative items-center shadow-sm">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder={language === 'en' ? "Type your answer..." : "अपना उत्तर लिखें..."}
                        className="flex-1 p-3 px-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-16"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 hover:shadow-lg disabled:opacity-50 transition-all shadow-sm active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </form>
                <div className="text-center mt-2 text-xs text-gray-400">
                    Powered by GPT-4o-mini
                </div>
            </div>
        </div>
    );
}
