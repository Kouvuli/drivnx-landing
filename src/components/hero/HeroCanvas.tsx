"use client";

// The 3D hero (CFX-WEB-landing AC-20, AC-21, AC-23, AC-24, AC-31..AC-33, AC-38). Loaded only in the browser, in its
// own chunk. Minimal by design: flat points and thin lines, trust colours as the only accents, no post-processing.

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import {
  Color,
  MathUtils,
  Object3D,
  Quaternion,
  Vector3,
  type Group,
  type InstancedMesh,
  type LineBasicMaterial,
  type LineSegments,
} from "three";
import {
  ASSEMBLY_SECONDS,
  buildHeroGraph,
  ease,
  hubLabel,
  pointProgress,
  QUALITY,
  recordSample,
  repelOffset,
  SUGGESTED_HUB_LINK,
  type Tier,
} from "@/lib/heroGraph";

export type SceneColors = { ink: string; observed: string; suggested: string; approved: string };
export type Phase = "assembling" | "settled";
/** Drag and pointer state, written by HeroScene's pointer handlers and read every frame. */
export type HeroInteraction = { yaw: number; pitch: number; dragging: boolean; inside: boolean };
export type HeroHover = { text: string; x: number; y: number } | null;

type Props = {
  tier: Tier;
  colors: SceneColors;
  active: boolean;
  playId: number;
  approved: boolean;
  repel: boolean;
  interactionRef: RefObject<HeroInteraction>;
  onReady: () => void;
  onPhase: (phase: Phase) => void;
  onHover: (hover: HeroHover) => void;
  onApprove: () => void;
  /** Reports where hub 0 and record 4 sit on screen once settled, as "x,y;x,y" fractions (used by browser tests). */
  onProbe: (probe: string) => void;
};

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const MAX_YAW = 0.6;

type Scratch = {
  dummy: Object3D;
  current: Float32Array;
  offsets: Float32Array;
  push: [number, number];
  suggested: Color;
  approved: Color;
};

