import type { Property, Viewing } from "@/types";
import type { BadgeProps } from "@/components/ui/badge";

export interface PropertyStatus {
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}

export function isViewingAttended(viewing: Viewing, now: number = Date.now()): boolean {
  return viewing.attended || new Date(viewing.datetime).getTime() < now;
}

export function hasAttendedViewing(property: Property, now: number = Date.now()): boolean {
  return property.viewings.some((v) => isViewingAttended(v, now));
}

function nextUpcomingViewing(property: Property, now: number = Date.now()): Viewing | undefined {
  return property.viewings
    .filter((v) => new Date(v.datetime).getTime() >= now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];
}

export function getPropertyStatus(property: Property, now: number = Date.now()): PropertyStatus {
  if (property.decision === "not_interested") {
    return { label: "Archived — Not Interested", variant: "secondary" };
  }
  if (property.offer) {
    return { label: "Offer Sent", variant: "success" };
  }
  if (property.decision === "interested") {
    return { label: "Interested", variant: "success" };
  }
  if (hasAttendedViewing(property, now)) {
    return { label: "Viewed — Awaiting Decision", variant: "warning" };
  }
  const upcoming = nextUpcomingViewing(property, now);
  if (upcoming) {
    const formatted = new Date(upcoming.datetime).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    return { label: `Viewing Scheduled — ${formatted}`, variant: "default" };
  }
  return { label: "Tracking", variant: "outline" };
}

export interface PropertyActionState {
  enabled: boolean;
  reason?: string;
}

export interface PropertyActions {
  bookViewing: PropertyActionState;
  decide: PropertyActionState;
  makeOffer: PropertyActionState;
}

export function getPropertyActions(property: Property, now: number = Date.now()): PropertyActions {
  const archived = property.decision === "not_interested";

  return {
    bookViewing: archived
      ? { enabled: false, reason: "This property has been archived" }
      : { enabled: true },
    decide:
      archived || property.decision === "interested"
        ? { enabled: false, reason: archived ? "This property has been archived" : "You've already made a decision on this property" }
        : hasAttendedViewing(property, now)
          ? { enabled: true }
          : { enabled: false, reason: "Available after you've attended a viewing" },
    makeOffer:
      property.decision === "interested"
        ? { enabled: true }
        : { enabled: false, reason: "Mark the property as Interested first" },
  };
}
