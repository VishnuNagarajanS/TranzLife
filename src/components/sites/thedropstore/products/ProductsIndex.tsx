'use client';

import React, { Fragment, useEffect } from 'react';
import { gsap, ScrollTrigger, breakpoints, normalizeToDeltaRatio } from '@/lib/dropstore/gsap';
import { useLatest, useMotion, useTicker } from '@/lib/dropstore/motion';
import { useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { Pointer } from '@/lib/dropstore/pointer';
import { useBlobChasing } from '@/lib/dropstore/blob';
import { siteData, Product } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { PageLayout, SideLabel } from '@/components/sites/thedropstore/PageLayout';
import { ProductTile, ProductTransitionContainer } from '@/components/sites/thedropstore/ProductTile';
import { Button } from '@/components/sites/thedropstore/Button';
import { Text } from '@/components/sites/thedropstore/Text';
import { Icon } from '@/components/sites/thedropstore/Icon';
import { useUI } from '@/components/sites/thedropstore/state';
import { scrollToHash, useScreenTransition } from '@/components/sites/thedropstore/ScreenTransition';
import { useProductScreenTransition } from '@/components/sites/thedropstore/useProductScreenTransition';

// Five tiles get more room than the original twenty: two columns, gentler scale steps.
const OUTER_CLASSES = ['col-span-12 lg:col-span-6'];
const SCALES = [1, 0.86, 0.92, 1, 0.88];

function ProductsView({ products, className, ...rest }: { products: Product[]; className?: string } & Record<string, unknown>) {
  const [ui, dispatch] = useUI();

  const setScreenTransitionProduct = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.parentElement?.setAttribute('data-product-parent-active', '');
    dispatch({
      type: 'setProductScreenTransition',
      payload: products.find((p) => p.slug === event.currentTarget.getAttribute('data-product-tile')),
    });
  };

  // Scatter tiles: per-tile scale (bigger tiles stack on top) and a random ±20px offset.
  useMotion(
    () => {
      const tiles = Array.from(document.querySelectorAll<HTMLElement>('[data-products-view-grid-tile]'));
      const offset = gsap.utils.mapRange(0, 1, -20, 20);
      const toZ = gsap.utils.pipe(gsap.utils.mapRange(0, 1, 0, products.length), Math.round);
      const sets = tiles.map((tile, i) => {
        const scale = SCALES[i % SCALES.length];
        tile.setAttribute('data-speed', String(scale));
        return gsap.set(tile, { scale, zIndex: toZ(scale), position: 'relative', left: offset(Math.random()), top: offset(Math.random()) });
      });
      return () => {
        sets.forEach((s) => s.revert().kill());
        tiles.forEach((tile) => {
          gsap.set(tile, { clearProps: 'left,top,zIndex' });
          tile.removeAttribute('data-speed');
        });
      };
    },
    () => ({ matchMedia: `(min-width: ${breakpoints.sm})`, shouldResetOnResize: [document.body, 'horizontal'] }),
    []
  );

  // Mouse parallax: larger tiles travel further against the pointer.
  useMotion(
    (motion) => {
      const states = new Map<HTMLElement, { setX: (v: number) => void; setY: (v: number) => void; scale: number; x: number; y: number; nativeY: number }>();
      const listeners: (() => void)[] = [];
      document.querySelectorAll<HTMLElement>('[data-products-view-grid-tile]').forEach((tile) => {
        tile.addEventListener('kill-motion', motion.destroy);
        listeners.push(() => tile.removeEventListener('kill-motion', motion.destroy));
        states.set(tile, {
          setX: gsap.quickSetter(tile, 'x', 'px') as (v: number) => void,
          setY: gsap.quickSetter(tile, 'y', 'px') as (v: number) => void,
          scale: parseFloat(tile.getAttribute('data-speed') ?? '1'),
          x: 0,
          y: 0,
          nativeY: gsap.getProperty(tile, 'y') as number,
        });
      });
      const pointer = Pointer.instance;
      const update = () => {
        states.forEach((s) => {
          const range = gsap.utils.mapRange(0, 1, -180 * s.scale, 180 * s.scale);
          const targetX = -range(pointer.normalX) - s.x;
          const targetY = -range(pointer.normalY) - s.y + s.nativeY;
          const t = normalizeToDeltaRatio(0.05);
          s.setX((s.x = gsap.utils.interpolate(s.x, targetX, t)));
          s.setY((s.y = gsap.utils.interpolate(s.y, targetY, t)));
        });
      };
      gsap.ticker.add(update);
      return () => {
        gsap.ticker.remove(update);
        listeners.forEach((l) => l());
      };
    },
    () => ({ matchMedia: `(min-width: ${breakpoints.md}) and (pointer: fine) and (prefers-reduced-motion: no-preference)` }),
    [],
    true
  );

  // Flag tiles in view so only those animate out on leave.
  useEffect(() => {
    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.parentElement?.setAttribute('data-is-in-viewport', '');
          el.setAttribute('data-is-in-viewport', '');
        } else {
          el.parentElement?.removeAttribute('data-is-in-viewport');
          el.removeAttribute('data-is-in-viewport');
        }
      })
    );
    document.querySelectorAll('[data-product-tile]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      {...rest}
      id="products"
      data-products-view=""
      className={cn(
        className,
        'sm:px-0 grid justify-items-center grid-cols-12 sm:gap-x-8 gap-y-2 sm:gap-y-16 xl:gap-y-40 xl:gap-x-12 padding-12'
      )}
    >
      {products.map((product, i) => (
        <ProductTransitionContainer
          key={[i, product.id].join(':')}
          product={product}
          outerAttributes={{ className: OUTER_CLASSES[i % OUTER_CLASSES.length] }}
          innerAttributes={{ className: 'origin-center' }}
        >
          <ProductTile
            product={product}
            htmlAttributes={{ onMouseDown: setScreenTransitionProduct }}
            withImageSequence={ui.screenTransitionProduct?.slug === product.slug}
          />
        </ProductTransitionContainer>
      ))}
    </div>
  );
}

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

