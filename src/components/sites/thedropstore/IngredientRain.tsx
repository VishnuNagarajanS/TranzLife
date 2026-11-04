'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/dropstore/gsap';
import type { Product } from '@/lib/tranzlife-data';

/*
 * Hover effect for product tiles: flat silhouettes of the product's own ingredients drop in from
 * above and settle around the pack, the card deepens in colour and tilts right, the pack leans further the same
 * way. On leave the pieces fall out through the bottom. Pure transforms, so it stays on the compositor.
 */

type Shape = 'leaf' | 'tulsi' | 'amla' | 'turmeric' | 'pepper' | 'eucalyptus' | 'drop' | 'dill';

/** Each shape lives in a 100×100 box; `vein` lines are drawn in the card colour to read as cut-outs. */
const SHAPES: Record<Shape, { fill: string; vein?: string }> = {
  // Kalmegh / Bhumyamalaki: slim pointed leaf
  leaf: { fill: 'M50 3 C80 24 82 64 50 97 C18 64 20 24 50 3 Z', vein: 'M50 14 L50 88 M50 36 L64 26 M50 52 L36 42 M50 66 L64 56' },
  // Tulsi: rounder serrated-ish leaf
  tulsi: {
    fill: 'M50 4 C70 10 90 30 88 56 C86 78 68 94 50 97 C32 94 14 78 12 56 C10 30 30 10 50 4 Z',
    vein: 'M50 16 L50 90 M50 40 L70 30 M50 40 L30 30 M50 60 L72 52 M50 60 L28 52',
  },
  // Amla: round berry with faint segments
  amla: { fill: 'M50 8 A42 42 0 1 1 49.9 8 Z', vein: 'M50 10 C40 36 40 64 50 90 M50 10 C60 36 60 64 50 90' },
  // Turmeric: knobbly rhizome
  turmeric: {
    fill: 'M10 58 C8 44 22 36 34 42 C38 26 56 24 60 38 C70 30 90 36 88 52 C96 60 90 78 74 72 C64 84 44 82 38 72 C26 80 10 72 10 58 Z',
    vein: 'M24 56 L30 54 M46 52 L54 50 M70 52 L76 54',
  },
  // Black pepper: a cluster of corns
  pepper: { fill: 'M30 30 A18 18 0 1 1 29.9 30 Z M66 34 A18 18 0 1 1 65.9 34 Z M48 66 A18 18 0 1 1 47.9 66 Z' },
  // Eucalyptus: long sickle leaf
  eucalyptus: { fill: 'M8 90 C18 52 48 18 94 6 C82 46 52 80 8 90 Z', vein: 'M14 84 C40 60 64 34 86 14' },
  // Essential-oil drop
  drop: { fill: 'M50 4 C64 34 82 50 82 66 A32 32 0 0 1 18 66 C18 50 36 34 50 4 Z' },
  // Dill: umbel of fine rays with seed heads
  dill: {
    fill: 'M50 92 L50 50 M50 50 L18 22 M50 50 L34 12 M50 50 L50 8 M50 50 L66 12 M50 50 L82 22 M50 50 L90 40 M50 50 L10 40',
    vein: '',
  },
};

const DILL_HEADS: [number, number][] = [
  [18, 22],
  [34, 12],
  [50, 8],
  [66, 12],
  [82, 22],
  [90, 40],
  [10, 40],
];

const SHAPES_FOR: Record<string, [Shape, Shape]> = {
  liverdetox: ['leaf', 'amla'],
  pulmoclear: ['tulsi', 'turmeric'],
  'craving-control-gummies': ['tulsi', 'pepper'],
  reviva: ['eucalyptus', 'drop'],
  cyclerelief: ['dill', 'drop'],
};

/**
 * Resting places (percent of the card): big, overlapping pieces that fill the whole card, the
 * centre ones landing behind the pack, like a pile poured in from above.
 */
const PIECES: { x: number; y: number; size: number; rotate: number }[] = [
  { x: -12, y: -8, size: 44, rotate: -24 },
  { x: 26, y: -12, size: 40, rotate: 40 },
  { x: 64, y: -6, size: 46, rotate: 14 },
  { x: 4, y: 18, size: 42, rotate: 70 },
  { x: 40, y: 14, size: 44, rotate: -36 },
  { x: 72, y: 24, size: 40, rotate: -60 },
  { x: -14, y: 42, size: 46, rotate: 22 },
  { x: 28, y: 40, size: 42, rotate: 110 },
  { x: 62, y: 46, size: 46, rotate: -14 },
  { x: 2, y: 66, size: 44, rotate: -70 },
  { x: 40, y: 66, size: 46, rotate: 36 },
  { x: 74, y: 70, size: 42, rotate: 84 },
];

