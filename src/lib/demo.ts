// State of the demo (CFX-WEB-landing AC-06..AC-10, AC-35, AC-36): three review items move facts through the trust
// states (Inferred → Confirmed → Defined), then the contract is exported. Figures are illustrative.

export const DEMO = { totalOrders: 4812, customers: 1204, confidence: 94, uniqueness: 99.8, profileRun: 42 };

export const SUGGESTED_LINK = { sourceHandle: "cust_no", targetHandle: "customer_id" };

export type DemoState = {
  /** The inferred relationship orders.cust_no → customers.customer_id is confirmed. */
  relationship: boolean;
  /** customer_id is confirmed as the customer identifier. */
  identifier: boolean;
  /** "customer_id must be non-null and unique" is defined in the contract. */
  rule: boolean;
  exported: boolean;
  hint: string | null;
  /** What happened last, for the status message. */
  last: "start" | "relationship" | "identifier" | "rule" | "exported";
};

export type DemoAction =
  | { type: "accept" }
  | { type: "connect"; sourceHandle: string | null; targetHandle: string | null }
  | { type: "confirmIdentifier" }
  | { type: "defineRule" }
  | { type: "export" }
  | { type: "reset" };

export const initialDemoState: DemoState = {
  relationship: false,
  identifier: false,
  rule: false,
  exported: false,
  hint: null,
  last: "start",
};

export const reviewedCount = (s: DemoState) => Number(s.relationship) + Number(s.identifier) + Number(s.rule);
/** Only a confirmed fact can become a contract rule (Phase 1 §12: Confirmed → Defined). */
export const canDefineRule = (s: DemoState) => s.identifier && !s.rule;
export const canExport = (s: DemoState) => reviewedCount(s) === 3;

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "accept":
      return { ...state, relationship: true, hint: null, last: "relationship" };
    case "connect":
      if (action.sourceHandle === SUGGESTED_LINK.sourceHandle && action.targetHandle === SUGGESTED_LINK.targetHandle) {
        return { ...state, relationship: true, hint: null, last: "relationship" };
      }
      return { ...state, hint: "Those columns don't match. Try cust_no → customer_id." };
    case "confirmIdentifier":
      return { ...state, identifier: true, hint: null, last: "identifier" };
    case "defineRule":
      return canDefineRule(state) ? { ...state, rule: true, hint: null, last: "rule" } : state;
    case "export":
      return canExport(state) ? { ...state, exported: true, hint: null, last: "exported" } : state;
    case "reset":
      return initialDemoState;
  }
}
