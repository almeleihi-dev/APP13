import type {
  LivingPlatformState,
  LivingProject,
  ProjectLocationProfile,
  TeamGlobalCapability,
  TeamPassport,
} from "./types.js";
import { deriveProjectLocationFromTemplate } from "./intelligence/action-location-intelligence.js";
import type { SupportedLocale } from "../../i18n/locale-types.js";
import { localeToLanguageName } from "../../passport/geo-location-utils.js";

export function defaultTeamGlobalCapability(): TeamGlobalCapability {
  return {
    teamLocations: [],
    languagesSpoken: ["English"],
    coverage: ["local"],
    availability: "hybrid",
  };
}

export function defaultProjectLocation(templateId = "general"): ProjectLocationProfile {
  const execution = deriveProjectLocationFromTemplate(templateId);
  return {
    country: "",
    city: "",
    ...execution,
  };
}

export function enrichTeamForV6(team: TeamPassport & { globalCapability?: TeamGlobalCapability }): TeamPassport {
  if (team.globalCapability) return team;
  return { ...team, globalCapability: defaultTeamGlobalCapability() };
}

export function enrichProjectForV6(
  project: LivingProject & { projectLocation?: ProjectLocationProfile },
): LivingProject {
  if (project.projectLocation) return project;
  return {
    ...project,
    projectLocation: defaultProjectLocation(project.templateId),
  };
}

export function migrateLivingPlatformToV6(
  state: Omit<LivingPlatformState, "version"> & { version: number },
): LivingPlatformState {
  if (state.version === 6) {
    return {
      ...(state as LivingPlatformState),
      teams: (state.teams ?? []).map(enrichTeamForV6),
      projects: (state.projects ?? []).map((project) =>
        enrichProjectForV6(project as LivingProject),
      ),
    };
  }
  return {
    ...(state as Omit<LivingPlatformState, "version">),
    version: 6,
    teams: (state.teams ?? []).map(enrichTeamForV6),
    projects: (state.projects ?? []).map((project) =>
      enrichProjectForV6(project as LivingProject),
    ),
  };
}

export function deriveTeamGlobalCapabilityFromMembers(
  memberLocations: string[],
  memberLanguages: SupportedLocale[] = ["en"],
): TeamGlobalCapability {
  const locations = [...new Set(memberLocations.map((loc) => loc.trim()).filter(Boolean))];
  const languagesSpoken = [...new Set(memberLanguages.map(localeToLanguageName))];
  const coverage: TeamGlobalCapability["coverage"] = [];
  if (locations.length > 0) coverage.push("local", "country");
  coverage.push("global");

  let availability: TeamGlobalCapability["availability"] = "hybrid";
  if (locations.length === 0) availability = "remote";
  else if (locations.length === 1) availability = "local";

  return {
    teamLocations: locations,
    languagesSpoken: languagesSpoken.length > 0 ? languagesSpoken : ["English"],
    coverage: [...new Set(coverage)],
    availability,
  };
}
