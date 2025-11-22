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

        // Normalize line endings
        const normalizedText = text.replace(/\r\n/g, '\n');
        const blocks = normalizedText.trim().split(/\n\s*\n/);
        const words: SubtitleWord[] = [];

        const parseTime = (timeString: string): number | null => {
          if (!timeString) return null;
          const match = timeString.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
          if (!match) return null;
          const [, h, m, s, ms] = match;
          return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
        };

        blocks.forEach(block => {
          const lines = block.split('\n');
          if (lines.length < 2) return; 

          let timeLineIndex = -1;
          for(let i=0; i<lines.length; i++) {
              if (lines[i].includes('-->')) {
                  timeLineIndex = i;
                  break;
              }
          }
          
          if (timeLineIndex === -1) return;

          const timeLine = lines[timeLineIndex];
          const [startStr, endStr] = timeLine.split(' --> ');
          
          const startTime = parseTime(startStr);
          const endTime = parseTime(endStr);
          
          if (startTime === null || endTime === null) return;

          const duration = endTime - startTime;
          
          const textLines = lines.slice(timeLineIndex + 1);
          const fullText = textLines.join(' ');
          const cleanText = fullText.replace(/<[^>]*>/g, '').trim();
          
          if (!cleanText) return;

          const lineWords = cleanText.split(/\s+/);
          if (lineWords.length === 0) return;
          
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
