"use client";

// "Connects to" strip (CFX-WEB-landing AC-43): an endless row of the systems the product connects, with generic icons
// (no brand logos). Pauses on hover, keyboard focus or the Pause button; still and wrapped with reduced motion.

import {
  ArrowRight,
  Building2,
  Cloud,
  Database,
  FileSpreadsheet,
  FileText,
  Files,
  Globe,
  Pause,
  Play,
  Server,
  Sheet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { site } from "@/config/site";

const items: [LucideIcon, string][] = [
  [FileSpreadsheet, "Excel"],
  [FileText, "CSV"],
  [Sheet, "Google Sheets"],
  [Database, "Postgres"],
  [Database, "MySQL"],
  [Server, "SQL Server"],
  [Globe, "REST APIs"],
  [ArrowRight, "into"],
  [Building2, "Odoo"],
  [Files, "CSV, XLSX, Parquet"],
  [Cloud, "Cloud storage"],
  [Warehouse, "Cloud warehouse"],
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-3 pr-3 motion-reduce:flex-wrap motion-reduce:justify-center" aria-hidden={hidden || undefined}>
      {items.map(([Icon, label]) =>
        label === "into" ? (
          <li key={label} className="px-2 text-muted">
            <Icon aria-hidden="true" className="size-5" />
            <span className="sr-only">into</span>
          </li>
        ) : (
          <li
            key={label}
            data-connects-item
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm whitespace-nowrap"
          >
            <Icon aria-hidden="true" strokeWidth={1.75} className="size-4 text-muted" />
            {label}
          </li>
        ),
      )}
    </ul>
  );
}

export function ConnectsMarquee() {
  const [paused, setPaused] = useState(false);
  return (
    <section id="connects" aria-labelledby="connects-title" className="border-b border-line py-10">
      <div className="mx-auto mb-5 flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <h2 id="connects-title" className="text-sm text-muted">
          Connects to
        </h2>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="press inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted hover:text-ink motion-reduce:hidden"
        >
          {paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
          {paused ? "Play" : "Pause"}
        </button>
      </div>
      <div
        tabIndex={0}
        aria-label={`Systems ${site.name} connects`}
        data-paused={paused}
        className="group overflow-hidden focus-visible:outline-offset-4 motion-reduce:px-4"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <div
          data-marquee-track
          className={`flex w-max animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none motion-reduce:justify-center ${
            paused ? "[animation-play-state:paused]" : ""
          }`}
        >
          <Row />
          <div className="motion-reduce:hidden">
            <Row hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
