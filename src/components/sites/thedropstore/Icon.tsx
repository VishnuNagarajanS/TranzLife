import React from 'react';
import {
  Award,
  BadgeCheck,
  Baby,
  Brain,
  CalendarDays,
  Cherry,
  Clock,
  Cpu,
  CupSoda,
  Dna,
  Droplet,
  FlaskConical,
  Flower2,
  Hand,
  Heart,
  Layers,
  Leaf,
  Lightbulb,
  LockOpen,
  Moon,
  PawPrint,
  Pause,
  Repeat,
  Rocket,
  Shield,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Truck,
  Users,
  UtensilsCrossed,
  Vibrate,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type IconProps = { className?: string; strokeWidth?: number };

/** Hand-drawn icons for things lucide does not cover, in the same 24px stroke style. */
function custom(paths: React.ReactNode) {
  return function CustomIcon({ className, strokeWidth = 1.5 }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
      >
        {paths}
      </svg>
    );
  };
}

const Lungs = custom(
  <>
    <path d="M12 3v8" />
    <path d="M12 11c-1 1.2-2 1.7-3 1.7" />
    <path d="M12 11c1 1.2 2 1.7 3 1.7" />
    <path d="M9.5 6.5C6 6 3.5 10 3.5 15c0 3 1 5 3 5 2.5 0 3.5-2 3.5-5V8c0-.8-.2-1.3-.5-1.5Z" />
    <path d="M14.5 6.5C18 6 20.5 10 20.5 15c0 3-1 5-3 5-2.5 0-3.5-2-3.5-5V8c0-.8.2-1.3.5-1.5Z" />
  </>
);

const Liver = custom(
  <>
    <path d="M3 9.5C3 6.5 6 5 10 5c4.5 0 8 .5 10 2 1.2.9 1.2 2.6 0 3.6-2.6 2.2-6 3.4-9 5.6-1.8 1.3-3.6 2.8-5 2.8-2.2 0-3-3-3-9.5Z" />
    <path d="M12 9c-1.5 1-2.5 2.5-3 4.5" />
  </>
);

const Mortar = custom(
  <>
    <path d="M4 11h16a8 8 0 0 1-16 0Z" />
    <path d="M9 19l-1 2h8l-1-2" />
    <path d="M13 11l6-8" />
    <path d="M17.5 3.5l2 1.5" />
  </>
);

const Inhaler = custom(
  <>
    <rect x="8" y="7" width="8" height="14" rx="4" />
    <path d="M10 7V4.5A1.5 1.5 0 0 1 11.5 3h1A1.5 1.5 0 0 1 14 4.5V7" />
    <path d="M8 12h8" />
  </>
);

const RollOn = custom(
  <>
    <circle cx="12" cy="5" r="2.5" />
    <path d="M9 8.5h6l1 2.5v8.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 19.5V11Z" />
    <path d="M8 14h8" />
  </>
);

const Two = custom(
  <>
    <ellipse cx="8" cy="12" rx="4.5" ry="5.5" />
    <ellipse cx="16" cy="12" rx="4.5" ry="5.5" />
  </>
);

const Shake = custom(
  <>
    <rect x="8" y="8" width="8" height="13" rx="2" />
    <path d="M10 8V5h4v3" />
    <path d="M4 10c-1 1.5-1 3.5 0 5" />
    <path d="M20 10c1 1.5 1 3.5 0 5" />
  </>
);

const India = custom(
  <>
    <path d="M9 3l3 1 2-1 2 2-1 2 3 2 2 1-1 2-3 1-2 3-1 4-2 1-1-3-2-3-3-2 1-3-2-2 2-2 2 1Z" />
  </>
);

const InfinityTree = custom(
  <>
    <path d="M12 15c-2 2.5-4 3.5-6 3.5a3.5 3.5 0 0 1 0-7c2 0 4 1 6 3.5 2 2.5 4 3.5 6 3.5a3.5 3.5 0 0 0 0-7c-2 0-4 1-6 3.5Z" />
    <path d="M12 15V5" />
    <path d="M12 8c-1.5-.5-3-2-3-4 2 0 3 1.5 3 4Z" />
    <path d="M12 7c1.5-.5 3-2 3-4-2 0-3 1.5-3 4Z" />
  </>
);

const ICONS: Record<string, LucideIcon | React.ComponentType<IconProps>> = {
  lungs: Lungs,
  liver: Liver,
  mortar: Mortar,
  pocket: Inhaler,
  roll: RollOn,
  two: Two,
  shake: Shake,
  india: India,
  infinity: InfinityTree,
  innovate: Lightbulb,
  develop: FlaskConical,
  deliver: Truck,
  impact: Sprout,
  leaf: Leaf,
  sprout: Sprout,
  drop: Droplet,
  shield: Shield,
  badge: BadgeCheck,
  award: Award,
  spark: Sparkles,
  berry: Cherry,
  hand: Hand,
  layers: Layers,
  heart: Heart,
  paw: PawPrint,
  breath: Wind,
  pause: Pause,
  repeat: Repeat,
  open: LockOpen,
  clock: Clock,
  calendar: CalendarDays,
  meal: UtensilsCrossed,
  cup: CupSoda,
  sun: Sun,
  moon: Moon,
  lotus: Flower2,
  dna: Dna,
  target: Target,
  chip: Cpu,
  family: Users,
  baby: Baby,
  brain: Brain,
  rocket: Rocket,
  vibrate: Vibrate,
};

export function Icon({ name, className, strokeWidth = 1.5 }: { name: string } & IconProps) {
  const Component = ICONS[name] ?? Leaf;
  return <Component className={cn('shrink-0', className)} strokeWidth={strokeWidth} aria-hidden />;
}
