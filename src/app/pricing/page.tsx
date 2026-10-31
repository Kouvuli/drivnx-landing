// CFX-WEB-landing AC-45..AC-47, AC-49: plans, a feature comparison and a pricing FAQ (pattern of a classic pricing
// page: cards, then "compare features across plans", then questions). No dollar amounts: pricing follows real usage.
import { Building, Check, Minus, Rocket, Sprout, Users, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { Footer, Header } from "@/components/SiteChrome";
import { site } from "@/config/site";
import { capabilityGroups, plans, type CapabilityValue } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${site.name} plans: Free / Local, Pro, Team and Enterprise. Exact pricing follows real usage.`,
};

const planIcons: LucideIcon[] = [Sprout, Rocket, Users, Building];

function Cell({ value }: { value: CapabilityValue }) {
  if (value === true) {
    return (
      <>
        <Check aria-hidden="true" className="mx-auto size-5 text-ink" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus aria-hidden="true" className="mx-auto size-5 text-observed" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span>{value}</span>;
}

const faqs = [
  {
    q: "Why are there no prices yet?",
    a: "Exact pricing and limits will follow real usage, rather than being guessed up front. Join early access to hear first when they're set.",
  },
  {
    q: "What is a managed data product?",
    a: `A data product that ${site.name} actively understands, builds, validates and maintains for you: its source connection, profiling, dictionary, contract, transformations, pipeline, validation evidence, published output, history and change detection.`,
  },
  {
    q: "What is the free Readiness Report?",
    a: "A report on your own data: what you have, how it links, what's broken, and what to do next. Tick the box when you join early access and we'll arrange a secure way to share files.",
  },
  {
    q: `Can I run ${site.name} on my own infrastructure?`,
    a: "Yes, on request: the local engine runs processing on your own machine or server, and only metadata reaches Claude. In the cloud version you can also choose a metadata-only AI mode.",
  },
];

export default function Pricing() {
  return (
    <>
      <Header />
      <main>
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
          <h1 className="text-5xl font-semibold tracking-[-0.035em] sm:text-6xl">Pricing</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Start free, then grow into managed data products for your team. Exact pricing follows real usage.
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => {
              const PlanIcon = planIcons[i];
              return (
                <li
                  key={plan.name}
                  data-item="plan"
                  data-hover-card
                  className="flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-muted hover:bg-paper"
                >
                  <PlanIcon aria-hidden="true" strokeWidth={1.5} className="size-8 text-ink" />
                  <h2 className="mt-5 text-2xl font-semibold">{plan.name}</h2>
                  <p className="mt-1 min-h-18 text-muted">{plan.tagline}</p>
                  <p className="mt-6 text-3xl font-semibold" data-plan-price>
                    {plan.price}
                  </p>
                  <p className="mt-1 text-sm text-muted">{plan.priceNote}</p>
                  {plan.cta === "join" ? (
                    <Link
                      href="/#early-access"
                      data-brand-cta
                      className="fx mt-6 inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 font-semibold text-on-brand [--fx-fill:var(--color-brand-strong)]"
                    >
                      Join early access
                    </Link>
                  ) : (
                    <a
                      href={`mailto:${site.email}?subject=${encodeURIComponent("Enterprise")}`}
                      className="fx mt-6 inline-flex h-11 items-center justify-center rounded-full border border-line px-5 font-semibold [--fx-fill:var(--color-accent)] hover:border-accent hover:text-on-accent"
                    >
                      Talk to us
                    </a>
                  )}
                  <p className="mt-6 text-sm font-medium">{plan.includesFrom ? `Everything in ${plan.includesFrom}, plus:` : "Includes:"}</p>
                  <ul className="mt-3 grid gap-2 text-sm">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-center text-sm text-muted">
            Tiers and limits are early and will follow real usage. Prices are agreed with each early customer before any payment.
          </p>
        </div>

        <Section id="compare" title="Compare features across plans">
          {/* relative: keeps the absolutely positioned screen-reader labels inside the scroll box (no page overflow). */}
          <div className="relative overflow-x-auto rounded-xl border border-line bg-paper" data-compare>
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">Features included in each plan</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-4 font-medium text-muted">
                    Features
                  </th>
                  {plans.map((p) => (
                    <th key={p.name} scope="col" className="px-5 py-4 text-center font-semibold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {capabilityGroups.map((group) => (
                <tbody key={group.name} className="border-b border-line last:border-0">
                  <tr>
                    <th scope="colgroup" colSpan={plans.length + 1} className="px-5 pt-5 pb-2 font-semibold">
                      {group.name}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.name} className="border-t border-line/60">
                      <th scope="row" className="px-5 py-3 font-normal text-muted">
                        {row.name}
                      </th>
                      {row.values.map((value, i) => (
                        <td key={plans[i].name} className="px-5 py-3 text-center">
                          <Cell value={value} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Section>

        <Section id="pricing-faq" title="Questions about pricing">
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
