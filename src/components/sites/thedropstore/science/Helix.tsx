'use client';

import React, { useRef } from 'react';
import { gsap } from '@/lib/dropstore/gsap';
import { useMotion } from '@/lib/dropstore/motion';
import { cn } from '@/lib/utils';

const RUNGS = 26;
const WIDTH = 200;
const HEIGHT = 640;
const RADIUS = 70;
const TWIST = 0.42;

/** Positions of one rung's two nodes for a given rotation. */
function rung(i: number, rotation: number) {
  const phase = rotation + i * TWIST;
  const y = 20 + (i * (HEIGHT - 40)) / (RUNGS - 1);
  const x = Math.sin(phase) * RADIUS;
  const depth = Math.cos(phase);
  return { y, x1: WIDTH / 2 + x, x2: WIDTH / 2 - x, depth };
}

/** Slowly turning green-and-gold DNA helix drawn in SVG; holds still for reduced motion. */
export function Helix({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useMotion(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const lines = Array.from(svg.querySelectorAll<SVGLineElement>('[data-rung]'));
      const greens = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-node="a"]'));
      const golds = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-node="b"]'));
      const update = (time: number) => {
        const rotation = time * 0.35;
        for (let i = 0; i < RUNGS; i++) {
          const { x1, x2, depth } = rung(i, rotation);
          lines[i].setAttribute('x1', String(x1));
          lines[i].setAttribute('x2', String(x2));
          greens[i].setAttribute('cx', String(x1));
          greens[i].setAttribute('r', String(5 + depth * 2.5));
          greens[i].setAttribute('opacity', String(0.55 + depth * 0.45));
          golds[i].setAttribute('cx', String(x2));
          golds[i].setAttribute('r', String(5 - depth * 2.5));
          golds[i].setAttribute('opacity', String(0.55 - depth * 0.45));
        }
      };
      gsap.ticker.add(update);
      return () => gsap.ticker.remove(update);
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );

  const initial = Array.from({ length: RUNGS }, (_, i) => rung(i, 0));
  return (
    <svg ref={ref} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={cn('overflow-visible', className)} aria-hidden>
      {initial.map((r, i) => (
        <g key={i}>
          <line data-rung="" x1={r.x1} x2={r.x2} y1={r.y} y2={r.y} stroke="#C49A3C" strokeOpacity={0.35} strokeWidth={1.5} />
          <circle data-node="a" cx={r.x1} cy={r.y} r={5} fill="#2F7D46" />
          <circle data-node="b" cx={r.x2} cy={r.y} r={5} fill="#C49A3C" />
        </g>
      ))}
    </svg>
  );
}
