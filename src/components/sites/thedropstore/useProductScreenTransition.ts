'use client';

import { gsap } from '@/lib/dropstore/gsap';
import { ImageSequence } from '@/lib/dropstore/image-sequence';
import type { Product } from '@/lib/tranzlife-data';
import { useUI } from './state';
import { useScreenTransition } from './ScreenTransition';

/**
 * When leaving via a product tile (marked `[data-product-parent-active]` on
 * mousedown), clone that tile into the fixed foreground, grow it to fill the
 * viewport while its image sequence plays, then hand over to the product page.
 */
export function useProductScreenTransition(
  tweenVars?: { screenTransition?: gsap.TweenVars & { repeat?: number } },
  fromPath = '/'
) {
  const [ui] = useUI();

  useScreenTransition({
    leave(element, duration) {
      if (element.dataset.routePath !== fromPath || !ui.screenTransitionProduct) return;
      expandTile(ui.screenTransitionProduct, duration, tweenVars);
    },
  });
}

function expandTile(product: Product, duration: number, tweenVars?: { screenTransition?: gsap.TweenVars & { repeat?: number } }) {
  const tile = document.querySelector<HTMLElement>('[data-product-parent-active]');
  const parent = tile?.parentElement;
  if (!tile || !parent) return;

  const clone = parent.cloneNode(true) as HTMLElement;
  const gridTile = clone.querySelector<HTMLElement>('[data-products-view-grid-tile]');
  const productTile = gridTile?.querySelector<HTMLElement>('[data-product-tile]');
  const figure = gridTile?.querySelector<HTMLElement>('[data-image-sequence-id]');
  const sequenceId = figure?.dataset.imageSequenceId;
  const rect = parent.getBoundingClientRect();
  const styles = getComputedStyle(parent);
  const sequence = ImageSequence.instances.get(sequenceId ?? '');

  const scene = document.createElement('div');
  scene.setAttribute('id', 'screen-transition-scene');
  if (sequence) scene.setAttribute('data-image-sequence', sequence.id);
  gsap.set(scene, { position: 'fixed', inset: 0, width: '100vw', height: '100lvh' });

  const holder = document.createElement('div');
  holder.append(clone);

  if (sequence) {
    sequence.canvas = figure?.querySelector('canvas') ?? sequence.canvas;
    parent.querySelector('canvas')?.remove();
    figure?.querySelector('img')?.remove();
    sequence.setupCanvas();
    sequence.drawFrame(0, true);
  }

  gsap.set(holder, {
    position: 'absolute',
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  });
  if (productTile) productTile.style.backgroundColor = 'transparent';
  gridTile?.classList.add('rounded-xl', 'w-full', 'h-full');
  if (gridTile) gsap.set(gridTile, { borderRadius: styles.borderRadius, backgroundColor: product.tint });
  scene.append(holder);
  document.getElementById('fixed-foreground')?.prepend(scene);
  sequence?.drawFrame(0, true);

  requestAnimationFrame(() => {
    parent.dispatchEvent(new Event('kill-motion'));
    const vars = { ease: 'power4.inOut', duration };
    gsap.to(holder, { ...vars, left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0 });
    clone.classList.add('w-full', 'h-full');
    const info = gridTile?.querySelector('[data-product-tile-info]');
    if (info) gsap.to(info, { ...vars, opacity: 0, duration: 0.25 * duration });
    if (gridTile) gsap.to(gridTile, { ...vars, x: 0, y: 0, scale: 1, left: 0, top: 0 });
    gsap.to('[data-nav-background-color]', { ...vars, backgroundColor: product.tint });

    const repeat = tweenVars?.screenTransition?.repeat ?? 0;
    const loopDuration = duration / (repeat + 1);
    const tl = gsap.timeline({ paused: true });
    if (sequence) {
      const tween = sequence.createTween({ ...tweenVars?.screenTransition, ease: 'none', duration: loopDuration, paused: false });
      tl.add(tween, 0);
      gsap.to(tl, { progress: 1, duration: tween.totalDuration(), ease: 'power1.inOut' });
    }
    setTimeout(() => {
      sequence?.destroy();
      scene.remove();
    }, 1000 * duration);
  });
}
