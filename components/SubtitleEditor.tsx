import React, { useState, useEffect } from 'react';
import { SubtitleWord, ExportFormat } from '../types';

interface SubtitleEditorProps {
  initialSubtitles: SubtitleWord[];
  onRestart: () => void;
}

const formatTimestamp = (seconds: number, format: 'srt' | 'default'): string => {
  const date = new Date(0);
  date.setSeconds(seconds);
  const timeString = date.toISOString().substr(11, 12);
  if (format === 'srt') {
    return timeString.replace('.', ',');
  }
  return timeString.substr(0, 8); // hh:mm:ss
};

// Utility to group words into subtitle lines for SRT format
const groupWordsToLines = (words: SubtitleWord[]): { text: string, startTime: number, endTime: number }[] => {
    const lines: { text: string, startTime: number, endTime: number }[] = [];
    if (words.length === 0) return lines;

    let currentLine = { text: words[0].word, startTime: words[0].startTime, endTime: words[0].endTime };

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const prevWord = words[i - 1];
        const pause = word.startTime - prevWord.endTime;

        if (pause > 0.7 || currentLine.text.length > 42) {
            lines.push(currentLine);
            currentLine = { text: word.word, startTime: word.startTime, endTime: word.endTime };
        } else {
            currentLine.text += ` ${word.word}`;
            currentLine.endTime = word.endTime;
        }
    }
    lines.push(currentLine);
    return lines;
};


const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ initialSubtitles, onRestart }) => {
  const [subtitles, setSubtitles] = useState<SubtitleWord[]>(initialSubtitles);

  useEffect(() => {
    setSubtitles(initialSubtitles);
  }, [initialSubtitles]);

  const handleWordChange = (index: number, newWord: string) => {
    const updatedSubtitles = [...subtitles];
    updatedSubtitles[index].word = newWord;
    setSubtitles(updatedSubtitles);
  };
  
  const handleDownload = (format: ExportFormat) => {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `subtitles.${format}`;

    switch (format) {
      case 'srt':
        const lines = groupWordsToLines(subtitles);
        content = lines.map((line, index) => 
            `${index + 1}\n${formatTimestamp(line.startTime, 'srt')} --> ${formatTimestamp(line.endTime, 'srt')}\n${line.text}\n`
        ).join('\n');
        break;
      case 'txt':
        content = subtitles.map(s => s.word).join(' ');
        break;
      case 'csv':
        content = 'word,startTime,endTime\n';
        content += subtitles.map(s => `"${s.word.replace(/"/g, '""')}",${s.startTime.toFixed(3)},${s.endTime.toFixed(3)}`).join('\n');
        mimeType = 'text/csv';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Subtitles</h2>
            <div className="flex items-center gap-2">
                <div className="flex space-x-2">
                    <button onClick={() => handleDownload('srt')} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Export .srt</button>
                    <button onClick={() => handleDownload('txt')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.txt</button>
                    <button onClick={() => handleDownload('csv')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.csv</button>
                </div>
                <button onClick={onRestart} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Start Over</button>
            </div>
        </div>

        <div className="overflow-y-auto h-[60vh] pr-2">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center">
            {subtitles.map((subtitle, index) => (
                <React.Fragment key={index}>
                    <div className="text-right font-mono text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(subtitle.startTime, 'default')}
                    </div>
                    <input
                        type="text"
                        value={subtitle.word}
                        onChange={(e) => handleWordChange(index, e.target.value)}
                        className="w-full px-2 py-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </React.Fragment>
            ))}
            </div>
        </div>
    </div>
  );
};

export default SubtitleEditor;
