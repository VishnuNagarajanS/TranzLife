'use client';

import React from 'react';
import { siteData } from '@/lib/tranzlife-data';
import { PageLayout } from '../PageLayout';
import { Text } from '../Text';

const SECTIONS = [
  {
    title: 'Product information',
    text: 'TranzLife products are nutraceuticals, Ayurvedic proprietary medicines and aromatherapy products. Each product is labelled with its correct category; please read the label before use. Nutraceutical products are not for medicinal use.',
  },
  {
    title: 'Not medical advice',
    text: 'The information on this website is for general information only. It is not intended to diagnose, treat, cure or prevent any disease, and it does not replace advice from a qualified healthcare professional. Consult your doctor before starting any supplement, particularly if you are pregnant, nursing, taking medication or have a medical condition.',
  },
  {
    title: 'Results',
    text: 'Individual experiences vary. Statements about ingredients describe their traditional use or general role and are not a promise of a specific result.',
  },
  {
    title: 'Quitting tobacco',
    text: 'The Craving Control series and BreatheFree are aromatherapy products. They are not nicotine replacement therapy or a medicine for smoking cessation. Speak to a doctor about support for quitting tobacco.',
  },
  {
    title: 'Images and availability',
    text: 'Pack images on this website are illustrations and may differ from the product you receive. Products shown as “coming soon” are in development and are not yet available for sale.',
  },
];

export function DisclaimerPage() {
  const { brand, contact } = siteData;
  return (
    <PageLayout className="bg-black text-white" pageNavigationProps={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="container mx-auto px-6 pt-[calc(var(--nav-space-top)+3rem)] pb-24 flex flex-col gap-12">
        <Text tag="h1" variant="headline-1">
          Disclaimer
        </Text>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <Text tag="h2" variant="text-lg" className="text-gold">
                {section.title}
              </Text>
              <Text className="text-white/80">{section.text}</Text>
            </div>
          ))}
        </div>
        <Text variant="text-sm" className="text-white/60 max-w-xl">
          {brand.company}, {contact.address.join(', ')}. Questions about this disclaimer: {contact.email}.
        </Text>
      </div>
    </PageLayout>
  );
}
