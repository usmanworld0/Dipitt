'use client';
import { useState } from 'react';
import { ScrollMotion } from '@/components/animations/ScrollMotion';
import { Footer } from './Footer';
export function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <main id="main">
      <ScrollMotion>
        <section className="contact-layout">
          <div className="contact-art" aria-hidden="true">
            <svg viewBox="0 0 400 520">
              <path
                d="M214 105C130 40 30 178 115 280c83 101 60 162 17 210 203-48 279-270 144-361-22-16-46-22-62-24Z"
                fill="currentColor"
              />
              <path
                d="M213 113C183 49 220 15 277 25"
                fill="none"
                stroke="var(--orange)"
                strokeWidth="14"
              />
              <path
                d="M198 156c-62 47-48 91-7 139"
                fill="none"
                stroke="var(--cream)"
                strokeWidth="2"
              />
            </svg>
            <span>
              A LITTLE HELLO
              <br />
              GOES A LONG WAY.
            </span>
          </div>
          <div className="contact-content">
            <span className="eyebrow">GOOD CONVERSATIONS START HERE</span>
            <h1>Contact</h1>
            <h2>
              Flavour brings us together.
              <br />
              Let’s start a conversation.
            </h2>
            <p>
              Questions about the collection, a collaboration idea, or just something delicious to
              share. We’re all ears.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="form-row">
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="The name we’ll know you by"
                    maxLength={100}
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    maxLength={180}
                  />
                </label>
              </div>
              <label>
                What’s on your mind?
                <select name="subject">
                  <option>Tell me about the sauces</option>
                  <option>Stocking DIPITT</option>
                  <option>Collaborations & ideas</option>
                  <option>Something else delicious</option>
                </select>
              </label>
              <label>
                Your message
                <textarea
                  required
                  name="message"
                  rows={3}
                  placeholder="Let’s talk flavour…"
                  maxLength={3000}
                />
              </label>
              <button className="primary-button" type="submit">
                {sent ? 'MESSAGE PREVIEWED ✓' : 'PREVIEW MESSAGE'} <span>↗</span>
              </button>
              <p className="form-note" role="status">
                {sent
                  ? 'Thanks for saying hello. This concept form is not connected to email, so your message has not been sent or saved.'
                  : 'Concept enquiry form. Message delivery has not been connected.'}
              </p>
            </form>
          </div>
        </section>
        <Footer />
      </ScrollMotion>
    </main>
  );
}
