import { useState } from "react";
import { AnActSplash } from "@an-act/runtime-ui/react";
import { RuntimeProvider, useRuntime } from "./providers/RuntimeProvider.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { RegisterProviderPage } from "./pages/RegisterProviderPage.js";
import { RegistrationSuccessPage } from "./pages/RegistrationSuccessPage.js";
import { ProviderOnboardingPage } from "./pages/ProviderOnboardingPage.js";
import { ProviderProfilePage } from "./pages/ProviderProfilePage.js";
import { RuntimePage } from "./pages/RuntimePage.js";
import { AN_ACT_BRAND } from "./brand/config.js";

type AuthView =
  | "login"
  | "register"
  | "register-provider"
  | "register-success"
  | "provider-onboarding"
  | "provider-profile";

function RuntimeGate() {
  const { screen, client, sessionExpired, finishRegistration, finishProviderSetup, userProfile } = useRuntime();
  const [authView, setAuthView] = useState<AuthView>("login");
  const hasToken = Boolean(client.auth.getAccessToken()) && !sessionExpired;

  if (!hasToken) {
    if (authView === "register") {
      return (
        <RegisterPage onLogin={() => setAuthView("login")} onSuccess={() => setAuthView("register-success")} />
      );
    }
    if (authView === "register-provider") {
      return (
        <RegisterProviderPage
          onLogin={() => setAuthView("login")}
          onSuccess={() => setAuthView("provider-onboarding")}
        />
      );
    }
    if (authView === "register-success" && client.auth.getAccessToken()) {
      return (
        <RegistrationSuccessPage
          onContinue={() => {
            setAuthView("login");
            void finishRegistration();
          }}
        />
      );
    }
    return (
      <LoginPage
        onRegister={() => setAuthView("register")}
        onRegisterProvider={() => setAuthView("register-provider")}
      />
    );
  }

  if (userProfile?.isProvider && authView === "provider-onboarding") {
    return (
      <ProviderOnboardingPage
        onComplete={() => {
          setAuthView("provider-profile");
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
          setAuthView("login");
          void finishProviderSetup();
        }}
      />
    );
  }

  if (!screen) {
    return <RuntimePage bootstrapping />;
  }

  return <RuntimePage />;
}

export function App() {
  const [splashComplete, setSplashComplete] = useState(false);

  if (!splashComplete) {
    return (
      <AnActSplash
        logoUrl={AN_ACT_BRAND.logoUrl}
        targetMode="need"
        onComplete={() => setSplashComplete(true)}
      />
    );
  }

  return (
    <RuntimeProvider>
      <RuntimeGate />
    </RuntimeProvider>
  );
}
