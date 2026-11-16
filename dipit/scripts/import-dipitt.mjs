import fs from 'node:fs/promises';
import sharp from 'sharp';

// Crop the largest connected opaque shape: the product, excluding floating feature badges.
async function cropProduct(buffer, output) {
  const meta = await sharp(buffer).metadata();
  const { data, info } = await sharp(buffer)
    .resize(375, 375, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (!meta.hasAlpha) {
    await sharp(buffer).resize(900, 900, { fit: 'inside' }).webp({ quality: 88 }).toFile(output);
    return;
  }
  const seen = new Uint8Array(info.width * info.height);
  let best = { count: 0, x: 0, y: 0, right: 374, bottom: 374 };
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || data[start * 4 + 3] < 24) continue;
    const queue = [start];
    seen[start] = 1;
    let count = 0,
      x = 375,
      y = 375,
      right = 0,
      bottom = 0;
    for (let q = 0; q < queue.length; q++) {
      const pos = queue[q],
        px = pos % 375,
        py = Math.floor(pos / 375);
      count++;
      x = Math.min(x, px);
      y = Math.min(y, py);
      right = Math.max(right, px);
      bottom = Math.max(bottom, py);
      for (const next of [px > 0 ? pos - 1 : -1, px < 374 ? pos + 1 : -1, pos - 375, pos + 375]) {
        if (next < 0 || next >= seen.length || seen[next] || data[next * 4 + 3] < 24) continue;
        seen[next] = 1;
        queue.push(next);
      }
    }
    if (count > best.count) best = { count, x, y, right, bottom };
  }
  const left = Math.max(0, Math.floor((best.x * meta.width) / 375) - 6);
  const top = Math.max(0, Math.floor((best.y * meta.height) / 375) - 6);
  const right = Math.min(meta.width, Math.ceil(((best.right + 1) * meta.width) / 375) + 6);
  const bottom = Math.min(meta.height, Math.ceil(((best.bottom + 1) * meta.height) / 375) + 6);
  await sharp(buffer)
    .extract({ left, top, width: right - left, height: bottom - top })
    .resize({ height: 1100 })
    .webp({ quality: 90 })
    .toFile(output);
}

const source = JSON.parse(await fs.readFile('docs/dipitt-products.json', 'utf8')).products;
await fs.mkdir('public/assets/dipitt', { recursive: true });
const catalogue = [];
for (const item of source) {
  const match = item.title.match(/\s+(\d+)\s*(g|ml)$/i);
  if (!match) throw new Error('Unrecognized pack size: ' + item.title);
  const name = item.title.slice(0, match.index).trim();
  const id = name
    .toLowerCase()
    .replace(/ & /g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-$/, '');
  const base = '/assets/dipitt/' + item.handle;
  const front = item.images[0].src;
  const back = item.images.find((i) => /back/i.test(i.src))?.src;
  for (const [side, url] of [
    ['front', front],
    ['back', back],
  ]) {
    if (!url) continue;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.status + ' ' + url);
    await cropProduct(
      Buffer.from(await response.arrayBuffer()),
      'public' + base + '-' + side + '.webp',
    );
  }
  const variant = {
    size: Number(match[1]),
    unit: match[2].toLowerCase(),
    price: Number(item.variants[0].price),
    image: base + '-front.webp',
    backImage: back ? base + '-back.webp' : base + '-front.webp',
    sourceUrl: 'https://www.dipitt.com/products/' + item.handle,
    available: item.variants.some((v) => v.available),
  };
  const group = catalogue.find((p) => p.id === id);
  if (group) group.variants.push(variant);
  else catalogue.push({ id, name, variants: [variant] });
  console.log('Imported', item.title);
}
for (const [name, url] of [
  [
    'logo',
    'https://www.dipitt.com/cdn/shop/files/Dipitt_logo_3x_4442abd6-0c77-4e91-8555-6355f15d2593.png?v=1775719336&width=600',
  ],
  [
    'logo-white',
    'https://www.dipitt.com/cdn/shop/files/dipitt-logo-white-1.png?v=1770981709&width=400',
  ],
]) {
  const response = await fetch(url);
  await sharp(Buffer.from(await response.arrayBuffer()))
    .trim()
    .webp({ quality: 95 })
    .toFile('public/assets/dipitt/' + name + '.webp');
}
await fs.writeFile('data/dipitt-catalogue.json', JSON.stringify(catalogue, null, 2) + '\n');
await fs.writeFile(
  'docs/dipitt-image-sources.json',
  JSON.stringify(
    {
      collection: 'https://www.dipitt.com/collections/sauces',
      retrieved: '2026-11-16',
      products: source.map((p) => ({
        title: p.title,
        handle: p.handle,
        images: p.images.map((i) => i.src),
      })),
    },
    null,
    2,
  ),
);
console.log(catalogue.length + ' sauce families, ' + source.length + ' packs.');
