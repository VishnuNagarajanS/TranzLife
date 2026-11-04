import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteData, getFocusByType } from '@/lib/tranzlife-data';
import { FocusPage } from '@/components/sites/thedropstore/focus/FocusPage';

interface PageProps {
  params: Promise<{ type: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return siteData.focusAreas.map((f) => ({ type: f.type }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const focus = getFocusByType(type);
  if (!focus) return {};
  return {
    title: `${focus.title} – ${focus.subtitle} | TranzLife Biosciences`,
    description: focus.descriptionShort,
  };
}

export default async function Page({ params }: PageProps) {
  const { type } = await params;
  const focus = getFocusByType(type);
  if (!focus) notFound();
  return <FocusPage focus={focus} />;
}