/** Degrees the card leans on hover (the pack leans a little further the same way). */
const TILT = 3;

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

function ShapeSvg({ shape, color, cutout }: { shape: Shape; color: string; cutout: string }) {
  const { fill, vein } = SHAPES[shape];
  if (shape === 'dill') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <path d={fill} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        {DILL_HEADS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill={color} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <path d={fill} fill={color} />
      {vein && <path d={vein} fill="none" stroke={cutout} strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />}
    </svg>
  );
}

export function IngredientRain({ product }: { product: Product }) {
  const root = useRef<HTMLDivElement>(null);
  const shapes = SHAPES_FOR[product.slug] ?? ['leaf', 'drop'];
  const deep = mix(product.tint, product.accent, 0.2);

  useEffect(() => {
    const layer = root.current;
    const tile = layer?.closest<HTMLElement>('[data-product-tile]');
    if (!layer || !tile) return;
    const mm = gsap.matchMedia();
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const pieces = Array.from(layer.querySelectorAll<HTMLElement>('[data-rain-piece]'));
      const pack = tile.querySelector<HTMLElement>('[data-product-tile-image]');
      gsap.set(pieces, { autoAlpha: 0 });
      let tl: gsap.core.Timeline | undefined;

      const enter = () => {
        tl?.kill();
        const height = tile.offsetHeight;
        tl = gsap.timeline();
        // The tile's own CSS transition fades the colour; GSAP only moves it.
        // Shrink just enough that the tilted card still fits inside its own slot (no overlap with neighbours, no clipped corners).
        const rad = (TILT * Math.PI) / 180;
        const w = tile.offsetWidth;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const fit = Math.min(w / (w * cos + height * sin), height / (height * cos + w * sin));
        tl.set(tile, { backgroundColor: deep }, 0).to(tile, { rotate: TILT, scale: fit, duration: 0.5, ease: 'power3.out' }, 0);
        if (pack) tl.to(pack, { rotate: 6, scale: 1.05, duration: 0.6, ease: 'back.out(2)' }, 0);
        pieces.forEach((piece, i) => {
          const rest = Number(piece.dataset.rotate);
          // Start just above the card: far enough that every piece enters from the top edge.
          const from = -(piece.offsetTop + piece.offsetHeight + 20 + (i % 3) * 30);
          const at = 0.05 + i * 0.045 + (i % 4) * 0.03;
          tl!.fromTo(
            piece,
            { y: from, rotate: rest - 90 + (i % 2) * 180, autoAlpha: 1 },
            { y: 0, rotate: rest, duration: 0.55 + (piece.offsetTop / height) * 0.25, ease: 'power2.in' },
            at
          );
          // A small rebound as it lands.
          tl!.to(piece, { keyframes: { y: [0, -10, 0], ease: 'sine.out' }, duration: 0.32 }, '>');
        });
      };

      const leave = () => {
        tl?.kill();
        const height = tile.offsetHeight;
        tl = gsap.timeline();
        tl.set(tile, { backgroundColor: product.tint }, 0).to(tile, { rotate: 0, scale: 1, duration: 0.5, ease: 'power3.out' }, 0);
        if (pack) tl.to(pack, { rotate: 0, scale: 1, duration: 0.5, ease: 'power3.out' }, 0);
        tl.to(
          pieces,
          {
            y: (_, el: HTMLElement) => height - el.offsetTop + 40,
            rotate: (i) => `+=${i % 2 ? 60 : -60}`,
            duration: 0.45,
            ease: 'power2.in',
            stagger: { each: 0.02, from: 'end' },
          },
          0
        ).set(pieces, { autoAlpha: 0 });
      };

      tile.addEventListener('mouseenter', enter);
      tile.addEventListener('mouseleave', leave);
      return () => {
        tile.removeEventListener('mouseenter', enter);
        tile.removeEventListener('mouseleave', leave);
        tl?.kill();
        // Hand the colour back to the product tint (React set it inline; clearing it would leave the card blank).
        gsap.set(tile, { clearProps: 'rotate,scale', backgroundColor: product.tint });
        if (pack) gsap.set(pack, { clearProps: 'rotate,scale' });
      };
    });
    return () => mm.revert();
  }, [deep, product.tint]);

  return (
    <div ref={root} className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {PIECES.map((piece, i) => (
        <div
          key={i}
          data-rain-piece=""
          data-rotate={piece.rotate}
          className="absolute invisible will-change-transform"
          style={{ left: `${piece.x}%`, top: `${piece.y}%`, width: `${piece.size}%`, aspectRatio: '1' }}
        >
          <ShapeSvg shape={shapes[i % 2]} color={product.accent} cutout={deep} />
        </div>
      ))}
    </div>
  );
}
