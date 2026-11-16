'use client';
import { useEffect, useRef, useState } from 'react';
const photos = [
  {
    src: '/assets/ingredients.webp',
    caption: '01. GOOD THINGS START HERE',
    alt: 'Fresh red chillies and roasted garlic beside a bowl of rich sauce',
  },
  {
    src: '/assets/process.webp',
    caption: '02. A LITTLE TIME. A LOT OF CARE.',
    alt: 'A cook stirring glossy red pepper sauce in a copper saucepan',
  },
  {
    src: '/assets/table.webp',
    caption: '03. BETTER WHEN SHARED',
    alt: 'Friends sharing grilled sandwiches, fries and colourful sauces',
  },
];
export function PhotoGallery() {
  const [selected, setSelected] = useState<number | null>(null),
    track = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDivElement>(null),
    previous = useRef<HTMLElement | null>(null),
    drag = useRef({ x: 0, scroll: 0, moved: false });
  const open = selected !== null;
  useEffect(() => {
    if (!open) return;
    previous.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'ArrowRight') setSelected((i) => ((i ?? 0) + 1) % 3);
      if (e.key === 'ArrowLeft') setSelected((i) => ((i ?? 0) + 2) % 3);
      if (e.key === 'Tab') {
        const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button') || []);
        const first = controls[0],
          last = controls.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === dialog.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
      previous.current?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <section className="photo-gallery">
      <div className="gallery-heading" data-reveal>
        <span className="eyebrow">A FEW MOMENTS WORTH SAVOURING</span>
        <h2>
          From the kitchen.
          <br />
          With character.
        </h2>
        <div>
          <button
            aria-label="Scroll gallery left"
            onClick={() => track.current?.scrollBy({ left: -500, behavior: 'smooth' })}
          >
            ←
          </button>
          <button
            aria-label="Scroll gallery right"
            onClick={() => track.current?.scrollBy({ left: 500, behavior: 'smooth' })}
          >
            →
          </button>
        </div>
      </div>
      <div
        className="gallery-track"
        ref={track}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, scroll: track.current!.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) {
            const dx = e.clientX - drag.current.x;
            if (Math.abs(dx) > 7) drag.current.moved = true;
            if (drag.current.moved) track.current!.scrollLeft = drag.current.scroll - dx;
          }
        }}
      >
        {photos.map((photo, i) => (
          <button
            className="gallery-photo"
            key={photo.src}
            onClick={() => {
              if (!drag.current.moved) setSelected(i);
            }}
            aria-label={'Open photograph: ' + photo.alt}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" draggable={false} />
            <span>
              {photo.caption}
              <span>↗</span>
            </span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <div
          className="lightbox"
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label="DIPITT photo gallery"
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <button
            className="lightbox-close"
            aria-label="Close photo gallery"
            onClick={() => setSelected(null)}
          >
            CLOSE ×
          </button>
          <img src={photos[selected].src} alt={photos[selected].alt} />
          <div className="lightbox-controls">
            <button
              aria-label="Previous photograph"
              onClick={() => setSelected((selected + 2) % 3)}
            >
              ←
            </button>
            <span>{photos[selected].caption}</span>
            <button aria-label="Next photograph" onClick={() => setSelected((selected + 1) % 3)}>
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
