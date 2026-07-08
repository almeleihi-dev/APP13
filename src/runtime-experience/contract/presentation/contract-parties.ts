import type { ContractSummaryModel } from "../domain/contract-summary.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";
import { CONTRACT_NAV_ITEMS } from "../application/contract-navigation.js";

export function buildContractPartiesScreen(
  summary: ContractSummaryModel,
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "parties",
    navigation,
    generatedAt,
    sections: [
      {
        id: "parties",
        label: "Parties",
        purpose: "Customer and provider with verification and badges.",
        components: summary.parties.flatMap((party) => [
          buildComponentInstance({
            id: `party-${party.role}`,
            componentId: "core-ui-card",
            props: {
              title: party.name,
              role: party.role,
              verificationStatus: party.verificationStatus,
              badges: party.badges,
            },
            label: `${party.role}: ${party.name}`,
            role: "region",
          }),
          ...(party.liveFrameTier
            ? [
                buildComponentInstance({
                  id: `live-frame-${party.role}`,
                  componentId: "core-ui-live-frame",
                  props: { tier: party.liveFrameTier, role: party.role },
                  label: `Live Frame for ${party.name}`,
                  role: "img",
                }),
              ]
            : []),
          ...party.badges.map((badge, i) =>
            buildComponentInstance({
              id: `badge-${party.role}-${i}`,
              componentId: "core-ui-badge",
              variant: "professional",
              props: { label: badge },
              label: badge,
              role: "listitem",
            })
          ),
        ]),
      },
      {
        id: "contact-placeholder",
        label: "Contact Availability",
        purpose: "Contact availability placeholder — no chat implemented.",
        components: summary.parties.map((party) =>
          buildComponentInstance({
            id: `contact-${party.role}`,
            componentId: "core-ui-button",
            variant: "secondary",
            props: {
              label: party.contactAvailable ? "Contact available" : "Contact unavailable",
              disabled: !party.contactAvailable,
              placeholder: true,
            },
            label: `Contact ${party.name}`,
            role: "button",
          })
        ),
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to terms.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: { label: "Continue", action: "continue-parties" },
            label: "Continue to terms",
            role: "button",
          }),
        ],
      },
      {
        id: "bottom-navigation",
        label: "Bottom Navigation",
        purpose: "Contract section navigation.",
        components: [
          buildComponentInstance({
            id: "contract-bottom-nav",
            componentId: "core-ui-bottom-navigation",
            props: { items: CONTRACT_NAV_ITEMS, activeId: "parties" },
            label: "Contract navigation",
            role: "navigation",
          }),
        ],
      },
    ],
  });
}
