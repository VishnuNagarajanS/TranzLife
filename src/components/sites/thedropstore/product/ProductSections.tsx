'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, breakpoints } from '@/lib/dropstore/gsap';
import { useMotion } from '@/lib/dropstore/motion';
import { createHeadingInTween, useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { useBlob } from '@/lib/dropstore/blob';
import { siteData, type Product, type ProductComment as ProductCommentData } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { PageSection, useTextGuide } from '../sections';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { ImageSequenceViewProps, ProductTile, ProductTransitionContainer } from '../ProductTile';
import { useUI } from '../state';
import { SPIN_FRAME_SLUGS } from '../products/spinFrames';
import { ProductSpinFrames } from './ProductSpinFrames';
import { Marquee } from './Marquee';
import { EnquireButton } from './EnquireButton';
import { ProductDecorationsBottomLeft, ProductDecorationsBottomRight } from './ProductDecorations';
import { Draggable, ScreenTransitionHandlers, useProductUI } from './productUI';
import styles from './ProductPage.module.css';

/* Sections inside the pinned product block leave the centre column free for the pack. */
const SPLIT = cn('w-full mx-auto flex flex-col gap-8', 'md:grid md:grid-cols-2 md:items-center', 'md:gap-[var(--product-tile-width)]');

/* ----------------------------------------------------------------- Hero --- */

export function ProductHeroSection({ product, smooth }: { product: Product; smooth?: boolean }) {
  const title = `${product.title} — ${product.amount}`;
  const [ui] = useUI();
  const tween = useHeadingInTween(
    'h2',
    {},
    { delay: 0.1, paused: true },
    {
      get shouldResetOnResize() {
        return [document.body, 'horizontal'] as [Element, 'horizontal'];
      },
      matchMedia: '(prefers-reduced-motion: no-preference)',
    }
  );

  useEffect(() => {
    tween?.paused(ui.isLoaderViewToggled);
  }, [ui.isLoaderViewToggled, tween]);

  return (
    <PageSection
      className="relative h-screen flex flex-col justify-center items-start"
      style={{ top: 'calc(var(--nav-space-top) * -1)' }}
      data-product-hero-section=""
      smooth={smooth}
    >
      <ScreenTransitionHandlers
        leave={(_, duration) => {
          tween?.duration(duration / 2);
          tween?.reverse();
        }}
      />
      <div className="-mx-6">
        <Marquee withHeadingInTween>
          <h1
            className={cn(
              'mx-[-1.5rem]',
              'relative text-10xl text-[10rem] text-white whitespace-nowrap',
              'lg:text-12xl lg:text-[12rem]',
              '!leading-none'
            )}
            data-product-hero-section-title={title}
          >
            <span className="pr-[1em]">{title}</span>
          </h1>
        </Marquee>
      </div>
      <div className={cn('flex relative w-full', 'justify-end sm:justify-between items-end')}>
        <h2 className={cn('hidden sm:block', 'text-5xl relative text-black', 'lg:text-7xl leading-none tracking-tight')}>
          {product.subtitle}
        </h2>
        <div
          className={cn(
            'hidden sm:flex',
            'h-28 w-28 rounded-full border border-black text-center text-sm p-4 z-50 bg-white/40',
            'flex-col items-center justify-center',
            'relative sm:static',
            'top-12 sm:top-auto'
          )}
          data-loaded-in="spin"
          data-entered-in="spin"
          data-exiting="spin"
        >
          {product.retailSlang}
        </div>
      </div>
    </PageSection>
  );
}

/* ------------------------------------------------- Promise + What's inside --- */

export function ProductDetailSection({ product, smooth }: { product: Product; smooth?: boolean }) {
  useMotion(
    () => {
      const element = document.querySelector<HTMLElement>('[data-product-detail-title]');
      if (!element) return;
      const ctx = gsap.context(() => {
        const heading = createHeadingInTween(
          element,
          {},
          {
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-product-detail-title]',
              start: 'bottom bottom',
              end: 'top center',
              scrub: true,
            },
          }
        );
        heading.split.lines.forEach((line) => gsap.set(line, { paddingRight: '0.1em' }));
      });
      return () => {
        ctx.revert();
        ctx.kill();
      };
    },
    () => ({ matchMedia: `(min-width: ${breakpoints.md}) and (prefers-reduced-motion: no-preference)` }),
    []
  );

  useMotion(
    () => {
      const element = document.querySelector<HTMLElement>('[data-product-detail-description]');
      if (!element) return;
      const heading = createHeadingInTween(
        element,
        {},
        {
          ease: 'power1.out',
          scrollTrigger: {
            trigger: '[data-product-detail-description]',
            start: 'bottom bottom',
            end: 'top center',
            scrub: 0.5,
          },
        }
      );
      return () => {
        heading.preSplit.revert();
        heading.split.revert();
        heading.tween.revert().kill();
      };
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );

  useTableReveal('[data-product-detail-nutrition]', '[data-nutrition-entry]', '[data-nutrition-border]');

  const details = Object.entries(product.details ?? {});

  return (
    <PageSection className={SPLIT} data-product-details-section="" smooth={smooth}>
      <article className="flex flex-col flex-wrap gap-8">
        <Text
          tag="h2"
          variant="display-3"
          className="whitespace-pre-line !leading-none"
          style={{ hyphens: 'manual' }}
          data-product-detail-title
        >
          {product.introTitle}
        </Text>
        <Text tag="p" variant="text-base" className="max-w-full" data-product-detail-description>
          {product.description}
        </Text>
        <ul className="grid grid-cols-2 gap-3">
          {product.benefits.map((benefit) => (
            <li key={benefit.title} className="flex items-center gap-3 rounded-lg bg-white/50 p-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full text-white" style={{ backgroundColor: 'var(--accent)' }}>
                <Icon name={benefit.icon} className="w-4 h-4" />
              </span>
              <Text tag="span" variant="text-sm" className="!leading-tight">
                {benefit.title}
              </Text>
            </li>
          ))}
        </ul>
        <Text tag="p" variant="text-xs" className="max-w-full uppercase tracking-[0.1em] !text-[0.65rem]">
          {product.category}
        </Text>
      </article>
      <footer className="text-xs" data-product-detail-nutrition="">
        <div className="relative flex justify-between items-center pb-4">
          <Text variant="text-lg" className="text-xl leading-title">
            {product.detailsTitle}
          </Text>
          <div className="flex gap-1 text-gold">
            <Icon name="leaf" className="w-4 h-4" />
            <Icon name="infinity" className="w-4 h-4" />
          </div>
          <div className="absolute left-0 bottom-0 h-px bg-black w-full" data-nutrition-border="" />
        </div>
        {details.map(([key, value], i) => (
          <div key={[i, key].join(':')} className="relative py-3">
            <div className="overflow-hidden">
              <div className="flex justify-between gap-8" data-nutrition-entry="">
                <Text tag="div" variant="text-sm" className="uppercase !leading-none">
                  {key}
                </Text>
                <Text tag="div" variant="text-sm" className="!leading-none text-right italic text-gray-800">
                  {value}
                </Text>
              </div>
            </div>
            <div className="absolute left-0 bottom-0 h-px bg-black w-full" data-nutrition-border="" />
          </div>
        ))}
      </footer>
    </PageSection>
  );
}

