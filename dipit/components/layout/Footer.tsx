import { navigation } from '@/data/products';
import { SiteLink, Brand } from './SiteShell';
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <span className="eyebrow">GOOD FOOD. GREAT COMPANY. DIPITT.</span>
        <SiteLink href="/shop" className="round-link">
          Find your flavour <span>↗</span>
        </SiteLink>
      </div>
      <SiteLink href="/" className="footer-brand" data-reveal aria-label="DIPITT home">
        <Brand large />
      </SiteLink>
      <div className="footer-columns" data-reveal>
        <div>
          <span className="eyebrow">EXPLORE</span>
          {navigation.slice(0, 4).map(([label, href]) => (
            <SiteLink href={href} key={href}>
              {label}
            </SiteLink>
          ))}
        </div>
        <div>
          <span className="eyebrow">A LITTLE MORE DIPITT</span>
          {navigation.slice(4).map(([label, href]) => (
            <SiteLink href={href} key={href}>
              {label}
            </SiteLink>
          ))}
        </div>
        <div className="footer-message">
          <p>
            A question, a big idea, or a shared love of sauce? Good things start with a
            conversation.
          </p>
          <SiteLink href="/contact" className="footer-contact">
            Let’s talk flavour ↗
          </SiteLink>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 DIPITT — Premium sauces</span>
        <span>A world of flavour, bottled.</span>
        <SiteLink href="/privacy">Privacy & Cookies</SiteLink>
      </div>
    </footer>
  );
}
