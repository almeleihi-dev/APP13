import { useEffect } from "react";
import { ThemeProvider, ModeTransitionOverlay, RuntimeScreenMount, AnActError } from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";

export interface RuntimePageProps {
  bootstrapping?: boolean;
}

export function RuntimePage({ bootstrapping = false }: RuntimePageProps) {
  const {
    screen,
    mode,
    loading,
    relaying,
    error,
    offline,
    reload,
    relay,
    clearError,
    transitionActive,
    transitionProgress,
    transitionStageText,
  } = useRuntime();

  useEffect(() => {
    if (bootstrapping) {
      void reload();
    }
  }, [bootstrapping, reload]);

  if (bootstrapping && !screen && loading) {
    return (
      <div style={{ padding: "24px" }} role="status">
        Loading Need Experience...
      </div>
    );
  }

  if (offline) {
    return (
      <div style={{ padding: "24px", maxWidth: "480px", margin: "0 auto" }}>
        <AnActError
          node={{
            key: "offline",
            element: "an-act-error",
            props: {
              title: "Offline",
              detail: "AN ACT requires a connection to load Runtime JSON from the server.",
              code: "OFFLINE",
            },
          }}
        />
      </div>
    );
  }

  if (!screen) {
    return <div style={{ padding: "24px" }}>No runtime screen available.</div>;
  }

  return (
    <ThemeProvider mode={mode} transitioning={transitionActive}>
      {loading || relaying ? (
        <div style={{ padding: "8px 16px", opacity: 0.7 }} role="status">
          {relaying ? "Relaying action..." : "Loading experience..."}
        </div>
      ) : null}
      {error ? (
        <div style={{ padding: "16px" }}>
          <AnActError
            node={{
              key: "runtime-error",
              element: "an-act-error",
              props: { title: error.title, detail: error.detail, code: error.code },
            }}
          />
          <button type="button" onClick={clearError} style={{ marginTop: "8px" }}>
            Dismiss
          </button>
        </div>
      ) : null}
      <RuntimeScreenMount screen={screen} onRelay={(intent) => void relay(intent)} />
      <ModeTransitionOverlay
        active={transitionActive}
        direction="need-to-action"
        progress={transitionProgress}
        stageText={transitionStageText}
      />
    </ThemeProvider>
  );
}
