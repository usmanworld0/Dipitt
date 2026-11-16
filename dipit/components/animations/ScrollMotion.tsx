'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
export function ScrollMotion({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: true });
    lenis.on('scroll', ScrollTrigger.update);
    const context = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>('[data-reveal]')
        .forEach((el) =>
          gsap.fromTo(
            el,
            { y: 65, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.15,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            },
          ),
        );
      gsap.utils
        .toArray<HTMLElement>('[data-parallax]')
        .forEach((el) =>
          gsap.fromTo(
            el,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: 'none',
              scrollTrigger: {
                trigger: el.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          ),
        );
      const hero = root.current?.querySelector('.editorial-hero');
      if (hero)
        gsap.fromTo(
          hero,
          { clipPath: 'inset(0 2.8% 0 2.8% round 16px)' },
          {
            clipPath: 'inset(0 0% 0 0% round 0px)',
            scrollTrigger: { trigger: hero, start: 'top 65%', end: 'top top', scrub: 1 },
          },
        );
      gsap.utils
        .toArray<HTMLElement>('.experience-card')
        .forEach((el, i) =>
          gsap.to(el, {
            scale: 0.95,
            opacity: 0.65,
            scrollTrigger: { trigger: el, start: 'top 10%', end: 'bottom 10%', scrub: true },
            transformOrigin: 'center top',
            delay: i * 0.05,
          }),
        );
    }, root);
    return () => {
      context.revert();
      lenis.destroy();
    };
  }, []);
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
