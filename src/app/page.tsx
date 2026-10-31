// CFX-WEB-landing: the home page, following the Phase 1 direction (revision 12). Section order and ids follow
// AC-11; icons AC-26; word budget AC-27. Early-access terms live on /pricing (AC-12).
import {
  ArrowDown,
  Briefcase,
  ChartColumn,
  Cpu,
  FileCheck2,
  FileQuestion,
  GitCompareArrows,
  KeyRound,
  Lightbulb,
  Lock,
  PowerOff,
  ScanEye,
  Server,
  Sparkles,
  UserCheck,
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

// The questions a team asks about data it received or inherited.
const problems: [LucideIcon, string, string][] = [
  [FileQuestion, "What is actually in it?", "Twelve tables, 184 columns, no documentation, and whoever built it has moved on."],
  [GitCompareArrows, "How does it connect?", "Which column is the customer key? Does cust_no really point at customer_id?"],
  [FileCheck2, "What should be true?", "Nobody wrote down which fields are required, unique or allowed to be empty."],
];

// Phase 1 §3: Observed → Inferred → Confirmed → Defined.
const trustStates: { icon: LucideIcon; name: string; tone: string; text: string }[] = [
  { icon: ScanEye, name: "Observed", tone: "text-observed", text: "customer_id is 99.8% unique. Measured by profiling." },
  { icon: Sparkles, name: "Inferred", tone: "text-suggested", text: "This may identify a customer. Suggested, not yet trusted." },
  { icon: UserCheck, name: "Confirmed", tone: "text-approved", text: "This is the customer identifier. Confirmed by you." },
  { icon: FileCheck2, name: "Defined", tone: "text-approved", text: "customer_id must be non-null and unique. A contract rule." },
];

// Phase 1 §6 and §7: only the claims the direction allows.
const safeguards: [LucideIcon, string, string][] = [
  [Server, "Runs on your machine", "Profiling and everything you document stay in a local workspace."],
  [Lock, "Read-only on your sources", "Files are read in place, databases read-only. Nothing is written back."],
  [PowerOff, "AI is off until you turn it on", "Every feature works without it, and suggestions stay Inferred until you confirm them."],
  [ScanEye, "See what is sent, first", "Before a cloud AI request, you see the provider, the model and the exact context, and approve it."],
  [Cpu, "Local model option", "Use a local model through Ollama instead of a cloud provider."],
  [KeyRound, "Credentials in your OS keychain", "Never in the workspace, logs or exports."],
];

const audiences: [LucideIcon, string, string, string][] = [
  [ChartColumn, "Built for", "Data analysts and engineers", "Inherited, undocumented data? Profile it, document what it means and define what must be true."],
  [Briefcase, "Also for", "Data consultants", "Handed a client's database? Turn it into an evidence-backed overview and a dictionary the client can review."],
];

const faqs = [
  {
    q: "Does my data leave my machine?",
    a: "Profiling and your workspace run locally. Nothing is sent unless you turn on a cloud AI provider, and then you see exactly what context goes, and approve it, before each request; raw values need a separate approval. You can use a local model instead.",
  },
  {
    q: "Which sources do you support?",
    a: "CSV, Excel (XLSX) and Parquet files, and PostgreSQL through a read-only account. MySQL and SQL Server are the next candidates.",
  },
  {
    q: "Do I need AI?",
    a: "No. Profiling, the overview, the data dictionary and contracts all work with AI switched off. AI only drafts suggestions, and they stay Inferred until you confirm them.",
  },
  {
    q: "Is it free?",
    a: "Yes, during early access. Pricing for later will follow real usage.",
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
            {/* Supporting line (CFX-WEB-landing AC-51). */}
            <p className="mt-4 max-w-xl text-sm text-balance text-muted">
              Runs on your machine. AI suggestions are optional, and you see what is sent before anything leaves.
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
          title="You have data. But do you understand it?"
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
          title="From unfamiliar data to explicit definitions"
          intro="Connect it, understand it, then write down what it means and what must be true."
        >
          <HowItWorks />
        </Section>

        <Section
          id="demo"
          title="Try it yourself"
          intro="Profiling inferred two facts; one becomes a rule. Review them, then export the contract."
        >
          <GraphDemo />
        </Section>

        <Section
          id="trust"
          title="Inference never silently becomes truth"
          intro="Every fact shows its state and its evidence. Only you can confirm it or turn it into a rule."
        >
          <Reveal
            from={{ opacity: 0.25, scale: 0.97 }}
            step={0.18}
            className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
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
          id="ai-privacy"
          title="AI assists. You approve. Boundaries stay explicit."
          intro="You always see what leaves your machine before it is sent."
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
            We start with understanding and definitions. Transformation, validation and publishing come next.
          </p>
        </Section>

        <Section id="about" title="Who's building this">
          <p className="max-w-2xl text-lg text-muted">
            We&apos;re {site.team}: three engineers (data, AI and software) who have inherited undocumented data too often,
            building the tool we wanted. Questions? Email{" "}
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
