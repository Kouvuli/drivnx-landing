// Still image of the assembled hero graph (CFX-WEB-landing AC-19, AC-22): the server always sends it; it stays for
// reduced motion and browsers without WebGL. Drawn from the same layout as the 3D scene.
import { buildHeroGraph } from "@/lib/heroGraph";

const graph = buildHeroGraph("high");
const W = 480;
const H = 360;
const px = (x: number) => W / 2 + x * 92;
const py = (y: number) => H / 2 - y * 92;
const at = (i: number) => ({ x: px(graph.targets[i * 3]), y: py(graph.targets[i * 3 + 1]) });

export function HeroGraphStill({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true" data-hero-still>
      <g stroke="var(--color-ink)" strokeOpacity="0.22" strokeWidth="1">
        {graph.recordLinks.map(([r, h]) => (
          <line key={`r${r}`} x1={at(r).x} y1={at(r).y} x2={at(h).x} y2={at(h).y} />
        ))}
      </g>
      <g stroke="var(--color-approved)" strokeWidth="1.5">
        {graph.hubLinks.map(([a, b]) => (
          <line key={`h${a}-${b}`} x1={at(a).x} y1={at(a).y} x2={at(b).x} y2={at(b).y} />
        ))}
      </g>
      {Array.from({ length: graph.count }, (_, i) => (
        <circle
          key={i}
          cx={at(i).x}
          cy={at(i).y}
          r={i < graph.hubs.length ? 9 : 4.5}
          fill={i < graph.hubs.length ? "var(--color-ink)" : "var(--color-observed)"}
        />
      ))}
    </svg>
  );
}
