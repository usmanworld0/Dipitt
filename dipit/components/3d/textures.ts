import * as THREE from 'three';
import type { ProductVariant } from '@/data/products';
export type PackKind = 'glass' | 'small' | 'squeeze' | 'pouch';
export const packKind = (id: string, pack: ProductVariant): PackKind =>
  pack.size === 400 && /bbq|pizza/.test(id)
    ? 'pouch'
    : id === 'sriracha-sauce'
      ? 'squeeze'
      : pack.size === 60
        ? 'small'
        : 'glass';
const crops = {
  glass: [0.416, 0.922],
  small: [0.418, 0.925],
  squeeze: [0.493, 0.914],
  pouch: [0, 1],
};
function sourceCanvas(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(image, 0, 0);
  return { canvas, context };
}
export function imageColor(image: HTMLImageElement, y = 0.3) {
  const { context } = sourceCanvas(image);
  const pixel = context.getImageData(
    Math.floor(image.width * 0.5),
    Math.floor(image.height * y),
    1,
    1,
  ).data;
  return new THREE.Color().setRGB(
    pixel[0] / 255,
    pixel[1] / 255,
    pixel[2] / 255,
    THREE.SRGBColorSpace,
  );
}
// Reproject the photographed cylindrical label into an angular UV map.
// This keeps the real logo, lettering and back label on the actual curved mesh.
export function labelTexture(front: HTMLImageElement, back: HTMLImageElement, kind: PackKind) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  const [top, bottom] = crops[kind];
  const sources = [front, back].map((image) => {
    const { context: source } = sourceCanvas(image);
    const row = source.getImageData(
      0,
      Math.floor((image.height * (top + bottom)) / 2),
      image.width,
      1,
    ).data;
    let left = Math.floor(image.width * 0.5),
      right = left;
    while (left > 0 && row[(left - 1) * 4 + 3] > 100) left--;
    while (right < image.width - 1 && row[(right + 1) * 4 + 3] > 100) right++;
    return { image, left: left + 1, right: right - 1 };
  });
  context.fillStyle = '#a43928';
  context.fillRect(0, 0, 2048, 1024);
  for (let x = 0; x < 2048; x++) {
    const angle = (x / 2048 - 0.5) * Math.PI * 2;
    const isFront = Math.cos(angle) >= 0;
    const source = sources[isFront ? 0 : 1];
    const local = isFront ? angle : angle + (angle < 0 ? Math.PI : -Math.PI);
    const sx =
      (source.left + source.right) / 2 + (source.right - source.left) * 0.498 * Math.sin(local);
    context.drawImage(
      source.image,
      sx,
      source.image.height * top,
      1,
      source.image.height * (bottom - top),
      x,
      0,
      1,
      1024,
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
