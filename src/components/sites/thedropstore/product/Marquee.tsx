'use client';

import React, { useEffect, useId, useRef } from 'react';
import { gsap, ScrollSmoother } from '@/lib/dropstore/gsap';
import { useMotion, MotionOptions } from '@/lib/dropstore/motion';
import { headingFrom, headingTo } from '@/lib/dropstore/heading-tween';
import { useUI } from '../state';
import { ScreenTransitionHandlers } from './productUI';

type SmootherLike = { scrollTrigger?: { direction: number }; getVelocity(): number };

/**
 * Endless horizontal ticker: the content is cloned until it overflows the
 * container, then shifted every frame by the smooth-scroll direction plus the
 * scroll velocity, wrapping after one content width.
 */
function useMarquee(
  getTarget: () => string | HTMLElement,
  speed = 1.5,
  options: MotionOptions = {},
  onUpdate?: (progress: number) => void,
  onCreated?: () => void
) {
  const [ui] = useUI();

  useMotion(
    () => {
      const target = getTarget();
      let container: HTMLElement | null = null;
      if (typeof target === 'string') container = document.querySelector<HTMLElement>(target);
      else if (target instanceof HTMLElement) container = target;
      if (!container) {
        console.warn('Invalid marquee target:', target);
        return;
      }
      const inner = container.querySelector<HTMLElement>('.marquee-animate');
      const content = inner?.querySelector<HTMLElement>('.marquee-content');
      if (!inner || !content) {
        console.warn('Invalid marquee content:', { innerContainer: inner, content });
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      if (!contentRect.width) return;
      const maxWidth = containerRect.width + contentRect.width;
      const fragment = document.createDocumentFragment();
      const clones: HTMLElement[] = [];
      let width = contentRect.width;
      while (width <= maxWidth) {
        const clone = content.cloneNode(true) as HTMLElement;
        width += contentRect.width;
        clones.push(clone);
      }
      fragment.append(...clones);
      inner.append(fragment);

      const ctx = gsap.context(() => {
        gsap.set(inner, { x: 0, force3D: true });
        gsap.set(inner, { width });
      });
      const setX = gsap.utils.pipe(
        (v: number) => Math.floor(1000 * v) / 1000,
        gsap.quickSetter(inner, 'x', 'px') as (v: number) => void
      );
      const tick = (_time: number, deltaTime: number) => {
        const smoother = ScrollSmoother.get() as unknown as SmootherLike | undefined;
        const direction = smoother?.scrollTrigger?.direction ?? 0;
        const velocity = smoother?.getVelocity() ?? 0;
        const x = gsap.getProperty(inner, 'x') as number;
        const step = -(speed * gsap.ticker.deltaRatio() * direction);
        const wrapped = gsap.utils.wrap(0, -contentRect.width, x + (step + -((velocity / 1000) * deltaTime)));
        const progress = gsap.utils.normalize(0, -contentRect.width, wrapped);
        setX(wrapped);
        onUpdate?.(progress);
      };
      gsap.ticker.add(tick);
      onCreated?.();
      return () => {
        ctx.kill(true);
        gsap.ticker.remove(tick);
        while (clones.length) clones.pop()?.remove();
      };
    },
    () => {
      const target = getTarget();
      const element = typeof target === 'string' ? document.querySelector(target) : target;
      return {
        enable: () => !ui.isLoaderViewToggled,
        shouldResetOnResize: element ? [element, 'horizontal'] : undefined,
        ...options,
      };
    },
    [ui.isLoaderViewToggled]
  );
}

export function Marquee({
  children,
  speed,
  onUpdate,
  onCreated,
  withHeadingInTween,
}: {
  children: React.ReactNode;
  speed?: number;
  onUpdate?: (progress: number) => void;
  onCreated?: () => void;
  withHeadingInTween?: boolean;
}) {
  const id = useId();
  const [ui] = useUI();
  const tween = useRef<gsap.core.Tween>(undefined);

  useMarquee(() => `.marquee#${CSS.escape(id)}`, speed, {}, onUpdate, onCreated);

  useMotion(
    () => {
      const element = document.querySelector<HTMLElement>(`.marquee#${CSS.escape(id)} .marquee-animate`);
      if (!element) return;
      const height = element.offsetHeight;
      const ctx = gsap.context(() => {
        tween.current = gsap.fromTo(
          element,
          { ...headingFrom, y: height, transformOrigin: 'top left' },
          { ...headingTo, paused: true }
        );
      });
      return () => ctx.kill(true);
    },
    () => ({ enable: () => !!withHeadingInTween }),
    [withHeadingInTween]
  );

  useEffect(() => {
    tween.current?.paused(ui.isLoaderViewToggled);
  }, [ui.isLoaderViewToggled]);

  return (
    <>
      <ScreenTransitionHandlers
        leave={(_, duration) => {
          tween.current?.duration(duration / 2);
          tween.current?.reverse();
        }}
      />
      <div className="marquee w-full overflow-hidden" id={id}>
        <div className="marquee-animate flex flex-nowrap">
          <div className="marquee-content inline-flex">{children}</div>
        </div>
      </div>
    </>
  );
}
