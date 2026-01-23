import { GoogleGenAI } from "@google/genai";
import type { SubtitleWord } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
    console.warn("⚠️ VITE_GEMINI_API_KEY not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const transcribeAudio = async (audioFile: File, language: string): Promise<SubtitleWord[]> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    try {
        const base64Audio = await fileToBase64(audioFile);
        const mimeType = audioFile.type || 'audio/mpeg';

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Audio
                            }
                        },
                        {
                            text: `Transcribe this ${language} audio into a JSON array of word-level timestamps. 
Each word must have: "word" (the text), "startTime" (in seconds), "endTime" (in seconds).
Return ONLY valid JSON, no markdown formatting.`
                        }
                    ]
                }
            ],
            config: {
                responseSchema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            word: { type: 'string' },
                            startTime: { type: 'number' },
                            endTime: { type: 'number' }
                        },
                        required: ['word', 'startTime', 'endTime']
                    }
                }
            }
        });

        const jsonText = response.text || '[]';
        const words: SubtitleWord[] = JSON.parse(jsonText);

        return words;

    } catch (error) {
        console.error("Transcription error:", error);
        throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const transliterateText = async (words: SubtitleWord[], targetLanguage: string = 'English'): Promise<SubtitleWord[]> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    try {
        const originalText = words.map(w => w.word).join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Transliterate (romanize) the following text into Latin script (${targetLanguage} pronunciation).
Preserve word count and order. Return ONLY the transliterated text, no explanations.

Text: "${originalText}"`
        });

        const transliteratedText = (response.text || '').trim();
        const transliteratedWords = transliteratedText.split(/\s+/);

        // Preserve timestamps, update text
        return words.map((word, idx) => ({
            ...word,
            word: transliteratedWords[idx] || word.word
        }));

    } catch (error) {
        console.error("Transliteration error:", error);
        throw new Error(`Transliteration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
