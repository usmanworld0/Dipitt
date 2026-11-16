'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { Product, ProductVariant } from '@/data/products';
import { Bottle } from './Bottle';
import { Lighting } from './Lighting';
function TurningBottle({
  product,
  variant,
  angle,
  still,
  onReady,
}: {
  product: Product;
  variant: ProductVariant;
  angle: React.RefObject<number>;
  still: boolean;
  onReady?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const frames = useRef(0);
  useFrame(({ clock }, delta) => {
    if (++frames.current === 2) onReady?.();
    if (!group.current) return;
    group.current.rotation.y = still
      ? angle.current
      : THREE.MathUtils.damp(group.current.rotation.y, angle.current, 7, delta);
    group.current.rotation.z = still ? 0 : Math.sin(clock.elapsedTime * 0.6) * 0.035;
    group.current.position.y = still ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.045;
  });
  return (
    <group ref={group} rotation={[0, angle.current, 0]}>
      <Bottle product={product} variant={variant} />
    </group>
  );
}
export default function ProductScene({
  product,
  variant = product.variants[0],
  angle,
  still = false,
  exportable = false,
  onReady,
}: {
  product: Product;
  variant?: ProductVariant;
  angle: React.RefObject<number>;
  still?: boolean;
  exportable?: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={exportable ? 'demand' : 'always'}
      role="img"
      aria-label={`3D DIPITT ${product.name}, ${variant.size}${variant.unit}`}
      camera={{ position: [0, 0, 10], fov: 27 }}
      dpr={exportable ? 2 : [1, 1.5]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: exportable }}
    >
      <Lighting />
      <TurningBottle
        key={variant.image}
        product={product}
        variant={variant}
        angle={angle}
        still={still}
        onReady={onReady}
      />
    </Canvas>
  );
}
