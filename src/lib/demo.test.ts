import { describe, expect, it } from "vitest";
import { canDefineRule, canExport, demoReducer, initialDemoState, reviewedCount, SUGGESTED_LINK, type DemoState } from "./demo";

const apply = (...actions: Parameters<typeof demoReducer>[1][]) => actions.reduce(demoReducer, initialDemoState);
const allReviewed = (): DemoState => apply({ type: "accept" }, { type: "confirmIdentifier" }, { type: "defineRule" });

describe("demo review items (CFX-WEB-landing AC-06, CFX-WEB-landing AC-35)", () => {
  it("starts with three open items and no hint", () => {
    expect(initialDemoState).toMatchObject({ relationship: false, identifier: false, rule: false, exported: false, hint: null });
    expect(reviewedCount(initialDemoState)).toBe(0);
  });

  it("confirms the relationship when the suggestion is accepted (CFX-WEB-landing AC-07)", () => {
    const s = apply({ type: "accept" });
    expect(s.relationship).toBe(true);
    expect(reviewedCount(s)).toBe(1);
  });

  it("confirms the relationship when the suggested columns are connected by hand (CFX-WEB-landing AC-08)", () => {
    const s = apply({ type: "connect", sourceHandle: SUGGESTED_LINK.sourceHandle, targetHandle: SUGGESTED_LINK.targetHandle });
    expect(s.relationship).toBe(true);
    expect(s.hint).toBeNull();
  });

  it("stays inferred with a hint when other columns are connected (CFX-WEB-landing AC-08)", () => {
    const s = apply({ type: "connect", sourceHandle: "order_id", targetHandle: "customer_id" });
    expect(s.relationship).toBe(false);
    expect(s.hint).toBe("Those columns don't match. Try cust_no → customer_id.");
  });

  it("defines a rule only from a confirmed identifier (Confirmed → Defined)", () => {
    expect(canDefineRule(initialDemoState)).toBe(false);
    expect(apply({ type: "defineRule" })).toEqual(initialDemoState);
    const confirmed = apply({ type: "confirmIdentifier" });
    expect(canDefineRule(confirmed)).toBe(true);
    expect(demoReducer(confirmed, { type: "defineRule" }).rule).toBe(true);
    expect(reviewedCount(allReviewed())).toBe(3);
  });
});

describe("export needs every item reviewed (CFX-WEB-landing AC-36)", () => {
  it("cannot export until all three items are reviewed", () => {
    const partial = apply({ type: "accept" }, { type: "confirmIdentifier" });
    expect(canExport(partial)).toBe(false);
    expect(demoReducer(partial, { type: "export" })).toEqual(partial);
    expect(canExport(allReviewed())).toBe(true);
  });

  it("exports once everything is reviewed", () => {
    const exported = demoReducer(allReviewed(), { type: "export" });
    expect(exported).toMatchObject({ exported: true, last: "exported" });
  });

  it("returns to the initial state on reset (CFX-WEB-landing AC-09)", () => {
    const exported = demoReducer(allReviewed(), { type: "export" });
    expect(demoReducer(exported, { type: "reset" })).toEqual(initialDemoState);
  });
});
