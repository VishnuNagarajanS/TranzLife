import type { Metadata } from 'next';
import { siteData } from '@/lib/tranzlife-data';
import { ProductsIndex } from '@/components/sites/thedropstore/products/ProductsIndex';

export const metadata: Metadata = {
  title: 'Products | TranzLife Biosciences',
  description: siteData.productsPage.subtitle,
};

export default function Page() {
  return <ProductsIndex />;
}
