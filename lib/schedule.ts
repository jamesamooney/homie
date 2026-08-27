import type { Property, Viewing } from "@/types";
import { isViewingAttended } from "@/lib/status";

export interface ScheduledViewing {
  viewing: Viewing;
  property: Property;
}

/** Flattens every booked viewing across all tracked (non-removed) properties, earliest first. */
export function getAllViewings(properties: Property[]): ScheduledViewing[] {
  return properties
    .filter((p) => !p.removed)
    .flatMap((property) => property.viewings.map((viewing) => ({ viewing, property })))
    .sort((a, b) => new Date(a.viewing.datetime).getTime() - new Date(b.viewing.datetime).getTime());
}

export interface SplitViewings {
  upcoming: ScheduledViewing[];
  past: ScheduledViewing[];
}

/** Splits a flattened viewing list into upcoming (earliest first) and past (most recent first). */
export function splitUpcomingPast(
  scheduled: ScheduledViewing[],
  now: number = Date.now(),
): SplitViewings {
  const upcoming = scheduled.filter((s) => !isViewingAttended(s.viewing, now));
  const past = scheduled
    .filter((s) => isViewingAttended(s.viewing, now))
    .sort((a, b) => new Date(b.viewing.datetime).getTime() - new Date(a.viewing.datetime).getTime());
  return { upcoming, past };
}
