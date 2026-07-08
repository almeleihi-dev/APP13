/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_AN_ACT_LOGO_URL?: string;
  readonly VITE_AN_ACT_SITE_URL?: string;
  readonly VITE_RUNTIME_DEBUG?: string;
  readonly VITE_PILOT_INSTRUMENTATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
