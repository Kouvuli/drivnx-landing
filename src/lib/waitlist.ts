// Early-access form logic (CFX-WEB-landing AC-02..AC-05). Contract: POST JSON to a form processor such as Formspree.

export type Segment = "business" | "data-team" | "consultant";

export const segments: { value: Segment; label: string }[] = [
  { value: "business", label: "Growing business" },
  { value: "data-team", label: "Data team or analyst" },
  { value: "consultant", label: "Consultant or partner" },
];

export type WaitlistEntry = { email: string; segment: Segment; readinessReport: boolean };

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function buildPayload(entry: WaitlistEntry) {
  return { email: entry.email.trim(), segment: entry.segment, readinessReport: entry.readinessReport, source: "landing" };
}

export async function submitWaitlist(
  endpoint: string,
  entry: WaitlistEntry,
  fetchImpl: typeof fetch = fetch,
): Promise<"ok" | "error"> {
  try {
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildPayload(entry)),
    });
    return res.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}

export function buildMailto(to: string, entry: WaitlistEntry): string {
  const segment = segments.find((s) => s.value === entry.segment)?.label ?? entry.segment;
  const body = [
    `Email: ${entry.email.trim()}`,
    `I am a: ${segment}`,
    `Free Readiness Report: ${entry.readinessReport ? "yes" : "no"}`,
  ].join("\n");
  const query = new URLSearchParams({ subject: "Early access", body }).toString().replace(/\+/g, "%20");
  return `mailto:${to}?${query}`;
}
