'use client';

import React from 'react';
import { useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { siteData } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { Text } from '../Text';
import { PageSection, Eyebrow } from '../sections';
import { LogoMark } from '../Logo';
import { useScreenTransition } from '../ScreenTransition';

export function AboutHeroSection() {
  const { about } = siteData;
  const tween = useHeadingInTween('h1');

  useScreenTransition({
    leave(_, duration) {
      tween?.duration(duration / 2);
      tween?.reverse();
    },
  });

  return (
    <PageSection
      className={cn('min-h-screen', 'flex flex-col justify-center items-center gap-10 py-24')}
      style={{ paddingTop: 'var(--nav-space-top)' }}
      data-pointer-chaser-text="Scroll"
    >
      <div data-loaded-in="fade" data-entered-in="fade" data-exiting="fade">
        <LogoMark size="large" className="w-40 md:w-56 h-auto" />
      </div>
      <Eyebrow className="justify-center">{about.heroTitle}</Eyebrow>
      <Text
        tag="h1"
        variant="display-3"
        className={cn('text-center mx-auto !leading-none pointer-events-none', 'max-w-screen-lg w-full md:w-10/12')}
        breakpoints={{ none: 'text-[2rem]' }}
        data-hero-heading=""
      >
        {about.heroText}
      </Text>
    </PageSection>
  );
}
