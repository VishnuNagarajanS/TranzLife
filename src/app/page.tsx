'use client';

import React, { Fragment, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, breakpoints } from '@/lib/dropstore/gsap';
import { useLatest, useMotion, useTicker } from '@/lib/dropstore/motion';
import { useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { useBlobChasing } from '@/lib/dropstore/blob';
import { siteData, getProductsByFocus } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { PageLayout, SideLabel } from '@/components/sites/thedropstore/PageLayout';
import { Button } from '@/components/sites/thedropstore/Button';
import { Text } from '@/components/sites/thedropstore/Text';
import { Icon } from '@/components/sites/thedropstore/Icon';
import { Eyebrow, PageSection, useTextGuide } from '@/components/sites/thedropstore/sections';
import { useUI } from '@/components/sites/thedropstore/state';
import { useScreenTransition } from '@/components/sites/thedropstore/ScreenTransition';
import { Draggable } from '@/components/sites/thedropstore/product/productUI';
import { RollingValue } from '@/components/sites/thedropstore/RollingValue';
import { StorySection } from '@/components/sites/thedropstore/home/StorySection';
import { CredentialLogoStrip } from '@/components/sites/thedropstore/CredentialLogos';

const fadeBlob = (getBlob: ReturnType<typeof useBlobChasing>, opacity: number) =>
  gsap.to(getBlob().blob.material, { opacity, duration: 0.5, ease: 'power2.inOut' });

const lines = (text: string) =>
  text.split('\n').map((line, i, all) => (
    <Fragment key={line}>
      {line}
      {i < all.length - 1 && <br />}
    </Fragment>
  ));

function FixedBack() {
  return (
    <div className="hidden absolute top-0 left-6 bottom-0 w-8 sm:flex justify-center items-center overflow-hidden">
      <div className="-rotate-90" role="none" data-loaded-in="x" data-entered-in="x" data-exiting="x">
        <SideLabel />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Hero --- */

/**
 * Headline over the green-gold orb. When `home.heroVideo` is set in the JSON,
 * the roots-to-infinity story video plays behind the headline instead.
 */
function HeroSection() {
  const { home } = siteData;
  const [ui] = useUI();
  const pointerText = ui.isLoaderViewToggled ? 'Loading...' : 'Scroll';

  return (
    <section className="smooth-section">
      <div className="relative h-[100svh] min-h-[560px] flex items-center justify-center overflow-hidden" data-home-hero="" data-pointer-chaser-text={pointerText}>
        {home.heroVideo && (
          <>
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={home.heroVideo}
              poster={home.heroVideoPoster || undefined}
              autoPlay
              muted
              loop
              playsInline
              data-loaded-in="fade"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-cream/10 to-cream" role="none" />
          </>
        )}
        <div className="relative px-6 text-center flex flex-col items-center gap-6" data-exiting="fade">
          <Text tag="h1" variant="display-2" className="!leading-[0.95] pointer-events-none" breakpoints={{ none: 'text-[3rem]' }} data-hero-heading="">
            <span className="hidden sm:inline">{lines(home.title)}</span>
            <span className="inline sm:hidden">{lines(home.titleSmall)}</span>
          </Text>
          <Text variant="text-xl" className="text-gray-800 max-w-xl" data-loaded-in="fade" data-entered-in="fade">
            {home.subtitle}
          </Text>
          <div className="flex flex-wrap justify-center gap-3 pt-2" data-loaded-in="-y" data-entered-in="-y">
            <Button is={Link} href="/products" scroll={false}>
              {home.cta}
            </Button>
            <Button is={Link} href="/about" scroll={false} variant="ghost">
              {home.ctaSecondary}
            </Button>
          </div>
        </div>
        <div className="absolute bottom-6 inset-x-0 flex justify-center text-gray-800" data-loaded-in="fade" data-entered-in="fade">
          <span className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em]">
            Scroll
            <span className="block w-px h-10 bg-gray-500 origin-top animate-pulse" role="none" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Who we are --- */

function IntroSection() {
  const { intro } = siteData.home;
  useTextGuide('[data-intro-text]', 'text-black', 'text-gray-400');

  return (
    <PageSection className="relative bg-white py-24 md:py-36 flex flex-col gap-16" data-home-intro="">
      <Eyebrow>{intro.eyebrow}</Eyebrow>
      <Text tag="p" variant="headline-1" className="!leading-[1.08] md:w-10/12" breakpoints={{ none: 'text-[1.75rem]' }} data-intro-text="">
        {intro.text}
      </Text>
      <ul className="grid grid-cols-2 lg:grid-cols-4 border-t border-gray-300">
        {intro.facts.map((fact) => (
          <li key={fact.label} className="flex flex-col gap-2 pt-6 pr-6">
            <Text tag="div" variant="headline-1" className="text-green">
              <RollingValue value={fact.value} />
            </Text>
            <Text variant="text-base" className="text-gray-800">
              {fact.label}
            </Text>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}

/* ------------------------------------------------- Nature meets science --- */

/**
 * Innovate → Develop → Deliver → Impact as one process. On scroll-in a gold line draws through
 * the four icons (desktop), each icon pops in as the line reaches it and its text rises after.
 * Each step keeps its own number above its title; on hover its icon fills gold.
 */
function WhatWeDoSteps({ items }: { items: (typeof siteData.home.whatWeDo)[number][] }) {
  const root = useRef<HTMLOListElement>(null);

  useMotion(
    () => {
      const el = root.current;
      if (!el) return;
      const ctx = gsap.context(() => {
        const icons = gsap.utils.toArray<HTMLElement>('[data-step-icon]');
        const texts = gsap.utils.toArray<HTMLElement>('[data-step-text]');
        gsap.set('[data-steps-line]', { scaleX: 0 });
        gsap.set(icons, { scale: 0.4, autoAlpha: 0, rotate: -30 });
        gsap.set(texts, { y: 24, autoAlpha: 0 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
        tl.to('[data-steps-line]', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0);
        icons.forEach((icon, i) => {
          tl.to(icon, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.6, ease: 'back.out(2)' }, i * 0.4);
          tl.to(texts[i], { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, i * 0.4 + 0.15);
        });
      }, el);
      return () => ctx.revert();
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );

  return (
    <ol ref={root} className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 border-t border-gray-300 pt-10">
      {/* Runs through the centres of the four icons (pt-10 + half of the 3.5rem icon). */}
      <span
        className="hidden lg:block absolute left-7 right-0 top-[calc(2.5rem+1.75rem)] h-px bg-gold origin-left"
        role="none"
        data-steps-line=""
      />
      {items.map((item, i) => (
        <li key={item.title} className="group relative flex flex-col gap-5 transition-transform duration-500 hover:-translate-y-1">
          <span
            className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-black text-gold ring-8 ring-white transition-colors duration-500 group-hover:bg-gold group-hover:text-black"
            data-step-icon=""
          >
            <Icon name={item.icon} className="w-6 h-6" />
          </span>
          <div className="flex flex-col gap-3" data-step-text="">
            <Text variant="text-sm" className="tracking-[0.2em] text-gold">
              {String(i + 1).padStart(2, '0')}
            </Text>
            <Text tag="h3" variant="headline-3">
              {item.title}
            </Text>
            <Text variant="text-base" className="text-gray-800 max-w-xs">
              {item.text}
            </Text>
          </div>
        </li>
      ))}
    </ol>
  );
}

function NatureScienceSection() {
  const { home } = siteData;
  useHeadingInTween('[data-band-title]', {}, { scrollTrigger: { trigger: '[data-band-title]', start: 'top 85%' } });

  return (
    <PageSection className="relative bg-white py-24 flex flex-col gap-16 md:gap-24">
      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-full lg:col-span-7 flex flex-col gap-6">
          <Eyebrow>{home.bandEyebrow}</Eyebrow>
          <Text tag="h2" variant="display-2" className="!leading-[0.95]" breakpoints={{ none: 'text-[3rem]', lg: 'lg:text-[5.5rem]', xl: 'xl:text-[6.5rem]' }} data-band-title="">
            {lines(home.bandTitle)}
          </Text>
        </div>
        <Text variant="text-xl" className="col-span-full lg:col-span-5 text-gray-900">
          {home.bandText}
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {home.triptych.map((panel, i) => (
          <TriptychPanel key={panel.title} panel={panel} index={i} />
        ))}
      </div>

      <WhatWeDoSteps items={home.whatWeDo} />
    </PageSection>
  );
}

/**
 * One Nature / Science / Life card. When the panel has a `video`, it fades in over the
 * photo and plays while the mouse is over the card, then fades out and pauses on leave
 * (it resumes where it stopped). The file is only fetched on the first hover.
 */
function TriptychPanel({ panel, index }: { panel: (typeof siteData.home.triptych)[number]; index: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const isHovered = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    const el = video.current;
    if (!el || !matchMedia('(pointer: fine)').matches) return;
    isHovered.current = true;
    if (el.preload === 'none') el.preload = 'auto';
    el.play()
      .then(() => {
        // The first play can resolve after the mouse has already left (slow first load).
        if (isHovered.current) setIsPlaying(true);
        else el.pause();
      })
      .catch(() => undefined);
  };
  const pause = () => {
    isHovered.current = false;
    video.current?.pause();
    setIsPlaying(false);
  };

  return (
    <figure
      className={cn('group relative overflow-hidden rounded-lg h-[60vh] md:h-[78vh] bg-black', index === 1 && 'md:mt-16')}
      onMouseEnter={panel.video ? play : undefined}
      onMouseLeave={panel.video ? pause : undefined}
      data-pointer-chaser-text={panel.video ? 'Play' : undefined}
    >
      <div className="absolute inset-x-0 -top-[10%] h-[120%] overflow-hidden" data-parallax="" data-parallax-diorama="">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={panel.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        {panel.video && (
          <video
            ref={video}
            src={panel.video}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none',
              isPlaying ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        <Text variant="text-sm" className="uppercase tracking-[0.2em] text-gold-light">
          0{index + 1}
        </Text>
        <Text variant="headline-2">{panel.title}</Text>
        <Text variant="text-base" className="text-white/85">
          {panel.text}
        </Text>
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------- Focus areas --- */

/** Three tall panels; the hovered one widens and lists its products. */
function FocusAreasSection() {
  const { home, focusAreas } = siteData;
  return (
    <PageSection className="relative bg-white py-24 flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <Eyebrow>{home.focusEyebrow}</Eyebrow>
        <Text tag="h2" variant="headline-1">
          {lines(home.focusTitle)}
        </Text>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[80vh]">
        {focusAreas.map((focus) => {
          const products = getProductsByFocus(focus.type);
          return (
            <Link
              key={focus.type}
              href={`/focus/${focus.type}`}
              scroll={false}
              className="group relative overflow-hidden rounded-lg min-h-[60vh] lg:min-h-0 lg:flex-1 lg:hover:flex-[1.8] transition-[flex-grow] duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]"
              style={{ backgroundColor: focus.color }}
              data-pointer-chaser-text="Explore"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={focus.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity transition-[opacity,transform] duration-700 group-hover:opacity-90 group-hover:scale-105 pointer-events-none"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(to top, ${focus.color} 10%, transparent 70%)` }}
                role="none"
              />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between text-white pointer-events-none">
                <div className="flex justify-between items-start">
                  <Text variant="text-sm" className="uppercase tracking-[0.18em]">
                    {focus.subtitle}
                  </Text>
                  <Icon name={focus.icon} className="w-10 h-10" strokeWidth={1.2} />
                </div>
                <div className="flex flex-col gap-4">
                  <Text tag="h3" variant="display-3" className="!leading-none">
                    {focus.title}
                  </Text>
                  <Text variant="text-base" className="max-w-sm text-white/90">
                    {focus.descriptionShort}
                  </Text>
                  <ul className="flex flex-wrap gap-2">
                    {products.map((product) => (
                      <li key={product.id} className="rounded-full border border-white/50 px-3 py-1 text-sm">
                        {product.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}

/* ------------------------------------------------------- Ingredient wall --- */

const INGREDIENT_TINTS = ['#DCEAD3', '#EDE8C9', '#E4E9D4', '#F1E6C8'];

function IngredientsSection() {
  const { home } = siteData;
  const bounds = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useMotion(
    () => {
      if (!track.current || !bounds.current) return;
      const [instance] = Draggable.create(track.current, {
        type: 'x',
        bounds: bounds.current,
        inertia: true,
        edgeResistance: 0.8,
        activeCursor: 'grabbing',
      });
      return () => void instance.kill();
    },
    () => ({ shouldResetOnResize: [document.body, 'horizontal'] }),
    []
  );

  return (
    <div className="smooth-section">
      <section className="relative bg-white py-24 flex flex-col gap-12">
        <div className="px-6 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-full lg:col-span-8 flex flex-col gap-6">
            <Eyebrow>{home.ingredientsEyebrow}</Eyebrow>
            <Text tag="h2" variant="display-2" className="!leading-[0.95]" breakpoints={{ none: 'text-[3rem]' }}>
              {home.ingredientsTitle}
            </Text>
          </div>
          <Text variant="text-sm" className="col-span-full lg:col-span-4 uppercase tracking-[0.18em] lg:text-right">
            Drag to explore →
          </Text>
        </div>
        <div ref={bounds} className="relative w-screen overflow-hidden" data-pointer-chaser-text="Drag">
          <div ref={track} className="flex w-max gap-4 px-6" data-pointer-chaser-text="Drag">
            {home.ingredients.map((ingredient, i) => (
              <article
                key={ingredient.name}
                className="relative flex flex-col justify-between gap-10 w-[78vw] sm:w-[22rem] h-[26rem] shrink-0 rounded-lg p-6 select-none"
                style={{ backgroundColor: INGREDIENT_TINTS[i % INGREDIENT_TINTS.length] }}
                data-pointer-chaser-text="Drag"
              >
                <div className="flex justify-between items-start pointer-events-none">
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-black text-gold font-wordmark text-3xl">
                    {ingredient.name[0]}
                  </span>
                  <Icon name="leaf" className="w-6 h-6 text-green" />
                </div>
                <div className="flex flex-col gap-3 pointer-events-none">
                  <Text tag="h3" variant="headline-3" className="break-words">
                    {ingredient.name}
                  </Text>
                  <Text variant="text-sm" className="italic text-gray-800">
                    {ingredient.latin}
                  </Text>
                  <Text variant="text-base">{ingredient.role}</Text>
                  <ul className="flex flex-wrap gap-2 pt-2">
                    {ingredient.products.map((name) => (
                      <li key={name} className="rounded-full bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.08em]">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- Future --- */

function FutureSection() {
  const { home, science } = siteData;
  return (
    <div className="smooth-section">
      <section className="relative overflow-hidden bg-black text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={home.futureImage}
          alt=""
          loading="lazy"
          className="absolute right-0 top-0 h-full w-1/2 md:w-1/3 object-cover opacity-50"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 60%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)' }}
        />
        <div className="relative px-6 py-24 md:py-36 flex flex-col gap-12">
          <Text variant="text-sm" className="uppercase tracking-[0.2em] text-gold">
            {home.futureEyebrow}
          </Text>
          <Text tag="h2" variant="display-3" className="!leading-none md:w-8/12" breakpoints={{ none: 'text-[2.25rem]' }}>
            {lines(home.futureTitle)}
          </Text>
          <ul className="flex flex-wrap gap-2 md:w-8/12">
            {science.pipeline.map((item) => (
              <li key={item.name} className="rounded-full border border-white/25 px-4 py-2 text-sm">
                {item.name}
                <span className="text-gold-light"> · coming soon</span>
              </li>
            ))}
          </ul>
          <div>
            <Button is={Link} href="/science" scroll={false} variant="secondary">
              Our science
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------- Partner + trust --- */

function PartnerSection() {
  const { home } = siteData;
  const badges = home.trust.filter((b) => b.show);
  return (
    <PageSection className="relative bg-white py-24 flex flex-col gap-12">
      <div className="grid grid-cols-12 gap-6 items-end">
        <Text tag="h2" variant="display-2" className="col-span-full lg:col-span-7 !leading-[0.95]" breakpoints={{ none: 'text-[3rem]' }}>
          {home.partnerTitle}
        </Text>
        <div className="col-span-full lg:col-span-5 flex flex-col gap-6">
          <Text variant="text-xl">{home.partnerText}</Text>
          <div className="flex flex-wrap gap-3">
            <Button is={Link} href="/contact?reason=distributor" scroll={false}>
              Become a partner
            </Button>
            <Button is={Link} href="/products" scroll={false} variant="ghost">
              View products
            </Button>
          </div>
        </div>
      </div>
      <div className="gold-rule" role="none" />
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
        <Text variant="text-sm" className="uppercase tracking-[0.18em] shrink-0">
          {home.trustTitle}
        </Text>
        <ul className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <li key={badge.label} className="flex items-center gap-2 rounded-full border border-gray-400 px-4 py-2">
              <Icon name={badge.icon} className="w-4 h-4 text-green" />
              <Text tag="span" variant="text-base">
                {badge.label}
              </Text>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
        <Text variant="text-sm" className="uppercase tracking-[0.18em] shrink-0">
          Recognised by
        </Text>
        <CredentialLogoStrip tileClassName="h-16 w-36 border border-gray-300" />
      </div>
    </PageSection>
  );
}

/* ------------------------------------------------------------------ Page --- */

export default function Home() {
  const { home } = siteData;
  const heading = useHeadingInTween('[data-hero-heading] span');
  const headingRef = useLatest(heading);
  const [ui] = useUI();
  const getBlob = useBlobChasing();
  const showOrb = !home.heroVideo;

  // Draw while the blob is visible, plus one last frame to clear it once it has faded out.
  const blobDrawn = useRef(true);
  useTicker(() => {
    if (!showOrb) return;
    const { blob, renderer, scene, camera } = getBlob();
    if (!blob) return;
    const visible = blob.material.opacity > 0.002;
    if (!visible && !blobDrawn.current) return;
    blobDrawn.current = visible;
    renderer.render(scene, camera);
  });

  useMotion(() => void (showOrb && fadeBlob(getBlob, 1)), { enable: () => !ui.isLoaderViewToggled }, [ui.isLoaderViewToggled]);

  // The orb belongs to the hero: hide it once the story starts.
  useMotion(
    () => {
      if (!showOrb) return;
      const trigger = ScrollTrigger.create({
        trigger: '[data-home-intro]',
        start: 'top 60%',
        endTrigger: 'html',
        end: 'bottom bottom',
        onEnter: () => fadeBlob(getBlob, 0),
        onLeaveBack: () => fadeBlob(getBlob, 1),
      });
      return () => trigger.kill();
    },
    {},
    []
  );

  // Parallax-fade the hero copy as it scrolls away.
  useMotion(
    () => {
      const tween = gsap.to('[data-home-hero] > div.relative', {
        y: -80,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '[data-home-hero]', start: 'top top', end: 'bottom top', scrub: true },
      });
      return () => void tween.revert().kill();
    },
    { matchMedia: `(min-width: ${breakpoints.sm}) and (prefers-reduced-motion: no-preference)` },
    []
  );

  useScreenTransition({
    leave(_, duration) {
      const tween = headingRef.current;
      if (tween) {
        tween.duration(duration / 2);
        tween.reverse();
      }
      if (showOrb) fadeBlob(getBlob, 0);
    },
  });

  return (
    <PageLayout
      pageNavigationProps={{ borderColor: 'var(--color-gray-300)', backgroundColor: 'var(--color-cream)' }}
      fixedBack={<FixedBack />}
    >
      <HeroSection />
      <IntroSection />
      <NatureScienceSection />
      <StorySection />
      <FocusAreasSection />
      <IngredientsSection />
      <FutureSection />
      <PartnerSection />
    </PageLayout>
  );
}
