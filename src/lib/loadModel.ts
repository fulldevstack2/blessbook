import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * The instrument, fetched once and shared.
 *
 * Machinery, not design. Three concepts each put the Phoenix violin on the page
 * and each lights and finishes it in its own materials, but there is only one
 * mesh and there is no reason to download or parse it three times. This holds
 * the parsed geometry and hands out clones; a clone shares the geometry buffers
 * and only copies the material, which is exactly the split we want, because the
 * material is the part each concept replaces.
 *
 * It is deliberately not a React hook. Scenes live outside React's world, in an
 * animation loop, and the only thing they need is a promise.
 */

let pending: Promise<THREE.BufferGeometry | null> | null = null;

/** The single mesh inside the file, centred and scaled to fit a unit box. */
function extract(scene: THREE.Object3D): THREE.BufferGeometry | null {
  let found: THREE.BufferGeometry | null = null;
  scene.traverse((child) => {
    if (found) return;
    if ((child as THREE.Mesh).isMesh) found = (child as THREE.Mesh).geometry;
  });
  if (!found) return null;

  const geometry = found as THREE.BufferGeometry;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box) {
    const centre = box.getCenter(new THREE.Vector3());
    geometry.translate(-centre.x, -centre.y, -centre.z);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1 / Math.max(size.x, size.y, size.z);
    geometry.scale(scale, scale, scale);
  }
  // Meshy exports no normals worth having after decimation.
  geometry.computeVertexNormals();
  return geometry;
}

export function instrument(): Promise<THREE.BufferGeometry | null> {
  if (pending) return pending;

  pending = new Promise((resolve) => {
    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}model/phoenix.glb`,
      (gltf) => resolve(extract(gltf.scene)),
      undefined,
      () => resolve(null),
    );
  });

  return pending;
}
