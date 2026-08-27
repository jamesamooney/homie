# UX Research Summary

**Project:** Homie — Buyer Viewing Hub (Day-1 Prototype)
**Date:** 2026-08-27
**Prepared by:** Requirements Elicitation Skill (CPUX)

---

## User Profiles

### Home Buyer (primary — built in this release)

The buyer is actively searching for a property, often tracking more than one at a time. They already do their discovery elsewhere (Rightmove) — by the time they open Homie, they know which property they care about and just want to act on it: book a viewing, decide if they like it, make an offer. They are not looking for another place to search; they're looking for a place to stop juggling phone calls, WhatsApp messages, and emails about the properties they've already found.

Their underlying goal isn't "book a viewing" — it's "buy the right house without anything falling through the cracks because a text got missed." The viewing is a means to that end.

### Estate Agent (represented by seeded data only)

Not built in this release, but the long-term vision positions the agent as the person who turns seller availability into bookable slots, and who would eventually benefit from route planning across a day of viewings. In this build, agent behaviour is entirely simulated via seed data — there is no agent-facing UI to validate.

### Home Seller (represented by seeded data only)

Not built in this release. The long-term model has the seller set recurring availability windows (e.g. "weekday evenings, Saturday mornings") rather than approving each viewing individually — this was a deliberate design choice favouring buyer self-service speed over seller per-visit control. In this build, seller availability is entirely simulated via seed data.

---

## Key Insights

- **The pain is fragmentation, not lack of information.** The buyer usually knows exactly what's happening with a property — the problem is that the knowledge and the coordination live across three or four different channels with no single source of truth. Homie's core value is consolidation, not new information.
- **Buyers want instant, self-service booking, not a request-response cycle.** The stakeholder explicitly compared the desired experience to booking a haircut slot: see an open time, click it, done. Any flow that introduces a "pending, waiting on agent" state undermines this and was deliberately designed out (seller sets availability upfront; buyer books directly into open slots).
- **The property card must answer two questions simultaneously: "where is this at?" and "what do I do now?"** These were confirmed as equally important — a design that shows status without a clear next action (or vice versa) doesn't meet the actual need.
- **Progressive disclosure builds confidence in an otherwise sparse MVP.** Because most of the roadmap (documents, budget, route planning, etc.) isn't built yet, showing greyed-out future actions with explanatory tooltips lets the buyer see the intended full journey rather than experiencing the app as unfinished or broken.
- **The offer step is deliberately buyer-controlled and non-binding on the app's part.** The app generates but never sends the offer email — this was an explicit stakeholder decision, likely reflecting the seriousness/formality of a property offer, which shouldn't be automated away from the buyer's direct control.
- **Rightmove is treated as the canonical source of property discovery** ("Rightmove is king"), and Homie is explicitly positioned as picking up *after* discovery, not competing with it. Any UI framing that makes Homie feel like "yet another property search site" would misalign with the buyer's actual mental model.

---

## Mental Models & Domain Language

- **"Tracking" a property**, not "saving" or "favouriting" — the buyer is following an active process (viewing → decision → offer), not bookmarking content for later.
- **"Viewing," not "appointment" or "showing"** — matches UK estate agency terminology the buyer already uses.
- **RAG-style status thinking**: the buyer wants to know at a glance where each property sits in a small number of clear stages (added → viewing scheduled → interested/not interested → offer sent), similar to a simple pipeline/kanban mental model.
- **"Archived," not "deleted,"** for Not Interested properties — the buyer's mental model is that a property they've ruled out and given feedback on is put aside, not erased; this is distinct from the explicit "Remove" action, which is a true deletion.

---

## Task Analysis

| Task | Frequency | Stakes | Key friction | Design implication |
| --- | --- | --- | --- | --- |
| Add a property via Rightmove link | Medium (each new property of interest) | Low | Enrichment (auto-pull of image/address) may fail silently if not handled carefully | Must clearly signal auto-fill success vs. manual-entry fallback; never a silent failure |
| Book a viewing | Medium-High (per property, possibly repeated for 2nd viewings) | Medium | Buyer expects instant confirmation, not a pending state | Slot selection must confirm immediately with visible status update |
| Decide Interested / Not Interested | Medium (once per viewing) | High (drives next steps — offer or archive) | Buyer may feel friction giving a real reason at a heavy emotional moment (ruling out a home) | Categorised reasons lower the effort vs. free text; "Other" with free text avoids forcing a bad-fit category |
| Make an offer | Low (once per property that proceeds) | Very High (financial, real-world consequence) | Needs to feel accurate/complete since buyer copies it into a real email | Generated template must read as genuinely ready-to-send; buyer must retain full control over sending |
| Check notifications | High (frequent glances) | Low-Medium | Buyer needs to distinguish new/important updates from old ones quickly | Unread indicator + count badge on bell icon; overlay list rather than a full page context-switch |

---

## Design Risks

- **Rightmove enrichment reliability.** Because this relies on reading public page content rather than an official API, it may fail intermittently or break entirely if Rightmove changes their page markup. The fallback to manual entry is not optional — it is the safety net for the entire "Add Property" journey and must be tested, not just designed.
- **Equal-priority scope with no agreed cut line.** The stakeholder wants "all of it" built in one day, with no fallback ranking agreed. If time runs short, there is a real risk of multiple features landing in a half-finished state rather than a clean subset being fully functional. The development team should flag early if this risk is materialising, so a cut-line conversation can happen before the demo rather than during it.
- **Half-built "hub" perception.** Because the seller/agent side is entirely mocked, the "central hub" value proposition (replacing phone/WhatsApp/email entirely) is only half-demonstrable — the buyer can experience instant self-service booking, but there's no real agent on the other end. This is fine for a one-day demo but should be clearly framed as such when presented, to avoid the audience assuming more is real than actually is.
- **"Not Interested" feedback at an emotionally loaded moment.** Ruling out a property a buyer may have been excited about is not a neutral action. A feedback flow that feels like a friction-heavy form (even with just categories) risks feeling tone-deaf if not designed with a light touch.
- **Offer template accuracy.** Since the buyer copies this directly into a real-world, high-stakes communication (a genuine property offer), any awkward phrasing, missing details, or unclear placeholders in the generated template carries real reputational risk for the buyer with their agent — more scrutiny-worthy than a typical demo feature.

---

## Usability Test Plan

Given the one-day build timeframe, testing should be lightweight and run informally during/immediately after the build rather than as a separate formal research phase.

**What to test:** The full primary journey end-to-end — sign up → add a property via Rightmove link → book a viewing → mark Interested → generate an offer email — plus the Not Interested → archive → feedback branch.

**With whom:** Whoever is available on the day (team members not involved in the build, ideally someone unfamiliar with the specific flow) — a handful of quick walkthroughs is sufficient given the timeframe.

**What pass/fail looks like:**

- **Pass:** A first-time user completes the full journey without needing verbal guidance beyond the initial framing ("this is a viewing tracker"), correctly interprets every status badge without asking "what does this mean," and does not attempt to look for functionality that's intentionally greyed out without first hovering to check why.
- **Fail signals to watch for:** Confusion about what "Add Property" expects as input; uncertainty about whether a booking is confirmed or pending; hesitation or a "wait, did that just send an email?" moment during the offer flow; failure to notice new notifications during the session.

**Fallback data check:** Since the Rightmove enrichment path is a known risk, explicitly test the manual-entry fallback path at least once, not just the happy path — the demo should not be the first time that fallback is exercised.
