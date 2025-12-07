import React from 'react';
// HistoryEntry has been removed from types.ts, so this import is no longer valid.
// import { HistoryEntry } from '../types';

interface HistoryDisplayProps {
  // Fix: `HistoryEntry` interface removed from `types.ts`, replacing with `any[]` to resolve compilation error.
  history: any[];
  onClearHistory: () => void;
  currentSelectedImageUrls: string[]; // New: current selection from main app
  onSelectImageForReprint: (url: string) => void; // New: callback to re-select image
  onPrintSelected: () => void; // NEW: Callback to trigger printing from history
}

/**
 * Displays a history of previously printed coloring pages.
 */
const HistoryDisplay: React.FC<HistoryDisplayProps> = ({
  history,
  onClearHistory,
  currentSelectedImageUrls,
  onSelectImageForReprint, // Fix: Add onSelectImageForReprint to destructured props
  onPrintSelected, // Destructure new prop
}) => {
  const canPrint = currentSelectedImageUrls.length > 0;

  if (history.length === 0) {
    return (
      <div className="p-4 md:p-6 bg-purple-100 rounded-xl shadow-md mt-4 text-center text-gray-600">
        <p className="text-lg font-semibold mb-2">No printing history yet!</p>
        <p className="text-sm">Generate and print some pages to see them here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-purple-100 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-700">Past Prints</h2>
        <button
          onClick={onClearHistory}
          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 text-sm"
          aria-label="Clear all printing history"
        >
          Clear History
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {history.map((entry: any) => ( // Fix: `entry` type changed to `any`
          <div key={entry.id} className="p-4 bg-white rounded-xl shadow-md border border-purple-200">
            <p className="text-sm text-gray-500 mb-1" aria-label={`Printed on ${entry.timestamp}`}>
              {entry.timestamp}
            </p>
            <p className="font-semibold text-purple-800 mb-2 text-base" aria-label={`Prompt used: ${entry.prompt}`}>
              Prompt: "<span className="italic">{entry.prompt}</span>"
            </p>
            <p className="text-gray-700 mb-2">
              {entry.selectedImageUrls.length} page(s) printed:
            </p>
            <div className="flex flex-wrap gap-2">
              {entry.selectedImageUrls.map((url: string, imgIndex: number) => { // Fix: Explicitly type url and imgIndex
                const isCurrentlySelected = currentSelectedImageUrls.includes(url);
                return (
                  <div
                    key={imgIndex}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg border-2 cursor-pointer transition-all duration-200
                                ${isCurrentlySelected ? 'border-green-500 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => onSelectImageForReprint(url)}
                    tabIndex={0} // Make it focusable
                    role="button"
                    aria-pressed={isCurrentlySelected}
                    aria-label={`Select this historical image for re-printing: option ${imgIndex + 1} from prompt "${entry.prompt}"`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail for prompt: ${entry.prompt}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {isCurrentlySelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-30 rounded-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* New Print Selected Pages button for history */}
      <button
        onClick={onPrintSelected}
        className={`mt-6 w-full py-4 px-6 rounded-xl text-white font-bold text-xl transition-all duration-300
                    ${canPrint
                        ? 'bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 transform hover:scale-105'
                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`}
        disabled={!canPrint}
        aria-label="Print selected coloring pages from history"
      >
        Print Selected Pages ({currentSelectedImageUrls.length})
      </button>
    </div>
  );
};

export default HistoryDisplay;