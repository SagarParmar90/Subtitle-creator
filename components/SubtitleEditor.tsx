import React, { useState, useEffect } from 'react';
import { SubtitleWord, ExportFormat } from '../types';
import { transliterateText } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';

interface SubtitleEditorProps {
  initialSubtitles: SubtitleWord[];
  onRestart: () => void;
  language: string;
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


const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ initialSubtitles, onRestart, language }) => {
  const [subtitles, setSubtitles] = useState<SubtitleWord[]>(initialSubtitles);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [hasBeenRomanized, setHasBeenRomanized] = useState<boolean>(false);
  const [transliterationError, setTransliterationError] = useState<string | null>(null);

  useEffect(() => {
    setSubtitles(initialSubtitles);
  }, [initialSubtitles]);

  const handleWordChange = (index: number, newWord: string) => {
    const updatedSubtitles = [...subtitles];
    updatedSubtitles[index].word = newWord;
    setSubtitles(updatedSubtitles);
  };

  const handleRomanize = async () => {
    setIsTranslating(true);
    setTransliterationError(null);
    try {
      const result = await transliterateText(subtitles);
      setSubtitles(result);
      setHasBeenRomanized(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setTransliterationError(`Failed to Romanize: ${errorMessage}`);
    } finally {
      setIsTranslating(false);
    }
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
      case 'json':
        content = JSON.stringify(subtitles, null, 2);
        mimeType = 'application/json';
        filename = 'subtitles.json';
        break;
      case 'prtranscript':
        const prTranscriptObject = {
          version: '1.0',
          'word-level-transcript': subtitles.map(s => ({
            'start-time': s.startTime,
            'end-time': s.endTime,
            word: s.word,
          })),
        };
        content = JSON.stringify(prTranscriptObject, null, 2);
        mimeType = 'application/json';
        filename = 'subtitles.prtranscript';
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

  const shouldShowRomanizeButton = !language.startsWith('en-');

  return (
    <div className="w-full p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Subtitles</h2>
            <div className="flex flex-wrap justify-end items-center gap-2">
                {shouldShowRomanizeButton && (
                    <button
                        onClick={handleRomanize}
                        disabled={isTranslating || hasBeenRomanized}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
                        title={hasBeenRomanized ? "Text has already been Romanized" : "Convert text to English characters (e.g., नमस्ते -> namaste)"}
                    >
                        {isTranslating ? (
                            <>
                                <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                                Converting...
                            </>
                        ) : 'Romanize'}
                    </button>
                )}
                <button onClick={() => handleDownload('srt')} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Export .srt</button>
                <button onClick={() => handleDownload('txt')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.txt</button>
                <button onClick={() => handleDownload('csv')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.csv</button>
                <button onClick={() => handleDownload('json')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.json</button>
                <button onClick={() => handleDownload('prtranscript')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.prtranscript</button>
                <button onClick={onRestart} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Start Over</button>
            </div>
        </div>

        {transliterationError && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                {transliterationError}
            </div>
        )}

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