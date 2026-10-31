// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// CFX-WEB-landing AC-30: every text/background pair meets WCAG AA in both themes, read from the real tokens.
const css = readFileSync(join(__dirname, "globals.css"), "utf8");
const tokens: Record<"light" | "dark", Record<string, string>> = { light: {}, dark: {} };
for (const [, name, light, dark] of css.matchAll(/--color-([\w-]+):\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/gi)) {
  tokens.light[name] = light;
  tokens.dark[name] = dark;
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const pairs: [string, string, number][] = [
  ["ink", "paper", 4.5],
  ["ink", "surface", 4.5],
  ["muted", "paper", 4.5],
  ["muted", "surface", 4.5],
  ["on-accent", "accent", 4.5],
  ["on-accent", "accent-strong", 4.5],
  ["accent", "paper", 4.5],
  ["accent", "surface", 4.5],
  ["accent-strong", "paper", 4.5],
  ["accent-strong", "surface", 4.5],
  ["on-brand", "brand", 4.5],
  ["on-brand", "brand-strong", 4.5],
  ["brand-ink", "paper", 4.5],
  ["brand-ink", "surface", 3],
  ["suggested-ink", "suggested-soft", 4.5],
  ["approved", "approved-soft", 4.5],
  ["approved", "surface", 4.5],
  ["danger", "surface", 4.5],
  ["observed", "surface", 3],
  ["suggested", "surface", 3],
];

describe("colour tokens (CFX-WEB-landing AC-30)", () => {
  it("defines every token for light and dark", () => {
    const names = new Set(pairs.flat().filter((x): x is string => typeof x === "string"));
    for (const name of names) {
      expect(tokens.light[name], name).toMatch(/^#/);
      expect(tokens.dark[name], name).toMatch(/^#/);
    }
  });

  for (const theme of ["light", "dark"] as const) {
    it.each(pairs)(`${theme}: %s on %s meets %s:1`, (fg, bg, min) => {
      expect(contrast(tokens[theme][fg], tokens[theme][bg])).toBeGreaterThanOrEqual(min);
    });
  }
});

// CFX-WEB-landing AC-53 (revision 9): orange, black and white. Orange #FE7F2D (Color Hunt palette 000000-233d4d-fe7f2d-
// eaecf0) is every "Join early access" button and the highlights; all other controls are black/white on neutral cards.
// Orange never goes on the graphs (amber = suggested).
describe("revision 9 palette (CFX-WEB-landing AC-53)", () => {
  const pick = (theme: "light" | "dark", names: string[]) => names.map((n) => tokens[theme][n]?.toLowerCase());

  it("uses only orange, black and white: mono controls, orange brand, neutral cards", () => {
    const changed = ["accent", "accent-strong", "on-accent", "surface", "brand", "brand-strong", "on-brand", "brand-ink"];
    // Light orange is a little dimmer and darker than dark's, at the user's request; brand-strong is the hover sweep.
    expect(pick("light", changed)).toEqual(["#0a0a0a", "#2a2a2a", "#ffffff", "#f4f4f5", "#e77123", "#d36317", "#000000", "#c2500a"]);
    expect(pick("dark", changed)).toEqual(["#ffffff", "#e0e0e0", "#000000", "#18181b", "#fe7f2d", "#f96d10", "#000000", "#fe7f2d"]);
    const base = ["paper", "ink", "muted", "line", "danger"];
    expect(pick("light", base)).toEqual(["#ffffff", "#0a0a0a", "#5c5c5c", "#e5e5e5", "#b42318"]);
    expect(pick("dark", base)).toEqual(["#000000", "#ffffff", "#a3a3a3", "#262626", "#f97066"]);
    // Sections are never tinted: cards carry their own colour on the plain page, so they never blend in.
    expect(tokens.light.section).toBeUndefined();
  });

  it("uses the palette orange in the favicon and the share image", () => {
    const icon = readFileSync(join(__dirname, "icon.svg"), "utf8").toLowerCase();
    expect(icon).toContain("#fe7f2d");
    const og = readFileSync(join(__dirname, "opengraph-image.tsx"), "utf8").toLowerCase();
    expect(og).toContain("#fe7f2d");
    expect(og).not.toContain("#4cc38a");
  });
});
