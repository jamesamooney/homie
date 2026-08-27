# Design changes: adopt the real Homie logo + brand palette

**Purpose of this doc:** two new assets landed at the repo root — `logo.png` (the actual Homie app icon) and `colour-palette.png` (a brand sheet: logo variations, app icon previews, real-world mockups, colour palette, typography, UI examples). Today the app does not use either: there is no `public/` directory, no favicon, no app icon, and the "logo" in the header/login screen is a placeholder (a plain lucide `Home` icon in a coloured box). The colours in `styles/globals.css` are also an earlier approximation, not the official brand values. This doc is a full plan to wire in the real logo and retint the app to the real palette. **Do not execute this in the current session — it's written for a fresh session with no other context**, so it repeats file paths and current values in full rather than assuming prior discussion.

This is a visual-only change. No functional/data/routing changes are in scope.

---

## 1. The logo (`logo.png`)

A rounded-square icon, sage-green background, with a white glyph that reads as a stylised **H** — the two uprights of the H are drawn as rounded pill shapes, and the crossbar is a downward-pointing chevron/roof shape, so the whole mark doubles as a little house silhouette. Sitting inside that roof shape, centred at the bottom, is a small 2×2 grid of "window" squares in a warm tan colour. Wordmark "Homie" (used in lockups, not in this file itself) is set in charcoal, bold/semibold geometric sans.

The team supplied the exact swatch-to-role mapping for this mark, confirmed against `colour-palette.png`:

| Role | Colour | Hex |
|---|---|---|
| Icon background | Sage | `#9AAD96` |
| H mark | White | `#FFFFFF` |
| Windows | Warm Sand | `#D6BE8A` |
| Wordmark | Charcoal | `#111827` |

`colour-palette.png` additionally documents (all consistent with the table above):
- **Full palette:** Sage `#9AAD96`, Deep Forest `#243A33`, Charcoal `#111827`, Warm Sand `#D6BE8A`, Cream `#F8F7F3`, Stone `#D6D3CD`.
- **Usage ratio bar:** ~60% neutral (cream/paper), 25% Deep Forest, 10% Sage, 5% Warm Sand — i.e. the brand is a mostly-neutral, editorial palette with sage/forest as the accent, not a "green app" where green is everywhere.
- **Typography:** Inter SemiBold shown as the type sample (headings + body weight variation), no second display face called out as mandatory.
- **Logo lockups:** icon-only (app icon/favicon), stacked (icon over wordmark, for splash/social), horizontal (icon beside wordmark, for headers/site nav) — three official variations, all built from the same icon file.
- **UI examples panel:** primary button = solid Sage fill; secondary button = outline; tertiary = text link; status-style icons shown in Deep Forest line-art.

### What to actually do with the logo file

