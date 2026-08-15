import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * The instruments, fetched once each and shared, and the order the turned
 * section shows them in.
 *
 * Machinery, not design. Three concepts each put the same three violins on the
 * page and each lights and finishes them in its own materials, but there is one
 * mesh per instrument and no reason to download or parse it three times. This
 * holds the parsed geometry per id; a scene supplies its own material, which is
 * exactly the split we want, because the material is the part each concept
 * replaces.
 *
 * `TURNED` and `cue` are here for the same reason. The sequence has to be known
 * in two places — the scene, which swaps meshes, and the plate beside it, which
 * has to name the instrument on screen — and a section that turns the Dragon
 * while its plate reads "The Phoenix" is worse than no plate. One list, one
 * function, and both sides read the scroll the same way.
 *
 * It is deliberately not a React hook. Scenes live outside React's world, in an
 * animation loop, and the only thing they need is a promise.
 */

/** The three violins, keyed as the record in `content/dennis.ts` keys them. */
export type ModelId = "phoenix" | "dragon" | "chosen";

const FILES: Record<ModelId, string> = {
  phoenix: "model/phoenix.glb",
  dragon: "model/dragon.glb",
  chosen: "model/chosen.glb",
};

/** The order the section turns them in, which is the order they were built. */
export const TURNED: readonly ModelId[] = ["phoenix", "dragon", "chosen"];

/**
 * How much of one instrument's turn is spent coming up out of the ground colour
 * and going back down into it, as a fraction of that turn. Being a fraction and
 * not a slice of the whole scroll, it holds its feel whatever `TURNED` grows to.
 */
const FADE = 0.16;

export interface Cue {
  /** Which entry of `TURNED` the scroll is on. */
  readonly index: number;
  /** 0 → 1 through that instrument's own turn, so each gets a whole one. */
  readonly local: number;
  /** 1 in the clear, 0 at a handover. Each concept dips in its own colour. */
  readonly fade: number;
}

/**
 * Where the scroll is in the sequence. `index` is deliberately the same
 * arithmetic `ScrollStage` uses for its cut index, so a section that passes
 * `cuts={TURNED.length}` gets a plate that changes on exactly the frame the
 * mesh does.
 */
export function cue(progress: number): Cue {
  const count = TURNED.length;
  const index = Math.min(count - 1, Math.floor(progress * count));
  const local = Math.min(1, Math.max(0, progress * count - index));

  /* Out at each handover and back up on the other side, but never at the two
     outer ends: the first instrument is already there when the section opens,
     and the last one should not leave before it does. */
  let fade = 1;
  if (index > 0) fade = Math.min(fade, local / FADE);
  if (index < count - 1) fade = Math.min(fade, (1 - local) / FADE);

  return { index, local, fade: Math.min(1, Math.max(0, fade)) };
}

const pending = new Map<ModelId, Promise<THREE.BufferGeometry | null>>();

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
    /* Normalised on the longest axis, which for all three instruments is the
       length. They come out the same length as each other, which is true of the
       objects and is the comparison the section is making: the Chosen is the
       thin one. */
    const scale = 1 / Math.max(size.x, size.y, size.z);
    geometry.scale(scale, scale, scale);
  }
  // Meshy exports no normals worth having after decimation.
  geometry.computeVertexNormals();
  return geometry;
}

export function instrument(id: ModelId): Promise<THREE.BufferGeometry | null> {
  const cached = pending.get(id);
  if (cached) return cached;

  const load = new Promise<THREE.BufferGeometry | null>((resolve) => {
    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}${FILES[id]}`,
      (gltf) => resolve(extract(gltf.scene)),
      undefined,
      () => resolve(null),
    );
  });

  pending.set(id, load);
  return load;
}
