'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';

export const isClient = typeof window !== 'undefined';

if (isClient) {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText);
}

export const isTouchDevice = () => isClient && matchMedia('(pointer: coarse)').matches;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

export const REFERENCE_FRAME_RATE = 60;
export const REFERENCE_FRAME_TIME = 1000 / REFERENCE_FRAME_RATE;

/** Scales a per-frame lerp factor so motion speed is independent of the refresh rate. */
export function normalizeToDeltaRatio(value: number) {
  return value * gsap.ticker.deltaRatio(REFERENCE_FRAME_RATE);
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };
