// State of the demo (CFX-WEB-landing AC-06..AC-10, AC-35, AC-36): three issues to fix, then a dry run before sending.
// Figures are illustrative.

export const DEMO = { totalOrders: 4812, unmatchedOrders: 312, confidence: 94, customers: 1204, duplicateMatch: 97 };

export const SUGGESTED_LINK = { sourceHandle: "cust_no", targetHandle: "customer_id" };

export type DemoState = {
  linked: boolean;
  merged: boolean;
  converted: boolean;
  dryRun: "idle" | "running" | "passed";
  hint: string | null;
  /** What happened last, for the status message. */
  last: "start" | "linked" | "merged" | "converted" | "running" | "passed";
};

export type DemoAction =
  | { type: "accept" }
  | { type: "connect"; sourceHandle: string | null; targetHandle: string | null }
  | { type: "merge" }
  | { type: "convert" }
  | { type: "startDryRun" }
  | { type: "finishDryRun" }
  | { type: "reset" };

export const initialDemoState: DemoState = { linked: false, merged: false, converted: false, dryRun: "idle", hint: null, last: "start" };

export const fixedCount = (s: DemoState) => Number(s.linked) + Number(s.merged) + Number(s.converted);
export const canRunDryRun = (s: DemoState) => fixedCount(s) === 3 && s.dryRun === "idle";
export const canSend = (s: DemoState) => s.dryRun === "passed";

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "accept":
      return { ...state, linked: true, hint: null, last: "linked" };
    case "connect":
      if (action.sourceHandle === SUGGESTED_LINK.sourceHandle && action.targetHandle === SUGGESTED_LINK.targetHandle) {
        return { ...state, linked: true, hint: null, last: "linked" };
      }
      return { ...state, hint: "Those columns don't match. Try cust_no → customer_id." };
    case "merge":
      return { ...state, merged: true, hint: null, last: "merged" };
    case "convert":
      return { ...state, converted: true, hint: null, last: "converted" };
    case "startDryRun":
      return canRunDryRun(state) ? { ...state, dryRun: "running", hint: null, last: "running" } : state;
    case "finishDryRun":
      return state.dryRun === "running" ? { ...state, dryRun: "passed", last: "passed" } : state;
    case "reset":
      return initialDemoState;
  }
}
