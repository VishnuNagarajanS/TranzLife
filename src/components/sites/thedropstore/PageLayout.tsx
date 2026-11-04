'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { gsap, ScrollTrigger, ScrollSmoother, isTouchDevice, breakpoints } from '@/lib/dropstore/gsap';
import { useMotion } from '@/lib/dropstore/motion';
import { createHeadingInTween } from '@/lib/dropstore/heading-tween';
import { siteData, isRouteLink } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { useEnquiry, useUI } from './state';
import { useScreenTransition } from './ScreenTransition';
import { Button } from './Button';
import { Text } from './Text';
import { Icon } from './Icon';
import { LogoWide } from './Logo';
import { CredentialLogoStrip } from './CredentialLogos';
import ShinyText from '@/components/reactbits/ShinyText/ShinyText';

/* ------------------------------------------------------------ Portal --- */

export function Portal({ to, children }: { to: string; children: React.ReactNode }) {
  const target = useSyncExternalStore(
    () => () => undefined,
    () => document.querySelector(to),
    () => null
  );
  return target ? createPortal(children, target) : null;
}

/* -------------------------------------------------------- Navigation --- */

/** Where the cart button sat: opens the quick Enquire drawer. */
function EnquireStatus(props: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) {
  const [, dispatch] = useEnquiry();
  const toggle = () => dispatch({ type: 'toggle' });
  return (
    <div {...props}>
      <div
        className="relative flex items-center gap-2 rounded-full border border-black px-4 py-1.5 text-sm"
        role="button"
        tabIndex={0}
        onKeyUp={(e) => e.key === 'Enter' && toggle()}
        onClick={toggle}
        data-pointer-chaser-size={0}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gold pointer-events-none" role="none" />
        <span data-cycle-text="" data-pointer-chaser-size={0}>
          Enquire
        </span>
      </div>
    </div>
  );
}

export interface PageNavigationProps {
  backgroundColor?: string;
  borderColor?: string;
}

function PageNavigation({ backgroundColor, borderColor }: PageNavigationProps) {
  const [ui, dispatch] = useUI();
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const setPadding = () => {
      if (!nav.current) return;
      gsap.set('html', { '--nav-space-top': nav.current.getBoundingClientRect().height + 'px' });
    };
    const mql = matchMedia(`(min-width:${breakpoints.sm})`);
    setPadding();
    mql.addEventListener('change', setPadding);
    return () => mql.removeEventListener('change', setPadding);
  }, []);

  const setState = (state: 'in' | 'out') => (_: HTMLElement, duration: number) => {
    if (!nav.current) return;
    gsap.set(nav.current, { '--nav-transition-duration': duration + 's' });
    nav.current.classList.remove(state === 'in' ? 'page-navigation--out' : 'page-navigation--in');
    nav.current.classList.add(`page-navigation--${state}`);
  };

  useScreenTransition({ idle: setState('in'), enter: setState('in'), leave: setState('out') });

  return (
    <nav
      ref={nav}
      className="page-navigation fixed left-0 right-0 top-0 px-6 py-4 z-10"
      style={{ '--border-color': borderColor, pointerEvents: 'all' } as React.CSSProperties}
      role="navigation"
    >
      {backgroundColor && (
        <div className="absolute inset-0 opacity-40" style={{ backgroundColor }} data-nav-background-color={backgroundColor} role="none" />
      )}
      <div className="absolute inset-0 page-navigation-sheen pointer-events-none" role="none" />
      <div className="relative flex overflow-hidden">
        <Link href="/" scroll={false} className="inline-flex items-center flex-1" data-loaded-in="lines">
          <div className="inline-flex pointer-events-none" data-pointer-chaser-size={0}>
            <LogoWide className="h-11 text-[19px]" />
          </div>
        </Link>
        <div
          className={cn(
            'fixed gap-8 bg-white w-screen h-screen inset-x-0 flex-col hidden z-50',
            'sm:inset-x-auto sm:z-auto sm:flex sm:flex-row sm:items-center sm:static sm:w-auto sm:h-auto sm:bg-transparent sm:flex-auto sm:justify-center',
          )}
          data-loaded-in="lines"
        >
          {siteData.navigation.links.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              scroll={false}
              className="relative top-1 text-sm"
              onClick={() => dispatch({ type: 'toggleMainMenu', payload: false })}
            >
              <span data-cycle-text={link.text} data-pointer-chaser-size={0}>
                {link.text}
              </span>
            </Link>
          ))}
        </div>
        <EnquireStatus className="relative flex items-center justify-end flex-1 text-sm" data-loaded-in="lines" />
        <button
          className="ml-2 h-10 w-10 flex justify-end items-center sm:hidden"
          data-loaded-in="lines"
          onClick={() => dispatch({ type: 'toggleMainMenu', payload: !ui.isMainMenuToggled })}
          aria-label="Menu toggle"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={cn(ui.isMainMenuToggled && 'hidden', 'h-3 object-contain')} src="/icons/hamburger-menu.svg" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={cn(!ui.isMainMenuToggled && 'hidden', 'w-3 h-3 object-contain')} src="/icons/x.svg" alt="" />
        </button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------ Footer --- */

