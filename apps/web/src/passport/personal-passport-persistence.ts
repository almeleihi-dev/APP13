import { hasCompletedLaunch } from "../launch/launch-persistence.js";
import { isGuestPendingConversion } from "../guest/guest-session.js";
import { notifyPersonalIdentityUpdated } from "./personal-identity.js";
import type { GeoLocationProfile } from "../lib/living-platform/types.js";
import {
  defaultGeoLocationProfile,
  formatGeoLocationLine,
  mergeGeoWithLocationString,
} from "./geo-location-utils.js";
import type { SupportedLocale } from "../i18n/locale-types.js";

export const PERSONAL_PASSPORT_KEY = "an-act-personal-passport-v1";

export interface PersonalPassportInput {
  fullName: string;
  professionalTitle: string;
  location: string;
  mainSkill: string;
  experienceSummary: string;
  photoDataUrl?: string;
  geoProfile?: GeoLocationProfile;
  languages?: SupportedLocale[];
}

export interface PersonalProfessionalPassport extends PersonalPassportInput {
  createdAt: string;
  liveFrameTier: "Silver" | "Gold" | "Platinum";
  classification: string;
  actionGroups: string[];
  trustIndicators: string[];
  certifications: string[];
  rating: string;
  completedActions: number;
  geoProfile: GeoLocationProfile;
  languages: SupportedLocale[];
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function deriveClassification(skill: string): string {
  const normalized = skill.trim().toLowerCase();
  if (!normalized) return "Professional Operator";
  if (normalized.includes("engineer") || normalized.includes("developer")) return "Technical Professional";
  if (normalized.includes("design")) return "Creative Professional";
  if (normalized.includes("consult")) return "Advisory Professional";
  if (normalized.includes("legal") || normalized.includes("finance")) return "Regulated Professional";
  return "Domain Professional";
}

function deriveActionGroups(skill: string): string[] {
  const base = skill.trim() || "Professional Services";
  return [
    `${base} · Primary`,
    "Live Frame Monitored Actions",
    "Contract-Backed Delivery",
    "Trust-Verified Requests",
  ];
}

export function generatePersonalPassport(input: PersonalPassportInput): PersonalProfessionalPassport {
  const summaryLength = input.experienceSummary.trim().length;
  const liveFrameTier: PersonalProfessionalPassport["liveFrameTier"] =
    summaryLength > 180 ? "Gold" : summaryLength > 80 ? "Silver" : "Silver";

  const geoProfile = mergeGeoWithLocationString(
    input.geoProfile ?? defaultGeoLocationProfile(input.location),
    input.location,
  );
  const location = formatGeoLocationLine(geoProfile) || input.location.trim();

  return {
    ...input,
    location,
    geoProfile,
    languages: input.languages?.length ? input.languages : ["en"],
    createdAt: new Date().toISOString(),
    liveFrameTier,
    classification: deriveClassification(input.mainSkill),
    actionGroups: deriveActionGroups(input.mainSkill),
    trustIndicators: [
      "Identity established",
      "Live Frame enrolled",
      "Platform attestation active",
      "Trust architecture linked",
    ],
    certifications: ["Professional Identity", "Live Frame Verified", "Platform Enrolled"],
    rating: "New",
    completedActions: 0,
  };
}

/** Preserves enrollment metadata when editing an existing passport. */
export function updatePersonalPassport(
  existing: PersonalProfessionalPassport,
  input: PersonalPassportInput,
): PersonalProfessionalPassport {
  const next = generatePersonalPassport(input);
  return {
    ...next,
    createdAt: existing.createdAt,
    rating: existing.rating,
    completedActions: existing.completedActions,
  };
}

export function savePersonalPassport(profile: PersonalProfessionalPassport): void {
  try {
    localStorage.setItem(PERSONAL_PASSPORT_KEY, JSON.stringify(profile));
    notifyPersonalIdentityUpdated();
  } catch {
    /* presentation-only */
  }
}

export function readPersonalPassport(): PersonalProfessionalPassport | null {
  try {
    const raw = localStorage.getItem(PERSONAL_PASSPORT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersonalProfessionalPassport;
    const geoProfile = parsed.geoProfile
      ? parsed.geoProfile
      : mergeGeoWithLocationString(defaultGeoLocationProfile(parsed.location), parsed.location);
    return {
      ...parsed,
      geoProfile,
      languages: parsed.languages?.length ? parsed.languages : ["en"],
      location: formatGeoLocationLine(geoProfile) || parsed.location,
    };
  } catch {
    return null;
  }
}

export function hasPersonalPassport(): boolean {
  return readPersonalPassport() !== null;
}

export function clearPersonalPassport(): void {
  try {
    localStorage.removeItem(PERSONAL_PASSPORT_KEY);
    notifyPersonalIdentityUpdated();
  } catch {
    /* ignore */
  }
}

/** First journey after Final Act when launch is complete but passport is not. */
export function shouldStartPassportJourney(): boolean {
  if (typeof window === "undefined") return false;
  if (isGuestPendingConversion()) return true;
  if (!hasCompletedLaunch()) return false;
  return !hasPersonalPassport();
}

export function passportSummaryLine(profile: PersonalProfessionalPassport): string {
  const location = formatGeoLocationLine(profile.geoProfile) || profile.location.trim();
  const summary = profile.experienceSummary.trim();
  const tier = profile.liveFrameTier;
  const availability = profile.geoProfile.availability;
  const availabilityNote =
    availability === "remote" ? "Remote 🌍" : availability === "local" ? "Local 📍" : "Hybrid 🔁";
  const parts = [
    summary || "Professional experience registered",
    `${tier} Live Frame tier`,
    location || "Location on file",
    availabilityNote,
  ];
  return parts.join(" · ");
}

export function toPassportPreviewData(profile: PersonalProfessionalPassport) {
  return {
    providerName: profile.fullName,
    serviceName: profile.professionalTitle,
    summary: passportSummaryLine(profile),
    rating: profile.rating,
    certifications: profile.certifications,
    liveFrameTier: profile.liveFrameTier,
    avatarInitials: initialsFromName(profile.fullName),
    photoUrl: profile.photoDataUrl,
  };
}
