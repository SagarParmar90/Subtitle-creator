import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
    selectedLanguage: string;
    onChange: (code: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onChange }) => {
    return (
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Globe className="w-4 h-4 text-white/40 group-hover:text-[#007AFF] transition-colors" />
            </div>
            <select
                value={selectedLanguage}
                onChange={(e) => onChange(e.target.value)}
                className="glass-select w-full !pl-10"
                data-testid="language-selector"
            >
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name} {lang.script ? `(${lang.script})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};
