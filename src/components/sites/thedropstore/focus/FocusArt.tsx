import React from 'react';
import type { FocusArea } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';

/**
 * Stand-in visual for a focus area until photography exists: the area's icon
 * inside concentric rings on its tint, with a few drifting leaves.
 */
export function FocusArt({ focus, className, iconClassName }: { focus: FocusArea; className?: string; iconClassName?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)} style={{ backgroundColor: focus.tint }}>
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
        <g fill="none" stroke={focus.color} strokeOpacity={0.18}>
          {[60, 100, 140, 180, 220, 260].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} strokeWidth={r % 80 === 20 ? 1.5 : 1} />
          ))}
        </g>
        <g fill={focus.color} fillOpacity={0.14}>
          <path d="M70 90c30-20 60-10 70 15-30 18-58 12-70-15Z" />
          <path d="M320 300c-28 22-58 14-70-10 28-20 58-14 70 10Z" />
          <path d="M310 80c10 30-4 56-30 62-8-30 6-55 30-62Z" />
        </g>
        <circle cx="200" cy="200" r="3" fill="#C49A3C" />
        <circle cx="340" cy="200" r="4" fill="#C49A3C" fillOpacity={0.7} />
        <circle cx="60" cy="230" r="3" fill="#C49A3C" fillOpacity={0.7} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ color: focus.color }}>
        <Icon name={focus.icon} className={cn('w-1/3 h-1/3', iconClassName)} strokeWidth={0.9} />
      </div>
    </div>
  );
}
