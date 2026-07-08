import type { MarketplaceLocationFilters, PublishedProfessionalAction } from "../types.js";
import type { GeoLocationProfile } from "../types.js";

export interface MarketplaceSearchOptions {
  keyword?: string;
  filters?: MarketplaceLocationFilters;
  viewerLocation?: Pick<GeoLocationProfile, "country" | "city">;
}

function parseLocationParts(location: string): { city: string; country: string } {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { city: parts[0] ?? "", country: parts[parts.length - 1] ?? "" };
  }
  return { city: location.trim(), country: "" };
}

function matchesScope(
  action: PublishedProfessionalAction,
  filters: MarketplaceLocationFilters,
  viewer?: Pick<GeoLocationProfile, "country" | "city">,
): boolean {
  const creatorLocation = parseLocationParts(action.creator.location);
  const targetCity = filters.city ?? viewer?.city ?? "";
  const targetCountry = filters.country ?? viewer?.country ?? "";

  switch (filters.scope) {
    case "worldwide":
      return true;
    case "same_country":
      return targetCountry
        ? creatorLocation.country.toLowerCase() === targetCountry.toLowerCase() ||
            action.creator.location.toLowerCase().includes(targetCountry.toLowerCase())
        : true;
    case "same_city":
      return targetCity
        ? creatorLocation.city.toLowerCase() === targetCity.toLowerCase() ||
            action.creator.location.toLowerCase().includes(targetCity.toLowerCase())
        : true;
    case "near_me":
      return targetCity || targetCountry
        ? action.creator.location.toLowerCase().includes(targetCity.toLowerCase()) ||
            action.creator.location.toLowerCase().includes(targetCountry.toLowerCase())
        : true;
    default:
      return true;
  }
}

export function filterPublishedActionsByLocation(
  actions: PublishedProfessionalAction[],
  options: MarketplaceSearchOptions,
): PublishedProfessionalAction[] {
  const keyword = options.keyword?.trim().toLowerCase() ?? "";
  const filters = options.filters;

  return actions.filter((action) => {
    const haystack = [
      action.blueprint.name,
      action.blueprint.purpose,
      action.creator.fullName,
      action.creator.mainSkill,
      action.creator.location,
    ]
      .join(" ")
      .toLowerCase();

    if (keyword && !haystack.includes(keyword)) return false;

    if (filters?.language) {
      const lang = filters.language.toLowerCase();
      if (!haystack.includes(lang) && !action.creator.certifications.join(" ").toLowerCase().includes(lang)) {
        return false;
      }
    }

    if (filters?.remoteOnly) {
      const remoteFriendly = /remote|software|digital|consult|design|develop|translation/i.test(haystack);
      if (!remoteFriendly) return false;
    }

    if (filters) {
      return matchesScope(action, filters, options.viewerLocation);
    }

    return true;
  });
}

export function defaultMarketplaceFilters(): MarketplaceLocationFilters {
  return { scope: "worldwide", remoteOnly: false };
}

export function marketplaceFilterLabels(): Array<{ scope: MarketplaceLocationFilters["scope"]; labelKey: string }> {
  return [
    { scope: "near_me", labelKey: "marketplace.nearMe" },
    { scope: "same_city", labelKey: "marketplace.sameCity" },
    { scope: "same_country", labelKey: "marketplace.sameCountry" },
    { scope: "worldwide", labelKey: "marketplace.worldwide" },
  ];
}
