import React, { useState } from 'react';

type CaseChangeType = (text: string) => string;

interface TextToolsWidgetProps {
  onFindTermChange: (term: string) => void;
  onReplaceTermChange: (term: string) => void;
  onCaseSensitiveChange: (isSensitive: boolean) => void;
  onReplace: () => number;
  onReplaceAll: () => number;
  onCaseChange: (fn: CaseChangeType) => void;
}

const TextToolsWidget: React.FC<TextToolsWidgetProps> = ({
  onFindTermChange,
  onReplaceTermChange,
  onCaseSensitiveChange,
  onReplace,
  onReplaceAll,
  onCaseChange,
}) => {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleReplace = () => {
    const count = onReplace();
    setStatusMessage(count > 0 ? `Replaced 1 occurrence.` : 'No more occurrences found.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleReplaceAll = () => {
    const count = onReplaceAll();
    setStatusMessage(`Replaced ${count} occurrence(s).`);
    setTimeout(() => setStatusMessage(''), 3000);
  };
  
  const handleClear = () => {
    setFind('');
    setReplace('');
    onFindTermChange('');
    onReplaceTermChange('');
    setStatusMessage('');
  };

  const caseButtons: { label: string; transform: CaseChangeType, style?: React.CSSProperties }[] = [
    { label: 'Sentence case', transform: (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() },
    { label: 'lower case', transform: (text) => text.toLowerCase() },
    { label: 'UPPER CASE', transform: (text) => text.toUpperCase() },
    { label: 'Capitalized Case', transform: (text) => text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') },
    { label: 'aLtErNaTiNg cAsE', style: {textTransform: 'none'}, transform: (text) => text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
    { label: 'Title Case', transform: (text) => text.toLowerCase().split(' ').map(word => {
        const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with'];
        if (minorWords.includes(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ').replace(/^(.)/, (match) => match.toUpperCase()) }, // Ensure first word is always capitalized
  ];

  const inputClass = "w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500";
  const buttonClass = "px-3 py-1.5 text-xs font-medium text-gray-900 bg-white rounded-md border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700";
  const caseButtonClass = "px-2 py-1 text-xs font-medium text-center text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-300 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-800";

  return (
    <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-4">
      <div>
        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Find and Replace</h3>
        <div className="space-y-2">
            <input
                type="text"
                value={find}
                onChange={(e) => { setFind(e.target.value); onFindTermChange(e.target.value); }}
                className={inputClass}
                placeholder="Find"
                aria-label="Find text"
            />
            <input
                type="text"
                value={replace}
                onChange={(e) => { setReplace(e.target.value); onReplaceTermChange(e.target.value); }}
                className={inputClass}
                placeholder="Replace with"
                aria-label="Replace with text"
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="case-sensitive"
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={(e) => { setCaseSensitive(e.target.checked); onCaseSensitiveChange(e.target.checked); }}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="case-sensitive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Case sensitive
                    </label>
                </div>
            </div>
             <div className="grid grid-cols-3 gap-2">
                <button onClick={handleReplace} className={buttonClass}>Replace</button>
                <button onClick={handleReplaceAll} className={buttonClass}>Replace All</button>
                <button onClick={handleClear} className={buttonClass}>Clear</button>
            </div>
             {statusMessage && <p className="text-xs text-center text-gray-600 dark:text-gray-300 mt-2">{statusMessage}</p>}
        </div>
      </div>
      <div>
         <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Change Case</h3>
         <div className="grid grid-cols-3 gap-2">
            {caseButtons.map(btn => (
                <button key={btn.label} onClick={() => onCaseChange(btn.transform)} className={caseButtonClass} style={btn.style}>
                    {btn.label}
                </button>
            ))}
         </div>
      </div>
    </div>
  );
};

export default TextToolsWidget;