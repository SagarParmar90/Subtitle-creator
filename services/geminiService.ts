
// FIX: Import `Type` for responseSchema.
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SubtitleWord } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const transcribeAudio = async (file: File, language: string): Promise<SubtitleWord[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const audioPart = await fileToGenerativePart(file);

  const prompt = `You are an expert audio transcription service. Transcribe the provided audio file.
The language of the audio is ${language}.
Your task is to provide a word-for-word transcript with precise start and end timestamps for each word.
The output MUST be a valid JSON array of objects. Each object in the array should represent a single word and have three properties:
- "word": the transcribed word (string)
- "startTime": the start time in seconds (number)
- "endTime": the end time in seconds (number)
Generate the transcription for the ENTIRE audio file. Ensure timestamps are perfectly synchronized with the audio speech.`;
  
  const textPart = { text: prompt };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [audioPart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
            },
            required: ['word', 'startTime', 'endTime'],
          }
        }
    },
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI.");
    const transcription = JSON.parse(text);
    return Array.isArray(transcription) ? transcription : [];
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("The AI failed to generate a valid transcript.");
  }
};

export const transliterateText = async (subtitles: SubtitleWord[]): Promise<SubtitleWord[]> => {
  if (!process.env.API_KEY) throw new Error("API_KEY not set.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `You are an expert transliteration service. Your task is to transliterate each 'word' in the provided JSON array into the Roman (English) script.
Keep the 'startTime' and 'endTime' values exactly the same for each word.
JSON: ${JSON.stringify(subtitles)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
            },
            required: ['word', 'startTime', 'endTime'],
          }
        }
    },
  });

  return JSON.parse(response.text || "[]");
};

export const translateToEnglish = async (subtitles: SubtitleWord[]): Promise<SubtitleWord[]> => {
  if (!process.env.API_KEY) throw new Error("API_KEY not set.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `You are a professional translator. Translate the following subtitles into English.
Provide the translation as a word-for-word array that maps to the original timing as closely as possible.
Preserve the start and end timestamps.
JSON: ${JSON.stringify(subtitles)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
            },
            required: ['word', 'startTime', 'endTime'],
          }
        }
    },
  });

  return JSON.parse(response.text || "[]");
};
