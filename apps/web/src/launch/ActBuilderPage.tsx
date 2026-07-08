import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { PremiumButton } from "@an-act/runtime-ui/react";
import { LanguageSelector } from "../components/i18n/LanguageSelector.js";
import { useLocale } from "../i18n/useLocale.js";
import { AnalysisProgress, type AnalysisStep } from "./AnalysisProgress.js";
import {
  extractGoalFromFile,
  FIRST_INPUT_INTRO,
  FIRST_INPUT_JOURNEY_HINT,
} from "./first-input-experience.js";
import { LaunchScene } from "./LaunchScene.js";
import { navigate, saveLaunchActDraft } from "./navigation.js";
import { useVoiceGoalCapture } from "./useVoiceGoalCapture.js";
import { detectInputIntent } from "../lib/living-platform/intelligence/profession-intent-detection.js";
import { isGuestMode } from "../guest/guest-session.js";
import { GuestModeBanner } from "../components/guest/GuestModeBanner.js";

type InputMethod = "voice" | "file" | "write";

function analysisStepsForIntent(intent: "goal" | "profession"): AnalysisStep[] {
  if (intent === "profession") {
    return [
      { label: "Understanding your profession…", fill: 50 },
      { label: "Discovering actions you can perform…", fill: 75 },
      { label: "Building Action Inventory…", fill: 100 },
      { label: "Ready.", fill: 100 },
    ];
  }
  return [
    { label: "Listening…", fill: 50 },
    { label: "Understanding…", fill: 67 },
    { label: "Building Professional Acts…", fill: 100 },
    { label: "Ready.", fill: 100 },
  ];
}

const STEP_DURATION_MS = 780;

