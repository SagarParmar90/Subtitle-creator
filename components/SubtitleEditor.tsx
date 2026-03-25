
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SubtitleWord, ExportFormat } from '../types';
import { transliterateText, translateToEnglish } from '../services/geminiService';
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
  audioFile: File | null;
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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
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
  const [maxChars, setMaxChars] = useState(32);
  const [minDuration, setMinDuration] = useState(1.2);
  const [gapFrames, setGapFrames] = useState(0);
  const [lines, setLines] = useState<'single' | 'double'>('double');
  const [wordsPerCaption, setWordsPerCaption] = useState(0); // 0 means use character limit
  const [removeBrackets, setRemoveBrackets] = useState(false);
  
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
    } else {
        setAudioUrl('');
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
  }, [subtitles, audioUrl]); 

  useEffect(() => {
    if (isPlaying && activeWordRef.current && activeWordIndex !== -1) {
        activeWordRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }
  }, [activeWordIndex, isPlaying]);
  
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
        const time = Number(event.target.value);
        audio.currentTime = time;
        setCurrentTime(time);
    }
  };

  const handleTimestampClick = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
        audio.currentTime = time;
        if (!isPlaying) audio.play();
    }
  };

  const handleRomanize = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const result = await transliterateText(subtitles);
      setSubtitles(result);
    } catch (err: any) {
      setProcessingError(`Failed to Romanize: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const result = await translateToEnglish(subtitles);
      setSubtitles(result);
    } catch (err: any) {
      setProcessingError(`Failed to Translate: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownload = (format: ExportFormat) => {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `subtitles.${format}`;

    let exportSubtitles = subtitles;
    if (removeBrackets) {
        exportSubtitles = subtitles.map(s => ({
            ...s,
            word: s.word.replace(/\[.*?\]/g, '').trim()
        })).filter(s => s.word !== '');
    }

    switch (format) {
      case 'srt': {
        const gapInSeconds = gapFrames / 30.0; 
        let srtLines: { text: string; startTime: number; endTime: number }[] = [];
        
        if (exportSubtitles.length > 0) {
            let currentLine = {
                text: '',
                startTime: exportSubtitles[0].startTime,
                endTime: 0,
                wordCount: 0
            };

            for (let i = 0; i < exportSubtitles.length; i++) {
                const wordData = exportSubtitles[i];
                const word = wordData.word.replace(/[\r\n]+/g, ' ').trim();
                if (!word) continue;

                const exceedsChars = currentLine.text !== '' && (currentLine.text.length + 1 + word.length) > maxChars;
                const exceedsWords = wordsPerCaption > 0 && currentLine.wordCount >= wordsPerCaption;

                if (exceedsChars || exceedsWords) {
                    currentLine.endTime = exportSubtitles[i-1].endTime;
                    srtLines.push({ ...currentLine });
                    currentLine = {
                        text: word,
                        startTime: wordData.startTime,
                        endTime: wordData.endTime,
                        wordCount: 1
                    };
                } else {
                    currentLine.text = currentLine.text === '' ? word : `${currentLine.text} ${word}`;
                    currentLine.endTime = wordData.endTime;
                    currentLine.wordCount++;
                }
            }
            if (currentLine.text !== '') {
                srtLines.push({ ...currentLine });
            }
        }

        let finalSrtBlocks: { text: string; startTime: number; endTime: number }[] = [];
        if (lines === 'single' || wordsPerCaption > 0) {
            finalSrtBlocks = srtLines;
        } else {
            for (let i = 0; i < srtLines.length; i += 2) {
                if (i + 1 < srtLines.length) {
                    finalSrtBlocks.push({
                        text: `${srtLines[i].text}\n${srtLines[i + 1].text}`,
                        startTime: srtLines[i].startTime,
                        endTime: srtLines[i + 1].endTime,
                    });
                } else {
                    finalSrtBlocks.push(srtLines[i]); 
                }
            }
        }

        finalSrtBlocks.forEach((block, i) => {
            if (block.endTime - block.startTime < minDuration) {
                block.endTime = block.startTime + minDuration;
            }
            if (i + 1 < finalSrtBlocks.length) {
                const nextBlock = finalSrtBlocks[i + 1];
                const requiredEndTime = nextBlock.startTime - gapInSeconds;
                if (block.endTime > requiredEndTime) {
                    block.endTime = Math.max(block.startTime + 0.01, requiredEndTime);
                }
            }
        });

        content = finalSrtBlocks.map((block, index) => {
            return `${index + 1}\n${formatTimestamp(block.startTime, 'srt')} --> ${formatTimestamp(block.endTime, 'srt')}\n${block.text}`;
        }).join('\n\n');
        break;
      }
      case 'txt':
        content = exportSubtitles.map(s => s.word).join(' ');
        break;
      case 'csv':
        content = 'word,startTime,endTime\n' + exportSubtitles.map(s => `"${s.word.replace(/"/g, '""')}",${s.startTime.toFixed(3)},${s.endTime.toFixed(3)}`).join('\n');
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(exportSubtitles, null, 2);
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isEnglish = language.startsWith('en-');

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col h-full relative">
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-6 py-4 rounded-t-lg">
            {audioFile ? (
            <div className="flex flex-col gap-2">
                <audio ref={audioRef} src={audioUrl} className="hidden" />
                <div className="flex items-center gap-4">
                    <button onClick={togglePlayPause} className="p-3 rounded-full text-white bg-primary-600 hover:bg-primary-700 shadow-sm">
                        {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5 pl-0.5" />}
                    </button>
                    <div className="flex-grow flex flex-col justify-center">
                        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full cursor-pointer">
                            <div className="absolute top-0 left-0 h-full bg-primary-500 rounded-full" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
                            <input type="range" min="0" max={duration || 0} step="0.01" value={currentTime} onChange={handleSeek} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-xs font-mono text-gray-500">
                            <span>{formatTimestamp(currentTime, 'default')}</span>
                            <span>{formatTimestamp(duration, 'default')}</span>
                        </div>
                    </div>
                </div>
            </div>
            ) : <div className="p-3 text-sm text-center text-yellow-800 bg-yellow-50 rounded-lg">Mode: Editor Only</div>}
        </div>

        <div className="flex-grow p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="md:col-span-2 overflow-y-auto h-[calc(100vh-250px)] pr-2">
                {processingError && <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 rounded-lg">{processingError}</div>}
                <div className="space-y-1">
                    {subtitles.map((subtitle, index) => (
                        <div key={index} className={`flex items-center gap-3 p-1.5 rounded-lg transition-all ${index === activeWordIndex ? 'bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-200' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                            <div onClick={() => handleTimestampClick(subtitle.startTime)} className={`w-16 text-right font-mono text-xs cursor-pointer ${index === activeWordIndex ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
                                {formatTimestamp(subtitle.startTime, 'default')}
                            </div>
                            <input ref={index === activeWordIndex ? activeWordRef : null} type="text" value={subtitle.word} onChange={(e) => handleWordChange(index, e.target.value)} onFocus={() => setSelectedWordForSearch(subtitle.word)} className="flex-grow px-3 py-1.5 rounded-md border text-sm bg-transparent outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:col-span-1 space-y-4 h-[calc(100vh-250px)] overflow-y-auto pb-10">
                <SearchWidget initialSearchTerm={selectedWordForSearch} />
                <TextToolsWidget 
                    onFindTermChange={setFindTerm} 
                    onReplaceTermChange={setReplaceTerm} 
                    onCaseSensitiveChange={setFindCaseSensitive} 
                    onReplace={() => {
                        const nextIdx = subtitles.findIndex((s, i) => i > lastReplacedIndex && foundIndices.includes(i));
                        if (nextIdx !== -1) {
                            const newSubs = [...subtitles];
                            newSubs[nextIdx].word = newSubs[nextIdx].word.replace(new RegExp(findTerm, findCaseSensitive ? 'g' : 'gi'), replaceTerm);
                            setSubtitles(newSubs); setLastReplacedIndex(nextIdx); return 1;
                        }
                        return 0;
                    }}
                    onReplaceAll={() => {
                        const regex = new RegExp(findTerm, findCaseSensitive ? 'g' : 'gi');
                        setSubtitles(subtitles.map(s => ({ ...s, word: s.word.replace(regex, replaceTerm) })));
                        return foundIndices.length;
                    }}
                    onCaseChange={(fn) => setSubtitles(subtitles.map(s => ({ ...s, word: fn(s.word) })))}
                />
                
                <SRTSettings 
                    maxChars={maxChars} setMaxChars={setMaxChars}
                    minDuration={minDuration} setMinDuration={setMinDuration}
                    gapFrames={gapFrames} setGapFrames={setGapFrames}
                    lines={lines} setLines={setLines}
                    wordsPerCaption={wordsPerCaption} setWordsPerCaption={setWordsPerCaption}
                    removeBrackets={removeBrackets} setRemoveBrackets={setRemoveBrackets}
                />

                <div className="p-4 border dark:border-gray-600 rounded-lg space-y-4 bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Actions</h3>
                    <div className="space-y-2">
                        {!isEnglish && (
                            <>
                                <button onClick={handleRomanize} disabled={isProcessing} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg disabled:opacity-50">
                                    {isProcessing ? <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /> : 'Romanize'}
                                </button>
                                <button onClick={handleTranslate} disabled={isProcessing} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg disabled:opacity-50">
                                    {isProcessing ? <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /> : 'Translate to English'}
                                </button>
                            </>
                        )}
                        <button onClick={onRestart} className="w-full px-4 py-2 text-sm text-white bg-gray-600 rounded-lg">Start Over</button>
                    </div>

                    <h3 className="font-semibold text-gray-800 dark:text-white">Export</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {['srt', 'txt', 'csv', 'json'].map(fmt => (
                            <button key={fmt} onClick={() => handleDownload(fmt as ExportFormat)} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">.{fmt}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SubtitleEditor;
