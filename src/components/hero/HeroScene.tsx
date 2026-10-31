"use client";

// Decides between the still image and the 3D canvas (CFX-WEB-landing AC-19..AC-24):
// - server and first paint: the still image (no three.js in the initial scripts);
// - after the page has loaded and the scene is visible: the canvas, unless reduced motion or no WebGL;
// - phone-sized screens or coarse pointers: the light tier; rendering stops when off-screen or the tab is hidden.

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { buildHeroGraph, QUALITY, type Tier } from "@/lib/heroGraph";
import { subscribeTheme } from "@/lib/theme";
import type { HeroHover, HeroInteraction, Phase, SceneColors } from "./HeroCanvas";
import { HeroGraphStill } from "./HeroGraphStill";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// Tokens use light-dark(), which custom properties keep unresolved; a probe element resolves them to rgb() for three.js.
function readColors(): SceneColors {
  const probe = document.createElement("span");
  document.body.appendChild(probe);
  const v = (name: string) => {
    probe.style.color = `var(${name})`;
    return getComputedStyle(probe).color;
  };
  const colors = { ink: v("--color-ink"), observed: v("--color-observed"), suggested: v("--color-suggested"), approved: v("--color-approved") };
  probe.remove();
  return colors;
}

type Setup = { tier: Tier; colors: SceneColors; repel: boolean };

export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [mounted3d, setMounted3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase | "still">("still");
  const [playId, setPlayId] = useState(0);
  const [approved, setApproved] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [hover, setHover] = useState<HeroHover>(null);
  const [probe, setProbe] = useState("");
  // Drag state shared with the frame loop (AC-31); pointer handlers write it, the canvas reads it every frame.
  const interactionRef = useRef<HeroInteraction>({ yaw: 0, pitch: 0, dragging: false, inside: false });
  const dragRef = useRef({ x: 0, y: 0, id: -1 });

  // Decide once, after the page has loaded, whether 3D is allowed and at which quality.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !hasWebGL()) return;
    const decide = () => {
      const light = matchMedia("(max-width: 767px), (pointer: coarse)").matches;
      const finePointer = matchMedia("(pointer: fine)").matches;
      setSetup({ tier: light ? "low" : "high", colors: readColors(), repel: !light && finePointer });
    };
    const afterLoad = () => ("requestIdleCallback" in window ? requestIdleCallback(decide) : setTimeout(decide, 200));
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => window.removeEventListener("load", afterLoad);
  }, []);

  // Recolour the scene when the theme changes (toggle or system).
  useEffect(() => subscribeTheme(() => setSetup((s) => s && { ...s, colors: readColors() })), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setMounted3d(true);
    });
    observer.observe(el);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onPhase = useCallback((p: Phase) => setPhase(p), []);
  const onApprove = useCallback(() => setApproved(true), []);

  function replay() {
    setApproved(false);
    setRotated(false);
    setHover(null);
    setPlayId((n) => n + 1);
  }

  // Drag to rotate (AC-31). touch-action: pan-y keeps vertical swipes scrolling the page on phones.
  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    dragRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    interactionRef.current.dragging = true;
  }
  function onPointerMove(e: React.PointerEvent) {
    const it = interactionRef.current;
    if (!it.dragging || e.pointerId !== dragRef.current.id) return;
    it.yaw = Math.max(-0.6, Math.min(0.6, it.yaw + (e.clientX - dragRef.current.x) * 0.008));
    if (e.pointerType === "mouse") it.pitch = Math.max(-0.35, Math.min(0.35, it.pitch + (e.clientY - dragRef.current.y) * 0.005));
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
  }
  function endDrag() {
    const it = interactionRef.current;
    if (!it.dragging) return;
    it.dragging = false;
    if (Math.abs(it.yaw) > 0.05 || Math.abs(it.pitch) > 0.05) setRotated(true);
  }

  const showCanvas = setup !== null && mounted3d;
  const active = showCanvas && inView && pageVisible;
  const tier = setup?.tier ?? "high";
  const settled = showCanvas && phase === "settled";
  const pending = settled && !approved;

  // Full-bleed background of the hero (CFX-WEB-landing AC-39); the hero's text sits on top with pointer-events off.
  return (
    <>
      <div
        ref={ref}
        role="img"
        aria-label="Records from three sources linked into one clean graph of customers, orders, products and invoices."
        className={`relative order-2 aspect-[4/3] w-full sm:absolute sm:inset-0 sm:aspect-auto ${showCanvas ? "cursor-grab touch-pan-y select-none active:cursor-grabbing" : ""}`}
        data-hero-scene
        data-state={showCanvas ? "canvas" : "still"}
        data-phase={phase}
        data-active={String(active)}
        data-quality={tier}
        data-points={buildHeroGraph(tier).count}
        data-dpr-max={QUALITY[tier].dpr[1]}
        data-pointer={QUALITY[tier].pointer ? "on" : "off"}
        data-cursor-effect={setup?.repel ? "on" : "off"}
        data-suggested={approved ? "approved" : "pending"}
        data-rotated={String(rotated)}
        data-ink={setup?.colors.ink}
        data-probe={probe}
        onPointerDown={showCanvas ? onPointerDown : undefined}
        onPointerMove={showCanvas ? onPointerMove : undefined}
        onPointerUp={showCanvas ? endDrag : undefined}
        onPointerCancel={showCanvas ? endDrag : undefined}
        onPointerEnter={() => (interactionRef.current.inside = true)}
        onPointerLeave={(e) => {
          interactionRef.current.inside = false;
          endDrag();
          // Touch pointers "leave" as soon as the finger lifts; keep a tapped label until the next tap.
          if (e.pointerType === "mouse") setHover(null);
        }}
      >
        {/* One opacity class at a time: with both, opacity-60 wins and the still stays behind the canvas. */}
        <HeroGraphStill className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-60"}`} />
        {showCanvas && (
          <div className="absolute inset-0 opacity-70">
            <HeroCanvas
              tier={tier}
              colors={setup.colors}
              active={active}
              playId={playId}
              approved={approved}
              repel={setup.repel}
              interactionRef={interactionRef}
              onReady={onReady}
              onPhase={onPhase}
              onHover={setHover}
              onApprove={onApprove}
              onProbe={setProbe}
            />
          </div>
        )}
        {hover && (
          <p
            data-hero-tooltip
            aria-hidden="true"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-ink shadow-sm"
            style={{ left: hover.x, top: hover.y }}
          >
            {hover.text}
          </p>
        )}
      </div>
      <div className="pointer-events-none relative order-3 z-20 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-sm text-muted sm:absolute sm:inset-x-0 sm:bottom-0 sm:justify-end sm:px-6 sm:pb-4">
        <span aria-live="polite" className="w-full text-center sm:w-auto sm:text-left">
          {!settled
            ? "Scattered records, linked into one clean graph."
            : approved
              ? "Link approved: orders and invoices are connected."
              : "One link is still a suggestion. Drag to rotate, hover to inspect."}
        </span>
        {showCanvas && (
          <span className="pointer-events-auto flex gap-1">
            {pending && (
              <button
                type="button"
                onClick={onApprove}
                className="fx inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-medium text-suggested-ink [--fx-fill:var(--color-suggested-soft)]"
              >
                <Check aria-hidden="true" className="size-4" />
                Approve suggested link
              </button>
            )}
            <button
              type="button"
              onClick={replay}
              className="fx inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-medium text-ink [--fx-fill:var(--color-surface)]"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Replay
            </button>
          </span>
        )}
      </div>
    </>
  );
}
