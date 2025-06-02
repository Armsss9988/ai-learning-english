import { useState, useEffect, useCallback } from "react";

// Define SpeechRecognition and SpeechRecognitionErrorEvent types
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

// Correct SpeechRecognitionEvent type
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
export interface SpeechToTextPrombt {
  onRes: (transcript: string) => void;
}
export default function SpeechToText({ onRes }: SpeechToTextPrombt) {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  // Initialize recognition on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const WebkitSpeechRecognition = (
        window as unknown as {
          webkitSpeechRecognition: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;
      const recognitionInstance = new WebkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";
      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;
    setListening(true);
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        interimTranscript += result[0].transcript;
      }
      onRes(interimTranscript);
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };
  }, [recognition, onRes]);

  // Auto-start listening when recognition is ready
  useEffect(() => {
    if (recognition && !listening) {
      startListening();
    }
  }, [recognition, listening, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognition && listening) {
        recognition.stop();
      }
    };
  }, [recognition, listening]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-600">
        {listening ? (
          <span className="text-green-600">🎤 Listening... Speak now</span>
        ) : (
          <span className="text-gray-500">🎤 Voice input ready</span>
        )}
      </div>
    </div>
  );
}
