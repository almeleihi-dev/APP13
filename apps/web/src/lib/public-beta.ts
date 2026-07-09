/**
 * Public beta presentation gates — presentation only.
 * Production builds hide developer/operator surfaces unless explicitly enabled.
 */
export const SHOW_DEVELOPER_SURFACES =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_DEVELOPER_SURFACES === "true";

/** True on production anact.app unless developer surfaces are forced on. */
export const PUBLIC_BETA_MODE = import.meta.env.PROD && !SHOW_DEVELOPER_SURFACES;

export const PUBLIC_BETA_LABEL = "Beta Lab";
