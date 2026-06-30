import { useState } from "react";
import { AnActSplash } from "@an-act/runtime-ui/react";
import { RuntimeProvider, useRuntime } from "./providers/RuntimeProvider.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { RegistrationSuccessPage } from "./pages/RegistrationSuccessPage.js";
import { RuntimePage } from "./pages/RuntimePage.js";
import { AN_ACT_BRAND } from "./brand/config.js";

type AuthView = "login" | "register" | "register-success";

function RuntimeGate() {
  const { screen, client, sessionExpired, finishRegistration } = useRuntime();
  const [authView, setAuthView] = useState<AuthView>("login");
  const hasToken = Boolean(client.auth.getAccessToken()) && !sessionExpired;

  if (!hasToken) {
    if (authView === "register") {
      return (
        <RegisterPage onLogin={() => setAuthView("login")} onSuccess={() => setAuthView("register-success")} />
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
