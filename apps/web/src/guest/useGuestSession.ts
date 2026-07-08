import { useCallback, useEffect, useState } from "react";
import {
  GUEST_SESSION_UPDATED_EVENT,
  readGuestSession,
  type GuestSession,
} from "./guest-session.js";

export function useGuestSession(): GuestSession {
  const [session, setSession] = useState(readGuestSession);

  const refresh = useCallback(() => setSession(readGuestSession()), []);

  useEffect(() => {
    window.addEventListener(GUEST_SESSION_UPDATED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(GUEST_SESSION_UPDATED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return session;
}
