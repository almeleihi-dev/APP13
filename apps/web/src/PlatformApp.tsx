import { useState } from "react";
import { RuntimeProvider, useRuntime } from "./providers/RuntimeProvider.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { RegisterProviderPage } from "./pages/RegisterProviderPage.js";
import { RegistrationSuccessPage } from "./pages/RegistrationSuccessPage.js";
import { ProviderOnboardingPage } from "./pages/ProviderOnboardingPage.js";
import { ProviderProfilePage } from "./pages/ProviderProfilePage.js";
import { RuntimePage } from "./pages/RuntimePage.js";
import { PartnerLandingPage, type PartnerExperienceChoice } from "./pages/PartnerLandingPage.js";
import { ProfileStartPage } from "./pages/ProfileStartPage.js";
import { PersonalPassportDashboardPage } from "./pages/PersonalPassportDashboardPage.js";
import { PersonalHomeDashboardPage } from "./pages/PersonalHomeDashboardPage.js";
import { ActionCreatorPage } from "./pages/ActionCreatorPage.js";
import { BuildProjectPage } from "./pages/BuildProjectPage.js";
import { EconomyDashboardPage } from "./pages/EconomyDashboardPage.js";
import { ActionIntelligencePage } from "./pages/ActionIntelligencePage.js";
import { hasPersonalPassport, shouldStartPassportJourney } from "./passport/personal-passport-persistence.js";
import { DemoPresenterPage } from "./pages/DemoPresenterPage.js";
import { ExecutivePresentationPage } from "./pages/ExecutivePresentationPage.js";
import { PartnerOverviewPage } from "./pages/PartnerOverviewPage.js";
import { PilotInstrumentationPage } from "./pages/PilotInstrumentationPage.js";
import { FounderConsolePage } from "./pages/FounderConsolePage.js";
import { PilotManagementPage } from "./pages/PilotManagementPage.js";
import { GrowthFoundationPage } from "./pages/GrowthFoundationPage.js";
import { ExecutiveOperationsPage } from "./pages/ExecutiveOperationsPage.js";
import { EnterpriseReadinessPage } from "./pages/EnterpriseReadinessPage.js";
import { GovernmentReadinessPage } from "./pages/GovernmentReadinessPage.js";
import { IntegrationReadinessPage } from "./pages/IntegrationReadinessPage.js";
import { EnterpriseEvaluationPage } from "./pages/EnterpriseEvaluationPage.js";
import { ProductionOperationsPage } from "./pages/ProductionOperationsPage.js";
import { ReliabilityRecoveryPage } from "./pages/ReliabilityRecoveryPage.js";
import { LaunchReadinessPage } from "./pages/LaunchReadinessPage.js";
import { AnActV1CertificationPage } from "./pages/AnActV1CertificationPage.js";
import { LiveMarketplaceOperationsPage } from "./pages/LiveMarketplaceOperationsPage.js";
import { OperationalDecisionCenterPage } from "./pages/OperationalDecisionCenterPage.js";
import { ExecutiveIntelligenceCenterPage } from "./pages/ExecutiveIntelligenceCenterPage.js";
import { AnActOperatingSystemV1Page } from "./pages/AnActOperatingSystemV1Page.js";
import { AnActV1FinalExecutiveReviewPage } from "./pages/AnActV1FinalExecutiveReviewPage.js";
import {
  endPilotTiming,
  recordPilotMilestone,
  startPilotTiming,
} from "./lib/pilot-instrumentation.js";

type AuthView =
  | "login"
  | "register"
  | "register-provider"
  | "register-success"
  | "provider-onboarding"
  | "provider-profile"
  | "complete";

type AppExperience =
  | "passport-setup"
  | "passport-dashboard"
  | "personal-home"
  | "action-creator"
  | "build-project"
  | "economy-dashboard"
  | "action-intelligence"
  | "landing"
  | PartnerExperienceChoice;

function resolveInitialExperience(): AppExperience {
  if (shouldStartPassportJourney()) return "passport-setup";
  if (hasPersonalPassport()) return "personal-home";
  return "landing";
}

