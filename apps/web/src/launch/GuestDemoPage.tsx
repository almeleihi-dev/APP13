import { PremiumButton, PremiumCard, PremiumStat } from "@an-act/runtime-ui/react";
import { LaunchScene } from "./LaunchScene.js";
import { GuestModeBanner } from "../components/guest/GuestModeBanner.js";
import {
  GUEST_DEMO_ECONOMY,
  GUEST_DEMO_LIVE_FRAME,
  GUEST_DEMO_PASSPORT,
  GUEST_DEMO_PROJECT,
  GUEST_DEMO_TEAM,
} from "../guest/guest-demo-data.js";
import { enableGuestMode } from "../guest/guest-session.js";
import { navigate } from "./navigation.js";

function DemoLabel() {
  return <span className="an-act-guest-demo__label">Guest Preview · Demo Data</span>;
}

export function GuestDemoPage() {
  return (
    <LaunchScene className="an-act-guest-demo an-act-excellence-s1">
      <div className="an-act-guest-demo__shell">
        <GuestModeBanner />
        <header className="an-act-guest-demo__header">
          <p className="launch-v1__eyebrow">Guest Demo Access</p>
          <h1>Explore an act before registration</h1>
          <p>All surfaces below use demo data — trust and contracts require a Professional Passport.</p>
        </header>

        <section className="an-act-guest-demo__section">
          <DemoLabel />
          <h2>Sample Professional Passport</h2>
          <PremiumCard className="an-act-guest-demo__card">
            <p>
              <strong>{GUEST_DEMO_PASSPORT.fullName}</strong> · {GUEST_DEMO_PASSPORT.professionalTitle}
            </p>
            <div className="an-act-guest-demo__stats">
              <PremiumStat value={GUEST_DEMO_PASSPORT.liveFrameTier} label="Live Frame tier" />
              <PremiumStat value={GUEST_DEMO_PASSPORT.trustScore} label="Trust score" />
              <PremiumStat value={String(GUEST_DEMO_PASSPORT.completedActions)} label="Completed acts" />
            </div>
            <p>{GUEST_DEMO_PASSPORT.certifications.join(" · ")}</p>
          </PremiumCard>
        </section>

        <section className="an-act-guest-demo__section">
          <DemoLabel />
          <h2>Sample Live Frame</h2>
          <PremiumCard className="an-act-guest-demo__card">
            <p>
              {GUEST_DEMO_LIVE_FRAME.tier} tier · {GUEST_DEMO_LIVE_FRAME.health} ·{" "}
              {GUEST_DEMO_LIVE_FRAME.monitoredActions} monitored actions
            </p>
            <p>{GUEST_DEMO_LIVE_FRAME.lastSignal}</p>
          </PremiumCard>
        </section>

        <section className="an-act-guest-demo__section">
          <DemoLabel />
          <h2>Sample Team Passport</h2>
          <PremiumCard className="an-act-guest-demo__card">
            <p>
              <strong>{GUEST_DEMO_TEAM.name}</strong> · {GUEST_DEMO_TEAM.liveFrameTier} Team Live Frame
            </p>
            <p>
              Trust {GUEST_DEMO_TEAM.trustScore}% · {GUEST_DEMO_TEAM.members} members ·{" "}
              {GUEST_DEMO_TEAM.completedActions} completed actions
            </p>
          </PremiumCard>
        </section>

        <section className="an-act-guest-demo__section">
          <DemoLabel />
          <h2>Sample Project Breakdown</h2>
          <PremiumCard className="an-act-guest-demo__card">
            <p>
              <strong>{GUEST_DEMO_PROJECT.name}</strong> · {GUEST_DEMO_PROJECT.phases} phases ·{" "}
              {GUEST_DEMO_PROJECT.actions} actions
            </p>
            <p>
              Active phase: {GUEST_DEMO_PROJECT.activePhase} · {GUEST_DEMO_PROJECT.progressPercent}% progress
            </p>
          </PremiumCard>
        </section>

        <section className="an-act-guest-demo__section">
          <DemoLabel />
          <h2>Sample Contract Economy Pulse</h2>
          <PremiumCard className="an-act-guest-demo__card">
            <div className="an-act-guest-demo__stats">
              <PremiumStat value={String(GUEST_DEMO_ECONOMY.contractsGenerated)} label="Contracts" />
              <PremiumStat value={GUEST_DEMO_ECONOMY.grossContractValue} label="GCV" />
              <PremiumStat value={GUEST_DEMO_ECONOMY.successRate} label="Success rate" />
            </div>
            <p>Trending: {GUEST_DEMO_ECONOMY.trendingCategory}</p>
          </PremiumCard>
        </section>

        <div className="an-act-guest-demo__nav">
          <PremiumButton
            variant="primary"
            onClick={() => {
              enableGuestMode();
              navigate("/start");
            }}
          >
            Try your own goal or profession
          </PremiumButton>
          <PremiumButton variant="ghost" onClick={() => navigate("/guest")}>
            ← Guest home
          </PremiumButton>
        </div>
      </div>
    </LaunchScene>
  );
}
