import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ImageDisplay from './components/ImageDisplay';
// HistoryDisplay is no longer imported or used
import { generateColoringBookPrompt, generateColoringBookImage } from './services/geminiService';
import { ApiState } from './types'; // HistoryEntry is no longer needed

/**
 * Main application component for the AI Coloring Book Helper.
 * Manages the state and flow for generating prompts and images.
 */
const App: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
  // History state and currentPage state removed
  const [promptApiState, setPromptApiState] = useState<ApiState>(ApiState.IDLE);
  const [imageApiState, setImageApiState] = useState<ApiState>(ApiState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'promptInput' | 'imageDisplay'>('promptInput'); // New state for navigation

  /**
   * Handles toggling an image's selection status for printing.
   * @param url The data URL of the image to toggle.
   */
  const handleToggleImageSelection = useCallback((url: string) => {
    setSelectedImageUrls((prevSelected) => {
      if (prevSelected.includes(url)) {
        return prevSelected.filter((selectedUrl) => selectedUrl !== url);
      } else {
        return [...prevSelected, url];
      }
    });
  }, []);

  /**
   * Handles printing the currently selected images.
   * Creates a hidden iframe with print-optimized styling and content.
   */
  const handlePrintSelectedImages = useCallback(() => {
    if (selectedImageUrls.length === 0) {
      alert("Please select at least one image to print.");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Could not open print window. Please allow pop-ups.");
      return;
    }

    const htmlContent = `
      <html>
      <head>
        <title>Print Coloring Pages</title>
        <style>
          @page {
            margin: 0;
            size: A4 portrait; /* Default to A4 portrait, can be adjusted */
          }
          body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
            -webkit-print-color-adjust: exact; /* For background colors/images if needed */
          }
          .page {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always; /* Ensure each image gets its own page */
            background-color: white; /* Ensure white background for print */
          }
          .page:last-child {
            page-break-after: avoid; /* Prevent an empty last page */
          }
          .page img {
            max-width: 90%; /* Leave some margin */
            max-height: 90vh; /* Leave some margin */
            object-fit: contain; /* Scale image to fit within bounds */
            display: block; /* Important for alignment */
            border: none; /* No borders in print */
            box-shadow: none; /* No shadows in print */
          }
        </style>
      </head>
      <body>
        ${selectedImageUrls.map((url) => `
          <div class="page">
            <img src="${url}" alt="Coloring Page">
          </div>
        `).join('')}
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load and then print
    printWindow.onload = () => {
      printWindow.print();
      // Optional: close window after print dialog is closed/canceled
      // printWindow.onafterprint = () => printWindow.close();
    };
    printWindow.focus(); // Bring print window to front
  }, [selectedImageUrls, generatedPrompt]);

  /**
   * Handles the generation of the AI prompt based on the user's transcript.
   * This function is memoized to prevent unnecessary re-renders.
   */
  const handleGeneratePrompt = useCallback(async () => {
    setError(null);
    setPromptApiState(ApiState.LOADING);
    setImageApiState(ApiState.IDLE); // Reset image state
    setImageUrls(null); // Clear previous images
    setSelectedImageUrls([]); // Reset selected images

    if (!transcript.trim()) {
      setError("Please enter an idea to generate a prompt.");
      setPromptApiState(ApiState.ERROR);
      return;
    }

    try {
      const prompt = await generateColoringBookPrompt(transcript);
      setGeneratedPrompt(prompt);
      setPromptApiState(ApiState.SUCCESS);
      setCurrentPage('imageDisplay'); // Navigate to the image display page upon successful prompt generation
    } catch (err) {
      console.error("Error in handleGeneratePrompt:", err);
      setError(`Failed to generate prompt: ${err instanceof Error ? err.message : String(err)}`);
      setPromptApiState(ApiState.ERROR);
      setGeneratedPrompt(''); // Clear prompt on error
    }
  }, [transcript]);

  /**
   * Handles navigating back to the prompt input page.
   */
  const handleBackToPromptInput = useCallback(() => {
    setCurrentPage('promptInput');
    // Optionally clear image data when going back to prompt input to ensure a fresh generation
    setImageUrls(null);
    setImageApiState(ApiState.IDLE);
    setSelectedImageUrls([]);
  }, []);

  /**
   * Handles the generation of the AI image based on the refined prompt.
   * This effect runs whenever `generatedPrompt` or `promptApiState` successfully changes.
   */
  useEffect(() => {
    const handleGenerateImage = async () => {
      if (promptApiState === ApiState.SUCCESS && generatedPrompt && currentPage === 'imageDisplay') {
        setError(null);
        setImageApiState(ApiState.LOADING);
        setImageUrls(null); // Clear images before new generation
        setSelectedImageUrls([]); // Reset selected images

        try {
          const urls = await generateColoringBookImage(generatedPrompt); // Expect an array of URLs
          setImageUrls(urls);
          setImageApiState(ApiState.SUCCESS);
        } catch (err) {
          console.error("Error in handleGenerateImage:", err);
          setError(`Failed to generate image: ${err instanceof Error ? err.message : String(err)}`);
          setImageApiState(ApiState.ERROR);
          setImageUrls(null); // Clear images on error
        }
      }
    };

    handleGenerateImage();
  }, [generatedPrompt, promptApiState, currentPage]); // Added currentPage as dependency to re-trigger on page navigation

  return (
    <div className="w-full max-w-3xl mx-auto sm:my-8 bg-white shadow-2xl sm:rounded-3xl flex flex-col font-sans text-gray-800 min-h-screen sm:min-h-[800px] overflow-hidden border border-white/20">
      <Header currentPage={currentPage} onBack={handleBackToPromptInput} />
      <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
        {currentPage === 'promptInput' && (
          <div className="max-w-2xl mx-auto">
            <PromptInput
              transcript={transcript}
              setTranscript={setTranscript}
              onGeneratePrompt={handleGeneratePrompt}
              promptApiState={promptApiState}
            />

            {/* Prompt generation errors displayed here */}
            {error && promptApiState === ApiState.ERROR && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mt-6" role="alert">
                <div className="flex">
                  <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
                  <div>
                    <p className="font-bold">Error Generating Prompt</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'imageDisplay' && (
          <div className="max-w-2xl mx-auto">
            {/* Display Generated AI Prompt */}
            {generatedPrompt && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 mb-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-bold mb-1">
                  Optimized Prompt
                </p>
                <p className="text-purple-900 text-lg leading-relaxed font-medium">
                  "{generatedPrompt}"
                </p>
              </div>
            )}

            {/* Image generation errors displayed here */}
            {error && imageApiState === ApiState.ERROR && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-6" role="alert">
                <p className="font-bold">Oops!</p>
                <p>{error}</p>
              </div>
            )}

            <ImageDisplay
              imageUrls={imageUrls}
              imageApiState={imageApiState}
              error={imageApiState === ApiState.ERROR ? error : null} // Pass image specific error
              selectedImageUrls={selectedImageUrls}
              onToggleSelection={handleToggleImageSelection}
              onPrintSelected={handlePrintSelectedImages}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;