import type { SupportedLanguage } from "./types";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi', script: 'Devanagari' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese', script: 'Kana/Kanji' },
    { code: 'zh', name: 'Chinese', script: 'Han' },
    { code: 'ko', name: 'Korean', script: 'Hangul' },
    { code: 'ar', name: 'Arabic', script: 'Arabic' },
    { code: 'ru', name: 'Russian', script: 'Cyrillic' },
];
