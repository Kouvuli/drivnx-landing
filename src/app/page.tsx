// CFX-WEB-landing: the home page, following Product Vision v2 §16. Section order and ids follow AC-11; icons AC-26;
// word budget AC-27. Pricing lives on /pricing (AC-12).
import {
  ArrowDown,
  BookOpen,
  ChartColumn,
  CircleCheck,
  EyeOff,
  FileCheck2,
  FileQuestion,
  GitCompareArrows,
  Lightbulb,
  Lock,
  PackageCheck,
  ScanEye,
  Server,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  UserCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ConnectsMarquee } from "@/components/ConnectsMarquee";
import { GraphDemo } from "@/components/GraphDemo";
import { HowItWorks } from "@/components/HowItWorks";
import { HeroScene } from "@/components/hero/HeroScene";
import { HeroStatus } from "@/components/hero/HeroStatus";
import { Section } from "@/components/Section";
import { Footer, Header } from "@/components/SiteChrome";
import { Reveal } from "@/components/StoryMotion";
import { WaitlistForm } from "@/components/WaitlistForm";
import { site } from "@/config/site";

function Icon({ icon: I, className = "text-ink" }: { icon: LucideIcon; className?: string }) {
  return <I aria-hidden="true" strokeWidth={1.75} className={`size-5 shrink-0 ${className}`} />;
}

// v2 §2: the questions teams must answer, with the first wedge's version of each.
const problems: [LucideIcon, string, string][] = [
  [FileQuestion, "What do we actually have?", "Customers in a spreadsheet, orders in an old database, products in another tool."],
  [GitCompareArrows, "How does it connect?", "“Acme Inc.” and “ACME, Inc.” are one customer; 312 orders have no customer at all."],
  [ShieldCheck, "Can we trust it?", "Before moving it into an ERP or a report, someone has to check it, today by hand, for weeks."],
];

// v2 §6: Observed → Inferred → Confirmed → Defined → Validated, with v2's examples.
const trustStates: { icon: LucideIcon; name: string; tone: string; text: string }[] = [
  { icon: ScanEye, name: "Observed", tone: "text-observed", text: "customer_id is 99.8% unique. A measured fact." },
  { icon: Sparkles, name: "Inferred", tone: "text-suggested", text: "This may identify a customer. Suggested by Claude." },
  { icon: UserCheck, name: "Confirmed", tone: "text-approved", text: "This is the business customer identifier. Verified by you." },
  { icon: FileCheck2, name: "Defined", tone: "text-approved", text: "customer_id must be non-null and unique. A contract rule." },
  { icon: CircleCheck, name: "Validated", tone: "text-ink", text: "The rule was tested on the result and passed." },
];

// v2 §10: the four impact dimensions.
const impacts: [LucideIcon, string, string][] = [
  [BookOpen, "Knowledge", "Did the meaning, structure or relationships change?"],
  [FileCheck2, "Contract", "Are the existing expectations still valid?"],
  [Workflow, "Pipeline", "Will the transformations still produce the right result?"],
  [PackageCheck, "Output", "Is the published data still fit for its purpose?"],
];

// v2 §7 and §11.
const safeguards: [LucideIcon, string, string][] = [
  [Sparkles, "Claude assists, you decide", "On by default; everything still works with AI switched off."],
  [UserCheck, "You approve consequential changes", "Nothing is published without your review and a passing check."],
  [EyeOff, "Metadata-only mode", "Claude sees column names and statistics, not full rows."],
  [Server, "Local engine on request", "Processing runs on your own machine or server."],
  [Lock, "Encrypted", "In transit and at rest."],
  [Trash2, "Deleted on request", "With a short default retention period."],
];

// v2 §18: the first wedge's users come first; data teams are where the workspace grows.
const audiences: [LucideIcon, string, string, string][] = [
  [Store, "Starting with", "Businesses moving onto an ERP", "Bring scattered spreadsheets and databases together and load clean data into Odoo. No SQL needed."],
  [ChartColumn, "Growing into", "Data analysts and engineers", "Inherited, undocumented data? Profile it, define it and deliver a validated data product."],
];

