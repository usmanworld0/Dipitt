import { PhotoGallery } from '@/components/animations/PhotoGallery';
import { EditorialHero } from './EditorialPage';
import { Footer } from './Footer';
import { SiteLink } from './SiteShell';
import { ScrollMotion } from '@/components/animations/ScrollMotion';
const experiences = [
  {
    title: 'The tasting table',
    label: 'MEET YOUR NEW FAVOURITE',
    image: '/assets/table.webp',
    text: 'Five sauces. A table full of possibilities. Start with something simple: warm bread, golden fries, or a crisp vegetable. Taste each sauce on its own, then find the pairing that feels like you.',
    pairing:
      'Try this: start mellow with Garlic Mayo, move to Smoky BBQ, then turn up the heat with Original Hot.',
  },
  {
    title: 'A little kitchen alchemy',
    label: 'MAKE A MEAL OF IT',
    image: '/assets/process.webp',
    text: 'A spoonful changes everything. Swirl Chipotle into a dressing. Brush Smoky BBQ over charred vegetables. Finish a bowl of noodles with Signature Chilli. Make something familiar feel entirely new.',
    pairing:
      'Try this: two spoons of Garlic Mayo and one of Original Hot make a beautifully balanced sandwich sauce.',
  },
  {
    title: 'The good company club',
    label: 'PASS THE SAUCE',
    image: '/assets/table.webp',
    text: 'Pull up another chair. Put the sauces in the middle. A DIPITT moment is simply good food and people you want to share it with. No special occasion required.',
    pairing: 'Try this: a big tray of roasted potatoes, your favourite DIPITT sauces, and absolutely no rules.',
  },
];
export function ExperiencePage() {
  return (
    <main id="main">
      <ScrollMotion>
        <EditorialHero
          title="Experience"
          image="/assets/table.webp"
          statement={'Less ordinary.\nMore delicious.'}
        />
        <section className="editorial-intro">
          <span className="eyebrow" data-reveal>
            THE ART OF A GOOD DIP
          </span>
          <h2 data-reveal>
            Make a moment
            <br />
            of it.
          </h2>
          <p data-reveal>
            Flavour is only half the story. The rest is who you share it with. A few ideas for
            bringing a little more DIPITT to your everyday.
          </p>
        </section>
        <div className="experience-stack">
          {experiences.map((e, i) => (
            <section
              className="experience-card"
              key={e.title}
              style={{ '--stack': i } as React.CSSProperties}
            >
              <div className="experience-image">
                <img src={e.image} alt={e.title} loading="lazy" />
                <span>0{i + 1}.</span>
              </div>
              <div className="experience-copy">
                <span className="eyebrow">{e.label}</span>
                <h2>{e.title}</h2>
                <p>{e.text}</p>
                <div className="experience-tip">{e.pairing}</div>
                <SiteLink href="/shop" className="text-link">
                  Bring DIPITT to the table ↗
                </SiteLink>
              </div>
            </section>
          ))}
        </div>
        <PhotoGallery />
        <section className="editorial-quote" data-reveal>
          <span>◆</span>
          <p>
            The best things
            <br />
            <em>are shared.</em>
          </p>
          <SiteLink href="/contact" className="round-link">
            Start a conversation <span>↗</span>
          </SiteLink>
        </section>
        <Footer />
      </ScrollMotion>
    </main>
  );
}
