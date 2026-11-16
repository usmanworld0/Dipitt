import { Footer } from '@/components/layout/Footer';
export const metadata = { title: 'Privacy & Cookies' };
export default function Page() {
  return (
    <main id="main">
      <article className="privacy-page">
        <span className="eyebrow">THE SMALL PRINT</span>
        <h1>
          Privacy
          <br />& Cookies
        </h1>
        <h2>A simple, local experience.</h2>
        <p>
          This DIPITT website is a brand and shopping demonstration. It does not connect to a payment
          service, place orders, or send contact messages.
        </p>
        <h2>Your shopping bag</h2>
        <p>
          Your chosen products, bottle sizes and quantities are saved in your browser’s local
          storage under “dipitt-bag”, so your bag remains available when you return. You can remove
          individual products from the bag or clear this website’s browser data to delete it.
        </p>
        <h2>Your browsing experience</h2>
        <p>
          The website uses session storage to carry a selected product between page views. Fonts,
          editorial photography and product imagery are served from this website. No advertising or
          analytics cookies are set by this application.
        </p>
        <h2>Contact form</h2>
        <p>
          Contact form entries stay on the page. They are not transmitted or stored by this
          application. The form displays a preview confirmation and explains that delivery is not
          connected.
        </p>
      </article>
      <Footer />
    </main>
  );
}
