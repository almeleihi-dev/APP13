import { useEffect } from "react";
import {
  ThemeProvider,
  ModeTransitionOverlay,
  RuntimeScreenMount,
  AnActError,
  AnActAppShell,
  AnActBrandLoading,
} from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface RuntimePageProps {
  bootstrapping?: boolean;
}

function modeLabel(mode: string): string {
  if (mode === "action") {
    return "Action Mode";
  }
  if (mode === "transition") {
    return "Transition";
  }
  return "Need Mode";
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
    logout,
    transitionActive,
    transitionProgress,
    transitionStageText,
  } = useRuntime();

  useEffect(() => {
    if (bootstrapping) {
      void reload();
    }
  }, [bootstrapping, reload]);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", mode === "action" ? AN_ACT_BRAND.themeColorAction : AN_ACT_BRAND.themeColorNeed);
    }
  }, [mode]);

  const statusBanner =
    (loading || relaying) && !transitionActive ? (
      <div className="an-act-inline-status" role="status" data-compact="true">
        {relaying ? "Relaying action..." : "Loading experience..."}
      </div>
    ) : null;

  const logoutFooter = (
    <button type="button" className="an-act-button an-act-button--ghost" onClick={() => void logout()}>
      Sign out
    </button>
  );

  if (bootstrapping && !screen && loading) {
    return (
      <ThemeProvider mode="need">
        <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel="Need Mode" footer={logoutFooter}>
          <AnActBrandLoading stageText="Loading Need Experience..." />
        </AnActAppShell>
      </ThemeProvider>
    );
  }

  if (offline) {
    return (
      <ThemeProvider mode="need">
        <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel="Need Mode" footer={logoutFooter}>
          <div className="an-act-screen an-act-error-panel">
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
            <button type="button" className="an-act-button an-act-button--secondary" onClick={() => void reload()}>
              Try again
            </button>
          </div>
        </AnActAppShell>
      </ThemeProvider>
    );
  }

  if (!screen) {
    return (
      <ThemeProvider mode="need">
        <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel="Need Mode" footer={logoutFooter}>
          <AnActBrandLoading stageText="Preparing..." />
        </AnActAppShell>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider mode={mode} transitioning={transitionActive}>
      <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel={modeLabel(mode)} footer={logoutFooter}>
        {statusBanner}
        {error ? (
          <div className="an-act-screen an-act-error-panel">
            <AnActError
              node={{
                key: "runtime-error",
                element: "an-act-error",
                props: { title: error.title, detail: error.detail, code: error.code },
              }}
            />
            <button type="button" className="an-act-button an-act-button--ghost" onClick={clearError}>
              Dismiss
            </button>
          </div>
        ) : null}
        <RuntimeScreenMount screen={screen} onRelay={(intent) => void relay(intent)} />
      </AnActAppShell>
      <ModeTransitionOverlay
        active={transitionActive}
        direction="need-to-action"
        progress={transitionProgress}
        stageText={transitionStageText}
      />
    </ThemeProvider>
  );
}
