import React from 'react';
import type { ExportSettings } from '../services/exportService';

interface SRTSettingsProps {
    settings: ExportSettings;
    onChange: (settings: ExportSettings) => void;
}

export const SRTSettings: React.FC<SRTSettingsProps> = ({ settings, onChange }) => {
    return (
        <div className="space-y-4">
            {/* Max Characters Per Line */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Max Chars/Line
                    </label>
                    <span className="text-sm text-neon-purple font-mono">{settings.maxCharsPerLine}</span>
                </div>
                <input
                    type="range"
                    min="20"
                    max="60"
                    step="1"
                    value={settings.maxCharsPerLine}
                    onChange={(e) => onChange({ ...settings, maxCharsPerLine: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                />
            </div>

            {/* Lines Per Block */}
            <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Lines Per Block
                </label>
                <div className="flex gap-3">
                    <button
                        onClick={() => onChange({ ...settings, linesPerBlock: 1 })}
                        className={`flex-1 py-2 px-4 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all
              ${settings.linesPerBlock === 1
                                ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                    >
                        Single
                    </button>
                    <button
                        onClick={() => onChange({ ...settings, linesPerBlock: 2 })}
                        className={`flex-1 py-2 px-4 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all
              ${settings.linesPerBlock === 2
                                ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                    >
                        Double
                    </button>
                </div>
            </div>

            {/* Min Duration */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Min Duration
                    </label>
                    <span className="text-sm text-neon-purple font-mono">{settings.minDuration.toFixed(1)}s</span>
                </div>
                <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    value={settings.minDuration}
                    onChange={(e) => onChange({ ...settings, minDuration: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                />
            </div>

            {/* Gap Between Blocks */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Gap (ms)
                    </label>
                    <span className="text-sm text-neon-purple font-mono">{settings.gapBetweenBlocks}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="500"
                    step="50"
                    value={settings.gapBetweenBlocks}
                    onChange={(e) => onChange({ ...settings, gapBetweenBlocks: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                />
            </div>

            {/* Clean Brackets Toggle */}
            <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Clean Brackets
                </label>
                <button
                    onClick={() => onChange({ ...settings, cleanBrackets: !settings.cleanBrackets })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${settings.cleanBrackets ? 'bg-neon-purple' : 'bg-slate-700'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${settings.cleanBrackets ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>
        </div>
    );
};
