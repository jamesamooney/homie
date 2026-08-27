# Product Requirements Document

**Project:** Homie — Buyer Viewing Hub (Day-1 Prototype)
**Version:** 1.0
**Date:** 2026-08-27
**Prepared by:** Requirements Elicitation Skill
**Status:** Draft - Awaiting stakeholder sign-off

---

## 1. Overview

### 1.1 Purpose

Homie is a web app that gives home buyers a single place to track properties they are interested in and manage the viewing process, instead of coordinating with estate agents across phone calls, WhatsApp, and email. This is a one-day prototype build focused entirely on the buyer-facing experience, with the seller and estate agent sides represented by mocked/seeded data.

### 1.2 Success Criteria

There are no hard quantitative targets for this one-day build. Directional success looks like: a buyer can go from pasting a Rightmove link to a booked viewing to (eventually) a generated offer email, entirely within the app, without needing to fall back to phone or email at any step in the demo flow.

### 1.3 Background

The source material for this project was a pitch-deck outline describing a much broader long-term vision (personalised roadmap, budget tracking, document storage, professional services marketplace, joint-buyer collaboration, and more). That document was a strategic vision statement, not a build-ready specification — most of its sections were unanswered prompts rather than decisions. This PRD narrows scope to a single, concrete, buildable slice: **booking and tracking property viewings from the buyer's perspective**, agreed directly with the stakeholder in place of the original document.

