import type { TimelineFilterId } from "../domain/timeline-state.js";
import { isTimelineFilterId } from "../domain/timeline-state.js";

export interface TimelineFilterValidation {
  valid: boolean;
  errors: string[];
}

export function validateTimelineFilter(filter: string): TimelineFilterValidation {
  if (!isTimelineFilterId(filter)) {
    return { valid: false, errors: [`Unknown filter: ${filter}`] };
  }
  return { valid: true, errors: [] };
}

export function validateTimelineSession(input: {
  eventCount: number;
  activeEventId?: string;
  filter: TimelineFilterId;
}): TimelineFilterValidation {
  const errors: string[] = [];
  if (input.eventCount === 0) {
    errors.push("No timeline events available");
  }
  if (!isTimelineFilterId(input.filter)) {
    errors.push("Invalid active filter");
  }
  return { valid: errors.length === 0, errors };
}
