'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/dropstore/gsap';
import { useLatest, useMotion, MotionOptions } from '@/lib/dropstore/motion';
import { createHeadingInTween } from '@/lib/dropstore/heading-tween';
import { ImageSequence } from '@/lib/dropstore/image-sequence';
import type { Product } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { IngredientRain } from './IngredientRain';
import { PRODUCT_POINTER_SIZE, usePreloader } from './state';
import { Text } from './Text';

export interface ImageSequenceViewProps {
  frames: string[];
  sequence: { width: number; height: number; fps: number };
  motion?: MotionOptions;
  doRenderSequence?: boolean;
  tween?: (sequence: ImageSequence) => gsap.TweenVars & { reversed?: boolean };
  timeline?: (sequence: ImageSequence) => gsap.TimelineVars;
  /** Receives the created tween / timeline so callers can drive them. */
  onCreated?: (sequence: ImageSequence, tween: gsap.core.Tween | null, timeline: gsap.core.Timeline | null) => void;
  className?: string;
}

/** Shows the first frame as an image and, when enabled, plays all frames on a canvas. */
export function ImageSequenceView(props: ImageSequenceViewProps) {
  const id = useId();
  const { preload } = usePreloader();
  const [sequence, setSequence] = useState<ImageSequence>();
  const figure = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLImageElement>(null);
  const propsRef = useLatest(props);

  useEffect(() => preload(props.frames, `sequence_${id}`), [props.frames, id, preload]);

  useEffect(() => {
    if (!props.doRenderSequence) return;
    let instance: ImageSequence | undefined;
    const frame = requestAnimationFrame(() => {
      instance = new ImageSequence({
        frames: props.frames,
        fallback: fallback.current,
        canvas: canvas.current ?? undefined,
        ...props.sequence,
      });
      setSequence(instance);
    });
    return () => {
      cancelAnimationFrame(frame);
      instance?.destroy();
    };
  }, [props.frames, props.sequence, props.doRenderSequence]);

  useMotion(
    () => {
      if (!sequence) return;
      const { tween: tweenFn, timeline: timelineFn, onCreated } = propsRef.current;
      const tween = tweenFn ? sequence.createTween(tweenFn(sequence)) : null;
      const timeline = timelineFn ? sequence.createTimeline(timelineFn(sequence)) : null;
      onCreated?.(sequence, tween, timeline);
      return () => {
        sequence.seek(0);
        tween?.kill();
        timeline?.kill();
      };
    },
    props.motion ?? {},
    [sequence, props.motion]
  );

  return (
    <figure
      ref={figure}
      className={cn('relative image-sequence-figure', props.className)}
      data-image-sequence=""
      data-image-sequence-id={sequence?.id}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={fallback}
        src={props.frames[0]}
        width={props.sequence.width}
        height={props.sequence.height}
        alt="Image sequence"
        className="absolute inset-0 w-full h-full object-contain"
        data-image-sequence-fallback=""
        aria-hidden
      />
      {props.doRenderSequence && <canvas ref={canvas} />}
    </figure>
  );
}

/** Pack art is a single still for now; list more frames here once 360° renders exist. */
const PACK_SEQUENCE = { width: 1200, height: 1200, fps: 24 };

export function useSequenceFrames(image: string) {
  return React.useMemo(() => [image], [image]);
}

export interface ProductTileProps {
  product: Product;
  /** Overrides the pack image and tint (e.g. the selected Craving Control variant). */
  look?: { image: string; tint: string };
  imageSequenceProps?: Partial<ImageSequenceViewProps>;
  pointerText?: string;
  draggable?: boolean;
  withBackgroundColor?: boolean;
  withProductInfo?: boolean;
  withPointerText?: boolean;
  withHoverAnimation?: boolean;
  withImageSequence?: boolean;
  /** Ingredient silhouettes drop into the card on hover. */
  withIngredientRain?: boolean;
  htmlAttributes?: React.AnchorHTMLAttributes<HTMLAnchorElement> & Record<string, unknown>;
}

/** With the ingredient rain the name sits on a cream pill on hover, so it reads over the pieces. */
const PILL = 'px-3 py-1.5 transition-colors duration-300 [.product-tile:hover_&]:bg-cream/90';

