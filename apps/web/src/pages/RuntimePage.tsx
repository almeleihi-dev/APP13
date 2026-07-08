import { useEffect, useMemo, useRef, useState } from "react";
import {
  ThemeProvider,
  ModeTransitionOverlay,
  RuntimeScreenMount,
  AnActAppShell,
  AnActBrandLoading,
  PremiumButton,
} from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";
import { AiAssistantPanel } from "../components/AiAssistantPanel.js";
import { ExecutiveAiPanel } from "../components/ExecutiveAiPanel.js";
import { MarketplaceActionsBar } from "../components/MarketplaceActionsBar.js";
import { PresentationError } from "../components/PresentationError.js";
import { NeedMvpFlow } from "../components/need-mvp/NeedMvpFlow.js";
import { MarketplaceBrowseHints } from "../components/need-mvp/NeedSearchPresentation.js";
import {
  injectNeedPresentationProps,
  useNeedPresentation,
} from "../components/need-mvp/useNeedPresentation.js";
import { PlatformIdentityNavChip } from "../passport/PlatformIdentityNavChip.js";
import { PlatformIdentityRuntimeBar } from "../passport/PlatformIdentityRuntimeBar.js";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { PUBLIC_BETA_LABEL, PUBLIC_BETA_MODE } from "../lib/public-beta.js";
import { RUNTIME_DEBUG_ENABLED, logRuntimeTrace } from "../lib/runtime-debug.js";
import { recordPilotError, recordPilotOffline } from "../lib/pilot-instrumentation.js";

export interface RuntimePageProps {
  bootstrapping?: boolean;
  onExitDemo?: () => void;
}

function modeLabel(mode: string): string {
  if (mode === "action") {
    return "Action Mode";
  }
  if (mode === "transition") {
    return "Transition";
  }
  return "Action Marketplace";
}

