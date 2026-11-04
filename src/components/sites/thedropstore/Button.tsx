'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = {
  is?: React.ElementType;
  variant?: 'primary' | 'secondary' | 'ghost';
  hasOwnCycleAnimation?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Record<string, unknown>;

/** Pill button; hovering anywhere on it rolls the inner `[data-cycle-text]` label. */
export function Button({ is: Tag = 'button', variant = 'primary', hasOwnCycleAnimation, className, children, ...rest }: ButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const enter = () => inner.current?.dispatchEvent(new Event('mouseenter'));
    const leave = () => inner.current?.dispatchEvent(new Event('mouseleave'));
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      {...rest}
      className={cn(
        className,
        !hasOwnCycleAnimation && 'dropstore-button',
        variant === 'primary' && 'bg-black text-white',
        variant === 'secondary' && 'bg-white text-black',
        variant === 'ghost' && 'bg-transparent text-black border border-black',
        'border border-black',
        'inline-flex justify-center items-center rounded-full px-6 py-3 leading-none'
      )}
      data-pointer-chaser-size={0}
    >
      {hasOwnCycleAnimation ? (
        children
      ) : (
        <div ref={inner} className="inline-flex w-full h-full justify-center items-center" data-cycle-text="">
          {children}
        </div>
      )}
    </Tag>
  );
}