1. Create `public/` (doesn't exist yet) and move `logo.png` there as the canonical source icon, e.g. `public/logo.png` (1024×1024 source, square, transparent-safe background already baked in as off-white — check if a transparent-background export is available/needed; if not, the near-white `#FBFBFB`-ish backdrop in the current PNG is close enough to both light/dark app backgrounds that it's acceptable to ship as-is, but flag this to the user rather than silently deciding).
2. Generate the standard derived assets from that source (requires actual image resizing — use `sharp` or `next/image` at build time, or a one-off script; this repo has no image-processing dependency today, so add one, e.g. `sharp`, as a devDependency for a one-time generation script, or resize manually and commit the outputs):
   - `public/favicon.ico` (multi-size 16/32/48)
   - `public/icon-192.png`, `public/icon-512.png` (PWA/Android-style icons — not strictly needed since this isn't a PWA today, but cheap to generate alongside the others and future-proofs it)
   - `public/apple-touch-icon.png` (180×180)
3. Wire favicon/meta tags into `pages/_document.tsx` (currently only has a viewport meta tag — read the file before editing, it also contains an inline dark-mode-flash-prevention script that must be preserved):
   ```html
   <link rel="icon" href="/favicon.ico" sizes="any" />
   <link rel="icon" href="/icon-192.png" type="image/png" />
   <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
   <meta name="theme-color" content="#F8F7F3" />
   ```
4. Replace the placeholder logo mark in the two places it currently appears with the real icon image (via `next/image`, `priority` on both since they're above-the-fold):
   - `components/layout/AppShell.tsx` — currently (read the file to confirm exact current state before editing):
     ```tsx
     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
       <Home className="h-4 w-4" />
     </div>
     Homie
     ```
     Replace the icon `<div>` with `<Image src="/logo.png" width={32} height={32} alt="Homie" className="rounded-lg" />`, keep the "Homie" text wordmark next to it as-is (it's already set in `font-heading`/semibold via the surrounding `font-semibold` class — no change needed there). Remove the now-unused `Home` import from `lucide-react` if nothing else in that file uses it.
   - `pages/login.tsx` — currently:
     ```tsx
     <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
       <Home className="h-5 w-5" />
     </div>
     <CardTitle>Homie</CardTitle>
     ```
     Same swap, at 40×40 instead of 32×32. Remove the `Home` import if it becomes unused in that file too.
   - **Do not** touch the bottom nav's "Home" tab icon in `components/layout/BottomNav.tsx` — that's a navigation icon (lucide `Home`), not the brand mark, and should stay a generic icon consistent with the other three nav icons (`Building2`, `CalendarClock`, `Bell`).
5. Optional, low priority: an Open Graph image (`public/og-image.png`, 1200×630, using the stacked lockup) and a `public/manifest.json` referencing the generated icons, if the team wants link-preview/PWA polish. Not required for the core ask.

---

## 2. The colour palette

### Current state (`styles/globals.css`, HSL CSS custom properties, light mode shown — dark mode block also exists below it in the same file)

| Token | Current value | Hex equivalent |
|---|---|---|
| `--background` | `36 38.5% 97.5%` | `#FBF9F6` |
| `--foreground` | `192.6 26% 14.3%` | `#1B2A2E` |
| `--primary` | `114.9 20.5% 44.9%` | `#5F8A5B` |
| `--secondary` / `--muted` | `38.2 31.4% 93.1%` | `#F3EFE8` |
| `--accent` | `20.2 52.4% 55.5%` | `#C97A52` (terracotta/orange) |
| `--destructive` | `4.1 55.2% 41.2%` | `#A3372F` |
| `--border` | `38.8 23.9% 86.1%` | `#E4DED3` |

Dark mode `--primary` is `112.3 23.4% 60%` = `#87B181` — already close to brand Sage. Everything else in dark mode is a proportionate dark-theme remap of the same hue families.

**Key finding: none of this is the official palette.** It's in the right neighbourhood (warm neutral + muted green) but every hex is a bespoke approximation, and `--accent` is a terracotta/orange that doesn't exist anywhere in the official 6-colour brand sheet. This is the main thing this doc asks a future session to fix.

### Official brand palette (from `colour-palette.png` + team-supplied values above)

| Name | Hex |
|---|---|
| Sage | `#9AAD96` |
| Deep Forest | `#243A33` |
| Charcoal | `#111827` |
| Warm Sand | `#D6BE8A` |
| Cream | `#F8F7F3` |
| Stone | `#D6D3CD` |

### Contrast check (WCAG AA, computed against the exact brand hexes — do this check again after implementing, don't just trust this table blindly since it's easy to mistype a hex)

- White text on Sage `#9AAD96` → **2.39:1 — fails AA** (needs 4.5:1 for normal text, 3:1 for large text/icons). Sage **cannot** be used as a solid button fill with white label text at body size.
- Charcoal `#111827` on Sage `#9AAD96` → **7.43:1 — passes comfortably.**
- White on Warm Sand `#D6BE8A` → **1.81:1 — fails badly.**
- Charcoal on Warm Sand → **9.79:1 — passes comfortably.**
- Charcoal on Cream `#F8F7F3` → **16.55:1 — passes.**
- White on Deep Forest `#243A33` → **12.15:1 — passes comfortably.**
- Cream on Deep Forest → **11.34:1 — passes comfortably.**

**Implication:** Sage and Warm Sand are backgrounds-for-dark-text or decorative/icon-fill colours (exactly how the logo itself uses them — white/tan on sage, not sage text on white). They are **not** safe as a button fill with white label text. Deep Forest and Charcoal are the "safe with light text on top" colours. This matters because the current `--primary` (used for solid buttons with white text via `--primary-foreground`) needs a colour that (a) reads as "the brand green" and (b) clears 4.5:1 with white.

Recommended resolution: don't force raw brand Sage into `--primary`. Use a **darkened, brand-consistent tint of Sage** for interactive elements (buttons, links, focus rings) that need white-text contrast, and reserve true Sage `#9AAD96` for decorative use (icon backgrounds, subtle fills, chips) where the text on top is charcoal or where there's no text at all. This is exactly what the current `--primary` (`#5F8A5B`) already does by instinct — it's a darkened sage — so the fix is to make that relationship deliberate and documented rather than an unexplained approximation. A computed candidate: `hsl(109.6, 20%, 40%)` = `#597A52`, contrast with white = 4.85:1 (passes). Re-verify this computation in the execution session rather than trusting it blindly — recompute or use a contrast checker tool.

### Proposed new token mapping for `styles/globals.css`

Light mode:

| Token | New value | Rationale |
|---|---|---|
| `--background` | Cream `#F8F7F3` → `hsl(48, 26.3%, 96.3%)` | direct brand swap |
| `--foreground` | Charcoal `#111827` → `hsl(220.9, 39.3%, 11%)` | direct brand swap |
| `--primary` | Darkened Sage `#597A52` → `hsl(109.6, 20%, 40%)` (recheck contrast before committing) | brand-consistent, passes white-text contrast for buttons |
| `--primary-foreground` | White `#FFFFFF` | unchanged |
| `--secondary` / `--muted` | Stone-tinted neutral, e.g. Stone `#D6D3CD` lightened toward cream, or keep close to current `#F3EFE8` — needs a real design call, not a formula; pick something between Cream and Stone | subtle surface, brand-neutral |
| `--accent` | Warm Sand `#D6BE8A` (with Charcoal text wherever `--accent-foreground` is used, since white-on-Warm-Sand fails contrast) | **replaces the orange/terracotta**, which has no basis in the brand sheet |
| `--accent-foreground` | Charcoal `#111827`, not white | contrast fix — check every place `--accent-foreground` is currently assumed to be white |
| `--border` | Stone `#D6D3CD` → `hsl(40, 9.9%, 82.2%)` | direct brand swap |
| `--destructive` | Leave as-is (`#A3372F`) unless the team supplies an official error-red — not in the brand sheet, and status-red is a semantic/accessibility colour, not a brand decoration | out of scope of the brand sheet |

Dark mode: rebuild proportionally the same way the current dark block does (background → dark Deep-Forest-family, foreground → light cream, primary → a lightened Sage that still clears contrast against the dark background, accent → a lightened/desaturated Warm Sand). Do the actual HSL math in the execution session; don't guess numbers here without recomputing contrast against the new dark background, since the current dark-mode primary (`#87B181`) is already close to Sage and may need only a minor nudge rather than a full recompute.

### Files beyond `globals.css` that reference colour and need a look

- **`components/ui/badge.tsx`** — status badges use **hardcoded hex values per variant**, not the CSS custom properties, e.g. `success: "bg-[#e6f0e5] text-[#4b7248] ..."`, `warning: "bg-[#f7e6d6] text-[#a05a2c] ..."`. These map to `lib/status.ts` → `getPropertyStatus()` (statuses: Tracking/outline, Viewing Scheduled/default, Viewed—Awaiting Decision/warning, Interested & Offer Sent/success, Archived/secondary). These are semantic status colours (green=good, tan/orange=pending, blue=info, red=bad, grey=inactive) and should **stay semantically distinct** — don't collapse them all into brand sage. But retint `success` and `warning` specifically to use brand-derived hues (a soft Sage-family green for success, a soft Warm-Sand-family tan for warning) instead of the current bespoke greens/oranges, so they feel like the same family as the rest of the app. Leave `default` (blue) and `destructive` (red) alone — no brand equivalent exists, and standard info/error colours are fine to keep as generic.
- **`--accent` usage in product code** — currently used as a subtle `/50`-opacity hover/unread tint in `pages/dashboard.tsx` (card hover), `pages/notifications.tsx` (unread row bg), `pages/schedule.tsx` (row hover), `components/notifications/NotificationBell.tsx` (unread bg), and as a gradient stop in `components/properties/PropertyCard.tsx` (`from-primary/15 to-accent/15`). None of these need code changes — they all read the `--accent` CSS var indirectly via Tailwind's `bg-accent`/`text-accent-foreground` classes — but **do visually re-check all five spots** after the accent hue changes from orange to Warm Sand tan, since a hover tint that looked fine as a warm orange wash may look different as a tan wash (should still look fine — it's a similar warmth — but verify, don't assume).
- **`tailwind.config.ts`** — no changes needed. Colours are all indirected through the CSS custom properties (`hsl(var(--primary))` etc.), so retinting happens entirely in `globals.css`. Optional nice-to-have: add raw brand swatches as named Tailwind colours (e.g. `colors.brand = { sage: "#9AAD96", deepForest: "#243A33", charcoal: "#111827", warmSand: "#D6BE8A", cream: "#F8F7F3", stone: "#D6D3CD" }`) for the rare case where a component wants the literal brand hex rather than the semantic (and contrast-adjusted) `--primary`/`--accent` tokens — e.g. the logo swap in section 1 doesn't need this since it's an image, not a coloured div, but a future "About/Brand" page or marketing footer might.
- **Typography** — no change needed. `pages/_app.tsx` already loads Inter (body) + Hanken Grotesk (headings) via `next/font/google`, wired as `font-sans`/`font-heading` in `tailwind.config.ts`. This already satisfies what `colour-palette.png`'s typography panel shows (Inter-based system); nothing to do here.

---

## Explicitly NOT in scope

- No changes to layout, component structure, routing, or the bottom nav's information architecture.
- No change to `--destructive` (error red) or the `default`/`secondary` badge variants — not covered by the brand sheet, no reason to touch them.
- No PWA conversion — generating `icon-192`/`icon-512`/manifest is a cheap side-effect of already resizing the logo, not a request to make this installable; don't add service workers, offline support, etc.
- No redesign of button/card/input shape, radius, or shadow treatment — `--radius`, `card.tsx` shadow, and `button.tsx` press-state are already settled from an earlier design pass and aren't touched by this doc.
- Don't invent hex values for anything not in the official 6-colour sheet (e.g. don't guess an "official" error red or info blue) — flag those as out-of-brand-scope rather than making one up.

## Suggested order of work for the next session

1. Set up `public/`, move `logo.png` in, generate favicon/apple-touch-icon/192/512 sizes (pick a resizing approach — `sharp` script, `next/image` isn't a build-time file generator so it won't produce `favicon.ico` — an actual resize step is required).
2. Wire favicon/meta tags into `pages/_document.tsx`.
3. Swap the placeholder `Home`-icon-in-a-box mark for the real logo image in `components/layout/AppShell.tsx` and `pages/login.tsx`; remove now-unused `Home` imports.
4. Update `styles/globals.css` light + dark custom properties per the mapping above, **recomputing exact HSL values and re-checking contrast ratios** rather than trusting the numbers in this doc verbatim (they're a starting point, not a final answer — especially the dark-mode block, which wasn't fully worked out here).
5. Fix `--accent-foreground` usages that assumed white text (check `button.tsx`'s `outline`/`ghost` variants which use `hover:bg-accent hover:text-accent-foreground`, and `select.tsx`).
6. Retint `success`/`warning` badge variants in `components/ui/badge.tsx` to brand-derived hues; leave `default`/`destructive`/`secondary` alone.
7. Run the app (`npm run dev`), screenshot login/dashboard/properties/schedule/notifications in light + dark mode at desktop + mobile widths, and visually confirm: the real logo renders crisply at both sizes, no text-on-sage or text-on-warm-sand contrast failures anywhere (buttons, badges, hover states), and the five `--accent`-tinted hover/unread spots listed above still look intentional with the new Warm Sand hue instead of the old orange.
8. Run the existing Playwright suite (`npm run test:e2e`) to confirm the logo/colour swap didn't break any selector that happened to depend on the old markup (unlikely, since this is a pure visual change, but the header markup is touched in step 3, so worth a check).
