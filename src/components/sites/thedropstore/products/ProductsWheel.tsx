'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/dropstore/gsap';
import { Product } from '@/lib/tranzlife-data';
import { useUI } from '../state';
import { useScreenTransition } from '../ScreenTransition';
import { LeafShadowBackdrop } from './LeafShadowBackdrop';
import { SPIN_FRAME_COUNT, SPIN_FRAME_SLUGS, getSpinSet, loadSpinSet, nearestFrame, type SpinSet } from './spinFrames';

/*
 * Product wheel: ten slots (the range, twice) stand on the rim of a large wheel, so the whole
 * wheel is one rotating element. Scrolling the pinned stage turns it a full circle with snapping
 * to each product, dragging turns it by hand, and the product at the top is the focused one:
 * larger, brighter, with its own caption and the wheel taking on its colour. Each jar also spins
 * on its own axis (turntable frames) as the wheel moves, and once more when hovered.
 */

const SLOTS = 10;
const STEP = 360 / SLOTS;
const SCROLL_TRAVEL_PX = 4000;
const SMOOTH = 14;
const SPIN_MS = 2600;
const DRAG_GAIN = 1.15;
const DRAG_THRESHOLD = 6;
const RING_TEXT = 'NATURE · SCIENCE · LIFE · ';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wrap180 = (x: number) => ((((x % 360) + 360) % 360) + 180) % 360 - 180;

const wheelColor = (accent: string) => `color-mix(in srgb, ${accent} 70%, var(--color-forest))`;

/** Open transition: a tint tile grows from the clicked jar to fill the screen while a copy of it flies to centre. */
function flyJar(el: HTMLElement, product: Product, stage: HTMLElement, duration: number) {
  const foreground = document.getElementById('fixed-foreground');
  if (!foreground) return;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const scene = document.createElement('div');
  scene.id = 'screen-transition-scene';
  gsap.set(scene, { position: 'fixed', inset: 0, width: '100vw', height: '100lvh', pointerEvents: 'none' });

  const tint = document.createElement('div');
  gsap.set(tint, { position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: size / 2, backgroundColor: product.tint, opacity: 0 });


  // PulmoClear spins through its turntable frames (front to back and round again) while it flies; the rest just lean.
  const spinSet = SPIN_FRAME_SLUGS.has(product.slug) ? getSpinSet(product.slug) : null;
  const spinning = !!spinSet && spinSet.width > 0;
  let jar: HTMLImageElement | HTMLCanvasElement;
  if (spinning && spinSet) {
    jar = document.createElement('canvas');
    jar.width = spinSet.width;
    jar.height = spinSet.height;
  } else {
    jar = document.createElement('img');
    jar.src = product.image;
    jar.alt = '';
  }
  gsap.set(jar, { position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, objectFit: 'contain' });

  scene.append(tint, jar);
  foreground.prepend(scene);
  el.style.visibility = 'hidden';
  stage.setAttribute('data-flying-out', 'true');

  const target = Math.min(window.innerHeight * 0.6, window.innerWidth * 0.48);
  const vars = { ease: 'power4.inOut', duration };
  // Lands leaning left by the same angle the product page starts at, so the hand-off is seamless.
  gsap.to(jar, { ...vars, rotation: -12 });
  if (spinning && spinSet) {
    const ctx = (jar as HTMLCanvasElement).getContext('2d');
    const first = nearestFrame(spinSet, 0);
    if (first && ctx) ctx.drawImage(first.image, 0, 0);
    const turn = { t: 0 };
    gsap.to(turn, {
      t: 1,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        const turns = 1 - Math.abs(turn.t * 2 - 1);
        const frame = nearestFrame(spinSet, Math.round(turns * (SPIN_FRAME_COUNT - 1)));
        if (frame && ctx) {
          ctx.clearRect(0, 0, spinSet.width, spinSet.height);
          ctx.drawImage(frame.image, 0, 0);
        }
      },
    });
  }
  gsap.to(jar, { ...vars, left: (window.innerWidth - target) / 2, top: (window.innerHeight - target) / 2, width: target, height: target });
  gsap.to(tint, { ...vars, opacity: 1, left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0 });
  gsap.to('[data-nav-background-color]', { ...vars, backgroundColor: product.tint });
  // The product page takes over this scene once its own image is up (so the jar never blinks); this is only a fallback.
  window.setTimeout(() => scene.remove(), duration * 1000 + 4000);
}

