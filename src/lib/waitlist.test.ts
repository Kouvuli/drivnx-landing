import { describe, expect, it, vi } from "vitest";
import { buildMailto, buildPayload, isValidEmail, submitWaitlist, type WaitlistEntry } from "./waitlist";

const entry: WaitlistEntry = { email: "sam@shop.com", segment: "business", readinessReport: true };

describe("isValidEmail (CFX-WEB-landing AC-03)", () => {
  it.each(["sam@shop.com", "a.b+c@sub.example.org"])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });
  it.each(["", "   ", "sam", "sam@", "sam@shop", "sam @shop.com"])("rejects %j", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe("buildPayload (CFX-WEB-landing AC-02)", () => {
  it("matches the form contract", () => {
    expect(buildPayload({ ...entry, email: "  sam@shop.com " })).toEqual({
      email: "sam@shop.com",
      segment: "business",
      readinessReport: true,
      source: "landing",
    });
  });
});

describe("submitWaitlist (CFX-WEB-landing AC-02, AC-04)", () => {
  it("posts JSON once and reports success on 2xx", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await expect(submitWaitlist("https://forms.test/f/x", entry, fetchMock)).resolves.toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://forms.test/f/x");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json", Accept: "application/json" });
    expect(JSON.parse(init.body)).toEqual(buildPayload(entry));
  });

  it("reports an error on a non-2xx response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 422 }));
    await expect(submitWaitlist("https://forms.test/f/x", entry, fetchMock)).resolves.toBe("error");
  });

  it("reports an error when the network fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("offline"));
    await expect(submitWaitlist("https://forms.test/f/x", entry, fetchMock)).resolves.toBe("error");
  });
});

describe("buildMailto (CFX-WEB-landing AC-05)", () => {
  it("addresses the site email and carries every answer in the body", () => {
    const href = buildMailto("hello@conflux.example", entry);
    expect(href.startsWith("mailto:hello@conflux.example?")).toBe(true);
    const params = new URLSearchParams(href.split("?")[1]);
    expect(params.get("subject")).toBe("Early access");
    const body = params.get("body") ?? "";
    expect(body).toContain("sam@shop.com");
    expect(body).toContain("Growing business");
    expect(body).toContain("Free Readiness Report: yes");
  });
});