export function ActBuilderPage() {
  const { t } = useLocale();
  const [method, setMethod] = useState<InputMethod>("write");
  const [goalText, setGoalText] = useState("");
  const [fileName, setFileName] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>(analysisStepsForIntent("goal"));

  const detectedIntent = useMemo(() => detectInputIntent(goalText), [goalText]);

  const onVoiceTranscript = useCallback((transcript: string, isFinal: boolean) => {
    setGoalText((current) => {
      if (isFinal) {
        const base = current.trim();
        return base ? `${base} ${transcript}`.trim() : transcript;
      }
      const prefix = current.split(/\s+/).slice(0, -1).join(" ");
      return prefix ? `${prefix} ${transcript}`.trim() : transcript;
    });
  }, []);

  const voice = useVoiceGoalCapture(onVoiceTranscript);

  const hasContent = goalText.trim().length > 0;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      return;
    }
    setFileLoading(true);
    setFileError(null);
    try {
      const extracted = await extractGoalFromFile(file);
      setFileName(file.name);
      setGoalText(extracted.text);
      setEvidenceNote(extracted.evidenceNote);
    } catch {
      setFileError("Could not read that file — try a .txt or .md document, or use Write.");
      setFileName("");
    } finally {
      setFileLoading(false);
    }
  }

  function selectMethod(next: InputMethod) {
    if (method === "voice" && voice.listening) voice.stop();
    setMethod(next);
    setFileError(null);
  }

  function runAnalysis() {
    if (!hasContent || analyzing) return;
    if (voice.listening) voice.stop();
    setAnalyzing(true);
    setProgressIndex(0);

    const summary = goalText.trim();
    const inputIntent = detectInputIntent(summary);
    const steps = analysisStepsForIntent(inputIntent);
    setAnalysisSteps(steps);

    steps.forEach((_, index) => {
      window.setTimeout(() => {
        setProgressIndex(index);
        if (index === steps.length - 1) {
          saveLaunchActDraft({
            method,
            summary,
            inputIntent,
            completedAt: new Date().toISOString(),
            fileName: method === "file" ? fileName : undefined,
            evidenceNote: method === "file" ? evidenceNote : undefined,
          });
          window.setTimeout(() => navigate("/preview"), 520);
        }
      }, index * STEP_DURATION_MS);
    });
  }

  const methodHint = useMemo(() => {
    if (method === "voice") {
      return voice.supported
        ? "Beta · Speak your goal — we convert speech to text for your act."
        : "Voice is not available in this browser — use Write.";
    }
    if (method === "file") {
      return "Beta · Upload a brief (.txt, .md) — we extract your goal and prepare evidence connection.";
    }
    return "Type your profession or what you want to accomplish — e.g. Structural Engineer or I want to build an app.";
  }, [method, voice.supported]);

  const stepLabel =
    detectedIntent === "profession" ? t("builder.stepProfession") : t("builder.stepGoal");
  const titleLabel =
    detectedIntent === "profession" ? t("builder.titleProfession") : t("builder.titleGoal");
  const buildLabel = detectedIntent === "profession" ? t("builder.discoverActions") : t("builder.buildPreview");

  return (
    <LaunchScene className="launch-builder an-act-first-input">
      <div className="launch-builder__shell">
        <LanguageSelector className="launch-builder__language" />
        {isGuestMode() ? <GuestModeBanner /> : null}
        <header className="launch-builder__header">
          <p className="launch-v1__eyebrow">Act Builder</p>
          <p className="launch-builder__step-strip">{stepLabel}</p>
          <h1 className="launch-builder__title">{titleLabel}</h1>
          <p className="launch-builder__intro">{FIRST_INPUT_INTRO}</p>
          <p className="launch-builder__journey-hint">{FIRST_INPUT_JOURNEY_HINT}</p>
        </header>

        <div className="launch-builder__methods" role="tablist" aria-label="Input method">
          <button
            type="button"
            role="tab"
            aria-selected={method === "voice"}
            className={`launch-builder__method${method === "voice" ? " launch-builder__method--active" : ""}`}
            onClick={() => selectMethod("voice")}
          >
            Record Voice
            <span className="launch-builder__method-badge launch-builder__method-badge--beta">Beta</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={method === "file"}
            className={`launch-builder__method${method === "file" ? " launch-builder__method--active" : ""}`}
            onClick={() => selectMethod("file")}
          >
            Upload File
            <span className="launch-builder__method-badge launch-builder__method-badge--beta">Beta</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={method === "write"}
            className={`launch-builder__method${method === "write" ? " launch-builder__method--active" : ""}`}
            onClick={() => selectMethod("write")}
          >
            Write
          </button>
        </div>

        <p className="launch-builder__method-hint" role="note">
          {methodHint}
        </p>

        <div className="launch-builder__panel" role="tabpanel" aria-label="Act input">
          {method === "voice" ? (
            <div className="launch-builder__voice">
              <button
                type="button"
                className={`launch-builder__voice-btn${voice.listening ? " launch-builder__voice-btn--active" : ""}`}
                onClick={() => (voice.listening ? voice.stop() : voice.start())}
                disabled={!voice.supported}
              >
                {voice.listening ? "Stop recording" : "Tap to record your goal"}
              </button>
              <div className="launch-builder__wave" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      voice.listening
                        ? "launch-builder__wave-bar launch-builder__wave-bar--live"
                        : "launch-builder__wave-bar"
                    }
                  />
                ))}
              </div>
              {voice.error ? <p className="launch-builder__input-error">{voice.error}</p> : null}
              {goalText.trim() ? (
                <div className="launch-builder__transcript">
                  <p className="launch-builder__transcript-label">Your goal (editable)</p>
                  <textarea
                    className="launch-builder__textarea launch-builder__textarea--inline"
                    value={goalText}
                    onChange={(event) => setGoalText(event.target.value)}
                    rows={4}
                    aria-label="Voice transcript"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {method === "file" ? (
            <>
              <label className="launch-builder__file">
                <input
                  type="file"
                  className="launch-builder__file-input"
                  accept=".txt,.md,.markdown,.json,.csv,text/plain,text/markdown,application/json"
                  onChange={(event) => void handleFileChange(event)}
                />
                <span className="launch-builder__file-label">
                  {fileLoading ? "Reading document…" : fileName || "Drop a .txt or .md brief, or click to upload"}
                </span>
              </label>
              {fileError ? <p className="launch-builder__input-error">{fileError}</p> : null}
              {evidenceNote ? <p className="launch-builder__evidence-note">{evidenceNote}</p> : null}
              {goalText.trim() ? (
                <textarea
                  className="launch-builder__textarea launch-builder__textarea--inline"
                  value={goalText}
                  onChange={(event) => setGoalText(event.target.value)}
                  rows={5}
                  aria-label="Goal from uploaded file"
                />
              ) : null}
            </>
          ) : null}

          {method === "write" ? (
            <textarea
              className="launch-builder__textarea"
              placeholder={
                detectedIntent === "profession"
                  ? "e.g. Civil / Structural Engineer, Certified Accountant, Interior Designer…"
                  : "Describe what you want to accomplish…"
              }
              value={goalText}
              onChange={(event) => setGoalText(event.target.value)}
              rows={6}
              aria-label="Describe your act"
            />
          ) : null}
        </div>

        <div className="launch-builder__act-zone">
          {analyzing ? (
            <AnalysisProgress
              key={progressIndex}
              step={analysisSteps[progressIndex] ?? analysisSteps[0]}
              stepIndex={progressIndex}
              totalSteps={analysisSteps.length}
            />
          ) : (
            <>
              <PremiumButton
                variant="primary"
                size="lg"
                className={`launch-builder__act-btn${hasContent ? "" : " launch-builder__act-btn--disabled"}`}
                onClick={runAnalysis}
                disabled={!hasContent}
              >
                {buildLabel}
              </PremiumButton>
              {!hasContent ? (
                <p className="launch-builder__act-hint">
                  {method === "voice"
                    ? "Record your goal or switch to Write."
                    : method === "file"
                      ? "Upload a brief or switch to Write."
                      : "Describe your goal above to continue."}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </LaunchScene>
  );
}