export function ProductsWheel({ products, ...rest }: { products: Product[] } & Record<string, unknown>) {
  const [, dispatch] = useUI();
  const [focus, setFocus] = useState(0);
  const flightSource = useRef<{ el: HTMLElement; product: Product } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const bottleRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const items = Array.from({ length: SLOTS }, (_, i) => products[i % products.length]);
  const current = items[focus];

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const drag = dragRef.current;
    const wheel = wheelRef.current;
    if (!wrapper || !stage || !drag || !wheel) return;

    const bottles = bottleRefs.current.slice(0, SLOTS);
    const canvases = canvasRefs.current.slice(0, SLOTS);
    const hoverMQ = window.matchMedia('(hover: hover) and (pointer: fine)');

    // Turntable frames arrive progressively; a slot spins with whatever has arrived.
    const sets: (SpinSet | null)[] = Array.from({ length: SLOTS }, () => null);
    const lastFrame = Array.from({ length: SLOTS }, () => -1);
    const spinStart = Array.from({ length: SLOTS }, () => -1);
    let cancelled = false;
    const attach = (slug: string, set: SpinSet) => {
      canvases.forEach((canvas, i) => {
        if (!canvas || items[i]?.slug !== slug || sets[i]) return;
        canvas.width = set.width;
        canvas.height = set.height;
        sets[i] = set;
        lastFrame[i] = -1;
      });
    };
    [...new Set(items.map((p) => p.slug))]
      .filter((slug) => SPIN_FRAME_SLUGS.has(slug))
      .forEach((slug) => {
        void loadSpinSet(slug, (set) => {
          if (!cancelled) attach(slug, set);
        });
        const existing = getSpinSet(slug);
        if (existing.width) attach(slug, existing);
      });

    // Layout
    let R = 600;
    const layout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw <= 600;
      R = Math.min(vw * (mobile ? 1.05 : 0.62), vh * 0.92);
      const bottle = Math.min(vh * 0.36, vw * (mobile ? 0.62 : 0.3)) * 1.2;
      stage.style.setProperty('--wheel-r', `${R}px`);
      stage.style.setProperty('--wheel-cy', `${vh * 0.64 + R}px`);
      stage.style.setProperty('--bottle-s', `${bottle}px`);
    };
    layout();

    // State
    let scrollA = 0;
    let dragA = 0;
    let cur = 0;
    let focusIdx = -1;
    let introStart = -1;
    let lastTime = performance.now();
    let raf = 0;
    let dragging = false;
    let moved = false;
    let pointerId = -1;
    let downX = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let hoverIndex = -1;

    let inView = true;
    const render = (now: number) => {
      const dt = Math.min(1 / 30, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      if (!inView) {
        raf = requestAnimationFrame(render);
        return;
      }
      // Follows scroll/drag directly; when the input stops, the wheel stops (no self-driven snapping).
      const total = scrollA + dragA;
      const target = total;
      cur += (target - cur) * (1 - Math.exp(-SMOOTH * dt));
      if (Math.abs(target - cur) < 0.01) cur = target;

      // The wheel is in place from the start and only turns with scroll or drag (no timed intro motion).
      wheel.style.opacity = '1';
      wheel.style.transform = `translate(-50%, -50%) rotate(${cur.toFixed(3)}deg)`;

      const f = ((Math.round(-cur / STEP) % SLOTS) + SLOTS) % SLOTS;
      if (f !== focusIdx) {
        focusIdx = f;
        wheel.style.backgroundColor = wheelColor(items[f].accent);
        setFocus(f);
      }

      bottles.forEach((el, i) => {
        if (!el) return;
        const delta = wrap180(i * STEP + cur);
        const near = clamp(Math.abs(delta) / 100, 0, 1);
        const scale = 1.16 - 0.4 * near * near;
        el.style.transform = `scale(${scale.toFixed(4)})`;
        el.style.visibility = Math.abs(delta) > 130 ? 'hidden' : 'visible';
        if (Math.abs(delta) > 130) return;

        // Hover: one more full turn of the jar on its own axis.
        if (hoverMQ.matches && i === hoverIndex && spinStart[i] < 0 && Math.abs(delta) < STEP / 2) spinStart[i] = now;
        let spin = 0;
        if (spinStart[i] >= 0) {
          const t = (now - spinStart[i]) / SPIN_MS;
          if (t >= 1) spinStart[i] = -1;
          else spin = easeInOutCubic(t);
        }
        const set = sets[i];
        if (!set) return;
        // Front-facing at the top; the jar turns away and back as it travels round the rim.
        const phase = Math.abs(delta) / 120 + spin * 2;
        const turns = 1 - Math.abs((((phase % 2) + 2) % 2) - 1);
        const idx = clamp(Math.floor(turns * SPIN_FRAME_COUNT), 0, SPIN_FRAME_COUNT - 1);
        const frame = nearestFrame(set, idx);
        if (frame && frame.index !== lastFrame[i]) {
          const ctx = canvases[i]?.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvases[i]!.width, canvases[i]!.height);
            ctx.drawImage(frame.image, 0, 0);
            lastFrame[i] = frame.index;
          }
        }
      });
      raf = requestAnimationFrame(render);
    };

    // Input
    const snapDrag = (extra = 0) => {
      dragA = Math.round((dragA + extra) / STEP) * STEP;
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        event.preventDefault();
        dragA -= (event.deltaX / R) * 57.3;
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => snapDrag(), 180);
      }
    };
    let wheelTimer = 0;
    const onPointerDown = (event: PointerEvent) => {
      dragging = false;
      moved = false;
      pointerId = event.pointerId;
      downX = event.clientX;
      lastX = event.clientX;
      lastT = event.timeStamp || performance.now();
      vel = 0;
      drag.dataset.down = 'true';
    };
    const onPointerMove = (event: PointerEvent) => {
      if (drag.dataset.down !== 'true' || event.pointerId !== pointerId) return;
      if (!dragging) {
        if (Math.abs(event.clientX - downX) <= DRAG_THRESHOLD) return;
        try {
          drag.setPointerCapture(event.pointerId);
        } catch {
          return;
        }
        dragging = true;
        moved = true;
        lastX = event.clientX;
        lastT = event.timeStamp || performance.now();
        return;
      }
      const dx = event.clientX - lastX;
      const now = event.timeStamp || performance.now();
      vel = vel * 0.7 + (dx / Math.max(1, now - lastT)) * 0.3;
      lastX = event.clientX;
      lastT = now;
      dragA += (dx / R) * 57.3 * DRAG_GAIN;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (pointerId !== -1 && event.pointerId !== pointerId) return;
      if (dragging) {
        try {
          drag.releasePointerCapture(event.pointerId);
        } catch {
          /* already released */
        }
        snapDrag(clamp(vel, -3, 3) * 40 * (57.3 / R) * 4);
      }
      vel = 0;
      dragging = false;
      pointerId = -1;
      delete drag.dataset.down;
    };

    // Registered before the app's link interceptor: swallow drag-ends, turn the wheel to a side
    // jar instead of opening it, and remember the opened jar for the transition.
    const onClickCapture = (event: MouseEvent) => {
      const hit = (event.target as Element | null)?.closest?.('.products-wheel__bottle, .products-wheel__cta') as HTMLElement | null;
      if (!hit || !stage.contains(hit)) return;
      if (moved) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      let index = focusIdx;
      if (hit.classList.contains('products-wheel__bottle')) {
        index = bottles.indexOf(hit as HTMLAnchorElement);
        const delta = wrap180(index * STEP + scrollA + dragA);
        if (Math.abs(delta) > STEP / 2) {
          event.preventDefault();
          event.stopPropagation();
          dragA -= Math.round(delta / STEP) * STEP;
          return;
        }
      }
      const product = items[index];
      const source = bottles[index];
      if (!product || !source) return;
      flightSource.current = { el: source, product };
      dispatch({ type: 'setProductScreenTransition', payload: product });
    };

    const pin = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
      pinSpacing: false,
      onUpdate: (self) => {
        scrollA = -self.progress * 360;
      },
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (entry.isIntersecting && introStart < 0) {
          introStart = performance.now() + 120;
          stage.setAttribute('data-ready', 'true');
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(stage);

    const enters = bottles.map((el, i) => {
      const enter = () => {
        hoverIndex = i;
      };
      const leave = () => {
        if (hoverIndex === i) hoverIndex = -1;
      };
      el?.addEventListener('pointerenter', enter);
      el?.addEventListener('pointerleave', leave);
      return () => {
        el?.removeEventListener('pointerenter', enter);
        el?.removeEventListener('pointerleave', leave);
      };
    });

    window.addEventListener('resize', layout);
    window.addEventListener('click', onClickCapture, true);
    drag.addEventListener('wheel', onWheel, { passive: false });
    drag.addEventListener('pointerdown', onPointerDown);
    drag.addEventListener('pointermove', onPointerMove);
    drag.addEventListener('pointerup', onPointerUp);
    drag.addEventListener('pointercancel', onPointerUp);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(wheelTimer);
      cancelled = true;
      pin.kill();
      observer.disconnect();
      enters.forEach((fn) => fn());
      window.removeEventListener('resize', layout);
      window.removeEventListener('click', onClickCapture, true);
      drag.removeEventListener('wheel', onWheel);
      drag.removeEventListener('pointerdown', onPointerDown);
      drag.removeEventListener('pointermove', onPointerMove);
      drag.removeEventListener('pointerup', onPointerUp);
      drag.removeEventListener('pointercancel', onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  useScreenTransition({
    leave(_, duration) {
      const source = flightSource.current;
      const stage = stageRef.current;
      if (!source || !stage) return;
      flyJar(source.el, source.product, stage, duration);
    },
  });

  return (
    <div ref={wrapperRef} id="products" data-products-view="" style={{ height: `calc(100svh + ${SCROLL_TRAVEL_PX}px)` }} {...rest}>
      <section ref={stageRef} className="products-wheel" data-ready="false">
        <LeafShadowBackdrop />
        <h2 className="products-wheel__heading">Five formulations. One root.</h2>

        <div ref={dragRef} className="products-wheel__drag">
          <div
            ref={wheelRef}
            className="products-wheel__disc"
            style={{ backgroundColor: wheelColor(items[0].accent) }}
          >
            <svg viewBox="0 0 1000 1000" className="products-wheel__ring" aria-hidden="true">
              <defs>
                <path id="products-wheel-ring" d="M 500 500 m -430 0 a 430 430 0 1 1 860 0 a 430 430 0 1 1 -860 0" />
              </defs>
              <text fill="var(--color-gold-light)" fontSize="78" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                <textPath href="#products-wheel-ring" textLength="2700" lengthAdjust="spacing">
                  {RING_TEXT}
                </textPath>
              </text>
            </svg>

            {items.map((product, i) => (
              <div key={`${product.id}-${i}`} className="products-wheel__slot" style={{ transform: `rotate(${i * STEP}deg)` }}>
                <a
                  ref={(el) => {
                    bottleRefs.current[i] = el;
                  }}
                  href={`/products/${product.slug}`}
                  aria-label={product.title}
                  draggable={false}
                  className="products-wheel__bottle"
                  data-product-tile={product.slug}
                >
                  {SPIN_FRAME_SLUGS.has(product.slug) ? (
                    <canvas
                      ref={(el) => {
                        canvasRefs.current[i] = el;
                      }}
                      role="img"
                      aria-label={product.title}
                      className="products-wheel__art"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt={product.title} draggable={false} className="products-wheel__art products-wheel__art--flat" />
                  )}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="products-wheel__caption" aria-live="polite">
          <p className="products-wheel__kicker">{current.focus}</p>
          <h3 key={current.id} className="products-wheel__title">
            {current.title}
          </h3>
          <p className="products-wheel__sub">{current.subtitle}</p>
          <a href={`/products/${current.slug}`} className="products-wheel__cta">
            <span className="products-wheel__cta-dot" />
            Discover the product
          </a>
          <p className="products-wheel__hint">Drag the wheel · pick a jar · scroll to explore</p>
        </div>
      </section>
    </div>
  );
}
