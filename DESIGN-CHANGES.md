# Design changes to bring in from the Stitch concepts (`ollie-stitch`)

**Purpose:** `homie` (this repo) implements the actual PRD — a buyer viewing hub: sign up, track properties via a Rightmove link, book viewings, decide interested/not interested, make an offer, get notifications. The six Stitch exports in `/Users/jmooney/ai-step-change/ollie-stitch` (`stitch_homie_transaction_operating_system(1-5).zip`) are AI-generated mockups for a **much broader "transaction operating system" product** — Mission Control dashboard with blockers/ETA, a multi-step Journey stepper for sale+purchase, a Document Hub, a Tasks list, and an AI Chat assistant. That product has almost no functional overlap with our PRD (no documents, no legal/conveyancing journey, no chat, no multi-transaction tracking in our data model). This doc only pulls in **visual/UI-system ideas that fit our existing, working functionality** — nothing here should pull in the broader feature set.

This replaces the previous version of this file (which covered bringing design ideas in from `ollie-homie-mvp`). That work has already been actioned: the app already runs a warm sage/paper palette, soft pill-shaped status badges, shadowed/lifted cards and buttons, and a generalized `EmptyState` component. Confirmed by re-running the app (`npm run dev`) and screenshotting login, dashboard, properties (populated + empty), schedule, and notifications in both light/dark and desktop/mobile viewports before writing this doc.

---

## Current state of our app (baseline, re-verified)

- **Pages:** `login`, `dashboard` (3 tiles: My Properties / Viewing Schedule / Notifications), `properties` (tabbed Active/Archived, `PropertyCard` grid, Add Property dialog, Book Viewing / Decide / Make Offer dialogs per card), `schedule` (Upcoming/Past list of viewings), `notifications` (flat list, mark-all-read on open).
- **Shell:** `components/layout/AppShell.tsx` — single sticky top header (logo + "Properties"/"Schedule" text links, hidden below `sm`, user name, notification bell, dark-mode toggle, logout). On mobile the nav links simply disappear (`hidden sm:flex`) — there is **no mobile navigation affordance at all** below the `sm` breakpoint other than the bell icon and logo-as-home-link. This is the main structural gap.
- **Visual system already matches the "warm/editorial" direction:** `styles/globals.css` uses a warm off-white background (`36 38.5% 97.5%`), muted sage primary (`114.9 20.5% 44.9%`), terracotta-ish accent, `--radius: 0.75rem`; `components/ui/card.tsx` has a soft diffused shadow; `components/ui/button.tsx` has `active:translate-y-px` press feedback; `components/ui/badge.tsx` uses soft-tinted pill badges per status; `components/EmptyState.tsx` is a shared icon-in-circle/heading/description/actions component reused across properties/schedule/notifications. **None of this needs to change.**
- **Typography:** default Tailwind/shadcn system font stack (no custom webfont loaded) — this is the one visual gap versus the Stitch mockups' more considered type system.

## The Stitch concept's design system (source: `DESIGN.md` inside each export — identical across all 6)

- **Name:** "Serene Dwelling." Same palette family as before (warm cream `#fbf9f5` surface, deep sage `#334f2b`/`#496640` primary, charcoal ink text) — validates the palette direction we've already shipped, doesn't require new palette work.
- **Typography:** dual-font system — **Hanken Grotesk** (headlines, tightened letter-spacing, weight 500–600) + **Inter** (body/labels/inputs, weight 400 body / 500–600 interactive). We currently use neither; this is a genuinely new, low-risk upgrade.
- **Elevation:** "tonal layers + ambient shadows" — very soft, highly diffused shadows (`y:4px blur:20px opacity:0.04`), not heavy drop shadows. Close to what we already have in `card.tsx`; no change needed.
- **Shape:** 8px buttons/inputs, 16px cards, fully-pill status/progress elements — matches our current `--radius: 0.75rem` (12px) reasonably closely already.
- **Status pills:** "soft-on-soft" (pale tint background + darker text of the same hue) — this is exactly what `badge.tsx` already does. No change needed.
- **The one structural UI pattern not in our app at all: a fixed bottom tab bar for mobile**, used on every mockup screen (`nav` fixed to viewport bottom, `backdrop-blur`, active tab shown in solid primary colour with filled icon, inactive tabs in muted outline icon + label). In the mockups it has 5 destinations (Control/Journey/Tasks/Files/Chat) because it's built for the broader product — we don't have those pages.

---

## Recommended changes

### 1. Add a fixed bottom navigation bar on mobile (the main ask)

This is the one piece of Stitch's shell that's a genuine structural gap in our app today, not just a colour/shadow tweak — and it directly fixes the "no mobile nav" gap noted above.

