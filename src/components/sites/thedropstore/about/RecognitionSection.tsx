'use client';

import React from 'react';
import { siteData } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { Text } from '../Text';
import { Eyebrow, PageSection } from '../sections';

/** "On the global stage": event photos, the NRDC one largest; captions show on hover. */
export function RecognitionSection() {
  const { about } = siteData;
  const [first, ...rest] = about.events;
  return (
    <PageSection className="relative bg-white py-24 flex flex-col gap-12">
      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-full lg:col-span-7 flex flex-col gap-6">
          <Eyebrow>{about.recognitionEyebrow}</Eyebrow>
          <Text tag="h2" variant="headline-1">
            {about.recognitionTitle}
          </Text>
        </div>
        <Text variant="text-lg" className="col-span-full lg:col-span-5 text-gray-900">
          {about.recognitionText}
        </Text>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <EventPhoto event={first} className="col-span-2 row-span-2 aspect-[4/3] md:aspect-auto" />
        {rest.map((event) => (
          <EventPhoto key={event.image} event={event} className="aspect-[4/5]" />
        ))}
      </div>
    </PageSection>
  );
}

function EventPhoto({ event, className }: { event: { image: string; caption: string }; className?: string }) {
  return (
    <figure className={cn('group relative overflow-hidden rounded-lg bg-gray-200', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={event.image}
        alt={event.caption}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
      />
      <figcaption className="absolute inset-x-0 bottom-0 p-3 text-xs text-white bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {event.caption}
      </figcaption>
    </figure>
  );
}
