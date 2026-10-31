import { describe, expect, it } from "vitest";
import { formatCount } from "./format";

describe("formatCount (CFX-WEB-landing AC-25)", () => {
  it("formats the dashboard's final values", () => {
    expect(formatCount(4812)).toBe("4,812");
    expect(formatCount(100, { suffix: "%" })).toBe("100%");
    expect(formatCount(1.28, { decimals: 2, prefix: "$", suffix: "M" })).toBe("$1.28M");
  });

  it("rounds values in the middle of a count-up", () => {
    expect(formatCount(2406.6)).toBe("2,407");
    expect(formatCount(0.314, { decimals: 2, prefix: "$", suffix: "M" })).toBe("$0.31M");
  });
});
