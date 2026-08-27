# Design changes to bring in from ollie-homie-mvp

**Purpose:** `homie` (this repo) is our real build — it implements the actual PRD (buyer viewing hub: sign up, track properties via Rightmove link, book viewings, decide interested/not interested, make an offer, notifications). `ollie-homie-mvp` (`/Users/jmooney/ai-step-change/ollie-homie-mvp`) is a static HTML/CSS/JS prototype of a *different, broader* product concept (a multi-role "moving hub" with milestones, tasks, messages, documents, an AI assistant) with almost no real functionality — most of its nav items are literal "Coming later in this build" stubs. It has near-zero functional overlap with our PRD, but its **visual design system is considerably more polished** than our current shadcn-default look, and several concrete UI patterns are worth lifting even though the underlying feature isn't being copied.

This doc only covers **design/UI-system changes**, not features. Nothing here should pull in ollie's actual product scope (milestones, tasks, messages, documents, multi-role switching, AI assistant) — that's out of scope for our PRD.

---

## Current state of our app (baseline, for contrast)

Screenshots taken from a live `npm run dev` run, confirmed working:
- Login/signup: generic shadcn card, default blue primary (`--primary: 221.2 83.2% 53.3%`), plain white background, no visual identity beyond a small home-icon badge.
- Dashboard: three plain white tiles ("My Properties", "Viewing Schedule", "Notifications"), no colour or texture, feels like an admin scaffold rather than a consumer product.
- Properties page / PropertyCard: functionally complete (status badge, action buttons with tooltip-on-disabled, edit/remove), but visually flat — default shadcn `Card`, thin borders, no shadow depth, grey placeholder image box, badge colours are the default shadcn palette (blue/green/amber/red) with no thought given to a cohesive "brand" feel.
- Dark mode: works (class-based, toggle in header) but is just the default shadcn dark palette — cold slate blue-black, not tailored.
- No sidebar — top nav bar with two links. This is fine for our 2-page app and shouldn't change structurally.

## ollie-homie-mvp's design system (source of the ideas below)

Key source files: `css/tokens.css`, `css/base.css`, `css/components.css`, `css/layout.css`, `css/views.css`.

Notable properties of their system:
- **Warm, editorial palette** instead of cold default-blue: warm paper background (`--paper: #fbf9f6`), off-white surfaces, ink-based text colours instead of pure black/grey, a muted sage-green primary (`--primary-500: #5f8a5b`) and a terracotta accent (`--accent-500: #c97a52`) used sparingly. Status colours are deliberately "non-alarmist" (softened blues/oranges/greens rather than saturated shadcn reds/greens).
- **Real design tokens file** — every colour, spacing step, radius, shadow and motion curve is a CSS custom property in one file, so the whole app can be reskinned from one place. We already have this pattern via Tailwind CSS variables (`styles/globals.css` + `tailwind.config.ts`), but our token *values* are the unmodified shadcn defaults.
- **Layered shadows + soft radii**: `--radius-lg: 16px`, `--radius-pill` for badges/chips/avatars, a 4-tier shadow scale (`sm/md/lg/xl`) used to give cards, modals and the floating action button real depth on hover — ours currently uses flat `shadow-sm` everywhere from shadcn defaults.
- **Buttons with a gradient + lift-on-hover**: primary buttons use a subtle vertical gradient and translate up 1px with a bigger shadow on hover/press, giving tactile feedback our flat shadcn buttons don't have.
- **Status badges as pills with icons**, colour-coded per state (complete/in-progress/blocked/not-started/error), consistently used everywhere status appears — same idea as our `StatusBadge`, just visually richer (icon + pill + softer colour).
- **Card hover/press states, `.btn:active { translateY(1px) }`** — small motion details that make the whole thing feel more "designed."
- **A glass/blur top bar** (`backdrop-filter: blur`) that gains a shadow only once the page scrolls — nice polish, low effort.
- **A floating "Ask Homie" FAB** — bottom-right circular button that expands to show a label on hover. Not something we need (no AI assistant in our PRD) but the *component pattern* (FAB with expanding label) could be reused for something like a persistent "Add Property" quick action if desired — optional, not required.
- **Toasts styled dark-on-light-background** (ink-coloured toast, paper text) instead of default shadcn/sonner white toast — more distinctive.
- **Empty/loading/blocked state panel component** (`state-panel`) — icon in a soft circular badge, heading, supporting copy — reused consistently for every "nothing here yet" case. We have one bespoke empty state (`properties.tsx` `EmptyState`); worth generalizing this pattern since we'll likely want it on the dashboard tiles too.
- **Dark mode explicitly deferred in ollie** (they left a comment marker, light-only by design for demo clarity) — so nothing to copy there; our dark mode already works and should just get restyled with the new tokens, not architecturally changed.

---

## Recommended changes (design system only)

