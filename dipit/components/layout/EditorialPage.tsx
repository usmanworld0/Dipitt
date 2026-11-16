import { PhotoGallery } from '@/components/animations/PhotoGallery';
import { Footer } from './Footer';
import { SiteLink } from './SiteShell';
import { ScrollMotion } from '@/components/animations/ScrollMotion';
import { ProductGrid } from '@/components/products/ProductGrid';
export function EditorialHero({
  title,
  image,
  statement,
}: {
  title: string;
  image: string;
  statement: string;
}) {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">THE WORLD OF DIPITT</span>
        <h1>{title}</h1>
      </div>
      <section className="editorial-hero">
        <img
          src={image}
          alt={
            title === 'Our Sauces'
              ? 'A convivial table of fresh food and sauces'
              : 'Fresh chillies, roasted garlic and red pepper sauce in warm afternoon light'
          }
          data-parallax
          fetchPriority="high"
        />
        <h2 data-reveal>{statement}</h2>
        <span className="image-caption">GOOD INGREDIENTS. GREAT POSSIBILITIES.</span>
      </section>
    </>
  );
}
const config = {
  ingredients: {
    title: 'Ingredients',
    image: '/assets/ingredients.webp',
    statement: 'Nothing to hide.\nEverything to taste.',
    intro: 'It starts with something real.',
    lead: 'From chipotle peppers to mango and habanero, explore the ingredients behind the DIPITT collection. Each pack has its own recipe: open its back label on the product page for the full ingredient and allergen information.',
    label: 'FROM INGREDIENT TO OBSESSION',
    sections: [
      [
        '01',
        'A little fire.',
        'Peppers with personality',
        'DIPITT Hot Sauce uses peppers from South America and an aged pepper mash. Chipotle brings another side of chilli to the table, with the distinctive character of chipotle peppers.',
      ],
      [
        '02',
        'Slow is a flavour.',
        'Garlic, tomato & basil',
        'DIPITT Pasta Sauce brings together tomatoes, garlic and basil. Pizza Sauce pairs tomatoes and garlic with Italian seasonings. Explore the savoury collection for everyday kitchen companions.',
      ],
      [
        '03',
        'Balance is everything.',
        'A bright, clean finish',
        'Mango Habanero pairs real mango with habanero peppers. Khatti Meethi brings tamarind and spices to the table. Sweet Thai Chilli balances sweetness with the character of Thai bird’s eye chillies.',
      ],
    ],
  },
  story: {
    title: 'Our Story',
    image: '/assets/table.webp',
    statement: 'For the love\nof the last bite.',
    intro: 'Good food brings us together.',
    lead: 'DIPITT begins with a simple thought: the little things on the table can make the biggest difference. The sauce passed between friends. The extra dip that turns a snack into a ritual. The flavour you keep thinking about.',
    label: 'A LITTLE DIP. A LOT OF CHARACTER.',
    sections: [
      [
        '01',
        'Made to be shared.',
        'Something for every table',
        'We see sauce as an invitation. To try something new, to get your hands a little messy, to stay at the table a little longer. Flavours from around the world, brought together by one love of good food.',
      ],
      [
        '02',
        'Character, bottled.',
        'A world of flavour',
        'Bright and fiery. Smooth and mellow. Deep and smoky. Our collection explores the small details that make a flavour your favourite. There is no right way to DIPITT. Only your way.',
      ],
      [
        '03',
        'Keep it generous.',
        'Our philosophy',
        'A good sauce should add more than heat. It should bring texture, balance and a little surprise. We believe in real ingredients, thoughtful recipes and the joy of an everyday meal made memorable.',
      ],
    ],
  },
};
export function StoryPage({ kind }: { kind: 'ingredients' | 'story' }) {
  const c = config[kind];
  return (
    <main id="main">
      <ScrollMotion>
        <EditorialHero title={c.title} image={c.image} statement={c.statement} />
        <section className="editorial-intro">
          <span className="eyebrow" data-reveal>
            {c.label}
          </span>
          <h2 data-reveal>{c.intro}</h2>
          <p data-reveal>{c.lead}</p>
        </section>
        {c.sections.map(([number, title, label, text], i) => (
          <section className={`story-section ${i % 2 ? 'is-reversed' : ''}`} key={number}>
            <div className="story-section-image">
              <img
                src={
                  i === 1
                    ? '/assets/process.webp'
                    : i === 2
                      ? '/assets/table.webp'
                      : '/assets/ingredients.webp'
                }
                alt={label}
                loading="lazy"
                data-parallax
              />
              <span>{number} / 03</span>
            </div>
            <div className="story-section-copy" data-reveal>
              <span className="eyebrow">{label}</span>
              <h2>{title}</h2>
              <p>{text}</p>
              {i === 2 && (
                <SiteLink href="/sauces" className="text-link">
                  Explore our sauces ↗
                </SiteLink>
              )}
            </div>
          </section>
        ))}
        <PhotoGallery />
        <section className="editorial-quote" data-reveal>
          <span>◆</span>
          <p>
            A little dip.
            <br />
            <em>A lot of character.</em>
          </p>
          <SiteLink href="/experience" className="round-link">
            Make a moment of it <span>↗</span>
          </SiteLink>
        </section>
        <Footer />
      </ScrollMotion>
    </main>
  );
}
export function SaucesPage({ shop = false }: { shop?: boolean }) {
  return (
    <main id="main">
      <ScrollMotion>
        {shop ? (
          <div className="page-heading shop-heading">
            <span className="eyebrow">YOUR NEXT FAVOURITE</span>
            <h1>The Sauce Shop</h1>
            <p>Big flavour. Real DIPITT favourites. Ready for your table.</p>
          </div>
        ) : (
          <>
            <EditorialHero
              title="Our Sauces"
              image="/assets/table.webp"
              statement={'A world of flavour.\nOne bottle at a time.'}
            />
            <section className="editorial-intro">
              <span className="eyebrow" data-reveal>
                THE DIPITT COLLECTION
              </span>
              <h2 data-reveal>
                Small bottle.
                <br />
                Big personality.
              </h2>
              <p data-reveal>
                From the first bright hit of chilli to the last smoky note, every sauce has a story
                to tell. Explore a whole collection of ways to make a meal your own.
              </p>
            </section>
          </>
        )}
        <ProductGrid shop={shop} />
        <section className="pairing-banner">
          <img
            src="/assets/table.webp"
            alt="Golden fries, grilled sandwiches and dips shared around a table"
            loading="lazy"
            data-parallax
          />
          <div data-reveal>
            <span className="eyebrow">BETTER TOGETHER</span>
            <h2>
              Made for the middle
              <br />
              of the table.
            </h2>
            <SiteLink href="/experience" className="round-link">
              Discover the experience <span>↗</span>
            </SiteLink>
          </div>
        </section>
        <Footer />
      </ScrollMotion>
    </main>
  );
}
