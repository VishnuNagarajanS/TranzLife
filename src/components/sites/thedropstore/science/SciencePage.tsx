'use client';

import React from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/dropstore/gsap';
import { useMotion } from '@/lib/dropstore/motion';
import { useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { siteData } from '@/lib/tranzlife-data';
import { PageLayout } from '../PageLayout';
import { Eyebrow, PageSection, SocialsSection, useTextGuide } from '../sections';
import { Text } from '../Text';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { useScreenTransition } from '../ScreenTransition';
import { Helix } from './Helix';

export function SciencePage() {
  const { science } = siteData;
  const heading = useHeadingInTween('h1', {}, { delay: 0.3 });
  useTextGuide('[data-science-intro]');

  useScreenTransition({
    leave(_, duration) {
      heading?.duration(duration / 2);
      heading?.reverse();
    },
  });

  useMotion(
    () => {
      const tween = gsap.from('[data-pipeline-card]', {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-pipeline]', start: 'top 75%' },
      });
      return () => void tween.revert().kill();
    },
    { matchMedia: '(prefers-reduced-motion: no-preference)' },
    []
  );

  return (
    <PageLayout pageNavigationProps={{ borderColor: 'var(--color-gray-300)', backgroundColor: 'var(--color-cream)' }}>
      <PageSection className="relative min-h-screen grid grid-cols-12 gap-6 items-center py-24" style={{ paddingTop: 'var(--nav-space-top)' }}>
        <div className="col-span-full lg:col-span-8 flex flex-col gap-8 relative z-10">
          <Eyebrow>Science at TranzLife</Eyebrow>
          <Text tag="h1" variant="display-3" className="whitespace-pre-line !leading-none" breakpoints={{ none: 'text-[2.25rem]' }}>
            {science.heroTitle}
          </Text>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 lg:static lg:w-auto lg:col-span-4 flex justify-center opacity-30 lg:opacity-100"
          data-loaded-in="fade"
          data-entered-in="fade"
          data-exiting="fade"
        >
          <Helix className="h-[80vh] w-auto" />
        </div>
      </PageSection>

      <PageSection className="bg-white py-24 grid grid-cols-12 gap-6">
        <Text variant="text-xl" className="col-span-full md:col-start-4 md:col-span-8 lg:col-start-6 lg:col-span-6 xl:text-[1.75rem] !leading-snug" data-science-intro="">
          {science.intro}
        </Text>
      </PageSection>

      <PageSection className="bg-white py-24 flex flex-col gap-12">
        <Text tag="h2" variant="headline-1">
          {science.pillarsTitle}
        </Text>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-gray-300">
          {science.pillars.map((pillar, i) => (
            <li key={pillar.title} className="flex flex-col justify-between gap-16 p-6 border-r border-b border-gray-300 min-h-72">
              <div className="flex justify-between items-start">
                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-black text-gold">
                  <Icon name={pillar.icon} className="w-6 h-6" />
                </span>
                <Text variant="text-sm" className="text-gray-700">
                  0{i + 1}
                </Text>
              </div>
              <div className="flex flex-col gap-3">
                <Text tag="h3" variant="headline-4" className="!text-2xl">
                  {pillar.title}
                </Text>
                <Text variant="text-base" className="text-gray-800">
                  {pillar.text}
                </Text>
              </div>
            </li>
          ))}
        </ol>
      </PageSection>

      <div className="smooth-section">
        <section className="bg-black text-white px-6 py-24 md:py-36 flex flex-col gap-16" data-pipeline="">
          <div className="grid grid-cols-12 gap-6">
            <Text tag="h2" variant="display-2" className="col-span-full lg:col-span-7" breakpoints={{ none: 'text-[3rem]' }}>
              {science.comingTitle}
            </Text>
            <Text variant="text-xl" className="col-span-full lg:col-span-5 self-end text-white/80">
              {science.comingIntro}
            </Text>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {science.pipeline.map((item) => (
              <li key={item.name} className="relative flex flex-col justify-between gap-16 rounded-lg border border-white/15 p-6 min-h-64" data-pipeline-card="">
                <div className="flex justify-between items-center">
                  <Text variant="text-sm" className="uppercase tracking-[0.18em] text-gold">
                    {item.group}
                  </Text>
                  <span className="rounded-full border border-gold/60 px-3 py-1 text-xs uppercase tracking-[0.12em] text-gold-light">
                    Coming soon
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Text variant="headline-2">{item.name}</Text>
                  <Text variant="text-base" className="text-white/70">
                    {item.text}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
          <div>
            <Button is={Link} href="/contact?reason=research" scroll={false} variant="secondary">
              Collaborate on research
            </Button>
          </div>
        </section>
      </div>
      <SocialsSection withTitle />
    </PageLayout>
  );
}
