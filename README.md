# Conflux landing page

The public company website: explains the product, runs an interactive graph demo and collects early-access sign-ups.

- **Requirements:** [.ai/knowledge/requirements/CFX-WEB-landing.md](.ai/knowledge/requirements/CFX-WEB-landing.md) (approved, revision 12)
- **Product source of truth:** `../docs/Conflux_Phase1_Development_Direction.md` (approved); the copy follows it since revision 12
- **Pages:** `/` (Phase 1 story), `/pricing` ("Early access is free": now, coming next, FAQ), `/privacy`
- **Stack:** Next.js 16.4 (App Router), React 19.3, Tailwind CSS 4, React Flow 12 (demo), React Three Fiber 9 + three.js
  (hero, lazy-loaded), Motion 14 (story moments), Lucide icons
- **Motion rules:** the `web-motion-3d` skill (`.claude/skills/web-motion-3d/`): still fallback first, 3D only after load
  and when visible, light tier on phones, nothing animated for reduced-motion visitors
- **Theme:** pure mono (black and white) in orange, black and white: orange #FE7F2D Join buttons and highlights (never graphs), black/white controls, grey/graphite cards, dark by default (`src/app/globals.css`, one `light-dark()` token per colour;
  contrast tested in `src/app/theme.test.ts`). The header toggle stores `theme` in localStorage and an inline script in
  `layout.tsx` applies it before first paint. Type: Geist and Geist Mono. Palette mocks: `../docs/design-mocks/`
- **Motion (scale.com-inspired patterns, no code taken):** full-bleed 3D hero (stacked on phones), Lenis smooth scroll
  on desktop (`SmoothScroll`), line-by-line heading reveals (`RevealHeading`), hover zoom, "Connects to" marquee

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
```

## Checks

| Command | What it does |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit and component tests (form and demo logic) |
| `npm run test:e2e` | Playwright journey on desktop and phone sizes; builds and starts the site on port 3100 |
| `npm run build` | Production build (every route is static) |
| `npm run check:launch` | Fails while `src/config/site.ts` still has `.example` placeholders |

Playwright needs Chromium once: `npx playwright install chromium`. To use a browser that's already installed instead, set
`PLAYWRIGHT_CHROMIUM_PATH` (e.g. `PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`).

## Configuration

| Where | What |
|---|---|
| `src/config/site.ts` | Brand name, domain, URL, contact email, operator name, title and description. Nothing else hard-codes these. |
| `NEXT_PUBLIC_WAITLIST_ENDPOINT` | Form processor URL (e.g. a Formspree form). Unset = the form opens an email draft to the contact email instead. Set it in Vercel's project settings. |

## Before launch

1. Buy the domain and set up the mailbox; put both in `src/config/site.ts`.
2. Create the Formspree form; set `NEXT_PUBLIC_WAITLIST_ENDPOINT` in Vercel.
3. `npm run check:launch` must pass, then deploy on Vercel.
4. Use the live URL and the same-domain email in the Claude Startups application.

## Layout

```text
src/app/            page.tsx (home), pricing/, privacy/, opengraph-image.tsx, icon.svg, layout.tsx, globals.css (tokens)
src/components/     GraphDemo (review 3 items + export contract), HowItWorks (pinned scroll story), WaitlistForm, Section,
                    SiteChrome (header/footer), ThemeToggle, StoryMotion,
                    ConnectsMarquee, RevealHeading, SmoothScroll, HowItWorks (three-stage story + Coming next)
src/components/hero HeroScene (still vs 3D), HeroCanvas (three.js, own chunk), HeroGraphStill (SVG fallback),
                    HeroStatus (example status card); src/components/ButtonRipple (click ripple for `fx` buttons)
src/lib/            demo.ts, waitlist.ts, heroGraph.ts, format.ts, theme.ts: pure logic, unit-tested
src/config/site.ts  brand and company details
e2e/                Playwright: landing.spec.ts (journey, demo, narrative), motion.spec.ts (3D, interaction, motion,
                    icons, word budget), theme.spec.ts (theme, fonts), pricing.spec.ts (early access, FAQ)
scripts/            check-launch.mjs
.ai/                AI Skill OS: manifest, lock, knowledge (requirements live here)
```
