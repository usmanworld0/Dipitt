'use client';
import { useState } from 'react';
import { getProduct, getVariant, formatPrice, modelImage } from '@/data/products';
import { SiteLink, useSite } from '@/components/layout/SiteShell';
import { Footer } from '@/components/layout/Footer';
export function CartPage() {
  const { bag, update } = useSite(),
    [checkout, setCheckout] = useState(false);
  const total = bag.reduce(
    (s, item) =>
      s +
      (getProduct(item.id) ? getVariant(getProduct(item.id)!, item.size).price : 0) * item.quantity,
    0,
  );
  return (
    <main id="main">
      <section className="cart-page">
        <span className="eyebrow">GOOD THINGS IN HERE</span>
        <h1>
          Your bag<span>({bag.reduce((s, i) => s + i.quantity, 0)})</span>
        </h1>
        {bag.length === 0 ? (
          <div className="empty-bag">
            <span>◆</span>
            <h2>
              A little room
              <br />
              for a lot of flavour.
            </h2>
            <p>Your bag is waiting for its first good thing.</p>
            <SiteLink href="/shop" className="round-link">
              Find your flavour <span>↗</span>
            </SiteLink>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {bag.map((item) => {
                const p = getProduct(item.id);
                if (!p) return null;
                return (
                  <article className="cart-item" key={item.id + item.size}>
                    <SiteLink href={'/sauces/' + p.id} className="cart-image">
                      <img src={modelImage(getVariant(p, item.size))} alt={p.name} />
                    </SiteLink>
                    <div className="cart-item-info">
                      <span className="eyebrow">{p.category} COLLECTION</span>
                      <SiteLink href={'/sauces/' + p.id}>
                        <h2>{p.name}</h2>
                      </SiteLink>
                      <p>
                        {item.size}
                        {getVariant(p, item.size).unit}
                      </p>
                      <button className="remove-item" onClick={() => update(item.id, item.size, 0)}>
                        Remove
                      </button>
                    </div>
                    <div className="cart-item-end">
                      <span>{formatPrice(getVariant(p, item.size).price * item.quantity)}</span>
                      <div className="quantity-control">
                        <button
                          aria-label={`Decrease ${p.name} quantity`}
                          onClick={() => update(item.id, item.size, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label={`Increase ${p.name} quantity`}
                          disabled={item.quantity === 99}
                          onClick={() => update(item.id, item.size, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <aside className="cart-summary">
              <span className="eyebrow">A VERY GOOD CHOICE</span>
              <h2>
                A taste of
                <br />
                what’s to come.
              </h2>
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span>Not calculated</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button className="primary-button" onClick={() => setCheckout(true)}>
                REVIEW ORDER <span>↗</span>
              </button>
              <p className="demo-note">Concept shop. No payment or order service is connected.</p>
              {checkout && (
                <div className="checkout-notice" role="status">
                  <h3>Your flavour selection is ready.</h3>
                  <p>
                    This is a working local shopping bag. Checkout is a demonstration: no payment
                    will be taken and no order will be placed.
                  </p>
                  <button className="text-link" onClick={() => setCheckout(false)}>
                    Keep exploring ←
                  </button>
                </div>
              )}
              <SiteLink href="/shop" className="text-link">
                Continue shopping ↗
              </SiteLink>
            </aside>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
