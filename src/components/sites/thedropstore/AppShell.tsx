'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gsap, ScrollSmoother, isTouchDevice, REFERENCE_FRAME_TIME, normalizeToDeltaRatio } from '@/lib/dropstore/gsap';
import { useMotion } from '@/lib/dropstore/motion';
import { Pointer } from '@/lib/dropstore/pointer';
import { blobHdriFiles } from '@/lib/dropstore/blob';
import { cn } from '@/lib/utils';
import { Providers, useUI, usePreloader, DEFAULT_POINTER_SIZE } from './state';
import { ScreenTransitionProvider } from './ScreenTransition';
import { LogoMark } from './Logo';

/* ------------------------------------------------------------ Loader --- */

function LoaderView() {
  const [ui, dispatch] = useUI();
  const { isLoading, preload } = usePreloader();

  // The blob's environment map is needed on every page, so it gates the loader app-wide.
  useEffect(() => preload(blobHdriFiles, 'hdri'), [preload]);
  const [isCovering, setIsCovering] = useState(true);
  const state = useState(() => ({ percentage: 0 }))[0];
  const timeline = useRef<gsap.core.Timeline>(null);
  const output = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsCovering(false));
    return () => cancelAnimationFrame(frame);
  }, []);

  // The logo grows from the roots up (infinity first, then the tree), then the page appears.
  useMotion(() => {
    const tl = (timeline.current = gsap.timeline({
      delay: 0.4,
      onUpdate() {
        if (output.current) output.current.innerHTML = Math.round(state.percentage) + '%';
      },
    }));
    tl.fromTo('[data-loading-view]', { y: 50 }, { y: 0 }, 0);
    tl.to(state, { percentage: 35, duration: 0.8, ease: 'power1.out' }, 0);
    tl.fromTo(
      '[data-loader-logo]',
      { clipPath: 'inset(100% 0% 0% 0%)', scale: 0.92 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.6, ease: 'power3.inOut' },
      0
    );
    tl.from('[data-loader-wordmark]', { opacity: 0, y: 10, duration: 0.6, ease: 'power2.out' }, 1.2);
    return () => {
      tl.revert().kill();
    };
  });

  useEffect(() => {
    const tl = timeline.current;
    if (isLoading || !tl) return;
    // Finish the bar once both the intro and the asset loading are done.
    const finish = gsap.to(state, {
      percentage: 100,
      ease: 'power1.in',
      duration: 0.5,
      delay: Math.max(0, tl.duration() - tl.totalTime() + (tl.totalTime() === 0 ? tl.delay() : 0)),
      onUpdate() {
        if (output.current) output.current.innerHTML = Math.round(state.percentage) + '%';
      },
      onComplete: () => dispatch({ type: 'toggleLoaderView', payload: false }),
    });
    return () => void finish.kill();
  }, [isLoading, dispatch, state]);

  return (
    <>
      {isCovering && <div className="fixed inset-0 bg-white h-[200vh] z-50" role="none" style={{ pointerEvents: 'all' }} />}
      <div
        className={cn('fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white loader-view', !ui.isLoaderViewToggled && 'loader-view--hidden')}
        style={{ pointerEvents: ui.isLoaderViewToggled ? 'all' : 'none', transitionDuration: '0.8s' }}
        role="none"
      >
        <div data-loader-logo="">
          <LogoMark size="large" className="w-44 sm:w-56 h-auto" />
        </div>
        <div className="flex flex-col items-center" data-loader-wordmark="">
          <span className="font-wordmark text-4xl font-semibold uppercase">
            <span className="text-[#1E5A2B]">Tranz</span>
            <span className="text-[#E09A1A]">Life</span>
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#C98A12]">Biosciences</span>
          <span className="pt-1 text-xs text-gray-800">Innovating Life Beyond Limits</span>
        </div>
      </div>
      <div
        className={cn(
          'fixed w-screen bottom-0 flex justify-between items-center px-6 py-4 pointer-events-none z-50 loader-view',
          !ui.isLoaderViewToggled && 'loader-view--hidden'
        )}
        aria-live="polite"
        aria-busy={isLoading}
        data-loading-view=""
      >
        <div data-loading-text="">From the roots of nature</div>
        <div ref={output} role="progressbar">
          0%
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------------------- Pointer chaser --- */

const CHASER_EASE = 'power4.inOut';
const CHASER_DAMPING = 0.15;

/**
 * Small black dot that lags behind the cursor, with a label read from the
 * hovered element's `data-pointer-chaser-text` and size from `data-pointer-chaser-size`.
 */
function PointerChaser() {
  const [ui, dispatch] = useUI();
  const visual = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const prevText = useRef<string | undefined>(undefined);
  const enabled = useSyncExternalStore(
    () => () => undefined,
    () => !matchMedia('(pointer: coarse)').matches,
    () => false
  );

  useEffect(() => {
    if (!enabled || !root.current) return;
    const pointer = Pointer.instance;
    const element = root.current;
    const setX = gsap.quickSetter(element, 'x', 'px');
    const setY = gsap.quickSetter(element, 'y', 'px');
    let x = pointer.clientX;
    let y = pointer.clientY;
    const update = () => {
      x = gsap.utils.interpolate(x, pointer.clientX, normalizeToDeltaRatio(CHASER_DAMPING));
      y = gsap.utils.interpolate(y, pointer.clientY, normalizeToDeltaRatio(CHASER_DAMPING));
      setX(x);
      setY(y);
    };
    gsap.ticker.add(update);

    const fadeIn = gsap.to(element, { opacity: 1, duration: 1, paused: true });
    let lastRead = 0;
    const unsubscribe = pointer.subscribe((event) => {
      if (!fadeIn.progress()) {
        x = pointer.clientX;
        y = pointer.clientY;
        fadeIn.play();
      }
      const now = performance.now();
      if (now - lastRead < REFERENCE_FRAME_TIME) return;
      lastRead = now;
      const target = event.target as Element | null;
      const label = target?.getAttribute?.('data-pointer-chaser-text') ?? '';
      const size = parseInt(target?.getAttribute?.('data-pointer-chaser-size') ?? String(DEFAULT_POINTER_SIZE));
      dispatch({ type: 'setPointerText', payload: label });
      dispatch({ type: 'setPointerSize', payload: Number.isNaN(size) ? DEFAULT_POINTER_SIZE : size });
    });

    return () => {
      gsap.ticker.remove(update);
      unsubscribe();
      fadeIn.revert().kill();
    };
  }, [enabled, dispatch]);

  useEffect(() => {
    const output = text.current;
    if (!output) return;
    const tl = gsap.timeline();
    const lineHeight = parseFloat(getComputedStyle(output).lineHeight) || 16;
    if (prevText.current) {
      tl.to(output, { y: lineHeight, duration: 0.3, ease: CHASER_EASE, onComplete: () => void (output.innerText = ui.pointerText) });
    }
    if (ui.pointerText) {
      tl.to(output, { y: 0, duration: 0.3, ease: CHASER_EASE, onStart: () => void (output.innerText = ui.pointerText) });
    }
    prevText.current = ui.pointerText;
    return () => void tl.kill();
  }, [ui.pointerText]);

  useEffect(() => {
    if (visual.current) gsap.to(visual.current, { width: ui.pointerSize, height: ui.pointerSize, duration: 0.2, ease: 'power1.inOut' });
  }, [ui.pointerSize]);

  if (!enabled) return null;

  return (
    <div ref={root} className="fixed left-0 top-0" data-pointer-chaser="" role="none" style={{ pointerEvents: 'none', opacity: 0, zIndex: 10 }}>
      <div
        ref={visual}
        className="absolute flex flex-col justify-center bg-black rounded-full"
        data-pointer-chaser-visual=""
        style={{ width: DEFAULT_POINTER_SIZE, height: DEFAULT_POINTER_SIZE, transform: 'translate(-50%, -50%)' }}
      />
      <span className="absolute left-4 text-xs overflow-hidden w-screen" style={{ top: '-0.6em' }} data-pointer-chaser-text-container="">
        <span ref={text} className="inline-block whitespace-nowrap uppercase" data-pointer-chaser-text-output="" />
      </span>
    </div>
  );
}

/* -------------------------------------------------------------- Shell --- */

function SmoothScroll() {
  useLayoutEffect(() => {
    if (isTouchDevice() || ScrollSmoother.get()) return;
    ScrollSmoother.create({ wrapper: '#smooth-container', content: '#smooth-content', effects: true, smooth: 0.5 });
  }, []);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <canvas id="blob-canvas" className="fixed inset-0 w-screen h-screen pointer-events-none z-[-1]" />
      <div id="fixed-background" data-page-layout-fixed-back="" className="fixed inset-0 pointer-events-none" />
      <div id="smooth-container">
        <div id="smooth-content">
          <ScreenTransitionProvider>{children}</ScreenTransitionProvider>
        </div>
      </div>
      <div id="fixed-foreground" data-page-layout-fixed-front="" className="fixed inset-0 h-screen pointer-events-none z-50" />
      <div
        id="cart-overview"
        style={{ paddingBottom: 'calc(100lvh - 100svh)' }}
        className="fixed inset-0 h-screen h-[100lvh] z-[999] pointer-events-none"
      />
      <div
        id="mobile-menu"
        style={{ paddingBottom: 'calc(100lvh - 100svh)' }}
        className="fixed inset-0 h-screen h-[100lvh] z-[999] pointer-events-none"
      />
      <SmoothScroll />
      <LoaderView />
      <PointerChaser />
    </Providers>
  );
}
