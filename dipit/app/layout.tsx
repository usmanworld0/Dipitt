import type { Metadata } from 'next';
import { SiteShell } from '@/components/layout/SiteShell';
import './globals.css';
import './styles/base.css';
import './styles/pages.css';
import './styles/responsive.css';
export const metadata: Metadata = {
  title: { default: 'DIPITT — A little dip. A lot of character.', template: '%s — DIPITT' },
  description:
    'A world of flavour, bottled. Discover DIPITT Hot Sauce, Peri Peri, Smokey BBQ, Chipotle, Sriracha and more.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
