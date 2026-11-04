'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap, ScrollTrigger } from '@/lib/dropstore/gsap';
import { useMotion, useTicker } from '@/lib/dropstore/motion';
import { useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { useBlobChasing } from '@/lib/dropstore/blob';
import { siteData } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/sites/thedropstore/PageLayout';
import { Text } from '@/components/sites/thedropstore/Text';
import { Button } from '@/components/sites/thedropstore/Button';
import { Icon } from '@/components/sites/thedropstore/Icon';
import { Eyebrow, PageSection, SocialsSection, useTextGuide } from '@/components/sites/thedropstore/sections';
import { useScreenTransition } from '@/components/sites/thedropstore/ScreenTransition';
import { AboutHeroSection } from '@/components/sites/thedropstore/about/AboutHeroSection';
import { CredentialLogo } from '@/components/sites/thedropstore/CredentialLogos';
import { RecognitionSection } from '@/components/sites/thedropstore/about/RecognitionSection';

// PageLayout doesn't forward a ref, so its root is located through this marker class.
const LAYOUT_MARKER = 'about-page-layout';

const ROOT_TINTS = ['#DCEAD3', '#E6E9DA', '#F1E6C8'];

/** Roots of nature: three research-driven themes, each beside a parallax art panel. */
function RootsSection() {
  const { about } = siteData;
  useTextGuide('[data-roots-text]');

  return (
    <div className="flex flex-col py-6 gap-12 sm:gap-4 bg-white" data-entered-in="-y" data-loaded-in="-y" data-exiting="y">
      <PageSection className="py-12">
        <Eyebrow>{about.rootsTitle}</Eyebrow>
      </PageSection>
      {about.roots.map((item, i) => (
        <PageSection key={item.title} className={cn('flex flex-col-reverse md:grid md:grid-cols-2 gap-6 md:min-h-[80vh]')}>
          <div className="flex flex-col gap-6 sm:py-2 justify-between">
            <Text tag="h2" variant="headline-2" className="!leading-none md:hidden">
              {item.title}
            </Text>
            <div className="lg:grid grid-cols-6 gap-6">
              <Text className="col-span-5" variant="text-xl" data-roots-text="">
                {item.text}
              </Text>
            </div>
            <Text variant="text-sm" className="text-gray-700">
              0{i + 1} / 0{about.roots.length}
            </Text>
          </div>
          <div className="relative overflow-hidden rounded-lg aspect-square md:aspect-[684/760]" style={{ backgroundColor: ROOT_TINTS[i % ROOT_TINTS.length] }}>
            <div className="absolute inset-x-0 -top-[10%] h-[120%] flex items-center justify-center text-green" data-parallax="" data-parallax-diorama="">
              <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full" aria-hidden>
                <g fill="none" stroke="#2F7D46" strokeOpacity={0.15}>
                  {[80, 130, 180, 230].map((r) => (
                    <circle key={r} cx="200" cy="200" r={r} />
                  ))}
                </g>
              </svg>
              <Icon name={item.art === 'flask' ? 'develop' : item.art} className="relative w-1/3 h-1/3" strokeWidth={0.8} />
            </div>
            <div className="absolute w-full p-6 left-0 bottom-0">
              <Text tag="h2" variant="display-2" className="hidden md:block !leading-[0.9]">
                {item.title}
              </Text>
            </div>
          </div>
        </PageSection>
      ))}
    </div>
  );
}

/** The vision as one huge statement (words fill on scroll), then the mission one point at a time. */
function VisionMissionSection() {
  const { about } = siteData;
  useTextGuide('[data-vision-text]', 'text-black', 'text-gray-400');

  useMotion(
    () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-mission-item]').forEach((item) => {
          gsap.from(item, {
            opacity: 0,
            y: 60,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 85%' },
          });
        });
      });
      return () => ctx.revert();
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );

  return (
    <PageSection className="bg-white flex flex-col gap-24 py-24 md:py-36">
      <div className="flex flex-col gap-8">
        <Eyebrow>{about.visionTitle}</Eyebrow>
        <Text tag="p" variant="display-3" className="!leading-[1] md:w-11/12" breakpoints={{ none: 'text-[2rem]' }} data-vision-text="">
          {about.vision}
        </Text>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full lg:col-span-4">
          <Eyebrow>{about.missionTitle}</Eyebrow>
        </div>
        <ol className="col-span-full lg:col-start-5 lg:col-span-8 flex flex-col border-t border-gray-300">
          {about.mission.map((point, i) => (
            <li key={point} className="grid grid-cols-12 gap-6 py-8 border-b border-gray-300" data-mission-item="">
              <Text variant="headline-3" className="col-span-2 text-gold">
                0{i + 1}
              </Text>
              <Text variant="text-xl" className="col-span-10">
                {point}
              </Text>
            </li>
          ))}
        </ol>
      </div>
    </PageSection>
  );
}

