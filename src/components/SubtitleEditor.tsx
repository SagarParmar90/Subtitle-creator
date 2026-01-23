import React, { useState } from 'react';
import type { SubtitleWord, ExportFormat } from '../types';
import type { ExportSettings } from '../services/exportService';
import { exportSubtitles, downloadFile } from '../services/exportService';
import { SRTSettings } from './SRTSettings';

interface SubtitleEditorProps {
    words: SubtitleWord[];
    onWordsChange: (words: SubtitleWord[]) => void;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ words, onWordsChange }) => {
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

    const handleExport = () => {
        try {
            const { content, filename, mimeType } = exportSubtitles(words, exportFormat, exportSettings);
            downloadFile(content, filename, mimeType);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Export failed');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto h-[calc(100vh-12rem)]">
            {/* Left Column: Player & Word Grid */}
            <div className="flex-grow flex flex-col gap-6 overflow-hidden">
                {/* Sticky Player Card */}
                <div className="glass-card p-6 border-white/5 neon-glow-blue sticky top-0 z-20">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-12 h-12 rounded-full bg-neon-blue flex items-center justify-center text-white hover:scale-105 transition-transform"
                                >
                                    {isPlaying ? (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>
                                <div>
                                    <div className="text-white font-mono text-lg">
                                        {new Date(currentTime * 1000).toISOString().substr(11, 8)}
                                    </div>
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                        Timeline Position
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                                    Slow-mo (0.5x)
                                </button>
                            </div>
                        </div>

                        {/* Custom Range Seeker */}
                        <div className="relative group">
                            <input
                                type="range"
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                                min="0"
                                max="100"
                                step="0.1"
                                value={currentTime}
                                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                            />
                            <div
                                className="absolute left-0 top-0 h-2 bg-neon-blue rounded-lg pointer-events-none neon-glow-blue"
                                style={{ width: `${(currentTime / 100) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Scrollable Word Grid */}
                <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                    {words.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="tracking-widest font-bold uppercase text-xs">No transcription data yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-1">
                            {words.map((word, i) => (
                                <div
                                    key={i}
                                    className={`glass-card p-3 border-white/5 hover:border-neon-purple/30 transition-all cursor-text group
                    ${(currentTime >= word.startTime && currentTime <= word.endTime) ? 'neon-glow-purple border-neon-purple/50 bg-neon-purple/10 scale-[1.02]' : ''}
                  `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-tighter">
                                            {word.startTime.toFixed(2)}s
                                        </span>
                                        <button className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={word.word}
                                        onChange={(e) => {
                                            const newWords = [...words];
                                            newWords[i] = { ...word, word: e.target.value };
                                            onWordsChange(newWords);
                                        }}
                                        className="bg-transparent text-white font-medium w-full focus:outline-none focus:text-neon-purple transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Tools & Settings */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="glass-card p-6 border-white/5 space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-neon-purple rounded-full animate-pulse " />
                        Export Settings
                    </h3>

                    <div className="space-y-4">
                        <label className="block space-y-2">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Format</span>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon-purple/50"
                            >
                                <option value="srt">SubRip (.srt)</option>
                                <option value="prtranscript">Premiere Pro (.prtranscript)</option>
                                <option value="csv">Data Table (.csv)</option>
                                <option value="json">JSON Metadata (.json)</option>
                                <option value="txt">Plain Text (.txt)</option>
                            </select>
                        </label>

                        {exportFormat === 'srt' && (
                            <SRTSettings settings={exportSettings} onChange={setExportSettings} />
                        )}

                        <button
                            onClick={handleExport}
                            disabled={words.length === 0}
                            className="w-full py-3 rounded-xl bg-neon-purple text-white font-bold text-sm tracking-widest uppercase neon-glow-purple hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Generate Export
                        </button>
                    </div>
                </div>

                <div className="glass-card p-6 border-white/5 space-y-6 flex-grow">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-neon-blue rounded-full animate-pulse " />
                        AI Actions
                    </h3>

                    <div className="space-y-3">
                        <button
                            onClick={async () => {
                                try {
                                    const { transliterateText } = await import('../services/geminiService');
                                    const romanized = await transliterateText(words);
                                    onWordsChange(romanized);
                                } catch (error) {
                                    alert(error instanceof Error ? error.message : 'Romanization failed');
                                }
                            }}
                            className="w-full py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-neon-blue/10 hover:border-neon-blue/50 hover:text-neon-blue transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.827-5.802" />
                            </svg>
                            Romanize Text
                        </button>
                        <button className="w-full py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-neon-purple/10 hover:border-neon-purple/50 hover:text-neon-purple transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find & Replace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
