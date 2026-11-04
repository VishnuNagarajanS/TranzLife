import React from 'react';
import { cn } from '@/lib/utils';

export const BRAND_GREEN = '#2F7D46';
export const BRAND_GOLD = '#C49A3C';

/** Brochure logo art (tree whose roots wrap the green-and-gold DNA infinity), cut out of page 1. */
const MARK_SRC = { small: '/tranzlife/brochure/logo-mark-sm.png', large: '/tranzlife/brochure/logo-mark.png' };

export function LogoMark({ className, size = 'small', title = 'TranzLife' }: { className?: string; size?: 'small' | 'large'; title?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={MARK_SRC[size]} alt={title} className={cn('object-contain', className)} width={1290} height={996} data-logo-mark="" />
  );
}

/** Mark plus the brochure wordmark: green TRANZ, gold LIFE, BIOSCIENCES between rules. */
export function LogoWide({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className="h-full w-auto" />
      <span className="flex flex-col justify-center leading-none">
        <span className="font-wordmark text-[1.4em] font-semibold uppercase tracking-[0.02em]" style={{ lineHeight: 1 }}>
          <span className={inverted ? 'text-white' : 'text-[#1E5A2B]'}>Tranz</span>
          <span className="text-[#E09A1A]">Life</span>
        </span>
        <span className="flex items-center gap-1 pt-[0.2em]">
          <span className="h-px w-2 bg-[#1E5A2B]" role="none" />
          <span className="text-[0.42em] font-semibold uppercase tracking-[0.3em] text-[#C98A12]">Biosciences</span>
          <span className="h-px w-2 bg-[#1E5A2B]" role="none" />
        </span>
      </span>
    </span>
  );
}
