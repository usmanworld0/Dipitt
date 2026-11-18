'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Prepare every carousel pack before the intro reveals the interactive scene. */
export function SceneWarmup({ onReady, onError }: { onReady?: () => void; onError?: () => void }) {
  const { gl, scene, camera } = useThree();
  const warmed = useRef(false);
  const frames = useRef(0);
  useEffect(() => {
    let cancelled = false;
    let polling = 0;
    let fence: WebGLSync | null = null;
    const context = gl.getContext();
    warmed.current = false;
    frames.current = 0;
    // Include offscreen packs so the first carousel movement needs no new uploads.
    const withAllPacks = <T,>(run: () => T): T => {
      const flags: [THREE.Object3D, boolean, boolean][] = [];
      scene.traverse((object) => {
        flags.push([object, object.visible, object.frustumCulled]);
        object.visible = true;
        object.frustumCulled = false;
      });
      try {
        return run();
      } finally {
        for (const [object, visible, culled] of flags) {
          object.visible = visible;
          object.frustumCulled = culled;
        }
      }
    };
    async function prepare() {
      try {
        await withAllPacks(() => gl.compileAsync(scene, camera));
        if (cancelled) return;
        withAllPacks(() => {
          scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            for (const material of materials) {
              for (const value of Object.values(material)) {
                if (value instanceof THREE.Texture) gl.initTexture(value);
              }
            }
          });
          gl.render(scene, camera);
        });
        // Wait asynchronously for queued GPU work; never block with gl.finish().
        if ('fenceSync' in context) {
          fence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0);
          context.flush();
          const poll = () => {
            if (cancelled) return;
            const status = fence ? context.clientWaitSync(fence, 0, 0) : context.ALREADY_SIGNALED;
            if (status === context.TIMEOUT_EXPIRED) {
              polling = requestAnimationFrame(poll);
              return;
            }
            if (fence) {
              context.deleteSync(fence);
              fence = null;
            }
            if (status === context.WAIT_FAILED) onError?.();
            else warmed.current = true;
          };
          polling = requestAnimationFrame(poll);
        } else warmed.current = true;
      } catch {
        if (!cancelled) onError?.();
      }
    }
    void prepare();
    return () => {
      cancelled = true;
      cancelAnimationFrame(polling);
      if (fence && 'deleteSync' in context) context.deleteSync(fence);
    };
  }, [gl, scene, camera, onError]);
  useFrame(() => {
    if (warmed.current && ++frames.current === 3) onReady?.();
  });
  return null;
}
