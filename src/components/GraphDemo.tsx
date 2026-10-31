"use client";

// Demo (CFX-WEB-landing AC-06..AC-10, AC-35, AC-36): review what profiling inferred. Confirm the suggested relationship
// (accept it or draw it between the two columns), confirm the identifier, promote it to a contract rule, then export.

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
import { Check, Download, FileCheck2, KeyRound, Link2, RotateCcw } from "lucide-react";
import { useMemo, useReducer } from "react";
import { DEMO, SUGGESTED_LINK, canDefineRule, canExport, demoReducer, initialDemoState, reviewedCount, type DemoState } from "@/lib/demo";

type TableData = {
  title: string;
  detail: string;
  columns: string[];
  side: "source" | "target";
  /** The column under review and whether it is still Inferred (amber) or Confirmed (green). */
  linkColumn: string;
  confirmed: boolean;
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
          const tone = !isLink ? "text-muted" : data.confirmed ? "bg-approved-soft text-approved" : "bg-suggested-soft text-suggested-ink";
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

function statusMessage(s: DemoState) {
  if (s.hint) return s.hint;
  switch (s.last) {
    case "start":
      return "Profile ready: 2 inferred facts need your review";
    case "relationship":
      return "Relationship confirmed: orders.cust_no → customers.customer_id";
    case "identifier":
      return "Confirmed: customer_id is the customer identifier";
    case "rule":
      return "Defined: customer_id must be non-null and unique";
    case "exported":
      return "Contract exported: customers.contract.yaml";
  }
}

const CONTRACT_YAML = `contract: customers
rules:
  - field: customer_id
    required: true
    unique: true
    state: defined
    evidence: profile run ${DEMO.profileRun}`;

type Item = {
  id: string;
  icon: typeof Link2;
  text: React.ReactNode;
  done: boolean;
  doneText: string;
  action: string;
  /** Why the action is not available yet, if it isn't. */
  blocked: string | null;
  onReview: () => void;
};

export function GraphDemo() {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);

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
          confirmed: state.relationship,
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
          confirmed: state.identifier,
        },
      },
    ],
    [state.relationship, state.identifier],
  );

  const edges = useMemo<Edge[]>(
    () => [
      {
        id: "link",
        source: "orders",
        sourceHandle: SUGGESTED_LINK.sourceHandle,
        target: "customers",
        targetHandle: SUGGESTED_LINK.targetHandle,
        label: state.relationship ? "Confirmed" : `${DEMO.confidence}%`,
        style: {
          stroke: state.relationship ? "var(--color-approved)" : "var(--color-suggested)",
          strokeWidth: 2,
          strokeDasharray: state.relationship ? undefined : "6 4",
        },
        labelStyle: { fill: state.relationship ? "var(--color-approved)" : "var(--color-suggested-ink)", fontWeight: 600 },
        labelBgStyle: { fill: state.relationship ? "var(--color-approved-soft)" : "var(--color-suggested-soft)" },
        labelBgPadding: [6, 3],
      },
    ],
    [state.relationship],
  );

  function onConnect(c: Connection) {
    dispatch({ type: "connect", sourceHandle: c.sourceHandle, targetHandle: c.targetHandle });
  }

  const reviewed = reviewedCount(state);
  const items: Item[] = [
    {
      id: "relationship",
      icon: Link2,
      text: (
        <>
          <span className="font-mono">orders.cust_no</span> may reference <span className="font-mono">customers.customer_id</span> (
          {DEMO.confidence}% of values match)
        </>
      ),
      done: state.relationship,
      doneText: "Confirmed relationship",
      action: "Accept suggestion",
      blocked: null,
      onReview: () => dispatch({ type: "accept" }),
    },
    {
      id: "identifier",
      icon: KeyRound,
      text: (
        <>
          <span className="font-mono">customer_id</span> is {DEMO.uniqueness}% unique: a possible customer identifier
        </>
      ),
      done: state.identifier,
      doneText: "Confirmed: the customer identifier",
      action: "Confirm identifier",
      blocked: null,
      onReview: () => dispatch({ type: "confirmIdentifier" }),
    },
    {
      id: "rule",
      icon: FileCheck2,
      text: (
        <>
          Add to the contract: <span className="font-mono">customer_id</span> must be non-null and unique
        </>
      ),
      done: state.rule,
      doneText: "Defined in the customers contract",
      action: "Add to contract",
      blocked: canDefineRule(state) ? null : "Confirm the identifier first: only confirmed facts become rules.",
      onReview: () => dispatch({ type: "defineRule" }),
    },
  ];
  const good = state.last !== "start" && !state.hint;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
      <div className="order-2 grid gap-5 lg:order-1">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-semibold">To review</h3>
            <p className="text-sm text-muted" data-demo-progress>
              {reviewed} of 3 reviewed
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div
              className="h-full rounded-full bg-approved transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${(reviewed / 3) * 100}%` }}
            />
          </div>
        </div>

        <ul className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              data-review={item.id}
              data-done={item.done}
              className={`rounded-lg border p-4 transition-colors duration-300 ${
                item.done ? "border-approved/40 bg-approved-soft" : "border-line bg-surface"
              }`}
            >
              <p className="flex items-start gap-3">
                <item.icon aria-hidden="true" strokeWidth={1.75} className={`mt-0.5 size-5 shrink-0 ${item.done ? "text-approved" : "text-suggested"}`} />
                <span>
                  <span className={item.done ? "text-muted" : ""}>{item.text}</span>
                  {item.done && (
                    <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-approved">
                      <Check aria-hidden="true" className="size-4" />
                      {item.doneText}
                    </span>
                  )}
                </span>
              </p>
              {!item.done && (
                <>
                  <button
                    type="button"
                    onClick={item.onReview}
                    disabled={item.blocked !== null}
                    className="fx mt-3 min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent [--fx-fill:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
                  >
                    {item.action}
                  </button>
                  {item.blocked && <p className="mt-2 text-sm text-muted">{item.blocked}</p>}
                </>
              )}
            </li>
          ))}
        </ul>

        {(reviewed > 0 || state.hint) && (
          <div>
            <button
              type="button"
              onClick={() => dispatch({ type: "reset" })}
              className="fx inline-flex min-h-11 items-center gap-2 rounded-md px-4 font-medium text-muted [--fx-fill:var(--color-paper)] hover:text-ink"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Reset demo
            </button>
          </div>
        )}
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
          aria-label="Graph of orders.xlsx and customers. Drag from cust_no to customer_id to confirm the link, or use Accept suggestion."
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
              Inferred link: <span className="font-mono">cust_no → customer_id</span> ({DEMO.confidence}% match).
            </span>
          )}
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => dispatch({ type: "export" })}
            disabled={!canExport(state) || state.exported}
            className="fx inline-flex min-h-11 items-center gap-2 rounded-md border border-accent px-4 font-semibold text-accent [--fx-fill:var(--color-accent)] enabled:hover:text-on-accent disabled:cursor-not-allowed disabled:border-line disabled:text-observed"
          >
            <Download aria-hidden="true" className="size-4" />
            Export contract
          </button>
          {!canExport(state) && <p className="mt-2 text-sm text-muted">Review all three items to export the contract.</p>}
          {state.exported && (
            <div data-export className="mt-3 motion-safe:animate-[rise_300ms_ease-out_both]">
              <pre className="overflow-x-auto rounded-md border border-line bg-paper p-3 font-mono text-xs leading-5">{CONTRACT_YAML}</pre>
              <p className="mt-2 text-sm text-muted">In the product, the export is saved on your machine as YAML or JSON.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
