import catalogue from './dipitt-catalogue.json';
export type ProductVariant = {
  size: number;
  unit: string;
  price: number;
  image: string;
  backImage: string;
  sourceUrl: string;
  available: boolean;
};
export type Product = {
  id: string;
  name: string;
  short: string;
  category: string;
  color: string;
  accent: string;
  sauce: string;
  cap: string;
  price: number;
  heat: number;
  note: string;
  description: string;
  ingredients: string;
  pairing: string;
  image: string;
  variants: ProductVariant[];
};
const stories: Record<string, [string, string, string, string, string]> = {
  'hot-sauce': [
    'Heat',
    '#cf3e22',
    'A LITTLE FIRE. A LOT OF FLAVOUR.',
    'A bright kick for your everyday favourites. DIPITT Hot Sauce brings chilli warmth to the table, from a quick snack to a generous shared meal.',
    'Eggs, fries, burgers and grilled chicken.',
  ],
  'peri-peri-garlic': [
    'Heat',
    '#d5ac4b',
    'GARLIC MEETS PERI PERI.',
    'A garlicky take on peri peri. Bring a lively, savoury finish to grilled food, or keep it close for the next round of dipping.',
    'Grilled chicken, roast potatoes and wraps.',
  ],
  'smokey-bbq-sauce': [
    'Smoky',
    '#6e372b',
    'SWEET. TANGY. SMOKEY.',
    'A generous helping of barbecue character. Sweet and tangy notes meet a smoky finish, ready for burgers, grills and the last crispy fry.',
    'Burgers, grilled vegetables and barbecue chicken.',
  ],
  'chipotle-sauce': [
    'Smoky',
    '#bd713c',
    'THE DEPTH OF CHIPOTLE.',
    'Real chipotle peppers bring their distinctive character. DIPITT makes this sauce in small batches for a rich, smoky addition to your plate.',
    'Tacos, burritos and sweet potato wedges.',
  ],
  'sriracha-sauce': [
    'Heat',
    '#df3e2a',
    'YOUR EVERYDAY CHILLI FIX.',
    'A bold companion for noodles, snacks and everything in between. DIPITT Sriracha is made in small batches for a lively finishing touch.',
    'Noodles, dumplings, rice bowls and crispy tofu.',
  ],
  'oyster-sauce': [
    'Savoury',
    '#573b2e',
    'A LITTLE UMAMI.',
    'Sweet and salty with the depth of oysters and soy. A kitchen companion for bringing a savoury finish to stir-fries and noodles.',
    'Stir-fries, noodles and glazed vegetables.',
  ],
  'sweet-thai-chilli-sauce': [
    'Sweet & Tangy',
    '#db673c',
    'SWEETNESS WITH A LITTLE SPARK.',
    'Sweet chilli flavour, ready to dip. Bring a bright finish to crispy snacks or spoon it over your favourite rice bowl.',
    'Spring rolls, wontons and crispy chicken.',
  ],
  'khatti-meethi-sauce': [
    'Sweet & Tangy',
    '#8e492f',
    'SWEET MEETS TANGY.',
    'A sweet and tangy companion for snack time. Keep it at the centre of the table for generous dips and a lively finishing touch.',
    'Samosas, pakoras and chaat.',
  ],
  'mint-sauce': [
    'Savoury',
    '#688047',
    'A FRESH DIRECTION.',
    'A minty addition to your dipping collection. Pair with savoury snacks and grilled favourites for a fresh change of pace.',
    'Kebabs, samosas and grilled vegetables.',
  ],
  'mango-habanero-sauce': [
    'Sweet & Tangy',
    '#e4a636',
    'FRUIT WITH FIRE.',
    'Mango and habanero share the spotlight. Fruity character and chilli warmth bring another dimension to your favourite bites.',
    'Grilled chicken, tacos and rice bowls.',
  ],
};
export const products: Product[] = catalogue.map((entry) => {
  const story = stories[entry.id];
  const category = story?.[0] || (/pizza|pasta|worcestershire/.test(entry.id) ? 'Savoury' : 'Heat');
  const color = story?.[1] || (category === 'Savoury' ? '#8e492f' : '#c04b32');
  const variants = [...entry.variants].sort((a, b) => b.size - a.size);
  if (entry.id === 'smokey-bbq-sauce')
    variants.sort((a, b) => (a.size === 300 ? -1 : 1) - (b.size === 300 ? -1 : 1));
  const first = variants[0];
  return {
    ...entry,
    variants,
    category,
    color,
    accent: '#edc481',
    sauce: color,
    cap: '#25231e',
    short: entry.name.replace(/ Sauce$/, '\nSauce').replace('Peri Peri ', 'Peri Peri\n'),
    price: first.price,
    image: first.image,
    heat: 0,
    note: story?.[2] || 'A WORLD OF FLAVOUR. A LITTLE DIPITT.',
    description:
      story?.[3] ||
      'Meet DIPITT ' +
        entry.name +
        '. Add a new flavour to your table, whether you are cooking, dipping or sharing your favourite meal.',
    ingredients:
      'See the back label for the ingredient list, allergens and storage instructions for your selected pack.',
    pairing: story?.[4] || 'Try it with your favourite snacks, grilled food and shared plates.',
  };
});
export const featuredProducts = [
  'hot-sauce',
  'peri-peri-garlic',
  'smokey-bbq-sauce',
  'chipotle-sauce',
  'sriracha-sauce',
].map((id) => products.find((p) => p.id === id)!);
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getVariant = (p: Product, size: number) =>
  p.variants.find((v) => v.size === size) || p.variants[0];
export const modelImage = (pack: ProductVariant) => pack.image.replace('/dipitt/', '/models/');
export const formatPrice = (price: number) => 'PKR ' + price.toLocaleString('en-PK');
export const navigation = [
  ['Home', '/'],
  ['Our Sauces', '/sauces'],
  ['Ingredients', '/ingredients'],
  ['Experience', '/experience'],
  ['Our Story', '/story'],
  ['Contact', '/contact'],
  ['Shop', '/shop'],
];
