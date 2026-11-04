'use client';

import React, { useEffect, useRef } from 'react';
import type { Product } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { Button } from '../Button';
import { Text } from '../Text';
import { useEnquiry } from '../state';
import { useProductLook, useProductUI } from './productUI';

/**
 * Pill button (the original "Add to cart") that widens and rolls to
 * "Enquire — name" once the hero has scrolled away; opens the Enquire drawer.
 */
export function EnquireButton({ product }: { product: Product }) {
  const [ui] = useProductUI();
  const [, dispatch] = useEnquiry();
  const look = useProductLook(product);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const button = inner.current?.parentElement;
    if (!button) return;
    const forward = (type: 'mouseenter' | 'mouseleave') => () =>
      inner.current?.querySelectorAll('[data-cycle-text]').forEach((el) => el.dispatchEvent(new Event(type)));
    const enter = forward('mouseenter');
    const leave = forward('mouseleave');
    button.addEventListener('mouseenter', enter);
    button.addEventListener('mouseleave', leave);
    return () => {
      button.removeEventListener('mouseenter', enter);
      button.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <Button
      onClick={() => {
        dispatch({ type: 'select', payload: product.id });
        dispatch({ type: 'toggle', payload: true });
      }}
      className={cn(
        'w-full min-w-36 h-12 flex items-center',
        'transition-[width] ease-in-out duration-300',
        ui.doShowAddToCartPrice ? 'md:w-80' : 'md:w-36'
      )}
      style={{ pointerEvents: 'all' }}
      hasOwnCycleAnimation
    >
      <div ref={inner} className="relative overflow-hidden w-full h-full">
        <div
          className={cn(
            'absolute inset-0 w-full h-full',
            ui.doShowAddToCartPrice ? '-translate-y-full' : '',
            'transition-transform ease-in-out duration-300',
            'pointer-events-none'
          )}
        >
          <Text tag="div" className={cn('flex justify-center items-center', 'h-full w-full', '!leading-none')}>
            <span data-cycle-text="">Enquire</span>
          </Text>
          <Text
            tag="div"
            className={cn('flex justify-center items-center', 'absolute h-full w-full', 'top-full', 'whitespace-nowrap !leading-none')}
          >
            <span data-cycle-text="">Enquire — {look.name}</span>
          </Text>
        </div>
      </div>
    </Button>
  );
}
