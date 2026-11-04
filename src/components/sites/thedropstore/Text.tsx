import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type TextVariant =
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'headline-1'
  | 'headline-2'
  | 'headline-3'
  | 'headline-4'
  | 'text-xl'
  | 'text-lg'
  | 'text-base'
  | 'text-sm'
  | 'text-xs';

export interface TextBreakpoints {
  none?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}

/** The original site's typography scale, kept as literal Tailwind classes. */
export function textVariant(variant: TextVariant = 'text-base', bp: TextBreakpoints = {}) {
  switch (variant) {
    case 'display-1':
      return cn('text-[10.5rem]', 'tracking-tighter');
    case 'display-2':
      return cn(
        bp.none || 'text-[4.5rem]',
        bp.sm || 'sm:text-[5rem]',
        bp.lg || 'lg:text-[7rem]',
        bp.xl || 'xl:text-[9rem]',
        'tracking-tight xl:tracking-tighter',
        'leading-none xl:leading-[0.9em]'
      );
    case 'display-3':
      return cn(
        bp.none || 'text-[2.5rem]',
        bp.sm || 'sm:text-[3rem]',
        bp.md || 'md:text-[4rem]',
        bp.lg || 'lg:text-[6rem]',
        bp.xl || 'xl:text-[7rem]',
        'tracking-tight xl:tracking-tighter',
        'leading-none xl:leading-[0.9em]'
      );
    case 'headline-1':
      return cn(
        bp.none || 'text-[2.5rem]',
        bp.sm || 'sm:text-[2.75rem]',
        bp.md || 'md:text-[3rem]',
        bp.lg || 'lg:text-[4rem]',
        bp.xl || 'xl:text-[4.5rem]',
        'tracking-tight',
        'leading-none'
      );
    case 'headline-2':
      return cn('text-[2rem] xl:text-[3.5rem]', 'tracking-normal xl:tracking-tight', 'leading-none');
    case 'headline-3':
      return cn('text-[2rem] xl:text-[2.5rem]', 'tracking-normal xl:tracking-tight', 'leading-none');
    case 'headline-4':
      return cn('text-[2rem]', 'tracking-normal xl:tracking-tight', 'leading-none');
    case 'text-xl':
      return cn('text-[1rem] lg:text-[1.25rem] xl:text-[1.5rem]', 'tracking-tight', 'leading-normal');
    case 'text-lg':
      return cn('text-[1rem] xl:text-[1.25rem]', 'tracking-tight', 'leading-normal');
    case 'text-base':
      return cn('text-[0.875rem] md:text-[1rem]', 'tracking-normal', 'leading-normal');
    case 'text-sm':
      return cn('text-[0.75rem] 2xl:text-[0.875rem]', 'tracking-normal', 'leading-normal');
    case 'text-xs':
      return cn('text-[0.5rem] 2xl:text-[0.6rem]', 'tracking-normal', 'leading-normal');
  }
}

type TextProps = {
  tag?: React.ElementType;
  variant?: TextVariant;
  breakpoints?: TextBreakpoints;
  className?: string;
  children?: React.ReactNode;
} & Record<string, unknown>;

export const Text = forwardRef<HTMLElement, TextProps>(function Text(props, ref) {
  const { tag, variant, breakpoints, className, children, ...rest } = props;
  const Tag = (tag ?? 'p') as React.ElementType;
  return (
    <Tag ref={ref} {...rest} className={cn(textVariant(variant as TextVariant | undefined, breakpoints as TextBreakpoints | undefined), className as string | undefined)}>
      {children as React.ReactNode}
    </Tag>
  );
});
