export interface SubtitleWord {
    word: string;
    startTime: number;
    endTime: number;
}

export type AppState = 'idle' | 'loading' | 'editing' | 'error';
export type ExportFormat = 'srt' | 'txt' | 'csv' | 'json' | 'prtranscript';

export interface SupportedLanguage {
    code: string;
    name: string;
    script?: string;
}
