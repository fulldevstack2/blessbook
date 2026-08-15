import * as THREE from "three";
import { cue, instrument, TURNED } from "../../lib/loadModel";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * The same instrument, drawn in ink.
 *
 * Phoenix shows the object as gold because gold is what that concept is made of.
 * This one has no metal in it anywhere, so the violin arrives as a brush would
 * arrive at it: a dark contour where the form turns away from you, a flat wash
 * across the faces, and bare paper where the light falls. It is the woodblock
 * reading of the same geometry rather than a recolour of the same render.
 *
 * The canvas is multiplied into the page, so white is nothing and the ink sinks
 * into the paper the way every other photograph on this concept does.
 */

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uInk;
  uniform vec3 uJade;
  uniform vec3 uPaper;
  uniform float uTime;
  uniform float uFade;

  varying vec3 vNormal;
  varying vec3 vView;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    vec3 light = normalize(vec3(-0.4, 0.8, 0.55));

    /* Tone, in steps. A brush does not shade continuously: it lays a wash, and
       leaves the paper where the light is. Three levels is what a woodblock of
       this gets, and more would only make it a render again. */
    float lit = dot(n, light) * 0.5 + 0.5;
    float wash = smoothstep(0.28, 0.32, lit) * 0.30
      + smoothstep(0.52, 0.57, lit) * 0.28
      + smoothstep(0.76, 0.82, lit) * 0.24;
    float tone = 1.0 - wash;

    // The contour: where the form turns away, the brush presses.
    float turn = 1.0 - abs(dot(n, v));
    float contour = smoothstep(0.55, 0.98, turn);

    float ink = clamp(tone * 0.86 + contour * 1.15, 0.0, 1.0);

    // Fibre, so it is sitting on paper rather than printed on glass.
    ink *= 0.9 + hash(gl_FragCoord.xy * 0.7) * 0.2;

    // Thin ink goes green before it goes black, the way a wash separates.
    vec3 colour = mix(uPaper, mix(uJade, uInk, smoothstep(0.2, 0.8, ink)), ink);
    // Back to bare paper as one instrument hands over to the next.
    gl_FragColor = vec4(mix(uPaper, colour, uFade), 1.0);
  }
`;

export function createInstrumentScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  // White, because the canvas is multiplied into the paper behind it.
  renderer.setClearColor(0xff_ff_ff, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(0, 0, 2.5);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uInk: { value: new THREE.Color("#1b232c") },
      uJade: { value: new THREE.Color("#5d7d6c") },
      uPaper: { value: new THREE.Color("#ffffff") },
      uTime: { value: 0 },
      uFade: { value: 1 },
    },
  });

  const pivot = new THREE.Group();
  scene.add(pivot);

  /* All three instruments live in the scene and one is visible at a time. The
     order they are turned in, and the arithmetic that decides which, are in
     `loadModel.ts` — the plate beside this canvas has to name whichever one is
     on screen, so both sides read the scroll off the same function. */
  const meshes: (THREE.Mesh | null)[] = TURNED.map(() => null);
  let stopped = false;

  TURNED.forEach((id, index) => {
    void instrument(id).then((geometry) => {
      if (!geometry || stopped) return;
      const built = new THREE.Mesh(geometry, material);
      built.visible = index === 0;
      meshes[index] = built;
      pivot.add(built);
    });
  });

  return {
    render(progress, elapsed) {
      /* Turned the other way from Phoenix's, because a hand scroll reads right
         to left and the object should come round with it. Each one is drawn,
         wiped back to bare paper, and the next is drawn in its place. */
      const { index, local, fade } = cue(progress);
      meshes.forEach((entry, at) => {
        if (entry) entry.visible = at === index;
      });
      material.uniforms.uFade.value = fade;

      pivot.rotation.y = 1.05 - local * 2.4;
      pivot.rotation.z = 0.14 - Math.sin(local * Math.PI) * 0.12;
      pivot.rotation.x = -0.06 + local * 0.2;
      if (!reducedMotion) pivot.rotation.y += Math.sin(elapsed * 0.19) * 0.025;
      material.uniforms.uTime.value = elapsed;
      renderer.render(scene, camera);
    },
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      /* Closer than it used to be. The mesh is normalised on its longest axis,
         and with the display stand cut away that axis is the wingspan, so the
         object is now wide and shallow and was sitting in a lot of black. */
      camera.position.z = camera.aspect < 1 ? 3.1 : 2.1;
      camera.updateProjectionMatrix();
    },
    dispose() {
      stopped = true;
      meshes.forEach((entry) => {
        if (entry) pivot.remove(entry);
      });
      material.dispose();
      renderer.dispose();
    },
  };
}
