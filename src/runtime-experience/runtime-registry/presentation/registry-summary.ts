import type { RuntimeCatalog } from "../domain/runtime-catalog.js";

export function buildRegistrySummary(catalog: RuntimeCatalog) {
  return {
    version: catalog.version,
    experienceCount: catalog.experienceCount,
    validCount: catalog.experiences.filter((e) => e.validationStatus === "valid").length,
    availableCount: catalog.experiences.filter((e) => e.available).length,
    sections: [
      {
        id: "registry-overview",
        label: "Registry Summary",
        components: [
          {
            id: "experience-count",
            componentId: "core-ui-badge",
            props: { count: catalog.experienceCount, label: "Registered Experiences" },
            accessibility: { label: `${catalog.experienceCount} experiences`, role: "status" },
          },
          {
            id: "valid-count",
            componentId: "core-ui-chip",
            props: {
              count: catalog.experiences.filter((e) => e.validationStatus === "valid").length,
              label: "Valid",
            },
            accessibility: { label: "Valid experiences", role: "status" },
          },
        ],
      },
      {
        id: "experience-list",
        label: "Registered Experiences",
        components: catalog.experiences.map((exp) => ({
          id: `exp-${exp.id}`,
          componentId: "core-ui-card",
          props: {
            id: exp.id,
            name: exp.name,
            version: exp.version,
            mode: exp.mode,
            primaryRoute: exp.primaryRoute,
            validationStatus: exp.validationStatus,
          },
          accessibility: { label: exp.name, role: "listitem" },
        })),
      },
    ],
  };
}
