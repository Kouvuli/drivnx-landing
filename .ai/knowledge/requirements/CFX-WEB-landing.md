---
id: CFX-WEB-landing
external_key: DRIVN-10
kind: feature
title: "Landing page"
summary: "Public company website that explains the DrivnX Phase 1 product (connect, profile and understand, document and define) with a 3D hero, an interactive review demo and a free early-access page, and collects early-access sign-ups"
owner: landing
lifecycle: approved
revision: 14
approved_revision: 14
approval_evidence: "user approved the workspace restructure in chat, 2026-11-09 (revision 14, reference-only)"
updated: "2026-11-09"
related: []
status: CONFIRMED
---

# Landing page

## Problem
DrivnX needs a live company website on its own domain, with a same-domain contact email, to apply to Anthropic's
Claude Startups program and to start collecting early users. The page must explain the product in seconds and turn
visitors (small businesses, data teams, consultants) into early-access sign-ups.
Source of truth for content: `../drivnx-docs/docs/DrivnX_Phase1_Development_Direction.md` (approved; since revision 12 the copy
follows it). Up to revision 11 the copy followed `../drivnx-docs/docs/archive/Velora — Product Vision v2.md`, and up to revision 5 the
retired "Strategy & Plan". DrivnX is the company; Trison Labs is the team building it. Since revision 7 the page follows v2: §1 vision and first wedge, §5 executive understanding,
§6 trust model, §7 AI, §10 living data products, §11 data processing, §13 packaging, §14–16 website brief. Revision 8
closes the remaining gaps: §15 hero visual and supporting line, §9 trusted data product, §13 wording on /pricing, and
§18's first user in "Who it's for".

## Scope
In: one-page site (`/`), privacy page (`/privacy`), interactive graph demo, early-access form, Open Graph image,
site config in one file, a launch check that blocks placeholder values. Revision 2 adds: a minimal 3D hero scene,
story-moment animations in three sections, Lucide icons, and shorter copy. Revision 3 adds: the petrol palette in light
and dark themes with a toggle, an interactive hero, a scroll-driven how-it-works, a richer demo, micro-interactions and
cursor effects. Revision 4 restyles it after scale.com's motion patterns (inspiration only, no code or assets copied):
a pure black-and-white palette, dark by default, Geist type, a full-bleed hero, smooth scrolling, line-by-line heading
reveals, hover zoom and a "Connects to" marquee. Revision 7 aligns the content with Product Vision v2 (hero, narrative
order, trust model, lifecycle, AI & privacy) and moves pricing to a separate `/pricing` page with plan cards, a feature
comparison table and a FAQ, in the pattern of claude.com/pricing (studied for layout only). Revision 8 adds a hero status
card and v2's supporting line, a Trusted Data Product checklist, v2-only pricing wording and First/Next audiences, and
removes the "Why not just use ChatGPT?" FAQ. Revision 9 makes the site orange, black and white:
orange Join buttons and highlights, mono controls, grey/graphite cards. Revision 10
adds a fill-sweep hover and a press + ripple click to every button-style control. Revision 12 rewrites the content to
the Phase 1 direction: three stages (Connect, Profile & understand, Document & define) plus a "Coming next" strip, four
trust states, a review-and-export demo, Phase 1 §7's claims only, no lifecycle section, provider-neutral AI wording, and
`/pricing` becomes a free early-access page.

## Assumptions
- ASSUMPTION: English only.
- ASSUMPTION: no legal entity yet; the privacy page names the operator from site config ("DrivnX, company registration in progress") until one exists.
- ASSUMPTION: hosting on Vercel; form processor is Formspree (free tier).
- ASSUMPTION: demo and overview figures (4,812 orders, 1,204 customers, 94% match, 99.8% unique, 12 tables, 184 columns, 2.4M rows) are illustrative and labelled as a demo or an example.

## User Stories
### US-01 — Understand DrivnX in seconds
### US-02 — Join early access
### US-03 — Try the graph demo
### US-04 — Learn how it works, that early access is free, and whether to trust it
### US-05 — Read the privacy policy
### US-06 — Founders change brand details in one place and never launch with placeholders
### US-07 — Shared links look right
### US-08 — See the product story in the hero: messy records pulling together into a clean graph
### US-09 — Sections that show a sequence or a change animate once, so the story is easier to follow
### US-10 — Scan the page quickly through icons and shorter text
### US-11 — Read the page in a light or dark theme with a distinctive DrivnX palette
### US-12 — Play with the hero graph: rotate it, inspect records, approve the last suggested link
### US-13 — Follow Connect → Profile & understand → Document & define step by step while scrolling
### US-14 — Review what profiling inferred in the demo: confirm a relationship and an identifier, define a rule, then export the contract
### US-15 — Feel that controls respond: press, hover, open and success feedback
### US-16 — See the hero graph react to the cursor
### US-17 — Feel a calm, premium page: full-bleed hero, smooth scrolling, headings that reveal, cards that respond
### US-18 — See at a glance which sources DrivnX reads now and which come next
### US-19 — See on its own page that early access is free, what it includes and what comes next
### US-20 — Follow the Phase 1 story, and see that transformation, validation, publishing and monitoring come later
### US-21 — See in the hero what DrivnX tells me about my data: sources, findings, identifiers, contract coverage and the next action
### US-22 — Recognise DrivnX by its orange, black and white, without confusing orange with the trust colours
### US-23 — Feel buttons respond: a fill sweeps in on hover and the button presses in with a ripple when clicked

