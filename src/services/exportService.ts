import type { SubtitleWord, ExportFormat } from "../types";

export interface ExportSettings {
    maxCharsPerLine: number;
    linesPerBlock: 1 | 2;
    minDuration: number; // seconds
    gapBetweenBlocks: number; // milliseconds
    cleanBrackets: boolean;
}

const DEFAULT_SETTINGS: ExportSettings = {
    maxCharsPerLine: 32,
    linesPerBlock: 2,
    minDuration: 0.5,
    gapBetweenBlocks: 100,
    cleanBrackets: false
};

// Format seconds to SRT timestamp (HH:MM:SS,mmm)
const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
};

// Clean bracketed text like [Music], [Applause]
const cleanText = (text: string, shouldClean: boolean): string => {
    if (!shouldClean) return text;
    return text.replace(/\[.*?\]/g, '').trim();
};

// Generate SRT format
export const generateSRT = (words: SubtitleWord[], settings: ExportSettings = DEFAULT_SETTINGS): string => {
    if (words.length === 0) return '';

    const lines: { text: string; startTime: number; endTime: number }[] = [];
    let currentLine = '';
    let lineStartTime = words[0].startTime;
    let lineEndTime = words[0].endTime;

    // Step 1: Group words into lines based on maxCharsPerLine
    for (let i = 0; i < words.length; i++) {
        const word = cleanText(words[i].word, settings.cleanBrackets);
        if (!word) continue;

        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length > settings.maxCharsPerLine && currentLine) {
            // Save current line and start new one
            lines.push({ text: currentLine, startTime: lineStartTime, endTime: lineEndTime });
            currentLine = word;
            lineStartTime = words[i].startTime;
            lineEndTime = words[i].endTime;
        } else {
            currentLine = testLine;
            lineEndTime = words[i].endTime;
        }
    }

    // Push last line
    if (currentLine) {
        lines.push({ text: currentLine, startTime: lineStartTime, endTime: lineEndTime });
    }

    // Step 2: Group lines into blocks (single or double)
    const blocks: { text: string; startTime: number; endTime: number }[] = [];

    for (let i = 0; i < lines.length; i += settings.linesPerBlock) {
        const blockLines = lines.slice(i, i + settings.linesPerBlock);
        const blockText = blockLines.map(l => l.text).join('\n');
        const blockStart = blockLines[0].startTime;
        let blockEnd = blockLines[blockLines.length - 1].endTime;

        // Enforce minimum duration
        if (blockEnd - blockStart < settings.minDuration) {
            blockEnd = blockStart + settings.minDuration;
        }

        blocks.push({ text: blockText, startTime: blockStart, endTime: blockEnd });
    }

    // Step 3: Apply gap between blocks and format as SRT
    let srtContent = '';

    for (let i = 0; i < blocks.length; i++) {
        let { text, startTime, endTime } = blocks[i];

        // Add gap to end time if there's a next block
        if (i < blocks.length - 1) {
            const nextStart = blocks[i + 1].startTime;
            const gapSeconds = settings.gapBetweenBlocks / 1000;

            if (endTime + gapSeconds < nextStart) {
                endTime = Math.min(endTime, nextStart - gapSeconds);
            }
        }

        srtContent += `${i + 1}\n`;
        srtContent += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
        srtContent += `${text}\n\n`;
    }

    return srtContent.trim();
};

// Generate CSV format
export const generateCSV = (words: SubtitleWord[]): string => {
    let csv = 'Word,Start Time (s),End Time (s)\n';

    words.forEach(word => {
        csv += `"${word.word}",${word.startTime.toFixed(3)},${word.endTime.toFixed(3)}\n`;
    });

    return csv;
};

// Generate JSON format
export const generateJSON = (words: SubtitleWord[]): string => {
    return JSON.stringify(words, null, 2);
};

// Generate TXT format (plain text)
export const generateTXT = (words: SubtitleWord[]): string => {
    return words.map(w => w.word).join(' ');
};

// Generate Premiere Pro Transcript format
export const generatePremierePro = (words: SubtitleWord[]): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<transcript>\n';

    words.forEach((word, index) => {
        xml += `  <word id="${index + 1}" start="${word.startTime.toFixed(3)}" end="${word.endTime.toFixed(3)}">${word.word}</word>\n`;
    });

    xml += '</transcript>';

    return xml;
};

// Main export function
export const exportSubtitles = (
    words: SubtitleWord[],
    format: ExportFormat,
    settings?: ExportSettings
): { content: string; filename: string; mimeType: string } => {
    const timestamp = new Date().toISOString().slice(0, 10);

    switch (format) {
        case 'srt':
            return {
                content: generateSRT(words, settings),
                filename: `subtitles_${timestamp}.srt`,
                mimeType: 'text/plain'
            };
        case 'csv':
            return {
                content: generateCSV(words),
                filename: `subtitles_${timestamp}.csv`,
                mimeType: 'text/csv'
            };
        case 'json':
            return {
                content: generateJSON(words),
                filename: `subtitles_${timestamp}.json`,
                mimeType: 'application/json'
            };
        case 'txt':
            return {
                content: generateTXT(words),
                filename: `subtitles_${timestamp}.txt`,
                mimeType: 'text/plain'
            };
        case 'prtranscript':
            return {
                content: generatePremierePro(words),
                filename: `subtitles_${timestamp}.prtranscript`,
                mimeType: 'application/xml'
            };
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
};

// Download helper
export const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
