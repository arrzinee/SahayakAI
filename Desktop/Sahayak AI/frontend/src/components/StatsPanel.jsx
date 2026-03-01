import React from 'react';

export default function StatsPanel({ mastery, hintLevel, streak, language }) {
    const formatMastery = (val) => Math.round(val * 100);
    const masteryPct = formatMastery(mastery);

    return (
        <div className="w-64 bg-white border-l p-6 hidden md:block z-10">
            <h2 className="text-lg font-bold text-gray-800 mb-6">{language === 'en' ? 'Your Stats' : 'आपके आँकड़े'}</h2>

            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 transition-all hover:shadow-md">
                <label className="text-sm font-semibold text-blue-800 block mb-2">{language === 'en' ? 'Current Mastery' : 'वर्तमान महारत'}</label>
                <div className="flex items-end space-x-2">
                    <span className="text-4xl font-black text-blue-600 animate-pulse-soft">{masteryPct}%</span>
                </div>
            </div>

            <div className="mb-8">
                <label className="text-sm font-semibold text-gray-500 block mb-2">{language === 'en' ? 'Hint Level' : 'संकेत स्तर'}</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(level => (
                        <div
                            key={level}
                            className={`h-2 flex-1 rounded-full text-center transition-all duration-500 ${level <= hintLevel ? 'bg-yellow-400 shadow-sm' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">{hintLevel}/5 {language === 'en' ? 'Assistance' : 'सहायता'}</p>
            </div>

            <div className="mb-8 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-1">
                <div>
                    <label className="text-xs font-semibold text-orange-600 block">{language === 'en' ? 'Learning Streak' : 'सीखने की लय'}</label>
                    <span className="text-xl font-bold text-orange-500">{streak} {language === 'en' ? 'Days' : 'दिन'}</span>
                </div>
                <span className="text-2xl animate-float origin-bottom">🔥</span>
            </div>
        </div>
    );
}
