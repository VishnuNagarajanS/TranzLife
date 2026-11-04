'use client';

import React, { useRef } from 'react';
import { gsap } from '@/lib/dropstore/gsap';
import { useMotion } from '@/lib/dropstore/motion';
import { cn } from '@/lib/utils';

/** Full turns each digit makes before landing on its value. */
const SPINS = 2;
const DIGITS = '0123456789';

/**
 * Stat value whose digits roll like an odometer once it scrolls into view
 * (each column spins, right-most settles last). Values without digits, such as
 * "Chennai", render as plain text. Screen readers get the plain value; reduced
 * motion shows it straight away.
 */
export function RollingValue({ value, className }: { value: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const hasDigits = /\d/.test(value);

  useMotion(
    () => {
      const el = root.current;
      if (!el || !hasDigits) return;
      const ctx = gsap.context(() => {
        const columns = gsap.utils.toArray<HTMLElement>('[data-rolling-column]', el);
        const others = gsap.utils.toArray<HTMLElement>('[data-rolling-static]', el);
        gsap.set(columns, { y: 0, yPercent: 0 });
        gsap.set(others, { opacity: 0 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        columns.forEach((column, i) => {
          const steps = Number(column.dataset.rollingSteps);
          tl.to(column, { yPercent: -(steps / (steps + 1)) * 100, duration: 1.4 + i * 0.25, ease: 'power3.inOut' }, 0);
        });
        tl.to(others, { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0.9);
      }, el);
      return () => ctx.revert();
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    [value]
  );

  return (
    <span ref={root} className={cn('inline-flex', className)}>
      <span className="sr-only">{value}</span>
      {hasDigits ? (
        Array.from(value).map((char, i) => {
          if (!DIGITS.includes(char)) {
            return (
              <span key={i} aria-hidden data-rolling-static="">
                {char}
              </span>
            );
          }
          // Column: SPINS full runs of 0-9, then the target digit; it scrolls up to land on the last cell.
          const sequence = [...DIGITS.repeat(SPINS), char];
          return (
            <span key={i} className="relative inline-block overflow-hidden h-[1.12em] leading-[1.12em]" aria-hidden>
              <span className="invisible">{char}</span>
              <span
                className="absolute left-0 top-0 flex flex-col items-center w-full"
                // Resting state shows the final digit, so reduced motion (and no JS) reads correctly.
                style={{ transform: `translateY(${-((sequence.length - 1) / sequence.length) * 100}%)` }}
                data-rolling-column=""
                data-rolling-steps={sequence.length - 1}
              >
                {sequence.map((digit, j) => (
                  <span key={j} className="block h-[1.12em]">
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          );
        })
      ) : (
        <span aria-hidden>{value}</span>
      )}
    </span>
  );
}
