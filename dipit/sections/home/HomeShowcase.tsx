'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { featuredProducts as products, modelImage } from '@/data/products';
import { useSite, SiteLink, type BottleOrigin } from '@/components/layout/SiteShell';
const CarouselScene = dynamic(() => import('@/components/3d/CarouselScene'), { ssr: false });
export default function HomeShowcase() {
  const { navigateProduct, ready } = useSite();
  const [hovered, setHovered] = useState<number | null>(null),
    [active, setActive] = useState(0),
    [supported, setSupported] = useState(true),
    [modelReady, setModelReady] = useState(false),
    [reduced, setReduced] = useState(false);
  const stage = useRef<HTMLElement>(null),
    cursor = useRef<HTMLDivElement>(null),
    motion = useRef({
      current: 0,
      target: 0,
      velocity: 0,
      dragging: false,
      pointerX: 0,
      pointerY: 0,
    }),
    drag = useRef({ x: 0, last: 0, moved: false });
  const select = useCallback(
    (i: number, origin?: BottleOrigin) => {
      sessionStorage.setItem('dipitt-selected', products[i].id);
      navigateProduct(
        products[i].id,
        origin || { x: innerWidth / 2, y: innerHeight * 0.5, height: 400, rotation: 0 },
      );
    },
    [navigateProduct],
  );
  useEffect(() => {
    setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches);
    try {
      const c = document.createElement('canvas');
      setSupported(!!(c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      setSupported(false);
    }
    const node = stage.current!;
    let wheelTotal = 0;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const d =
        (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) *
        (e.deltaMode === 1 ? 16 : 1);
      wheelTotal += d;
      motion.current.target += Math.max(-0.5, Math.min(0.5, d * 0.0022));
      if (Math.abs(wheelTotal) > 100) wheelTotal = 0;
    };
    node.addEventListener('wheel', wheel, { passive: false });
    const id = window.setInterval(
      () => setActive(((Math.round(motion.current.target) % 5) + 5) % 5),
      100,
    );
    return () => {
      node.removeEventListener('wheel', wheel);
      clearInterval(id);
    };
  }, []);
  const step = (d: number) => {
    motion.current.target = Math.round(motion.current.target) + d;
    setActive(((Math.round(motion.current.target) % 5) + 5) % 5);
  };
  return (
    <main id="main" className="home-main">
      <section
        ref={stage}
        className={`home-showcase ${ready ? 'is-ready' : ''}`}
        aria-roledescription="carousel"
        aria-label="Discover DIPITT sauces"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            step(1);
          }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            step(-1);
          }
        }}
        tabIndex={0}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('a,button')) return;
          drag.current = { x: e.clientX, last: e.clientX, moved: false };
          motion.current.dragging = false;
        }}
        onPointerMove={(e) => {
          motion.current.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
          motion.current.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
          if (cursor.current) {
            cursor.current.style.left = e.clientX + 'px';
            cursor.current.style.top = e.clientY + 'px';
          }
          if (e.buttons === 1) {
            const diff = drag.current.last - e.clientX;
            if (Math.abs(e.clientX - drag.current.x) > 7) {
              drag.current.moved = true;
              motion.current.dragging = true;
              setHovered(null);
            }
            motion.current.target += diff / (window.innerWidth < 600 ? 210 : 370);
            drag.current.last = e.clientX;
          }
        }}
        onPointerUp={() => {
          if (drag.current.moved) motion.current.target += motion.current.velocity * 0.18;
          window.setTimeout(() => (motion.current.dragging = false), 100);
        }}
        onPointerLeave={() => {
          motion.current.dragging = false;
          setHovered(null);
        }}
      >
        <h1 className="sr-only">
          DIPITT — A world of flavour, bottled. Discover our premium sauces.
        </h1>
        <div className="home-artwork" aria-hidden="true">
          <svg className="home-mound" viewBox="0 0 1400 700" preserveAspectRatio="none">
            <path
              d="M-20 700 0 560Q0 495 40 440L220 160Q245 125 295 110L650 10Q710-10 765 12L1085 145Q1125 162 1152 203L1355 505Q1400 565 1420 700Z"
              fill="currentColor"
            />
          </svg>
          <svg className="circular-type" viewBox="0 0 1000 1000">
            <defs>
              <path
                id="circular-copy"
                d="M500 500m-390 0a390 390 0 1 1 780 0a390 390 0 1 1-780 0"
              />
            </defs>
            <text>
              <textPath href="#circular-copy" textLength="2450" lengthAdjust="spacing">
                A LITTLE DIP. ◆ A LOT OF CHARACTER. ◆{' '}
              </textPath>
            </text>
          </svg>
        </div>
        <div className="product-stage">
          {ready && supported ? (
            <CarouselScene
              motion={motion}
              onHover={setHovered}
              onSelect={select}
              reduced={reduced}
              onReady={() => setModelReady(true)}
            />
          ) : null}
          {(!supported || !modelReady) && (
            <div className="fallback-carousel">
              {[-1, 0, 1].map((offset) => {
                const i = (active + offset + 5) % 5;
                return (
                  <button key={offset} onClick={() => select(i)}>
                    <img src={modelImage(products[i].variants[0])} alt={products[i].name} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="home-bottom">
          <div className="home-product-caption">
            <span className="eyebrow">{String(active + 1).padStart(2, '0')} / 05</span>
            <SiteLink href={'/sauces/' + products[active].id}>
              {products[active].name} <span>↗</span>
            </SiteLink>
          </div>
          <div className="discover-prompt">
            <span className="scroll-mark" />
            <span>SCROLL TO DISCOVER</span>
            <span className="mobile-drag">OR DRAG TO EXPLORE</span>
          </div>
          <div className="carousel-arrows">
            <button onClick={() => step(-1)} aria-label="Previous sauce">
              ←
            </button>
            <button onClick={() => step(1)} aria-label="Next sauce">
              →
            </button>
          </div>
        </div>
        <div
          ref={cursor}
          className={`discovery-cursor ${hovered !== null ? 'is-visible' : ''}`}
          aria-hidden="true"
        >
          ◆ DISCOVER {hovered !== null ? products[hovered].category : ''} ↗
        </div>
        <span className="sr-only" aria-live="polite">
          {products[active].name}, sauce {active + 1} of 5
        </span>
      </section>
    </main>
  );
}