/** Pack on a soft tint of the product's accent; on hover the name and line slide up. */
export function ProductTile({
  product,
  look,
  imageSequenceProps,
  pointerText = 'View',
  draggable,
  withBackgroundColor = true,
  withProductInfo = true,
  withPointerText = true,
  withHoverAnimation = true,
  withImageSequence = false,
  withIngredientRain = false,
  htmlAttributes,
}: ProductTileProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frames = useSequenceFrames(look?.image ?? product.image);
  const motion = useState<MotionOptions>(() => ({ matchMedia: '(pointer: fine), (min-width: 640px)' }))[0];
  const sequence = PACK_SEQUENCE;

  useMotion(
    () => {
      const info = ref.current?.querySelector('[data-product-tile-info]');
      if (!ref.current || !info) return;
      const title = info.querySelector<HTMLElement>('[data-product-tile-title]')!;
      const price = info.querySelector<HTMLElement>('[data-product-tile-price]')!;
      const titleIn = createHeadingInTween(title, { rotate: '0deg' }, { ease: 'power2.inOut', duration: 0.5 });
      const priceIn = createHeadingInTween(price, { rotate: '0deg' }, { duration: 0.5, stagger: { each: 0.03 } });
      const tl = gsap.timeline({ paused: true }).add(titleIn.tween).add(priceIn.tween, 0.16);
      const el = ref.current;
      const enter = () => tl.play();
      const leave = () => tl.reverse();
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      return () => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
        titleIn.preSplit.revert();
        titleIn.split.revert();
        titleIn.tween.revert().kill();
        priceIn.preSplit.revert();
        priceIn.split.revert();
        priceIn.tween.revert().kill();
        tl.revert().kill();
      };
    },
    () => ({ matchMedia: '(pointer: fine)', enable: () => !!withHoverAnimation }),
    []
  );

  return (
    <Link
      ref={ref}
      {...htmlAttributes}
      className={cn(
        htmlAttributes?.className,
        'relative flex items-center justify-center rounded-xl overflow-hidden product-tile transition-[background-color] duration-500'
      )}
      style={{
        cursor: draggable ? 'inherit' : undefined,
        backgroundColor: withBackgroundColor ? (look?.tint ?? product.tint) : undefined,
        ...htmlAttributes?.style,
      }}
      href={`/products/${product.slug}`}
      scroll={false}
      role="link"
      data-product-tile={product.slug}
      data-pointer-chaser-text={withPointerText ? pointerText : undefined}
      data-pointer-chaser-size={withPointerText ? PRODUCT_POINTER_SIZE : undefined}
      data-draggable={draggable ? '' : undefined}
    >
      {withIngredientRain && <IngredientRain product={product} />}
      <div className="relative flex items-center justify-center w-full h-full pointer-events-none p-[8%]" data-product-tile-image="">
        <ImageSequenceView
          key={frames[0]}
          frames={frames}
          motion={motion}
          sequence={sequence}
          {...imageSequenceProps}
          doRenderSequence={withImageSequence && frames.length > 1}
          className="w-full h-full"
        />
      </div>
      {withProductInfo && (
        <div
          className="absolute inset-0 z-10 flex gap-6 items-end justify-between p-6 pointer-events-none"
          data-product-tile-info=""
        >
          <Text tag="h2" variant="text-base" className={cn(withIngredientRain && PILL, 'rounded-2xl')} data-product-tile-title="">
            <div className="uppercase tracking-[0.08em]">{product.title}</div>
            <span className="text-gray-800">{product.subtitle}</span>
          </Text>
          <Text
            tag="p"
            variant="text-sm"
            className={cn(withIngredientRain && PILL, 'rounded-full uppercase tracking-[0.12em] text-right')}
            data-product-tile-price=""
          >
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: product.accent }} />
            {product.focus}
          </Text>
        </div>
      )}
    </Link>
  );
}

/** Fixed-size wrapper the home grid / product pages use to place and scale tiles. */
export function ProductTransitionContainer({
  product,
  outerAttributes,
  innerAttributes,
  children,
}: {
  product: Product;
  outerAttributes?: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
  innerAttributes?: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
  children: React.ReactNode;
}) {
  return (
    <div
      {...outerAttributes}
      className={cn(outerAttributes?.className, 'relative')}
      style={{ ...outerAttributes?.style, width: 'var(--product-tile-width)', height: 'var(--product-tile-height)' }}
    >
      <div className="relative rounded-xl">
        <div {...innerAttributes} className={cn(innerAttributes?.className, 'flex justify-center items-center')} data-products-view-grid-tile={product.id}>
          {children}
        </div>
      </div>
    </div>
  );
}
