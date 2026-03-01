import React from 'react';

export default function SkillTree({ concepts, currentConcept, language }) {
    const getProgressColor = (mastery) => {
        if (mastery >= 0.7) return 'bg-green-500';
        if (mastery >= 0.4) return 'bg-yellow-400';
        return 'bg-red-500';
    };

    return (
        <div className="w-72 bg-white border-r p-6 hidden md:block">
            <h2 className="text-lg font-bold text-gray-800 mb-6">{language === 'en' ? 'Pathways' : 'मार्ग'}</h2>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {concepts.map((concept, idx) => {
                    const isCurrent = currentConcept?.id === concept.id;
                    const masteryPct = Math.round(concept.mastery * 100);

                    return (
                        <div key={concept.id} className={`relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${isCurrent ? 'bg-blue-50 border border-blue-200 shadow-md transform scale-105 z-10' : 'hover:bg-gray-50'
                            } ${!concept.is_unlocked ? 'opacity-50 grayscale' : ''}`}>

                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${concept.is_unlocked ? 'bg-blue-600' : 'bg-gray-300'} ${isCurrent ? 'animate-ping opacity-75' : ''}`} />
                                    <div className={`absolute w-2 h-2 rounded-full ${concept.is_unlocked ? 'bg-blue-600' : 'bg-transparent'}`} />
                                    <h3 className={`text-sm font-semibold transition-colors ${isCurrent ? 'text-blue-700' : 'text-gray-800'}`}>
                                        {concept.name}
                                        {!concept.is_unlocked && <span className="ml-2 text-xs">🔒</span>}
                                    </h3>
                                </div>

                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${getProgressColor(concept.mastery)}`}
                                        style={{ width: `${masteryPct}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs text-gray-500 font-medium mt-1">
                                    {masteryPct}%
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
