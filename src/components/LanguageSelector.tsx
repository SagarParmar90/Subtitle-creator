import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
    selectedLanguage: string;
    onChange: (code: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onChange }) => {
    return (
        <div className="relative group">
            <select
                value={selectedLanguage}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none w-full px-4 py-2 bg-slate-800/40 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition-all backdrop-blur-md cursor-pointer"
            >
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                        {lang.name} {lang.script ? `(${lang.script})` : ''}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-neon-purple transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
};
