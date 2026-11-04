import type { Metadata } from 'next';
import { DisclaimerPage } from '@/components/sites/thedropstore/disclaimer/DisclaimerPage';

export const metadata: Metadata = {
  title: 'Disclaimer | TranzLife Biosciences',
  description: 'Product, health-claim and website disclaimer for Tranz Life Biosciences Pvt. Ltd.',
};

export default function Page() {
  return <DisclaimerPage />;
}
