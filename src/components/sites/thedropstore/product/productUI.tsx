'use client';

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { gsap, isClient } from '@/lib/dropstore/gsap';
import type { Product } from '@/lib/tranzlife-data';
import { useScreenTransition } from '../ScreenTransition';

if (isClient) gsap.registerPlugin(Draggable, InertiaPlugin);

export { Draggable };

/** `useIsomorphicLayoutEffect` (module 1042 of the original). */
export const useIsomorphicLayoutEffect = isClient ? useLayoutEffect : useEffect;

/**
 * Product-page state: whether the Enquire button shows the pack size, and which
 * variant is selected (Craving Control's switcher recolours the whole page).
 */
type ProductUIAction = { type: 'setDoShowAddToCartPrice'; payload: boolean } | { type: 'setVariant'; payload: number };
type ProductUIState = { doShowAddToCartPrice: boolean; variantIndex: number };
type ProductUIValue = [ProductUIState, (action: ProductUIAction) => void];

const ProductUIContext = createContext<ProductUIValue>([{ doShowAddToCartPrice: false, variantIndex: 0 }, () => undefined]);

export function ProductUIProvider({ children }: { children: React.ReactNode }) {
  const [doShowAddToCartPrice, setDoShowAddToCartPrice] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);
  const dispatch = useCallback((action: ProductUIAction) => {
    if (action.type === 'setDoShowAddToCartPrice') setDoShowAddToCartPrice(action.payload);
    if (action.type === 'setVariant') setVariantIndex(action.payload);
  }, []);
  const value = React.useMemo<ProductUIValue>(
    () => [{ doShowAddToCartPrice, variantIndex }, dispatch],
    [doShowAddToCartPrice, variantIndex, dispatch]
  );
  return <ProductUIContext.Provider value={value}>{children}</ProductUIContext.Provider>;
}

export const useProductUI = () => useContext(ProductUIContext);

/** Colour, tint, pack image and name for the product, or for its selected variant. */
export function useProductLook(product: Product) {
  const [{ variantIndex }] = useProductUI();
  const variant = product.variants?.[variantIndex];
  return {
    name: variant?.name ?? product.title,
    color: variant?.color ?? product.accent,
    tint: variant?.tint ?? product.tint,
    image: variant?.image ?? product.image,
  };
}

/* ---------------------------------------------------- Screen transition --- */

type TransitionHandler = (element: HTMLElement, durationSeconds: number) => void;
type TransitionHandlers = { leave?: TransitionHandler; enter?: TransitionHandler; idle?: TransitionHandler };

function TransitionListener({
  handlers,
  onConsumed,
  isRemount,
}: {
  handlers: React.RefObject<TransitionHandlers>;
  onConsumed: () => void;
  isRemount: boolean;
}) {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);
  const wrap =
    (phase: keyof TransitionHandlers): TransitionHandler =>
    (element, duration) => {
      // The shared hook fires the phase that is current on mount. A `leave`
      // still running at mount belongs to the previous page, and a re-mounted
      // listener has already handled the current phase.
      if (!mounted.current && (isRemount || phase === 'leave')) return;
      handlers.current?.[phase]?.(element, duration);
      if (phase !== 'leave') onConsumed();
    };
  useScreenTransition({ leave: wrap('leave'), enter: wrap('enter'), idle: wrap('idle') });
  return null;
}

/**
 * Renders a listener for the original `useScreenTransition({ leave, enter })`.
 * The shared hook only fires each phase once per mounted component, so the
 * listener is re-mounted after every consumed phase to keep `leave` reachable
 * for pages that were themselves entered through a transition.
 */
export function ScreenTransitionHandlers(props: TransitionHandlers) {
  const handlers = useRef<TransitionHandlers>(props);
  useIsomorphicLayoutEffect(() => {
    handlers.current = props;
  });
  const [generation, setGeneration] = useState(0);
  const onConsumed = useCallback(() => setGeneration((g) => g + 1), []);
  return <TransitionListener key={generation} handlers={handlers} onConsumed={onConsumed} isRemount={generation > 0} />;
}
