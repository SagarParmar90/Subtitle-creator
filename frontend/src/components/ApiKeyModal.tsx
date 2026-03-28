import React, { useState } from 'react';
import { Key, ExternalLink, X, CheckCircle } from 'lucide-react';
import { GlassPanel, GlassPill } from './GlassPanel';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
    error?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, error }) => {
    const [apiKey, setApiKey] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onSave(apiKey.trim());
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            data-testid="api-key-modal"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />
            
            {/* Modal */}
            <GlassPanel 
                className="relative w-full max-w-md !rounded-[28px] p-0 overflow-hidden animate-fade-in-up"
                tiltIntensity={3}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2D55]/20 to-[#FF2D55]/5 flex items-center justify-center">
                            <Key className="w-5 h-5 text-[#FF2D55]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">API Quota Exceeded</h2>
                            <p className="text-xs text-white/40">Enter your own API key to continue</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white"
                        data-testid="close-modal-button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <p className="text-white/60 text-sm leading-relaxed">
                        The free tier quota has been exhausted. To continue using AI features, 
                        please enter your own Gemini API key.
                    </p>

                    {error && (
                        <div className="p-4 bg-[#FF2D55]/10 border border-[#FF2D55]/20 rounded-xl text-[#FF2D55] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                                Your Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="glass-input font-mono"
                                autoFocus
                                data-testid="api-key-input"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40">Don't have a key?</span>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[#007AFF] hover:text-[#5AC8FA] transition-colors font-medium"
                            >
                                Get from Google AI Studio
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={!apiKey.trim()}
                            className={`
                                w-full py-4 rounded-2xl font-bold text-sm tracking-wide
                                flex items-center justify-center gap-2
                                transition-all duration-200
                                ${!apiKey.trim() 
                                    ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] text-white shadow-lg shadow-[#007AFF]/25 hover:scale-[1.02] active:scale-[0.98]'
                                }
                            `}
                            data-testid="save-api-key-button"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Save & Retry
                        </button>
                    </form>
                </div>
            </GlassPanel>
        </div>
    );
};
