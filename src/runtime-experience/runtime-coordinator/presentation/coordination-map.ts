import type { ExperienceMapEntry } from "../../runtime-registry/application/runtime-discovery.js";

export function buildCoordinationMap(registryMap: ExperienceMapEntry[]) {
  return {
    sections: [
      {
        id: "coordination-map",
        label: "Coordination Map",
        components: registryMap.map((entry) => ({
          id: `coord-${entry.id}`,
          componentId: "core-ui-timeline-card",
          props: {
            id: entry.id,
            name: entry.name,
            mode: entry.mode,
            primaryRoute: entry.primaryRoute,
            delegateOnly: true,
            available: entry.available,
          },
          accessibility: { label: `${entry.name} coordination target`, role: "listitem" },
        })),
      },
    ],
  };
}
