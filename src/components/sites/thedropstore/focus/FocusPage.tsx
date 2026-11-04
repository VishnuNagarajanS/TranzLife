'use client';

import React, { Fragment, useEffect } from 'react';
import Link from 'next/link';
import { useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { siteData, getProductsByFocus, type FocusArea } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { PageLayout } from '../PageLayout';
import { PageSection, useTextGuide } from '../sections';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { useUI } from '../state';
import { useScreenTransition } from '../ScreenTransition';
import { ProductTile, ProductTransitionContainer } from '../ProductTile';
import { FocusArt } from './FocusArt';
import styles from './FocusPage.module.css';

function FocusLabel({ focus }: { focus: FocusArea }) {
  return (
    <div
      className="relative h-20 flex items-center justify-between rounded-md overflow-hidden px-4 text-white"
      style={{ background: focus.color }}
      data-entered-in="-y"
      data-exiting="fade"
      data-loaded-in="-y"
    >
      <Text variant="text-sm" className="uppercase tracking-[0.18em]">
        Focus area · {focus.subtitle}
      </Text>
      <Icon name={focus.icon} className="w-12 h-12" strokeWidth={1.2} />
    </div>
  );
}

export function FocusPage({ focus }: { focus: FocusArea }) {
  const [ui] = useUI();
  const heading = useHeadingInTween('h1', {}, { delay: 0.5 });
  const products = getProductsByFocus(focus.type);

  useTextGuide('#description');
  useTextGuide('[data-focus-block-text]');

  useEffect(() => {
    heading?.paused(ui.isLoaderViewToggled);
  }, [ui.isLoaderViewToggled, heading]);

  useScreenTransition({
    leave(_, duration) {
      heading?.duration(duration / 2);
      heading?.reverse();
    },
  });

  return (
    <PageLayout pageNavigationProps={{ borderColor: 'var(--color-gray-300)', backgroundColor: 'var(--color-cream)' }}>
      <div className="flex flex-col gap-6 py-6">
        <PageSection style={{ paddingTop: 'var(--nav-space-top)' }}>
          <FocusLabel focus={focus} />
          <Text tag="h1" className="my-6 !leading-none" variant="display-2" data-focus-title={focus.title}>
            {focus.title}
          </Text>
        </PageSection>

        <PageSection className={styles.image} data-entered-in="-y" data-exiting="fade" data-loaded-in="-y">
          <FocusArt focus={focus} className="h-full w-full" iconClassName="w-1/4 h-1/4" />
        </PageSection>

        <PageSection className={cn(styles.text, 'block lg:grid grid-cols-12 gap-6')} data-entered-in="-y" data-loaded-in="-y" data-exiting="fade">
          <div className="py-6 col-span-5">
            <Text variant="headline-3">{focus.descriptionShort}</Text>
          </div>
          <div className="py-6 col-start-7 col-span-6">
            <Text id="description" variant="text-lg" className="whitespace-pre-line">
              {focus.description.split('\n').map((line, i) => (
                <Fragment key={i}>
                  {line}
                  <br />
                </Fragment>
              ))}
            </Text>
          </div>
        </PageSection>

        <PageSection className="grid md:grid-cols-2 gap-6 py-12">
          {[
            { title: focus.whoTitle, text: focus.whoText, icon: 'family' },
            { title: focus.whatTitle, text: focus.whatText, icon: 'spark' },
          ].map((block) => (
            <div key={block.title} className="flex flex-col gap-6 rounded-lg p-6 md:p-10 bg-gray-100">
              <span className="flex items-center justify-center w-12 h-12 rounded-full text-white" style={{ backgroundColor: focus.color }}>
                <Icon name={block.icon} className="w-5 h-5" />
              </span>
              <Text tag="h2" variant="headline-1">
                {block.title}
              </Text>
              <Text variant="text-lg" data-focus-block-text="">
                {block.text}
              </Text>
            </div>
          ))}
        </PageSection>

        {products.length > 0 && (
          <PageSection className="flex flex-col gap-8 py-12">
            <Text variant="headline-2">
              {focus.title} products
              <span className="text-gray-600"> · {products.length}</span>
            </Text>
            <div className="flex flex-wrap gap-6">
              {products.map((product) => (
                <ProductTransitionContainer key={product.id} product={product}>
                  <ProductTile product={product} />
                </ProductTransitionContainer>
              ))}
            </div>
          </PageSection>
        )}

        <PageSection data-entered-in="-y" data-loaded-in="-y" data-exiting="fade">
          <Text className="py-6">Explore other focus areas</Text>
          <div className="flex flex-col sm:grid grid-cols-12 gap-6 border-t border-gray-300">
            {siteData.focusAreas
              .filter((other) => other.type !== focus.type)
              .map((other) => (
                <Link
                  key={other.type}
                  href={`/focus/${other.type}`}
                  scroll={false}
                  className={cn(
                    'group col-span-6 flex flex-col gap-6 py-6',
                    'border-b border-gray-300 hover:border-black transition-colors duration-300'
                  )}
                  data-pointer-chaser-text="Explore"
                >
                  <FocusArt focus={other} className="aspect-square pointer-events-none" />
                  <div className="flex justify-between gap-6 pointer-events-none">
                    <Text variant="headline-3">{other.title}</Text>
                    <Icon name="spark" className="w-5 h-5 text-gold transition-opacity duration-300 opacity-100 lg:opacity-0 group-hover:opacity-100" />
                  </div>
                  <Text className="pointer-events-none">{other.descriptionShort}</Text>
                </Link>
              ))}
          </div>
        </PageSection>
      </div>
    </PageLayout>
  );
}
