import type { Metadata } from 'next';
import { siteData } from '@/lib/tranzlife-data';
import { SciencePage } from '@/components/sites/thedropstore/science/SciencePage';

export const metadata: Metadata = {
  title: 'Science | TranzLife Biosciences',
  description: siteData.science.intro,
};

export default function Page() {
  return <SciencePage />;
}
