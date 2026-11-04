'use client';

import React, { createContext, useContext, useMemo, useReducer, useRef } from 'react';
import type { Product } from '@/lib/tranzlife-data';

export const DEFAULT_POINTER_SIZE = 8;
export const PRODUCT_POINTER_SIZE = 8;

/* ------------------------------------------------------------------ UI --- */

interface UIState {
  screenTransitionDurationMS: number;
  screenTransitionProduct?: Product;
  isMainMenuToggled: boolean;
  isLoaderViewToggled: boolean;
  pointerText: string;
  pointerSize: number;
}

type UIAction =
  | { type: 'setScreenTransitionDuration'; payload?: number }
  | { type: 'toggleMainMenu'; payload?: boolean }
  | { type: 'toggleLoaderView'; payload?: boolean }
  | { type: 'setPointerText'; payload: string }
  | { type: 'setPointerSize'; payload: number }
  | { type: 'setProductScreenTransition'; payload?: Product };

const initialUI: UIState = {
  screenTransitionDurationMS: 2000,
  screenTransitionProduct: undefined,
  isMainMenuToggled: false,
  isLoaderViewToggled: true,
  pointerText: '...',
  pointerSize: DEFAULT_POINTER_SIZE,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'setScreenTransitionDuration':
      return action.payload == null ? state : { ...state, screenTransitionDurationMS: action.payload };
    case 'toggleMainMenu':
      return { ...state, isMainMenuToggled: action.payload ?? !state.isMainMenuToggled };
    case 'toggleLoaderView':
      return { ...state, isLoaderViewToggled: action.payload ?? !state.isLoaderViewToggled };
    case 'setPointerText':
      return state.pointerText === action.payload ? state : { ...state, pointerText: action.payload };
    case 'setPointerSize':
      return state.pointerSize === action.payload ? state : { ...state, pointerSize: action.payload };
    case 'setProductScreenTransition':
      return state.screenTransitionProduct === action.payload ? state : { ...state, screenTransitionProduct: action.payload };
    default:
      return state;
  }
}

const UIContext = createContext<[UIState, React.Dispatch<UIAction>]>([initialUI, () => undefined]);
export const useUI = () => useContext(UIContext);

/* ------------------------------------------------------------- Enquiry --- */

/** The quick Enquire drawer (the original cart panel); `productId` is what it is about. */
interface EnquiryState {
  productId?: string;
  isToggled: boolean;
}

type EnquiryAction = { type: 'select'; payload?: string } | { type: 'toggle'; payload?: boolean };

function enquiryReducer(state: EnquiryState, action: EnquiryAction): EnquiryState {
  switch (action.type) {
    case 'select':
      return state.productId === action.payload ? state : { ...state, productId: action.payload };
    case 'toggle':
      return { ...state, isToggled: action.payload ?? !state.isToggled };
    default:
      return state;
  }
}

const EnquiryContext = createContext<[EnquiryState, React.Dispatch<EnquiryAction>]>([{ isToggled: false }, () => undefined]);
export const useEnquiry = () => useContext(EnquiryContext);

/* ----------------------------------------------------------- Preloader --- */

interface PreloaderBundle {
  bundleId: string;
  ready: boolean;
}

const PreloaderContext = createContext<{
  isLoading: boolean;
  preload: (files: string | string[], bundleId: string) => void;
}>({ isLoading: true, preload: () => undefined });

/** Tracks asset bundles; `isLoading` flips to false once every bundle has loaded. */
export const usePreloader = () => useContext(PreloaderContext);

function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [bundles, setBundles] = React.useState<PreloaderBundle[]>([]);
  const known = useRef(new Set<string>());

  const preload = React.useCallback((files: string | string[], bundleId: string) => {
    if (known.current.has(bundleId)) return;
    known.current.add(bundleId);
    setBundles((b) => [...b, { bundleId, ready: false }]);
    const list = [files].flat();
    Promise.allSettled(
      list.map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = src;
          })
      )
    ).then(() => setBundles((b) => b.map((x) => (x.bundleId === bundleId ? { ...x, ready: true } : x))));
  }, []);

  const value = useMemo(
    () => ({
      isLoading: bundles.length === 0 || bundles.some((b) => !b.ready),
      preload,
    }),
    [bundles, preload]
  );

  return <PreloaderContext.Provider value={value}>{children}</PreloaderContext.Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const ui = useReducer(uiReducer, initialUI);
  const enquiry = useReducer(enquiryReducer, { isToggled: false });
  return (
    <PreloaderProvider>
      <EnquiryContext.Provider value={enquiry}>
        <UIContext.Provider value={ui}>{children}</UIContext.Provider>
      </EnquiryContext.Provider>
    </PreloaderProvider>
  );
}
