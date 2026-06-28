import type { ExperienceMapEntry } from "../application/runtime-discovery.js";

export function buildExperienceMapPresentation(map: ExperienceMapEntry[]) {
  return {
    sections: [
      {
        id: "experience-map",
        label: "Experience Map",
        components: map.map((entry, i) => ({
          id: `map-${entry.id}`,
          componentId: "core-ui-timeline-card",
          props: {
            index: i,
            id: entry.id,
            name: entry.name,
            mode: entry.mode,
            primaryRoute: entry.primaryRoute,
            chapter: entry.chapter,
            available: entry.available,
            readOnly: true,
          },
          accessibility: { label: `${entry.name} on ${entry.primaryRoute}`, role: "listitem" },
        })),
      },
    ],
  };
}
