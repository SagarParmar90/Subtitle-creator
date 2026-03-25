
import React from 'react';
import QuestionIcon from './icons/QuestionIcon';

const Tooltip = ({ text, children }: { text: string; children?: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute left-0 bottom-full mb-2 w-48 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 dark:bg-gray-200 dark:text-gray-900">
      {text}
    </div>
  </div>
);

interface SRTSettingsProps {
  maxChars: number;
  setMaxChars: (value: number) => void;
  minDuration: number;
  setMinDuration: (value: number) => void;
  gapFrames: number;
  setGapFrames: (value: number) => void;
  lines: 'single' | 'double';
  setLines: (value: 'single' | 'double') => void;
  wordsPerCaption: number;
  setWordsPerCaption: (value: number) => void;
  removeBrackets: boolean;
  setRemoveBrackets: (value: boolean) => void;
}

const SRTSettings: React.FC<SRTSettingsProps> = ({
  maxChars,
  setMaxChars,
  minDuration,
  setMinDuration,
  gapFrames,
  setGapFrames,
  lines,
  setLines,
  wordsPerCaption,
  setWordsPerCaption,
  removeBrackets,
  setRemoveBrackets
}) => {
  return (
    <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-4">
      <h3 className="font-semibold text-gray-800 dark:text-white">SRT Export Settings</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <Tooltip text="The maximum number of characters allowed on a single subtitle line. Ignored if Words Per Caption is set.">
             <label htmlFor="max-chars" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span>Max chars per line <QuestionIcon /></span>
             </label>
          </Tooltip>
          <span className="text-gray-600 dark:text-gray-400">{maxChars}</span>
        </div>
        <input
          id="max-chars"
          type="range"
          min="5"
          max="100"
          value={maxChars}
          onChange={(e) => setMaxChars(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <Tooltip text="Force subtitles to be exactly X words long. Great for social media word-to-word style. 0 means disabled.">
             <label htmlFor="words-per-caption" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span>Words per caption <QuestionIcon /></span>
             </label>
          </Tooltip>
          <span className="text-gray-600 dark:text-gray-400">{wordsPerCaption === 0 ? 'Disabled' : wordsPerCaption}</span>
        </div>
        <input
          id="words-per-caption"
          type="range"
          min="0"
          max="10"
          value={wordsPerCaption}
          onChange={(e) => setWordsPerCaption(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
           <Tooltip text="The shortest amount of time a subtitle line will be displayed on screen.">
              <label htmlFor="min-duration" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span>Minimum duration (s) <QuestionIcon /></span>
              </label>
            </Tooltip>
          <span className="text-gray-600 dark:text-gray-400">{minDuration.toFixed(1)}</span>
        </div>
        <input
          id="min-duration"
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={minDuration}
          onChange={(e) => setMinDuration(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
        />
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
           <Tooltip text="The minimum gap (in frames) between captions. (Assumes 30fps).">
              <label htmlFor="gap-frames" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span>Gap (frames) <QuestionIcon /></span>
              </label>
            </Tooltip>
          <span className="text-gray-600 dark:text-gray-400">{gapFrames}</span>
        </div>
        <input
          id="gap-frames"
          type="range"
          min="0"
          max="15"
          value={gapFrames}
          onChange={(e) => setGapFrames(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lines</label>
        <div className="flex items-center gap-x-6 mt-2">
            <div className="flex items-center">
                <input id="single-line" type="radio" checked={lines === 'single'} onChange={() => setLines('single')} className="h-4 w-4 text-primary-600" />
                <label htmlFor="single-line" className="ml-2 text-sm dark:text-gray-300">Single</label>
            </div>
             <div className="flex items-center">
                <input id="double-line" type="radio" checked={lines === 'double'} onChange={() => setLines('double')} className="h-4 w-4 text-primary-600" />
                <label htmlFor="double-line" className="ml-2 text-sm dark:text-gray-300">Double</label>
            </div>
        </div>
      </div>

      <div className="flex items-center pt-2">
        <input id="remove-brackets" type="checkbox" checked={removeBrackets} onChange={(e) => setRemoveBrackets(e.target.checked)} className="w-4 h-4 text-primary-600" />
        <Tooltip text="Removes text inside square brackets.">
            <label htmlFor="remove-brackets" className="ml-2 text-sm dark:text-gray-300 flex items-center cursor-pointer">
                <span>Remove [cite] text <QuestionIcon /></span>
            </label>
        </Tooltip>
      </div>
    </div>
  );
};

export default SRTSettings;