function Graph({ tier, colors, playId, approved, repel, interactionRef, onPhase, onHover, onApprove, onProbe }: Omit<Props, "active" | "onReady">) {
  const graph = useMemo(() => buildHeroGraph(tier), [tier]);
  const pointer = QUALITY[tier].pointer;
  const group = useRef<Group>(null);
  const points = useRef<InstancedMesh>(null);
  // Larger invisible copies of the points that take pointer events, so small points are easy to hover or tap.
  const hitPoints = useRef<InstancedMesh>(null);
  const recordLines = useRef<LineSegments>(null);
  const hubLines = useRef<LineSegments>(null);
  const suggestedLine = useRef<LineSegments>(null);
  const elapsed = useRef(0);
  // Clock time when the current assembly started; null means "start on the next frame". Wall-clock based, so the
  // animation keeps real time even when a slow device drops frames.
  const startedAt = useRef<number | null>(null);
  const settled = useRef(false);
  const approvedAt = useRef<number | null>(null);
  const hovered = useRef<number | null>(null);
  // Per-frame scratch objects, allocated on the first frame and whenever the theme colours change (never per frame).
  const scratch = useRef<Scratch | null>(null);

  const confirmedLinks = useMemo(() => graph.hubLinks.filter((_, i) => i !== SUGGESTED_HUB_LINK), [graph]);
  const [suggestedA, suggestedB] = graph.hubLinks[SUGGESTED_HUB_LINK];
  // Initial line buffers; the frame loop rewrites them through the line objects.
  const recordBuffer = useMemo(() => new Float32Array(graph.recordLinks.length * 6), [graph]);
  const hubBuffer = useMemo(() => new Float32Array(confirmedLinks.length * 6), [confirmedLinks]);
  const suggestedBuffer = useMemo(() => new Float32Array(6), []);

  // An invisible, clickable cylinder along the suggested link's settled position (AC-33).
  const hit = useMemo(() => {
    const a = new Vector3(graph.targets[suggestedA * 3], graph.targets[suggestedA * 3 + 1], graph.targets[suggestedA * 3 + 2]);
    const b = new Vector3(graph.targets[suggestedB * 3], graph.targets[suggestedB * 3 + 1], graph.targets[suggestedB * 3 + 2]);
    const dir = b.clone().sub(a);
    const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
    return { position: a.add(b).multiplyScalar(0.5), quaternion, length: dir.length() };
  }, [graph, suggestedA, suggestedB]);

  useEffect(() => {
    scratch.current = null;
  }, [colors]);

  useLayoutEffect(() => {
    const mesh = points.current;
    if (!mesh) return;
    const ink = new Color(colors.ink);
    const observed = new Color(colors.observed);
    for (let i = 0; i < graph.count; i++) mesh.setColorAt(i, i < graph.hubs.length ? ink : observed);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [graph, colors]);

  useEffect(() => {
    elapsed.current = 0;
    startedAt.current = null;
    settled.current = false;
    onPhase("assembling");
  }, [playId, onPhase]);

  useEffect(() => {
    approvedAt.current = approved ? elapsed.current : null;
  }, [approved]);

  function showPoint(e: ThreeEvent<PointerEvent | MouseEvent>) {
    e.stopPropagation();
    const i = e.instanceId;
    if (!settled.current || i === undefined || i === hovered.current) return;
    hovered.current = i;
    const rect = (e.nativeEvent.target as HTMLElement).getBoundingClientRect();
    onHover({
      text: i < graph.hubs.length ? hubLabel(i) : recordSample(graph, i),
      x: e.nativeEvent.clientX - rect.left,
      y: e.nativeEvent.clientY - rect.top,
    });
  }

  function hidePoint() {
    hovered.current = null;
    onHover(null);
  }

  useFrame((state, delta) => {
    const mesh = points.current;
    const hitMesh = hitPoints.current;
    if (!mesh || !hitMesh || !recordLines.current || !hubLines.current || !suggestedLine.current || !group.current) return;
    const dt = Math.min(delta, 0.1);
    startedAt.current ??= state.clock.elapsedTime;
    elapsed.current = state.clock.elapsedTime - startedAt.current;
    const e = elapsed.current;
    scratch.current ??= {
      dummy: new Object3D(),
      current: new Float32Array(graph.count * 3),
      offsets: new Float32Array(graph.count * 2),
      push: [0, 0],
      suggested: new Color(colors.suggested),
      approved: new Color(colors.approved),
    };
    const s = scratch.current;
    const interaction = interactionRef.current;
    // Fill the full-bleed hero: scale the graph with the visible area, within limits (AC-39).
    // The graph is about 4.2 units wide and 2.8 tall; keep it inside narrow portrait screens too.
    const fit = MathUtils.clamp(Math.min(state.viewport.width / 4.6, state.viewport.height / 2.9), 0.35, 1.25);
    group.current.scale.setScalar(fit);

    // Cursor push (AC-38): only once settled, on the high tier with a fine pointer, while the cursor is over the scene.
    const pushing = repel && settled.current && interaction.inside && !interaction.dragging;
    const px = (state.pointer.x * state.viewport.width) / 2 / fit;
    const py = (state.pointer.y * state.viewport.height) / 2 / fit;

    for (let i = 0; i < graph.count; i++) {
      const p = pointProgress(e, graph.delays[i]);
      if (i >= graph.hubs.length) {
        if (pushing) repelOffset(px, py, graph.targets[i * 3], graph.targets[i * 3 + 1], s.push);
        else s.push[0] = s.push[1] = 0;
        s.offsets[i * 2] = MathUtils.damp(s.offsets[i * 2], s.push[0], 6, dt);
        s.offsets[i * 2 + 1] = MathUtils.damp(s.offsets[i * 2 + 1], s.push[1], 6, dt);
      }
      for (let k = 0; k < 3; k++) {
        s.current[i * 3 + k] = graph.starts[i * 3 + k] + (graph.targets[i * 3 + k] - graph.starts[i * 3 + k]) * p;
      }
      s.current[i * 3] += s.offsets[i * 2];
      s.current[i * 3 + 1] += s.offsets[i * 2 + 1];
      s.dummy.position.set(s.current[i * 3], s.current[i * 3 + 1], s.current[i * 3 + 2]);
      s.dummy.scale.setScalar(i < graph.hubs.length ? 0.08 : 0.038);
      s.dummy.updateMatrix();
      mesh.setMatrixAt(i, s.dummy.matrix);
      s.dummy.scale.setScalar(i < graph.hubs.length ? 0.2 : 0.13);
      s.dummy.updateMatrix();
      hitMesh.setMatrixAt(i, s.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    hitMesh.instanceMatrix.needsUpdate = true;
    hitMesh.computeBoundingSphere();

    const recordPositions = recordLines.current.geometry.attributes.position.array as Float32Array;
    graph.recordLinks.forEach(([a, b], j) => {
      recordPositions.set(s.current.subarray(a * 3, a * 3 + 3), j * 6);
      recordPositions.set(s.current.subarray(b * 3, b * 3 + 3), j * 6 + 3);
    });
    const hubPositions = hubLines.current.geometry.attributes.position.array as Float32Array;
    confirmedLinks.forEach(([a, b], j) => {
      hubPositions.set(s.current.subarray(a * 3, a * 3 + 3), j * 6);
      hubPositions.set(s.current.subarray(b * 3, b * 3 + 3), j * 6 + 3);
    });
    const suggestedPositions = suggestedLine.current.geometry.attributes.position.array as Float32Array;
    suggestedPositions.set(s.current.subarray(suggestedA * 3, suggestedA * 3 + 3), 0);
    suggestedPositions.set(s.current.subarray(suggestedB * 3, suggestedB * 3 + 3), 3);
    recordLines.current.geometry.attributes.position.needsUpdate = true;
    hubLines.current.geometry.attributes.position.needsUpdate = true;
    suggestedLine.current.geometry.attributes.position.needsUpdate = true;

    const linkOpacity = ease(clamp01((e - 0.8) / 1.5));
    (recordLines.current.material as LineBasicMaterial).opacity = 0.25 * ease(clamp01((e - 1.2) / 2));
    const hubMaterial = hubLines.current.material as LineBasicMaterial;
    hubMaterial.opacity = linkOpacity;
    hubMaterial.color.lerpColors(s.suggested, s.approved, ease(clamp01((e - 2.6) / 1)));
    const suggestedMaterial = suggestedLine.current.material as LineBasicMaterial;
    suggestedMaterial.opacity = linkOpacity;
    const approvedFor = approvedAt.current === null ? 0 : (e - approvedAt.current) / 0.4;
    suggestedMaterial.color.lerpColors(s.suggested, s.approved, ease(clamp01(approvedFor)));

    if (!settled.current && e >= ASSEMBLY_SECONDS + 0.3) {
      settled.current = true;
      onPhase("settled");
      group.current.updateMatrixWorld();
      const where = (i: number) => {
        const v = new Vector3(graph.targets[i * 3], graph.targets[i * 3 + 1], graph.targets[i * 3 + 2])
          .applyMatrix4(group.current!.matrixWorld)
          .project(state.camera);
        return `${((v.x + 1) / 2).toFixed(4)},${((1 - v.y) / 2).toFixed(4)}`;
      };
      onProbe(`${where(0)};${where(graph.hubs.length)}`);
    }

    // Gentle idle, drag rotation (AC-31) that eases back on release, and a slight pointer response on the high tier.
    if (!interaction.dragging) {
      interaction.yaw = MathUtils.damp(interaction.yaw, 0, 2, dt);
      interaction.pitch = MathUtils.damp(interaction.pitch, 0, 2, dt);
    }
    const follow = pointer && interaction.inside && !interaction.dragging;
    const t = state.clock.elapsedTime;
    const targetY = Math.sin(t * 0.25) * 0.15 + interaction.yaw + (follow ? state.pointer.x * 0.12 : 0);
    const targetX = interaction.pitch + (follow ? -state.pointer.y * 0.08 : 0);
    const lambda = interaction.dragging ? 10 : 3;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, MathUtils.clamp(targetY, -MAX_YAW - 0.3, MAX_YAW + 0.3), lambda, dt);
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, targetX, lambda, dt);
  });

  return (
    <group ref={group}>
      <instancedMesh ref={points} args={[undefined, undefined, graph.count]} raycast={() => null}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial />
      </instancedMesh>
      <instancedMesh
        ref={hitPoints}
        args={[undefined, undefined, graph.count]}
        onPointerMove={showPoint}
        onClick={showPoint}
        onPointerOut={(e) => e.nativeEvent.pointerType === "mouse" && hidePoint()}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </instancedMesh>
      <lineSegments ref={recordLines}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[recordBuffer, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={colors.ink} transparent opacity={0} />
      </lineSegments>
      <lineSegments ref={hubLines}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[hubBuffer, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={colors.suggested} transparent opacity={0} />
      </lineSegments>
      <lineSegments ref={suggestedLine}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[suggestedBuffer, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={colors.suggested} transparent opacity={0} />
      </lineSegments>
      <mesh
        position={hit.position}
        quaternion={hit.quaternion}
        onClick={(e) => {
          e.stopPropagation();
          if (settled.current && !approved && e.delta < 6) onApprove();
        }}
        onPointerOver={() => {
          if (settled.current && !approved) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <cylinderGeometry args={[0.14, 0.14, hit.length, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function HeroCanvas({ active, onReady, ...graph }: Props) {
  return (
    <Canvas
      dpr={QUALITY[graph.tier].dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 6.5], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={onReady}
      onPointerMissed={() => graph.onHover(null)}
      aria-hidden="true"
    >
      <Graph {...graph} />
    </Canvas>
  );
}
