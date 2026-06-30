import { RuntimeProvider, useRuntime } from "./providers/RuntimeProvider.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RuntimePage } from "./pages/RuntimePage.js";

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
  return (
    <RuntimeProvider>
      <RuntimeGate />
    </RuntimeProvider>
  );
}
