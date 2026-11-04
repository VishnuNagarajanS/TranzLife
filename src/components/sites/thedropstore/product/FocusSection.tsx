'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { siteData, type FocusType } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { PageSection, useTextGuide } from '../sections';
import { Text } from '../Text';
import { Button } from '../Button';
import { FocusArt } from '../focus/FocusArt';

/** Product page block linking to the product's focus area (Breathe, Cleanse or Balance). */
export function FocusSection({ type }: { type: FocusType }) {
  const focus = siteData.focusAreas.find((f) => f.type === type);
  useTextGuide('[data-focus-text]');
  if (!focus) return <></>;

  return (
    <PageSection className="max-min-screen-3xl flex flex-col gap-16 md:gap-24 mx-auto py-12" data-pdp-focus-section="">
      <Grid
        imageLeft
        imageContent={<FocusArt focus={focus} className="aspect-square" />}
        textContent={
          <Fragment>
            <Text variant="text-sm" className="uppercase tracking-[0.18em]" style={{ color: focus.color }}>
              Focus area · {focus.subtitle}
            </Text>
            <Text tag="h2" variant="headline-1">
              {focus.title}
            </Text>
            <Text variant="text-lg" data-focus-text="">
              {focus.descriptionShort}
            </Text>
            <Text variant="text-lg" data-focus-text="">
              {focus.whoText}
            </Text>
            <div className="flex flex-wrap gap-3">
              <Button is={Link} scroll={false} className="w-fit" href={`/focus/${focus.type}`}>
                Explore {focus.title}
              </Button>
              <Button is={Link} scroll={false} variant="ghost" className="w-fit" href="/about">
                Read our story
              </Button>
            </div>
          </Fragment>
        }
      />
    </PageSection>
  );
}

function Grid({ imageContent, textContent, imageLeft }: { imageContent: React.ReactNode; textContent: React.ReactNode; imageLeft?: boolean }) {
  const image = <div className={cn('col-span-6', !imageLeft && 'col-start-7 col-end-13')}>{imageContent}</div>;
  const text = (
    <div
      className={cn(
        'flex flex-col gap-6',
        imageLeft ? 'col-start-7 col-end-13 lg:col-start-8 lg:col-end-12' : 'col-span-6 lg:col-start-2 lg:col-end-6'
      )}
    >
      {textContent}
    </div>
  );
  return (
    <div className={cn('flex gap-6', imageLeft ? 'flex-col' : 'flex-col-reverse', 'sm:grid sm:items-center grid-cols-12')}>
      {imageLeft ? image : text}
      {imageLeft ? text : image}
    </div>
  );
}
