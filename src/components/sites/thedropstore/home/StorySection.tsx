'use client';

import React, { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/dropstore/gsap';
import { useMotion } from '@/lib/dropstore/motion';
import { siteData } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { Text } from '../Text';

/** Radius of the cursor spotlight, and the soft edge around it. */
const SPOT = 190;
const FEATHER = 140;
/** Track height in screens: one screen of stage plus 2.6 screens of scroll through the chapters. */
const TRACK_SCREENS = 3.6;

/**
 * "Inside every cell": a pinned before/after story. The damaged image (dark, glowing cracks)
 * gives way to the restored one (green moss) as the visitor scrolls through three stages.
 * On desktop a soft spotlight also reveals the restored image wherever the cursor goes.
 *
 * The reveal is a CSS radial-gradient mask driven by three variables on the section:
 * `--mx`/`--my` (spotlight centre), `--spot` (spotlight radius) and `--reveal` (0 → 1, scroll).
 */
export function StorySection() {
  const { story } = siteData.home;
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Scroll: pin the stage, step through the three chapters and grow the reveal to full screen.
  // The scroll distance is reserved by the track's own height (not by GSAP's pin spacing), so the
  // sections below can never slide over the story, whatever happens to the pin's wrapper.
  useMotion(
    () => {
      const section = root.current;
      const trackEl = track.current;
      if (!section || !trackEl) return;
      let pin: ScrollTrigger | undefined;
      const ctx = gsap.context(() => {
        gsap.set(trackEl, { height: `${TRACK_SCREENS * 100}svh` });
        const stages = gsap.utils.toArray<HTMLElement>('[data-story-stage]');
        const dots = gsap.utils.toArray<HTMLElement>('[data-story-dot]');
        gsap.set('[data-story-stages]', { display: 'block' });
        gsap.set(stages, { position: 'absolute', left: 0, right: 0, bottom: 0 });
        gsap.set(stages.slice(1), { autoAlpha: 0, y: 40 });
        gsap.set(section, { '--reveal': 0 });

        const setDot = (i: number) => dots.forEach((dot, j) => dot.classList.toggle('is-active', i === j));
        setDot(0);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: trackEl,
            start: 'top top',
            end: 'bottom bottom',
            pin: section,
            pinSpacing: false,
            scrub: 0.6,
            onUpdate: (self) => setDot(self.progress < 0.36 ? 0 : self.progress < 0.7 ? 1 : 2),
          },
        });
        tl.to(stages[0], { autoAlpha: 0, y: -40, duration: 0.3 }, 0.8)
          .to(section, { '--reveal': 0.35, duration: 0.8 }, 0.9)
          .to(stages[1], { autoAlpha: 1, y: 0, duration: 0.3 }, 1.1)
          .to(stages[1], { autoAlpha: 0, y: -40, duration: 0.3 }, 1.9)
          .to(section, { '--reveal': 1, duration: 0.9 }, 1.8)
          .to(stages[2], { autoAlpha: 1, y: 0, duration: 0.3 }, 2.3)
          .to({}, { duration: 0.4 }, 2.6);
        pin = tl.scrollTrigger;
      }, section);
      return () => {
        pin?.kill(true);
        ctx.revert();
      };
    },
    () => ({ matchMedia: '(prefers-reduced-motion: no-preference)', shouldResetOnResize: [document.body, 'horizontal'] }),
    []
  );

  // Cursor: a soft spotlight that trails the pointer (fine pointers only).
  useMotion(
    () => {
      const section = root.current;
      if (!section) return;
      const toX = gsap.quickTo(section, '--mx', { duration: 0.6, ease: 'power3.out' });
      const toY = gsap.quickTo(section, '--my', { duration: 0.6, ease: 'power3.out' });
      const move = (e: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        toX(e.clientX - rect.left);
        toY(e.clientY - rect.top);
      };
      const enter = (e: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        gsap.set(section, { '--mx': e.clientX - rect.left, '--my': e.clientY - rect.top });
        gsap.to(section, { '--spot': SPOT, duration: 0.6, ease: 'power3.out' });
      };
      const leave = () => gsap.to(section, { '--spot': 0, duration: 0.5, ease: 'power2.in' });
      section.addEventListener('pointermove', move);
      section.addEventListener('pointerenter', enter);
      section.addEventListener('pointerleave', leave);
      return () => {
        section.removeEventListener('pointermove', move);
        section.removeEventListener('pointerenter', enter);
        section.removeEventListener('pointerleave', leave);
        gsap.set(section, { '--spot': 0 });
      };
    },
    { matchMedia: '(pointer: fine) and (prefers-reduced-motion: no-preference)' },
    []
  );

  // px values for the gradient come from unitless variables so GSAP can tween them.
  const radius = `calc(var(--spot) * 1px + var(--reveal) * 160vmax)`;
  const mask = `radial-gradient(circle at calc(var(--mx) * 1px) calc(var(--my) * 1px), #000 ${radius}, transparent calc(${radius} + ${FEATHER}px))`;

  return (
    <div className="smooth-section">
      <div ref={track} className="relative" data-story-track="">
      <section
        ref={root}
        className="relative min-h-[max(100svh,600px)] overflow-hidden bg-black text-white"
        style={{ '--mx': 0, '--my': 0, '--spot': 0, '--reveal': 1 } as React.CSSProperties}
        data-story=""
        data-pointer-chaser-text="Reveal"
        aria-label={story.eyebrow}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={story.beforeImage} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" loading="lazy" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={story.afterImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          loading="lazy"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/75 via-black/30 to-transparent" role="none" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none bg-gradient-to-t from-black/70 to-transparent" role="none" />

        <div className="relative min-h-[max(100svh,600px)] flex flex-col justify-between gap-12 px-6 pt-[calc(var(--nav-space-top)+2rem)] pb-10 pointer-events-none">
          <div className="flex items-center justify-between">
            <Text variant="text-sm" className="uppercase tracking-[0.2em] text-gold-light">
              {story.eyebrow}
            </Text>
            <ol className="hidden sm:flex gap-3" aria-hidden>
              {story.stages.map((stage, i) => (
                <li key={stage.title} className="story-dot flex items-center gap-2 text-xs uppercase tracking-[0.15em]" data-story-dot="">
                  <span className="w-6 h-px bg-current" role="none" />0{i + 1}
                </li>
              ))}
            </ol>
          </div>

          <div className="relative md:w-7/12 lg:w-6/12 min-h-[18rem] flex flex-col gap-12" data-story-stages="">
            {story.stages.map((stage, i) => (
              <div key={stage.title} className="flex flex-col gap-5" data-story-stage={i}>
                <Text tag="h2" variant="headline-1" className="!leading-none" breakpoints={{ none: 'text-[2.25rem]' }}>
                  {stage.title}
                </Text>
                <Text variant="text-xl" className="text-white/85 max-w-xl">
                  {stage.text}
                </Text>
                {stage.tags.length > 0 && (
                  <ul className={cn('flex flex-wrap gap-2', i === 2 && 'pointer-events-auto')}>
                    {stage.tags.map((tag) => (
                      <li
                        key={tag}
                        className={cn(
                          'rounded-full border px-4 py-1.5 text-sm backdrop-blur-sm',
                          i === 0 ? 'border-[#ff8a3d]/60 text-[#ffb27a]' : 'border-white/50 text-white'
                        )}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <Text variant="text-sm" className="hidden [@media(pointer:fine)]:block text-white/60 uppercase tracking-[0.15em]">
            {story.hint}
          </Text>
        </div>
      </section>
      </div>
    </div>
  );
}
