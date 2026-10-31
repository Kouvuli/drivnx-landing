// Layout and timing of the 3D hero (CFX-WEB-landing AC-19..AC-24). Pure, deterministic and shared by the
// canvas and the still fallback, so both draw the same graph.

export type Tier = "high" | "low";

export const QUALITY = {
  high: { maxPoints: 40, dpr: [1, 1.5] as [number, number], pointer: true },
  low: { maxPoints: 24, dpr: [1, 1.5] as [number, number], pointer: false },
};

/** Seconds the scattered points take to settle into the graph. */
export const ASSEMBLY_SECONDS = 3.6;
const MAX_DELAY = 0.8;

const HUBS = [
  { label: "Customers", records: 1204, x: -1.5, y: 0.85 },
  { label: "Orders", records: 4812, x: 1.5, y: 0.85 },
  { label: "Products", records: 386, x: 1.5, y: -0.85 },
  { label: "Invoices", records: 4790, x: -1.5, y: -0.85 },
];

/** Example records shown when a point is hovered or tapped (CFX-WEB-landing AC-32). Illustrative. */
export const HUB_SAMPLES = [
  ["ACME, Inc. → matched to Acme Inc.", "J. Smith → matched to John Smith", "Northwind LLC → matched to Northwind"],
  ["SO-10432 → linked to Acme Inc.", "SO-10518 → linked to Acme Inc.", "SO-10611 → linked to Bolt & Co."],
  ["DRL-200 → matched to Cordless drill", "BIT-SET → matched to Drill bit set", "GLS-4 → matched to Safety glasses"],
  ["INV-2207 → linked to SO-10432", "INV-2231 → linked to SO-10518", "INV-2240 → linked to SO-10611"],
];

/** The hub link that stays "Suggested" until the visitor approves it: Orders–Invoices (CFX-WEB-landing AC-33). */
export const SUGGESTED_HUB_LINK = 3;

const HUB_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 3],
];

export type HeroGraph = {
  count: number;
  hubs: typeof HUBS;
  /** xyz per point; points 0..3 are the hubs. */
  starts: Float32Array;
  targets: Float32Array;
  /** Seconds each point waits before it starts moving. */
  delays: number[];
  recordLinks: [number, number][];
  hubLinks: [number, number][];
};

function random(seed: number) {
  // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildHeroGraph(tier: Tier): HeroGraph {
  const rand = random(7);
  const perHub = (QUALITY[tier].maxPoints - HUBS.length) / HUBS.length;
  const count = HUBS.length + perHub * HUBS.length;
  const starts = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const delays: number[] = [];
  const recordLinks: [number, number][] = [];

  for (let i = 0; i < count; i++) {
    const hub = i < HUBS.length ? i : (i - HUBS.length) % HUBS.length;
    const h = HUBS[hub];
    let tx = h.x;
    let ty = h.y;
    let tz = 0;
    if (i >= HUBS.length) {
      const k = Math.floor((i - HUBS.length) / HUBS.length);
      const angle = (k / perHub) * Math.PI * 2 + hub;
      tx += Math.cos(angle) * 0.55;
      ty += Math.sin(angle) * 0.5;
      tz = (rand() - 0.5) * 0.4;
      recordLinks.push([i, hub]);
    }
    targets.set([tx, ty, tz], i * 3);
    starts.set([(rand() - 0.5) * 6, (rand() - 0.5) * 4, (rand() - 0.5) * 3], i * 3);
    delays.push(rand() * MAX_DELAY);
  }

  return { count, hubs: HUBS, starts, targets, delays, recordLinks, hubLinks: HUB_LINKS };
}

/** easeInOutCubic */
export function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** 0..1 progress of one point, `elapsed` seconds after the assembly started. */
export function pointProgress(elapsed: number, delay: number) {
  const t = (elapsed - delay) / (ASSEMBLY_SECONDS - MAX_DELAY);
  return ease(Math.min(1, Math.max(0, t)));
}

export function hubLabel(hub: number) {
  const h = HUBS[hub];
  return `${h.label}, ${h.records.toLocaleString("en-US")} records`;
}

export function recordSample(graph: HeroGraph, point: number) {
  const hub = (point - graph.hubs.length) % graph.hubs.length;
  const k = Math.floor((point - graph.hubs.length) / graph.hubs.length);
  return HUB_SAMPLES[hub][k % HUB_SAMPLES[hub].length];
}

/**
 * Offset that eases a point at (x, y) away from the cursor at (px, py) (CFX-WEB-landing AC-38). The push is a smooth
 * ring: zero under the cursor (so the hovered point stays put and can be inspected), largest in between, zero beyond
 * `outer`. Writes into `out` so the frame loop allocates nothing.
 */
export function repelOffset(
  px: number,
  py: number,
  x: number,
  y: number,
  out: [number, number] = [0, 0],
  inner = 0.25,
  outer = 0.9,
  strength = 0.16,
): [number, number] {
  const dx = x - px;
  const dy = y - py;
  const d = Math.hypot(dx, dy);
  if (d <= inner || d >= outer) {
    out[0] = 0;
    out[1] = 0;
    return out;
  }
  const push = Math.sin((Math.PI * (d - inner)) / (outer - inner)) * strength;
  out[0] = (dx / d) * push;
  out[1] = (dy / d) * push;
  return out;
}
