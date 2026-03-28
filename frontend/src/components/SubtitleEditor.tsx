import React, { useState, useRef, useCallback } from 'react';
import type { SubtitleWord, ExportFormat } from '../types';
import type { ExportSettings } from '../services/exportService';
import { exportSubtitles, downloadFile } from '../services/exportService';
import { SRTSettings } from './SRTSettings';
import { GlassPanel, GlassPill, GlassCard } from './GlassPanel';
import { 
    Play, Pause, Download, Languages, Search, Clock, 
    ChevronDown, Trash2, Edit3, Wand2
} from 'lucide-react';

interface SubtitleEditorProps {
    words: SubtitleWord[];
    onWordsChange: (words: SubtitleWord[]) => void;
    userApiKey?: string;
    onQuotaExceeded: () => void;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ 
    words, 
    onWordsChange, 
    userApiKey, 
    onQuotaExceeded 
}) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [exportFormat, setExportFormat] = useState<ExportFormat>('srt');
    const [exportSettings, setExportSettings] = useState<ExportSettings>({
        maxCharsPerLine: 32,
        linesPerBlock: 2,
        minDuration: 0.5,
        gapBetweenBlocks: 100,
        cleanBrackets: false
    });
    const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
    const [isRomanizing, setIsRomanizing] = useState(false);

    const maxTime = words.length > 0 ? Math.max(...words.map(w => w.endTime)) : 100;

    const handleExport = () => {
        try {
            const { content, filename, mimeType } = exportSubtitles(words, exportFormat, exportSettings);
            downloadFile(content, filename, mimeType);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Export failed');
        }
    };

    const handleRomanize = async () => {
        setIsRomanizing(true);
        try {
            const { transliterateText } = await import('../services/geminiService');
            const romanized = await transliterateText(words, 'English', userApiKey);
            onWordsChange(romanized);
        } catch (error: any) {
            if (error.message === 'QUOTA_EXCEEDED') {
                onQuotaExceeded();
            } else {
                alert(error instanceof Error ? error.message : 'Romanization failed');
            }
        } finally {
            setIsRomanizing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto h-[calc(100vh-14rem)] animate-fade-in-up">
            {/* Left Column: Player & Word Grid */}
            <div className="flex-grow flex flex-col gap-5 overflow-hidden">
                {/* Player Control Panel */}
                <GlassPanel className="!rounded-[24px] p-5" tiltIntensity={3}>
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                {/* Play/Pause Button */}
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`
                                        w-14 h-14 rounded-full flex items-center justify-center
                                        transition-all duration-200
                                        ${isPlaying 
                                            ? 'bg-white/20' 
                                            : 'bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] shadow-lg shadow-[#007AFF]/30'
                                        }
                                        hover:scale-105 active:scale-95
                                    `}
                                    data-testid="play-pause-button"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 text-white" />
                                    ) : (
                                        <Play className="w-6 h-6 text-white ml-1" />
                                    )}
                                </button>
                                
                                {/* Time Display */}
                                <div className="glass-card-sm px-5 py-3 !rounded-2xl">
                                    <div className="text-white font-mono text-xl tracking-wider">
                                        {formatTime(currentTime)}
                                    </div>
                                    <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">
                                        Timeline
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <GlassPill 
                                    variant="default" 
                                    size="sm"
                                    data-testid="slow-mo-button"
                                >
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        0.5x
                                    </span>
                                </GlassPill>
                            </div>
                        </div>

                        {/* Timeline Slider */}
                        <div className="relative group px-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#BF5AF2]/20 via-[#007AFF]/20 to-[#5AC8FA]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <input
                                type="range"
                                className="w-full h-2 rounded-full appearance-none cursor-pointer relative z-10"
                                min="0"
                                max={maxTime}
                                step="0.01"
                                value={currentTime}
                                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                                data-testid="timeline-slider"
                            />
                            <div
                                className="absolute left-1 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-[#BF5AF2] to-[#007AFF] rounded-full pointer-events-none z-0"
                                style={{ width: `calc(${(currentTime / maxTime) * 100}% - 8px)` }}
                            />
                        </div>
                    </div>
                </GlassPanel>

                {/* Word Grid */}
                <div className="flex-grow overflow-y-auto pr-2">
                    {words.length === 0 ? (
                        <GlassPanel className="h-full flex flex-col items-center justify-center !rounded-[24px]">
                            <div className="text-center space-y-4 opacity-50">
                                <Edit3 className="w-16 h-16 text-white/30 mx-auto" />
                                <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
                                    No transcription data yet
                                </p>
                            </div>
                        </GlassPanel>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-1">
                            {words.map((word, i) => {
                                const isActive = currentTime >= word.startTime && currentTime <= word.endTime;
                                return (
                                    <WordCard
                                        key={i}
                                        word={word}
                                        index={i}
                                        isActive={isActive}
                                        onChange={(newWord) => {
                                            const newWords = [...words];
                                            newWords[i] = { ...word, word: newWord };
                                            onWordsChange(newWords);
                                        }}
                                        onDelete={() => {
                                            const newWords = words.filter((_, idx) => idx !== i);
                                            onWordsChange(newWords);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Tools & Settings */}
            <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
                {/* Export Panel */}
                <GlassPanel className="!rounded-[24px] p-5" tiltIntensity={4}>
                    <div className="space-y-5">
                        <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsExportPanelOpen(!isExportPanelOpen)}
                        >
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#BF5AF2] rounded-full" />
                                Export Settings
                            </h3>
                            <ChevronDown 
                                className={`w-4 h-4 text-white/50 transition-transform ${isExportPanelOpen ? 'rotate-180' : ''}`} 
                            />
                        </div>

                        {/* Format Selector */}
                        <div className="space-y-2">
                            <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Format</span>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                                className="glass-select w-full"
                                data-testid="export-format-select"
                            >
                                <option value="srt">SubRip (.srt)</option>
                                <option value="prtranscript">Premiere Pro (.prtranscript)</option>
                                <option value="csv">Data Table (.csv)</option>
                                <option value="json">JSON Metadata (.json)</option>
                                <option value="txt">Plain Text (.txt)</option>
                            </select>
                        </div>

                        {/* SRT Settings */}
                        {exportFormat === 'srt' && isExportPanelOpen && (
                            <SRTSettings settings={exportSettings} onChange={setExportSettings} />
                        )}

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={words.length === 0}
                            className={`
                                w-full py-4 rounded-2xl font-bold text-sm tracking-wider uppercase
                                flex items-center justify-center gap-2
                                transition-all duration-200
                                ${words.length === 0 
                                    ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-[#BF5AF2] to-[#007AFF] text-white shadow-lg shadow-[#BF5AF2]/25 hover:scale-[1.02] active:scale-[0.98]'
                                }
                            `}
                            data-testid="export-button"
                        >
                            <Download className="w-4 h-4" />
                            Generate Export
                        </button>
                    </div>
                </GlassPanel>

                {/* AI Actions Panel */}
                <GlassPanel className="!rounded-[24px] p-5 flex-grow" tiltIntensity={4}>
                    <div className="space-y-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full" />
                            AI Actions
                        </h3>

                        <div className="space-y-3">
                            <button
                                onClick={handleRomanize}
                                disabled={isRomanizing || words.length === 0}
                                className={`
                                    w-full py-3 px-4 rounded-xl font-semibold text-sm
                                    flex items-center gap-3 transition-all duration-200
                                    ${isRomanizing 
                                        ? 'bg-[#007AFF]/20 border-[#007AFF]/30 text-[#007AFF]' 
                                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-[#007AFF]/10 hover:border-[#007AFF]/30 hover:text-[#007AFF]'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                data-testid="romanize-button"
                            >
                                {isRomanizing ? (
                                    <div className="w-4 h-4 border-2 border-[#007AFF]/30 border-t-[#007AFF] rounded-full animate-spin" />
                                ) : (
                                    <Languages className="w-4 h-4" />
                                )}
                                {isRomanizing ? 'Romanizing...' : 'Romanize Text'}
                            </button>

                            <button
                                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-[#BF5AF2]/10 hover:border-[#BF5AF2]/30 hover:text-[#BF5AF2] transition-all duration-200 font-semibold text-sm flex items-center gap-3"
                                data-testid="find-replace-button"
                            >
                                <Search className="w-4 h-4" />
                                Find & Replace
                            </button>

                            <button
                                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-[#5AC8FA]/10 hover:border-[#5AC8FA]/30 hover:text-[#5AC8FA] transition-all duration-200 font-semibold text-sm flex items-center gap-3"
                                data-testid="ai-enhance-button"
                            >
                                <Wand2 className="w-4 h-4" />
                                AI Enhance
                            </button>
                        </div>
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
};

// Word Card Component
interface WordCardProps {
    word: SubtitleWord;
    index: number;
    isActive: boolean;
    onChange: (newWord: string) => void;
    onDelete: () => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, index, isActive, onChange, onDelete }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [glowPos, setGlowPos] = useState({ x: '50%', y: '50%' });
    const [transform, setTransform] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -6;
        const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 6;
        
        setGlowPos({ x: `${x}%`, y: `${y}%` });
        setTransform(`perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setTransform('');
        setGlowPos({ x: '50%', y: '50%' });
    }, []);

    return (
        <div
            ref={ref}
            className={`
                glass-card-sm p-4 cursor-text group relative overflow-hidden
                ${isActive 
                    ? 'border-[#007AFF]/50 bg-[#007AFF]/10 shadow-[0_0_30px_rgba(0,122,255,0.2)]' 
                    : ''
                }
            `}
            style={{
                transform: isHovered ? transform : '',
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out, box-shadow 0.2s ease'
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            data-testid={`word-card-${index}`}
        >
            {/* Cursor glow */}
            <div 
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{
                    background: `radial-gradient(150px circle at ${glowPos.x} ${glowPos.y}, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            />

            <div className="flex justify-between items-start mb-3 relative">
                <span className="text-[10px] font-bold text-white/30 uppercase font-mono tracking-tight">
                    {word.startTime.toFixed(2)}s
                </span>
                <button 
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-[#FF2D55] transition-all p-1 -m-1 rounded-lg hover:bg-[#FF2D55]/10"
                    data-testid={`delete-word-${index}`}
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
            <input
                type="text"
                value={word.word}
                onChange={(e) => onChange(e.target.value)}
                className="bg-transparent text-white font-medium w-full focus:outline-none focus:text-[#007AFF] transition-colors text-base"
                data-testid={`word-input-${index}`}
            />
        </div>
    );
};
