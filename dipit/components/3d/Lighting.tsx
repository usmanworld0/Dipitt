'use client';
import { Environment, Lightformer } from '@react-three/drei';
export function Lighting() {
  return (
    <>
      <ambientLight intensity={1.4} />
      <directionalLight position={[-4, 6, 8]} intensity={3.2} color="#fff7eb" />
      <directionalLight position={[5, 1, 3]} intensity={1.1} />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[-4, 2, 4]}
          scale={[2, 8, 1]}
          rotation={[0, 0.6, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[4, 3, 3]}
          scale={[1, 7, 1]}
          rotation={[0, -0.6, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 5, 0]}
          scale={[8, 3, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Environment>
    </>
  );
}
