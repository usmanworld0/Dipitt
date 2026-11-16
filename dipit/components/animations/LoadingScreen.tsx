'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const done = useRef(onComplete);
  const [percent, setPercent] = useState(0),
    [finished, setFinished] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const progress = { value: 0 };
    const tween = gsap.to(progress, {
      value: 90,
      duration: 1.65,
      ease: 'power2.out',
      onUpdate: () => setPercent(Math.floor(progress.value)),
    });
    Promise.all([
      document.fonts.ready,
      ...['/assets/ingredients.webp', '/assets/table.webp'].map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = resolve;
            img.src = src;
          }),
      ),
    ]).then(() => {
      if (cancelled) return;
      tween.eventCallback('onComplete', () => {
        gsap.to(progress, {
          value: 100,
          duration: 0.3,
          onUpdate: () => setPercent(Math.floor(progress.value)),
          onComplete: () => {
            done.current();
            const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
            gsap.to(root.current, {
              yPercent: -100,
              delay: 0.15,
              duration: reduced ? 0.01 : 1.1,
              ease: 'power4.inOut',
              onComplete: () => setFinished(true),
            });
          },
        });
      });
      if (progress.value >= 90) tween.progress(0.999);
    });
    return () => {
      cancelled = true;
      tween.kill();
    };
  }, []);
  if (finished) return null;
  return (
    <div ref={root} className="loading-screen" aria-label="Loading DIPITT" role="status">
      <span className="loading-word">DIPITT</span>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <svg
          className={`falling-pepper pepper-${i}`}
          viewBox="0 0 90 130"
          key={i}
          aria-hidden="true"
        >
          <path
            d="M52 24C35 12 13 42 28 63c16 23 16 46 6 61 40-17 55-75 30-96-4-3-9-4-12-4Z"
            fill="currentColor"
          />
          <path d="M52 27C44 13 57 6 69 8" fill="none" stroke="var(--burgundy)" strokeWidth="6" />
        </svg>
      ))}
      <span className="loading-caption">GOOD THINGS TAKE A MOMENT.</span>
      <span className="loading-percent">{percent}%</span>
      <div className="loading-line" style={{ transform: `scaleX(${percent / 100})` }} />
    </div>
  );
}
