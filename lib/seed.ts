import type { Property, ViewingSlot } from "@/types";

/** Simple string hash so slot generation is deterministic per property id. */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const WEEKDAY_HOURS = [17, 18, 19];
const SATURDAY_HOURS = [9, 10, 11, 12, 13];

/**
 * Generates mocked seller/agent availability for the next 14 days.
 * Deterministic per property id so re-opening the booking dialog shows the same slots.
 */
export function generateSlotsForProperty(propertyId: string, from: Date = new Date()): ViewingSlot[] {
  const seed = hashString(propertyId);
  const slots: ViewingSlot[] = [];
  let slotIndex = 0;

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const day = new Date(from);
    day.setDate(day.getDate() + dayOffset);
    day.setHours(0, 0, 0, 0);
    const dayOfWeek = day.getDay();

    let hours: number[] = [];
    if (dayOfWeek === 6) {
      hours = SATURDAY_HOURS;
    } else if (dayOfWeek !== 0) {
      hours = WEEKDAY_HOURS;
    }

    for (const hour of hours) {
      const slotDate = new Date(day);
      slotDate.setHours(hour, 0, 0, 0);
      const takenSignal = (seed + slotIndex * 7) % 3 === 0;
      slots.push({
        id: `${propertyId}_slot_${slotIndex}`,
        datetime: slotDate.toISOString(),
        available: !takenSignal,
      });
      slotIndex += 1;
    }
  }

  return slots;
}

const DEMO_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23cbd5e1'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%2364748b' text-anchor='middle' dy='.3em'%3EProperty photo%3C/text%3E%3C/svg%3E";

/** Seeds a handful of properties across different statuses for the "Load demo data" action. */
export function createDemoProperties(): Property[] {
  const now = Date.now();
  const past = (days: number) => new Date(now - days * 86400000).toISOString();
  const future = (days: number) => new Date(now + days * 86400000).toISOString();

  return [
    {
      id: "demo_1",
      rightmoveUrl: "https://www.rightmove.co.uk/properties/000000001",
      title: "3 Bed Terraced House",
      address: "12 Maple Street, Bristol, BS6 5TF",
      imageUrl: DEMO_IMAGE,
      enrichedAutomatically: true,
      viewings: [],
      decision: null,
      removed: false,
      createdAt: past(5),
      bedrooms: 3,
      price: "£425,000",
      listedDate: "02/07/2026",
      sellingAgent: "Hunters",
    },
    {
      id: "demo_2",
      rightmoveUrl: "https://www.rightmove.co.uk/properties/000000002",
      title: "2 Bed Garden Flat",
      address: "45 Elm Avenue, Bristol, BS8 2QN",
      imageUrl: DEMO_IMAGE,
      enrichedAutomatically: true,
      viewings: [
        {
          id: "demo_2_viewing_1",
          slotId: "demo_2_slot_seed",
          datetime: future(3),
          attended: false,
        },
      ],
      decision: null,
      removed: false,
      createdAt: past(4),
      bedrooms: 2,
      price: "£310,000",
      listedDate: "14/07/2026",
      sellingAgent: "Foxtons",
    },
    {
      id: "demo_3",
      rightmoveUrl: "https://www.rightmove.co.uk/properties/000000003",
      title: "4 Bed Detached House",
      address: "8 Orchard Close, Bristol, BS9 1LP",
      imageUrl: DEMO_IMAGE,
      enrichedAutomatically: true,
      viewings: [
        {
          id: "demo_3_viewing_1",
          slotId: "demo_3_slot_seed",
          datetime: past(2),
          attended: true,
        },
      ],
      decision: "interested",
      removed: false,
      createdAt: past(10),
      bedrooms: 4,
      price: "£650,000",
      listedDate: "20/06/2026",
      sellingAgent: "Savills",
    },
    {
      id: "demo_4",
      rightmoveUrl: "https://www.rightmove.co.uk/properties/000000004",
      title: "1 Bed City Centre Apartment",
      address: "3 Harbourside Way, Bristol, BS1 5UH",
      imageUrl: DEMO_IMAGE,
      enrichedAutomatically: false,
      viewings: [
        {
          id: "demo_4_viewing_1",
          slotId: "demo_4_slot_seed",
          datetime: past(6),
          attended: true,
        },
      ],
      decision: "not_interested",
      notInterestedReasons: ["Noise"],
      notInterestedDetail: undefined,
      removed: false,
      createdAt: past(14),
      bedrooms: 1,
      price: "£220,000",
      sellingAgent: "Knight Frank",
    },
  ];
}
