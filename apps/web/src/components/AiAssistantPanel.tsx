import { useEffect, useState } from "react";
import { AnActBrandLoading } from "@an-act/runtime-ui/react";
import type { RuntimeClient } from "@an-act/runtime-client";

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
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "AI assistant unavailable");
      } finally {
        setLoading(false);
      }
    })();
  }, [client, kind, open]);

  return (
    <aside className="an-act-ai-panel" aria-label={`${labelForKind(kind)} assistant`}>
      <button
        type="button"
        className="an-act-ai-panel__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {labelForKind(kind)}
      </button>
      {open ? (
        <div className="an-act-ai-panel__body">
          {loading ? <AnActBrandLoading stageText="Loading AI guidance..." compact /> : null}
          {error ? (
            <p role="status" className="an-act-ai-panel__error">
              {error}
            </p>
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