/** Five values on a dark-green strip, as in the brochure. */
function ValuesBand() {
  const { about } = siteData;
  return (
    <div className="smooth-section">
      <section className="bg-black text-white px-6 py-16 md:py-24">
        <div className="flex flex-col gap-12">
          <Text variant="text-sm" className="uppercase tracking-[0.18em] text-gold">
            {about.valuesTitle}
          </Text>
          <ul className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-6">
            {about.values.map((value) => (
              <li key={value.title} className="flex flex-col items-start gap-4">
                <span className="flex items-center justify-center w-16 h-16 rounded-full border border-gold text-gold">
                  <Icon name={value.icon} className="w-7 h-7" strokeWidth={1.2} />
                </span>
                <Text variant="headline-3">{value.title}</Text>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

/** Innovate, Develop, Deliver, Impact: each title brightens as it reaches the middle of the screen. */
function WhatWeDoSection() {
  const { about, home } = siteData;
  useMotion(
    () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-wwd-item]').forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0.15 },
            { opacity: 1, ease: 'none', scrollTrigger: { trigger: item, start: 'top 75%', end: 'center center', scrub: true } }
          );
        });
      });
      return () => ctx.revert();
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );

  return (
    <PageSection className="bg-white py-24 flex flex-col gap-12">
      <Eyebrow>{about.whatWeDoTitle}</Eyebrow>
      <div className="flex flex-col">
        {home.whatWeDo.map((item) => (
          <div key={item.title} className="grid grid-cols-12 gap-6 items-end py-6 border-b border-gray-300" data-wwd-item="">
            <Text tag="h3" variant="display-2" className="col-span-full md:col-span-7 !leading-[0.9]" breakpoints={{ none: 'text-[3.5rem]' }}>
              {item.title}
            </Text>
            <div className="col-span-full md:col-span-5 flex items-center gap-4 pb-2">
              <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-black text-gold">
                <Icon name={item.icon} className="w-5 h-5" />
              </span>
              <Text variant="text-lg">{item.text}</Text>
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}

function StrengthsSection() {
  const { about } = siteData;
  return (
    <PageSection className="bg-white py-24 flex flex-col gap-12">
      <Text tag="h2" variant="headline-1">
        {about.strengthsTitle}
      </Text>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {about.strengths.map((strength, i) => (
          <li key={strength.title} className="flex flex-col justify-between gap-12 rounded-lg bg-gray-200 p-6 min-h-64">
            <Text variant="text-sm" className="text-gold">
              0{i + 1}
            </Text>
            <div className="flex flex-col gap-3">
              <Text variant="headline-4" className="!text-2xl">
                {strength.title}
              </Text>
              <Text variant="text-base" className="text-gray-800">
                {strength.text}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}

/** Registrations shown as text tiles; GMP / ISO stay hidden until certified (`show` in the JSON). */
function CredentialsSection() {
  const { about } = siteData;
  const credentials = about.credentials.filter((c) => c.show);
  return (
    <PageSection className="bg-white py-24 flex flex-col gap-12" id="credentials">
      <Text tag="h2" variant="headline-1">
        {about.credentialsTitle}
      </Text>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-t border-l border-gray-300">
        {credentials.map((credential) => (
          <li
            key={credential.title}
            className="group relative flex flex-col justify-between gap-10 p-6 border-r border-b border-gray-300 min-h-56 transition-colors duration-500 hover:bg-black hover:text-white"
          >
            {credential.logo ? (
              <CredentialLogo credential={{ ...credential, logo: credential.logo }} className="h-24 w-full p-4 shadow-sm" />
            ) : (
              <Icon name="badge" className="w-6 h-6 text-gold" />
            )}
            <div className="flex flex-col gap-2">
              <Text variant="headline-4" className="!text-2xl">
                {credential.title}
              </Text>
              <Text variant="text-sm" className="opacity-70">
                {credential.description}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}

function JoinSection() {
  const { about } = siteData;
  useHeadingInTween('[data-join-title]', {}, { scrollTrigger: { trigger: '[data-join-title]', start: 'top 85%' } });
  return (
    <PageSection className="relative bg-gray-200 py-24 md:py-36 flex flex-col gap-16" id="join">
      <div className="grid grid-cols-12 gap-6">
        <Text tag="h2" variant="display-2" className="col-span-full lg:col-span-8" breakpoints={{ none: 'text-[3rem]' }} data-join-title="">
          {about.joinTitle}
        </Text>
        <Text variant="text-xl" className="col-span-full lg:col-span-4 self-end">
          {about.joinText}
        </Text>
      </div>
      <ul className="grid md:grid-cols-3 gap-4">
        {about.joinOptions.map((option) => (
          <li key={option.title} className="flex flex-col gap-10 rounded-lg bg-white p-6">
            <div className="w-2 h-2 rounded-full bg-gold" role="none" />
            <div className="flex flex-col gap-2">
              <Text variant="headline-3">{option.title}</Text>
              <Text variant="text-base" className="text-gray-800">
                {option.text}
              </Text>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <Button is={Link} href="/contact" scroll={false}>
          Start a conversation
        </Button>
      </div>
    </PageSection>
  );
}

function MottoSection() {
  const { brand } = siteData;
  useTextGuide('[data-motto]', 'text-black', 'text-gray-400');
  return (
    <PageSection className="bg-white py-24 md:py-40">
      <Text tag="p" variant="display-3" className="text-center mx-auto md:w-10/12 !leading-[1]" breakpoints={{ none: 'text-[2rem]' }} data-motto="">
        {brand.motto}
      </Text>
    </PageSection>
  );
}

export function AboutPage() {
  const shouldRender = useRef(true);
  const getBlob = useBlobChasing();
  const pathname = usePathname();

  useTicker(() => {
    if (!shouldRender.current) return;
    const { renderer, scene, camera } = getBlob();
    renderer.render(scene, camera);
  });

  // The essence drop accompanies the hero, then fades as the story starts.
  useMotion(
    () => {
      const trigger = ScrollTrigger.create({
        trigger: '[data-roots-anchor]',
        start: 'top center',
        onEnter: () => gsap.to(getBlob().blob.material, { opacity: 0, duration: 0.5 }),
        onLeaveBack: () => gsap.to(getBlob().blob.material, { opacity: 1, duration: 0.5 }),
      });
      return () => trigger.kill();
    },
    {},
    []
  );

  useEffect(() => {
    document.querySelector(`.${LAYOUT_MARKER}`)?.setAttribute('data-exiting', 'fade');
  }, []);

  useScreenTransition({
    enter(_, duration) {
      const { blob, renderer, scene, camera } = getBlob();
      gsap.to(blob.material, {
        opacity: 1,
        duration: 0.5 * duration,
        onUpdate() {
          renderer.render(scene, camera);
        },
      });
    },
    idle(_, duration) {
      const { blob } = getBlob();
      if (window.scrollY < window.innerHeight / 2) gsap.to(blob.material, { opacity: 1, duration: 0.5 * duration });
    },
    leave(_, duration) {
      const { blob, scene, renderer, camera } = getBlob();
      if (pathname === '/') return;
      shouldRender.current = false;
      gsap.to(blob.material, {
        opacity: 0,
        duration,
        onUpdate() {
          renderer.render(scene, camera);
        },
      });
    },
  });

  return (
    <PageLayout className={LAYOUT_MARKER} pageNavigationProps={{ borderColor: 'var(--color-gray-300)', backgroundColor: 'var(--color-cream)' }}>
      <AboutHeroSection />
      <div data-roots-anchor="" />
      <RootsSection />
      <VisionMissionSection />
      <ValuesBand />
      <WhatWeDoSection />
      <StrengthsSection />
      <RecognitionSection />
      <CredentialsSection />
      <JoinSection />
      <MottoSection />
      <SocialsSection withTitle />
    </PageLayout>
  );
}
