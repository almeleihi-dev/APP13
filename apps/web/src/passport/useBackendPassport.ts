import { useEffect, useState } from "react";
import { useRuntime } from "../providers/RuntimeProvider.js";

/**
 * Reality Bridge ET-1 — Passport data authority.
 *
 * The Professional Passport is a trust artifact and MUST be sourced from the
 * backend (PostgreSQL: identity + trust + credentials), not from browser
 * localStorage. This hook loads the authoritative passport from the real
 * `GET /professional-passport` endpoint via the existing runtime client.
 *
 * Field names below match the backend ProfessionalPassportView (snake_case).
 * Every field is read defensively with fallbacks: when no authoritative
 * provider session exists (guest, customer, or offline) the hook resolves to
 * `unavailable` and callers fall back to the local draft — the local copy is a
 * DRAFT/CACHE only, never the source of truth.
 */

export type BackendPassportStatus = "idle" | "loading" | "authoritative" | "unavailable";

export interface PassportCredentialView {
  id: string;
  name: string;
  type?: string;
  issuingAuthority?: string;
  status?: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface PassportBadgeView {
  id: string;
  label: string;
  category?: string;
  earned: boolean;
}

export interface AuthoritativePassport {
  userId: string;
  providerId?: string;
  displayName?: string;
  profession?: string;
  trustScore?: number;
  trustTier?: string;
  passportLevel?: string;
  passportProgressPercent?: number;
  nextLevelLabel?: string;
  verificationTier?: string;
  verificationTierLabel?: string;
  verificationStatusLabel?: string;
  /** Back-compat: number of completed contracts (a.k.a. completed actions). */
  completedActions?: number;
  averageRating?: number;
  licenses: PassportCredentialView[];
  certifications: PassportCredentialView[];
  badges: PassportBadgeView[];
  offeredActionCount: number;
  trustIndicators: string[];
  /** Raw backend payload, for callers that need fields not normalized above. */
  raw: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function mapCredential(row: Record<string, unknown>): PassportCredentialView {
  return {
    id: asString(row.id) ?? asString(row.name) ?? "credential",
    name: asString(row.name) ?? "Credential",
    type: asString(row.type),
    issuingAuthority: asString(row.issuing_authority),
    status: asString(row.status),
    issuedAt: asString(row.issued_at),
    expiresAt: asString(row.expires_at),
  };
}

function mapBadge(row: Record<string, unknown>): PassportBadgeView {
  return {
    id: asString(row.badge_id) ?? asString(row.label) ?? "badge",
    label: asString(row.label) ?? "Badge",
    category: asString(row.category),
    earned: row.earned === true,
  };
}

function normalize(raw: Record<string, unknown>): AuthoritativePassport {
  const identity = asRecord(raw.identity);
  const trust = asRecord(raw.trust);
  const verification = asRecord(raw.verification);
  const performance = asRecord(raw.performance);
  const passportLevel = asRecord(raw.passport_level);

  const trustScore =
    asNumber(performance.trust_score) ??
    asNumber(passportLevel.trust_score) ??
    asNumber(trust.score) ??
    asNumber(trust.trust_score);
  const trustTier =
    asString(performance.confidence_band) ??
    asString(trust.tier) ??
    asString(trust.confidence_band);
  const level = asString(passportLevel.label) ?? asString(passportLevel.level);
  const verTierLabel = asString(verification.tier_label);
  const verStatusLabel = asString(verification.status_label);

  const indicators: string[] = [];
  if (verTierLabel) indicators.push(`Verification: ${verTierLabel}`);
  if (verStatusLabel && verStatusLabel !== verTierLabel) indicators.push(verStatusLabel);
  if (level) indicators.push(`Passport level: ${level}`);
  if (trustTier) indicators.push(`Trust band: ${trustTier}`);

  return {
    userId: asString(raw.user_id) ?? "",
    providerId: asString(raw.provider_id),
    displayName: asString(identity.display_name),
    profession: asString(identity.primary_trade),
    trustScore,
    trustTier,
    passportLevel: level,
    passportProgressPercent: asNumber(passportLevel.progress_percent),
    nextLevelLabel: asString(passportLevel.next_level_label),
    verificationTier: asString(verification.verification_tier),
    verificationTierLabel: verTierLabel,
    verificationStatusLabel: verStatusLabel,
    completedActions: asNumber(performance.completed_contracts),
    averageRating: asNumber(performance.average_rating),
    licenses: asArray(raw.licenses).map(mapCredential),
    certifications: asArray(raw.certifications).map(mapCredential),
    badges: asArray(raw.badges).map(mapBadge),
    offeredActionCount: asArray(identity.offered_actions).length,
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
