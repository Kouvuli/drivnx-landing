import { describe, expect, it } from "vitest";
import { capabilityGroups, plans } from "./pricing";

// CFX-WEB-landing AC-45, AC-46: plans and the comparison table follow Product Vision v2 §13 exactly.
const v2: Record<string, (string | boolean)[]> = {
  "Managed data products": ["Limited", "Expanded", "Shared pool", "Custom"],
  Profiling: ["Manual", "Scheduled", "Automatic", "Policy-driven"],
  "Data dictionary": [true, true, true, true],
  "Data contracts": ["Basic", true, true, "Advanced"],
  Transformation: ["Basic", true, true, "Advanced"],
  Validation: ["Basic", true, true, "Advanced"],
  "AI assistance": ["Limited", true, true, true],
  "Change detection": [false, true, true, true],
  History: [false, "Basic", true, true],
  Collaboration: [false, false, true, true],
  Governance: [false, false, "Basic", "Advanced"],
  "Deployment controls": [false, false, false, true],
};

describe("pricing data (CFX-WEB-landing AC-45, CFX-WEB-landing AC-46)", () => {
  it("has the four v2 plans in order, with no dollar amounts", () => {
    expect(plans.map((p) => p.name)).toEqual(["Free / Local", "Pro", "Team", "Enterprise"]);
    expect(plans.map((p) => p.price)).toEqual(["Free", "Early access", "Early access", "Contact us"]);
    expect(JSON.stringify(plans)).not.toMatch(/\$/);
  });

  it("lists exactly v2's twelve capabilities with v2's values, in five groups", () => {
    expect(capabilityGroups.map((g) => g.name)).toEqual([
      "Data products",
      "Understanding",
      "Building",
      "Trust & control",
      "Collaboration & governance",
    ]);
    const rows = Object.fromEntries(capabilityGroups.flatMap((g) => g.rows.map((r) => [r.name, r.values])));
    expect(rows).toEqual(v2);
  });

  // Revision 8: taglines and price notes come from v2 §13's own values, not invented audience wording.
  it("words each plan only from v2's values (CFX-WEB-landing AC-45)", () => {
    expect(plans.map((p) => [p.tagline, p.priceNote])).toEqual([
      ["Manual profiling, a data dictionary and basic contracts", "Limited data products"],
      ["Scheduled profiling, full contracts and change detection", "Limits follow real usage"],
      ["A shared pool of data products, with collaboration", "Limits follow real usage"],
      ["Policy-driven profiling, advanced governance and deployment controls", "Custom limits"],
    ]);
    expect(JSON.stringify(plans)).not.toMatch(/early customers/i);
  });

  it("builds each paid plan on the previous one", () => {
    expect(plans[0].includesFrom).toBeNull();
    expect(plans.slice(1).map((p) => p.includesFrom)).toEqual(["Free / Local", "Pro", "Team"]);
  });
});
