'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/dropstore/gsap';
import { SPIN_CLIPS, getSpinSet, loadSpinSet, nearestFrame } from '../products/spinFrames';

/**
 * The product turns as the page scrolls through the product block. Frames are pre-decoded images
 * drawn to a canvas, so there is no video seeking: every scroll position is an instant paint.
 */
export function ProductSpinFrames({ slug, label }: { slug: string; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const set = getSpinSet(slug);
    let progress = 0;
    let current = 0;
    let drawn = -1;
    let visible = true;
    // Always a little tilted, swinging left and right as the page scrolls (starts leaning left, like the open animation).
    const tiltAt = (p: number) => -12 * Math.cos(p * Math.PI * 4);
    let tilt = tiltAt(0);
    el.style.transform = `rotate(${tilt.toFixed(2)}deg)`;

    const trigger = ScrollTrigger.create({
      trigger: '[data-product]',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        progress = self.progress;
      },
    });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);

    const draw = () => {
      if (!set.width) return;
      if (el.width !== set.width || el.height !== set.height) {
        el.width = set.width;
        el.height = set.height;
        drawn = -1;
      }
      const frame = nearestFrame(set, Math.round(current));
      if (!frame || frame.index === drawn) return;
      drawn = frame.index;
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(frame.image, 0, 0);
    };

    const tick = () => {
      if (!visible) return;
      // Over the page a full-turn clip makes one whole revolution; the others run front to back.
      const target = progress * (SPIN_CLIPS[slug].count - 1);
      current += (target - current) * 0.07;
      if (Math.abs(target - current) < 0.05) current = target;
      tilt += (tiltAt(progress) - tilt) * 0.08;
      el.style.transform = `rotate(${tilt.toFixed(2)}deg)`;
      draw();
    };
    gsap.ticker.add(tick);
    loadSpinSet(slug, () => {
      drawn = -1;
      draw();
    });

    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      io.disconnect();
    };
  }, [slug]);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={label}
      className="block mx-auto pointer-events-none select-none"
      style={{ height: 'min(60svh, 48vw)', aspectRatio: String(SPIN_CLIPS[slug].aspect) }}
    />
  );
}
