import type { SubtitleWord } from "../types";

interface SRTBlock {
    index: number;
    startTime: number;
    endTime: number;
    text: string;
}

const timeToSeconds = (timeStr: string): number => {
    const [time, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + (ms ? Number(ms) / 1000 : 0);
};

export const parseSRT = (srtContent: string): SubtitleWord[] => {
    const blocks: SRTBlock[] = [];
    const lines = srtContent.trim().split('\n');

    let i = 0;
    while (i < lines.length) {
        // Skip empty lines
        if (!lines[i].trim()) {
            i++;
            continue;
        }

        // Index line
        const index = parseInt(lines[i].trim());
        i++;

        // Timestamp line
        const timeMatch = lines[i]?.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        if (!timeMatch) {
            i++;
            continue;
        }

        const startTime = timeToSeconds(timeMatch[1]);
        const endTime = timeToSeconds(timeMatch[2]);
        i++;

        // Text lines (until empty line or end)
        let text = '';
        while (i < lines.length && lines[i].trim()) {
            text += (text ? ' ' : '') + lines[i].trim();
            i++;
        }

        blocks.push({ index, startTime, endTime, text });
    }

    // Convert blocks to word-level subtitles
    const words: SubtitleWord[] = [];

    blocks.forEach(block => {
        const blockWords = block.text.split(/\s+/).filter(w => w.length > 0);
        const duration = block.endTime - block.startTime;
        const wordDuration = duration / blockWords.length;

        blockWords.forEach((word, idx) => {
            words.push({
                word: word,
                startTime: block.startTime + (idx * wordDuration),
                endTime: block.startTime + ((idx + 1) * wordDuration)
            });
        });
    });

    return words;
};
