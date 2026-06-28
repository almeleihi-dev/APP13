import type { ProfileSummary } from "../domain/profile-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { PROFILE_NAV_ITEMS } from "../application/profile-navigation.js";

export function buildProfileIdentityScreen(
  summary: ProfileSummary,
  navigation: NavigationState,
  generatedAt: string
) {
  const identity = summary.sections.identity;

  return buildRuntimeScreenView({
    screenId: "profile-identity",
    navigation,
    generatedAt,
    sections: [
      {
        id: "identity-header",
        label: "Identity Header",
        purpose: "Profile identity information.",
        components: [
          buildComponentInstance({
            id: "header",
            componentId: "core-ui-navigation-bar",
            props: { title: "Identity", subtitle: summary.displayName },
            label: "Profile identity",
            role: "banner",
          }),
        ],
      },
      {
        id: "profile-information",
        label: "Profile Information",
        purpose: "Basic profile information.",
        components: [
          buildComponentInstance({
            id: "info",
            componentId: "core-ui-card",
            props: { title: "Profile", summary: identity.profileInformation },
            label: identity.profileInformation,
          }),
        ],
      },
      {
        id: "verification-status",
        label: "Verification Status",
        purpose: "Current verification status.",
        components: [
          buildComponentInstance({
            id: "verification",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: identity.verificationStatus, verified: identity.verificationStatus === "verified" },
            label: `Verification: ${identity.verificationStatus}`,
            role: "status",
          }),
        ],
      },
      {
        id: "licenses",
        label: "Licenses",
        purpose: "Professional licenses.",
        components: identity.licenses.map((license, i) =>
          buildComponentInstance({
            id: `license-${i}`,
            componentId: "core-ui-card",
            props: { title: "License", summary: license },
            label: license,
          })
        ),
      },
      {
        id: "certifications",
        label: "Certifications",
        purpose: "Professional certifications.",
        components: identity.certifications.map((cert, i) =>
          buildComponentInstance({
            id: `cert-${i}`,
            componentId: "core-ui-chip",
            props: { label: cert },
            label: cert,
            role: "listitem",
          })
        ),
      },
      {
        id: "professional-badges",
        label: "Professional Badges",
        purpose: "Earned professional badges.",
        components: identity.professionalBadges.map((badge, i) =>
          buildComponentInstance({
            id: `pro-badge-${i}`,
            componentId: "core-ui-badge",
            props: { label: badge },
            label: badge,
            role: "status",
          })
        ),
      },
      {
        id: "member-since",
        label: "Member Since",
        purpose: "Account creation date.",
        components: [
          buildComponentInstance({
            id: "member-since",
            componentId: "core-ui-card",
            props: { title: "Member Since", value: identity.memberSince },
            label: `Member since ${identity.memberSince}`,
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Profile navigation.",
        components: [
          buildComponentInstance({
            id: "profile-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: PROFILE_NAV_ITEMS, activeId: "home" },
            label: "Profile navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
