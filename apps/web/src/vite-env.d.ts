/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_AN_ACT_LOGO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
