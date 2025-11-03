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
The language is ${language}.
Your task is to provide a word-for-word transcript with precise start and end timestamps for each word.
The output MUST be a valid JSON array of objects. Each object in the array should represent a single word and have three properties:
- "word" (the transcribed word as a string)
- "startTime" (the start time of the word in seconds, as a floating-point number)
- "endTime" (the end time of the word in seconds, as a floating-point number).
Your entire response must be ONLY the raw JSON array. Do not include any introductory text, explanations, or code block formatting.`;
  
  const textPart = { text: prompt };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [audioPart, textPart] },
    config: {
        responseMimeType: "application/json",
        // FIX: Use responseSchema to enforce a robust JSON output structure for the transcription.
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
    const transcription = JSON.parse(response.text);
    // Basic validation
    if (Array.isArray(transcription) && transcription.every(item => 'word' in item && 'startTime' in item && 'endTime' in item)) {
        return transcription as SubtitleWord[];
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    console.error("Raw response text:", response.text);
    throw new Error("The AI returned an invalid response format. Please try again.");
  }
};
