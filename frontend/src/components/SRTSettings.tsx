import React from 'react';
import type { ExportSettings } from '../services/exportService';

interface SRTSettingsProps {
    settings: ExportSettings;
    onChange: (settings: ExportSettings) => void;
}

export const SRTSettings: React.FC<SRTSettingsProps> = ({ settings, onChange }) => {
    const updateSetting = <K extends keyof ExportSettings>(
        key: K,
        value: ExportSettings[K]
    ) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="space-y-4 pt-2 border-t border-white/5">
            {/* Max Characters Per Line */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                        Chars/Line
                    </span>
                    <span className="text-xs text-white/60 font-mono bg-white/5 px-2 py-1 rounded-lg">
                        {settings.maxCharsPerLine}
                    </span>
                </div>
                <input
                    type="range"
                    min="20"
                    max="60"
                    value={settings.maxCharsPerLine}
                    onChange={(e) => updateSetting('maxCharsPerLine', parseInt(e.target.value))}
                    className="w-full"
                    data-testid="chars-per-line-slider"
                />
            </div>

            {/* Lines Per Block */}
            <div className="space-y-2">
                <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                    Lines Per Block
                </span>
                <div className="flex gap-2">
                    {[1, 2].map((num) => (
                        <button
                            key={num}
                            onClick={() => updateSetting('linesPerBlock', num as 1 | 2)}
                            className={`
                                flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                                ${settings.linesPerBlock === num
                                    ? 'bg-[#007AFF]/20 border border-[#007AFF]/40 text-[#007AFF]'
                                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                                }
                            `}
                            data-testid={`lines-per-block-${num}`}
                        >
                            {num} Line{num > 1 ? 's' : ''}
                        </button>
                    ))}
                </div>
            </div>

            {/* Min Duration */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                        Min Duration
                    </span>
                    <span className="text-xs text-white/60 font-mono bg-white/5 px-2 py-1 rounded-lg">
                        {settings.minDuration}s
                    </span>
                </div>
                <input
                    type="range"
                    min="0.3"
                    max="2"
                    step="0.1"
                    value={settings.minDuration}
                    onChange={(e) => updateSetting('minDuration', parseFloat(e.target.value))}
                    className="w-full"
                    data-testid="min-duration-slider"
                />
            </div>

            {/* Gap Between Blocks */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                        Block Gap
                    </span>
                    <span className="text-xs text-white/60 font-mono bg-white/5 px-2 py-1 rounded-lg">
                        {settings.gapBetweenBlocks}ms
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="500"
                    step="50"
                    value={settings.gapBetweenBlocks}
                    onChange={(e) => updateSetting('gapBetweenBlocks', parseInt(e.target.value))}
                    className="w-full"
                    data-testid="gap-slider"
                />
            </div>

            {/* Clean Brackets Toggle */}
            <div className="flex items-center justify-between py-2">
                <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                    Remove [Brackets]
                </span>
                <button
                    onClick={() => updateSetting('cleanBrackets', !settings.cleanBrackets)}
                    className={`
                        relative w-12 h-7 rounded-full transition-all duration-200
                        ${settings.cleanBrackets 
                            ? 'bg-[#007AFF]' 
                            : 'bg-white/10'
                        }
                    `}
                    data-testid="clean-brackets-toggle"
                >
                    <div 
                        className={`
                            absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-200
                            ${settings.cleanBrackets ? 'left-6' : 'left-1'}
                        `}
                    />
                </button>
            </div>
        </div>
    );
};
