// @ts-nocheck
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
}

export default function SpeechToText({ onTranscript }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    setIsLoading(true);

    // Use the appropriate constructor based on browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setIsLoading(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsLoading(false);
      
      if (event.error === 'not-allowed') {
        alert('Microphone access was denied. Please allow microphone access to use speech-to-text.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsLoading(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsLoading(false);
  };

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={`p-2 rounded-lg ${
        isListening 
          ? 'bg-red-600 hover:bg-red-500' 
          : 'bg-blue-600 hover:bg-blue-500'
      }`}
      title={isListening ? 'Stop recording' : 'Start recording'}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : isListening ? (
        <MicOff size={20} />
      ) : (
        <Mic size={20} />
      )}
    </button>
  );
}