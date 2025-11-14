import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SubtitleWord, ExportFormat } from '../types';
import { transliterateText } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import SearchWidget from './SearchWidget';
import TextToolsWidget from './TextToolsWidget';
import SRTSettings from './SRTSettings';

interface SubtitleEditorProps {
  initialSubtitles: SubtitleWord[];
  onRestart: () => void;
  language: string;
  audioFile: File;
}

const formatTimestamp = (seconds: number, format: 'srt' | 'default'): string => {
  if (isNaN(seconds) || seconds < 0) {
    seconds = 0;
  }
  const date = new Date(0);
  date.setSeconds(seconds);
  const timeString = date.toISOString().substr(11, 12);
  if (format === 'srt') {
    return timeString.replace('.', ',');
  }
  return timeString.substr(0, 8); // hh:mm:ss
};

const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ initialSubtitles, onRestart, language, audioFile }) => {
  const [subtitles, setSubtitles] = useState<SubtitleWord[]>(initialSubtitles);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [hasBeenRomanized, setHasBeenRomanized] = useState<boolean>(false);
  const [transliterationError, setTransliterationError] = useState<string | null>(null);
  const [selectedWordForSearch, setSelectedWordForSearch] = useState<string>('');

  const [audioUrl, setAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const activeWordRef = useRef<HTMLInputElement>(null);

  // State for Find and Replace
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [findCaseSensitive, setFindCaseSensitive] = useState(false);
  const [lastReplacedIndex, setLastReplacedIndex] = useState(-1);
  
  // SRT settings state
  const [maxChars, setMaxChars] = useState(7);
  const [minDuration, setMinDuration] = useState(1.2);
  const [gapFrames, setGapFrames] = useState(0);
  const [lines, setLines] = useState<'single' | 'double'>('single');
  
  const foundIndices = useMemo(() => {
    if (!findTerm) return [];
    const indices: number[] = [];
    subtitles.forEach((subtitle, index) => {
      const source = findCaseSensitive ? subtitle.word : subtitle.word.toLowerCase();
      const term = findCaseSensitive ? findTerm : findTerm.toLowerCase();
      if (source.includes(term)) {
        indices.push(index);
      }
    });
    return indices;
  }, [subtitles, findTerm, findCaseSensitive]);


  useEffect(() => {
    setSubtitles(initialSubtitles);
  }, [initialSubtitles]);

  useEffect(() => {
    if (audioFile) {
        const url = URL.createObjectURL(audioFile);
        setAudioUrl(url);
        return () => URL.revokeObjectURL(url);
    }
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
        const currentIndex = subtitles.findIndex(
            word => audio.currentTime >= word.startTime && audio.currentTime <= word.endTime
        );
        setActiveWordIndex(currentIndex);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
    };
  }, [subtitles]);

  useEffect(() => {
    if (activeWordRef.current) {
        activeWordRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }
  }, [activeWordIndex]);
  
  // Reset find/replace cursor when find term changes
  useEffect(() => {
    setLastReplacedIndex(-1);
  }, [findTerm, findCaseSensitive]);

  const handleWordChange = (index: number, newWord: string) => {
    const updatedSubtitles = [...subtitles];
    updatedSubtitles[index].word = newWord;
    setSubtitles(updatedSubtitles);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
        if (isPlaying) audio.pause();
        else audio.play();
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
        audio.currentTime = Number(event.target.value);
        setCurrentTime(audio.currentTime);
    }
  };

  const handleTimestampClick = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
        audio.currentTime = time;
    }
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
      case 'srt': {
        const gapInSeconds = gapFrames / 30.0; // Assuming 30fps

        // 1. Group words into lines based on maxChars
        let srtLines: { text: string; startTime: number; endTime: number }[] = [];
        if (subtitles.length > 0) {
            let currentLine = {
                text: '',
                startTime: subtitles[0].startTime,
                endTime: 0,
            };

            for (let i = 0; i < subtitles.length; i++) {
                const wordData = subtitles[i];
                // Sanitize the word to remove any potential newlines from transcription
                const word = wordData.word.replace(/[\r\n]+/g, ' ').trim();
                if (!word) continue; // Skip empty words after sanitization

                const newText = currentLine.text === '' ? word : `${currentLine.text} ${word}`;

                if (newText.length > maxChars && currentLine.text !== '') {
                    // Finish the current line using the previous word's end time
                    currentLine.endTime = subtitles[i-1].endTime;
                    srtLines.push({ ...currentLine });

                    // Start a new line
                    currentLine = {
                        text: word,
                        startTime: wordData.startTime,
                        endTime: wordData.endTime,
                    };
                } else {
                    // Add to current line
                    currentLine.text = newText;
                    currentLine.endTime = wordData.endTime;
                }
            }
            // Push the last remaining line
            if (currentLine.text !== '') {
                srtLines.push({ ...currentLine });
            }
        }

        // 2. Combine lines if 'double' is selected
        let finalSrtBlocks: { text: string; startTime: number; endTime: number }[] = [];
        if (lines === 'single') {
            finalSrtBlocks = srtLines;
        } else { // 'double'
            for (let i = 0; i < srtLines.length; i += 2) {
                if (i + 1 < srtLines.length) {
                    const line1 = srtLines[i];
                    const line2 = srtLines[i + 1];
                    finalSrtBlocks.push({
                        text: `${line1.text}\n${line2.text}`,
                        startTime: line1.startTime,
                        endTime: line2.endTime,
                    });
                } else {
                    finalSrtBlocks.push(srtLines[i]); // Add the last odd line
                }
            }
        }

        // 3. Post-process to enforce min duration and gaps
        finalSrtBlocks.forEach((block, i) => {
            // Enforce minimum duration
            if (block.endTime - block.startTime < minDuration) {
                block.endTime = block.startTime + minDuration;
            }

            // Enforce gap with the next block
            if (i + 1 < finalSrtBlocks.length) {
                const nextBlock = finalSrtBlocks[i + 1];
                const requiredEndTime = nextBlock.startTime - gapInSeconds;
                if (block.endTime > requiredEndTime) {
                    block.endTime = requiredEndTime;
                }
                // Final check to prevent negative duration after adjustment
                if (block.endTime <= block.startTime) {
                    block.endTime = block.startTime + 0.05; // 50ms fallback
                }
            }
        });

        // 4. Format into SRT string
        content = finalSrtBlocks.map((block, index) => {
            return `${index + 1}\n${formatTimestamp(block.startTime, 'srt')} --> ${formatTimestamp(block.endTime, 'srt')}\n${block.text}`;
        }).join('\n\n');
        
        break;
      }
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
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <audio ref={audioRef} src={audioUrl} className="hidden" />
            <div className="flex items-center gap-4">
                <button
                    onClick={togglePlayPause}
                    className="p-2 rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                </button>
                <div className="flex-grow flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-300">{formatTimestamp(currentTime, 'default')}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.01"
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                    />
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-300">{formatTimestamp(duration, 'default')}</span>
                </div>
            </div>
        </div>

        <div className="mb-4">
             <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Subtitles</h2>
        </div>

        {transliterationError && (
            <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                {transliterationError}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 overflow-y-auto h-[60vh] pr-2 border-r-0 md:border-r md:pr-6 dark:border-gray-600">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center">
                {subtitles.map((subtitle, index) => {
                    const isFound = foundIndices.includes(index);
                    return (
                        <React.Fragment key={index}>
                            <div 
                                onClick={() => handleTimestampClick(subtitle.startTime)}
                                className="cursor-pointer text-right font-mono text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                title="Click to seek audio"
                            >
                                {formatTimestamp(subtitle.startTime, 'default')}
                            </div>
                            <input
                                ref={index === activeWordIndex ? activeWordRef : null}
                                type="text"
                                value={subtitle.word}
                                onChange={(e) => handleWordChange(index, e.target.value)}
                                onFocus={() => setSelectedWordForSearch(subtitle.word)}
                                spellCheck={true}
                                className={`w-full px-2 py-1 border rounded-md transition-all duration-200 focus:ring-primary-500 focus:border-primary-500 ${
                                    index === activeWordIndex
                                    ? 'bg-primary-100 dark:bg-primary-900/50 border-primary-500 text-gray-900 dark:text-white'
                                    : isFound
                                    ? 'bg-yellow-200 dark:bg-yellow-700/50 border-yellow-500 text-gray-900 dark:text-white'
                                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                                }`}
                            />
                        </React.Fragment>
                    )
                })}
                </div>
            </div>

            <div className="md:col-span-1 space-y-4">
                <SearchWidget initialSearchTerm={selectedWordForSearch} />
                <TextToolsWidget 
                    onFindTermChange={setFindTerm}
                    onReplaceTermChange={setReplaceTerm}
                    onCaseSensitiveChange={setFindCaseSensitive}
                    onReplace={() => {
                        if (!findTerm) return 0;
                        const nextIndex = subtitles.findIndex((sub, i) => i > lastReplacedIndex && foundIndices.includes(i));
                        if (nextIndex !== -1) {
                            const updatedSubtitles = [...subtitles];
                            const originalWord = updatedSubtitles[nextIndex].word;
                            const regex = new RegExp(findTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), findCaseSensitive ? 'g' : 'gi');
                            updatedSubtitles[nextIndex].word = originalWord.replace(regex, replaceTerm);
                            setSubtitles(updatedSubtitles);
                            setLastReplacedIndex(nextIndex);
                            return 1;
                        }
                        return 0; // No more occurrences found
                    }}
                    onReplaceAll={() => {
                         if (!findTerm) return 0;
                        let count = 0;
                        const regex = new RegExp(findTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), findCaseSensitive ? 'g' : 'gi');
                        const updatedSubtitles = subtitles.map(subtitle => {
                            if (foundIndices.includes(subtitles.indexOf(subtitle))) {
                                const newWord = subtitle.word.replace(regex, replaceTerm);
                                if (newWord !== subtitle.word) {
                                    count++;
                                }
                                return { ...subtitle, word: newWord };
                            }
                            return subtitle;
                        });
                        setSubtitles(updatedSubtitles);
                        return count;
                    }}
                    onCaseChange={(caseType) => {
                        const newSubtitles = subtitles.map(s => ({ ...s, word: caseType(s.word) }));
                        setSubtitles(newSubtitles);
                    }}
                />
                
                <SRTSettings
                    maxChars={maxChars}
                    setMaxChars={setMaxChars}
                    minDuration={minDuration}
                    setMinDuration={setMinDuration}
                    gapFrames={gapFrames}
                    setGapFrames={setGapFrames}
                    lines={lines}
                    setLines={setLines}
                />

                <div className="p-4 border dark:border-gray-600 rounded-lg space-y-4">
                    <div>
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Actions</h3>
                        <div className="space-y-2">
                            {shouldShowRomanizeButton && (
                                <button
                                    onClick={handleRomanize}
                                    disabled={isTranslating || hasBeenRomanized}
                                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
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
                            <button onClick={onRestart} className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-800">Start Over</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Export</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleDownload('srt')} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">.srt</button>
                            <button onClick={() => handleDownload('txt')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.txt</button>
                            <button onClick={() => handleDownload('csv')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.csv</button>
                            <button onClick={() => handleDownload('json')} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">.json</button>
                        </div>
                        <button onClick={() => handleDownload('prtranscript')} className="mt-2 w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Premiere Pro .prtranscript</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SubtitleEditor;