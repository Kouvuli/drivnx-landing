"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { buildMailto, isValidEmail, segments, submitWaitlist, type Segment } from "@/lib/waitlist";

type Status = "idle" | "sending" | "done" | "error";

type Props = {
  /** Form processor URL (NEXT_PUBLIC_WAITLIST_ENDPOINT). Empty means "use an email draft instead". */
  endpoint: string | undefined;
  contactEmail: string;
  openMailto?: (href: string) => void;
};

export function WaitlistForm({ endpoint, contactEmail, openMailto = (href) => window.location.assign(href) }: Props) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState<Segment>("data-team");
  const [emailError, setEmailError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    if (!isValidEmail(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    const entry = { email, segment };
    if (!endpoint) {
      openMailto(buildMailto(contactEmail, entry));
      return;
    }
    setStatus("sending");
    setStatus(await submitWaitlist(endpoint, entry) === "ok" ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-lg border border-approved/30 bg-approved-soft p-6">
        <p className="flex items-center gap-2 text-lg font-semibold text-approved">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" data-success-check>
            <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
            <path
              d="M7 12.5l3.2 3.2L17 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              className="motion-safe:animate-[draw_450ms_ease-out_both]"
            />
          </svg>
          You&apos;re on the list
        </p>
        <p className="mt-1 text-muted">
          We&apos;ll email {email.trim()} when early access opens.
        </p>
      </div>
    );
  }

  const emailId = `${id}-email`;
  const errorId = `${id}-email-error`;
  const hintId = `${id}-email-hint`;

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <label htmlFor={emailId} className="font-medium">
          Work email
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={emailError}
          aria-describedby={emailError ? `${errorId} ${hintId}` : hintId}
          className="h-12 rounded-md border border-line bg-surface px-4 text-base outline-none focus-visible:border-accent aria-invalid:border-danger"
        />
        <p id={hintId} className="text-sm text-muted">
          One email when early access opens. No newsletter.
        </p>
        {emailError && (
          <p id={errorId} className="text-sm font-medium text-danger">
            Enter a work email like name@company.com.
          </p>
        )}
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 font-medium">I&apos;m a…</legend>
        <div className="flex flex-wrap gap-2">
          {segments.map((s) => (
            <label
              key={s.value}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-4 has-checked:border-accent has-checked:text-accent-strong has-focus-visible:outline-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name="segment"
                value={s.value}
                checked={segment === s.value}
                onChange={() => setSegment(s.value)}
                className="accent-accent"
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      {status === "error" && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 p-4 text-sm">
          We couldn&apos;t save your sign-up. Try again, or email us at{" "}
          <a href={`mailto:${contactEmail}`} className="font-medium text-accent underline decoration-brand/60">
            {contactEmail}
          </a>
          .
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={status === "sending"}
          data-brand-cta
          className="fx h-12 rounded-md bg-brand px-6 font-semibold text-on-brand [--fx-fill:var(--color-brand-strong)] disabled:cursor-wait disabled:opacity-70"
        >
          {status === "sending" ? "Joining…" : "Join early access"}
        </button>
        <p className="text-sm text-muted">
          See our{" "}
          <Link href="/privacy" className="underline decoration-brand/60">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