## Decisions and Contracts
Decided with the user in chat, 2026-10-10:
- Readiness Report: sign-up option only, **no file uploads** on the site. (Revision 12: removed.)
- Form: POST to `NEXT_PUBLIC_WAITLIST_ENDPOINT` (Formspree); `mailto:` fallback when unset.
- About: founder **roles, no names** yet.
- Look: **light & calm**; trust colours on the graph (grey observed, amber suggested, green approved).
- Domain and email: **placeholders** (`drivnx.example`, `hello@drivnx.example`) until real ones exist.
- Pricing: **"from" prices**, labelled early-access.
- Demo on phones: **tap to accept**; dragging optional.
- **No analytics**, no cookies. Tests: Vitest + Testing Library, plus one Playwright journey.

Added for revision 2, decided with the user in chat, 2026-10-10:
- 3D hero: **chaos → clean graph**, **beside the headline, restrained**: about 40 small grey points and thin lines on the page
  background, trust colours (amber → green) as the only accents; no glow, bloom, gradients or textures. The 2D demo moves
  to its own section directly below the hero.
- Playback: **once (~4 s) when visible, then a gentle idle, plus a Replay button**; slight pointer response on desktop.
- Fallbacks: **lighter 3D on phones**; a **still image of the final graph** for reduced motion and browsers without WebGL.
- Elsewhere: **story moments only** (how-it-works steps in sequence, trust states amber → green, dashboard numbers count up).
- Libraries: **React Three Fiber + drei** for 3D, **Motion** for 2D; icons: **Lucide**, **generic icons** for systems
  (no brand logos).
- Copy: **icons plus about one third less text**.
- Workflow: built with the `web-motion-3d` skill created in ai-skills-os for this.

Added for revision 3, decided with the user in chat, 2026-10-10:
- Palette **A: Petrol** (chosen from three mocked directions (mocks removed 2026-10-30)), light and dark, all pairs WCAG AA:
  light paper #f2f5f5, surface #ffffff, ink #0f1f22, muted #4c5f63, line #d3dde0, accent #0d5f73, accent-strong #094a5a,
  on-accent #ffffff; dark paper #0b1517, surface #112024, ink #e4eef0, muted #9fb4b8, line #23383d, accent #5cc3d6,
  accent-strong #8ad6e4, on-accent #062027. Trust colours: light observed #6e7a76, suggested #b26b00 / ink #7f4d00 / soft
  #fff3dc, approved #1c7347 / soft #e3f2e9, danger #b42318; dark observed #83918c, suggested #f0a73a / ink #f6c06a / soft
  #33270f, approved #4cc38a / soft #10301f, danger #f97066.
- Dark mode: **follows the system, plus a header toggle** remembered on the device, with no flash of the wrong theme.
- Interaction: **all of hero play, scroll-driven story, richer demo, micro-interactions and cursor effects**, in a
  **quiet style**: short eased motion, no bounce or parallax layers, reduced motion respected, simpler on phones.
- Design review uses the Impeccable-derived critique, audit and polish modes merged into `frontend-design`; the external
  Impeccable package is not run (the Skill OS scanner rejected it on 2026-10-07).

Added for revision 4, decided with the user in chat, 2026-10-11 (reference: scale.com, studied for patterns only — Lenis
smooth scroll, full-bleed dark hero, line-masked heading reveals, hover zoom inside frames, quiet button hovers, an
infinite marquee; no code, copy or assets are taken from it):
- Palette **1: Pure mono** (chosen from three mocks (mocks removed 2026-10-30)), replacing petrol:
  dark paper #000000, surface #111111, ink #ffffff, muted #a3a3a3, line #262626, accent #ffffff, accent-strong #e0e0e0,
  on-accent #000000; light paper #ffffff, surface #f5f5f5, ink #0a0a0a, muted #5c5c5c, line #e5e5e5, accent #0a0a0a,
  accent-strong #2a2a2a, on-accent #ffffff. Trust colours stay (dark observed becomes #8a8f8d, suggested-soft #2e2410,
  approved-soft #0f2a1c; the rest unchanged).
- **Dark for every first-time visitor**, regardless of the system setting; the toggle switches to light and is remembered.
- Typeface **Geist** with **Geist Mono** for labels and data (replacing IBM Plex).
- Hero: **full-bleed**, the 3D graph behind a centred headline with a legibility scrim, CTAs and "Scroll to explore".
- Effects: **smooth inertial scroll**, **line-by-line heading reveals**, **hover zoom on cards and visuals**, and an
  **infinite "Connects to" marquee of sources and destinations** with generic icons (no customer logos: there are none).

