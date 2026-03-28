import { GoogleGenAI } from "@google/genai";
import type { SubtitleWord } from "../types";

// Emergent LLM Key for Gemini integration
const EMERGENT_API_KEY = "sk-emergent-822Ea03D25c166fB27";

const defaultAi = new GoogleGenAI({ apiKey: EMERGENT_API_KEY });

// Get AI client (either default Emergent key or user-provided)
const getAiClient = (userApiKey?: string) => {
    if (userApiKey) {
        return new GoogleGenAI({ apiKey: userApiKey });
    }
    return defaultAi;
};

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

export const transcribeAudio = async (audioFile: File, language: string, userApiKey?: string): Promise<SubtitleWord[]> => {
    try {
        const ai = getAiClient(userApiKey);
        const base64Audio = await fileToBase64(audioFile);
        const mimeType = audioFile.type || 'audio/mpeg';

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
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

    } catch (error: any) {
        console.error("Transcription error:", error);

        // Handle Quota Limits
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('QUOTA_EXCEEDED');
        }

        throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const transliterateText = async (words: SubtitleWord[], targetLanguage: string = 'English', userApiKey?: string): Promise<SubtitleWord[]> => {
    try {
        const ai = getAiClient(userApiKey);
        const originalText = words.map(w => w.word).join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
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

    } catch (error: any) {
        console.error("Transliteration error:", error);

        // Handle Quota Limits
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('QUOTA_EXCEEDED');
        }

        throw new Error(`Transliteration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
