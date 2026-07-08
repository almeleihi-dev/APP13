import type { ProfessionalPassportData } from "@an-act/runtime-ui/react";
import type { GeoLocationProfile } from "../lib/living-platform/types.js";
import type { SupportedLocale } from "../i18n/locale-types.js";
import {
  initialsFromName,
  readPersonalPassport,
  type PersonalProfessionalPassport,
} from "./personal-passport-persistence.js";
import { formatGeoLocationLine } from "./geo-location-utils.js";

export const PERSONAL_IDENTITY_UPDATED_EVENT = "an-act-personal-identity-updated";

export interface ActivePersonalIdentity {
  fullName: string;
  firstName: string;
  professionalTitle: string;
  location: string;
  mainSkill: string;
  experienceSummary: string;
  photoUrl?: string;
  avatarInitials: string;
  liveFrameTier: PersonalProfessionalPassport["liveFrameTier"];
  classification: string;
  actionGroups: string[];
  trustIndicators: string[];
  certifications: string[];
  rating: string;
  completedActions: number;
  geoProfile: GeoLocationProfile;
  languages: SupportedLocale[];
  passportPreview: ProfessionalPassportData;
}

function firstNameFromFullName(fullName: string): string {
  const part = fullName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? "Professional";
}

export function toActivePersonalIdentity(
  profile: PersonalProfessionalPassport
): ActivePersonalIdentity {
  const summaryParts = [
    profile.experienceSummary.trim() || "Professional experience registered",
    `${profile.liveFrameTier} Live Frame tier`,
    formatGeoLocationLine(profile.geoProfile) || profile.location.trim() || "Location on file",
  ];

  const passportPreview: ProfessionalPassportData = {
    providerName: profile.fullName,
    serviceName: profile.professionalTitle,
    summary: summaryParts.join(" · "),
    rating: profile.rating,
    certifications: profile.certifications,
    liveFrameTier: profile.liveFrameTier,
    avatarInitials: initialsFromName(profile.fullName),
    photoUrl: profile.photoDataUrl,
  };

  return {
    fullName: profile.fullName,
    firstName: firstNameFromFullName(profile.fullName),
    professionalTitle: profile.professionalTitle,
    location: profile.location,
    mainSkill: profile.mainSkill,
    experienceSummary: profile.experienceSummary,
    photoUrl: profile.photoDataUrl,
    avatarInitials: initialsFromName(profile.fullName),
    liveFrameTier: profile.liveFrameTier,
    classification: profile.classification,
    actionGroups: profile.actionGroups,
    trustIndicators: profile.trustIndicators,
    certifications: profile.certifications,
    rating: profile.rating,
    completedActions: profile.completedActions,
    geoProfile: profile.geoProfile,
    languages: profile.languages,
    passportPreview,
  };
}

export function readActivePersonalIdentity(): ActivePersonalIdentity | null {
  const profile = readPersonalPassport();
  if (!profile) return null;
  return toActivePersonalIdentity(profile);
}

export function personalIdentityGreeting(identity: ActivePersonalIdentity): string {
  return `Welcome back, ${identity.firstName}`;
}

export function personalDashboardGreeting(identity: ActivePersonalIdentity): string {
  return `${identity.firstName}, your operating surface is live`;
}

export function personalRuntimeOwnerLabel(identity: ActivePersonalIdentity): string {
  return `Operating as ${identity.fullName}`;
}

export function notifyPersonalIdentityUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PERSONAL_IDENTITY_UPDATED_EVENT));
}