const fadeBlob = (getBlob: ReturnType<typeof useBlobChasing>, opacity: number) =>
  gsap.to(getBlob().blob.material, { opacity, duration: 0.5, ease: 'power2.inOut' });

/** `/products`: the original Drop Store home — pinned headline with the five floating tiles. */
export function ProductsIndex() {
  const { productsPage: home, products } = siteData;
  const heading = useHeadingInTween('h1 span');
  const [ui] = useUI();
  const getBlob = useBlobChasing();
  const headingRef = useLatest(heading);

  useTicker(() => {
    const { blob, renderer, scene, camera } = getBlob();
    if (blob && blob.material.opacity >= 0) renderer.render(scene, camera);
  });

  useMotion(() => void fadeBlob(getBlob, 1), { enable: () => !ui.isLoaderViewToggled }, [ui.isLoaderViewToggled]);

  // Pin the headline while the tiles scroll over it, then fade it before the bands below;
  // hide the blob once products reach the top.
  useMotion(
    () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: 'html',
          start: 'top top',
          endTrigger: '[data-products-view]',
          end: 'bottom top',
          pin: '[data-hero-heading]',
        });
        gsap.to('[data-hero-heading-inner]', {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: '[data-products-view]', start: 'bottom 90%', end: 'bottom 40%', scrub: true },
        });
        ScrollTrigger.create({
          trigger: '[data-products-view]',
          start: 'top top',
          endTrigger: 'html',
          end: 'bottom bottom',
          onEnter: () => fadeBlob(getBlob, 0),
          onLeaveBack: () => fadeBlob(getBlob, 1),
        });
      });
      return () => ctx.kill();
    },
    { matchMedia: `(min-width: ${breakpoints.sm})` },
    []
  );

  // Nudge the page down a little after the intro so the products peek in.
  useMotion(
    () => {
      const timer = setTimeout(() => {
        if (window.scrollY === 0) {
          gsap.to(document.scrollingElement, { scrollTo: 0.2 * window.innerHeight, ease: 'power2.inOut', duration: 1 });
        }
      }, 1.3 * ui.screenTransitionDurationMS);
      return () => clearTimeout(timer);
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
      gsap.to('[data-products-view-grid-tile][data-is-in-viewport]:not([data-product-parent-active])', {
        opacity: 0,
        scale: 0,
        duration: 0.3,
        ease: 'power3.inOut',
        stagger: { amount: 0.3 },
        delay: 0.3,
      });
    },
  });

  useProductScreenTransition(undefined, '/products');

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
          <ProductsView
            className="container mx-auto px-2 sm:px-6"
            products={products}
            data-loaded-in="fade"
            data-entered-in="fade"
            data-exiting="fade"
          />
          <div className="h-2 sm:h-[50vh]" role="separator" />
        </div>
      </section>
    </PageLayout>
  );
}
