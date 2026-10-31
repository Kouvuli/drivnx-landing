import { describe, expect, it } from "vitest";
import { canRunDryRun, canSend, demoReducer, fixedCount, initialDemoState, SUGGESTED_LINK, type DemoState } from "./demo";

const apply = (...actions: Parameters<typeof demoReducer>[1][]) => actions.reduce(demoReducer, initialDemoState);
const allFixed = (): DemoState => apply({ type: "accept" }, { type: "merge" }, { type: "convert" });

describe("demo issues (CFX-WEB-landing AC-06, CFX-WEB-landing AC-35)", () => {
  it("starts with three open issues and no hint", () => {
    expect(initialDemoState).toMatchObject({ linked: false, merged: false, converted: false, dryRun: "idle", hint: null });
    expect(fixedCount(initialDemoState)).toBe(0);
  });

  it("links when the suggestion is accepted (CFX-WEB-landing AC-07)", () => {
    const s = apply({ type: "accept" });
    expect(s.linked).toBe(true);
    expect(fixedCount(s)).toBe(1);
  });

  it("links when the suggested columns are connected by hand (CFX-WEB-landing AC-08)", () => {
    const s = apply({ type: "connect", sourceHandle: SUGGESTED_LINK.sourceHandle, targetHandle: SUGGESTED_LINK.targetHandle });
    expect(s.linked).toBe(true);
    expect(s.hint).toBeNull();
  });

  it("stays unlinked with a hint when other columns are connected (CFX-WEB-landing AC-08)", () => {
    const s = apply({ type: "connect", sourceHandle: "order_id", targetHandle: "customer_id" });
    expect(s.linked).toBe(false);
    expect(s.hint).toBe("Those columns don't match. Try cust_no → customer_id.");
  });

  it("counts merge and convert as fixes", () => {
    expect(fixedCount(apply({ type: "merge" }))).toBe(1);
    expect(fixedCount(apply({ type: "merge" }, { type: "convert" }))).toBe(2);
    expect(fixedCount(allFixed())).toBe(3);
  });
});

describe("dry run gates sending (CFX-WEB-landing AC-36)", () => {
  it("cannot run until all three issues are fixed", () => {
    const partial = apply({ type: "accept" }, { type: "merge" });
    expect(canRunDryRun(partial)).toBe(false);
    expect(demoReducer(partial, { type: "startDryRun" })).toEqual(partial);
    expect(canRunDryRun(allFixed())).toBe(true);
  });

  it("enables sending only after the dry run passes", () => {
    const running = demoReducer(allFixed(), { type: "startDryRun" });
    expect(running.dryRun).toBe("running");
    expect(canSend(running)).toBe(false);
    const passed = demoReducer(running, { type: "finishDryRun" });
    expect(passed.dryRun).toBe("passed");
    expect(canSend(passed)).toBe(true);
    expect(canSend(allFixed())).toBe(false);
  });

  it("ignores a stray finish without a running dry run", () => {
    expect(demoReducer(allFixed(), { type: "finishDryRun" }).dryRun).toBe("idle");
  });

  it("returns to the initial state on reset (CFX-WEB-landing AC-09)", () => {
    const passed = demoReducer(demoReducer(allFixed(), { type: "startDryRun" }), { type: "finishDryRun" });
    expect(demoReducer(passed, { type: "reset" })).toEqual(initialDemoState);
  });
});
