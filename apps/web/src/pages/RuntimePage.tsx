import { useEffect } from "react";
import { ThemeProvider, ModeTransitionOverlay, RuntimeScreenMount } from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";

export interface RuntimePageProps {
  bootstrapping?: boolean;
}

export function RuntimePage({ bootstrapping = false }: RuntimePageProps) {
  const {
    screen,
    mode,
    loading,
    error,
    reload,
    relay,
    transitionActive,
    transitionProgress,
    transitionStageText,
  } = useRuntime();

  useEffect(() => {
    if (bootstrapping) {
      void reload();
    }
  }, [bootstrapping, reload]);

  if (bootstrapping && !screen) {
    return <div style={{ padding: "24px" }}>Loading Need Experience...</div>;
  }

  if (!screen) {
    return <div style={{ padding: "24px" }}>No runtime screen available.</div>;
  }

  return (
    <ThemeProvider mode={mode} transitioning={transitionActive}>
      <RuntimeScreenMount screen={screen} onRelay={(intent) => void relay(intent)} />
      {loading ? <div style={{ padding: "8px 16px", opacity: 0.7 }}>Relaying...</div> : null}
      {error ? (
        <div role="alert" style={{ padding: "8px 16px", color: "#dc2626" }}>
          {error}
        </div>
      ) : null}
      <ModeTransitionOverlay
        active={transitionActive}
        direction="need-to-action"
        progress={transitionProgress}
        stageText={transitionStageText}
      />
    </ThemeProvider>
  );
}
