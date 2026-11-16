'use client';
import { useState } from 'react';
import { products, formatPrice, modelImage } from '@/data/products';
import { SiteLink } from '@/components/layout/SiteShell';
export function ProductGrid({ shop = false }: { shop?: boolean }) {
  const [filter, setFilter] = useState('All');
  const items = products.filter((p) => filter === 'All' || p.category === filter);
  return (
    <section className="product-collection" id="collection">
      <div className="collection-heading" data-reveal>
        <span className="eyebrow">A WORLD OF FLAVOUR. ONE OBSESSION.</span>
        <h2>{shop ? 'A very good\nplace to dip.' : 'Find your\nkind of bold.'}</h2>
      </div>
      <div className="category-tabs" aria-label="Filter sauces">
        {['All', 'Heat', 'Smoky', 'Savoury', 'Sweet & Tangy'].map((category) => (
          <button
            key={category}
            className={filter === category ? 'is-active' : ''}
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
          >
            {category}
            <span>
              {category === 'All'
                ? String(products.length).padStart(2, '0')
                : String(products.filter((p) => p.category === category).length).padStart(2, '0')}
            </span>
          </button>
        ))}
      </div>
      <div className="product-grid">
        {items.map((p) => (
          <SiteLink
            href={'/sauces/' + p.id}
            className="product-tile"
            key={p.id}
            style={
              { '--product-color': p.color, '--product-accent': p.accent } as React.CSSProperties
            }
          >
            <div className="product-tile-image">
              <span className="tile-number">
                {String(products.indexOf(p) + 1).padStart(2, '0')}
              </span>
              <span className="tile-halo" />
              <img
                src={modelImage(p.variants[0])}
                alt={`DIPITT ${p.name}, ${p.variants[0].size}${p.variants[0].unit}`}
                loading="lazy"
                width={460}
                height={780}
              />
              <span className="tile-discover">DISCOVER ↗</span>
            </div>
            <div className="tile-info">
              <h3>{p.name}</h3>
              <span>
                {formatPrice(p.price)}{' '}
                <small>
                  / {p.variants[0].size}
                  {p.variants[0].unit}
                </small>
              </span>
            </div>
            <div className="tile-sub">
              <span>{p.category} collection</span>
              <span>
                {p.variants.length} {p.variants.length === 1 ? 'pack size' : 'pack sizes'}
              </span>
            </div>
          </SiteLink>
        ))}
      </div>
    </section>
  );
}
