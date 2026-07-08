import type { GeoLocationProfile, ServiceAvailability } from "../lib/living-platform/types.js";
import type { SupportedLocale } from "../i18n/locale-types.js";

export function parseLocationString(location: string): Pick<GeoLocationProfile, "city" | "country" | "region"> {
  const trimmed = location.trim();
  if (!trimmed) {
    return { country: "", city: "", region: "" };
  }
  const parts = trimmed.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      city: parts[0] ?? "",
      region: parts.length > 2 ? parts.slice(1, -1).join(", ") : "",
      country: parts[parts.length - 1] ?? "",
    };
  }
  return { city: trimmed, country: "", region: "" };
}

export function defaultGeoLocationProfile(location = ""): GeoLocationProfile {
  const parsed = parseLocationString(location);
  return {
    country: parsed.country,
    city: parsed.city,
    region: parsed.region,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    serviceRadiusKm: null,
    availability: "hybrid",
    latitude: null,
    longitude: null,
  };
}

export function formatGeoLocationLine(profile: GeoLocationProfile): string {
  const parts = [profile.city, profile.region, profile.country].filter(Boolean);
  return parts.join(", ");
}

export function availabilityLabel(availability: ServiceAvailability): string {
  if (availability === "remote") return "Remote 🌍";
  if (availability === "local") return "Local 📍";
  return "Hybrid 🔁";
}

export function localeToLanguageName(locale: SupportedLocale): string {
  if (locale === "de") return "German";
  if (locale === "ar") return "Arabic";
  return "English";
}

export function mergeGeoWithLocationString(
  geo: GeoLocationProfile,
  location: string,
): GeoLocationProfile {
  if (geo.city || geo.country) return geo;
  const parsed = parseLocationString(location);
  return {
    ...geo,
    city: parsed.city,
    country: parsed.country,
    region: parsed.region,
  };
}

export function supportedLanguageOptions(): SupportedLocale[] {
  return ["en", "de", "ar"];
}
