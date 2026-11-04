'use client';

import React, { Fragment, useRef } from 'react';
import { gsap, ScrollTrigger, breakpoints } from '@/lib/dropstore/gsap';
import { useLatest, useMotion, useTicker } from '@/lib/dropstore/motion';
import { useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { useBlobChasing } from '@/lib/dropstore/blob';
import { siteData } from '@/lib/tranzlife-data';
import { PageLayout, SideLabel } from '@/components/sites/thedropstore/PageLayout';
import { ProductsWheel } from './ProductsWheel';
import { Button } from '@/components/sites/thedropstore/Button';
import { Text } from '@/components/sites/thedropstore/Text';
import { Icon } from '@/components/sites/thedropstore/Icon';
import { useUI } from '@/components/sites/thedropstore/state';
import { scrollToHash, useScreenTransition } from '@/components/sites/thedropstore/ScreenTransition';

function FixedBack() {
  return (
    <>
      <div className="hidden absolute top-0 left-6 bottom-0 w-8 sm:flex justify-center items-center overflow-hidden">
        <div className="-rotate-90" role="none" data-loaded-in="x" data-entered-in="x" data-exiting="x">
          <SideLabel />
        </div>
      </div>
      <div className="hidden absolute top-0 right-6 bottom-0 w-6 sm:flex justify-center items-center overflow-hidden">
        <div className="flex flex-col gap-3 text-gold" role="none">
          <div data-loaded-in="-x" data-entered-in="-x" data-exiting="-x">
            <Icon name="infinity" className="w-5 h-5" />
          </div>
          <div data-loaded-in="-x" data-entered-in="-x" data-exiting="-x">
            <Icon name="leaf" className="w-4 h-4 mx-auto" />
          </div>
        </div>
      </div>
    </>
  );
}

// The blob may not exist yet when a scroll trigger fires on creation (restored scroll position).
const fadeBlob = (getBlob: ReturnType<typeof useBlobChasing>, opacity: number) => {
  const { blob } = getBlob();
  if (blob) gsap.to(blob.material, { opacity, duration: 0.5, ease: 'power2.inOut' });
};

/** `/products`: the original Drop Store home — pinned headline with the five floating tiles. */
export function ProductsIndex() {
  const { productsPage: home, products } = siteData;
  const heading = useHeadingInTween('h1 span');
  const [ui] = useUI();
  const getBlob = useBlobChasing();
  const headingRef = useLatest(heading);

  // Draw while the blob is visible, plus one last frame to clear it once it has faded out.
  const blobDrawn = useRef(true);
  const blobTick = useRef(0);
  useTicker(() => {
    const { blob, renderer, scene, camera } = getBlob();
    if (!blob) return;
    const visible = blob.material.opacity > 0.002;
    if (!visible && !blobDrawn.current) return;
    // 30fps is plenty for the soft orb and halves the GPU work while the page scrolls.
    if (visible && blobTick.current++ % 2) return;
    blobDrawn.current = visible;
    renderer.render(scene, camera);
  });

  useMotion(() => void fadeBlob(getBlob, 1), { enable: () => !ui.isLoaderViewToggled }, [ui.isLoaderViewToggled]);

  // Hide the blob once the carousel reaches the top.
  useMotion(
    () => {
      const trigger = ScrollTrigger.create({
        trigger: '[data-products-view]',
        start: 'top top',
        endTrigger: 'html',
        end: 'bottom bottom',
        onEnter: () => fadeBlob(getBlob, 0),
        onLeaveBack: () => fadeBlob(getBlob, 1),
      });
      return () => trigger.kill();
    },
    { matchMedia: `(min-width: ${breakpoints.sm})` },
    []
  );

  // Fade the "Meet the five" CTA while the product grid crosses the viewport centre.
  useMotion(() => {
    const trigger = ScrollTrigger.create({
      trigger: '[data-products-view]',
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) =>
        gsap.to('[data-act-now-cta]', {
          opacity: self.isActive ? 0 : 1,
          pointerEvents: self.isActive ? 'none' : 'all',
          duration: 0.3,
          ease: 'power1.out',
        }),
    });
    return () => trigger.kill();
  });

  useScreenTransition({
    leave(_, duration) {
      const tween = headingRef.current;
      if (tween) {
        tween.duration(duration / 2);
        tween.reverse();
      }
    },
  });

  const pointerText = ui.isLoaderViewToggled ? 'Loading...' : 'Scroll';
  const lines = (text: string) =>
    text.split('\n').map((line) => (
      <Fragment key={line}>
        {line}
        <br />
      </Fragment>
    ));

  return (
    <PageLayout
      pageNavigationProps={{ borderColor: 'var(--color-gray-300)', backgroundColor: 'var(--color-cream)' }}
      fixedBack={<FixedBack />}
    >
      <section className="smooth-section">
        <div className="pt-[var(--nav-space-top)] sm:pt-0" data-home="" data-pointer-chaser-text={pointerText}>
          <div
            className="md:flex flex-col items-center justify-center sm:mx-auto p-6 pb-8 sm:px-12 sm:h-screen max-w-screen-2xl"
            data-pointer-chaser-text={pointerText}
          >
            <Text
              tag="h1"
              variant="display-3"
              className="!leading-none sm:text-center pointer-events-none"
              data-hero-heading=""
              data-exiting="fade"
            >
              <div data-hero-heading-inner="">
                <span className="hidden sm:inline">{lines(home.title)}</span>
                <span className="inline sm:hidden !text-5xl" role="none">
                  {lines(home.titleSmall)}
                </span>
                <span className="block text-base md:text-xl tracking-normal pt-6 text-gray-800">{home.subtitle}</span>
                <div className="hidden md:block text-base pt-6 pointer-events-auto">
                  <Button
                    variant="ghost"
                    className="!tracking-normal"
                    onClick={() => scrollToHash('#products')}
                    data-act-now-cta=""
                  >
                    See all five
                  </Button>
                </div>
              </div>
            </Text>
          </div>
          <ProductsWheel products={products} />
        </div>
      </section>
    </PageLayout>
  );
}
