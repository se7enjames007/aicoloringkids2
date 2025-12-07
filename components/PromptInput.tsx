import React, { useState, useRef, useEffect } from 'react';
import { ApiState } from '../types';

interface PromptInputProps {
  transcript: string;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  onGeneratePrompt: () => void;
  promptApiState: ApiState;
}

declare global {
  interface SpeechRecognition extends EventTarget {
    grammars: SpeechGrammarList;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    serviceURI: string;

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;

    start(): void;
    stop(): void;
    abort(): void;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
    readonly interpretation: any; // Type according to spec
    readonly emma: Document | null; // Type according to spec
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }

  type SpeechRecognitionErrorCode =
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported';

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly [index: number]: SpeechRecognitionAlternative;
    readonly length: number;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionResultList {
    readonly [index: number]: SpeechRecognitionResult;
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
  }

  interface SpeechGrammar {
    src: string;
    weight: number;
  }

  interface SpeechGrammarList {
    readonly length: number;
    item(index: number): SpeechGrammar;
    addFromString(string: string, weight?: number): void;
    addFromURI(src: string, weight?: number): void;
  }

  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
  }
}

/**
 * Provides an input area for the user's raw transcript and a button to generate the AI prompt.
 * Also displays the generated AI prompt.
 */
const PromptInput: React.FC<PromptInputProps> = ({
  transcript,
  setTranscript,
  onGeneratePrompt,
  promptApiState,
}) => {
  const isLoading = promptApiState === ApiState.LOADING;
  const [isRecording, setIsRecording] = useState(false);
  const [interimSpeechResult, setInterimSpeechResult] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Your browser does not support Speech Recognition. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setInterimSpeechResult('');
      setTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          currentInterim += transcriptChunk;
        }
      }

      setInterimSpeechResult(currentInterim);
      if (finalTranscript) {
        setTranscript((prev) => (prev ? prev + ' ' : '') + finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimSpeechResult('');
      recognitionRef.current?.stop();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech Recognition Error:', event.error);
      setIsRecording(false);
      setInterimSpeechResult('');
      let errorMessage = 'An error occurred during speech recognition.';
      if (event.error === 'not-allowed') {
        errorMessage = 'Microphone permission denied. Please enable it in your browser settings.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please try again.';
      } else if (event.error === 'network') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      alert(errorMessage);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setInterimSpeechResult('');
  };

  const displayTranscript = isRecording
    ? (transcript ? transcript + ' ' : '') + interimSpeechResult
    : transcript;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white p-1">
        <label htmlFor="transcript" className="block text-gray-700 text-lg font-bold mb-3">
          What should we draw today?
        </label>
        
        <div className="relative">
          <textarea
            id="transcript"
            className="w-full p-5 pr-16 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all text-lg leading-relaxed resize-none shadow-inner"
            placeholder={isRecording ? 'Listening...' : 'e.g., "A happy dinosaur eating ice cream"'}
            value={displayTranscript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={5}
            disabled={isLoading || isRecording}
            aria-label="Enter your idea for the coloring book page"
          ></textarea>
          
          <div className="absolute bottom-4 right-4">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`w-14 h-14 flex items-center justify-center rounded-full text-white text-2xl shadow-lg transition-all duration-300 transform hover:scale-110
                ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200 animate-pulse'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                }
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
              disabled={isLoading}
              title={isRecording ? "Stop Recording" : "Start Voice Input"}
              aria-label={isRecording ? "Stop Recording Voice Input" : "Start Recording Voice Input"}
            >
              {isRecording ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5v1.085l3.293-3.293a1 1 0 10-1.414-1.414L10 11.086l-2.293-2.293a1 1 0 10-1.414 1.414L9 14.015V16a1 1 0 102 0v-1.93z" clipRule="evenodd"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2 text-right italic">
          {isRecording ? "Listening..." : "Tap the microphone to speak"}
        </p>
      </div>

      <button
        onClick={onGeneratePrompt}
        className={`w-full py-5 px-6 rounded-2xl text-white font-bold text-xl tracking-wide shadow-xl transition-all duration-300 transform active:scale-95
          ${isLoading || isRecording || !displayTranscript.trim()
            ? 'bg-gray-300 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:to-red-600 hover:shadow-2xl hover:-translate-y-1'
          }`}
        disabled={isLoading || isRecording || !displayTranscript.trim()}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Magic...
          </span>
        ) : (
          'Generate Coloring Page'
        )}
      </button>
    </div>
  );
};

export default PromptInput;