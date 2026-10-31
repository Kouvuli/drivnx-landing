"use client";

// How it works (CFX-WEB-landing AC-25, AC-26, AC-34): the three Phase 1 stages (Phase 1 §2), then what comes next.
// Desktop with motion allowed: the section pins while Connect → Document & define become active with scroll.
// Otherwise: all three stages stacked with their illustrations (revealed once).

import {
  ArrowDown,
  BookOpen,
  Database,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Files,
  Lightbulb,
  PlugZap,
  ScanSearch,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";
import { CountUp, Reveal } from "./StoryMotion";

type Stage = { id: string; icon: LucideIcon; title: string; text: string; steps: string[]; art: () => React.ReactNode };

// Phase 1 §5: files are referenced in place, PostgreSQL is read-only and scoped by the user.
function ConnectArt() {
  const sources: [LucideIcon, string, string][] = [
    [FileText, "customers.csv", "Read in place"],
    [FileSpreadsheet, "orders.xlsx", "Sheet: Orders"],
    [Files, "events.parquet", "Native types"],
    [Database, "sales (PostgreSQL)", "Read-only, 4 tables"],
  ];
  return (
    <div className="grid grid-cols-1 gap-2 text-sm">
      {sources.map(([Icon, name, how]) => (
        <div key={name} className="flex min-w-0 items-center gap-3 rounded-md border border-line bg-paper px-3 py-2">
          <Icon aria-hidden="true" className="size-4 shrink-0 text-accent" />
          <span className="truncate font-mono text-xs">{name}</span>
          <span className="ml-auto shrink-0 text-xs text-muted">{how}</span>
        </div>
      ))}
      <p className="mt-1 flex items-center gap-2 rounded-md border border-line px-3 py-2">
        <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-accent" />
        Nothing is copied or written back to your sources
      </p>
    </div>
  );
}

// Phase 1 §2: the executive overview example (illustrative).
function UnderstandArt() {
  return (
    <div className="grid grid-cols-1 gap-4 text-sm">
      <p className="flex items-baseline justify-between gap-3 font-medium">
        Customer database: overview
        <span className="font-mono text-xs font-normal text-muted">Fast profile, sampled</span>
      </p>
      <dl className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4" data-exec-summary>
        {[
          [<CountUp key="t" value={12} />, "tables"],
          [<CountUp key="c" value={184} />, "columns"],
          [<CountUp key="r" value={2.4} decimals={1} suffix="M" />, "rows"],
          [<CountUp key="i" value={3} />, "possible identifiers"],
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
        {["14 undocumented fields", "7 fields with significant missing values", "2 relationships need confirmation"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-suggested" />
            {f}
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2 rounded-md border border-line px-3 py-2">
        <Lightbulb aria-hidden="true" className="size-4 shrink-0 text-accent" />
        Next: confirm customer_id as the customer identifier
      </p>
    </div>
  );
}

// Phase 1 §3: Evidence → Meaning → Expectations, then export.
function DefineArt() {
  const rows: [LucideIcon, string, string, string][] = [
    [ScanSearch, "Data profile", "customer_id is 99.8% unique", "Observed"],
    [BookOpen, "Data dictionary", "The customer identifier", "Confirmed"],
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
      <p className="mt-2 flex items-center gap-2 rounded-md border border-line px-3 py-2">
        <Download aria-hidden="true" className="size-4 shrink-0 text-accent" />
        Export profile, dictionary and contract as YAML or JSON
      </p>
    </div>
  );
}

const stages: Stage[] = [
  {
    id: "connect",
    icon: PlugZap,
    title: "Connect",
    text: "Point it at CSV, Excel or Parquet files, or a PostgreSQL database. Files are read in place, databases read-only, and you choose what to analyse.",
    steps: ["Files", "PostgreSQL", "Choose scope"],
    art: ConnectArt,
  },
  {
    id: "understand",
    icon: ScanSearch,
    title: "Profile & understand",
    text: "Profiling measures what is actually there and labels sampled and exact results. An overview says what matters and what to do next, with evidence behind every finding.",
    steps: ["Profile", "Findings", "Next actions"],
    art: UnderstandArt,
  },
  {
    id: "define",
    icon: BookOpen,
    title: "Document & define",
    text: "Turn evidence into meaning and expectations: a data dictionary you confirm, and a contract that says what must be true.",
    steps: ["Dictionary", "Contract", "Export"],
    art: DefineArt,
  },
];

// Phase 2 (Phase 1 §1 scope boundary): named, clearly as later.
const comingNext = ["Transform", "Validate", "Publish & serve", "Monitor & improve"];

function ComingNext() {
  return (
    <div data-coming-next className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-6 text-sm">
      <p className="font-mono text-xs tracking-wide text-muted uppercase">Coming next</p>
      <ul className="flex flex-wrap gap-2 text-muted">
        {comingNext.map((label) => (
          <li key={label} className="rounded-full border border-dashed border-line px-3 py-1">
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  return (
    <>
      {pinned ? <PinnedStory /> : <StaticSteps />}
      <ComingNext />
    </>
  );
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
    <div ref={ref} className="relative h-[260vh]" data-pinned="true" data-active-step={stages[active].id}>
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
