import React, { useState, useEffect } from 'react';

interface SearchWidgetProps {
  initialSearchTerm: string;
}

const SearchWidget: React.FC<SearchWidgetProps> = ({ initialSearchTerm }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearch = (urlTemplate: string) => {
    if (!searchTerm.trim()) return;
    const encodedTerm = encodeURIComponent(searchTerm);
    const url = urlTemplate.replace('{term}', encodedTerm);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const buttonClass = "px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700";

  return (
    <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
      <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Search text online</h3>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded-md mb-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
        placeholder="Select a word to search"
        aria-label="Search text online"
      />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleSearch('https://www.google.com/search?q={term}')} className={buttonClass}>
          Google it
        </button>
        <button onClick={() => handleSearch('https://translate.google.com/?sl=auto&tl=en&text={term}')} className={buttonClass}>
          Google translate
        </button>
      </div>
      <button onClick={() => handleSearch('https://www.thefreedictionary.com/{term}')} className={`w-full mt-2 ${buttonClass}`}>
        The Free Dictionary
      </button>
    </div>
  );
};

export default SearchWidget;
