'use client';

import React, { useEffect, useRef } from 'react';

/*
 * Sage wall with olive-branch shadows swaying in a soft breeze and a slow drift of sunlight.
 * Pure SVG + CSS: every branch is one blurred element animated by transform only, so the blur is
 * rasterised once and the motion stays on the compositor. Geometry is deterministic (no random),
 * so server and client render the same markup.
 */

type Point = [number, number];

interface BranchSpec {
  root: Point;
  ctrl: Point;
  tip: Point;
  leaves: number;
  leafSize: number;
  className: string;
}

const BRANCHES: BranchSpec[] = [
  { root: [1000, 40], ctrl: [640, 90], tip: [150, 520], leaves: 15, leafSize: 1.15, className: 'leafbg__branch--a' },
  { root: [0, 0], ctrl: [250, 120], tip: [620, 560], leaves: 11, leafSize: 0.95, className: 'leafbg__branch--b' },
  { root: [1000, 700], ctrl: [740, 640], tip: [330, 760], leaves: 9, leafSize: 0.8, className: 'leafbg__branch--c' },
];

const bezier = (t: number, a: Point, b: Point, c: Point): Point => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1],
];

/** Pointed leaf lying along +x, base at the origin. */
const LEAF = 'M0 0 C 16 -20 64 -26 112 0 C 64 26 16 20 0 0 Z';

function branchGeometry(spec: BranchSpec) {
  const stem = `M${spec.root[0]} ${spec.root[1]} Q ${spec.ctrl[0]} ${spec.ctrl[1]} ${spec.tip[0]} ${spec.tip[1]}`;
  const leaves = Array.from({ length: spec.leaves }, (_, i) => {
    const t = 0.12 + (i / spec.leaves) * 0.86;
    const [x, y] = bezier(t, spec.root, spec.ctrl, spec.tip);
    const [x2, y2] = bezier(Math.min(1, t + 0.02), spec.root, spec.ctrl, spec.tip);
    const tangent = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
    const side = i % 2 === 0 ? 1 : -1;
    const spread = 38 + ((i * 7) % 5) * 5;
    const grow = 0.62 + 0.55 * Math.sin(Math.PI * (0.15 + 0.7 * (1 - t)));
    const size = spec.leafSize * grow * (0.85 + ((i * 3) % 4) * 0.08);
    return { x, y, angle: tangent + side * spread, size };
  });
  // Terminal leaf at the tip.
  const [tx, ty] = spec.tip;
  leaves.push({ x: tx, y: ty, angle: (Math.atan2(spec.tip[1] - spec.ctrl[1], spec.tip[0] - spec.ctrl[0]) * 180) / Math.PI, size: spec.leafSize * 0.7 });
  return { stem, leaves };
}

const GEOMETRY = BRANCHES.map(branchGeometry);

export function LeafShadowBackdrop() {
  const root = useRef<HTMLDivElement>(null);
  // Only animate while on screen: the sway is pure paint cost once it is scrolled away.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.removeAttribute('data-paused');
      else el.setAttribute('data-paused', '');
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className="leafbg" aria-hidden="true">
      <div className="leafbg__light" />
      <div className="leafbg__light leafbg__light--2" />
      {BRANCHES.map((spec, b) => (
        <svg key={spec.className} viewBox="0 0 1000 800" className={`leafbg__branch ${spec.className}`} preserveAspectRatio="xMidYMid meet">
          <path d={GEOMETRY[b].stem} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          {GEOMETRY[b].leaves.map((leaf, i) => (
            <path key={i} d={LEAF} fill="currentColor" transform={`translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.angle.toFixed(1)}) scale(${leaf.size.toFixed(3)})`} />
          ))}
        </svg>
      ))}
    </div>
  );
}
