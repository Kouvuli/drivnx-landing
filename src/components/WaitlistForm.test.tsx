import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WaitlistForm } from "./WaitlistForm";

const contactEmail = "hello@conflux.example";

afterEach(() => vi.unstubAllGlobals());

async function fillAndSubmit(email: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText("Work email"), email);
  await user.click(screen.getByLabelText("Data consultant"));
  await user.click(screen.getByRole("button", { name: "Join early access" }));
}

describe("WaitlistForm", () => {
  it("sends one request, shows a pending state, then confirms (CFX-WEB-landing AC-02)", async () => {
    let resolve: (r: Response) => void = () => {};
    const fetchMock = vi.fn(() => new Promise<Response>((r) => (resolve = r)));
    vi.stubGlobal("fetch", fetchMock);
    render(<WaitlistForm endpoint="https://forms.test/f/x" contactEmail={contactEmail} />);

    await fillAndSubmit("sam@shop.com");

    const pending = screen.getByRole("button", { name: "Joining…" });
    expect(pending).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)).toEqual({
      email: "sam@shop.com",
      segment: "consultant",
      source: "landing",
    });

    resolve(new Response("{}", { status: 200 }));
    expect(await screen.findByText("You're on the list")).toBeInTheDocument();
  });

  it("blocks an invalid email with an inline, linked error (CFX-WEB-landing AC-03)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<WaitlistForm endpoint="https://forms.test/f/x" contactEmail={contactEmail} />);

    await fillAndSubmit("sam@shop");

    const input = screen.getByLabelText("Work email");
    const error = screen.getByText("Enter a work email like name@company.com.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a recoverable error and keeps the input when sending fails (CFX-WEB-landing AC-04)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })));
    render(<WaitlistForm endpoint="https://forms.test/f/x" contactEmail={contactEmail} />);

    await fillAndSubmit("sam@shop.com");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn't save your sign-up");
    expect(screen.getByRole("link", { name: contactEmail })).toHaveAttribute("href", `mailto:${contactEmail}`);
    expect(screen.getByLabelText("Work email")).toHaveValue("sam@shop.com");
    expect(screen.getByLabelText("Data consultant")).toBeChecked();
  });

  it("falls back to an email draft when no endpoint is configured (CFX-WEB-landing AC-05)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const openMailto = vi.fn();
    render(<WaitlistForm endpoint="" contactEmail={contactEmail} openMailto={openMailto} />);

    await fillAndSubmit("sam@shop.com");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(openMailto).toHaveBeenCalledTimes(1);
    const href = openMailto.mock.calls[0][0] as string;
    expect(href.startsWith(`mailto:${contactEmail}?`)).toBe(true);
    const body = new URLSearchParams(href.split("?")[1]).get("body");
    expect(body).toContain("sam@shop.com");
    expect(body).toContain("Data consultant");
    expect(body).not.toContain("Readiness Report");
  });
});
