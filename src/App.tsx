import React, { useState } from 'react';
import type { AppState, SubtitleWord } from './types';
import { LogoIcon } from './components/icons/LogoIcon';
import { FileUpload } from './components/FileUpload';
import { LanguageSelector } from './components/LanguageSelector';
import { SubtitleEditor } from './components/SubtitleEditor';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [file, setFile] = useState<File | null>(null);
  const [words, setWords] = useState<SubtitleWord[]>([
    { word: "Welcome", startTime: 1.0, endTime: 1.5 },
    { word: "to", startTime: 1.6, endTime: 1.8 },
    { word: "Subtitle", startTime: 1.9, endTime: 2.5 },
    { word: "Studio", startTime: 2.6, endTime: 3.2 },
    { word: "the", startTime: 3.3, endTime: 3.5 },
    { word: "future", startTime: 3.6, endTime: 4.2 },
    { word: "of", startTime: 4.3, endTime: 4.5 },
    { word: "content", startTime: 4.6, endTime: 5.2 },
    { word: "creation", startTime: 5.3, endTime: 6.0 },
  ]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setAppState('loading');

    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();

      if (fileExt === 'srt') {
        // Parse SRT file
        const text = await selectedFile.text();
        const { parseSRT } = await import('./services/srtService');
        const parsedWords = parseSRT(text);
        setWords(parsedWords);
        setAppState('editing');
      } else if (fileExt === 'mp3' || fileExt === 'wav') {
        // Transcribe audio
        const { transcribeAudio } = await import('./services/geminiService');
        const transcribedWords = await transcribeAudio(selectedFile, selectedLanguage);
        setWords(transcribedWords);
        setAppState('editing');
      } else {
        throw new Error('Unsupported file type. Please upload .mp3, .wav, or .srt files.');
      }
    } catch (error) {
      console.error("File processing error:", error);
      setAppState('error');
      alert(error instanceof Error ? error.message : 'Failed to process file');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAppState('idle')}>
            <div className="w-10 h-10 bg-neon-purple rounded-xl flex items-center justify-center neon-glow-purple">
              <LogoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Subtitle <span className="text-neon-purple">Studio</span>
              </h1>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                v1.0 AI Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-48">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onChange={setSelectedLanguage}
              />
            </div>
            {appState === 'editing' && (
              <button
                onClick={() => setAppState('idle')}
                className="px-4 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-bold uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-6 py-12">
        {appState === 'idle' && (
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
                Transcribe your content with <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">AI Precision.</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Generate word-level timestamps, romanize scripts, and export to industry-standard formats in seconds.
              </p>
            </div>

            <FileUpload onFileSelect={handleFileSelect} />

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
              {[
                { title: 'AI Transcription', desc: 'Word-level accuracy powered by Gemini 1.5 Pro.', color: 'purple' },
                { title: 'Romanization', desc: 'Auto-transliterate non-English scripts instantly.', color: 'blue' },
                { title: 'Karaoke Editor', desc: 'Sync audio with text in a beautiful grid interface.', color: 'purple' },
                { title: 'Export Ready', desc: 'SRT, CSV, JSON, and Premiere Pro formats.', color: 'blue' }
              ].map((feat, i) => (
                <div key={i} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group">
                  <div className={`w-10 h-10 rounded-lg bg-neon-${feat.color}/10 flex items-center justify-center text-neon-${feat.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feat.title}</h4>
                  <p className="text-sm text-slate-500">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {appState === 'loading' && (
          <div className="flex flex-col items-center justify-center h-64 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 bg-neon-purple/20 blur-xl animate-pulse"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-medium text-white">Analyzing Content...</p>
              <p className="text-slate-500 text-sm">Our AI engine is processing your {file?.name.split('.').pop()?.toUpperCase()} file.</p>
            </div>
          </div>
        )}

        {appState === 'error' && (
          <div className="flex flex-col items-center justify-center h-64 space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-medium text-white">Processing Failed</p>
              <p className="text-slate-500 text-sm max-w-md">Check the console for details or try uploading a different file.</p>
              <button
                onClick={() => setAppState('idle')}
                className="mt-4 px-6 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue hover:text-white transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {appState === 'editing' && (
          <SubtitleEditor words={words} onWordsChange={setWords} />
        )}
      </main>

      {/* Global Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-slate-600 text-xs font-medium uppercase tracking-[0.2em]">
          Powered by Google Gemini • RAPS x BLAST Protocol
        </p>
      </footer>
    </div>
  );
};

export default App;

