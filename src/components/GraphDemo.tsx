"use client";

// Hero demo (CFX-WEB-landing AC-06..AC-10): fix "312 orders have no matching customer"
// by accepting Claude's suggested link or drawing it between the two columns.

import {
  Handle,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Check, CircleDashed, Copy, Link2, CalendarCog, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { DEMO, SUGGESTED_LINK, canRunDryRun, canSend, demoReducer, fixedCount, initialDemoState, type DemoState } from "@/lib/demo";

type TableData = {
  title: string;
  detail: string;
  columns: string[];
  side: "source" | "target";
  linkColumn: string;
  resolved: boolean;
};
type TableNode = Node<TableData, "table">;

const fmt = (n: number) => n.toLocaleString("en-US");

function TableNodeView({ data }: NodeProps<TableNode>) {
  return (
    <div className="w-36 overflow-hidden rounded-md border border-line bg-surface text-left shadow-sm">
      <div className="border-b border-line px-3 py-2">
        <p className="font-mono text-[13px] font-medium text-ink">{data.title}</p>
        <p className="text-xs text-muted">{data.detail}</p>
      </div>
      <ul className="py-1">
        {data.columns.map((col) => {
          const isLink = col === data.linkColumn;
          const tone = !isLink ? "text-muted" : data.resolved ? "bg-approved-soft text-approved" : "bg-suggested-soft text-suggested-ink";
          return (
            <li key={col} className={`relative px-3 py-1 font-mono text-xs ${tone}`}>
              {col}
              <Handle
                id={col}
                type={data.side}
                position={data.side === "source" ? Position.Right : Position.Left}
                aria-label={`${data.title} column ${col}`}
                className="size-2.5! border-2! border-surface! bg-observed!"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const nodeTypes = { table: TableNodeView };

const destinations = ["Odoo", "Files", "Cloud storage", "Warehouse"];
const DRY_RUN_MS = 1200;

function statusMessage(s: DemoState) {
  if (s.hint) return s.hint;
  switch (s.last) {
    case "start":
      return `${fmt(DEMO.unmatchedOrders)} orders have no matching customer`;
    case "linked":
      return `Link approved. All ${fmt(DEMO.totalOrders)} orders matched to a customer`;
    case "merged":
      return `Merged “ACME, Inc.” into “Acme Inc.”: ${fmt(DEMO.customers - 1)} customers`;
    case "converted":
      return `Converted ${fmt(DEMO.totalOrders)} dates to one format`;
    case "running":
      return "Running a dry run…";
    case "passed":
      return "Dry run passed: 0 violations. Ready to send.";
  }
}

type Issue = { id: string; icon: typeof Link2; text: React.ReactNode; fixed: boolean; done: string; action: string; onFix: () => void };

export function GraphDemo() {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const nodes = useMemo<TableNode[]>(
    () => [
      {
        id: "orders",
        type: "table",
        position: { x: 0, y: 0 },
        data: {
          title: "orders.xlsx",
          detail: `Excel, ${fmt(DEMO.totalOrders)} rows`,
          columns: ["order_id", SUGGESTED_LINK.sourceHandle, "order_date", "total"],
          side: "source",
          linkColumn: SUGGESTED_LINK.sourceHandle,
          resolved: state.linked,
        },
      },
      {
        id: "customers",
        type: "table",
        position: { x: 245, y: 20 },
        data: {
          title: "customers",
          detail: `Postgres, ${fmt(DEMO.customers)} rows`,
          columns: [SUGGESTED_LINK.targetHandle, "name", "email"],
          side: "target",
          linkColumn: SUGGESTED_LINK.targetHandle,
          resolved: state.linked,
        },
      },
    ],
    [state.linked],
  );

  const edges = useMemo<Edge[]>(
    () => [
      {
        id: "link",
        source: "orders",
        sourceHandle: SUGGESTED_LINK.sourceHandle,
        target: "customers",
        targetHandle: SUGGESTED_LINK.targetHandle,
        label: state.linked ? "Approved" : `${DEMO.confidence}%`,
        style: {
          stroke: state.linked ? "var(--color-approved)" : "var(--color-suggested)",
          strokeWidth: 2,
          strokeDasharray: state.linked ? undefined : "6 4",
        },
        labelStyle: { fill: state.linked ? "var(--color-approved)" : "var(--color-suggested-ink)", fontWeight: 600 },
        labelBgStyle: { fill: state.linked ? "var(--color-approved-soft)" : "var(--color-suggested-soft)" },
        labelBgPadding: [6, 3],
      },
    ],
    [state.linked],
  );

  function onConnect(c: Connection) {
    dispatch({ type: "connect", sourceHandle: c.sourceHandle, targetHandle: c.targetHandle });
  }

  function runDryRun() {
    dispatch({ type: "startDryRun" });
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => dispatch({ type: "finishDryRun" }), reduce ? 0 : DRY_RUN_MS);
  }

  function reset() {
    clearTimeout(timer.current);
    setSentTo(null);
    dispatch({ type: "reset" });
  }

  const fixed = fixedCount(state);
  const issues: Issue[] = [
    {
      id: "link",
      icon: Link2,
      text: `${fmt(DEMO.unmatchedOrders)} orders have no matching customer`,
      fixed: state.linked,
      done: "Linked by cust_no → customer_id",
      action: "Accept suggestion",
      onFix: () => dispatch({ type: "accept" }),
    },
    {
      id: "duplicate",
      icon: Copy,
      text: `“Acme Inc.” and “ACME, Inc.” look like one customer (${DEMO.duplicateMatch}%)`,
      fixed: state.merged,
      done: "Merged into “Acme Inc.”",
      action: "Merge",
      onFix: () => dispatch({ type: "merge" }),
    },
    {
      id: "dates",
      icon: CalendarCog,
      text: (
        <>
          <span className="font-mono">order_date</span> mixes 3 formats
        </>
      ),
      fixed: state.converted,
      done: "All dates as 2026-03-12",
      action: "Convert dates",
      onFix: () => dispatch({ type: "convert" }),
    },
  ];
  const good = state.last !== "start" && !state.hint;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
      <div className="order-2 grid gap-5 lg:order-1">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-semibold">Issues found</h3>
            <p className="text-sm text-muted" data-demo-progress>
              {fixed} of 3 fixed
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div
              className="h-full rounded-full bg-approved transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${(fixed / 3) * 100}%` }}
            />
          </div>
        </div>

        <ul className="grid gap-3">
          {issues.map((issue) => (
            <li
              key={issue.id}
              data-issue={issue.id}
              data-fixed={issue.fixed}
              className={`rounded-lg border p-4 transition-colors duration-300 ${
                issue.fixed ? "border-approved/40 bg-approved-soft" : "border-line bg-surface"
              }`}
            >
              <p className="flex items-start gap-3">
                <issue.icon aria-hidden="true" strokeWidth={1.75} className={`mt-0.5 size-5 shrink-0 ${issue.fixed ? "text-approved" : "text-suggested"}`} />
                <span>
                  <span className={issue.fixed ? "text-muted line-through decoration-1" : ""}>{issue.text}</span>
                  {issue.fixed && (
                    <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-approved">
                      <Check aria-hidden="true" className="size-4" />
                      {issue.done}
                    </span>
                  )}
                </span>
              </p>
              {!issue.fixed && (
                <button
                  type="button"
                  onClick={issue.onFix}
                  className="fx mt-3 min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent [--fx-fill:var(--color-accent-strong)]"
                >
                  {issue.action}
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runDryRun}
              disabled={!canRunDryRun(state)}
              className="fx inline-flex min-h-11 items-center gap-2 rounded-md border border-accent px-4 font-semibold text-accent [--fx-fill:var(--color-accent)] enabled:hover:text-on-accent disabled:cursor-not-allowed disabled:border-line disabled:text-observed"
            >
              <ShieldCheck aria-hidden="true" className="size-4" />
              Run dry run
            </button>
            {(fixed > 0 || state.hint) && (
              <button
                type="button"
                onClick={reset}
                className="fx inline-flex min-h-11 items-center gap-2 rounded-md px-4 font-medium text-muted [--fx-fill:var(--color-paper)] hover:text-ink"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Reset demo
              </button>
            )}
          </div>
          {state.dryRun !== "idle" && (
            <div className="rounded-lg border border-line bg-surface p-4" data-dry-run={state.dryRun}>
              {state.dryRun === "running" ? (
                <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <div className="h-full w-1/3 animate-[dryrun_1.2s_ease-in-out_infinite] rounded-full bg-accent motion-reduce:animate-none" />
                </div>
              ) : (
                <ul className="grid gap-1.5 text-sm">
                  {[
                    `${fmt(DEMO.totalOrders)} orders checked`,
                    `${fmt(DEMO.customers - 1)} customers, 1 merged`,
                    "3 issues fixed",
                    "0 violations",
                  ].map((line, i) => (
                    <li
                      key={line}
                      className="flex items-center gap-2 motion-safe:animate-[rise_300ms_ease-out_both]"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <Check aria-hidden="true" className="size-4 text-approved" />
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="order-1 rounded-xl border border-line bg-surface p-4 sm:p-5 lg:order-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="demo-title" className="font-semibold">
            orders.xlsx + customers
          </h3>
          <p className="text-xs text-muted">Demo data</p>
        </div>

        <div
          className="mt-3 h-52 rounded-md border border-line bg-paper sm:h-64"
          role="group"
          aria-label="Graph of orders.xlsx and customers. Drag from cust_no to customer_id to link them, or use Accept suggestion."
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ padding: 0.08, maxZoom: 1.2 }}
            nodesDraggable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            elementsSelectable={false}
            panOnDrag={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            connectionRadius={30}
          />
        </div>

        <p
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 ${
            good ? "bg-approved-soft text-approved" : "bg-suggested-soft text-suggested-ink"
          }`}
        >
          {statusMessage(state)}
          {state.last === "start" && !state.hint && (
            <span className="block font-normal">
              Claude suggests <span className="font-mono">cust_no → customer_id</span> ({DEMO.confidence}% match).
            </span>
          )}
        </p>

        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm font-medium" id="send-label">
            {canSend(state) ? (
              <Check aria-hidden="true" className="size-4 text-approved" />
            ) : (
              <CircleDashed aria-hidden="true" className="size-4 text-observed" />
            )}
            Send clean data to
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="send-label">
            {destinations.map((d) => (
              <button
                key={d}
                type="button"
                disabled={!canSend(state)}
                aria-pressed={sentTo === d}
                onClick={() => setSentTo(d)}
                className="fx min-h-11 rounded-md border border-line bg-surface px-3 text-sm font-medium [--fx-fill:var(--color-accent)] enabled:hover:border-accent enabled:hover:text-on-accent disabled:cursor-not-allowed disabled:text-observed aria-pressed:border-accent aria-pressed:text-accent-strong"
              >
                {d}
              </button>
            ))}
          </div>
          {!canSend(state) && <p className="mt-2 text-sm text-muted">Fix all three issues and pass a dry run to send.</p>}
          {sentTo && (
            <p className="mt-2 text-sm text-muted">
              Ready for {sentTo}: {fmt(DEMO.totalOrders)} orders, {fmt(DEMO.customers - 1)} customers. In the product you review the
              report, then send.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
