import type { Notification, NotificationType, Property } from "@/types";
import { generateId } from "@/lib/id";

export function createNotification(
  type: NotificationType,
  propertyId: string,
  title: string,
  message: string,
): Notification {
  return {
    id: generateId("notif"),
    type,
    propertyId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

const REMINDER_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Computes "upcoming viewing" reminders for viewings within the next 48h that don't
 * already have a reminder notification recorded.
 */
export function computeUpcomingReminders(
  properties: Property[],
  existing: Notification[],
  now: number = Date.now(),
): Notification[] {
  const existingKeys = new Set(
    existing.filter((n) => n.type === "viewing_reminder").map((n) => n.propertyId + "|" + n.message),
  );
  const reminders: Notification[] = [];

  for (const property of properties) {
    if (property.removed) continue;
    for (const viewing of property.viewings) {
      const time = new Date(viewing.datetime).getTime();
      if (time < now || time > now + REMINDER_WINDOW_MS) continue;
      const formatted = new Date(viewing.datetime).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      });
      const message = `Reminder: your viewing at ${property.address} is coming up (${formatted}).`;
      const key = property.id + "|" + message;
      if (existingKeys.has(key)) continue;
      reminders.push(
        createNotification("viewing_reminder", property.id, "Upcoming viewing reminder", message),
      );
    }
  }

  return reminders;
}
