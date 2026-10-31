"use client";

// Smooth, inertial scrolling for desktop pointers (CFX-WEB-landing AC-40). Touch devices and reduced motion keep native
// scrolling. Anchor links land below the sticky header through the page's scroll-padding-top (globals.css).

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    if (!matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
