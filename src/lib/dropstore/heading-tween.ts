'use client';

import { useState } from 'react';
import { gsap, SplitText } from './gsap';
import { useMotion, MotionOptions } from './motion';

export const headingFrom = { y: 16, rotate: '3deg' };
export const headingTo = {
  y: 0,
  rotate: '0deg',
  transformOrigin: 'top left',
  duration: 1.8,
  ease: 'power4.inOut',
  stagger: { each: 0.08 },
};

type VarsArg = gsap.TweenVars | ((lineHeight: number) => gsap.TweenVars);

/**
 * Splits `element` into lines twice: the outer lines become overflow masks and
 * the inner lines slide up from one line-height below with a slight rotation.
 */
export function createHeadingInTween(
  element: HTMLElement,
  fromVars: VarsArg = {},
  toVars: VarsArg = {},
  splitVars: Partial<SplitText.Vars> = {}
) {
  const preSplit = new SplitText(element, { type: 'lines', ...splitVars });
  const split = new SplitText(preSplit.lines, { type: 'lines', ...splitVars });
  const styles = getComputedStyle(element);
  const parsed = parseFloat(styles.lineHeight);
  const lineHeight = Number.isNaN(parsed) ? headingFrom.y : parsed;
  const from = typeof fromVars === 'function' ? fromVars(lineHeight) : fromVars;
  const to = typeof toVars === 'function' ? toVars(lineHeight) : toVars;
  // Tight line heights would let the mask clip descenders (g, y, p): extend each mask
  // below the line and pull the next line back up so the layout is unchanged.
  const descender = 0.2 * (parseFloat(styles.fontSize) || 0);
  const hidden = lineHeight + descender;

  gsap.set(preSplit.lines, { overflow: 'hidden', paddingBottom: descender, marginBottom: -descender });
  gsap.set(split.lines, {
    transformOrigin: 'top left',
    y: (to as { reversed?: boolean }).reversed ? 0 : hidden,
  });
  const tween = gsap.fromTo(split.lines, { ...headingFrom, y: hidden, ...from }, { ...headingTo, ...to });
  return { preSplit, split, tween, lineHeight };
}

export function useHeadingInTween(
  target: string | HTMLElement,
  fromVars: VarsArg = {},
  toVars: VarsArg = {},
  options: MotionOptions = {}
) {
  const [tween, setTween] = useState<gsap.core.Tween>();

  useMotion(
    () => {
      const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
      if (!element) return;
      const result = createHeadingInTween(element, fromVars, toVars);
      setTween(result.tween);
      return () => {
        result.tween.revert().kill();
        result.split.revert();
        result.preSplit.revert();
        setTween(undefined);
      };
    },
    () => ({ shouldResetOnResize: [document.body, 'horizontal'], ...options }),
    []
  );

  return tween;
}
