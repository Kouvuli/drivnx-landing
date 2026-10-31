"use client";

// Story moments (CFX-WEB-landing AC-25). The server renders the final state, so the page reads fine without
// JavaScript or with reduced motion. Only blocks that start below the fold are hidden on mount and then
// played once when they scroll into view.

import { animate, stagger, useAnimate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatCount, type CountFormat } from "@/lib/format";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Starting style of each `[data-reveal]` child. */
  from?: { opacity?: number; y?: number; scale?: number };
  step?: number;
};

const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;

export function Reveal({ children, className, from = { opacity: 0, y: 12 }, step = 0.12 }: RevealProps) {
  const [scope, animateScope] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const armed = useRef(false);
  const start = useRef(from);

  useEffect(() => {
    if (reduce || !scope.current || !belowFold(scope.current)) return;
    armed.current = true;
    animateScope("[data-reveal]", start.current, { duration: 0 });
  }, [reduce, scope, animateScope]);

  useEffect(() => {
    if (!inView || !armed.current) return;
    armed.current = false;
    animateScope("[data-reveal]", { opacity: 1, y: 0, scale: 1 }, { duration: 0.45, delay: stagger(step), ease: "easeOut" });
  }, [inView, animateScope, step]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

export function CountUp({ value, ...format }: { value: number } & CountFormat) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const armed = useRef(false);
  const fmt = useRef(format);

  useEffect(() => {
    if (reduce || !ref.current || !belowFold(ref.current)) return;
    armed.current = true;
    ref.current.textContent = formatCount(0, fmt.current);
  }, [reduce]);

  useEffect(() => {
    if (!inView || !armed.current) return;
    armed.current = false;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = formatCount(v, fmt.current);
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{formatCount(value, format)}</span>;
}