const faqs = [
  {
    q: "Does my data leave my environment?",
    a: "In the cloud version, your data is processed on our servers and encrypted in transit and at rest. In metadata-only mode, Claude sees only column names, statistics and masked samples. With the local engine, available on request, processing runs on your own machine or server and only metadata reaches Claude. We state exactly what leaves your environment in each mode.",
  },
  {
    q: "Which systems do you support?",
    a: "Sources: Excel, CSV, Google Sheets, Postgres, MySQL, SQL Server and REST APIs. Destinations: Odoo and files first, then cloud storage and a cloud warehouse. More ERPs, such as NetSuite and Business Central, come next.",
  },
  {
    q: "Do I need to know SQL?",
    a: "No. You fix data on the graph and in tables, and Claude turns each fix into a rule you approve. Data teams can still inspect every rule.",
  },
  {
    q: "What is the free Readiness Report?",
    a: "A report on your own data: what you have, how it links, what's broken, and how much manual work it would take. Tick the box when you sign up and we'll arrange a secure way to share files. Please don't email us spreadsheets.",
  },
  {
    q: "When can I start?",
    a: "We're onboarding early users in small groups. Sign up and we'll email you when there's a spot.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero (CFX-WEB-landing AC-39, AC-50): from 640 px the 3D graph is a full-bleed background behind the text and the
            status strip, centred together; on phones the text comes first, then the graph with its controls, then the
            status card, so nothing overlaps. */}
        <div className="relative isolate flex flex-col overflow-hidden border-b border-line sm:min-h-[calc(100svh-4rem)] sm:justify-center sm:pb-20">
          <HeroScene />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 hidden bg-[radial-gradient(ellipse_55%_45%_at_50%_48%,var(--color-paper)_35%,transparent_100%)] opacity-90 sm:block"
          />
          <div className="pointer-events-none relative z-10 order-1 mx-auto flex max-w-4xl flex-col items-center justify-center px-4 pt-14 pb-6 text-center sm:px-6 sm:pt-16 sm:pb-0">
            <h1 className="text-5xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl lg:text-7xl lg:leading-[1.02]">
              Understand your data before you use it.
            </h1>
            <p data-hero-subhead className="mt-6 max-w-2xl text-lg text-balance text-muted sm:text-xl">
              {site.description}
            </p>
            {/* v2 §15's supporting line (CFX-WEB-landing AC-51). */}
            <p className="mt-4 max-w-xl text-sm text-balance text-muted">
              Profiling, documentation, contracts, transformation, and validation in one workspace — with Claude assistance
              you can switch off.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3 [&>a]:pointer-events-auto">
              <Link
                href="#early-access"
                data-brand-cta
                className="fx inline-flex h-12 items-center rounded-full bg-brand px-7 font-semibold text-on-brand [--fx-fill:var(--color-brand-strong)]"
              >
                Join early access
              </Link>
              <Link
                href="#how-it-works"
                className="fx inline-flex h-12 items-center rounded-full border border-line bg-paper/60 px-7 font-semibold backdrop-blur-sm [--fx-fill:var(--color-accent)] hover:border-accent hover:text-on-accent"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">Early sign-ups get a free Readiness Report on their own data.</p>
          </div>
          <HeroStatus />
          <Link
            href="#connects"
            className="press relative order-4 z-20 mx-auto mb-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-muted hover:text-ink sm:absolute sm:bottom-4 sm:left-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] sm:mb-0"
          >
            Scroll to explore
            <ArrowDown aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <ConnectsMarquee />

        <Section
          id="problem"
          title="You have data. But do you understand and trust it?"
          intro="Teams receive or inherit data without enough context. Before they can use it, they need answers."
        >
          <ul className="grid gap-8 sm:grid-cols-3">
            {problems.map(([icon, term, text]) => (
              <li key={term} data-item="problem" className="border-t-2 border-ink pt-4">
                <p className="flex items-center gap-2 font-semibold">
                  <Icon icon={icon} />
                  {term}
                </p>
                <p className="mt-2 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="how-it-works"
          title="From raw data to a trusted data product"
          intro="Understanding is the entry point. Validated delivery is the outcome."
        >
          <HowItWorks />
        </Section>

        <Section
          id="demo"
          title="Try it yourself"
          intro="Three issues from a typical export. Fix them, run a dry run, then publish."
        >
          <GraphDemo />
        </Section>

        <Section
          id="trust"
          title="Inference never silently becomes truth"
          intro="Every fact moves through visible states, and nothing is labelled trusted without validation evidence."
        >
          <Reveal
            from={{ opacity: 0.25, scale: 0.97 }}
            step={0.18}
            className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-5"
          >
            {trustStates.map((s) => (
              <div key={s.name} data-reveal data-item="trust" className="bg-surface p-5">
                <p className="flex items-center gap-2 font-semibold">
                  <Icon icon={s.icon} className={s.tone} />
                  {s.name}
                </p>
                <p className="mt-2 text-sm text-muted">{s.text}</p>
              </div>
            ))}
          </Reveal>
        </Section>

        <Section
          id="lifecycle"
          title="Data changes. Your data products keep up."
          intro="Changes → Impact → Rebuild → Revalidate → Republish. It starts with scheduled sync and drift alerts."
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impacts.map(([icon, title, text]) => (
              <li
                key={title}
                data-item="impact"
                data-hover-card
                className="rounded-lg border border-line p-5 transition-colors duration-300 hover:border-muted hover:bg-surface"
              >
                <p className="flex items-center gap-2 font-semibold">
                  <Icon icon={icon} className="text-accent" />
                  {title} impact
                </p>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="ai-privacy"
          title="AI assists. You approve. Boundaries stay explicit."
          intro="We state exactly what leaves your environment in each mode."
        >
          <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {safeguards.map(([icon, title, text]) => (
              <li key={title} data-item="privacy" className="flex gap-3">
                <Icon icon={icon} className="mt-0.5 text-accent" />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            Read our{" "}
            <Link href="/privacy" className="font-medium text-accent underline decoration-brand/60 transition-colors hover:decoration-brand">
              privacy policy
            </Link>
            .
          </p>
        </Section>

        <Section id="who" title="Who it's for">
          <ul className="grid gap-10 md:grid-cols-2">
            {audiences.map(([icon, stage, title, text]) => (
              <li key={title} data-item="audience">
                <p className="mb-3 font-mono text-xs tracking-wide text-brand-ink uppercase">{stage}</p>
                <h3 className="flex items-center gap-3 text-xl font-semibold">
                  <Icon icon={icon} className="size-6 text-accent" />
                  {title}
                </h3>
                <p className="mt-3 text-muted">{text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 flex items-center gap-2 text-muted">
            <Lightbulb aria-hidden="true" className="size-4 shrink-0" />
            We start with ERP migration and grow into a workspace for every data product.
          </p>
        </Section>

        <Section id="about" title="Who's building this">
          <p className="max-w-2xl text-lg text-muted">
            Three engineers (data, AI and software) who have mapped messy data into ERP imports by hand, building the tool we
            wanted. Questions? Email{" "}
            <a href={`mailto:${site.email}`} className="font-medium text-accent underline decoration-brand/60 transition-colors hover:decoration-brand">
              {site.email}
            </a>
            .
          </p>
        </Section>

        <Section id="faq" title="Questions">
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

        <Section id="early-access" title="Join early access" intro="We onboard early users in small groups.">
          <div className="max-w-2xl">
            <WaitlistForm endpoint={process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT} contactEmail={site.email} />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
