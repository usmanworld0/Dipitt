'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/data/products';
import { products, getVariant, formatPrice, modelImage } from '@/data/products';
import { SiteLink, useSite } from '@/components/layout/SiteShell';
import { Footer } from '@/components/layout/Footer';
import { ScrollMotion } from '@/components/animations/ScrollMotion';
const ProductScene = dynamic(() => import('@/components/3d/ProductScene'), { ssr: false });
export function ProductDetail({ product }: { product: Product }) {
  const { add, ready } = useSite();
  const [size, setSize] = useState(product.variants[0].size),
    [quantity, setQuantity] = useState(1),
    [added, setAdded] = useState(false),
    [back, setBack] = useState(false),
    [webgl, setWebgl] = useState(false),
    [sceneReady, setSceneReady] = useState(false),
    [reduced, setReduced] = useState(false);
  const angle = useRef(-0.12);
  const drag = useRef<number | null>(null);
  useEffect(() => {
    try {
      setWebgl(!!document.createElement('canvas').getContext('webgl2'));
    } catch {}
    setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  const rotate = (amount: number) => {
    angle.current += amount;
    setBack(Math.cos(angle.current) < 0);
  };
  const variant = getVariant(product, size);
  const i = products.findIndex((p) => p.id === product.id),
    next = products[(i + 1) % products.length];
  return (
    <main
      id="main"
      className="product-detail"
      style={
        {
          '--product-color': product.color,
          '--product-accent': product.accent,
        } as React.CSSProperties
      }
    >
      <ScrollMotion>
        <div className="product-detail-heading">
          <SiteLink href="/sauces" className="eyebrow">
            ← THE COLLECTION
          </SiteLink>
          <h1
            className={
              product.name.split(' ').some((word) => word.length > 10)
                ? 'long-product-name'
                : undefined
            }
          >
            {product.short}
          </h1>
          <span className="product-edition">
            NO. {String(i + 1).padStart(2, '0')} / THE DIPITT COLLECTION
          </span>
        </div>
        <section className="product-feature">
          <span className="product-category">
            {product.category}
            <br />
            <small>Full of character</small>
          </span>
          <div
            className="product-canvas"
            role="group"
            aria-label={`Interactive 3D DIPITT ${product.name}. Drag to rotate, or use the rotation buttons.`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                rotate(e.key === 'ArrowLeft' ? -Math.PI / 4 : Math.PI / 4);
              }
            }}
            onPointerDown={(e) => {
              drag.current = e.clientX;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (drag.current !== null) {
                rotate((e.clientX - drag.current) * 0.012);
                drag.current = e.clientX;
              }
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            {ready && webgl && (
              <ProductScene
                product={product}
                variant={variant}
                angle={angle}
                still={reduced}
                onReady={() => setSceneReady(true)}
              />
            )}
            {(!ready || !webgl || !sceneReady) && (
              <img
                className="model-poster"
                key={variant.image + back}
                src={back ? variant.backImage : modelImage(variant)}
                alt={`DIPITT ${product.name} ${variant.size}${variant.unit}, ${back ? 'back label' : 'front view'}`}
                fetchPriority="high"
                draggable={false}
              />
            )}
          </div>
          <div className="product-origin">
            Good ingredients.
            <br />
            Great possibilities.
          </div>
          <div className="rotation-controls">
            <button onClick={() => rotate(-Math.PI / 2)} aria-label="Rotate bottle left">
              ←
            </button>
            <span>DRAG TO EXPLORE · 360°</span>
            <button onClick={() => rotate(Math.PI / 2)} aria-label="Rotate bottle right">
              →
            </button>
          </div>
        </section>
        <section className="product-description">
          <span className="eyebrow" data-reveal>
            {product.note}
          </span>
          <h2 data-reveal>{product.description.split('.')[0]}.</h2>
          <div className="product-buy-grid">
            <div data-reveal>
              <p>{product.description}</p>
              <details open>
                <summary>
                  Ingredients & label <span>+</span>
                </summary>
                <p>{product.ingredients}</p>
                <a href={variant.backImage} target="_blank" rel="noreferrer" className="text-link">
                  Open the back label ↗
                </a>
              </details>
              <details>
                <summary>
                  The perfect pairing <span>+</span>
                </summary>
                <p>{product.pairing}</p>
              </details>
              <details>
                <summary>
                  Care for your sauce <span>+</span>
                </summary>
                <p>
                  Follow the storage and serving instructions on your selected pack. Open the back
                  label for full product information and best-before guidance.
                </p>
              </details>
            </div>
            <div className="purchase-panel" data-reveal>
              <div className="purchase-price">
                {formatPrice(variant.price)}
                <small>
                  {' '}
                  / {size}
                  {variant.unit}
                </small>
              </div>
              <span className="eyebrow">MAKE IT YOURS</span>
              <div className="size-options" role="group" aria-label="Pack size">
                {product.variants.map((pack) => {
                  const s = pack.size;
                  return (
                    <button
                      key={s}
                      className={size === s ? 'is-active' : ''}
                      aria-pressed={size === s}
                      onClick={() => {
                        if (s !== size) setSceneReady(false);
                        setSize(s);
                        setAdded(false);
                      }}
                    >
                      {s}
                      {pack.unit}
                    </button>
                  );
                })}
              </div>
              <div className="purchase-action">
                <div className="quantity-control">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    disabled={quantity === 1}
                  >
                    −
                  </button>
                  <span aria-live="polite">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    aria-label="Increase quantity"
                    disabled={quantity === 99}
                  >
                    +
                  </button>
                </div>
                <button
                  className="primary-button"
                  disabled={!variant.available}
                  onClick={() => {
                    add(product.id, size, quantity);
                    setAdded(true);
                  }}
                >
                  {!variant.available ? 'SOLD OUT' : added ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}{' '}
                  <span>↗</span>
                </button>
              </div>
              <p className="purchase-note">
                {added ? (
                  <SiteLink href="/cart">Your next good meal is in the bag. View bag ↗</SiteLink>
                ) : (
                  'A little dip goes a long way. Generous dips encouraged.'
                )}
              </p>
              <p className="demo-note">
                Official DIPITT pack sizes and listed prices. This local bag is a preview.
              </p>
              <a className="text-link" href={variant.sourceUrl} target="_blank" rel="noreferrer">
                Shop this pack at DIPITT ↗
              </a>
            </div>
          </div>
        </section>
        <section className="next-product">
          <span className="eyebrow">ANOTHER SIDE OF DIPITT</span>
          <SiteLink href={'/sauces/' + next.id}>
            <span>{next.name}</span>
            <img src={modelImage(next.variants[0])} alt={next.name} loading="lazy" />
            <span>↗</span>
          </SiteLink>
        </section>
        <Footer />
      </ScrollMotion>
    </main>
  );
}
