import type { BenchmarkBand } from "./types.js";

/** Deterministic profession/action benchmark bands (SAR). */
export const PRICING_BENCHMARKS: BenchmarkBand[] = [
  {
    id: "cleaning",
    label: "Cleaning",
    min: 100,
    max: 500,
    referenceDays: 1,
  },
  {
    id: "logo_design",
    label: "Logo Design",
    min: 500,
    max: 3000,
    referenceDays: 7,
  },
  {
    id: "software_development",
    label: "Software Development",
    min: 5000,
    max: 50000,
    referenceDays: 22,
  },
  {
    id: "consulting",
    label: "Consulting",
    min: 500,
    max: 5000,
    referenceDays: 5,
  },
  {
    id: "construction_supervision",
    label: "Construction Supervision",
    min: 2000,
    max: 30000,
    referenceDays: 30,
  },
];

const PROFESSION_BENCHMARK_MAP: Record<string, string> = {
  software_developer: "software_development",
  graphic_designer: "logo_design",
  cleaning_sanitization: "cleaning",
  consultant: "consulting",
  property_inspector: "construction_supervision",
  surface_repair: "construction_supervision",
};

const ACTION_CODE_BENCHMARK_MAP: Record<string, string> = {
  A: "cleaning",
  B: "construction_supervision",
  C: "consulting",
  E: "software_development",
  H: "construction_supervision",
};

const ACTION_CODE_OVERRIDES: Record<string, string> = {
  "E.1.1": "logo_design",
  "E.1.2": "logo_design",
  "A.4.2": "cleaning",
  "E.3.1": "software_development",
};

export function getBenchmarkById(id: string): BenchmarkBand | undefined {
  return PRICING_BENCHMARKS.find((band) => band.id === id);
}

export function resolveBenchmarkBand(profession: string, actionCodes: string[]): BenchmarkBand {
  const normalizedProfession = profession.trim().toLowerCase();

  for (const actionCode of actionCodes) {
    const override = ACTION_CODE_OVERRIDES[actionCode.trim().toUpperCase()];
    if (override) {
      const band = getBenchmarkById(override);
      if (band) return band;
    }
  }

  for (const actionCode of actionCodes) {
    const domain = actionCode.trim().charAt(0).toUpperCase();
    const mapped = ACTION_CODE_BENCHMARK_MAP[domain];
    if (mapped) {
      const band = getBenchmarkById(mapped);
      if (band) return band;
    }
  }

  const professionBandId = PROFESSION_BENCHMARK_MAP[normalizedProfession];
  if (professionBandId) {
    const band = getBenchmarkById(professionBandId);
    if (band) return band;
  }

  return PRICING_BENCHMARKS.find((band) => band.id === "consulting")!;
}
