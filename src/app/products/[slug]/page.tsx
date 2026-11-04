import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { siteData, getProductBySlug } from '@/lib/tranzlife-data';
import { ProductPage } from '@/components/sites/thedropstore/product/ProductPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return siteData.products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.title} – ${product.subtitle} | TranzLife Biosciences`,
    description: product.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
