import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactPage } from '@/components/sites/thedropstore/contact/ContactPage';

export const metadata: Metadata = {
  title: 'Contact | TranzLife Biosciences',
  description: "Let's build a healthier tomorrow. Product, distributor and research enquiries for Tranz Life Biosciences, Chennai.",
};

export default function Page() {
  return (
    <Suspense>
      <ContactPage />
    </Suspense>
  );
}
