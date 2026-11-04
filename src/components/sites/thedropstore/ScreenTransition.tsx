'use client';

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLatest } from '@/lib/dropstore/motion';
import { ScrollSmoother } from '@/lib/dropstore/gsap';
import { useUI } from './state';

export type TransitionPhase = 'idle' | 'leave' | 'enter';

interface TransitionContextValue {
  phase: TransitionPhase;
  navigate: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextValue>({ phase: 'idle', navigate: () => undefined });

export const useTransitionNavigate = () => useContext(TransitionContext).navigate;

/**
 * App Router replacement for the original `ScreenTransition`: internal link
 * clicks first run every `leave` handler for `screenTransitionDurationMS`,
 * then the route changes, `enter` handlers run, and finally `idle`.
 */
/** Scrolls to `#hash` below the navbar, through ScrollSmoother when it is active. */
export function scrollToHash(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  const nav = parseInt(getComputedStyle(document.body).getPropertyValue('--nav-space-top')) || 58;
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(target, true, `top ${nav}px`);
  else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - nav, behavior: 'smooth' });
}

function clearTimers(list: number[]) {
  list.forEach((t) => window.clearTimeout(t));
  list.length = 0;
}

export function ScreenTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ui] = useUI();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const pending = useRef<string | null>(null);
  const timers = useRef<number[]>([]);
  const durationRef = useLatest(ui.screenTransitionDurationMS);
  const [lastPath, setLastPath] = useState(pathname);

  // A route change (link or back/forward) starts the enter phase.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPhase('enter');
  }

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) {
        if (url.hash) scrollToHash(url.hash);
        return;
      }
      if (pending.current) return;
      pending.current = url.pathname + url.search + url.hash;
      // Start fetching the destination now so it is ready by the time the leave animation ends.
      router.prefetch(url.pathname + url.search);
      clearTimers(timers.current);
      setPhase('leave');
      timers.current.push(
        window.setTimeout(() => {
          router.push(pending.current!, { scroll: false });
        }, durationRef.current)
      );
    },
    [router, durationRef]
  );

  useEffect(() => {
    if (phase !== 'enter') return;
    pending.current = null;
    const timer = window.setTimeout(() => setPhase('idle'), durationRef.current);
    return () => window.clearTimeout(timer);
  }, [phase, pathname, durationRef]);

  // Warm the internal links on the page while the browser is idle, so clicks land instantly.
  useEffect(() => {
    const warm = () => {
      const hrefs = new Set<string>();
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
        const href = a.getAttribute('href')!;
        if (!/.[a-z0-9]+$/i.test(href.split('#')[0])) hrefs.add(href.split('#')[0]);
      });
      [...hrefs].slice(0, 24).forEach((href) => router.prefetch(href));
    };
    const timer = window.setTimeout(warm, 2500);
    return () => window.clearTimeout(timer);
  }, [router, pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || /\.[a-z0-9]+$/i.test(href.split('#')[0])) return;
      event.preventDefault();
      event.stopPropagation();
      navigate(href);
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [navigate]);

  useEffect(() => {
    const list = timers.current;
    return () => clearTimers(list);
  }, []);

  return (
    <TransitionContext.Provider value={{ phase, navigate }}>
      <div className="screen-transition" data-route-pathname={pathname} data-route-path={pathname}>
        {children}
      </div>
    </TransitionContext.Provider>
  );
}

type TransitionHandler = (element: HTMLElement, durationSeconds: number) => void;

/** Calls the handler matching the current transition phase, once per phase. */
export function useScreenTransition(handlers: { leave?: TransitionHandler; enter?: TransitionHandler; idle?: TransitionHandler }) {
  const { phase } = useContext(TransitionContext);
  const [ui] = useUI();
  const ref = useLatest(handlers);
  const prev = useRef<TransitionPhase | null>(null);

  useLayoutEffect(() => {
    const isMount = prev.current === null;
    if (prev.current === phase) return;
    prev.current = phase;
    // A page that mounts mid-leave must not run its own leave on arrival.
    if (isMount && phase === 'leave') return;
    const element = document.querySelector<HTMLElement>('.screen-transition')!;
    ref.current[phase]?.(element, ui.screenTransitionDurationMS / 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
}