function AppExperienceRouter() {
  const { demoLogin, finishRegistration, finishProviderSetup, client, sessionExpired, screen, reloadNeedExperience, setPresenterMode } =
    useRuntime();
  const [experience, setExperience] = useState<AppExperience>(resolveInitialExperience);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [entering, setEntering] = useState(false);
  const hasToken = Boolean(client.auth.getAccessToken()) && !sessionExpired;

  function goHome() {
    setExperience(hasPersonalPassport() ? "personal-home" : "landing");
  }

  async function enterExperience(choice: PartnerExperienceChoice) {
    if (choice === "partner") {
      setEntering(false);
      setExperience("partner");
      return;
    }

    if (choice === "pilot") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("pilot");
      return;
    }

    if (choice === "founder") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("founder");
      return;
    }

    if (choice === "management") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("management");
      return;
    }

    if (choice === "growth") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("growth");
      return;
    }

    if (choice === "operations") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("operations");
      return;
    }

    if (choice === "enterprise-readiness") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("enterprise-readiness");
      return;
    }

    if (choice === "government-readiness") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("government-readiness");
      return;
    }

    if (choice === "integration-readiness") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("integration-readiness");
      return;
    }

    if (choice === "enterprise-evaluation") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("enterprise-evaluation");
      return;
    }

    if (choice === "production-operations") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("production-operations");
      return;
    }

    if (choice === "reliability-recovery") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("reliability-recovery");
      return;
    }

    if (choice === "launch-readiness") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("launch-readiness");
      return;
    }

    if (choice === "an-act-v1-certification") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("an-act-v1-certification");
      return;
    }

    if (choice === "live-marketplace-operations") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("live-marketplace-operations");
      return;
    }

    if (choice === "operational-decision-center") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("operational-decision-center");
      return;
    }

    if (choice === "executive-intelligence-center") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("executive-intelligence-center");
      return;
    }

    if (choice === "an-act-v1-final-executive-review") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("an-act-v1-final-executive-review");
      return;
    }

    if (choice === "an-act-operating-system-v1") {
      setEntering(false);
      recordPilotMilestone("landing", "completed");
      setExperience("an-act-operating-system-v1");
      return;
    }

    recordPilotMilestone("landing", "completed");
    startPilotTiming("landing_to_auth");

    setEntering(true);
    setExperience(choice);

    try {
      recordPilotMilestone("auth", "started");
      const ok = await demoLogin();
      if (!ok) {
        setAuthView("login");
        return;
      }
      endPilotTiming("landing_to_auth");
      if (choice === "platform") {
        await reloadNeedExperience();
      }
    } finally {
      setEntering(false);
    }
  }

  if (entering) {
    return (
      <div className="an-act-login-shell an-act-living-entry">
        <p role="status">Opening your Action Marketplace…</p>
        <ol className="an-act-living-entry__steps" aria-label="Marketplace journey">
          <li className="an-act-living-entry__step--active">Search</li>
          <li>Compare</li>
          <li>Request</li>
        </ol>
      </div>
    );
  }

  if (experience === "passport-setup") {
    return (
      <ProfileStartPage
        onComplete={() => setExperience("personal-home")}
        onCancel={hasPersonalPassport() ? () => setExperience("personal-home") : undefined}
      />
    );
  }

  if (experience === "passport-dashboard") {
    return (
      <PersonalPassportDashboardPage
        onEnterPlatform={() => setExperience("personal-home")}
        onBack={() => setExperience("personal-home")}
      />
    );
  }

  if (experience === "personal-home") {
    return (
      <PersonalHomeDashboardPage
        onFindAction={() => void enterExperience("platform")}
        onOfferAction={() => setExperience("action-creator")}
        onBuildProject={() => {
          setActiveProjectId(null);
          setExperience("build-project");
        }}
        onOpenProject={(projectId) => {
          setActiveProjectId(projectId);
          setExperience("build-project");
        }}
        onViewEconomy={() => setExperience("economy-dashboard")}
        onViewActionIntelligence={() => setExperience("action-intelligence")}
        onEditPassport={() => setExperience("passport-setup")}
        onViewMarketplace={() => void enterExperience("platform")}
        onViewPassport={() => setExperience("passport-dashboard")}
        onEnterpriseLanding={() => setExperience("landing")}
      />
    );
  }

  if (experience === "build-project") {
    return (
      <BuildProjectPage
        initialProjectId={activeProjectId}
        onComplete={() => setExperience("personal-home")}
        onCancel={() => setExperience("personal-home")}
      />
    );
  }

  if (experience === "economy-dashboard") {
    return <EconomyDashboardPage onBack={() => setExperience("personal-home")} />;
  }

  if (experience === "action-intelligence") {
    return <ActionIntelligencePage onBack={() => setExperience("personal-home")} />;
  }

  if (experience === "action-creator") {
    return (
      <ActionCreatorPage
        onComplete={() => setExperience("personal-home")}
        onCancel={() => setExperience("personal-home")}
        onViewMarketplace={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "landing") {
    return (
      <PartnerLandingPage
        onSelect={(choice) => {
          void enterExperience(choice);
        }}
      />
    );
  }

  if (experience === "demo" && hasToken) {
    return (
      <DemoPresenterPage
        onExit={() => goHome()}
        onOpenLivePlatform={() => {
          setPresenterMode(true);
          void enterExperience("platform");
        }}
      />
    );
  }

  if (experience === "executive" && hasToken) {
    return <ExecutivePresentationPage onExit={() => goHome()} />;
  }

  if (experience === "partner") {
    return (
      <PartnerOverviewPage
        onExit={() => goHome()}
        onEnterPlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "pilot") {
    return (
      <PilotInstrumentationPage
        onExit={() => goHome()}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "founder") {
    return (
      <FounderConsolePage
        onExit={() => goHome()}
        onOpenPilotDashboard={() => setExperience("pilot")}
        onOpenPilotManagement={() => setExperience("management")}
        onOpenGrowthFoundation={() => setExperience("growth")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "management") {
    return (
      <PilotManagementPage
        onExit={() => goHome()}
        onOpenFounderConsole={() => setExperience("founder")}
        onOpenPilotDashboard={() => setExperience("pilot")}
        onOpenGrowthFoundation={() => setExperience("growth")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "growth") {
    return (
      <GrowthFoundationPage
        onExit={() => goHome()}
        onOpenFounderConsole={() => setExperience("founder")}
        onOpenPilotManagement={() => setExperience("management")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "operations") {
    return (
      <ExecutiveOperationsPage
        onExit={() => goHome()}
        onOpenFounderConsole={() => setExperience("founder")}
        onOpenPilotManagement={() => setExperience("management")}
        onOpenGrowthFoundation={() => setExperience("growth")}
        onOpenEnterpriseReadiness={() => setExperience("enterprise-readiness")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenProductionOperations={() => setExperience("production-operations")}
        onOpenPilotDashboard={() => setExperience("pilot")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "enterprise-readiness") {
    return (
      <EnterpriseReadinessPage
        onExit={() => goHome()}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenPilotManagement={() => setExperience("management")}
        onOpenGrowthFoundation={() => setExperience("growth")}
        onOpenGovernmentReadiness={() => setExperience("government-readiness")}
        onOpenIntegrationReadiness={() => setExperience("integration-readiness")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "government-readiness") {
    return (
      <GovernmentReadinessPage
        onExit={() => goHome()}
        onOpenEnterpriseReadiness={() => setExperience("enterprise-readiness")}
        onOpenIntegrationReadiness={() => setExperience("integration-readiness")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenPilotManagement={() => setExperience("management")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "integration-readiness") {
    return (
      <IntegrationReadinessPage
        onExit={() => goHome()}
        onOpenEnterpriseReadiness={() => setExperience("enterprise-readiness")}
        onOpenGovernmentReadiness={() => setExperience("government-readiness")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenPilotManagement={() => setExperience("management")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "enterprise-evaluation") {
    return (
      <EnterpriseEvaluationPage
        onExit={() => goHome()}
        onOpenEnterpriseReadiness={() => setExperience("enterprise-readiness")}
        onOpenGovernmentReadiness={() => setExperience("government-readiness")}
        onOpenIntegrationReadiness={() => setExperience("integration-readiness")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenProductionOperations={() => setExperience("production-operations")}
        onOpenLaunchReadiness={() => setExperience("launch-readiness")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "production-operations") {
    return (
      <ProductionOperationsPage
        onExit={() => goHome()}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenReliabilityRecovery={() => setExperience("reliability-recovery")}
        onOpenLaunchReadiness={() => setExperience("launch-readiness")}
        onOpenPilotManagement={() => setExperience("management")}
        onOpenPilotDashboard={() => setExperience("pilot")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "reliability-recovery") {
    return (
      <ReliabilityRecoveryPage
        onExit={() => goHome()}
        onOpenProductionOperations={() => setExperience("production-operations")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenLaunchReadiness={() => setExperience("launch-readiness")}
        onOpenPilotManagement={() => setExperience("management")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "launch-readiness") {
    return (
      <LaunchReadinessPage
        onExit={() => goHome()}
        onOpenProductionOperations={() => setExperience("production-operations")}
        onOpenReliabilityRecovery={() => setExperience("reliability-recovery")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenAnActV1Certification={() => setExperience("an-act-v1-certification")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "an-act-v1-certification") {
    return (
      <AnActV1CertificationPage
        onExit={() => goHome()}
        onOpenLaunchReadiness={() => setExperience("launch-readiness")}
        onOpenProductionOperations={() => setExperience("production-operations")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenLiveMarketplaceOperations={() => setExperience("live-marketplace-operations")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "live-marketplace-operations") {
    return (
      <LiveMarketplaceOperationsPage
        onExit={() => goHome()}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenProductionOperations={() => setExperience("production-operations")}
        onOpenGrowthFoundation={() => setExperience("growth")}
        onOpenFounderConsole={() => setExperience("founder")}
        onOpenAnActV1Certification={() => setExperience("an-act-v1-certification")}
        onOpenOperationalDecisionCenter={() => setExperience("operational-decision-center")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "operational-decision-center") {
    return (
      <OperationalDecisionCenterPage
        onExit={() => goHome()}
        onOpenLiveMarketplaceOperations={() => setExperience("live-marketplace-operations")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenLaunchReadiness={() => setExperience("launch-readiness")}
        onOpenProductionOperations={() => setExperience("production-operations")}
        onOpenExecutiveIntelligenceCenter={() => setExperience("executive-intelligence-center")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "executive-intelligence-center") {
    return (
      <ExecutiveIntelligenceCenterPage
        onExit={() => goHome()}
        onOpenOperationalDecisionCenter={() => setExperience("operational-decision-center")}
        onOpenLiveMarketplaceOperations={() => setExperience("live-marketplace-operations")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenLaunchReadiness={() => setExperience("launch-readiness")}
        onOpenAnActOperatingSystemV1={() => setExperience("an-act-operating-system-v1")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "an-act-v1-final-executive-review") {
    return (
      <AnActV1FinalExecutiveReviewPage
        onExit={() => goHome()}
        onOpenOperatingSystem={() => setExperience("an-act-operating-system-v1")}
        onOpenCertification={() => setExperience("an-act-v1-certification")}
        onOpenLaunchReadiness={() => setExperience("launch-readiness")}
        onOpenExecutiveIntelligence={() => setExperience("executive-intelligence-center")}
        onOpenEnterpriseEvaluation={() => setExperience("enterprise-evaluation")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
      />
    );
  }

  if (experience === "an-act-operating-system-v1") {
    return (
      <AnActOperatingSystemV1Page
        onExit={() => goHome()}
        onOpenExecutiveIntelligenceCenter={() => setExperience("executive-intelligence-center")}
        onOpenOperationalDecisionCenter={() => setExperience("operational-decision-center")}
        onOpenLiveMarketplaceOperations={() => setExperience("live-marketplace-operations")}
        onOpenLaunchReadiness={() => setExperience("launch-readiness")}
        onOpenExecutiveOperations={() => setExperience("operations")}
        onOpenFounderConsole={() => setExperience("founder")}
        onOpenPartnerPackage={() => setExperience("partner")}
        onOpenLivePlatform={() => void enterExperience("platform")}
        onOpenFinalExecutiveReview={() => setExperience("an-act-v1-final-executive-review")}
      />
    );
  }

  if (authView === "register-success" && hasToken) {
    return (
      <RegistrationSuccessPage
        onContinue={() => {
          setAuthView("complete");
          setExperience(hasPersonalPassport() ? "personal-home" : "platform");
          void finishRegistration();
        }}
      />
    );
  }

  if (experience === "platform" && hasToken && authView !== "provider-onboarding" && authView !== "provider-profile") {
    return (
      <RuntimePage
        bootstrapping={!screen}
        onExitDemo={() => {
          recordPilotMilestone("need_home", "abandoned");
          goHome();
        }}
      />
    );
  }

  if (!hasToken) {
    if (authView === "register") {
      return (
        <RegisterPage
          onLogin={() => setAuthView("login")}
          onSuccess={() => setAuthView("register-success")}
          onBackToLanding={() => {
            recordPilotMilestone("auth", "abandoned");
            goHome();
          }}
        />
      );
    }
    if (authView === "register-provider") {
      return (
        <RegisterProviderPage
          onLogin={() => setAuthView("login")}
          onSuccess={() => setAuthView("provider-onboarding")}
          onBackToLanding={() => {
            recordPilotMilestone("auth", "abandoned");
            goHome();
          }}
        />
      );
    }
    return (
      <LoginPage
        onRegister={() => setAuthView("register")}
        onRegisterProvider={() => setAuthView("register-provider")}
        onBackToLanding={() => {
          recordPilotMilestone("auth", "abandoned");
          goHome();
        }}
      />
    );
  }

  if (authView === "provider-onboarding" && hasToken) {
    return (
      <ProviderOnboardingPage
        onComplete={() => {
          setAuthView("provider-profile");
        }}
      />
    );
  }

  if (authView === "provider-profile" && hasToken) {
    return (
      <ProviderProfilePage
        onComplete={() => {
          setAuthView("complete");
          setExperience("platform");
          void finishProviderSetup();
        }}
      />
    );
  }

  if (!screen) {
    return <RuntimePage bootstrapping />;
  }

  return <RuntimePage onExitDemo={() => goHome()} />;
}

export function PlatformApp() {
  return (
    <RuntimeProvider>
      <AppExperienceRouter />
    </RuntimeProvider>
  );
}
