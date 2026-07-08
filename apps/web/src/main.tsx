import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { runLaunchBootstrap } from "./launch/launch-bootstrap.js";
import { SHOW_DEVELOPER_SURFACES } from "./lib/public-beta.js";
import { initLocale } from "./i18n/locale-store.js";
import { App } from "./App.js";
import "./styles/global.css";

registerSW({ immediate: true });

initLocale();

document.documentElement.classList.add("an-act-signature-s2");
document.documentElement.classList.add("an-act-emotional-s3");
document.documentElement.classList.add("an-act-living-p1");
document.documentElement.classList.add("an-act-pi-cycle01");
document.documentElement.classList.add("an-act-mkt-c01");
document.documentElement.classList.add("an-act-action-c01");
document.documentElement.classList.add("an-act-living-s1");
document.documentElement.classList.add("an-act-living-s2");
document.documentElement.classList.add("an-act-living-s3");
document.documentElement.classList.add("an-act-living-s4");
document.documentElement.classList.add("an-act-living-s5");
document.documentElement.classList.add("an-act-living-s6");
document.documentElement.classList.add("an-act-living-s7");

if (SHOW_DEVELOPER_SURFACES) {
  document.documentElement.classList.add("show-developer-surfaces");
}

if (!runLaunchBootstrap()) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
