// Example overview on the hero (CFX-WEB-landing AC-50; Phase 1 §2 executive overview): what the product tells you about
// your data, as plain HTML so it shows with the still image, reduced motion and no WebGL alike. Phones: a card below the
// graph and its controls; from 640 px: a strip under the hero text, centred with it over the scene.

const rows: [string, string][] = [
  ["Sources", "12 tables, 2.4M rows"],
  ["Findings", "14 undocumented fields"],
  ["Identifiers", "3 possible, 1 to confirm"],
  ["Contract", "9 of 12 rules defined"],
  ["Next", "Confirm customer_id"],
];

// The one Inferred row, shown in the amber "suggested" trust colour.
const INFERRED = "Identifiers";

export function HeroStatus() {
  return (
    <aside
      aria-labelledby="hero-status-title"
      data-hero-status
      className="pointer-events-none relative z-20 order-4 mx-4 mt-4 mb-2 rounded-xl border border-line bg-paper/80 p-4 text-left text-sm backdrop-blur-sm sm:mx-auto sm:mt-10 sm:mb-0 sm:w-[calc(100%-3rem)] sm:max-w-4xl"
    >
      <p id="hero-status-title" className="flex items-center justify-between font-mono text-xs tracking-wide text-muted uppercase">
        Customer database
        <span className="rounded-full border border-line px-2 py-0.5 normal-case">Example</span>
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 sm:grid-cols-3 sm:gap-y-3 lg:grid-cols-5">
        {rows.map(([label, value]) => (
          <div key={label} className="contents sm:block sm:min-w-0">
            <dt className="font-mono text-xs leading-5 text-muted">{label}</dt>
            <dd className={label === INFERRED ? "flex items-center gap-2 text-suggested-ink" : ""}>
              {label === INFERRED && <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-suggested" />}
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