Route planning (sequencing an agent's day of viewings by geography/travel time) was confirmed as a core feature of the long-term product but is explicitly out of scope for this build, since there is no agent-side view to plan a route within.

---

## 2. Users

| User type | Description | Primary goal | Key frustration today |
| --------- | ----------- | ------------ | ---------------------- |
| Home buyer (primary, built today) | A person actively looking at one or more properties, searching externally on Rightmove | Track properties they're interested in and get viewings booked with minimal friction | Coordination happens across phone, WhatsApp, and email with no single source of truth |
| Estate agent (mocked, not built) | Manages viewing availability for listings and would eventually plan multi-property viewing routes | Convert interest into booked, efficiently-sequenced viewings | N/A — represented by seeded data only in this build |
| Home seller (mocked, not built) | Sets recurring availability windows for their property to be viewed | Only have people through the door at agreed, convenient times | N/A — represented by seeded data only in this build |

### User Personas

**The home buyer** is actively looking for a property, most likely juggling more than one at a time. They already do their property discovery on Rightmove — Homie doesn't compete with that, it picks up immediately after: once they've found a place they want to see, they paste the link into Homie and everything from that point (booking the viewing, deciding if they're interested, making an offer) happens in one place. Their biggest frustration today is the mess of channels — a text here, an email there, a missed call — with no way to see at a glance where each property stands.

---

## 3. Scope

### 3.1 In Scope

- Buyer sign-up and login using **username and password only** — no email required, no verification, no real security (plaintext/local only, acceptable for this prototype).
- Buyer can add a property by pasting a **Rightmove listing link**.
  - App attempts to auto-pull the property image, title, and address from the link.
  - If auto-pull fails, buyer can manually enter the address/photo instead.
- **"My Properties"** view: a list/tab of all properties the buyer is currently tracking.
- Each property is shown as a card with:
  - A **status badge** (e.g. Viewing Scheduled, Not Interested — Archived, Offer Sent) always visible, including on the summary list view.
  - A set of **action buttons**. Only actions valid for the current status are enabled; disabled actions are greyed out and show an explanatory tooltip on hover.
  - A **manual remove** option, available at any time regardless of status.
- **Book Viewing**: buyer selects from a calendar/list of specific available time slots (backed by seeded/mocked seller & agent availability data) and books instantly, with no approval step. A buyer may book more than one viewing per property (e.g. a second viewing).
- After a viewing takes place, buyer marks the property **Interested** or **Not Interested**.
  - **Not Interested**: property is archived. Buyer selects a reason from fixed categories (Price, Condition/Repairs Needed, Location, Size/Layout, Noise, Other). Selecting "Other" opens a free-text box to explain.
  - **Interested**: unlocks the **Make an Offer** action.
- **Make an Offer**: form collects offer amount, estate agent name, and any other details needed for the template, then generates an email the buyer can copy/paste or save. The app does not send the email itself.
- **Notifications**: a bell icon near the top of the app opens an overlay list of notifications. Notification types: viewing confirmed, upcoming viewing reminder, new slots available on a tracked property, offer template generated. Unread notifications are visually indicated (dot/indicator), with an unread count badge on the bell icon.
- Seeded/mocked data for: estate agents, sellers, and viewing availability slots. Property data itself comes from real Rightmove links, not seeded.
- Dark mode support.
- Responsive layout for mobile/tablet (best-effort — see Section 6, Constraints).

### 3.2 Out of Scope

- Any real estate agent or seller functionality (accounts, real availability entry, approval workflows). These roles exist only as seeded data behind the scenes.
- **Route planning** (sequencing multiple viewings by geography/travel time) — confirmed as a core feature of the long-term product, but explicitly deferred past this build.
- Any backend API or database — this build is frontend-only, with persistence via browser storage.
- Real authentication/security (password hashing, session security, email verification).
- Sending offer emails on the buyer's behalf — the app generates the email only.
- Accessibility/WCAG compliance.
- Integration with any agent CRM, Rightmove API, or other third-party system beyond reading public page content from a pasted Rightmove link.
- Property search within the app — buyers search on Rightmove externally and bring a link in.
- Data security/sensitivity handling of any kind (see Section 7).

---

## 4. Features & Acceptance Criteria

### 4.1 Sign-up and Login

**Description:** Buyers create an account with a username and password so their property list and progress persist across sessions on the same browser/device.

**Requirement ref:** FR-01

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] A new user can create an account by entering a username and password only (no email address required).
- [ ] Account creation succeeds regardless of password strength or username format — no validation rules block sign-up.
- [ ] A returning user can log in with the same username and password and see their previously saved property list.
- [ ] No confirmation email or verification step is required or sent.

**Usability Criteria:**

- [ ] A first-time user can create an account and reach the main property view in under 30 seconds without guidance.

---

### 4.2 Add a Property via Rightmove Link

**Description:** The buyer's entry point for tracking a property is pasting in a Rightmove listing URL. The app attempts to enrich this automatically but must not block the buyer if that fails.

**Requirement ref:** FR-02

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] Buyer can paste a Rightmove listing link into an "Add Property" input and submit it.
- [ ] On success, the app automatically populates the property's image, title, and address from the link and adds it to "My Properties."
- [ ] If automatic enrichment fails (link doesn't resolve, page structure unrecognised, timeout), the buyer is prompted to manually enter an address and can optionally upload/enter an image, and the property is still added.
- [ ] A buyer can track multiple properties at once; each appears as a separate entry in "My Properties."

**Usability Criteria:**

- [ ] It's clear to the buyer whether the property was added automatically or requires manual completion — this is not a silent failure.

---

### 4.3 My Properties List

**Description:** A single view/tab showing every property the buyer is currently tracking, so they can see at a glance where each one stands and what to do next.

**Requirement ref:** FR-03

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] All properties the buyer has added appear as cards in one list/tab, showing image, address/title, and current status badge.
- [ ] Each card shows action buttons appropriate to its current status; actions not yet available are visibly greyed out.
- [ ] Hovering over a greyed-out action shows a tooltip explaining why it is not yet available.
- [ ] A buyer can remove a property from their list entirely at any time via an explicit "Remove" action, independent of status.

**Usability Criteria:**

- [ ] A buyer can identify both the current status and the next available action for any property within a few seconds of looking at its card, without opening the property.

---

### 4.4 Book a Viewing

