import { useState } from "react";

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
//   const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  let recognition: SpeechRecognition | null = null;

  // Ensure recognition is not null
  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    const WebkitSpeechRecognition = (
      window as unknown as {
        webkitSpeechRecognition: new () => SpeechRecognition;
      }
    ).webkitSpeechRecognition;
    recognition = new WebkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
  }

  // Add null checks for recognition
  const startListening = () => {
    if (!recognition) return;
    setListening(true);
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        interimTranscript += result[0].transcript;
      }
    //   setTranscript(interimTranscript);
      onRes(interimTranscript);
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };
  };

  const stopListening = () => {
    if (!recognition) return;
    recognition.stop();
    setListening(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* <h1 className="text-2xl font-bold">Speech-to-Text Demo</h1>
      <p className="p-4 border rounded bg-gray-100 min-h-[100px]">
        {transcript || "Speak something..."}
      </p> */}
      <div className="flex gap-2">
        {!listening ? (
          <button
            onClick={startListening}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Start Listening
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="p-2 bg-red-500 text-white rounded"
          >
            Stop Listening
          </button>
        )}
      </div>
    </div>
  );
}