### 1. Replace the default shadcn colour tokens with a warmer, branded palette
- Edit `styles/globals.css` CSS variables (`--background`, `--primary`, `--secondary`, `--muted`, `--accent`, `--card`, `--border`, etc.) for both `:root` and `.dark` to move off default "Tailwind blue on white/slate" toward something closer to ollie's warm paper/ink/sage palette — e.g. warm off-white background instead of pure white, a muted green or warm neutral as primary instead of saturated blue, softened status colours.
- Keep the HSL-variable + Tailwind-alias mechanism we already have (`tailwind.config.ts` `colors.primary.DEFAULT: "hsl(var(--primary))"` etc.) — just change the values, not the architecture.
- Update `--radius` from `0.5rem` toward something slightly larger (ollie uses 12–16px for cards) for a softer feel.

### 2. Add shadow depth and hover/press motion to cards and buttons
- `components/ui/card.tsx`: add a subtle shadow (beyond the current flat `shadow-sm`) and a hover-elevate transition on interactive cards (dashboard tiles already use `hover:bg-accent/50` — pair that with a shadow lift, matching ollie's `.card` hover treatment).
- `components/ui/button.tsx`: add a small `active:translate-y-px` / hover shadow treatment to the `default` (primary) variant so buttons feel pressed, matching ollie's `.btn--primary` tactile feedback. Pure CSS/Tailwind class change, no structural change.

### 3. Restyle status badges with the "non-alarmist" colour approach
- `lib/status.ts` / `components/properties/StatusBadge.tsx` currently map to shadcn badge variants (`default`, `secondary`, `success`, `warning`, `outline`). Keep the logic, but retune `components/ui/badge.tsx` variant colours to softer, pill-shaped, icon-optional badges in the spirit of ollie's `.badge--complete/progress/blocked/not_started` (soft-tinted background + matching text colour, not solid saturated fill).
- Optional: add a small leading icon to the badge (lucide-react icons are already a dependency) matching ollie's icon-in-badge pattern — e.g. a calendar icon for "Viewing Scheduled," a checkmark for "Interested," an archive icon for "Archived."

### 4. Give the dashboard and empty states more visual identity
- `pages/dashboard.tsx`: the three tiles are currently plain white cards with a small icon badge — apply the new shadow/hover treatment from #2, and consider a subtle accent-tinted background on the icon badges (ollie uses `--role-accent-bg` tinting) instead of solid `bg-primary`.
- Generalize the `EmptyState` pattern already written ad hoc in `pages/properties.tsx` into a small reusable component (icon in a soft circular tint, heading, supporting copy, actions) so it can be reused on `pages/schedule.tsx` and `pages/notifications.tsx` empty states too (right now those are just a plain "No X yet" text string per the screenshots — e.g. `/tmp/homie-screens/schedule.png`, `notifications.png` — no icon, no visual match to the properties empty state).

### 5. Topbar polish
- `components/layout/AppShell.tsx`: the header already does `backdrop-blur` — good. Consider adding ollie's "shadow only appears once scrolled" detail (small `scroll` listener toggling a class) for a bit of extra polish. Low priority, cosmetic only.

### 6. Toast styling
- We use `sonner` (already a dependency) with default styling. Consider customizing its theme (ink-on-paper look, matching the rest of the new palette) rather than leaving default light/dark sonner styling, so success/error toasts (e.g. "Viewing booked — confirmed instantly," "Offer email generated and saved") feel consistent with the rest of the UI.

### 7. Property card image placeholder
- Currently a flat grey box (`bg-muted`) when no real image is available. ollie uses a soft gradient placeholder (`linear-gradient(135deg, primary-100, accent-100)`) for its property card image slot — a small, cheap visual upgrade for the (likely common, given Rightmove-enrichment can fail) manual-entry / no-image case.

---

## Explicitly NOT recommended (out of scope)

- **Do not** adopt ollie's sidebar+topbar shell layout, multi-role switching, or its route structure — our app is a simpler 2-nav-link buyer-only app per the PRD, and ollie's shell is built for a 4-role, 9-route product we're not building.
- **Do not** pull in the "Ask Homie" AI assistant panel/FAB, milestones/journey timeline, tasks list, messages/threads, or documents views — none of this is in our PRD scope, and most of it isn't even really built in ollie itself (stub pages).
- **Do not** copy ollie's dark-mode decision (they deliberately shipped light-only) — our PRD requires dark mode and we already have a working implementation; only the colour values should change, not the presence of the feature.
- **Do not** restructure our token architecture (Tailwind CSS variables) to match ollie's raw-CSS-custom-properties approach — the mechanism is equivalent, only the values need to change.

## Suggested order of work for the next session

1. Retune `styles/globals.css` colour tokens (light + dark) and `--radius`.
2. Update `components/ui/badge.tsx` variant styling for the softer pill look.
3. Update `components/ui/card.tsx` and `components/ui/button.tsx` for shadow/hover/press treatment.
4. Extract a shared `EmptyState` component and use it on dashboard/properties/schedule/notifications.
5. Polish property card image placeholder gradient.
6. Optional: sonner toast theming, scroll-shadow topbar detail.

After each step, visually re-check both light and dark mode on: login, dashboard, properties (populated via "Load demo data"), and one dialog (Book Viewing or Make an Offer), since those are the screens most exercised by the Playwright e2e suite already in `e2e/`.
