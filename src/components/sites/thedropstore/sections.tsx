'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/dropstore/gsap';
import { useMotion } from '@/lib/dropstore/motion';
import { siteData, isRouteLink } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { Text } from './Text';

export function PageSection({
  children,
  className,
  smooth = true,
  ...rest
}: { children?: React.ReactNode; className?: string; smooth?: boolean } & React.HTMLAttributes<HTMLDivElement> &
  Record<string, unknown>) {
  return (
    <section className={cn(smooth && 'smooth-section')}>
      <div className={cn('px-6', className)} {...rest}>
        {children}
      </div>
    </section>
  );
}

/** Height of the fixed navigation in px, read from `--nav-space-top`. */
export function getNavbarHeight() {
  return parseInt(getComputedStyle(document.body).getPropertyValue('--nav-space-top').trim()) || 58;
}

/**
 * Scroll-driven "reading guide": words start grey and turn black one by one
 * as each paragraph scrolls through the middle of the viewport.
 */
export function useTextGuide(selector: string, activeClass = 'text-black', inactiveClass = 'text-gray-500') {
  const split = useRef<SplitText>(undefined);

  useMotion(
    () => {
      const elements = gsap.utils.toArray<HTMLElement>(selector);
      if (!elements.length) return;
      const st = (split.current ??= new SplitText(selector, { type: 'lines,words' }));
      const navHeight = getNavbarHeight();
      const wordsByElement = new Map<HTMLElement, HTMLElement[]>(elements.map((e) => [e, []]));
      st.words.forEach((w) => {
        w.classList.remove(activeClass);
        w.classList.add(inactiveClass, 'transition-colors');
      });
      (st.lines as HTMLElement[]).forEach((line) => {
        const owner = line.parentElement as HTMLElement;
        const words = (st.words as HTMLElement[]).filter((w) => w.parentElement === line);
        wordsByElement.get(owner)?.push(...words);
      });
      const ctx = gsap.context(() => {
        elements.forEach((el) => {
          const words = wordsByElement.get(el);
          if (!words) return;
          ScrollTrigger.create({
            trigger: el,
            start: `top center+=${navHeight}`,
            end: `bottom center+=${navHeight}`,
            onUpdate: (self) => {
              const count = Math.round(gsap.utils.interpolate(0, words.length, self.progress));
              words.forEach((w, i) => {
                w.classList.toggle(activeClass, i < count);
                w.classList.toggle(inactiveClass, i >= count);
              });
            },
          });
        });
      });
      return () => {
        ctx.kill(true);
        split.current?.revert();
        split.current = undefined;
      };
    },
    () => ({ shouldResetOnResize: [document.body, 'horizontal'] }),
    [selector]
  );
}

/** Huge contact links; on hover the label slides right and an arrow slides in. */
export function SocialsSection({ withTitle }: { withTitle?: boolean }) {
  const { socials } = siteData;
  return (
    <PageSection className="flex flex-col gap-20 bg-white pt-10">
      {withTitle && (
        <Text tag="h3" variant="headline-1" className="text-right md:w-10/12 self-end">
          {socials.title}
        </Text>
      )}
      <div>
        {socials.links.map((link) => {
          const isRoute = isRouteLink(link.url);
          const Tag = (isRoute ? Link : 'a') as React.ElementType;
          return (
            <Tag
              key={link.url}
              href={link.url}
              {...(isRoute ? { scroll: false } : {})}
              className="socials-link flex justify-between items-center"
              data-pointer-chaser-text={link.text}
              data-social-link=""
            >
              <Text
                tag="span"
                variant="display-3"
                className="socials-link-text !block w-full !leading-none whitespace-nowrap py-4 md:py-6"
                data-pointer-chaser-text={link.text}
              >
                {link.text}
              </Text>
              <ArrowUpRight className="socials-link-icon hidden sm:block w-16 h-16 text-gold" strokeWidth={1} aria-hidden />
            </Tag>
          );
        })}
      </div>
    </PageSection>
  );
}

/** Small uppercase label with a gold dot, used above section headlines. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-sm uppercase tracking-[0.18em]', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-gold" role="none" />
      {children}
    </div>
  );
}
