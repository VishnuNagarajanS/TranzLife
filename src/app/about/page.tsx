import { Metadata } from 'next';
import { siteData } from '@/lib/tranzlife-data';
import { AboutPage } from '@/components/sites/thedropstore/about/AboutPage';

export const metadata: Metadata = {
  title: 'Our Story | TranzLife Biosciences',
  description: siteData.about.heroText,
};

export default function Page() {
  return <AboutPage />;
}
