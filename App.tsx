import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import LanguageSelector from './components/LanguageSelector';
import SubtitleEditor from './components/SubtitleEditor';
import { transcribeAudio } from './services/geminiService';
import { AppState, SubtitleWord } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import SpinnerIcon from './components/icons/SpinnerIcon';
import MoonIcon from './components/icons/MoonIcon';
import SunIcon from './components/icons/SunIcon';

const DarkModeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
    );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].code);
  const [subtitles, setSubtitles] = useState<SubtitleWord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
    if (validTypes.includes(file.type)) {
      setAudioFile(file);
      setError(null);
    } else {
      setError(`Unsupported file type: ${file.type}. Please upload an MP3 or WAV file.`);
    }
  }, []);

  const handleGenerate = async () => {
    if (!audioFile) {
      setError('Please select an audio file first.');
      return;
    }
    if (!process.env.API_KEY) {
        setError("Missing API Key. Please ensure your API_KEY is configured correctly.");
        setAppState('error');
        return;
    }

    setAppState('loading');
    setError(null);

    try {
      const result = await transcribeAudio(audioFile, language);
      setSubtitles(result);
      setAppState('editing');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Transcription failed: ${errorMessage}`);
      setAppState('error');
    }
  };
  
  const handleRestart = () => {
      setAudioFile(null);
      setSubtitles([]);
      setError(null);
      setAppState('idle');
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-center items-center mb-4">
              <SpinnerIcon className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Generating Subtitles...</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">This may take a few moments. Please wait.</p>
          </div>
        );
      case 'editing':
        return <SubtitleEditor initialSubtitles={subtitles} onRestart={handleRestart}/>;
      case 'idle':
      case 'error':
      default:
        return (
          <div className="w-full p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Upload Audio File</h2>
            {/* FIX: The `disabled` prop is set to false because in this render branch, appState can never be 'loading'. */}
            <FileUpload onFileSelect={handleFileSelect} disabled={false} />
            {audioFile && (
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Selected file: <span className="font-normal">{audioFile.name}</span></p>
              </div>
            )}
            {error && <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">{error}</div>}
            {/* FIX: The `disabled` prop is set to false because in this render branch, appState can never be 'loading'. */}
            <LanguageSelector value={language} onChange={setLanguage} disabled={false} />
            <button
              onClick={handleGenerate}
              // FIX: Removed redundant `appState === 'loading'` check which is always false in this branch.
              disabled={!audioFile}
              className="w-full px-5 py-3 text-base font-medium text-center text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 disabled:bg-primary-300 disabled:cursor-not-allowed dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 dark:disabled:bg-primary-800"
            >
              Generate Subtitles
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                Gemini <span className="text-primary-600 dark:text-primary-500">Subtitle Studio</span>
            </h1>
            <DarkModeToggle />
        </header>
        <main className="max-w-4xl mx-auto">
          {renderContent()}
        </main>
        <footer className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
            <p>Powered by Google Gemini. Built with React & Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
