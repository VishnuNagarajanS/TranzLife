import type { Metadata } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/sites/thedropstore/AppShell';

// Serif for the TranzLife wordmark only; headlines stay in the grotesk.
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['600'], variable: '--font-cormorant', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tranzlife.in'),
  title: 'TranzLife Biosciences – Innovating Life Beyond Limits',
  description:
    'From the roots of Nature to the infinity of Science. Tranz Life Biosciences creates natural, science-backed wellness products, made in Chennai, India.',
  icons: {
    icon: '/tranzlife/brochure/logo-mark-sm.png',
  },
  openGraph: {
    title: 'TranzLife Biosciences – Innovating Life Beyond Limits',
    description: 'From the roots of Nature to the infinity of Science.',
    type: 'website',
    siteName: 'TranzLife Biosciences',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
