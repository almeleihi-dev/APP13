import { useCallback, useEffect, useState } from "react";
import { PERSONAL_IDENTITY_UPDATED_EVENT, readActivePersonalIdentity, type ActivePersonalIdentity } from "./personal-identity.js";
import { LIVING_PLATFORM_UPDATED_EVENT } from "../lib/living-platform/types.js";
import { PERSONAL_PASSPORT_KEY } from "./personal-passport-persistence.js";
import { LIVING_PLATFORM_STORAGE_KEY } from "../lib/living-platform/types.js";

export function usePersonalIdentity(): ActivePersonalIdentity | null {
  const [identity, setIdentity] = useState<ActivePersonalIdentity | null>(() => readActivePersonalIdentity());

  const refresh = useCallback(() => {
    setIdentity(readActivePersonalIdentity());
  }, []);

  useEffect(() => {
    const onIdentityUpdated = () => refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === PERSONAL_PASSPORT_KEY || event.key === LIVING_PLATFORM_STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener(PERSONAL_IDENTITY_UPDATED_EVENT, onIdentityUpdated);
    window.addEventListener(LIVING_PLATFORM_UPDATED_EVENT, onIdentityUpdated);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener(PERSONAL_IDENTITY_UPDATED_EVENT, onIdentityUpdated);
      window.removeEventListener(LIVING_PLATFORM_UPDATED_EVENT, onIdentityUpdated);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return identity;
}
