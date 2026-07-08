import { useEffect, useState } from "react";
import { useRuntime } from "../providers/RuntimeProvider.js";

/**
 * Reality Bridge ET-1 — Passport data authority.
 *
 * The Professional Passport is a trust artifact and MUST be sourced from the
 * backend (PostgreSQL: identity + trust + credentials), not from browser
 * localStorage. This hook loads the authoritative passport from the real
 * `/professional-passport` endpoint via the existing runtime client.
 *
 * It is intentionally defensive: the transport returns a loosely-typed record,
 * so every field is read with fallbacks. When no authenticated provider session
 * exists (guest, customer, or offline) the hook resolves to `unavailable` and
 * callers fall back to the local draft — the local copy is a DRAFT/CACHE only,
 * never the source of truth.
 */

export type BackendPassportStatus = "idle" | "loading" | "authoritative" | "unavailable";

export interface AuthoritativePassport {
  userId: string;
  providerId?: string;
  displayName?: string;
  trustScore?: number;
  trustTier?: string;
  passportLevel?: string;
  verificationState?: string;
  completedActions?: number;
  trustIndicators: string[];
  /** Raw backend payload, for callers that need fields not normalized above. */
  raw: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalize(raw: Record<string, unknown>): AuthoritativePassport {
  const identity = asRecord(raw.identity);
  const trust = asRecord(raw.trust);
  const verification = asRecord(raw.verification);
  const performance = asRecord(raw.performance);
  const passportLevel = asRecord(raw.passport_level);

  const indicators: string[] = [];
  const tier = asString(trust.tier) ?? asString(trust.confidence_band);
  if (tier) indicators.push(`Trust tier: ${tier}`);
  const verState = asString(verification.state) ?? asString(verification.status);
  if (verState) indicators.push(`Verification: ${verState}`);
  const level = asString(passportLevel.level) ?? asString(passportLevel.label);
  if (level) indicators.push(`Passport level: ${level}`);

  return {
    userId: asString(raw.user_id) ?? "",
    providerId: asString(raw.provider_id),
    displayName: asString(identity.display_name) ?? asString(identity.full_name),
    trustScore: asNumber(trust.score),
    trustTier: tier,
    passportLevel: level,
    verificationState: verState,
    completedActions:
      asNumber(performance.completed_contract_count) ??
      asNumber(performance.completed_actions),
    trustIndicators: indicators,
    raw,
  };
}

export interface UseBackendPassportResult {
  status: BackendPassportStatus;
  passport: AuthoritativePassport | null;
  reload: () => void;
}

export function useBackendPassport(): UseBackendPassportResult {
  const { client } = useRuntime();
  const [status, setStatus] = useState<BackendPassportStatus>("idle");
  const [passport, setPassport] = useState<AuthoritativePassport | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!client.auth.hasSession()) {
      setStatus("unavailable");
      setPassport(null);
      return;
    }

    setStatus("loading");
    client
      .getProfessionalPassport()
      .then((raw) => {
        if (cancelled) return;
        setPassport(normalize(asRecord(raw)));
        setStatus("authoritative");
      })
      .catch(() => {
        // 401 (no session), 404 (non-provider), or network — fall back to local draft.
        if (cancelled) return;
        setPassport(null);
        setStatus("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [client, nonce]);

  return { status, passport, reload: () => setNonce((n) => n + 1) };
}
