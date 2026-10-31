// CFX-WEB-landing AC-45..AC-47, AC-49 (revision 12): early access is free. What you get now, what comes next, and
// questions. No prices or plans: pricing for later follows real usage.
import { Check, Rocket, Sprout, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { Footer, Header } from "@/components/SiteChrome";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Early access",
  description: `${site.name} is free during early access. What you get now and what comes next.`,
};

type Offer = { icon: LucideIcon; name: string; price: string; tagline: string; includes: string[]; cta: "join" | "contact" };

const offers: Offer[] = [
  {
    icon: Sprout,
    name: "Early access",
    price: "Free",
    tagline: "Everything that exists today",
    cta: "join",
    includes: [
      "CSV, Excel and Parquet files, and PostgreSQL (read-only)",
      "Profiling with sampled and exact results",
      "An overview of findings and next actions",
      "A data dictionary you review",
      "Data contracts, exported as YAML or JSON",
      "Optional AI suggestions, cloud or local",
    ],
  },
  {
    icon: Rocket,
    name: "Coming next",
    price: "Later",
    tagline: "Shaped by early users",
    cta: "contact",
    includes: [
      "Transformation",
      "Validation against your contracts",
      "Publishing and serving data",
      "Monitoring and change detection",
      "More databases, such as MySQL and SQL Server",
    ],
  },
];

const faqs = [
  {
    q: "Why is it free?",
    a: "We're building it with early users, and what they need shapes what comes next.",
  },
  {
    q: "What happens after early access?",
    a: "Pricing for later will follow real usage. Nothing is decided yet.",
  },
  {
    q: "Where does it run?",
    a: "On your own machine, as a local runtime you open in your browser. Profiling and your workspace stay local.",
  },
  {
    q: "Which AI does it use?",
    a: "None until you turn it on. Then you can use a cloud model, after seeing exactly what will be sent, or a local model through Ollama.",
  },
];

export default function EarlyAccess() {
  return (
    <>
      <Header />
      <main>
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
          <h1 className="text-5xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl">Early access is free</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Use {site.name} free while we build it with early users. Pricing for later will follow real usage.
          </p>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
          <ul className="grid gap-4 md:grid-cols-2">
            {offers.map((offer) => (
              <li
                key={offer.name}
                data-item="offer"
                data-hover-card
                className="flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-muted hover:bg-paper"
              >
                <offer.icon aria-hidden="true" strokeWidth={1.5} className="size-8 text-ink" />
                <h2 className="mt-5 text-2xl font-semibold">{offer.name}</h2>
                <p className="mt-1 text-muted">{offer.tagline}</p>
                <p className="mt-6 text-3xl font-semibold" data-offer-price>
                  {offer.price}
                </p>
                {offer.cta === "join" ? (
                  <Link
                    href="/#early-access"
                    data-brand-cta
                    className="fx mt-6 inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 font-semibold text-on-brand [--fx-fill:var(--color-brand-strong)]"
                  >
                    Join early access
                  </Link>
                ) : (
                  <a
                    href={`mailto:${site.email}?subject=${encodeURIComponent("What we need next")}`}
                    className="fx mt-6 inline-flex h-11 items-center justify-center rounded-full border border-line px-5 font-semibold [--fx-fill:var(--color-accent)] hover:border-accent hover:text-on-accent"
                  >
                    Talk to us
                  </a>
                )}
                <ul className="mt-6 grid gap-2 text-sm">
                  {offer.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <Section id="early-access-faq" title="Questions about early access">
          <div className="max-w-3xl divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span aria-hidden="true" className="text-xl text-brand transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
