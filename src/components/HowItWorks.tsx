"use client";

// How it works (CFX-WEB-landing AC-25, AC-26, AC-34): the five build stages of the product vision (v2 §3, §16).
// Desktop with motion allowed: the section pins while Understand → Publish & serve become active with scroll.
// Otherwise: all five stages stacked with their illustrations (revealed once).

import {
  ArrowDown,
  BookOpen,
  Building2,
  Check,
  Cloud,
  Database,
  FileCheck2,
  FileSpreadsheet,
  Lightbulb,
  ListChecks,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";
import { CountUp, Reveal } from "./StoryMotion";

type Stage = { id: string; icon: LucideIcon; title: string; text: string; steps: string[]; art: () => React.ReactNode };

// v2 §5: the executive summary example (illustrative).
function UnderstandArt() {
  return (
    <div className="grid grid-cols-1 gap-4 text-sm">
      <p className="font-medium">Sales database: executive summary</p>
      <dl className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4" data-exec-summary>
        {[
          [<CountUp key="t" value={14} />, "tables"],
          [<CountUp key="c" value={186} />, "columns"],
          [<CountUp key="r" value={2.4} decimals={1} suffix="M" />, "records"],
          [<CountUp key="l" value={3} />, "relationships"],
        ].map(([value, label]) => (
          <div key={label as string} className="rounded-md border border-line bg-paper px-2 py-2">
            <dt className="sr-only">{label as string}</dt>
            <dd className="text-lg font-semibold">{value}</dd>
            <dd className="text-xs text-muted" aria-hidden="true">
              {label as string}
            </dd>
          </div>
        ))}
      </dl>
      <ul className="grid gap-1.5">
        {["17 fields have significant missing values", "6 likely identifiers lack documentation", "2 relationships need confirmation"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-suggested" />
            {f}
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2 rounded-md border border-line px-3 py-2">
        <Lightbulb aria-hidden="true" className="size-4 shrink-0 text-accent" />
        Next: confirm the customer identifier
      </p>
    </div>
  );
}

// v2 §4 and §6: Evidence → Meaning → Expectations.
function DefineArt() {
  const rows: [LucideIcon, string, string, string][] = [
    [ScanSearch, "Data profile", "customer_id is 99.8% unique", "Observed"],
    [BookOpen, "Data dictionary", "The business customer identifier", "Confirmed"],
    [FileCheck2, "Data contract", "customer_id must be non-null and unique", "Defined"],
  ];
  return (
    <div className="grid grid-cols-1 gap-2 text-sm">
      {rows.map(([Icon, artifact, text, state], i) => (
        <div key={artifact}>
          <div className="flex items-start gap-3 rounded-md border border-line bg-paper px-3 py-2">
            <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
            <div>
              <p className="font-medium">{artifact}</p>
              <p className="font-mono text-xs text-muted">{text}</p>
            </div>
            <span className="ml-auto text-xs text-muted">{state}</span>
          </div>
          {i < rows.length - 1 && <ArrowDown aria-hidden="true" className="mx-auto my-1 size-4 text-observed" />}
        </div>
      ))}
    </div>
  );
}

function BuildArt() {
  return (
    <div className="grid grid-cols-1 gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md border border-line bg-paper px-3 py-1.5 font-mono">orders.cust_no</span>
        <span className="h-0.5 min-w-6 flex-1 border-t-2 border-dashed border-suggested" />
        <span className="rounded-md border border-line bg-paper px-3 py-1.5 font-mono">customers.customer_id</span>
      </div>
      <p className="flex items-center gap-2 rounded-md bg-suggested-soft px-3 py-2 text-suggested-ink">
        <Sparkles aria-hidden="true" className="size-4 shrink-0" />
        Claude suggests this link (94% match)
      </p>
      <p className="flex items-center gap-2 rounded-md bg-approved-soft px-3 py-2 text-approved">
        <Check aria-hidden="true" className="size-4 shrink-0" />
        You approved it; it is saved as a rule
      </p>
      <p className="flex items-center gap-2 rounded-md border border-line px-3 py-2">
        <Workflow aria-hidden="true" className="size-4 shrink-0 text-accent" />
        The rule runs in a reproducible pipeline, every time
      </p>
    </div>
  );
}

function ValidateArt() {
  return (
    <div className="grid grid-cols-1 gap-2 text-sm">
      <p className="font-medium">Validation results: Orders contract</p>
      {["customer_id is never empty", "customer_id is unique", "every order has a customer (4,812 of 4,812)", "dates use one format"].map(
        (check) => (
          <p key={check} className="flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-2">
            <Check aria-hidden="true" className="size-4 shrink-0 text-approved" />
            {check}
          </p>
        ),
      )}
      <p className="flex items-center gap-2 rounded-md bg-approved-soft px-3 py-2 font-medium text-approved">
        <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
        0 violations: ready to publish
      </p>
    </div>
  );
}

// v2 §9: what makes a Trusted Data Product (CFX-WEB-landing AC-34, revision 8).
const trustedCriteria = [
  "Documented meaning",
  "Explicit expectations",
  "Traceable transformation logic",
  "Passed validation checks",
  "Known provenance",
  "Stated limitations",
  "A defined downstream purpose",
];

function PublishArt() {
  const destinations: [LucideIcon, string, string][] = [
    [Building2, "Odoo", "First release"],
    [FileSpreadsheet, "CSV, XLSX, Parquet", "First release"],
    [Cloud, "Cloud storage", "Coming soon"],
    [Database, "Cloud warehouse", "Coming soon"],
  ];
  return (
    <div className="grid grid-cols-1 gap-3 text-sm">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {destinations.map(([Icon, name, when]) => (
          <div key={name} className="flex min-w-0 items-center gap-2 rounded-md border border-line bg-paper px-3 py-1.5">
            <Icon aria-hidden="true" className="size-4 shrink-0 text-accent" />
            <span className="truncate">{name}</span>
            <span className="ml-auto shrink-0 text-xs text-muted">{when}</span>
          </div>
        ))}
      </div>
      <div className="rounded-md bg-approved-soft px-3 py-2.5" data-trusted-checklist>
        <p className="flex items-center gap-2 font-medium text-approved">
          <ListChecks aria-hidden="true" className="size-4 shrink-0" />
          A trusted data product has
        </p>
        <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
          {trustedCriteria.map((c) => (
            <li key={c} className="flex items-center gap-1.5">
              <Check aria-hidden="true" className="size-3.5 shrink-0 text-approved" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const stages: Stage[] = [
  {
    id: "understand",
    icon: ScanSearch,
    title: "Understand",
    text: "Connect files, databases and APIs. Profiling measures what is actually there, and a summary says what matters and what to do next.",
    steps: ["Connect", "Profile", "Summarize"],
    art: UnderstandArt,
  },
  {
    id: "define",
    icon: BookOpen,
    title: "Document & define",
    text: "Turn evidence into meaning and expectations: a data dictionary you confirm, and contracts that say what must be true.",
    steps: ["Profile", "Dictionary", "Contract"],
    art: DefineArt,
  },
  {
    id: "build",
    icon: Workflow,
    title: "Build",
    text: "Claude suggests links and transformations; you approve them on the graph. Every fix becomes a rule in a reproducible pipeline.",
    steps: ["Transform", "Rules", "Pipeline"],
    art: BuildArt,
  },
  {
    id: "validate",
    icon: ShieldCheck,
    title: "Validate",
    text: "Test the result against the contract before anything is published, with evidence for every check.",
    steps: ["Contract checks", "Quality evidence"],
    art: ValidateArt,
  },
  {
    id: "publish",
    icon: Send,
    title: "Publish & serve",
    text: "Deliver validated data to Odoo and files first, then cloud storage and warehouses, as a trusted data product.",
    steps: ["Odoo", "Files", "Cloud", "Warehouse"],
    art: PublishArt,
  },
];

function StageTitle({ stage, current }: { stage: Stage; current: boolean }) {
  return (
    <h3 className={`flex items-center gap-3 text-xl font-semibold transition-colors duration-300 ${current ? "text-ink" : "text-muted"}`}>
      <stage.icon
        aria-hidden="true"
        strokeWidth={1.75}
        className={`size-6 shrink-0 transition-colors duration-300 ${current ? "text-brand" : "text-observed"}`}
      />
      {stage.title}
    </h3>
  );
}

function StageBody({ stage }: { stage: Stage }) {
  return (
    <>
      <p className="mt-3 text-muted">{stage.text}</p>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm">
        {stage.steps.map((label) => (
          <li key={label} className="rounded-full border border-line px-3 py-1">
            {label}
          </li>
        ))}
      </ul>
    </>
  );
}

const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const subscribePin = (onChange: () => void) => {
  const media = matchMedia(PIN_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

export function HowItWorks() {
  const pinned = useSyncExternalStore(subscribePin, () => matchMedia(PIN_QUERY).matches, () => false);
  return pinned ? <PinnedStory /> : <StaticSteps />;
}

function StaticSteps() {
  return (
    <Reveal className="grid grid-cols-1 gap-12">
      {stages.map((s) => (
        <div key={s.id} data-reveal data-item="step" className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.1fr] md:items-start">
          <div className="min-w-0">
            <StageTitle stage={s} current />
            <StageBody stage={s} />
          </div>
          <div className="min-w-0 rounded-xl border border-line bg-surface p-5" data-art-box>
            <s.art />
          </div>
        </div>
      ))}
    </Reveal>
  );
}

function PinnedStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const last = stages.length - 1;
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(last, Math.max(0, Math.floor(v * stages.length)))));

  return (
    <div ref={ref} className="relative h-[380vh]" data-pinned="true" data-active-step={stages[active].id}>
      <div className="sticky top-28 grid grid-cols-[1fr_1.15fr] items-center gap-12" data-pin>
        <ol className="grid gap-5">
          {stages.map((s, i) => (
            <li
              key={s.id}
              data-item="step"
              aria-current={i === active ? "step" : undefined}
              className={`border-l-2 pl-6 transition-colors duration-300 ease-out ${i === active ? "border-brand" : "border-line"}`}
            >
              <StageTitle stage={s} current={i === active} />
              {i === active && <StageBody stage={s} />}
            </li>
          ))}
        </ol>
        <div className="relative h-[24rem] rounded-xl border border-line bg-surface p-6" data-art-box>
          {stages.map((s, i) => (
            <div
              key={s.id}
              aria-hidden={i !== active}
              className={`absolute inset-6 flex flex-col justify-center transition-[opacity,transform] duration-300 ease-out ${
                i === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              <s.art />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
