import React from 'react';
import QuestionIcon from './icons/QuestionIcon';

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
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
}) => {
  return (
    <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-4">
      <h3 className="font-semibold text-gray-800 dark:text-white">SRT Export Settings</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <Tooltip text="The maximum number of characters allowed on a single subtitle line.">
             <label htmlFor="max-chars" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                {/* FIX: Grouped text and icon within a single span to resolve a potential JSX parsing issue. */}
                <span>Maximum length in characters <QuestionIcon /></span>
             </label>
          </Tooltip>
          <span className="text-gray-600 dark:text-gray-400">{maxChars}</span>
        </div>
        <input
          id="max-chars"
          type="range"
          min="5"
          max="100"
          step="1"
          value={maxChars}
          onChange={(e) => setMaxChars(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
           <Tooltip text="The shortest amount of time a subtitle line will be displayed on screen.">
              <label htmlFor="min-duration" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                {/* FIX: Grouped text and icon within a single span to resolve a potential JSX parsing issue. */}
                <span>Minimum duration in seconds <QuestionIcon /></span>
              </label>
            </Tooltip>
          <span className="text-gray-600 dark:text-gray-400">{minDuration.toFixed(1)}</span>
        </div>
        <input
          id="min-duration"
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={minDuration}
          onChange={(e) => setMinDuration(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
        />
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
           <Tooltip text="The minimum gap (in frames) between one subtitle ending and the next one starting. Assumes 30fps.">
              <label htmlFor="gap-frames" className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                {/* FIX: Grouped text and icon within a single span to resolve a potential JSX parsing issue. */}
                <span>Gap between captions (frames) <QuestionIcon /></span>
              </label>
            </Tooltip>
          <span className="text-gray-600 dark:text-gray-400">{gapFrames}</span>
        </div>
        <input
          id="gap-frames"
          type="range"
          min="0"
          max="30"
          step="1"
          value={gapFrames}
          onChange={(e) => setGapFrames(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lines</label>
        <div className="flex items-center gap-x-6 mt-2">
            <div className="flex items-center">
                <input
                    id="single-line"
                    name="lines"
                    type="radio"
                    value="single"
                    checked={lines === 'single'}
                    onChange={() => setLines('single')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor="single-line" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Single
                </label>
            </div>
             <div className="flex items-center">
                <input
                    id="double-line"
                    name="lines"
                    type="radio"
                    value="double"
                    checked={lines === 'double'}
                    onChange={() => setLines('double')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor="double-line" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Double
                </label>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SRTSettings;