'use client';
import { useTexture } from '@react-three/drei';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Product, ProductVariant } from '@/data/products';
import { imageColor, labelTexture, packKind } from './textures';

function Cap({
  radius,
  y,
  height,
  color,
}: {
  radius: number;
  y: number;
  height: number;
  color: string;
}) {
  const ribs = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < 64; i++) {
      const angle = (i * Math.PI) / 32;
      matrix.makeTranslation(
        Math.sin(angle) * (radius + 0.003),
        0,
        Math.cos(angle) * (radius + 0.003),
      );
      ribs.current!.setMatrixAt(i, matrix);
    }
    ribs.current!.instanceMatrix.needsUpdate = true;
  }, [radius]);
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 64]} />
        <meshPhysicalMaterial color={color} roughness={0.31} metalness={0.22} clearcoat={0.5} />
      </mesh>
      <instancedMesh ref={ribs} args={[undefined, undefined, 64]}>
        <cylinderGeometry args={[0.006, 0.006, height * 0.85, 4]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.15} />
      </instancedMesh>
      <mesh position={[0, -height / 2 - 0.045, 0]}>
        <cylinderGeometry args={[radius * 0.98, radius * 0.98, 0.06, 64]} />
        <meshStandardMaterial color={color} roughness={0.38} />
      </mesh>
    </group>
  );
}

function Pouch({
  front,
  back,
  color,
}: {
  front: THREE.Texture;
  back: THREE.Texture;
  color: THREE.Color;
}) {
  const { shape, face, reverse } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.98, -1.9);
    shape.quadraticCurveTo(-1.1, -1.9, -1.1, -1.7);
    shape.lineTo(-1.19, 0.7);
    shape.lineTo(-0.47, 1.87);
    shape.quadraticCurveTo(-0.4, 1.98, -0.25, 1.98);
    shape.lineTo(1.05, 1.98);
    shape.quadraticCurveTo(1.18, 1.98, 1.16, 1.8);
    shape.lineTo(0.94, -1.75);
    shape.quadraticCurveTo(0.93, -1.95, 0.7, -1.95);
    shape.closePath();
    const face = new THREE.ShapeGeometry(shape, 24);
    const position = face.attributes.position;
    const uv = face.attributes.uv;
    for (let i = 0; i < position.count; i++)
      uv.setXY(i, (position.getX(i) + 1.25) / 2.5, (position.getY(i) + 2) / 4);
    const reverse = face.clone();
    const reverseUv = reverse.attributes.uv;
    for (let i = 0; i < reverseUv.count; i++) reverseUv.setX(i, 1 - reverseUv.getX(i));
    return { shape, face, reverse };
  }, []);
  useEffect(
    () => () => {
      face.dispose();
      reverse.dispose();
    },
    [face, reverse],
  );
  return (
    <group>
      <mesh position={[0, 0, -0.23]}>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.46,
              bevelEnabled: true,
              bevelSegments: 5,
              steps: 1,
              bevelSize: 0.075,
              bevelThickness: 0.075,
              curveSegments: 24,
            },
          ]}
        />
        <meshPhysicalMaterial color={color} roughness={0.48} clearcoat={0.35} />
      </mesh>
      <mesh geometry={face} position={[0, 0, 0.308]}>
        <meshStandardMaterial map={front} roughness={0.65} transparent alphaTest={0.03} />
      </mesh>
      <mesh geometry={reverse} position={[0, 0, -0.308]}>
        <meshStandardMaterial
          map={back}
          roughness={0.65}
          transparent
          alphaTest={0.03}
          side={THREE.BackSide}
        />
      </mesh>
      <group position={[-0.9, 1.25, 0]} rotation={[0, 0, 0.65]}>
        <Cap radius={0.22} y={0.15} height={0.35} color="#eee9d9" />
      </group>
    </group>
  );
}

