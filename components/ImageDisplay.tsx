import React from 'react';
import { ApiState } from '../types';

interface ImageDisplayProps {
  imageUrls: string[] | null;
  imageApiState: ApiState;
  error: string | null;
  selectedImageUrls: string[];
  onToggleSelection: (url: string) => void;
  onPrintSelected: () => void;
}

/**
 * Displays the generated image(s), a loading indicator, or an error message.
 * Optimized for mobile and desktop display.
 */
const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrls,
  imageApiState,
  error,
  selectedImageUrls,
  onToggleSelection,
  onPrintSelected,
}) => {
  const isLoading = imageApiState === ApiState.LOADING;
  const showImages = !isLoading && !error && imageUrls && imageUrls.length > 0;
  const canPrint = showImages && selectedImageUrls.length > 0;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 bg-blue-50 rounded-3xl border-2 border-dashed border-blue-200 w-full animate-pulse">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
             <svg className="animate-spin h-12 w-12 text-blue-500 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          </div>
          <p className="text-xl font-bold text-blue-800 mt-6">Drawing your pages...</p>
          <p className="text-sm text-blue-600 mt-2">The AI is creating distinct styles for you</p>
        </div>
      )}

      {showImages && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-8">
            {imageUrls.map((url, index) => {
              const isSelected = selectedImageUrls.includes(url);
              return (
                <div
                  key={index}
                  className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer shadow-lg
                              ${isSelected 
                                ? 'ring-4 ring-green-500 scale-[1.02] shadow-xl' 
                                : 'ring-1 ring-gray-200 hover:ring-4 hover:ring-blue-300 hover:shadow-xl'
                              }
                             `}
                  onClick={() => onToggleSelection(url)}
                >
                  <div className="aspect-square bg-white flex items-center justify-center relative">
                      <img
                        src={url}
                        alt={`Generated Coloring Page ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                      {/* Selection Checkmark Overlay */}
                      <div className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md
                          ${isSelected ? 'bg-green-500 text-white scale-100' : 'bg-white/80 text-gray-300 scale-90 opacity-70 group-hover:opacity-100'}
                      `}>
                          {isSelected ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                      </div>
                  </div>
                  
                  <div className={`p-3 text-center transition-colors duration-200 ${isSelected ? 'bg-green-50' : 'bg-gray-50 group-hover:bg-blue-50'}`}>
                      <span className={`font-semibold text-sm ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
                          {isSelected ? 'Selected for Print' : `Tap to Select Option ${index + 1}`}
                      </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onPrintSelected}
            className={`w-full py-5 px-6 rounded-2xl text-white font-bold text-xl shadow-xl transition-all duration-300
                        ${canPrint
                          ? 'bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-500 hover:to-cyan-700 transform hover:-translate-y-1'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        }`}
            disabled={!canPrint}
          >
            <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                {canPrint ? `Print ${selectedImageUrls.length} Page${selectedImageUrls.length > 1 ? 's' : ''}` : 'Select Pages to Print'}
            </div>
          </button>
        </>
      )}

      {!isLoading && !error && (!imageUrls || imageUrls.length === 0) && (
        <div className="flex flex-col items-center justify-center text-gray-400 h-64 border-2 border-dashed border-gray-200 rounded-3xl w-full bg-gray-50/50">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p className="font-medium">Your masterpieces will appear here</p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;