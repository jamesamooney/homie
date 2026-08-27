export interface Account {
  username: string;
  password: string;
}

export type NotInterestedReason =
  | "Price"
  | "Condition/Repairs Needed"
  | "Location"
  | "Size/Layout"
  | "Noise"
  | "Other";

export interface ViewingSlot {
  id: string;
  datetime: string;
  available: boolean;
}

export interface Viewing {
  id: string;
  slotId: string;
  datetime: string;
  attended: boolean;
}

export interface Offer {
  amount: string;
  agentName: string;
  agentEmail?: string;
  notes?: string;
  generatedEmail: string;
  createdAt: string;
}

export type InterestDecision = "interested" | "not_interested" | null;

export interface Property {
  id: string;
  rightmoveUrl: string;
  title: string;
  address: string;
  imageUrl: string;
  enrichedAutomatically: boolean;
  viewings: Viewing[];
  decision: InterestDecision;
  notInterestedReason?: NotInterestedReason;
  notInterestedDetail?: string;
  offer?: Offer;
  removed: boolean;
  createdAt: string;
}

export type NotificationType =
  | "viewing_confirmed"
  | "viewing_reminder"
  | "new_slots"
  | "offer_generated";

export interface Notification {
  id: string;
  type: NotificationType;
  propertyId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UserData {
  properties: Property[];
  notifications: Notification[];
}
