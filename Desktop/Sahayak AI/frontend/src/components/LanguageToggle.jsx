import React from 'react';

export default function LanguageToggle({ language, onChange }) {
    return (
        <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 border shadow-sm">
            <button
                onClick={() => onChange('en')}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${language === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => onChange('hi')}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${language === 'hi' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                HI
            </button>
        </div>
    );
}
