'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, breakpoints } from '@/lib/dropstore/gsap';
import { MotionOptions, useMotion, useTicker } from '@/lib/dropstore/motion';
import { createHeadingInTween } from '@/lib/dropstore/heading-tween';
import { ImageSequence } from '@/lib/dropstore/image-sequence';
import { useBlobChasing } from '@/lib/dropstore/blob';
import type { Product } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { PageLayout } from '../PageLayout';
import { SocialsSection } from '../sections';
import type { ImageSequenceViewProps } from '../ProductTile';
import { useUI } from '../state';
import { EnquireButton } from './EnquireButton';
import { FocusSection } from './FocusSection';
import { ProductDecorationsTopLeft, ProductDecorationsTopRight } from './ProductDecorations';
import {
  ProductCommerceSection,
  ProductDetailSection,
  ProductHeroSection,
  ProductHowToUseSection,
  ProductMoreSection,
  ProductNatureSection,
  ProductProgrammeSection,
  ProductPromotionSection,
  ProductReviewSection,
  ProductVariantSection,
} from './ProductSections';
import { ProductUIProvider, ScreenTransitionHandlers, useIsomorphicLayoutEffect, useProductLook, useProductUI } from './productUI';

type ProductWithTweenVars = Product & { tweenVars?: { scrollTimeline?: gsap.TweenVars; screenTransition?: gsap.TweenVars } };

/** Remembers the href of the last clicked internal link (the transition's destination). */
function useLastClickedHref() {
  const href = useRef<string | null>(null);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (anchor) href.current = new URL(anchor.href, location.href).pathname;
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, []);
  return href;
}

