import React from 'react';
import type { Product } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { Text } from '../Text';
import { Icon } from '../Icon';

const FOCUS_ICONS: Record<Product['focus'], string> = {
  breathe: 'lungs',
  cleanse: 'liver',
  balance: 'lotus',
};

function ProductDecorationsContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        className,
        'hidden absolute top-0 bottom-0 pb-6 sm:w-8 pointer-events-none overflow-hidden',
        'sm:flex flex-col justify-between items-center'
      )}
      style={{ paddingTop: 'calc(var(--nav-space-top) + 1.5rem)' }}
    >
      {children}
    </div>
  );
}

export function ProductDecorationsTopLeft() {
  return (
    <ProductDecorationsContainer className="left-6">
      <div className="hidden sm:block self-start text-gold" role="none" data-loaded-in="x" data-entered-in="x" data-exiting="x">
        <Icon name="infinity" className="w-7 h-7" />
      </div>
    </ProductDecorationsContainer>
  );
}

export function ProductDecorationsBottomLeft({ product }: { product: Product }) {
  return (
    <ProductDecorationsContainer className="left-6 !overflow-visible !pointer-events-auto">
      <div role="none" />
      <div className="relative w-full h-20" role="none" data-loaded-in="x" data-entered-in="x" data-exiting="x">
        <div className={cn('uppercase whitespace-nowrap text-xs tracking-[0.15em]', 'absolute bottom-[-1em] left-0', 'origin-top-left -rotate-90')}>
          {product.focus}
        </div>
        <span
          className={cn('absolute bottom-[0.25em] left-[1.5em]', 'h-12 w-12 flex items-center justify-center')}
          style={{ color: 'var(--accent)' }}
          data-loaded-in="fade"
          data-entered-in="fade"
          data-exiting="fade"
        >
          <Icon name={FOCUS_ICONS[product.focus]} className="w-10 h-10" strokeWidth={1.2} />
        </span>
      </div>
    </ProductDecorationsContainer>
  );
}

export function ProductDecorationsTopRight() {
  return (
    <ProductDecorationsContainer className="right-6">
      <div
        className="relative flex items-center gap-2 top-14"
        role="none"
        style={{ rotate: '90deg' }}
        data-loaded-in="-x"
        data-entered-in="-x"
        data-exiting="-x"
      >
        <Icon name="leaf" className="w-4 h-4 text-gold" />
        <Text tag="div" variant="text-sm" role="none" className="uppercase !text-[0.75rem] tracking-[0.15em] whitespace-nowrap">
          TranzLife
        </Text>
      </div>
    </ProductDecorationsContainer>
  );
}

export function ProductDecorationsBottomRight() {
  return (
    <div className={cn('hidden absolute bottom-6 right-6 overflow-hidden', 'sm:flex gap-3 items-center')} style={{ pointerEvents: 'all' }}>
      <span className="text-gold" data-loaded-in="-y" data-entered-in="-y" data-exiting="-y">
        <Icon name="leaf" className="w-4 h-4" />
      </span>
    </div>
  );
}