/** Rows slide up and their rules draw in as the table scrolls into view. */
function useTableReveal(trigger: string, entry: string, border: string) {
  useMotion(
    () => {
      const scrollTrigger = { trigger, start: 'center bottom', end: 'center center', scrub: 0.5 };
      const stagger = { each: 0.1 };
      const entries = gsap.fromTo(
        entry,
        { y: 18 },
        { y: 0, ease: 'none', stagger, scrollTrigger, onComplete: () => void gsap.set(entry, { clearProps: 'y' }) }
      );
      const borders = gsap.fromTo(border, { width: '0%' }, { width: '100%', ease: 'none', stagger, scrollTrigger });
      return () => {
        entries.revert().kill();
        borders.revert().kill();
      };
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );
}

/* ------------------------------------------------------ Variant switcher --- */

/** Craving Control: pick one of four inhalers; the whole page recolours to match. */
export function ProductVariantSection({ product, smooth }: { product: Product; smooth?: boolean }) {
  const [{ variantIndex }, dispatch] = useProductUI();
  const variants = product.variants ?? [];
  const selected = variants[variantIndex];
  if (!selected) return null;

  return (
    <PageSection className={cn(SPLIT, 'py-16 md:min-h-screen')} smooth={smooth} data-product-variants="">
      <div className="flex flex-col gap-6">
        <Text tag="h2" variant="display-3" className="!leading-none">
          Choose your
          <br />
          strength.
        </Text>
        <div className="flex flex-col border-t border-black" role="radiogroup" aria-label="Craving Control variant">
          {variants.map((variant, i) => (
            <button
              key={variant.name}
              role="radio"
              aria-checked={i === variantIndex}
              onClick={() => dispatch({ type: 'setVariant', payload: i })}
              className={cn(
                'flex items-center justify-between gap-4 py-4 border-b border-black text-left transition-[padding] duration-300',
                i === variantIndex && 'pl-3'
              )}
              data-pointer-chaser-size={0}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn('w-5 h-5 rounded-full border-2 transition-transform duration-300', i === variantIndex && 'scale-125')}
                  style={{ backgroundColor: variant.color, borderColor: i === variantIndex ? '#C49A3C' : 'transparent' }}
                />
                <Text tag="span" variant="headline-4" className="!text-2xl">
                  {variant.short}
                </Text>
              </span>
              <Text tag="span" variant="text-sm" className="text-gray-800 text-right">
                {variant.forWhom}
              </Text>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6 md:items-end md:text-right" aria-live="polite">
        <Text variant="text-sm" className="uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>
          Selected
        </Text>
        <Text tag="h3" variant="headline-2" key={selected.name}>
          {selected.name}
        </Text>
        <Text variant="text-lg" className="max-w-sm">
          {selected.forWhom}
        </Text>
        <div className="flex flex-col gap-1 max-w-sm">
          <Text variant="text-sm" className="uppercase tracking-[0.12em] text-gray-800">
            Aroma
          </Text>
          <Text variant="text-base">{selected.aroma}</Text>
        </div>
      </div>
    </PageSection>
  );
}

/* ------------------------------------------------------------ Promotion --- */

export function ProductPromotionSection({ product, smooth }: { product: Product; smooth?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useHeadingInTween(
    '[data-product-promotion-heading]',
    {},
    {
      ease: 'power1.out',
      duration: 3,
      stagger: { each: 1.5 },
      scrollTrigger: {
        trigger: '[data-product-promotion-heading]',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.5,
      },
    }
  );

  return (
    <PageSection className="w-full sm:w-10/12 mx-auto py-8 sm:py-0 sm:min-h-screen flex md:justify-center items-center" smooth={smooth}>
      <Text
        ref={ref}
        tag="h2"
        variant="display-2"
        className="whitespace-pre-wrap first-line:text-[color:var(--accent)] md:text-center !leading-none"
        data-product-promotion-heading=""
      >
        {product.promotionText}
      </Text>
    </PageSection>
  );
}

/* ----------------------------------------------------------- How to use --- */

export function ProductHowToUseSection({ product, smooth }: { product: Product; smooth?: boolean }) {
  useTableReveal('[data-product-how-to-use]', '[data-how-entry]', '[data-how-border]');

  return (
    <PageSection className={cn(SPLIT, 'py-16 items-start md:items-center')} smooth={smooth} data-product-how-to-use="">
      <div className="flex flex-col gap-8">
        <Text tag="h2" variant="display-3" className="!leading-none">
          How to use
        </Text>
        <ol className="flex flex-col">
          {product.howToUse.map((step, i) => (
            <li key={step.title} className="relative py-4">
              <div className="overflow-hidden">
                <div className="flex items-center gap-4" data-how-entry="">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-full border shrink-0"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    <Icon name={step.icon} className="w-5 h-5" />
                  </span>
                  <div className="flex flex-col">
                    <Text tag="span" variant="text-sm" className="uppercase tracking-[0.12em] text-gray-800">
                      Step {i + 1} · {step.title}
                    </Text>
                    <Text tag="span" variant="text-lg">
                      {step.text}
                    </Text>
                  </div>
                </div>
              </div>
              <div className="absolute left-0 bottom-0 h-px bg-black w-full" data-how-border="" />
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-6 md:pt-24">
        <div className="flex flex-col gap-2">
          <Text variant="text-sm" className="uppercase tracking-[0.12em]">
            Caution
          </Text>
          <Text variant="text-sm" className="text-gray-900">
            {product.caution}
          </Text>
        </div>
        <div className="flex flex-col gap-2">
          <Text variant="text-sm" className="uppercase tracking-[0.12em]">
            Storage
          </Text>
          <Text variant="text-sm" className="text-gray-900">
            {product.storage}
          </Text>
        </div>
      </div>
    </PageSection>
  );
}

/* ------------------------------------------- Real people / Why it works --- */

const COMMENT_PLACEMENTS = [
  'col-span-2 md:col-start-1 md:col-end-2 md:justify-self-center',
  'col-span-2 md:col-start-2 md:justify-self-center',
];
const COMMENT_SCALES = ['md:scale-100', 'md:scale-[0.95]', 'md:scale-[0.9]'];
const COMMENT_PARALLAX = ['1', '2', '3'];

/**
 * Shows verified reviews when the product has any; until then the same cards
 * explain why the formula works.
 */
export function ProductReviewSection({ product, smooth }: { product: Product; smooth?: boolean }) {
  const hasReviews = product.comments.length > 0;
  const cards: ProductCommentData[] = hasReviews
    ? product.comments
    : product.whyItWorks.map((item, i) => ({ from: item.title, text: item.text, id: `why-${i}` }));
  const heading = hasReviews ? ['Real people.', 'Real stories.'] : ['Why it', 'works'];

  useMotion(
    () => {
      const [draggable] = Draggable.create('[data-comments-draggable]', {
        type: 'x',
        bounds: '[data-comments-container]',
        inertia: true,
        edgeResistance: 0.8,
      });
      return () => void draggable?.kill();
    },
    () => ({ matchMedia: `(max-width: ${parseInt(breakpoints.md) - 1 + 'px'})` }),
    []
  );

  return (
    <PageSection className="relative w-full mx-auto py-8" smooth={smooth}>
      <Text tag="h2" variant="display-3" className="md:hidden mb-6 w-52 relative">
        {heading.join(' ')}
      </Text>
      <div
        className="relative h-[72vw] sm:h-[48vw] md:h-[unset] mx-[-1.5rem] md:mx-auto overflow-hidden md:overflow-visible z-0"
        data-comments-container=""
      >
        <div className="absolute left-0 top-0 md:static px-6 md:px-0" data-comments-draggable="">
          <div className="flex flex-nowrap gap-2 md:block">
            {cards.map((comment, i) => (
              <div key={[i, comment.id].join(':')}>
                <div className="md:grid md:grid-cols-2 shrink-0">
                  <ProductComment
                    comment={comment}
                    className={cn(COMMENT_PLACEMENTS[i % COMMENT_PLACEMENTS.length], COMMENT_SCALES[i % COMMENT_SCALES.length])}
                    data-parallax={COMMENT_PARALLAX[i % COMMENT_PARALLAX.length]}
                    data-parallax-match-media="(min-width: 1024px)"
                  />
                  {i === 0 && (
                    <div className="hidden relative md:flex flex-col gap-8 col-start-2 justify-self-end">
                      <span className="absolute top-[-2.6rem] left-[-3.6rem] text-gold">
                        <Icon name="infinity" className="w-[2.6rem] h-[2.6rem]" />
                      </span>
                      <Text tag="h2" variant="display-3" className="text-right">
                        {heading[0]}
                        <br /> {heading[1]}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageSection>
  );
}

function ProductComment({ comment, ...rest }: { comment: ProductCommentData; className?: string } & Record<string, unknown>) {
  return (
    <div
      {...rest}
      className={cn(
        rest.className as string | undefined,
        'flex flex-col justify-between gap-6 aspect-[5/4] rounded-xl bg-white pt-3 px-5 pb-5 z-10',
        'w-[88vw] sm:w-[60vw] md:w-2/3'
      )}
      data-product-comment=""
    >
      <header className="flex justify-between items-center text-sm uppercase tracking-[0.1em]">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        {comment.from}
      </header>
      <p className="text-xl lg:text-2xl">{comment.text}</p>
    </div>
  );
}

/* ------------------------------------------------------ Powered by nature --- */

export function ProductNatureSection({ product }: { product: Product }) {
  const getBlob = useBlob();
  useTextGuide('[data-nature-description]');

  useMotion(
    () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: '[data-product-nature-section]',
          start: 'top center',
          end: 'bottom center',
          onToggle(self) {
            gsap.to(getBlob().blob.material, { opacity: self.isActive ? 1 : 0 });
          },
        });
      });
      return () => ctx.kill(true);
    },
    {},
    []
  );

  return (
    <PageSection data-product-nature-section="">
      <div className="flex flex-col gap-24 md:grid grid-cols-12 md:gap-6 items-[unset] md:items-center">
        <Text tag="h2" variant="display-3" className="col-span-6 whitespace-pre-line !leading-[0.9]" data-product-nature-section-title="">
          {product.natureTitle}
        </Text>
        <div className={cn('text-right', 'flex flex-col col-start-10 col-span-3')}>
          <Text tag="h3" variant="display-3" className="self-end !leading-[0.9]" data-product-nature-section-amount="">
            {product.natureAmount}
            <br />
            <span className="text-[0.45em] tracking-normal" style={{ color: 'var(--accent)' }}>
              {product.natureAmountLabel}
            </span>
          </Text>
          <Text variant="text-lg" className="self-end w-40 md:w-full" data-product-nature-section-description="">
            {product.natureAmountDescription}
          </Text>
        </div>
        <p className={cn('col-start-1 col-end-13 md:col-end-10 lg:col-end-8 md:col-start-2 xl:text-[1.25rem]', 'py-6 md:py-16')} data-nature-description="">
          {product.natureDescription}
        </p>
        <div className="col-span-full">
          <NatureVisual product={product} />
        </div>
      </div>
    </PageSection>
  );
}

function NatureVisual({ product }: { product: Product }) {
  const ingredients = Object.keys(product.details).map((k) => k.split(' (')[0]);
  switch (product.natureVisual) {
    case 'lungs':
      return <LungsFill product={product} ingredients={ingredients} />;
    case 'circle':
      return <IngredientCircle ingredients={ingredients} />;
    case 'variants':
      return <VariantLineup product={product} />;
    default:
      return (
        <ul className="flex flex-wrap gap-3 md:w-10/12 md:ml-[8.33%] pb-12">
          {Object.entries(product.details).map(([name, latin]) => (
            <li key={name} className="flex items-baseline gap-2 rounded-full border border-gray-400 bg-white px-5 py-3">
              <Text tag="span" variant="text-lg">
                {name}
              </Text>
              <Text tag="span" variant="text-sm" className="italic text-gray-700">
                {latin}
              </Text>
            </li>
          ))}
        </ul>
      );
  }
}

/** PulmoClear: a pair of lungs fills from the bottom as the section scrolls past. */
function LungsFill({ product, ingredients }: { product: Product; ingredients: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(
    () => {
      const rect = ref.current?.querySelector('[data-lungs-fill]');
      if (!rect) return;
      const tween = gsap.fromTo(
        rect,
        { attr: { y: 320 } },
        { attr: { y: 40 }, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 60%', scrub: 0.6 } }
      );
      return () => void tween.revert().kill();
    },
    {},
    []
  );
  const lungs =
    'M140 70c-55-8-95 60-95 140 0 50 18 85 52 85 42 0 58-32 58-85V95c0-14-5-23-15-25Z M180 70c55-8 95 60 95 140 0 50-18 85-52 85-42 0-58-32-58-85V95c0-14 5-23 15-25Z';
  return (
    <div ref={ref} className="flex flex-col md:flex-row items-center gap-12 md:gap-24 pb-16 md:px-[8.33%]">
      <svg viewBox="0 0 320 320" className="w-64 md:w-96 shrink-0" aria-label="Lungs filling with PulmoClear actives">
        <defs>
          <clipPath id="lungs-clip">
            <path d={lungs} />
          </clipPath>
        </defs>
        <path d="M160 20v90M160 110c-12 14-24 20-36 20M160 110c12 14 24 20 36 20" stroke={product.accent} strokeWidth={6} strokeLinecap="round" fill="none" />
        <g clipPath="url(#lungs-clip)">
          <rect x="0" y="0" width="320" height="320" fill={product.tint} />
          <rect x="0" y="320" width="320" height="320" fill={product.accent} data-lungs-fill="" />
        </g>
        <path d={lungs} fill="none" stroke={product.accent} strokeWidth={4} />
      </svg>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 w-full">
        {ingredients.map((name, i) => (
          <li key={name} className="flex items-baseline gap-3 border-b border-gray-300 pb-3">
            <Text tag="span" variant="text-sm" className="text-gold">
              {String(i + 1).padStart(2, '0')}
            </Text>
            <Text tag="span" variant="text-lg">
              {name}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** BreatheFree: the brochure's circular diagram — six oils around the inhaler. */
function IngredientCircle({ ingredients }: { ingredients: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(
    () => {
      const tween = gsap.from(ref.current?.querySelectorAll('[data-oil]') ?? [], {
        scale: 0,
        opacity: 0,
        stagger: 0.12,
        ease: 'back.out(1.6)',
        duration: 0.8,
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
      });
      return () => void tween.revert().kill();
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );
  return (
    <div ref={ref} className="relative mx-auto my-12 w-[min(90vw,560px)] aspect-square">
      <div className="absolute inset-[18%] rounded-full border border-dashed" style={{ borderColor: 'var(--accent)' }} />
      <div
        className="absolute inset-[34%] rounded-full flex flex-col items-center justify-center text-white text-center p-4"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        <Icon name="breath" className="w-10 h-10 mb-1" />
        <Text variant="text-sm" className="uppercase tracking-[0.12em]">
          Breathe free
        </Text>
      </div>
      {ingredients.map((name, i) => {
        const angle = (i / ingredients.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <div
            key={name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${50 + Math.cos(angle) * 34}%`, top: `${50 + Math.sin(angle) * 34}%` }}
          >
            <div className="flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-white shadow-sm text-center p-2" data-oil="">
              <Text tag="span" variant="text-base" className="!leading-tight">
                {name}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Craving Control: the four packs side by side. */
function VariantLineup({ product }: { product: Product }) {
  const [{ variantIndex }, dispatch] = useProductUI();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-16">
      {product.variants?.map((variant, i) => (
        <button
          key={variant.name}
          onClick={() => dispatch({ type: 'setVariant', payload: i })}
          className={cn('flex flex-col gap-3 rounded-xl p-4 text-left transition-shadow duration-300', i === variantIndex && 'ring-2 ring-gold')}
          style={{ backgroundColor: variant.tint }}
          data-pointer-chaser-size={0}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={variant.image} alt={variant.name} className="w-full aspect-square object-contain pointer-events-none" />
          <Text tag="span" variant="text-base" className="uppercase tracking-[0.08em] pointer-events-none">
            {variant.name}
          </Text>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- 4-week programme --- */

/** Scroll timeline: the line fills and each week lights up as it reaches the centre. */
export function ProductProgrammeSection({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion(
    () => {
      const root = ref.current;
      if (!root) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '[data-programme-line]',
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-programme-list]', start: 'top center', end: 'bottom center', scrub: true } }
        );
        gsap.utils.toArray<HTMLElement>('[data-programme-week]').forEach((week) => {
          week.classList.add('opacity-30');
          ScrollTrigger.create({
            trigger: week,
            start: 'top center',
            onEnter: () => week.classList.remove('opacity-30'),
            onLeaveBack: () => week.classList.add('opacity-30'),
          });
        });
      }, root);
      return () => {
        ctx.revert();
        root.querySelectorAll('[data-programme-week]').forEach((week) => week.classList.remove('opacity-30'));
      };
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );

  if (!product.programme?.length) return null;
  return (
    <PageSection className="py-24">
      <div ref={ref} className="grid grid-cols-12 gap-6">
        <div className="col-span-full lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24 self-start">
          <Text variant="text-sm" className="uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>
            The quit programme
          </Text>
          <Text tag="h2" variant="display-3" className="!leading-none">
            Four weeks to breathe free.
          </Text>
          <Text variant="text-lg" className="max-w-md">
            Use the Craving Control series with a simple, week-by-week plan. Move at your own pace and talk to your doctor if you need extra support.
          </Text>
        </div>
        <ol className="relative col-span-full lg:col-start-7 lg:col-span-6 flex flex-col gap-16 pl-10" data-programme-list="">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-300" role="none" />
          <div className="absolute left-[7px] top-2 bottom-2 w-px origin-top" style={{ backgroundColor: 'var(--accent)' }} data-programme-line="" role="none" />
          {product.programme.map((week) => (
            <li key={week.week} className="relative flex flex-col gap-3 transition-opacity duration-500" data-programme-week="">
              <span
                className="absolute -left-10 top-1 w-[15px] h-[15px] rounded-full border-2 bg-white"
                style={{ borderColor: 'var(--accent)' }}
                role="none"
              />
              <Text variant="text-sm" className="uppercase tracking-[0.12em] text-gray-800">
                {week.week}
              </Text>
              <Text tag="h3" variant="headline-2">
                {week.title}
              </Text>
              <Text variant="text-lg">{week.text}</Text>
            </li>
          ))}
        </ol>
      </div>
    </PageSection>
  );
}

/* ----------------------------------------------------------------- More --- */

export function ProductMoreSection({ product }: { product: Product }) {
  const bounds = useRef<HTMLDivElement>(null);
  const draggable = useRef<HTMLDivElement>(null);
  const products = siteData.products?.filter((p) => p.slug !== product.slug);
  const setSwirl = useRef<(progress: number) => void>(undefined);

  useEffect(() => {
    if (!draggable.current) return;
    const [instance] = Draggable.create(draggable.current, {
      type: 'x',
      bounds: bounds.current,
      inertia: true,
      edgeResistance: 0.8,
      activeCursor: 'grabbing',
      zIndexBoost: false,
    });
    return () => void instance.kill();
  }, []);

  const markActive = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.parentElement?.setAttribute('data-product-parent-active', '');
  };

  return (
    <div className="smooth-section">
      <section className={cn(styles.productMoreSection, 'my-14')}>
        <Marquee
          onUpdate={(progress) => setSwirl.current?.(progress)}
          onCreated={() =>
            (setSwirl.current = gsap.utils.pipe(
              gsap.utils.mapRange(0, 1, 0, -360),
              gsap.quickSetter('[data-product-more-section-swirl]', 'rotation', 'deg') as (v: number) => void
            ))
          }
        >
          <Text tag="h3" variant="display-2" className="relative whitespace-nowrap !leading-none" data-product-more-section-title="">
            <span className="pr-6">
              Also from TranzLife{' '}
              <span className="inline-block h-[0.8em] w-[0.8em] top-[-0.05em] relative text-gold" data-product-more-section-swirl="">
                <Icon name="infinity" className="w-full h-full" strokeWidth={1.2} />
              </span>
            </span>
          </Text>
        </Marquee>
        <div
          ref={bounds}
          className="relative w-screen overflow-hidden mt-10"
          style={{ height: 'var(--product-tile-height)' }}
          data-pointer-chaser-text="Drag"
        >
          <div ref={draggable} className="absolute left-0 top-0 px-6">
            <div className="flex flex-nowrap gap-2" data-pointer-chaser-text="Drag" data-pointer-chaser-size="10">
              {products?.map((p, i) => (
                <ProductTransitionContainer key={[p.id, i].join(':')} product={p} outerAttributes={{ className: 'shrink-0' }}>
                  <ProductTile
                    product={p}
                    pointerText="Drag"
                    draggable
                    htmlAttributes={{
                      style: { width: '100%' },
                      onClick: markActive,
                      // The shared transition router swallows clicks in the
                      // capture phase, so React's onClick never fires; mirror it.
                      onMouseDown: markActive,
                    }}
                  />
                </ProductTransitionContainer>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------- Commerce --- */

export function ProductCommerceSection({ product }: { product: Product; imageSequenceProps?: Partial<ImageSequenceViewProps> }) {
  const [ui] = useUI();
  // Arriving from a flying jar: show the image at once, exactly where the jar landed, instead of fading it in.
  const [withFadeIn] = useState(() => !ui.screenTransitionProduct && !(typeof document !== 'undefined' && document.getElementById('screen-transition-scene')));


  return (
    <div className="relative" style={{ paddingTop: 'var(--nav-space-top)' }}>
      <div
        className="absolute h-[100svh] w-screen inset-0 flex justify-center items-center pointer-events-none z-10"
        data-product-image=""
      >
        <div className="w-full sm:w-[unset]" data-loaded-in="fade" data-entered-in={withFadeIn ? 'fade' : undefined}>
          {SPIN_FRAME_SLUGS.has(product.slug) ? (
            <ProductSpinFrames slug={product.slug} label={product.title} />
          ) : (
            <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.title}
              draggable={false}
              className="block mx-auto object-contain pointer-events-none select-none"
              style={{ height: 'min(60svh, 48vw)', width: 'min(60svh, 48vw)' }}
            />
            </>
          )}
        </div>
        <div
          className="flex flex-col gap-8 absolute bottom-6 w-full left-0 right-0 flex justify-center items-center"
          data-loaded-in="-y"
          data-entered-in="-y"
          data-exiting="-y"
        >
          <div className="hidden absolute flex justify-center bottom-0 w-full px-6 sm:px-36 z-30" data-add-to-cart-button="pointer-fine" data-loaded-in="-y">
            <EnquireButton product={product} />
          </div>
          <div className={cn('flex justify-between gap-6 w-full px-6 pb-16 text-3xl', 'sm:hidden')}>
            <div className="flex flex-col gap-1">
              <Text tag="p" variant="headline-4">
                {product.title}
              </Text>
              <Text tag="p" variant="headline-4" className="text-gray-700">
                —{product.amount}
              </Text>
            </div>
          </div>
        </div>
        <div className="absolute h-screen w-screen inset-0 pointer-events-none" data-decorations="">
          <ProductDecorationsBottomLeft product={product} />
          <ProductDecorationsBottomRight />
        </div>
      </div>
    </div>
  );
}