function PageFooter() {
  const { footer, contact, brand } = siteData;
  return (
    <div className="smooth-section">
      <footer
        className="flex flex-col justify-between relative px-6 pb-6 pt-8 will-change-transform text-white bg-black overflow-hidden"
        style={{ minHeight: 'calc(100vh - var(--nav-space-top))' }}
        data-page-footer=""
        data-exiting="-y"
      >
        <FooterArt />
        <div className="isolate flex flex-col gap-16">
          <Text
            tag="h2"
            variant="display-2"
            breakpoints={{ none: 'text-[3rem]' }}
            className="w-full xl:w-8/12 2xl:w-9/12 whitespace-pre-line"
          >
            {/* React Bits ShinyText: a slow warm-gold sheen sweeps across the cream headline. */}
            <ShinyText
              text={footer.title}
              color="#f2f4e8"
              shineColor="#e9cf8a"
              speed={3.2}
              delay={2.5}
              angle={115}
              shineWidth={28}
              softness={0.85}
              glow={0.35}
              direction="right"
            />
          </Text>
          <div className="grid grid-cols-12 gap-6">
            <div className="flex flex-col gap-8 col-span-full lg:col-start-1 lg:col-end-6 lg:py-8">
              <div>
                <Button is={Link} variant="secondary" href="/about" scroll={false} data-text-cycle="">
                  Our Story
                </Button>
              </div>
              <Text variant="text-sm" className="!text-base text-white/70 max-w-xs">
                {brand.company}
                <br />
                {contact.address.map((line) => (
                  <React.Fragment key={line}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Text>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 col-span-full lg:col-start-6 lg:col-end-13 gap-x-6 gap-y-16">
              {footer.entries.map((entry) => (
                <ul key={entry.id}>
                  <li className="mb-4">
                    <Text variant="text-sm" className="uppercase tracking-[0.2em] text-gold">
                      {entry.title}
                    </Text>
                  </li>
                  {entry.links.map((link, i) => {
                    const isRoute = isRouteLink(link.url);
                    return (
                      <li key={i} className="my-2">
                        <Text
                          tag={isRoute ? Link : 'a'}
                          href={link.url}
                          target={link.target}
                          rel={link.target === '_blank' ? 'noreferrer' : undefined}
                          {...(isRoute ? { scroll: false } : {})}
                          className="!text-base"
                          data-pointer-chaser-size={0}
                          data-cycle-text=""
                        >
                          {link.text}
                        </Text>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </div>
        </div>
        <div className="isolate flex flex-col gap-6 pt-12">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-t border-white/15 pt-6">
            <Text variant="text-sm" className="uppercase tracking-[0.2em] text-gold shrink-0">
              Recognised by
            </Text>
            <CredentialLogoStrip className="gap-2" tileClassName="h-11 w-24 px-2 py-1.5" />
          </div>
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-between">
          {footer.meta.map((meta, i) =>
            meta.url ? (
              <Text
                key={i}
                tag={Link}
                variant="text-sm"
                href={meta.url}
                className="!text-base"
                data-pointer-chaser-size={0}
                data-cycle-text=""
              >
                {meta.text}
              </Text>
            ) : (
              <Text key={i} variant="text-sm" className="!text-base" data-pointer-chaser-size={0}>
                {meta.text}
              </Text>
            ),
          )}
        </div>
        </div>
      </footer>
    </div>
  );
}

/** A faint infinity-tree drawn large in the footer's corner. */
function FooterArt() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="absolute -right-[10vw] -bottom-[12vw] w-[60vw] max-w-[900px] opacity-[0.07] pointer-events-none"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
        <path d="M32 47 C27 40 22.5 39 19 39 A8 8 0 0 0 19 55 C22.5 55 27 54 32 47" />
        <path d="M32 47 C37 54 41.5 55 45 55 A8 8 0 0 0 45 39 C41.5 39 37 40 32 47" />
        <path d="M32 47 V20 M32 30 L26 24 M32 27 L38 21" />
        <circle cx="32" cy="14" r="7" />
        <circle cx="24.5" cy="19" r="6" />
        <circle cx="39.5" cy="19" r="6" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------ Dialog --- */

export function Dialog({
  children,
  toggled,
  onClose,
  withTopNavSpace,
  motionType = 'slide',
}: {
  children: React.ReactNode;
  toggled: boolean;
  onClose?: () => void;
  withTopNavSpace?: boolean;
  motionType?: 'slide' | 'fade';
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toggled || !onClose) return;
    const onDown = (e: MouseEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [toggled, onClose]);

  const motion: React.CSSProperties =
    motionType === 'slide'
      ? { transform: toggled ? 'translateX(0)' : 'translateX(100%)' }
      : {
          opacity: toggled ? 1 : 0,
          backgroundColor: toggled ? 'rgba(242,244,232,0.92)' : 'rgba(242,244,232,0)',
          backdropFilter: 'blur(15px)',
          transitionTimingFunction: toggled ? 'ease-out' : 'ease-in',
          transitionDuration: '0.4s',
        };
  const top = withTopNavSpace ? 'var(--nav-space-top)' : undefined;

  return (
    <>
      <div className="bg-gray-900 absolute inset-0 dialog-transitions" role="none" style={{ opacity: toggled ? 0.5 : 0, top }} />
      <div
        className={cn(
          'absolute top-0 right-0 bottom-0 w-full md:min-w-[475px] md:w-4/12',
          motionType === 'slide' && 'bg-white',
          'dialog-transitions',
        )}
        role="none"
        style={{ ...motion, top }}
      />
      <div
        className="isolate h-full flex justify-end"
        style={{
          pointerEvents: toggled ? 'all' : 'none',
          height: withTopNavSpace ? 'calc(100% - var(--nav-space-top))' : undefined,
          marginTop: top,
        }}
        role="dialog"
      >
        <div
          ref={panel}
          className="h-full px-6 py-4 flex flex-col justify-between w-full md:min-w-[475px] md:w-4/12 dialog-transitions"
          style={{ ...motion, backgroundColor: undefined, backdropFilter: undefined }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

/** Quick Enquire drawer, reachable from the nav and every product page. */
function EnquireOverview() {
  const { enquire, contact, products } = siteData;
  const [state, dispatch] = useEnquiry();
  const product = products.find((p) => p.id === state.productId);
  const close = () => dispatch({ type: 'toggle', payload: false });
  const subject = encodeURIComponent(product ? `Enquiry: ${product.title}` : 'Enquiry from tranzlife.in');
  const whatsappText = encodeURIComponent(product ? `Hello TranzLife, I would like to know more about ${product.title}.` : 'Hello TranzLife,');

  return (
    <Dialog toggled={state.isToggled} onClose={close}>
      <div className="flex flex-col gap-2">
        <Text tag="h3" variant="headline-1">
          {enquire.title}
        </Text>
        {product && (
          <div className="flex items-center gap-3 pt-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: product.accent }} role="none" />
            <Text variant="text-base">
              {product.title} — {product.amount}
            </Text>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <Text tag="h3" variant="headline-2">
          {enquire.stock}
        </Text>
        <Text variant="text-base">{enquire.description}</Text>
        <ul className="flex flex-col border-t border-gray-300">
          <li className="border-b border-gray-300">
            <a className="flex justify-between items-center py-3" href={`mailto:${contact.email}?subject=${subject}`}>
              <span>Email</span>
              <span className="text-gray-800">{contact.email}</span>
            </a>
          </li>
          <li className="border-b border-gray-300">
            <a
              className="flex justify-between items-center py-3"
              href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
            >
              <span>WhatsApp</span>
              <span className="text-gray-800">{contact.phone}</span>
            </a>
          </li>
        </ul>
        <div className="flex justify-between pt-2">
          <Button
            is={Link}
            href={product ? `${enquire.buttonUrl}?product=${product.slug}` : enquire.buttonUrl}
            scroll={false}
            onClick={close}
          >
            {enquire.buttonText}
          </Button>
        </div>
      </div>
      <button className="absolute px-6 py-4 top-0 right-0" onClick={() => dispatch({ type: 'toggle' })} aria-label="Close">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/x.svg" alt="" width={12} height={12} />
      </button>
    </Dialog>
  );
}

/** Rotated side label used on the home page and in the mobile menu. */
export function SideLabel({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-[0.15rem]', className)}>
      <div className="uppercase whitespace-nowrap text-xs tracking-[0.15em]">TranzLife Biosciences</div>
      <div className="flex gap-1 text-gold">
        <Icon name="infinity" className="w-3.5 h-3.5 rotate-90" />
        <Icon name="leaf" className="w-3 h-3" />
      </div>
    </div>
  );
}

function MobileMenu() {
  const [ui, dispatch] = useUI();
  const { navigation, contact } = siteData;
  const tweens = useRef<gsap.core.Tween[]>([]);

  useMotion(
    () => {
      const ctx = gsap.context(() => {
        tweens.current = Array.from(document.querySelectorAll<HTMLElement>('[data-mobile-menu-link],[data-mobile-menu-social-link]')).map(
          (el, i) => createHeadingInTween(el, {}, { delay: 0.07 * i, duration: 1 }).tween,
        );
      });
      return () => {
        ctx.revert();
        ctx.kill();
      };
    },
    { matchMedia: `(max-width: ${parseInt(breakpoints.sm) - 1}px)` },
    [ui.isMainMenuToggled],
  );

  useEffect(() => {
    tweens.current.forEach((t) => (ui.isMainMenuToggled ? t.play() : t.reverse(t.duration())));
  }, [ui.isMainMenuToggled]);

  const close = () => dispatch({ type: 'toggleMainMenu', payload: false });

  return (
    <Dialog toggled={ui.isMainMenuToggled} withTopNavSpace>
      <div className="flex flex-col flex-auto justify-between">
        <div className="flex flex-col gap-6 py-4">
          {navigation.links.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              className="text-[2rem] xl:text-[2.5rem] tracking-normal xl:tracking-tight leading-none"
              scroll={false}
              onClick={close}
              data-mobile-menu-link=""
            >
              {link.text}
            </Link>
          ))}
        </div>
        <div className="relative flex justify-end pb-2">
          <div className="flex flex-col gap-4 items-end">
            <a href={`mailto:${contact.email}`} className="underline underline-offset-2" onClick={close} data-mobile-menu-social-link="">
              {contact.email}
            </a>
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="underline underline-offset-2" onClick={close} data-mobile-menu-social-link="">
              {contact.phone}
            </a>
          </div>
          <SideLabel className="absolute left-0 bottom-0 origin-top-left translate-y-5 -rotate-90" />
        </div>
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------- Page-wide motions --- */

type TweenSet = Record<string, { from?: gsap.TweenVars; to: gsap.TweenVars; target: string }>;

function landingTweens(attr: string): TweenSet {
  return {
    fade: { from: { opacity: 0 }, to: { opacity: 1 }, target: `[data-${attr}="fade"]` },
    y: { from: { opacity: 0, y: -50 }, to: { opacity: 1, y: 0 }, target: `[data-${attr}="y"]` },
    '-y': { from: { opacity: 0, y: 50 }, to: { opacity: 1, y: 0 }, target: `[data-${attr}="-y"]` },
    lines: { from: { y: 50 }, to: { y: 0 }, target: `[data-${attr}="lines"]` },
    x: { from: { x: -50 }, to: { x: 0 }, target: `[data-${attr}="x"]` },
    '-x': { from: { x: 50 }, to: { x: 0 }, target: `[data-${attr}="-x"]` },
    spin: {
      from: { opacity: 0, rotate: '70deg' },
      to: { opacity: 1, rotate: '0deg', ease: 'elastic.out(1, 0.75)', delay: 1 },
      target: `[data-${attr}="spin"]`,
    },
  };
}

function exitingTweens(): TweenSet {
  return {
    fade: { to: { opacity: 0 }, target: '[data-exiting="fade"]' },
    y: { to: { opacity: 0, y: -50 }, target: '[data-exiting="y"]' },
    '-y': { to: { opacity: 0, y: 50 }, target: '[data-exiting="-y"]' },
    lines: { to: { y: 50 }, target: '[data-exiting="lines"]' },
    x: { to: { x: -50 }, target: '[data-exiting="x"]' },
    '-x': { to: { x: 50 }, target: '[data-exiting="-x"]' },
    spin: { to: { opacity: 0, rotate: '70deg' }, target: '[data-exiting="spin"]' },
  };
}

/** The very first page shown plays the `data-loaded-in` intro once the loader hides. */
let isFirstLanding = true;

function usePageMotions() {
  const [ui] = useUI();

  // [data-parallax] elements drift against the scroll direction.
  useMotion(
    () => {
      const elements = document.getElementById('smooth-content')?.querySelectorAll<HTMLElement>('[data-parallax]');
      if (!elements?.length) return;
      const triggers = Array.from(elements).flatMap((el) => {
        const media = el.dataset.parallaxMatchMedia;
        const speed = parseFloat(el.dataset.parallax ?? '1');
        const isDiorama = 'parallaxDiorama' in el.dataset;
        const parent = el.parentElement;
        if (!parent || (media && !matchMedia(media).matches)) return [];
        const rect = el.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const distance = isDiorama ? rect.height - parentRect.height : rect.height * (1 - speed);
        if (isDiorama ? distance < 0 : distance === 0) return [];
        const apply = gsap.utils.pipe(
          isDiorama ? gsap.utils.interpolate(-distance, 0) : gsap.utils.interpolate(-(distance / 2), distance / 2),
          gsap.quickSetter(el, 'y', 'px') as (v: number) => void,
        );
        return [
          ScrollTrigger.create({
            trigger: isDiorama ? parent : el,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => apply(self.progress),
          }),
        ];
      });
      return () => triggers.forEach((t) => t.kill());
    },
    () => ({ shouldResetOnResize: [document.body, 'horizontal'] }),
    [],
  );

  // Text roll-over: the label slides up and an identical copy follows from below.
  useMotion(
    () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-cycle-text]')).filter(
        (el) => !el.querySelector('[data-cycle-text-inner]'),
      );
      const disposers: (() => void)[] = [];
      elements.forEach((el) => {
        const text = el.innerText;
        const original = Array.from(el.childNodes);
        const styles = getComputedStyle(el);
        const inner = document.createElement('span');
        inner.setAttribute('data-cycle-text-inner', text);
        inner.style.paddingTop = styles.paddingTop;
        inner.style.paddingBottom = styles.paddingBottom;
        inner.append(text);
        el.replaceChildren(inner);
        const tween = gsap.to(inner, { y: '-100%', duration: 0.3, ease: 'power1.inOut', paused: true });
        const enter = () => tween.play();
        const leave = () => tween.reverse();
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        disposers.push(() => {
          el.removeEventListener('mouseenter', enter);
          el.removeEventListener('mouseleave', leave);
          tween.revert().kill();
          el.replaceChildren(...original);
        });
      });
      return () => disposers.forEach((d) => d());
    },
    { matchMedia: '(pointer: fine) and (prefers-reduced-motion: no-preference)' },
    [],
    true,
  );

  // First-visit intro, staggered per tween type once the loader is gone.
  useMotion(
    () => {
      if (!isFirstLanding) return;
      const ctx = gsap.context(() => {
        const types = landingTweens('loaded-in');
        const tl = gsap.timeline({ paused: true });
        Object.values(types).forEach((type, i) => {
          if (!document.querySelector(type.target)) return;
          tl.fromTo(type.target, type.from!, { duration: 2, ease: 'power4.inOut', stagger: { each: 0.08 }, ...type.to }, 0.08 * i);
        });
        if (ui.isLoaderViewToggled) {
          Object.values(types).forEach((type) => document.querySelector(type.target) && gsap.set(type.target, type.from!));
        } else {
          isFirstLanding = false;
          tl.play();
        }
      });
      return () => {
        if (!isFirstLanding) return;
        ctx.revert();
        ctx.kill();
      };
    },
    {},
    [ui.isLoaderViewToggled],
    true,
  );

  useScreenTransition({
    leave(_, duration) {
      const vars = { duration, ease: 'power4.inOut' };
      Object.values(exitingTweens()).forEach((type) => {
        if (document.querySelector(type.target)) gsap.to(type.target, { ...vars, ...type.to });
      });
    },
    enter(_, duration) {
      if (isTouchDevice()) window.scrollTo({ top: 0 });
      const smoother = ScrollSmoother.get();
      if (smoother) {
        const smooth = smoother.smooth();
        smoother.smooth(0);
        smoother.scrollTo(0, false);
        smoother.smooth(smooth);
        ScrollTrigger.refresh();
      } else {
        window.scrollTo({ top: 0 });
      }
      if (ui.isLoaderViewToggled) return;
      const vars = { duration, ease: 'power4.inOut' };
      requestAnimationFrame(() => {
        Object.values(landingTweens('entered-in')).forEach((type) => {
          if (document.querySelector(type.target)) gsap.fromTo(type.target, type.from!, { ...vars, ...type.to });
        });
      });
    },
  });
}

/* ------------------------------------------------------------ Layout --- */

export interface PageLayoutProps {
  children: React.ReactNode;
  withFooter?: boolean;
  fixedBack?: React.ReactNode;
  fixedFront?: React.ReactNode;
  append?: React.ReactNode;
  pageNavigationProps?: PageNavigationProps;
  className?: string;
}

export function PageLayout({
  children,
  withFooter = true,
  fixedBack,
  fixedFront,
  append,
  pageNavigationProps,
  className,
}: PageLayoutProps) {
  usePageMotions();

  return (
    <>
      <div className={cn('flex flex-col min-h-screen', className)}>
        <main className="flex-1 min-h-screen w-full overflow-hidden">{children}</main>
        {withFooter && <PageFooter />}
      </div>
      {append}
      <Portal to="#fixed-background">{fixedBack}</Portal>
      <Portal to="#fixed-foreground">
        {fixedFront}
        <PageNavigation {...pageNavigationProps} />
      </Portal>
      <Portal to="#cart-overview">
        <EnquireOverview />
      </Portal>
      <Portal to="#mobile-menu">
        <MobileMenu />
      </Portal>
    </>
  );
}
