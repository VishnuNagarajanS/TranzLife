'use client';

import { DependencyList, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from './gsap';

type Cleanup = void | (() => void);

export interface MotionOptions {
  /** Only run while this media query matches; re-runs when it changes. */
  matchMedia?: string;
  /** Extra condition evaluated every time the motion is (re)created. */
  enable?: () => boolean;
  /** Re-create the motion when this element resizes on the given axis. */
  shouldResetOnResize?: [Element, ('horizontal' | 'vertical')?];
}

/**
 * Port of the original site's `Motion` helper: runs `create` when the media
 * query matches, tears it down when it stops matching, and rebuilds it on
 * resize (debounced) so layout-dependent tweens stay correct.
 */
export class Motion {
  private cleanup: Cleanup;
  private disposers: (() => void)[] = [];
  private resetTimer?: number;
  private frame?: number;
  private mql?: MediaQueryList;

  constructor(
    private create: ((motion: Motion) => Cleanup) | undefined,
    private options: MotionOptions = {}
  ) {
    if (options.matchMedia) {
      this.mql = matchMedia(options.matchMedia);
      const onChange = () => this.reset();
      this.mql.addEventListener('change', onChange);
      this.disposers.push(() => this.mql?.removeEventListener('change', onChange));
    }

    if (options.shouldResetOnResize) {
      const [element, axis] = options.shouldResetOnResize;
      let inline: number | undefined;
      let block: number | undefined;
      const observer = new ResizeObserver((entries) => {
        const entry = entries.find((e) => e.target === element);
        if (!entry) return;
        const { inlineSize, blockSize } = entry.borderBoxSize[0];
        const first = inline == null || block == null;
        const changedX = inlineSize !== inline;
        const changedY = blockSize !== block;
        inline = inlineSize;
        block = blockSize;
        if (first) return;
        if ((axis === 'horizontal' && changedX) || (axis === 'vertical' && changedY) || (!axis && (changedX || changedY))) {
          window.clearTimeout(this.resetTimer);
          this.resetTimer = window.setTimeout(() => this.reset(), 500);
        }
      });
      observer.observe(element);
      this.disposers.push(() => observer.disconnect());
    }

    this.cleanup = this.run();
  }

  private run(): Cleanup {
    const enabled = (this.options.enable?.() ?? true) && (this.mql?.matches ?? true);
    return enabled ? this.create?.(this) : undefined;
  }

  reset = () => {
    if (typeof this.cleanup === 'function') this.cleanup();
    this.cleanup = undefined;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      this.cleanup = this.run();
    });
  };

  destroy = () => {
    if (typeof this.cleanup === 'function') this.cleanup();
    this.cleanup = undefined;
    this.create = undefined;
    window.clearTimeout(this.resetTimer);
    if (this.frame) cancelAnimationFrame(this.frame);
    while (this.disposers.length) this.disposers.pop()?.();
  };
}

/** Ref that always holds the latest value, updated after render. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** React binding for `Motion`; recreated whenever `deps` change. */
export function useMotion(
  create: (motion: Motion) => Cleanup,
  options: MotionOptions | (() => MotionOptions) = {},
  deps: DependencyList = [],
  /** Wait a frame so portaled / late-mounted elements exist before querying. */
  deferred = false
) {
  const createRef = useLatest(create);

  useLayoutEffect(() => {
    let motion: Motion | undefined;
    const start = () => {
      motion = new Motion(
        (m) => createRef.current(m),
        typeof options === 'function' ? options() : options
      );
    };
    let frame: number | undefined;
    if (deferred) frame = requestAnimationFrame(start);
    else start();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      motion?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Subscribes a callback to the GSAP ticker: `(time, deltaTime) => void`. */
export function useTicker(callback: (time: number, deltaTime: number) => void) {
  const ref = useLatest(callback);
  useEffect(() => {
    const tick = (time: number, delta: number) => ref.current(time, delta);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [ref]);
}
