import { useState } from "react";
import { AnActSplash } from "@an-act/runtime-ui/react";
import { RuntimeProvider, useRuntime } from "./providers/RuntimeProvider.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RuntimePage } from "./pages/RuntimePage.js";
import { AN_ACT_BRAND } from "./brand/config.js";

function RuntimeGate() {
  const { screen, client } = useRuntime();
  const hasToken = Boolean(client.auth.getAccessToken());

  if (!hasToken) {
    return <LoginPage />;
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
