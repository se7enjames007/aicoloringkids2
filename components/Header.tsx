import React from 'react';

interface HeaderProps {
  currentPage: 'promptInput' | 'imageDisplay';
  onBack: () => void;
}

/**
 * Renders the header section of the application.
 */
const Header: React.FC<HeaderProps> = ({ currentPage, onBack }) => {
  return (
    <header className="relative py-6 px-4 sm:py-8 sm:px-8 border-b border-gray-100 bg-white z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center relative">
        
        {currentPage === 'imageDisplay' && (
          <button
            onClick={onBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 sm:pr-4 rounded-full sm:rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 flex items-center group"
            aria-label="Go back to prompt input"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-purple-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                </svg>
            </div>
            <span className="hidden sm:inline ml-2 font-medium text-sm">New Page</span>
          </button>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
            Coloring Book
          </span>
          <br className="sm:hidden" />
          <span className="text-gray-800 sm:ml-2">Creator</span>
        </h1>
        
        {currentPage === 'promptInput' ? (
          <p className="text-gray-500 mt-2 text-center text-sm sm:text-base font-medium max-w-md mx-auto">
            Turn your voice into magical coloring pages.
          </p>
        ) : (
          <p className="text-gray-500 mt-2 text-center text-sm sm:text-base font-medium">
            Tap the images to select, then print!
          </p>
        )}
      </div>
    </header>
  );
};

export default Header;