**Description:** From a property card, the buyer books a viewing by picking an open slot from a calendar/list — no request-and-wait step. Availability is backed by seeded/mocked seller and agent data.

**Requirement ref:** FR-04

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] "Book Viewing" is available on any property that hasn't already reached a terminal status (e.g. archived as Not Interested).
- [ ] Selecting "Book Viewing" shows a calendar/list of specific available time slots for that property.
- [ ] Selecting a slot books it instantly — no pending/approval state — and the property's status badge updates to reflect the confirmed viewing (e.g. "Viewing Scheduled — [date/time]").
- [ ] A buyer can book more than one viewing against the same property (e.g. a second viewing) if they choose to.

**Usability Criteria:**

- [ ] The buyer can distinguish available and unavailable slots at a glance.

---

### 4.5 Post-Viewing Interest Decision

**Description:** After a viewing occurs, the buyer records whether they're interested, which determines what happens to the property next.

**Requirement ref:** FR-05

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] After a booked viewing, the buyer can mark the property as "Interested" or "Not Interested."
- [ ] Marking "Not Interested" requires selecting a reason from fixed categories: Price, Condition/Repairs Needed, Location, Size/Layout, Noise, Other.
- [ ] Selecting "Other" reveals a free-text box in which the buyer must provide an explanation before the action can be confirmed.
- [ ] Once marked "Not Interested," the property is archived (moved out of the active list, but not deleted, and its feedback is retained).
- [ ] Marking "Interested" unlocks the "Make an Offer" action on that property's card.

**Usability Criteria:**

- [ ] It is clear to the buyer that archiving is the outcome of "Not Interested" before they confirm the action.

---

### 4.6 Make an Offer

**Description:** Once a buyer is interested in a property, they can generate a pre-filled offer email to send themselves — the app never sends anything on their behalf.

**Requirement ref:** FR-06

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] "Make an Offer" is only enabled once a property is marked "Interested."
- [ ] Selecting it opens a form collecting, at minimum: offer amount and estate agent name/details.
- [ ] Submitting the form generates a complete, readable email template incorporating the entered details.
- [ ] The buyer can copy the generated email to their clipboard, and/or save it, for use in their own email client.
- [ ] The app does not send any email on the buyer's behalf at any point in this flow.

**Usability Criteria:**

- [ ] The generated email reads as a professional, ready-to-send offer letter without further editing required.

---

### 4.7 Notifications

**Description:** A bell icon gives the buyer a running feed of updates relevant to their tracked properties, so they don't need to keep re-checking each property card.

**Requirement ref:** FR-07

**Priority:** Should Have

**Acceptance Criteria:**

- [ ] A bell icon is visible near the top of the app at all times while logged in.
- [ ] Clicking the bell opens an overlay list of notifications, most recent first.
- [ ] Notifications are generated for: a viewing being confirmed, an upcoming viewing reminder, new slots becoming available on a tracked property, and an offer template being generated.
- [ ] Unread notifications are visually distinguished (e.g. a dot/indicator) from read ones.
- [ ] The bell icon displays a count badge reflecting the number of unread notifications.
- [ ] Opening/viewing a notification marks it as read.

**Usability Criteria:**

- [ ] A buyer can tell, without opening the panel, whether they have unread updates.

---

## 5. Non-Functional Requirements

| ID | Category | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| NFR-01 | Platform | Web app, accessible via desktop browser | App loads and is fully usable in an up-to-date Chrome/Edge/Firefox browser |
| NFR-02 | Responsiveness | Responsive layout on mobile/tablet screen sizes | Best-effort — treated as a stretch goal, not a blocking requirement, given the one-day timeframe |
| NFR-03 | Accessibility | None required | Explicitly out of scope for this build |
| NFR-04 | Security | None required | Explicitly out of scope; no data sensitivity handling, no password protection, no session security |
| NFR-05 | Persistence | Data persists across page reloads/sessions on the same browser | Property list, statuses, and notifications survive a browser refresh via local storage |
| NFR-06 | Build quality | Frontend build passes cleanly | `npm run build` completes with 0 errors, 0 TypeScript errors |
| NFR-07 | Testing | Automated test coverage for buyer flows | Playwright E2E tests cover: sign-up/login, adding a property, booking a viewing, marking interested/not interested, generating an offer, and viewing notifications |

