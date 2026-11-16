'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { products } from '@/data/products';
const ProductScene = dynamic(() => import('@/components/3d/ProductScene'), { ssr: false });
export default function Studio() {
  const [index, setIndex] = useState<number | null>(null),
    [size, setSize] = useState<number | null>(null);
  const angle = useRef(-0.18);
  useEffect(() => {
    document.fonts.ready.then(() => {
      const query = new URLSearchParams(location.search);
      angle.current = Number(query.get('angle') || '-0.18');
      setSize(Number(query.get('size')) || null);
      setIndex(Number(query.get('product') || 0));
    });
  }, []);
  return (
    <main className="asset-studio" style={{ width: 460, height: 780 }}>
      {index !== null && (
        <ProductScene
          product={products[index % products.length]}
          variant={products[index % products.length].variants.find((pack) => pack.size === size)}
          angle={angle}
          still
          exportable
        />
      )}
    </main>
  );
}