- **Scope:** mobile only (below the existing `sm` breakpoint where the current top-bar text links already disappear). **Desktop keeps the current top bar exactly as-is** — no changes to `sm:flex` nav, no changes to header layout on wider viewports.
- **Component:** new `components/layout/BottomNav.tsx`, rendered from `AppShell.tsx` alongside the existing `<header>`, wrapped in a `sm:hidden` container fixed to the bottom of the viewport (`fixed bottom-0 inset-x-0 z-40`), styled to match the existing header's `backdrop-blur` + `border-t` + `bg-background/95` treatment already used at the top.
- **Destinations — map to our actual 4 routes** (not Stitch's 5, since we have no Journey/Tasks/Files/Chat):
  - **Dashboard** (`/dashboard`) — icon `LayoutDashboard` or `Home`, label "Home"
  - **Properties** (`/properties`) — icon `Home` or `Building2`, label "Properties"
  - **Schedule** (`/schedule`) — icon `CalendarClock` (already imported elsewhere), label "Schedule"
  - **Notifications** (`/notifications`) — icon `Bell`, label "Alerts", with the existing unread-count treatment (small dot/count, same source as `NotificationBell`) shown on the icon instead of a separate header bell
- Active tab styled per Stitch: solid primary-coloured icon + label (`text-primary`, filled icon variant where lucide supports it) vs muted `text-muted-foreground` for inactive, using `router.pathname` exactly like the existing desktop nav's active-state check.
- Since the bottom nav covers notifications and navigation, **hide the header's `NotificationBell` and the "Homie" wordmark's excess chrome on mobile** is not necessary — keep the header as-is (logo + user + dark-mode toggle + logout) and simply stop rendering the bell twice; the mobile bell moves to the bottom nav's "Alerts" tab only. Logout and dark-mode toggle stay in the top header on all breakpoints — they're infrequent actions and don't need bottom-nav space.
- Add bottom padding to `<main>` on mobile (e.g. `pb-20 sm:pb-8`) so page content doesn't sit under the fixed bar.
- This is a pure additive layout change — no page, dialog, or data-flow logic changes required. `data-testid`s on existing header elements are untouched; the Playwright e2e suite drives flows through the pages, not the header, so this should not require e2e changes (worth a quick check once implemented).

### 2. Adopt the dual-font system (Hanken Grotesk + Inter)

- Load both via `next/font/google` in `pages/_app.tsx` (avoids a render-blocking `<link>`, keeps our existing no-external-CSS-file approach).
- Wire `font-sans` (body/Inter) as the Tailwind default and add a `font-heading` (Hanken Grotesk) utility in `tailwind.config.ts`, applied to page `<h1>`s and `CardTitle` only — a small, contained change, not a full restyle.
- Low risk, no functional impact, closes the one real gap between our type system and the mockups' more "premium SaaS" feel.

### 3. Optional: give the Schedule page's next upcoming viewing a highlighted card treatment

- Stitch's "Your Viewings" screen shows the next upcoming viewing as a larger photo card (property image, date pill overlay, agent, "Get Directions") versus older viewings shown as plain rows.
- We already store `property.imageUrl` (used in `PropertyCard`) and have all the data (`ScheduledViewing` → `viewing.datetime`, `property`) needed to do this with zero new state — `pages/schedule.tsx`'s `ScheduleRow` for just the *first* upcoming item could render a bigger card variant (image thumbnail + date badge) while the rest of the upcoming/past lists stay as the current compact rows.
- Purely presentational, optional — current flat list already works and is functionally complete; only worth doing if there's spare time after #1.

---

## Explicitly NOT recommended (out of scope)

- **Do not** build a "Mission Control" dashboard with ETA countdowns, a "Current Blocker" panel, or a sale/purchase progress-percentage pair — our data model has no transaction-completion date, blocker, or dual sale+purchase concept; our dashboard's 3-tile summary already covers the PRD's scope.
- **Do not** build the "Your Journey" vertical stepper (Property listed → Offer accepted → Solicitor instructed → Enquiries resolved → Exchange & Completion) — this is post-offer conveyancing tracking, entirely outside our PRD's "book viewings, decide, make an offer" scope.
- **Do not** build the Document Hub, Tasks list, or AI Chat — none of these exist in our PRD or data model; the bottom nav should only ever contain routes that actually exist in this app.
- **Do not** copy the "Get an AI Update" floating pill button — no AI assistant in our PRD.
- **Do not** re-theme colours, shadows, radii, or badge styling — that work is already done and already close to the Stitch palette; re-doing it isn't needed.
- **Do not** change the desktop layout — the bottom nav is mobile-only; desktop keeps its current top bar unchanged.

## Suggested order of work for the next session

1. Build `components/layout/BottomNav.tsx` and wire it into `AppShell.tsx` (mobile-only, 4 tabs, active-state matching `router.pathname`), remove the duplicate mobile header bell, add `pb-*` spacing to `<main>`.
2. Run the existing Playwright suite (`npm run test:e2e`) to confirm no regressions from the header/layout change, especially any test that measures viewport at mobile width.
3. Add Hanken Grotesk + Inter via `next/font/google`, wire `font-sans`/`font-heading` in Tailwind config, apply heading font to `h1`/`CardTitle` only.
4. Re-screenshot dashboard/properties/schedule/notifications at a mobile viewport (e.g. 390×844) in both light and dark mode to confirm the bottom nav reads correctly against both themes and doesn't overlap toast notifications (`sonner` is positioned `bottom-right` — check it doesn't collide with the new bottom nav on mobile; may need `position="top-center"` on mobile or extra bottom offset).
5. Optional: schedule page hero card for the next upcoming viewing (#3 above).
