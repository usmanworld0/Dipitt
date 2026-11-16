import { SiteLink } from '@/components/layout/SiteShell';
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <span className="eyebrow">A LITTLE OFF THE MENU</span>
      <h1>404</h1>
      <h2>
        That flavour is still
        <br />
        waiting to be discovered.
      </h2>
      <SiteLink href="/" className="round-link">
        Back to DIPITT <span>↗</span>
      </SiteLink>
    </main>
  );
}
