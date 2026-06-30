/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AN_ACT_LOGO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
