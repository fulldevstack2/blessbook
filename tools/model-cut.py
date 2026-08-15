"""
Cuts a shippable violin out of a Meshy scan.

    python3 tools/model-cut.py dragon

Reads `source-models/<id>-original.glb` — the raw export, 35–85 MB, gitignored
and never pushed — and writes `public/model/<id>.glb` at a face count the page
can download and parse in an animation frame. `<id>` is the violin's id in
`src/content/dennis.ts`, which is also its `ModelId` in `src/lib/loadModel.ts`;
one vocabulary for the object, the record and the mesh.

Two things beyond the decimation itself, both learned from the Phoenix:

- Quadric decimation on a scan leaves confetti — a few dozen faces adrift where
  a thin feature collapsed. They read as dirt in the air around the instrument,
  so any component under FLOOR faces is dropped.
- `merge_vertices()` runs before and after. Before, because the export splits
  vertices per-face and the decimation is far worse without it; after, because
  concatenating the kept components re-splits the seams.

Normals are deliberately not exported. Decimation ruins them and `loadModel.ts`
recomputes them at parse time.
"""

import os
import sys

import numpy as np
import trimesh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Enough to hold the scroll work and the f-hole edges at the size it is drawn,
# and about 2.7 MB on the wire. The Phoenix and the Chosen both ship at this.
TARGET = 150_000
# Below this, a component is decimation confetti rather than part of the violin.
FLOOR = 40


def cut(model_id: str) -> None:
    source = os.path.join(ROOT, "source-models", f"{model_id}-original.glb")
    out_path = os.path.join(ROOT, "public", "model", f"{model_id}.glb")
    if not os.path.exists(source):
        sys.exit(f"no scan at {source}")

    scene = trimesh.load(source)
    mesh = (
        trimesh.util.concatenate(list(scene.geometry.values()))
        if isinstance(scene, trimesh.Scene)
        else scene
    )
    print("in:", len(mesh.vertices), "verts", len(mesh.faces), "faces")
    mesh.merge_vertices()

    try:
        small = mesh.simplify_quadric_decimation(face_count=TARGET)
    except TypeError:  # older trimesh takes it positionally
        small = mesh.simplify_quadric_decimation(TARGET)
    small.remove_unreferenced_vertices()

    parts = sorted(small.split(only_watertight=False), key=lambda c: -len(c.faces))
    print("parts after decimation:", [len(c.faces) for c in parts][:8])
    keep = [c for c in parts if len(c.faces) >= FLOOR]
    dropped = sum(len(c.faces) for c in parts if len(c.faces) < FLOOR)
    out = trimesh.util.concatenate(keep) if len(keep) > 1 else keep[0]
    out.merge_vertices()

    print(f"kept {len(keep)} part(s), dropped {dropped} stray faces")
    print("out:", len(out.vertices), "verts", len(out.faces), "faces")
    print("bounds", np.round(out.bounds[0], 3), np.round(out.bounds[1], 3))
    out.export(out_path)
    print(f"{out_path}: {round(os.path.getsize(out_path) / 1e6, 2)} MB")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python3 tools/model-cut.py <phoenix|dragon|chosen>")
    cut(sys.argv[1])
