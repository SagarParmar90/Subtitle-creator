import React, { useState, useEffect } from 'react';
import type { AppState, SubtitleWord } from './types';
import { LogoIcon } from './components/icons/LogoIcon';
import { FileUpload } from './components/FileUpload';
import { LanguageSelector } from './components/LanguageSelector';
import { SubtitleEditor } from './components/SubtitleEditor';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GlassPanel, GlassPill } from './components/GlassPanel';
import { useCursorPosition } from './hooks/useCursorPosition';
import { Mic, FileText, Sparkles, Download, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [file, setFile] = useState<File | null>(null);
  const [words, setWords] = useState<SubtitleWord[]>([
    { word: "Welcome", startTime: 1.0, endTime: 1.5 },
    { word: "to", startTime: 1.6, endTime: 1.8 },
    { word: "Subtitle", startTime: 1.9, endTime: 2.5 },
    { word: "Studio", startTime: 2.6, endTime: 3.2 },
  ]);

  // API Key State
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Cursor tracking for parallax effects
  const cursorPos = useCursorPosition();

  useEffect(() => {
    const storedKey = localStorage.getItem('user_gemini_api_key');
    if (storedKey) setUserApiKey(storedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('user_gemini_api_key', key);
    setIsApiKeyModalOpen(false);

    if (pendingFile) {
      handleFileSelect(pendingFile, key);
      setPendingFile(null);
    }
  };

  const handleFileSelect = async (selectedFile: File, apiKeyOverride?: string) => {
    setFile(selectedFile);
    setAppState('loading');

    const currentApiKey = apiKeyOverride || userApiKey;

    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();

      if (fileExt === 'srt') {
        const text = await selectedFile.text();
        const { parseSRT } = await import('./services/srtService');
        const parsedWords = parseSRT(text);
        setWords(parsedWords);
        setAppState('editing');
      } else if (fileExt === 'mp3' || fileExt === 'wav') {
        const { transcribeAudio } = await import('./services/geminiService');
        const transcribedWords = await transcribeAudio(selectedFile, selectedLanguage, currentApiKey);
        setWords(transcribedWords);
        setAppState('editing');
      } else {
        throw new Error('Unsupported file type. Please upload .mp3, .wav, or .srt files.');
      }
    } catch (error: any) {
      console.error("File processing error:", error);

      if (error.message === 'QUOTA_EXCEEDED') {
        setPendingFile(selectedFile);
        setIsApiKeyModalOpen(true);
        setAppState('idle');
        return;
      }

      setAppState('error');
      alert(error instanceof Error ? error.message : 'Failed to process file');
    }
  };

  // Calculate parallax offsets
  const parallaxSlow = {
    transform: `translate(${cursorPos.normalizedX * 5}px, ${cursorPos.normalizedY * 5}px)`
  };
  const parallaxMedium = {
    transform: `translate(${cursorPos.normalizedX * 10}px, ${cursorPos.normalizedY * 10}px)`
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* iOS 26 Gradient Mesh Background */}
      <div className="ios-background" />

      {/* Floating background orbs with parallax */}
      <div 
        className="fixed top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-br from-[#BF5AF2]/20 to-transparent blur-3xl pointer-events-none parallax-slow"
        style={parallaxSlow}
      />
      <div 
        className="fixed bottom-40 right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#007AFF]/15 to-transparent blur-3xl pointer-events-none parallax-medium"
        style={parallaxMedium}
      />
      <div 
        className="fixed top-1/2 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-[#FF2D55]/10 to-transparent blur-3xl pointer-events-none"
        style={{
          transform: `translate(${cursorPos.normalizedX * -8}px, ${cursorPos.normalizedY * -8}px)`
        }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <GlassPanel className="max-w-7xl mx-auto !rounded-2xl" tiltIntensity={3}>
          <div className="flex items-center justify-between px-5 py-3">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setAppState('idle')}
              data-testid="logo-home"
            >
              <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#BF5AF2] to-[#007AFF] flex items-center justify-center shadow-lg shadow-[#BF5AF2]/25 group-hover:scale-105 transition-transform">
                <LogoIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Subtitle <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF5AF2] to-[#5AC8FA]">Studio</span>
                </h1>
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-semibold">
                  iOS 26 Edition
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-44">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onChange={setSelectedLanguage}
                />
              </div>
              {appState === 'editing' && (
                <GlassPill
                  onClick={() => setAppState('idle')}
                  variant="default"
                  size="sm"
                  data-testid="reset-button"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </span>
                </GlassPill>
              )}
            </div>
          </div>
        </GlassPanel>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-6 py-10">
        {appState === 'idle' && (
          <div className="space-y-16 animate-fade-in-up">
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 text-[#BF5AF2]" />
                Powered by Gemini AI
              </div>
              
              <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Transcribe with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF5AF2] via-[#007AFF] to-[#5AC8FA]">
                  AI Precision
                </span>
              </h2>
              
              <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                Generate word-level timestamps, romanize scripts, and export to industry-standard formats in seconds.
              </p>
            </div>

            {/* File Upload */}
            <FileUpload onFileSelect={handleFileSelect} />

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-20 stagger-children">
              {[
                { 
                  icon: Mic,
                  title: 'AI Transcription', 
                  desc: 'Word-level accuracy powered by Gemini.', 
                  color: '#BF5AF2',
                  gradient: 'from-[#BF5AF2]/20 to-[#BF5AF2]/5'
                },
                { 
                  icon: FileText,
                  title: 'Romanization', 
                  desc: 'Auto-transliterate non-English scripts.', 
                  color: '#007AFF',
                  gradient: 'from-[#007AFF]/20 to-[#007AFF]/5'
                },
                { 
                  icon: Sparkles,
                  title: 'Word Editor', 
                  desc: 'Sync audio with text in a grid interface.', 
                  color: '#FF2D55',
                  gradient: 'from-[#FF2D55]/20 to-[#FF2D55]/5'
                },
                { 
                  icon: Download,
                  title: 'Export Ready', 
                  desc: 'SRT, CSV, JSON, and Premiere Pro.', 
                  color: '#5AC8FA',
                  gradient: 'from-[#5AC8FA]/20 to-[#5AC8FA]/5'
                }
              ].map((feat, i) => (
                <GlassPanel 
                  key={i} 
                  className="!rounded-[24px] p-6 group"
                  tiltIntensity={8}
                  data-testid={`feature-card-${i}`}
                >
                  <div 
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    style={{ color: feat.color }}
                  >
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-white text-lg mb-2">{feat.title}</h4>
                  <p className="text-sm text-white/40 leading-relaxed">{feat.desc}</p>
                </GlassPanel>
              ))}
            </div>
          </div>
        )}

        {appState === 'loading' && (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-8 animate-fade-in-up">
            <GlassPanel className="p-12 !rounded-[32px]" tiltIntensity={4}>
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="glass-spinner" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#BF5AF2] to-[#007AFF] blur-xl opacity-30 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold text-white">Analyzing Content...</p>
                  <p className="text-white/40 text-sm">
                    Processing your {file?.name.split('.').pop()?.toUpperCase()} file with AI
                  </p>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {appState === 'error' && (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-fade-in-up">
            <GlassPanel className="p-10 !rounded-[32px] max-w-md w-full" tiltIntensity={4}>
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FF2D55]/10 border border-[#FF2D55]/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#FF2D55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-white">Processing Failed</p>
                  <p className="text-white/40 text-sm">
                    Check the console for details or try uploading a different file.
                  </p>
                </div>
                <GlassPill
                  onClick={() => setAppState('idle')}
                  variant="blue"
                  size="md"
                  data-testid="try-again-button"
                >
                  Try Again
                </GlassPill>
              </div>
            </GlassPanel>
          </div>
        )}

        {appState === 'editing' && (
          <SubtitleEditor
            words={words}
            onWordsChange={setWords}
            userApiKey={userApiKey}
            onQuotaExceeded={() => setIsApiKeyModalOpen(true)}
          />
        )}
      </main>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
      />

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <p className="text-white/30 text-xs font-medium tracking-wide">
          Crafted with{' '}
          <span className="text-[#FF2D55]">♥</span>
          {' '}by{' '}
          <a
            href="https://www.instagram.com/sagar.parmar.x90/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-[#BF5AF2] transition-colors"
          >
            Sagar P
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
