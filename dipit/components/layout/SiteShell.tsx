'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { navigation, getProduct, modelImage } from '@/data/products';
import { LoadingScreen } from '@/components/animations/LoadingScreen';

export type BagItem = { id: string; size: number; quantity: number };
export type BottleOrigin = { x: number; y: number; height: number; rotation: number };
type SiteContextValue = {
  navigate: (href: string) => void;
  navigateProduct: (id: string, origin: BottleOrigin) => void;
  bag: BagItem[];
  add: (id: string, size: number, quantity: number) => void;
  update: (id: string, size: number, quantity: number) => void;
  ready: boolean;
  markHomeReady: () => void;
};
const SiteContext = createContext<SiteContextValue>(null!);
export const useSite = () => useContext(SiteContext);
export function SiteLink({
  href,
  children,
  onClick,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigate } = useSite();
  return (
    <a
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
          e.preventDefault();
          navigate(href);
        }
      }}
    >
      {children}
    </a>
  );
}
export function Brand({ large = false }: { large?: boolean }) {
  return (
    <span className={`brand ${large ? 'brand-large' : ''}`}>
      <img
        className="brand-logo"
        src="/assets/dipitt/logo.webp"
        alt="DIPITT"
        width={516}
        height={200}
      />
      {!large && <span className="brand-caption">A world of flavour</span>}
    </span>
  );
}
export function SiteShell({ children }: { children: React.ReactNode }) {
  const router = useRouter(),
    pathname = usePathname();
  const [menu, setMenu] = useState(false),
    [ready, setReady] = useState(false),
    [homeReady, setHomeReady] = useState(false),
    [bag, setBag] = useState<BagItem[]>([]),
    [hidden, setHidden] = useState(false),
    [light, setLight] = useState(false);
  const markHomeReady = useCallback(() => setHomeReady(true), []);
  const transition = useRef<HTMLDivElement>(null),
    sharedBottle = useRef<HTMLImageElement>(null),
    sharedActive = useRef(false),
    busy = useRef(false),
    menuButton = useRef<HTMLButtonElement>(null),
    menuPanel = useRef<HTMLDivElement>(null),
    loaded = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dipitt-bag') || '[]');
      if (Array.isArray(saved))
        setBag(
          saved.filter(
            (i) =>
              i &&
              typeof i.id === 'string' &&
              !!getProduct(i.id) &&
              getProduct(i.id)!.variants.some((v) => v.size === i.size) &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 99,
          ),
        );
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    try {
      if (loaded.current) localStorage.setItem('dipitt-bag', JSON.stringify(bag));
    } catch {
      /* The bag still works for this visit when browser storage is disabled. */
    }
  }, [bag]);
  const add = useCallback(
    (id: string, size: number, quantity: number) =>
      setBag((items) => {
        const found = items.find((i) => i.id === id && i.size === size);
        return found
          ? items.map((i) =>
              i === found ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i,
            )
          : [...items, { id, size, quantity }];
      }),
    [],
  );
  const update = useCallback(
    (id: string, size: number, quantity: number) =>
      setBag((items) =>
        items
          .map((i) =>
            i.id === id && i.size === size ? { ...i, quantity: Math.min(99, quantity) } : i,
          )
          .filter((i) => i.quantity > 0),
      ),
    [],
  );
  const navigate = useCallback(
    (href: string) => {
      setMenu(false);
      if (href === pathname) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (busy.current) return;
      busy.current = true;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      gsap.fromTo(
        transition.current,
        { y: 0, yPercent: 100 },
        {
          yPercent: 0,
          duration: reduced ? 0.01 : 0.55,
          ease: 'power3.inOut',
          onComplete: () => {
            router.push(href, { scroll: false });
          },
        },
      );
    },
    [pathname, router],
  );
  const navigateProduct = useCallback(
    (id: string, origin: BottleOrigin) => {
      if (busy.current) return;
      const img = sharedBottle.current!;
      img.src = modelImage(getProduct(id)!.variants[0]);
      sharedActive.current = true;
      gsap.set(img, {
        xPercent: -50,
        yPercent: -50,
        x: origin.x,
        y: origin.y,
        height: origin.height,
        rotation: origin.rotation,
        opacity: 1,
      });
      gsap.to(img, {
        x: innerWidth / 2,
        y: innerHeight * 0.56,
        rotation: -4,
        height: innerWidth < 600 ? 300 : 500,
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.01 : 0.6,
        ease: 'power3.inOut',
      });
      navigate('/sauces/' + id);
    },
    [navigate],
  );
  useEffect(() => {
    setHidden(false);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    if (busy.current) {
      gsap.to(transition.current, {
        yPercent: -100,
        delay: 0.1,
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.01 : 0.7,
        ease: 'power4.inOut',
        onComplete: () => {
          busy.current = false;
          gsap.set(transition.current, { y: 0, yPercent: 100 });
        },
      });
      if (sharedActive.current) {
        requestAnimationFrame(() => {
          const rect = document.querySelector('.product-canvas')?.getBoundingClientRect();
          gsap.to(sharedBottle.current, {
            x: rect ? rect.left + rect.width / 2 : innerWidth / 2,
            y: rect ? rect.top + rect.height / 2 : innerHeight,
            rotation: 0,
            height: rect ? rect.height * 0.82 : 500,
            duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.01 : 0.85,
            ease: 'power3.inOut',
            onComplete: () => {
              gsap.to(sharedBottle.current, { opacity: 0, duration: 0.15 });
              sharedActive.current = false;
            },
          });
        });
      }
    }
  }, [pathname]);
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      setHidden(window.scrollY > 240 && window.scrollY > last);
      last = window.scrollY;
      setLight(
        !!document
          .elementFromPoint(20, 160)
          ?.closest('.site-footer,.editorial-hero,.pairing-banner'),
      );
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const previous = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    const first = menuPanel.current?.querySelector<HTMLAnchorElement>('a');
    first?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        menuButton.current?.focus();
      }
      if (e.key === 'Tab') {
        const items = [
          menuButton.current,
          ...Array.from(menuPanel.current?.querySelectorAll<HTMLElement>('a,button') || []),
        ].filter(Boolean) as HTMLElement[];
        const n = items.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && n <= 0) {
          e.preventDefault();
          items.at(-1)?.focus();
        } else if (!e.shiftKey && n === items.length - 1) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', key);
      previous?.focus({ preventScroll: true });
    };
  }, [menu]);
  const studio = pathname === '/studio';
  return (
    <SiteContext.Provider
      value={{ navigate, navigateProduct, bag, add, update, ready, markHomeReady }}
    >
      {!studio && (
        <>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <header
            className={`site-header ${menu ? 'menu-is-open' : ''} ${light ? 'is-light' : ''} ${hidden && !menu ? 'header-hidden' : ''}`}
          >
            <div className="header-left">
              <span className="language" aria-label="Language: English">
                EN
              </span>
              <SiteLink
                href="/cart"
                className="bag-link"
                aria-label={`Shopping bag, ${bag.reduce((s, i) => s + i.quantity, 0)} items`}
              >
                BAG <span>({bag.reduce((s, i) => s + i.quantity, 0)})</span>
              </SiteLink>
            </div>
            <SiteLink href="/" className="brand-link" aria-label="DIPITT home">
              <Brand />
            </SiteLink>
            <button
              ref={menuButton}
              className="menu-button"
              aria-expanded={menu}
              aria-controls="main-menu"
              onClick={() => setMenu(!menu)}
            >
              <span className="menu-pill">{menu ? 'CLOSE' : 'MENU'}</span>
              <span className="menu-disc" aria-hidden="true">
                {menu ? '×' : '◆'}
              </span>
            </button>
          </header>
          <div
            ref={menuPanel}
            id="main-menu"
            className={`menu-overlay ${menu ? 'is-open' : ''}`}
            inert={!menu}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
          >
            <nav className="menu-primary" aria-label="Primary">
              {navigation.slice(0, 4).map(([label, href], i) => (
                <div className="menu-row" key={href} style={{ '--row': i } as React.CSSProperties}>
                  <SiteLink
                    href={href}
                    aria-label={label}
                    className={pathname === href ? 'is-active' : ''}
                  >
                    {Array.from(label).map((letter, j) => (
                      <span
                        className="menu-char"
                        key={j}
                        style={{ '--char': j } as React.CSSProperties}
                      >
                        <span data-letter={letter}>{letter === ' ' ? '\u00a0' : letter}</span>
                      </span>
                    ))}
                    <span className="menu-diamond">◆</span>
                  </SiteLink>
                </div>
              ))}
            </nav>
            <div className="menu-secondary">
              {navigation.slice(4).map(([label, href]) => (
                <SiteLink key={href} href={href} aria-label={label}>
                  {label}
                  {href === '/shop' ? ' ↗' : ''}
                </SiteLink>
              ))}
            </div>
            <span className="menu-footnote">A LITTLE DIP. A LOT OF CHARACTER.</span>
          </div>
        </>
      )}
      {children}
      {!studio && (
        <>
          <SiteLink href="/privacy" className="privacy-link">
            Privacy & Cookies
          </SiteLink>
          <div ref={transition} className="page-transition" aria-hidden="true">
            <span>DIPITT</span>
          </div>
          <img ref={sharedBottle} className="shared-bottle" alt="" aria-hidden="true" />
          <LoadingScreen
            canFinish={pathname !== '/' || homeReady}
            onComplete={() => setReady(true)}
          />
        </>
      )}
    </SiteContext.Provider>
  );
}