---

## 6. Constraints

- **Timeline:** This is a one-day build. All scope decisions above have been made with this constraint as the primary driver.
- **No prioritisation ranking was agreed** between features — the stakeholder's direction was "all of it" is required. This is a documented risk (see below): if time runs short during the build, there is no pre-agreed cut line, so multiple features may end up partially finished rather than one being fully cut in favour of the others.
- **No backend/database** — the app is frontend-only. All data (accounts, properties, statuses, notifications) is stored client-side (e.g. browser local storage) and does not persist across devices or browsers.
- **Tech stack:** Next.js 14 (Pages Router), TypeScript (strict mode), Tailwind CSS, shadcn/ui, dark mode support, Playwright for E2E testing — per the team's existing frontend engineering approach. Because there is no backend, the API field-verification gate and MSW network-layer testing normally mandated by that approach do not apply; auth is a local mock rather than a backend-issued JWT.
- **Rightmove link enrichment is unofficial** — it relies on reading publicly available page content (e.g. page metadata) from a pasted link, not an official Rightmove API or partnership. This may break if Rightmove changes their page structure, or may not always succeed — hence the mandatory manual-entry fallback in FR-02.
- **Seller and agent sides are entirely mocked.** Viewing availability shown to the buyer is seeded/fake data standing in for a real seller/agent-managed calendar, which does not exist in this build.

---

## 7. Data & Integrations

**Key data entities:**

- User account (username, password — no security applied)
- Property (Rightmove link, address, image, title, list of viewings, current status, interest decision, not-interested reason/category)
- Viewing slot (mocked/seeded — date/time, associated property)
- Offer (amount, agent details, generated email content)
- Notification (type, related property, read/unread state, timestamp)

**External integrations:**

- Rightmove (unofficial, read-only) — buyer pastes a listing link; the app attempts to read public page content to auto-populate image/title/address. No official API or partnership involved.

**Data sensitivity:** None to be handled in this build. Offer amounts and account credentials are stored without protection, encryption, or access control. This is accepted as appropriate for a one-day prototype and explicitly not a production posture.

---

## 8. UX Requirements Summary

- **Mental model:** Buyers think of Rightmove as "where I find properties" and Homie as "where I manage what happens next" — the two are complementary, not competing. The UI should reinforce this handoff clearly (e.g. the "Add Property" flow should feel like *continuing* a property's journey, not starting a new listing from scratch).
- **Status + next action, always visible:** Every property card must communicate both "where is this at" (status badge) and "what can I do now" (enabled action button) at a glance — this was explicitly called out as equally important, not one over the other.
- **Progressive disclosure via greyed-out buttons:** Rather than hiding future actions, the app shows the full potential journey (Book Viewing → Interested/Not Interested → Make an Offer) as a locked path, using disabled buttons with explanatory tooltips. This sets buyer expectations about what's coming next.
- **Self-service booking, not request-and-wait:** The booking experience should feel like booking a haircut slot — see an open time, click it, done. No "pending confirmation" state.
- **No accessibility requirements** for this build (explicitly descoped).

---

## 9. Sign-off

This document represents the agreed requirements for the project as captured in conversation
with the stakeholder. Before development begins, the stakeholder should review this document
and confirm it accurately reflects what was discussed.

| Role | Name | Status | Date |
| --- | --- | --- | --- |
| Stakeholder | (not provided) | Pending | |
| BA / UX Researcher | Requirements Elicitation Skill | Prepared | 2026-08-27 |

---

_This document is the reference for all development, testing, and assurance activity on this
project. Any changes to requirements after sign-off must be captured in an updated version of
this document before implementation begins._
