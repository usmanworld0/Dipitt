import { notFound } from 'next/navigation';
import { products, getProduct } from '@/data/products';
import { ProductDetail } from '@/components/products/ProductDetail';
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  return { title: p?.name || 'Sauce not found', description: p?.description };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  return <ProductDetail key={p.id} product={p} />;
}
