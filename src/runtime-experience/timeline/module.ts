export {
  TIMELINE_EXPERIENCE_VERSION,
  TIMELINE_SCREEN_IDS,
  TIMELINE_SCREEN_PROTOTYPE_MAP,
  TIMELINE_SCREEN_ROUTES,
  TIMELINE_EXPERIENCE_FLOW,
  TIMELINE_LIFECYCLE_FLOW,
  isTimelineScreenId,
  type TimelineScreenId,
  type TimelineRuntimeScreenView,
  type TimelineScreenSection,
  type RuntimeComponentInstance,
} from "./domain/timeline-screen.js";

export {
  buildTimelineEvent,
  sortTimelineEvents,
  compareTimelineEvents,
  TIMELINE_EVENT_TYPE_ORDER,
  type TimelineEvent,
  type TimelineEventType,
  type TimelineEventStatus,
} from "./domain/timeline-event.js";

export {
  buildTimelineSummary,
  type TimelineSummary,
  type TimelineLifecycleStage,
} from "./domain/timeline-summary.js";

export {
  resolveTimelineLayoutBinding,
  buildTimelineScreenContext,
  resolveTimelineThemeColors,
} from "./domain/timeline-layout.js";

export {
  createTimelineSessionState,
  TIMELINE_FILTER_IDS,
  isTimelineFilterId,
  type TimelineSessionState,
  type TimelineFilterId,
} from "./domain/timeline-state.js";

export {
  TimelineExperienceService,
  createTimelineExperienceModule,
  createTimelineExperienceService,
  type TimelineExperienceModule,
  type TimelineAction,
} from "./application/timeline-experience-service.js";

export {
  TIMELINE_NAV_ITEMS,
  buildTimelineNavigationView,
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  navigateToDetail,
  buildNavigationAccessibility,
} from "./application/timeline-navigation.js";

export {
  groupEventsByDate,
  buildProgressStages,
  applyTimelineFilter,
  TIMELINE_PROGRESS_STAGES,
  type TimelineDateGroup,
  type TimelineProgressStage,
} from "./application/timeline-builder.js";

export {
  validateTimelineFilter,
  validateTimelineSession,
  type TimelineFilterValidation,
} from "./application/timeline-validator.js";

export { buildTimelineHomeScreen } from "./presentation/timeline-home.js";
export { buildTimelineHistoryScreen } from "./presentation/timeline-history.js";
export { buildTimelineDetailScreen } from "./presentation/timeline-detail.js";
export { buildTimelineProgressScreen } from "./presentation/timeline-progress.js";
export { buildTimelineFiltersScreen } from "./presentation/timeline-filters.js";
export { buildTimelineEmptyStateScreen } from "./presentation/timeline-empty-state.js";
export { buildRuntimeScreenView, buildComponentInstance } from "./presentation/screen-builder.js";

export {
  TimelineRepository,
  createTimelineRepository,
  timelineRepository,
} from "./infrastructure/timeline-repository.js";

export {
  validateTimelineExperience,
  type TimelineExperienceValidationResult,
} from "./validation/timeline-experience-validator.js";

import { validateTimelineExperience } from "./validation/timeline-experience-validator.js";
import { TIMELINE_EXPERIENCE_VERSION } from "./domain/timeline-screen.js";
import { TimelineExperienceService, createTimelineExperienceService } from "./application/timeline-experience-service.js";

export interface AnActTimelineExperienceModule {
  version: typeof TIMELINE_EXPERIENCE_VERSION;
  timelineExperience: TimelineExperienceService;
  validate: typeof validateTimelineExperience;
}

export function createAnActTimelineExperienceModule(): AnActTimelineExperienceModule {
  const timelineExperience = createTimelineExperienceService();
  return {
    version: TIMELINE_EXPERIENCE_VERSION,
    timelineExperience,
    validate: validateTimelineExperience,
  };
}

export const TIMELINE_EXPERIENCE_PHILOSOPHY = {
  name: "AN ACT Timeline Experience",
  version: TIMELINE_EXPERIENCE_VERSION,
  principles: [
    "Read-only chronological view of the AN ACT lifecycle",
    "Visualizes progress only — never modifies lifecycle state",
    "Consumes CH3-X1 through CH3-X8 foundations",
    "No AI, no business logic, no realtime networking",
    "Official runtime timeline experience for AN ACT",
  ],
} as const;
