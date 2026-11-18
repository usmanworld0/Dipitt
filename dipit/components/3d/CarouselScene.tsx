'use client';
import type { BottleOrigin } from '@/components/layout/SiteShell';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { featuredProducts as products } from '@/data/products';
import { Bottle } from './Bottle';
import { Lighting } from './Lighting';
import { SceneWarmup } from './SceneWarmup';
type Motion = {
  current: number;
  target: number;
  velocity: number;
  dragging: boolean;
  pointerX: number;
  pointerY: number;
};
function CarouselBottle({
  index,
  motion,
  onHover,
  onSelect,
  reduced,
}: {
  index: number;
  motion: React.RefObject<Motion>;
  onHover: (i: number | null) => void;
  onSelect: (i: number, origin?: BottleOrigin) => void;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null),
    bottle = useRef<THREE.Group>(null),
    hover = useRef(false),
    spin = useRef(0);
  const { viewport, camera, size } = useThree();
  useFrame(({ clock }, delta) => {
    if (!group.current || !bottle.current) return;
    let distance = ((((index - motion.current.current + 7.5) % 5) + 5) % 5) - 2.5;
    distance = THREE.MathUtils.clamp(distance, -2.5, 2.5);
    const mobile = viewport.width < 6;
    const step = mobile ? viewport.width * 0.52 : viewport.width * 0.295;
    const scale = mobile ? 0.69 : 1.12;
    const depth = 1 - Math.min(Math.abs(distance) * 0.17, 0.4);
    group.current.position.set(
      distance * step,
      -0.08 - distance * 0.42 - Math.pow(distance, 2) * 0.12 + (mobile ? 0.35 : 0),
      -Math.abs(distance) * 0.4,
    );
    group.current.rotation.z = distance * 0.15 - 0.09;
    group.current.scale.setScalar(scale * depth);
    group.current.visible = Math.abs(distance) < 2.25;
    bottle.current.position.y = THREE.MathUtils.damp(
      bottle.current.position.y,
      hover.current ? 0.15 : 0,
      7,
      delta,
    );
    if (hover.current && !reduced) spin.current += Math.min(delta, 0.05) * 0.9;
    else spin.current = THREE.MathUtils.damp(spin.current, 0, 4, delta);
    const rotation = reduced
      ? -0.15
      : spin.current +
        Math.sin(clock.elapsedTime * 0.24 + index) * 0.1 +
        motion.current.pointerX * 0.07 -
        distance * 0.16;
    bottle.current.rotation.y = THREE.MathUtils.damp(bottle.current.rotation.y, rotation, 4, delta);
  });
  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover.current = true;
        onHover(index);
      }}
      onPointerOut={() => {
        hover.current = false;
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (Math.abs(motion.current.velocity) < 0.035 && !motion.current.dragging) {
          const pos = group.current!.position.clone().project(camera);
          onSelect(index, {
            x: (pos.x * 0.5 + 0.5) * size.width,
            y: (-0.5 * pos.y + 0.5) * size.height,
            height: ((4 * group.current!.scale.y) / viewport.height) * size.height,
            rotation: (-group.current!.rotation.z * 180) / Math.PI,
          });
        }
      }}
    >
      <group ref={bottle}>
        <Bottle product={products[index]} />
      </group>
    </group>
  );
}
function MotionDriver({ motion, reduced }: { motion: React.RefObject<Motion>; reduced: boolean }) {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    motion.current.current = THREE.MathUtils.damp(
      motion.current.current,
      motion.current.target,
      reduced ? 35 : 5.5,
      dt,
    );
    motion.current.velocity = motion.current.target - motion.current.current;
  });
  return null;
}
export default function CarouselScene({
  motion,
  onHover,
  onSelect,
  reduced,
  onReady,
  onError,
}: {
  motion: React.RefObject<Motion>;
  onHover: (i: number | null) => void;
  onSelect: (i: number, origin?: BottleOrigin) => void;
  reduced: boolean;
  onReady?: () => void;
  onError?: () => void;
}) {
  return (
    <Canvas
      className="carousel-canvas"
      camera={{ position: [0, 0, 16], fov: 28 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <Lighting />
      <MotionDriver motion={motion} reduced={reduced} />
      {products.map((p, i) => (
        <CarouselBottle
          key={p.id}
          index={i}
          motion={motion}
          onHover={onHover}
          onSelect={onSelect}
          reduced={reduced}
        />
      ))}
      <SceneWarmup onReady={onReady} onError={onError} />
    </Canvas>
  );
}
