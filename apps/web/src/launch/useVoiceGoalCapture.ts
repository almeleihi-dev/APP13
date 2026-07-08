import { useCallback, useEffect, useRef, useState } from "react";
import { createSpeechRecognition, isSpeechRecognitionSupported } from "./first-input-experience.js";

export function useVoiceGoalCapture(onTranscript: (text: string, isFinal: boolean) => void) {
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = isSpeechRecognitionSupported();

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      setError("Voice is not supported in this browser — use Write.");
      return;
    }
    setError(null);
    recognitionRef.current?.abort();
    const recognition = createSpeechRecognition(onTranscript, (message) => {
      setError(message);
      setListening(false);
    });
    if (!recognition) {
      setError("Voice capture unavailable — use Write.");
      return;
    }
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("Could not start microphone — use Write.");
      setListening(false);
    }
  }, [onTranscript, supported]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported, listening, error, start, stop };
}
