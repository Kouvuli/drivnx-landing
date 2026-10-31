"use client";

// Click ripple for every `fx` control (CFX-WEB-landing AC-55): one listener for the whole page, so server-rendered links
// need no wiring. The ripple starts at the pointer and fades out (keyframes in globals.css). Reduced motion: none.

import { useEffect } from "react";

export function ButtonRipple() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(".fx");
      if (!el || el.matches(":disabled") || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // The press may already have scaled the control; work in its own, unscaled coordinates.
      const box = el.getBoundingClientRect();
      const scale = box.width / el.offsetWidth || 1;
      const x = (e.clientX - box.left) / scale;
      const y = (e.clientY - box.top) / scale;
      const size = 2 * Math.hypot(Math.max(x, el.offsetWidth - x), Math.max(y, el.offsetHeight - y));
      const ripple = document.createElement("span");
      ripple.dataset.ripple = "";
      ripple.setAttribute("aria-hidden", "true");
      Object.assign(ripple.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${x - size / 2}px`,
        top: `${y - size / 2}px`,
      });
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
      el.appendChild(ripple);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);
  return null;
}