Added for revision 7, decided with the user in chat, 2026-10-11 (source: Product Vision v2):
- Hero: **v2 headline** "Understand your data before you use it." with a **wedge subhead** (spreadsheets, databases and
  APIs → see how records connect → fix gaps with Claude → publish into an ERP, cloud or warehouse). CTAs follow v2:
  "Join early access" and "See how it works".
- Structure: **follow v2 §16's narrative**, shown through the existing demo, marquee, 3D, pinned scroll story and mono
  look. The five build stages (Understand, Document & define, Build, Validate, Publish & serve) become the pinned story;
  then the demo, trust model, continuous lifecycle and AI & privacy. Kept from the current page: the "Connects to"
  marquee, the interactive demo, Who it's for + About, the FAQ and the early-access form. Removed: views, destinations
  (now inside "Publish & serve" and the marquee), the competitor comparison and the home pricing section.
- Pricing: **a separate `/pricing` page** (pattern of claude.com/pricing): v2 §13's four tiers as cards with **"Free" /
  "Early access" / "Early access" / "Contact us"** price lines and **no dollar amounts**, a **"Compare features across
  plans"** table of v2's twelve capabilities, and a **pricing FAQ**.
- The landing page still shows **all four destinations** (Odoo, files, cloud storage, cloud warehouse) with their build
  order (first release / coming soon).
- Project knowledge (glossary, decision records, product brief in the repo): **not added for now**, by the user's choice.

Added for revision 8, decided with the user in chat, 2026-10-11 (closing the gaps between the site and v2):
- Hero visual (v2 §15): **keep the 3D graph and add a status card** on it, labelled as an example, with v2 signals:
  connected sources, documentation status, contract coverage, validation status and the next recommended action. It is
  ordinary HTML (not in the canvas), so it shows with the still image, reduced motion and no WebGL too.
- Hero text (v2 §15): **v2's supporting line under the subhead**: "Profiling, documentation, contracts, transformation,
  and validation in one workspace — with Claude assistance you can switch off."
- FAQ: **"Why not just use ChatGPT?" is removed**: it came from competition notes the user kept out of v2.
- Pricing wording (v2 §12–13): taglines and price notes are **re-derived from v2's own values**; "Pricing set with early
  customers" and the audience taglines are dropped. Exact strings:
  Free / Local: "Manual profiling, a data dictionary and basic contracts" / "Limited data products";
  Pro: "Scheduled profiling, full contracts and change detection" / "Limits follow real usage";
  Team: "A shared pool of data products, with collaboration" / "Limits follow real usage";
  Enterprise: "Policy-driven profiling, advanced governance and deployment controls" / "Custom limits".
- Trusted data product (v2 §9): **a seven-point checklist in the "Publish & serve" stage**; no principles (§17) section.
- Who it's for (v2 §18): **businesses moving onto an ERP first, labelled "Starting with"; data analysts and engineers
  second, labelled "Growing into"**.

Added for revision 9, decided with the user in chat, 2026-10-11 (orange from colorhunt.co/palette/000000233d4dfe7f2deaecf0;
earlier the same day a sky-blue accent, the palette's slate and an indigo accent were built and reviewed but never
shipped, see `../drivnx-docs/docs/design-mocks/rev9-orange-*.png`):
- **Orange, black and white only.** Orange with black text is the hero's, pricing's and form's "Join early access"
  buttons (the header's is black/white so it does not compete with the hero): #FE7F2D in dark (8.3:1) and, a little dimmer and darker at the user's request, #E77123 in light
  (6.8:1). Orange also marks the dot after the wordmark, the favicon's V, the share image's bar, the active how-it-works
  step (bar and icon), link underlines and the FAQ "+". Small orange text (the "Starting with" / "Growing into" labels)
  and focus rings use brand-ink: #C2500A in light (4.7:1 on white), #FE7F2D in dark.
- **Every other control is black (light) / white (dark)**: the header's Join button, links (with an orange underline), icons, "Talk to us", the
  demo's buttons, checked controls (revision 4's mono accent values). Orange never goes on the graphs or the demo,
  because its hue (24°) is close to amber "suggested" (36°), which keeps its meaning from v2 §6.
- **Cards**: neutral grey #F4F4F5 (light) and graphite #18181B (dark); sections are never tinted (page colour #ffffff /
  #000000, separated by their top border), so cards stand out in both themes.
- Paper, ink, muted, line and the trust colours keep revision 4's values; graphs stay neutral; dark by default stays.

