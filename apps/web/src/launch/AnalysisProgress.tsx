import { terminalBar } from "./launch-motion.js";

export interface AnalysisStep {
  label: string;
  fill: number;
}

export interface AnalysisProgressProps {
  step: AnalysisStep;
  stepIndex?: number;
  totalSteps?: number;
}

export function AnalysisProgress({ step, stepIndex = 0, totalSteps = 4 }: AnalysisProgressProps) {
  return (
    <div className="launch-builder__analysis" role="status" aria-live="polite">
      <p className="launch-builder__analysis-step">
        Step {stepIndex + 1} of {totalSteps}
      </p>
      <p className="launch-builder__analysis-label">{step.label}</p>
      <div className="launch-builder__analysis-track" aria-hidden="true">
        <div className="launch-builder__analysis-fill" style={{ width: `${step.fill}%` }} />
      </div>
      <p className="launch-builder__analysis-glyphs" aria-hidden="true">
        {terminalBar(step.fill)}
      </p>
    </div>
  );
}