export function Bottle({
  product,
  variant = product.variants[0],
  rotation = 0,
}: {
  product: Product;
  variant?: ProductVariant;
  rotation?: number;
}) {
  const [front, back] = useTexture([variant.image, variant.backImage]);
  front.colorSpace = back.colorSpace = THREE.SRGBColorSpace;
  const kind = packKind(product.id, variant);
  const texture = useMemo(
    () =>
      kind === 'pouch'
        ? null
        : labelTexture(front.image as HTMLImageElement, back.image as HTMLImageElement, kind),
    [front, back, kind],
  );
  const sauce = useMemo(
    () => imageColor(front.image as HTMLImageElement, kind === 'pouch' ? 0.07 : 0.3),
    [front, kind],
  );
  useEffect(() => () => texture?.dispose(), [texture]);
  const small = kind === 'small',
    squeeze = kind === 'squeeze';
  const radius = small ? 0.4 : squeeze ? 0.64 : 0.59;
  const { geometry, filled } = useMemo(() => {
    const profile = squeeze
      ? [
          [0.77, -1.98],
          [0.92, -1.92],
          [1, -1.75],
          [1, 0.05],
          [0.94, 0.35],
          [0.67, 0.83],
          [0.36, 1.12],
        ]
      : [
          [0.82, -1.98],
          [0.96, -1.94],
          [1, -1.85],
          [1, 0.53],
          [0.98, 0.72],
          [0.9, 0.9],
          [0.7, 1.12],
          [small ? 0.4 : 0.5, small ? 1.45 : 1.3],
          [small ? 0.39 : 0.49, 1.73],
        ];
    const points = profile.map(([x, y]) => new THREE.Vector2(x * radius, y));
    const fillPoints = squeeze
      ? points
      : [
          ...points.filter((point) => point.y < 1.29),
          new THREE.Vector2(radius * (small ? 0.4 : 0.5), 1.29),
        ];
    return {
      geometry: new THREE.LatheGeometry(points, 80),
      filled: new THREE.LatheGeometry(fillPoints, 80),
    };
  }, [radius, small, squeeze]);
  useEffect(
    () => () => {
      geometry.dispose();
      filled.dispose();
    },
    [geometry, filled],
  );
  if (kind === 'pouch')
    return (
      <group rotation={[0, rotation, 0]}>
        <Pouch front={front} back={back} color={sauce} />
      </group>
    );
  const labelHeight = squeeze ? 1.684 : 2.024;
  const labelY = squeeze ? -0.814 : -0.676;
  return (
    <group rotation={[0, rotation, 0]}>
      <mesh geometry={filled}>
        <meshPhysicalMaterial
          color={sauce}
          roughness={0.27}
          metalness={0.01}
          clearcoat={0.85}
          clearcoatRoughness={0.16}
        />
      </mesh>
      <mesh geometry={geometry} scale={[1.018, 1.005, 1.018]}>
        <meshPhysicalMaterial
          color="#f4e4c8"
          transparent
          opacity={0.22}
          roughness={0.08}
          metalness={0.12}
          clearcoat={1}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, labelY, 0]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry
          args={[
            radius + 0.022,
            radius + 0.022,
            labelHeight,
            128,
            1,
            true,
          ]}
        />
        <meshStandardMaterial map={texture} roughness={0.62} metalness={0.01} />
      </mesh>
      <mesh position={[0, -1.93, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.85, 0.037, 12, 80]} />
        <meshPhysicalMaterial
          color="#e0c9a0"
          transparent
          opacity={0.55}
          metalness={0.2}
          roughness={0.13}
        />
      </mesh>
      {squeeze ? (
        <group>
          <Cap radius={0.24} y={1.16} height={0.28} color="#b82918" />
          <Cap radius={0.135} y={1.59} height={0.53} color="#c4311b" />
          <mesh position={[0, 1.91, 0]}>
            <coneGeometry args={[0.135, 0.18, 48]} />
            <meshPhysicalMaterial color="#be2d19" roughness={0.35} clearcoat={0.4} />
          </mesh>
        </group>
      ) : (
        <Cap radius={small ? 0.24 : 0.31} y={1.86} height={0.28} color="#20201c" />
      )}
    </group>
  );
}