function ProductPageContent({ product }: { product: ProductWithTweenVars }) {
  const root = useRef<HTMLDivElement>(null);
  const blobTrigger = useRef<ScrollTrigger>(undefined);
  const [, dispatch] = useUI();
  const [, dispatchProductUI] = useProductUI();
  const getBlob = useBlobChasing();
  const destination = useLastClickedHref();
  const look = useProductLook(product);

  // Page accent follows the product (or the selected Craving Control variant).
  useEffect(() => {
    const html = document.documentElement;
    html.style.setProperty('--accent', look.color);
    html.style.setProperty('--tint', look.tint);
  }, [look.color, look.tint]);
  useEffect(
    () => () => {
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--tint');
    },
    []
  );

  /*
   * The image sequence scrubs with the page from `sm` up (the original swaps
   * these props in from a deferred motion; ImageSequenceView re-creates its
   * tween when they change — here the same gating is expressed through the
   * sequence's own motion options so the tween is (re)built at the same time).
   */
  const imageSequenceProps = useRef<Partial<ImageSequenceViewProps>>({
    motion: {
      matchMedia: `(min-width: ${breakpoints.sm})`,
      get shouldResetOnResize() {
        return [document.body, 'vertical'];
      },
    } as MotionOptions,
    tween: (sequence) => ({
      ...product.tweenVars?.scrollTimeline,
      paused: true,
      duration: sequence.duration,
      scrollTrigger: {
        trigger: '[data-product]',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    }),
  }).current;

  // Blob is visible from the nature section on (to the page end on lg+).
  useIsomorphicLayoutEffect(() => {
    const query = matchMedia(`(min-width: ${breakpoints.lg})`);
    const create = (mql: MediaQueryList) => {
      blobTrigger.current?.kill();
      const isLarge = mql.matches;
      blobTrigger.current = ScrollTrigger.create({
        trigger: '[data-product-nature-section]',
        start: 'top bottom',
        endTrigger: isLarge ? 'html' : undefined,
        end: isLarge ? 'bottom top' : 'bottom 50%',
        onToggle(self) {
          if (getBlob().blob) gsap.to(getBlob().blob.material, { opacity: self.isActive ? 1 : 0, duration: 0.5 });
        },
      });
      return () => {
        gsap.to(getBlob().blob.material, { opacity: 0, duration: 0.5 });
      };
    };
    let cleanup = create(query);
    const onChange = () => {
      cleanup = create(query);
    };
    query.addEventListener('change', onChange);
    return () => {
      cleanup?.();
      query.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => () => blobTrigger.current?.kill(), []);

  useTicker(() => {
    const trigger = blobTrigger.current;
    if (!trigger || !trigger.isActive) return;
    const { renderer, scene, camera } = getBlob();
    renderer.render(scene, camera);
  });

  useTicker(() => {
    const uniforms = getBlob().blob.material.uniforms;
    uniforms.uTime.value += (blobTrigger.current?.getVelocity() ?? 0) * 5e-5;
  });

  // Product image pinned over the whole product block (md+).
  useMotion(
    () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({ trigger: '[data-product]', pin: '[data-product-image]', start: 'top top', end: 'bottom bottom' });
      });
      return () => {
        ctx.revert();
        ctx.kill();
      };
    },
    () => ({ matchMedia: `(min-width: ${breakpoints.md})` }),
    [],
    true
  );

  // Only the decorations are pinned between sm and md.
  useMotion(
    () => {
      const trigger = ScrollTrigger.create({ trigger: '[data-product]', pin: '[data-decorations]', start: 'top top', end: 'bottom bottom' });
      return () => {
        trigger.kill();
      };
    },
    () => ({ matchMedia: `(min-width${breakpoints.sm}) and (max-width: ${parseInt(breakpoints.md) - 1 + 'px'})` }),
    []
  );

  // Hand-off from the home page tile expansion: drop its fixed scene.
  useMotion(
    () => {
      const scene = document.getElementById('screen-transition-scene');
      const sequenceId = scene?.dataset.imageSequence;
      scene?.remove();
      if (sequenceId) ImageSequence.instances.get(sequenceId)?.destroy();
    },
    () => ({ matchMedia: `(min-width: ${breakpoints.sm})`, shouldResetOnResize: [document.body, 'vertical'] }),
    [],
    true
  );

  // Touch: the fixed add-to-cart button follows the product block.
  useMotion(
    () => {
      const button = document.querySelector('[data-add-to-cart-button="pointer-coarse"]');
      const vars = { duration: 0.3, delay: 0.3, ease: 'power2.easeOut' };
      const trigger = ScrollTrigger.create({
        trigger: '[data-product]',
        start: 'top bottom',
        end: 'bottom bottom',
        onEnter() {
          gsap.set(button, { display: 'flex' });
        },
        onEnterBack() {
          gsap.fromTo(button, { pointerEvents: 'all', opacity: 0, y: 20 }, { opacity: 1, y: 0, ...vars });
        },
        onLeave() {
          gsap.to(button, { opacity: 0, ...vars, ease: 'power2.easeIn', delay: 0 });
        },
      });
      return () => {
        trigger.kill();
      };
    },
    { matchMedia: '(pointer: coarse)' },
    []
  );

  useMotion(
    () => {
      const button = document.querySelector('[data-add-to-cart-button="pointer-fine"]');
      const set = gsap.set(button, { display: 'flex' });
      return () => void set.revert().kill();
    },
    { matchMedia: '(pointer: fine)' },
    []
  );

  // The button shows the price once the hero is half scrolled away.
  useMotion(
    () => {
      const trigger = ScrollTrigger.create({
        trigger: '[data-product-hero-section]',
        start: 'top bottom',
        end: 'bottom 50%',
        onToggle: (self) => dispatchProductUI({ type: 'setDoShowAddToCartPrice', payload: !self.isActive }),
      });
      return () => trigger.kill();
    },
    {},
    []
  );

  // The original passes this ref to PageLayout's root (`div.flex.flex-col.min-h-screen`).
  useIsomorphicLayoutEffect(() => {
    root.current?.closest('main')?.parentElement?.setAttribute('data-exiting', 'fade');
  }, []);

  return (
    <PageLayout
      pageNavigationProps={{ borderColor: 'var(--color-gray-300)', backgroundColor: look.tint }}
      append={
        <div
          className="hidden fixed flex justify-center bottom-6 w-full px-6 sm:px-36 z-30"
          data-add-to-cart-button="pointer-coarse"
          data-loaded-in="-y"
        >
          <EnquireButton product={product} />
        </div>
      }
    >
      <ScreenTransitionHandlers
        enter={() => {
          dispatch({ type: 'setProductScreenTransition', payload: undefined });
        }}
        leave={(_, duration) => {
          if (destination.current !== '/about') {
            const { blob, renderer, scene, camera } = getBlob();
            gsap.to(blob.material, {
              opacity: 0,
              duration,
              onUpdate() {
                renderer.render(scene, camera);
              },
            });
          }
          const title = createHeadingInTween(document.querySelector<HTMLElement>('[data-product-nature-section-title]')!);
          const description = createHeadingInTween(document.querySelector<HTMLElement>('[data-product-nature-section-description]')!);
          const amount = createHeadingInTween(document.querySelector<HTMLElement>('[data-product-nature-section-amount]')!, {}, { delay: 0.2 });
          title.tween.reverse(title.tween.duration());
          description.tween.reverse(description.tween.duration());
          amount.tween.reverse(amount.tween.duration());
        }}
      />
      <div ref={root} className="smooth-section">
        <div>
          <div
            className={cn('relative flex flex-col gap-y-6 transition-[background-color] duration-700')}
            style={{ backgroundColor: look.tint }}
            data-product={product.id}
          >
            <ProductCommerceSection product={product} imageSequenceProps={imageSequenceProps} />
            <ProductHeroSection product={product} smooth={false} />
            <ProductDetailSection product={product} smooth={false} />
            {product.variants && <ProductVariantSection product={product} smooth={false} />}
            <ProductPromotionSection product={product} smooth={false} />
            <ProductHowToUseSection product={product} smooth={false} />
            <ProductReviewSection product={product} smooth={false} />
            <ProductDecorationsTopLeft />
            <ProductDecorationsTopRight />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-6 pt-6">
        <ProductNatureSection product={product} />
        <ProductProgrammeSection product={product} />
        <FocusSection type={product.focus} />
        <ProductMoreSection product={product} />
        <SocialsSection />
      </div>
    </PageLayout>
  );
}

export function ProductPage({ product }: { product: Product }) {
  return (
    <ProductUIProvider>
      <ProductPageContent product={product} />
    </ProductUIProvider>
  );
}
