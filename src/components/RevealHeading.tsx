"use client";

// Section headings that slide up line by line out of a mask, once, when they first scroll into view
// (CFX-WEB-landing AC-41). Headings already on screen, and all headings with reduced motion, stay as they are.

import { animate, useInView, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef } from "react";

type Props = { id: string; text: string; className?: string };

export function RevealHeading({ id, text, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const armed = useRef<{ inner: HTMLElement; line: number }[] | null>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (reduce || !el || el.getBoundingClientRect().top <= window.innerHeight) return;
    const masks = [...el.querySelectorAll<HTMLElement>("[data-word]")];
    const tops = [...new Set(masks.map((m) => m.offsetTop))];
    armed.current = masks.map((m) => ({ inner: m.firstElementChild as HTMLElement, line: tops.indexOf(m.offsetTop) }));
    for (const { inner } of armed.current) inner.style.transform = "translateY(110%)";
    el.dataset.headingReveal = "armed";
  }, [reduce]);

  useEffect(() => {
    const el = ref.current;
    if (!inView || !armed.current || !el) return;
    for (const { inner, line } of armed.current) {
      animate(inner, { transform: "translateY(0%)" }, { duration: 0.7, delay: line * 0.12, ease: [0.22, 1, 0.36, 1] });
    }
    armed.current = null;
    el.dataset.headingReveal = "played";
  }, [inView]);

  return (
    <h2 ref={ref} id={id} className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span data-word className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
            <span className="inline-block will-change-transform">{word}</span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </h2>
  );
}
