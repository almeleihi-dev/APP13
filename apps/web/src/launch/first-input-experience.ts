export type FirstInputMethod = "voice" | "file" | "write";

export interface FileGoalExtraction {
  text: string;
  evidenceNote: string;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

export function createSpeechRecognition(
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onError: (message: string) => void,
): SpeechRecognitionInstance | null {
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let interim = "";
    let final = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const chunk = result[0]?.transcript ?? "";
      if (result.isFinal) final += chunk;
      else interim += chunk;
    }
    if (final.trim()) onTranscript(final.trim(), true);
    else if (interim.trim()) onTranscript(interim.trim(), false);
  };

  recognition.onerror = (event) => {
    if (event.error === "aborted") return;
    onError(
      event.error === "not-allowed"
        ? "Microphone access denied — allow mic or use Write."
        : "Voice capture unavailable — use Write to describe your goal.",
    );
  };

  return recognition;
}

const TEXT_EXTENSIONS = [".txt", ".md", ".markdown", ".json", ".csv"];

export async function extractGoalFromFile(file: File): Promise<FileGoalExtraction> {
  const lowerName = file.name.toLowerCase();
  const isTextLike =
    file.type.startsWith("text/") ||
    file.type === "application/json" ||
    TEXT_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

  if (isTextLike) {
    const raw = await file.text();
    const text = raw.trim().slice(0, 4000);
    return {
      text: text || `Goal from document: ${file.name}`,
      evidenceNote: `Document "${file.name}" uploaded — ready for future evidence connection.`,
    };
  }

  const friendlyName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return {
    text: `I want to accomplish goals described in ${friendlyName || file.name}.`,
    evidenceNote: `File "${file.name}" attached — content extraction coming in a future release.`,
  };
}

export const FIRST_INPUT_INTRO =
  "Tell an act what you want to accomplish. an act turns it into actions.";

export const FIRST_INPUT_JOURNEY_HINT =
  "Describe your goal → Build preview → Project breakdown → Actions → Contracts → Trust growth";
