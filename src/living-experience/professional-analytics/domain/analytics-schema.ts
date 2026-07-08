export const LIVING_PROFESSIONAL_ANALYTICS_SCHEMA_VERSION = "living-professional-analytics-v1" as const;

export const LIVING_PROFESSIONAL_ANALYTICS_SECTIONS = [
  "analytics_summary",
  "professional_growth",
  "performance_metrics",
  "skills_analytics",
  "financial_analytics",
  "productivity_analytics",
  "opportunity_analytics",
  "risk_analytics",
  "achievement_analytics",
  "trend_analysis",
  "recommended_insights",
  "confidence_explanation",
  "analytics_history",
] as const;

export type LivingProfessionalAnalyticsSectionId =
  (typeof LIVING_PROFESSIONAL_ANALYTICS_SECTIONS)[number];

export const LIVING_PROFESSIONAL_ANALYTICS_SECTION_LABELS: Record<
  LivingProfessionalAnalyticsSectionId,
  string
> = {
  analytics_summary: "Analytics Summary",
  professional_growth: "Professional Growth",
  performance_metrics: "Performance Metrics",
  skills_analytics: "Skills Analytics",
  financial_analytics: "Financial Analytics",
  productivity_analytics: "Productivity Analytics",
  opportunity_analytics: "Opportunity Analytics",
  risk_analytics: "Risk Analytics",
  achievement_analytics: "Achievement Analytics",
  trend_analysis: "Trend Analysis",
  recommended_insights: "Recommended Insights",
  confidence_explanation: "Confidence & Explanation",
  analytics_history: "Analytics History",
};

export const LIVING_PROFESSIONAL_ANALYTICS_ROUTES = [
  "/living-professional-analytics",
  "/living-professional-analytics/sections",
  "/living-professional-analytics/summary",
  "/living-professional-analytics/growth",
  "/living-professional-analytics/performance",
  "/living-professional-analytics/skills",
  "/living-professional-analytics/financial",
  "/living-professional-analytics/productivity",
  "/living-professional-analytics/opportunities",
  "/living-professional-analytics/risks",
  "/living-professional-analytics/achievements",
  "/living-professional-analytics/trends",
  "/living-professional-analytics/insights",
  "/living-professional-analytics/confidence",
  "/living-professional-analytics/history",
  "/living-professional-analytics/accept",
  "/living-professional-analytics/ignore",
  "/living-professional-analytics/refresh",
  "/living-professional-analytics/statistics",
] as const;

export const LIVING_PROFESSIONAL_ANALYTICS_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-analytics-v1.json",
  title: "LivingProfessionalAnalytics",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_ANALYTICS_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;
