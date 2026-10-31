import { describe, expect, it } from "vitest";
import { buildHeroGraph, ease, HUB_SAMPLES, hubLabel, pointProgress, QUALITY, recordSample, repelOffset, SUGGESTED_HUB_LINK } from "./heroGraph";

describe("buildHeroGraph (CFX-WEB-landing AC-20, AC-23)", () => {
  it("uses 40 points on the high tier and at most 24 on the light tier", () => {
    expect(buildHeroGraph("high").count).toBe(40);
    expect(buildHeroGraph("low").count).toBeLessThanOrEqual(24);
    expect(QUALITY.low.maxPoints).toBeLessThanOrEqual(24);
    expect(QUALITY.low.dpr[1]).toBeLessThanOrEqual(1.5);
    expect(QUALITY.high.dpr[1]).toBeLessThanOrEqual(2);
    expect(QUALITY.low.pointer).toBe(false);
  });

  it("is deterministic, so server and browser draw the same graph", () => {
    expect(buildHeroGraph("high")).toEqual(buildHeroGraph("high"));
  });

  it("links every record to one of the four hubs, and the hubs to each other", () => {
    const g = buildHeroGraph("high");
    expect(g.hubs).toHaveLength(4);
    const records = g.count - g.hubs.length;
    expect(g.recordLinks).toHaveLength(records);
    for (const [record, hub] of g.recordLinks) {
      expect(record).toBeGreaterThanOrEqual(g.hubs.length);
      expect(hub).toBeLessThan(g.hubs.length);
    }
    expect(g.hubLinks.length).toBeGreaterThanOrEqual(3);
  });

  it("starts scattered and ends near the hubs", () => {
    const g = buildHeroGraph("high");
    let moved = 0;
    for (let i = 0; i < g.count; i++) {
      const dx = g.starts[i * 3] - g.targets[i * 3];
      const dy = g.starts[i * 3 + 1] - g.targets[i * 3 + 1];
      if (Math.hypot(dx, dy) > 0.5) moved++;
      expect(Math.abs(g.targets[i * 3])).toBeLessThan(2.6);
      expect(Math.abs(g.targets[i * 3 + 1])).toBeLessThan(1.8);
    }
    expect(moved).toBeGreaterThan(g.count * 0.8);
  });
});

describe("assembly timing (CFX-WEB-landing AC-20)", () => {
  it("eases from 0 to 1", () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBeGreaterThan(0);
  });

  it("finishes every point within the 4 second assembly", () => {
    const g = buildHeroGraph("high");
    for (let i = 0; i < g.count; i++) {
      expect(pointProgress(0, g.delays[i])).toBe(0);
      expect(pointProgress(4, g.delays[i])).toBe(1);
    }
  });
});

describe("hero interaction data (CFX-WEB-landing AC-32, CFX-WEB-landing AC-33)", () => {
  it("labels hubs with their record counts", () => {
    expect(hubLabel(0)).toBe("Customers, 1,204 records");
    expect(hubLabel(1)).toBe("Orders, 4,812 records");
  });

  it("gives every record point a sample that belongs to its hub", () => {
    const g = buildHeroGraph("high");
    for (const [record, hub] of g.recordLinks) {
      expect(HUB_SAMPLES[hub]).toContain(recordSample(g, record));
    }
    expect(recordSample(g, 4)).toBe("customer_id: 99.8% unique, possible identifier");
  });

  it("keeps the Orders–Invoices link as the suggested one", () => {
    const g = buildHeroGraph("high");
    expect(g.hubLinks[SUGGESTED_HUB_LINK]).toEqual([1, 3]);
  });
});

describe("cursor push (CFX-WEB-landing AC-38)", () => {
  it("pushes points in a ring around the cursor away from it", () => {
    const [dx, dy] = repelOffset(0, 0, 0.55, 0);
    expect(dx).toBeGreaterThan(0.1);
    expect(dy).toBe(0);
    expect(repelOffset(0, 0, -0.55, 0)[0]).toBeLessThan(0);
  });

  it("leaves the point under the cursor and distant points in place", () => {
    expect(repelOffset(0, 0, 0.1, 0.05)).toEqual([0, 0]);
    expect(repelOffset(0, 0, 2, 0)).toEqual([0, 0]);
  });

  it("writes into the array it is given", () => {
    const out: [number, number] = [9, 9];
    expect(repelOffset(0, 0, 0.5, 0, out)).toBe(out);
  });
});