function RuntimeDebugPanel(props: {
  screenId: string | null;
  currentScreen: string | null;
  mode: string;
  transitionActive: boolean;
  relaying: boolean;
  showTransitionOverlay: boolean;
  loading?: boolean;
  bootstrapping?: boolean;
  lastMutation?: { seq: number; caller: string; screenId: string | null; current_screen: string | null } | null;
}) {
  const {
    screenId,
    currentScreen,
    mode,
    transitionActive,
    relaying,
    showTransitionOverlay,
    loading,
    bootstrapping,
    lastMutation,
  } = props;
  return (
    <aside
      data-testid="runtime-debug-panel"
      aria-label="Runtime debug panel"
      style={{
        position: "fixed",
        right: 8,
        bottom: 8,
        zIndex: 99999,
        maxWidth: 320,
        padding: "10px 12px",
        borderRadius: 8,
        background: "rgba(15, 23, 42, 0.92)",
        color: "#f8fafc",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.45,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Runtime Debug (dev only)</div>
      <div>screenId: {screenId ?? "null"}</div>
      <div>current_screen: {currentScreen ?? "null"}</div>
      <div>mode: {mode}</div>
      <div>transitionActive: {String(transitionActive)}</div>
      <div>relaying: {String(relaying)}</div>
      <div>showTransitionOverlay: {String(showTransitionOverlay)}</div>
      <div>loading: {String(Boolean(loading))}</div>
      <div>bootstrapping: {String(Boolean(bootstrapping))}</div>
      <div style={{ marginTop: 6, borderTop: "1px solid #475569", paddingTop: 6 }}>
        lastWriter: {lastMutation?.caller ?? "none"}
      </div>
      <div>lastWriter screenId: {lastMutation?.screenId ?? "null"}</div>
      <div>lastWriter seq: {lastMutation?.seq ?? "-"}</div>
    </aside>
  );
}

export function RuntimePage({ bootstrapping = false, onExitDemo }: RuntimePageProps) {
  const {
    screen,
    mode,
    envelope,
    experienceKind,
    client,
    loading,
    relaying,
    error,
    offline,
    reload,
    reloadNeedExperience,
    relay,
    clearError,
    logout,
    declineRequest,
    cancelAction,
    presenterMode,
    transitionActive,
    transitionProgress,
    transitionStageText,
    lastScreenMutation,
  } = useRuntime();

  const platformBootRef = useRef(false);
  const [offlineRetryHint, setOfflineRetryHint] = useState<string | null>(null);
  const [offlineRetrying, setOfflineRetrying] = useState(false);

  const identity = usePersonalIdentity();

  const {
    stage,
    detail,
    trackingId,
    activeContract,
    searchLoading,
    searchKeyword,
    submitting,
    handleRelay,
    requestService,
    confirmRequest,
    returnHome,
    goBack,
    viewTracking,
    advanceProgress,
    completeRequest,
    acceptContract,
    attachEvidence,
    confirmEvidence,
  } = useNeedPresentation({ relay, reloadNeedExperience, identity });
  const shellIdentity = identity ? <PlatformIdentityNavChip identity={identity} /> : undefined;

  useEffect(() => {
    if (platformBootRef.current) {
      return;
    }
    platformBootRef.current = true;
    void reloadNeedExperience();
  }, [reloadNeedExperience]);

  const showTransitionOverlay = transitionActive && relaying;
  const showMvpFlow = stage !== "browse" && experienceKind === "need";
  const shellMode = showMvpFlow ? "need" : mode;

  useEffect(() => {
    logRuntimeTrace("RuntimePage render state", {
      screenId: screen?.screenId ?? null,
      current_screen: envelope?.current_screen ?? null,
      mode,
      experienceKind,
      stage,
      showMvpFlow,
      transitionActive,
      relaying,
      showTransitionOverlay,
      loading,
      bootstrapping,
    });
  }, [
    bootstrapping,
    envelope?.current_screen,
    experienceKind,
    loading,
    mode,
    relaying,
    screen?.screenId,
    showMvpFlow,
    showTransitionOverlay,
    stage,
    transitionActive,
  ]);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        "content",
        shellMode === "action" ? AN_ACT_BRAND.themeColorAction : AN_ACT_BRAND.themeColorNeed
      );
    }
  }, [shellMode]);

  const presentedScreen = useMemo(
    () => (screen ? injectNeedPresentationProps(screen, { searchLoading, searchKeyword }) : null),
    [screen, searchLoading, searchKeyword]
  );

  const statusBanner =
    (loading || relaying) && !searchLoading && !transitionActive ? (
      <div className="an-act-inline-status" role="status" data-compact="true">
        {relaying ? "Relaying action..." : "Loading experience..."}
      </div>
    ) : null;

  const logoutFooter = (
    <>
      {onExitDemo ? (
        <PremiumButton variant="ghost" onClick={onExitDemo} className="an-act-runtime-exit-home an-act-emotion-return-home">
          Return to Personal Home
        </PremiumButton>
      ) : null}
      <PremiumButton variant="ghost" onClick={() => void logout()}>
        Sign out
      </PremiumButton>
    </>
  );

  const debugPanel =
    RUNTIME_DEBUG_ENABLED ? (
      <RuntimeDebugPanel
        screenId={screen?.screenId ?? null}
        currentScreen={envelope?.current_screen ?? null}
        mode={mode}
        transitionActive={transitionActive}
        relaying={relaying}
        showTransitionOverlay={showTransitionOverlay}
        loading={loading}
        bootstrapping={bootstrapping}
        lastMutation={lastScreenMutation}
      />
    ) : null;

  if (bootstrapping && !screen && loading) {
    return (
      <ThemeProvider mode="need">
        {debugPanel}
        <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel="Need Mode" footer={logoutFooter} identity={shellIdentity}>
          <AnActBrandLoading stageText="Loading Need Experience..." />
        </AnActAppShell>
      </ThemeProvider>
    );
  }

  if (offline) {
    async function handleOfflineRetry() {
      setOfflineRetryHint(null);
      if (!navigator.onLine) {
        setOfflineRetryHint("Still offline — check your connection and try again.");
        recordPilotOffline("retry_failed");
        return;
      }
      setOfflineRetrying(true);
      try {
        await reload();
      } finally {
        setOfflineRetrying(false);
      }
    }

    return (
      <ThemeProvider mode="need">
        {debugPanel}
        <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel="Need Mode" footer={logoutFooter} identity={shellIdentity}>
          <PresentationError
            title="You're offline"
            detail="AN ACT needs a network connection to load your experience. Reconnect, then try again."
            code="OFFLINE"
            onRetry={() => void handleOfflineRetry()}
            retryLabel={offlineRetrying ? "Reconnecting..." : "Try again"}
            retryDisabled={offlineRetrying}
          />
          {offlineRetryHint ? (
            <p role="status" className="an-act-inline-status" data-compact="true">
              {offlineRetryHint}
            </p>
          ) : null}
        </AnActAppShell>
      </ThemeProvider>
    );
  }

  if (!screen || !presentedScreen) {
    if (loading || bootstrapping) {
      return (
        <ThemeProvider mode="need">
          {debugPanel}
          <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel="Need Mode" footer={logoutFooter} identity={shellIdentity}>
            <AnActBrandLoading stageText="Preparing your experience..." />
          </AnActAppShell>
        </ThemeProvider>
      );
    }
    return (
      <ThemeProvider mode="need">
        {debugPanel}
        <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel="Need Mode" footer={logoutFooter} identity={shellIdentity}>
          <PresentationError
            title="Experience unavailable"
            detail="We couldn't load your Need experience. This is usually temporary."
            onRetry={() => void reloadNeedExperience()}
            onDismiss={() => void reloadNeedExperience()}
            dismissLabel="Reload"
          />
        </AnActAppShell>
      </ThemeProvider>
    );
  }

  const aiKind =
    screen.screenId === "contract-preview"
      ? "contract"
      : shellMode === "action" || experienceKindFromScreen(screen.screenId) === "action"
        ? "action"
        : "need";

  return (
    <ThemeProvider mode={shellMode} transitioning={showTransitionOverlay}>
      {debugPanel}
      <AnActAppShell logoUrl={AN_ACT_BRAND.logoUrl} modeLabel={modeLabel(shellMode)} footer={logoutFooter} identity={shellIdentity}>
        {identity ? <PlatformIdentityRuntimeBar identity={identity} /> : null}
        {statusBanner}
        <MarketplaceActionsBar
          screenId={screen.screenId}
          relaying={relaying}
          onDecline={declineRequest}
          onCancel={cancelAction}
        />
        {!presenterMode ? (
          <>
            <AiAssistantPanel client={client} kind={aiKind} collapsed />
            {!PUBLIC_BETA_MODE ? <ExecutiveAiPanel client={client} /> : null}
          </>
        ) : null}
        {error ? (
          <PresentationError
            title={error.title}
            detail={error.detail}
            code={error.code}
            onRetry={() => {
              recordPilotError({
                category: "runtime",
                title: error.title,
                code: error.code,
                retried: true,
              });
              clearError();
              void reloadNeedExperience();
            }}
            onDismiss={clearError}
          />
        ) : null}
        {showMvpFlow ? (
          <NeedMvpFlow
            stage={stage}
            detail={detail}
            trackingId={trackingId}
            activeContract={activeContract}
            identity={identity}
            submitting={submitting}
            onBack={goBack}
            onRequestService={requestService}
            onConfirmRequest={() => void confirmRequest()}
            onViewTracking={viewTracking}
            onReturnHome={() => void returnHome()}
            onAdvanceProgress={advanceProgress}
            onCompleteRequest={completeRequest}
            onAcceptContract={acceptContract}
            onAttachEvidence={attachEvidence}
            onConfirmEvidence={confirmEvidence}
          />
        ) : (
          <div className="an-act-runtime-shell an-act-runtime-shell--p12">
            {stage === "browse" && !searchKeyword && experienceKind === "need" ? (
              <MarketplaceBrowseHints
                onExampleSearch={(keyword) =>
                  void handleRelay({ actionId: "need.search", body: { keyword } })
                }
                onSelectPublished={(snapshot) =>
                  void handleRelay({
                    actionId: "need.view-opportunity",
                    body: { opportunity_id: snapshot.opportunityId, snapshot },
                  })
                }
              />
            ) : null}
            <div className="an-act-runtime-stage an-act-screen--p12" data-screen-id={presentedScreen.screenId}>
              <RuntimeScreenMount screen={presentedScreen} onRelay={(intent) => void handleRelay(intent)} />
            </div>
          </div>
        )}
      </AnActAppShell>
      <ModeTransitionOverlay
        active={showTransitionOverlay}
        direction="need-to-action"
        progress={transitionProgress}
        stageText={transitionStageText}
      />
    </ThemeProvider>
  );
}

function experienceKindFromScreen(screenId: string): "need" | "action" {
  if (
    screenId.startsWith("action") ||
    screenId === "contract-preview" ||
    screenId === "active-action" ||
    screenId === "progress-screen" ||
    screenId === "completion-screen"
  ) {
    return "action";
  }
  return "need";
}
