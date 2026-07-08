import { useEffect, useRef, useState } from "react";
import type { RuntimeClient } from "@an-act/runtime-client";
import { useEscapeKey } from "../hooks/useEscapeKey.js";
import { PresentationError } from "./PresentationError.js";

export type AiAssistantKind = "need" | "action" | "contract";

export interface AiAssistantPanelProps {
  client: RuntimeClient;
  kind: AiAssistantKind;
  collapsed?: boolean;
}

export function AiAssistantPanel({ client, kind, collapsed = false }: AiAssistantPanelProps) {
  const [open, setOpen] = useState(!collapsed);
  const [loading, setLoading] = useState(false);
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(open, () => {
    setOpen(false);
    toggleRef.current?.focus();
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          kind === "need"
            ? await client.getAiNeedSummary()
            : kind === "action"
              ? await client.getAiActionCompanion()
              : await client.getAiContractRecommendation();
        setHeadline(String(data.headline ?? data.title ?? labelForKind(kind)));
        setSummary(String(data.summary ?? data.explanation ?? data.recommendation ?? ""));
        const recs = data.recommendations ?? data.next_actions ?? data.steps;
        if (Array.isArray(recs)) {
          setRecommendations(
            recs.map((r) => (typeof r === "string" ? r : String((r as { label?: string }).label ?? JSON.stringify(r))))
          );
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        setError({
          title: "Assistant unavailable",
          detail: err instanceof Error ? err.message : "We couldn't load AI guidance right now.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [client, kind, open]);

  function reloadAssistant() {
    setOpen(false);
    setTimeout(() => setOpen(true), 0);
  }

  return (
    <aside className="an-act-ai-panel" aria-label={`${labelForKind(kind)} assistant`}>
      <button
        ref={toggleRef}
        type="button"
        className="an-act-ai-panel__toggle"
        aria-expanded={open}
        aria-controls={`ai-panel-${kind}`}
        onClick={() => setOpen((v) => !v)}
      >
        {labelForKind(kind)}
      </button>
      {open ? (
        <div id={`ai-panel-${kind}`} className="an-act-ai-panel__body" role="region">
          {loading ? <p role="status" className="an-act-inline-status" data-compact="true">Loading guidance...</p> : null}
          {error ? (
            <PresentationError
              title={error.title}
              detail={error.detail}
              onRetry={reloadAssistant}
              onDismiss={() => setError(null)}
            />
          ) : null}
          {!loading && !error ? (
            <>
              <h3 className="an-act-ai-panel__headline">{headline}</h3>
              {summary ? <p className="an-act-ai-panel__summary">{summary}</p> : null}
              {recommendations.length > 0 ? (
                <ul className="an-act-ai-panel__list">
                  {recommendations.slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

function labelForKind(kind: AiAssistantKind): string {
  if (kind === "action") {
    return "Action Assistant";
  }
  if (kind === "contract") {
    return "Contract Assistant";
  }
  return "Need Assistant";
}
