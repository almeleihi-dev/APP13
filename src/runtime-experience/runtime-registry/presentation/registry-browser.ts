import type { RuntimeCatalog } from "../domain/runtime-catalog.js";
import { RUNTIME_EXPERIENCE_METADATA } from "../domain/runtime-metadata.js";

export function buildRegistryBrowser(catalog: RuntimeCatalog) {
  return {
    sections: [
      {
        id: "registry-browser",
        label: "Experience Browser",
        components: catalog.experiences.map((exp) => ({
          id: `browser-${exp.id}`,
          componentId: "core-ui-card",
          props: {
            id: exp.id,
            name: exp.name,
            chapter: RUNTIME_EXPERIENCE_METADATA[exp.id].chapter,
            description: RUNTIME_EXPERIENCE_METADATA[exp.id].description,
            apiPrefix: RUNTIME_EXPERIENCE_METADATA[exp.id].apiPrefix,
            mode: exp.mode,
            lifecyclePhase: exp.lifecyclePhase,
            routeCount: exp.supportedRoutes.length,
            dependencyCount: exp.dependencies.length,
            capabilityCount: exp.capabilities.length,
            available: exp.available,
            readOnly: true,
          },
          accessibility: { label: `${exp.name} browser entry`, role: "listitem" },
        })),
      },
    ],
  };
}
