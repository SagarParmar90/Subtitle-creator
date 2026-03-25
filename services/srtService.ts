
import { SubtitleWord } from '../types';

export const parseSRT = async (file: File): Promise<SubtitleWord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
            resolve([]);
            return;
        }

        // Normalize line endings and split into blocks by double newlines
        const normalizedText = text.replace(/\r\n/g, '\n');
        const blocks = normalizedText.trim().split(/\n\n+/);
        const words: SubtitleWord[] = [];

        const parseTime = (timeString: string): number | null => {
          if (!timeString) return null;
          // Flexible regex for 00:00:00,000 or 00:00:00.000
          const match = timeString.trim().match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
          if (!match) return null;
          const [, h, m, s, ms] = match;
          return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
        };

        blocks.forEach(block => {
          const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length < 2) return; 

          // Find the timestamp line (e.g., 00:00:01,000 --> 00:00:02,000)
          let timeLineIndex = lines.findIndex(l => l.includes('-->'));
          if (timeLineIndex === -1) return;

          const timeLine = lines[timeLineIndex];
          const [startStr, endStr] = timeLine.split(/\s*-->\s*/);
          
          const startTime = parseTime(startStr);
          const endTime = parseTime(endStr);
          
          if (startTime === null || endTime === null) return;

          const duration = endTime - startTime;
          
          // Everything after the timestamp line is the subtitle text
          const textLines = lines.slice(timeLineIndex + 1);
          const fullText = textLines.join(' ');
          // Remove HTML tags and extra whitespace
          const cleanText = fullText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          
          if (!cleanText) return;

          const lineWords = cleanText.split(' ');
          const wordDuration = duration / lineWords.length;

          lineWords.forEach((word, i) => {
            words.push({
              word,
              startTime: startTime + (i * wordDuration),
              endTime: startTime + ((i + 1) * wordDuration)
            });
          });
        });

        resolve(words);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};