Added for revision 10, decided with the user in chat, 2026-10-11:
- **Hover: fill sweep.** A layer sweeps across each button-style control from the left in about 350 ms: orange buttons
  to a deeper orange (brand-strong: #D36317 light, #F96D10 dark; black text stays AA), black/white buttons to their hover
  shade, outline and ghost buttons fill with black/white (their text flips) or with their own soft colour (the hero's
  amber "Approve suggested link" keeps amber, Replay uses the card grey). Keyboard focus shows the same fill.
- **Click: press + ripple.** The control presses in (scale 0.96) and a soft ripple spreads from the click point and
  fades (about 650 ms). One page-wide listener draws it, so no control needs its own wiring.
- **Scope:** every Join button, See how it works, Talk to us, the demo's buttons, and the hero's Approve and Replay.
  Not plain text links, the theme toggle, "Scroll to explore", the marquee's pause or FAQ rows.
- **Reduced motion:** the fill appears instantly, no press, no ripple (as AC-37).
- The header's "Join early access" becomes black (light) / white (dark), recorded under revision 9's colours.

Added for revision 12, decided with the user in chat, 2026-10-31 (source: the approved DrivnX Phase 1 direction):
- Scope: **Phase 1 plus a "Coming next" strip**. The story is Connect → Profile & understand → Document & define;
  Transform, Validate, Publish & serve and Monitor & improve are named only as "Coming next". The lifecycle section and
  v2's Trusted Data Product checklist are removed.
- Audience: **data analysts and engineers** ("Built for"), **data consultants** second ("Also for"). Form segments:
  data analyst or engineer, data consultant, something else.
- AI: **provider-neutral** wording (cloud model or local Ollama); no vendor is named while the Phase 1 provider ADR is
  open. AI & privacy states only Phase 1 §7's safe claims: runs locally, read-only on sources, AI off by default, a
  context preview before any cloud request, a local model option, credentials in the OS keychain. No "encrypted",
  "deleted on request", cloud or "never leaves" wording.
- Offer: **the Phase 1 markdown has no Readiness Report**, so the checkbox, its FAQ and its privacy text are removed.
- `/pricing` becomes **"Early access is free"**: two cards (Early access: Free, what exists today; Coming next: Later,
  what comes after), a note that pricing for later follows real usage, and a short FAQ. The header and footer link is
  "Early access". No plans, no comparison table.
- Demo: **review and define**. Three items: accept (or draw) the inferred relationship `cust_no → customer_id`, confirm
  `customer_id` as the identifier, then add "customer_id must be non-null and unique" to the contract (only after the
  identifier is confirmed); "Export contract" then shows a short YAML preview. No dry run, no destinations.
- Company and team: **DrivnX is the company** (operator stays "DrivnX (company registration in progress)");
  **Trison Labs is the team**, named in About from site config.
- Hero: the status card shows the Phase 1 overview example; the hero graph's samples are field observations, not
  record matches; the supporting line says it runs locally and AI is optional.
- "Connects to": CSV, Excel (XLSX), Parquet and PostgreSQL (read-only), then "Coming next": MySQL, SQL Server.

Form contract: `POST <endpoint>`, headers `Content-Type: application/json`, `Accept: application/json`, body
`{ "email": string, "segment": "data-team" | "consultant" | "other", "source": "landing" }`. (Revision 12: no
`readinessReport`.)

## High-Level Design
Next.js 16 (App Router, TypeScript), Tailwind CSS 4, React Flow 12 (`@xyflow/react`) for the demo only. The page is
server-rendered; only the form, the demo, the 3D hero and the story-moment animations are client components. All brand
values come from `src/config/site.ts`. Three.js (via React Three Fiber) is loaded in its own chunk only after the page is
usable and the hero scene is visible; the server HTML always contains the still fallback.

## Low-Level Design
Decided in planning.

## Acceptance Criteria
- AC-01 (US-01): Given a visitor opens `/` at 1440×900 or 375×812, when the page loads, then the H1 "Understand your data before you use it.", the subhead and a "Join early access" button are visible without scrolling. (Revision 7: v2 headline.)
- AC-02 (US-02): Given the endpoint is set, when a visitor submits a valid email and a segment, then exactly one request matching the form contract is sent, the button shows "Joining…" and is disabled while pending, and on a 2xx response "You're on the list" is shown. (Revision 12: no Readiness Report choice.)
- AC-03 (US-02): Given an invalid or empty email, when the visitor submits, then no request is sent and an inline error linked to the field (`aria-describedby`) is shown.
- AC-04 (US-02): Given the endpoint returns a non-2xx status or the network fails, when the visitor submits, then an error message with a mailto link to the site email is shown and the entered values are kept.
- AC-05 (US-02): Given the endpoint is not set, when the visitor submits a valid form, then no network request is sent and the browser is pointed to a `mailto:` link to the site email whose body contains the email and segment. (Revision 12.)
- AC-06 (US-03): Given the demo loads, then it shows an orders.xlsx source and a customers source, the status "Profile ready: 2 inferred facts need your review", and an amber inferred link "cust_no → customer_id (94%)". (Revision 12.)
- AC-07 (US-03): Given the initial demo, when the visitor presses "Accept suggestion", then the link turns green and is labelled "Confirmed", and the status reads "Relationship confirmed: orders.cust_no → customers.customer_id". (Revision 12.)
- AC-08 (US-03): Given the initial demo on a pointer device, when the visitor drags from Orders `cust_no` to Customers `customer_id`, then the same resolved state as AC-07 appears; when they connect any other pair, then a hint to try `cust_no → customer_id` is shown and the state stays unresolved.
- AC-09 (US-03): Given the demo is resolved, when the visitor presses "Reset demo", then the initial state returns.
- AC-10 (US-03): Given a keyboard-only visitor, when they Tab to the demo, then "Accept suggestion" and "Reset demo" are reachable and operable, and each state change is announced through a polite live region.
- AC-11 (US-04, US-20): Given `/`, then these sections exist in order with these ids: `connects`, `problem`, `how-it-works`, `demo`, `trust`, `ai-privacy`, `who`, `about`, `faq`, `early-access`; the header links to How it works, Early access (`/pricing`), AI & privacy, FAQ and the early-access form. (Revision 12: no `lifecycle`; "Pricing" becomes "Early access".)
- AC-12 (US-04, US-19): Given `/`, then it has no pricing section and no dollar amounts; the early-access terms live on `/pricing`, linked as "Early access" from the header and the footer. (Revision 12.)
- AC-13 (US-04): Given the `ai-privacy` section, then it states that the product runs on the user's machine, is read-only on sources, keeps AI off until it is turned on (everything works without it and suggestions stay Inferred until confirmed), shows the provider, model and exact context before any cloud AI request, offers a local model (Ollama), and keeps credentials in the OS keychain; the site never says "never leaves", "zero retention", "enterprise-grade", "fully secure" or "encrypted", and names no AI vendor. (Revision 12: Phase 1 §7.)
- AC-14 (US-04): Given the FAQ, then it includes "Does my data leave my machine?" as an expandable item that works without JavaScript, and it has no "Why not just use ChatGPT?" item. (Revision 12: question reworded for the local product.)
- AC-15 (US-05): Given `/privacy`, then it lists what the form collects, the processor (Formspree), retention, how to request deletion (site email), and states there is no analytics or tracking cookies; it is linked from the footer and from the form.
- AC-16 (US-06): Given the source, then the brand name, domain, contact email and company details are defined only in `src/config/site.ts`, and no component hard-codes them.
- AC-17 (US-06): Given `site.ts` still contains a `.example` domain or email, when `npm run check:launch` runs, then it exits non-zero and names each placeholder; with real values it exits zero.
- AC-18 (US-07): Given any page, then its title and description come from site config, and `/opengraph-image` returns a 1200×630 PNG showing the headline.
- AC-19 (US-08): Given any visitor, when the server HTML for `/` arrives, then the hero (beside the headline on desktop, below it on phones) contains a still image of the clean graph with a text alternative, and no three.js code is in the server HTML or the initial page scripts.
- AC-20 (US-08): Given a desktop visitor without reduced motion and with WebGL, when the hero scene is visible, then a 3D canvas replaces the still image and points move from scattered positions into the linked graph within about 4 seconds, then idle gently; the hero stays the same size (no layout shift).
- AC-21 (US-08): Given the 3D scene has played, when the visitor presses "Replay" (a real button, reachable by keyboard), then the assembly plays again.
- AC-22 (US-08): Given `prefers-reduced-motion: reduce` or a browser without WebGL, then the still image stays, no canvas mounts and no Replay button is shown.
- AC-23 (US-08): Given a phone-sized viewport (under 768 px) or a coarse pointer, then the scene uses the light tier: at most 24 points, device pixel ratio at most 1.5, and no pointer response.
- AC-24 (US-08): Given the 3D scene is running, when it scrolls out of view, then it stops rendering, and it resumes when visible again.
- AC-25 (US-09): Given motion is allowed, when the trust states and the executive-summary numbers in `how-it-works` first scroll into view, then the trust states light up in order and the numbers count up to their final values, each once; on phones the how-it-works steps also appear in sequence; with reduced motion, all of them show their final state immediately. (Revision 7: the dashboard preview is gone.)
- AC-26 (US-10): Given `/` and `/pricing`, then each problem item, how-it-works step, trust state, audience, AI & privacy point and early-access card shows a Lucide icon that is hidden from screen readers (`aria-hidden`); systems use generic icons, never brand logos. (Revision 12.)
- AC-27 (US-10): Given `/`, then the visible words in `problem`, `how-it-works`, `trust`, `ai-privacy`, `who`, `about` and `early-access` total at most 850. (Revision 12: no lifecycle.)
- AC-28 (US-11): Given a first-time visitor (no stored choice), whatever their system setting, when `/` or `/privacy` first paints, then the dark theme is applied before any content is shown (no flash), also without JavaScript, and form controls and scrollbars follow it (`color-scheme`). (Revision 4: was "follows the system".)
- AC-29 (US-11): Given the header theme toggle (a real button whose label names the theme it switches to), when the visitor presses it, then the theme switches, the choice is remembered on that device across reloads, and the 3D hero and demo pick up the new colours.
- AC-30 (US-11): Given the colour tokens (pure mono since revision 4; the revision 9 palette since then), then every text/background pair used on the page meets WCAG AA (4.5:1 text, 3:1 large text and UI) in both themes, and text selection, focus rings, scrollbars and link underlines are themed from the tokens. (Revision 9: accent-strong text on paper and surface is checked too.)
- AC-31 (US-12): Given the 3D hero on a pointer or touch device, when the visitor drags across it, then the graph rotates with the drag (limited range) and eases back when released; page scrolling on phones still works with vertical swipes.
- AC-32 (US-12): Given the settled 3D hero, when the visitor hovers or taps a hub, then a label shows its table and row count (e.g. "Customers, 1,204 records"); when they hover or tap a field point, then an observation shows (e.g. "customer_id: 99.8% unique, possible identifier"). (Revision 12: observations, not record matches.)
- AC-33 (US-12): Given the settled 3D hero, then one hub link stays amber as "Suggested"; when the visitor clicks it, or presses the "Approve suggested link" button below the scene, then it turns green and the caption confirms it; Replay resets it.
- AC-34 (US-13, US-20): Given a desktop visitor (1024 px or wider) with motion allowed, when they scroll through `how-it-works`, then the section stays pinned while Connect, Profile & understand and Document & define become active in order, each with its own illustration (sources read in place or read-only; the executive overview; Profile → Dictionary → Contract with export), and releases after the last; on smaller screens or with reduced motion, all three steps show stacked with their illustrations, without pinning. Below the story, a "Coming next" strip names Transform, Validate, Publish & serve and Monitor & improve. (Revision 12: three Phase 1 stages instead of five.)
- AC-35 (US-14): Given the demo, then it lists three review items with a progress count ("0 of 3 reviewed"): the inferred relationship (Accept suggestion, or draw the link), the possible identifier (Confirm identifier), and the rule "customer_id must be non-null and unique" (Add to contract), which stays disabled with "Confirm the identifier first" until the identifier is confirmed; the count updates after each. (Revision 12.)
- AC-36 (US-14): Given all three items are reviewed, when the visitor presses "Export contract" (disabled until then), then the status reads "Contract exported: customers.contract.yaml" and a short YAML preview of the customers contract appears (the customer_id rule, state defined, evidence: profile run 42); "Reset demo" restores every item and removes the preview. (Revision 12: replaces the dry run and the destinations.)
- AC-37 (US-15): Given motion is allowed, then buttons give press feedback, links and cards give hover feedback, FAQ answers open and close with a short height transition, and a successful sign-up shows an animated check; with reduced motion all of these change instantly.
- AC-38 (US-16): Given a desktop visitor with a fine pointer and motion allowed, when the cursor moves over the settled hero graph, then nearby points ease slightly away from it and return when it leaves; there is no effect on touch devices or with reduced motion.
- AC-39 (US-17): Given `/` at 640 px or wider, then the hero spans the full width and at least the viewport height below the header, with the 3D graph (or its still image) behind a centred H1, the subhead, the "Join early access" and "See how it works" CTAs and a "Scroll to explore" link to `#connects`; text stays legible over the scene (a scrim behind the text block), and drag, hover and approve still work on desktop outside the text and buttons. Under 640 px, the text, subhead and CTAs come first and the graph sits full-width in its own block below them with its controls, then "Scroll to explore"; nothing overlaps. (Revisions 5 and 7.)
- AC-40 (US-17): Given a desktop visitor with a fine pointer and motion allowed, then scrolling (wheel and anchor links) is smooth and inertial, anchor links land below the sticky header, and keyboard scrolling still works; on touch devices or with reduced motion, native scrolling is used.
- AC-41 (US-17): Given motion is allowed, when a section heading first scrolls into view, then its lines slide up out of a mask one after another, once; headings already on screen, and all headings with reduced motion, show immediately; the heading text stays whole for screen readers and search.
- AC-42 (US-17): Given motion is allowed, when the visitor hovers an early-access card on `/pricing`, then its surface responds (lightens, border strengthens) within about 300 ms, easing out; with reduced motion there is no movement. (Revision 12: the lifecycle cards are gone.)
- AC-43 (US-18): Given `/`, then a "Connects to" strip after the hero scrolls an endless row of the Phase 1 sources (CSV, Excel (XLSX), Parquet, PostgreSQL read-only), then "Coming next" with MySQL and SQL Server, with generic icons; it pauses on hover or keyboard focus, duplicate items are hidden from screen readers, and with reduced motion it shows as a still, wrapped list. (Revision 12.)
- AC-44 (US-17): Given any page, then text uses Geist and data labels use Geist Mono, self-hosted (no requests to font services from the visitor's browser).
- AC-45 (US-19): Given `/pricing`, then its H1 is "Early access is free" and it shows two cards in order: "Early access" ("Free", what exists today, "Join early access" → `/#early-access`) and "Coming next" ("Later", transformation, validation, publishing, monitoring and more databases, "Talk to us" → mailto the site email), plus a note that pricing for later will follow real usage; no dollar amounts appear anywhere on the site. (Revision 12: replaces the four plans.)
- AC-46 (US-19): Given `/pricing`, then there are no plans and no comparison table, and no Readiness Report is mentioned. (Revision 12: the comparison table is removed.)
- AC-47 (US-19): Given `/pricing`, then a FAQ includes "Why is it free?", "What happens after early access?", "Where does it run?" and "Which AI does it use?" as expandable items that work without JavaScript; the "after early access" answer says only that pricing will follow real usage. (Revision 12.)
- AC-48 (US-20): Given `/`, then the `trust` section shows the four Phase 1 states Observed, Inferred, Confirmed and Defined (no Validated) with the customer_id examples, and there is no `lifecycle` section. (Revision 12.)
- AC-49 (US-19): Given `/pricing`, then its title is "Early access" with the site name from config, it shares the header, footer, theme and fonts of `/`, and it has no horizontal page scroll at 320 px. (Revision 12.)
- AC-50 (US-21): Given `/` (server HTML, still image, 3D scene, reduced motion or no WebGL alike), then the hero contains a status card labelled "Example" with five rows: sources ("12 tables, 2.4M rows"), findings ("14 undocumented fields"), identifiers ("3 possible, 1 to confirm", in the amber inferred colour), contract ("9 of 12 rules defined") and the next action ("Confirm customer_id"); it is HTML text readable by screen readers, not part of the canvas. From 640 px it sits over the scene without covering the H1, subhead, CTAs, Replay or the "Approve suggested link" button; under 640 px it sits directly below the graph block. (Revision 12.)
- AC-51 (US-01, US-21): Given `/`, then the supporting line "Runs on your machine. AI suggestions are optional, and you see what is sent before anything leaves." is shown under the subhead; at 375×812 AC-01 still holds. (Revision 12.)
- AC-52 (US-04): Given the `who` section, then data analysts and engineers come first, labelled "Built for", and data consultants second, labelled "Also for"; the `about` section names the team (Trison Labs) from site config. (Revision 12.)
- AC-53 (US-22): Given the colour tokens, then accent, accent-strong and on-accent keep revision 4's mono values (light #0a0a0a, #2a2a2a, #ffffff; dark #ffffff, #e0e0e0, #000000); surface is #F4F4F5 (light) and #18181B (dark); brand is #E77123 (light) and #FE7F2D (dark) with #000000 text, and brand-ink is #C2500A (light) and #FE7F2D (dark); sections have no background of their own; the hero's, pricing's and form's "Join early access" buttons are orange and the header's is black/white; orange also appears on the wordmark's dot, the favicon, the share image's bar, the active how-it-works step, the audience labels, link underlines, the FAQ "+" and focus rings, and on no other button or link; no indigo or other hue is used; the 3D hero's colours and the demo graph's edges never use orange. (Revision 9.)
- AC-54 (US-23): Given motion is allowed and a fine pointer, when the visitor hovers (or keyboard-focuses) a button-style control (every Join button, See how it works, Talk to us, the demo's buttons, the hero's Approve and Replay), then a fill sweeps across it from the left within about 350 ms (orange buttons to brand-strong, keeping black text); with reduced motion the fill appears instantly. (Revision 10.)
- AC-55 (US-23): Given motion is allowed, when the visitor presses one of those controls, then it scales in (0.96) and a ripple centred on the press point spreads and fades, and is removed afterwards; disabled controls get neither; with reduced motion there is no press and no ripple. (Revision 10.)

## Non-functional
- No horizontal scroll at 320 px width; body text contrast ≥ 4.5:1; visible focus on every interactive element.
- React Flow is loaded only by the demo (client component); the rest of the page is server-rendered.
- Revision 3 keeps the same budget: interaction code for the hero lives in the lazy 3D chunk; the theme script is inline and
  tiny; no new dependency unless a step needs it.
- 3D budget (from the `web-motion-3d` skill): the H1 remains the largest content on first paint; three.js loads in a
  separate chunk after the page is usable; desktop DPR at most 2, phones at most 1.5; animation is time-based; no
  per-frame allocations; hand-made GPU resources are disposed on unmount.
- `next build` passes; no secrets in `NEXT_PUBLIC_*` (the form endpoint is public by design).

## Verification
`npm run lint`, `npm run typecheck`, `npm test` (Vitest), `npm run test:e2e` (Playwright journey: load → demo accept → submit form with a mocked endpoint; 3D: reduced-motion fallback, canvas mount, Replay, light tier, pause off-screen; story moments; icons; word budget), `npm run build` (3D in a separate chunk), `npm run check:launch` (expected to fail until real values are set).

## Dependencies
Formspree form (founders create it); domain + mailbox; Vercel project.

## Out of Scope
File uploads, accounts, analytics, dark mode, translations, blog/SEO guides, founder names and photos, real legal entity details.

## Open Questions
None blocking.

## Revision History
- Revision 1: Initial draft from strategy §19 and the user's answers on 2026-10-10; approved by the user in chat, 2026-10-10.
- Revision 2: Adds US-08..US-10 and AC-19..AC-27 (3D hero, story motion, icons, shorter copy) and moves the demo into its own `demo` section (AC-11), from the user's answers on 2026-10-10; approved by the user in chat, 2026-10-10.
- Revision 3: Adds US-11..US-16 and AC-28..AC-38 (petrol palette with dark mode, interactive hero, scroll-driven story, richer demo, micro-interactions, cursor effects); AC-36 supersedes the destination part of AC-07. From the user's answers on 2026-10-10; approved by the user in chat, 2026-10-10.
- Revision 4: Pure mono palette, dark by default (AC-28 changed), Geist type, full-bleed hero, smooth scroll, heading reveals, hover zoom and a "Connects to" marquee (US-17, US-18, AC-39..AC-44; AC-11 gains `connects`), from the user's answers on 2026-10-11 after studying scale.com; approved by the user in chat, 2026-10-11.
- Revision 5: AC-39 on phones (under 640 px): text first, graph in its own block below, after the phone screenshot showed text overlapping the graph and controls; chosen by the user in chat, 2026-10-11.
- Revision 6: Reference-only change: the source of truth moves from the retired "Velora — Strategy & Plan.md" to "Velora — Product Vision v2.md"; no criteria changed. Approved by the user's "only repoint references" choice in chat, 2026-10-11.
- Revision 7: Content follows Product Vision v2 (AC-01, AC-11, AC-12, AC-13, AC-25, AC-26, AC-27, AC-34, AC-39, AC-42 changed; US-19, US-20, AC-45..AC-49 added): v2 hero and narrative, five-stage scroll story, trust model and lifecycle sections, AI & privacy, and a separate /pricing page (cards, comparison table, FAQ; no dollar amounts). From the user's answers on 2026-10-11; approved by the user in chat, 2026-10-11.
- Revision 8: Closes the gaps between the site and v2 (AC-14, AC-34, AC-45, AC-47 changed; US-21, AC-50..AC-52 added): hero status card and supporting line, ChatGPT FAQ removed, v2-only pricing wording, Trusted Data Product checklist, First/Next audiences. From the user's answers on 2026-10-11; approved by the user in chat, 2026-10-11.
- Revision 9: Orange, black and white: orange #FE7F2D (from Color Hunt palette 000000-233d4d-fe7f2d-eaecf0; a little dimmer and darker #E77123 in light) with black text on every Join button and the highlights, mono controls, neutral grey/graphite cards on untinted sections (US-22, AC-53 added; AC-30 extended); graphs neutral, dark by default unchanged. A sky accent, the palette's slate and an indigo accent were tried and reviewed the same day but never shipped. From the user's answers on 2026-10-11; approved by the user in chat, 2026-10-11.
- Revision 10: Fill-sweep hover and press + ripple click on every button-style control (US-23, AC-54, AC-55 added); the header's Join button becomes black/white (AC-53 adjusted). From the user's answers on 2026-10-11; approved by the user in chat, 2026-10-11.
- Revision 11: Reference-only change: the product is renamed Conflux (id VEL-WEB-landing → CFX-WEB-landing, `velora.example` → `conflux.example`), v2 moves to `../docs/archive/`, and the source of truth becomes `../docs/Conflux_Phase1_Development_Direction.md`; no criteria changed, the copy rewrite is an open question. Approved by the user's "Everywhere" and "Phase 1 doc replaces v2" choices in chat, 2026-10-30.
- Revision 12: Content follows the approved Conflux Phase 1 direction (US-04, US-13, US-14, US-18..US-21 reworded; AC-02, AC-05..AC-07, AC-11..AC-14, AC-26, AC-27, AC-32, AC-34..AC-36, AC-42, AC-43, AC-45..AC-52 changed): three stages plus "Coming next", four trust states, a review-and-export demo, Phase 1 §7 claims only, provider-neutral AI, no lifecycle, no Readiness Report, and a free early-access page instead of plans; Trison Labs named as the team. From the user's answers on 2026-10-31; approved by the user in chat, 2026-10-31.
- Revision 13: Reference-only change: the product and company are renamed DrivnX (`conflux.example` → `drivnx.example`, operator "DrivnX (company registration in progress)", source of truth `../docs/DrivnX_Phase1_Development_Direction.md`); requirement IDs keep the `CFX-` prefix; no criteria changed. Approved by the user's rename plan in chat, 2026-11-07.
- Revision 14: Reference-only change: the workspace is now a plain `DrivnX/` folder with drivnx-docs next to this repo, so `../docs/` becomes `../drivnx-docs/docs/`. No change to behaviour.
