import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  InterestDecision,
  NotInterestedReason,
  Notification,
  Offer,
  Property,
  Viewing,
  ViewingSlot,
} from "@/types";
import {
  clearSessionUser,
  findAccount,
  getSessionUser,
  getUserData,
  saveAccount,
  saveUserData,
  setSessionUser,
} from "@/lib/storage";
import { generateId } from "@/lib/id";
import { createDemoProperties } from "@/lib/seed";
import { computeUpcomingReminders, createNotification } from "@/lib/notifications";

interface AppContextValue {
  user: string | null;
  authReady: boolean;
  properties: Property[];
  notifications: Notification[];
  unreadCount: number;
  signUp: (username: string, password: string) => { ok: boolean; error?: string };
  logIn: (username: string, password: string) => { ok: boolean; error?: string };
  logOut: () => void;
  addProperty: (input: {
    rightmoveUrl: string;
    title: string;
    address: string;
    imageUrl: string;
    enrichedAutomatically: boolean;
  }) => void;
  removeProperty: (propertyId: string) => void;
  bookViewing: (propertyId: string, slot: ViewingSlot) => void;
  markAttended: (propertyId: string, viewingId: string) => void;
  decideInterested: (propertyId: string) => void;
  decideNotInterested: (
    propertyId: string,
    reason: NotInterestedReason,
    detail?: string,
  ) => void;
  makeOffer: (propertyId: string, offer: Omit<Offer, "createdAt">) => void;
  loadDemoData: () => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const DEMO_SIMULATION_ENABLED = process.env.NEXT_PUBLIC_DEMO_SIMULATION !== "false";
const SIMULATION_INTERVAL_MS = 45_000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const hydratedRef = useRef(false);

  // Hydrate from storage on mount only (client-side, avoids SSR/client mismatch).
  useEffect(() => {
    const sessionUser = getSessionUser();
    if (sessionUser) {
      const data = getUserData(sessionUser);
      setUser(sessionUser);
      setProperties(data.properties);
      setNotifications(data.notifications);
    }
    hydratedRef.current = true;
    setAuthReady(true);
  }, []);

  // Write-through to storage on every change, once hydrated.
  useEffect(() => {
    if (!hydratedRef.current || !user) return;
    saveUserData(user, { properties, notifications });
  }, [user, properties, notifications]);

  // Compute upcoming-viewing reminders whenever properties change.
  useEffect(() => {
    if (!hydratedRef.current || !user) return;
    setNotifications((prev) => {
      const reminders = computeUpcomingReminders(properties, prev);
      if (reminders.length === 0) return prev;
      return [...reminders, ...prev];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, user]);

  // Simulated "new slots available" notifications, disabled during E2E runs.
  useEffect(() => {
    if (!DEMO_SIMULATION_ENABLED || !user) return;
    const interval = setInterval(() => {
      setProperties((currentProperties) => {
        const active = currentProperties.filter(
          (p) => !p.removed && p.decision !== "not_interested",
        );
        if (active.length === 0) return currentProperties;
        const target = active[Math.floor(Math.random() * active.length)];
        setNotifications((prev) => [
          createNotification(
            "new_slots",
            target.id,
            `New viewing slots are available for ${target.address}.`,
          ),
          ...prev,
        ]);
        return currentProperties;
      });
    }, SIMULATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  const signUp = useCallback((username: string, password: string) => {
    const trimmed = username.trim();
    if (!trimmed || !password) {
      return { ok: false, error: "Enter a username and password." };
    }
    if (findAccount(trimmed)) {
      return { ok: false, error: "That username is already taken." };
    }
    saveAccount({ username: trimmed, password });
    setSessionUser(trimmed);
    const data = getUserData(trimmed);
    setUser(trimmed);
    setProperties(data.properties);
    setNotifications(data.notifications);
    return { ok: true };
  }, []);

  const logIn = useCallback((username: string, password: string) => {
    const trimmed = username.trim();
    const account = findAccount(trimmed);
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect username or password." };
    }
    setSessionUser(trimmed);
    const data = getUserData(trimmed);
    setUser(trimmed);
    setProperties(data.properties);
    setNotifications(data.notifications);
    return { ok: true };
  }, []);

  const logOut = useCallback(() => {
    clearSessionUser();
    setUser(null);
    setProperties([]);
    setNotifications([]);
  }, []);

  const addProperty = useCallback<AppContextValue["addProperty"]>((input) => {
    const property: Property = {
      id: generateId("property"),
      rightmoveUrl: input.rightmoveUrl,
      title: input.title,
      address: input.address,
      imageUrl: input.imageUrl,
      enrichedAutomatically: input.enrichedAutomatically,
      viewings: [],
      decision: null,
      removed: false,
      createdAt: new Date().toISOString(),
    };
    setProperties((prev) => [property, ...prev]);
  }, []);

  const removeProperty = useCallback((propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
  }, []);

  const bookViewing = useCallback((propertyId: string, slot: ViewingSlot) => {
    const viewing: Viewing = {
      id: generateId("viewing"),
      slotId: slot.id,
      datetime: slot.datetime,
      attended: false,
    };
    let propertyAddress = "";
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        propertyAddress = p.address;
        return { ...p, viewings: [...p.viewings, viewing] };
      }),
    );
    const formatted = new Date(slot.datetime).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    setNotifications((prev) => [
      createNotification(
        "viewing_confirmed",
        propertyId,
        `Viewing confirmed for ${propertyAddress || "your property"} on ${formatted}.`,
      ),
      ...prev,
    ]);
  }, []);

  const markAttended = useCallback((propertyId: string, viewingId: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id !== propertyId
          ? p
          : {
              ...p,
              viewings: p.viewings.map((v) =>
                v.id === viewingId ? { ...v, attended: true } : v,
              ),
            },
      ),
    );
  }, []);

  const decideInterested = useCallback((propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId ? { ...p, decision: "interested" as InterestDecision } : p,
      ),
    );
  }, []);

  const decideNotInterested = useCallback(
    (propertyId: string, reason: NotInterestedReason, detail?: string) => {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? {
                ...p,
                decision: "not_interested" as InterestDecision,
                notInterestedReason: reason,
                notInterestedDetail: detail,
              }
            : p,
        ),
      );
    },
    [],
  );

  const makeOffer = useCallback((propertyId: string, offer: Omit<Offer, "createdAt">) => {
    const fullOffer: Offer = { ...offer, createdAt: new Date().toISOString() };
    let propertyAddress = "";
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        propertyAddress = p.address;
        return { ...p, offer: fullOffer };
      }),
    );
    setNotifications((prev) => [
      createNotification(
        "offer_generated",
        propertyId,
        `Offer email generated for ${propertyAddress || "your property"}.`,
      ),
      ...prev,
    ]);
  }, []);

  const loadDemoData = useCallback(() => {
    setProperties(createDemoProperties());
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value: AppContextValue = {
    user,
    authReady,
    properties,
    notifications,
    unreadCount,
    signUp,
    logIn,
    logOut,
    addProperty,
    removeProperty,
    bookViewing,
    markAttended,
    decideInterested,
    decideNotInterested,
    makeOffer,
    loadDemoData,
    markAllNotificationsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
