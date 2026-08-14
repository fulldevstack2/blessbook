import * as THREE from "three";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * A gilded plume that comes apart and reassembles as a single vibrating string:
 * feather → gold dust → string. Each vertex carries all three of its positions
 * and the morph happens in the vertex shader, so scrolling costs one uniform
 * write rather than a few thousand CPU writes per frame.
 */

const SHAFT_SAMPLES = 130;
const BARB_SEGMENTS = 8;
const SHAFT_HALF = 2.1;

const vertexShader = /* glsl */ `
  attribute vec3 aDust;
  attribute vec3 aString;
  attribute float aSeed;
  attribute float aShade;

  uniform float uProgress;
  uniform float uTime;

  varying float vShade;
  varying float vFade;

  void main() {
    float toDust = smoothstep(0.06, 0.46, uProgress);
    float toString = smoothstep(0.52, 0.94, uProgress);

    vec3 drift = vec3(
      sin(uTime * 0.55 + aSeed * 6.283),
      cos(uTime * 0.43 + aSeed * 4.117),
      sin(uTime * 0.37 + aSeed * 2.719)
    ) * 0.14;

    vec3 pos = mix(position, aDust + drift, toDust);

    // The string is taut: a standing wave with nodes at both ends.
    vec3 taut = aString;
    float node = 1.0 - abs(taut.y) / ${SHAFT_HALF.toFixed(2)};
    taut.x += sin(uTime * 3.2 + taut.y * 3.4) * 0.075 * node;
    taut.z += cos(uTime * 2.6 + taut.y * 2.8) * 0.03 * node;

    pos = mix(pos, taut, toString);

    vShade = aShade;
    // Dust reads brighter in the middle of the transition, then settles.
    vFade = 0.42 + 0.58 * (1.0 - abs(uProgress - 0.5) * 1.1);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3 uDeep;
  uniform vec3 uBright;

  varying float vShade;
  varying float vFade;

  void main() {
    vec3 gold = mix(uDeep, uBright, vShade);
    gl_FragColor = vec4(gold, vFade * (0.28 + 0.72 * vShade));
  }
`;

export function createPhoenixScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 5.4);

  const group = new THREE.Group();
  scene.add(group);

  const pairs = SHAFT_SAMPLES * 2 * BARB_SEGMENTS;
  const vertexCount = pairs * 2;

  const position = new Float32Array(vertexCount * 3);
  const dust = new Float32Array(vertexCount * 3);
  const string = new Float32Array(vertexCount * 3);
  const seed = new Float32Array(vertexCount);
  const shade = new Float32Array(vertexCount);

  // Deterministic pseudo-random so the plume is identical on every load.
  let rngState = 0x2f6e2b1;
  const rand = () => {
    rngState = (rngState * 1664525 + 1013904223) >>> 0;
    return rngState / 0xffffffff;
  };

  const featherPoint = (t: number, side: number, u: number) => {
    const y = -SHAFT_HALF + t * SHAFT_HALF * 2;
    // Envelope: widest at the middle, tapering to a point at each end.
    const envelope = Math.pow(Math.sin(Math.PI * t), 0.72);
    const length = 1.08 * envelope;
    const wobble = 1 + Math.sin(t * 41.3) * 0.06;

    return {
      x: side * length * u * wobble + Math.sin(t * Math.PI) * 0.1,
      // Barbs sweep toward the tip rather than sitting square to the shaft.
      y: y + length * 0.5 * u * u,
      z: Math.sin(u * Math.PI) * 0.2 * side + Math.sin(t * 17.7) * 0.05,
    };
  };

  // Tips catch the light; the shaft stays deep.
  const envelopeShade = (t: number) => 0.15 + Math.sin(Math.PI * t) * 0.35;

  let cursor = 0;
  const write = (
    target: Float32Array,
    index: number,
    x: number,
    y: number,
    z: number,
  ) => {
    target[index * 3] = x;
    target[index * 3 + 1] = y;
    target[index * 3 + 2] = z;
  };

  for (let s = 0; s < SHAFT_SAMPLES; s += 1) {
    const t = (s + 0.5) / SHAFT_SAMPLES;

    for (const side of [-1, 1]) {
      // One swirl target per barb so it travels as a clump, not as loose points.
      const theta = rand() * Math.PI * 2;
      const radius = 1.15 + rand() * 1.5;
      const dustY = (rand() - 0.5) * 4.4;
      const spiral = theta + dustY * 0.75;
      const barbSeed = rand();

      // The string keeps the barb's height ordering so the collapse reads as a gather.
      const stringY = -SHAFT_HALF + t * SHAFT_HALF * 2 + (rand() - 0.5) * 0.08;

      for (let k = 0; k < BARB_SEGMENTS; k += 1) {
        const u0 = k / BARB_SEGMENTS;
        const u1 = (k + 1) / BARB_SEGMENTS;

        for (const u of [u0, u1]) {
          const p = featherPoint(t, side, u);
          write(position, cursor, p.x, p.y, p.z);

          const r = radius + u * 0.5;
          write(
            dust,
            cursor,
            Math.cos(spiral) * r,
            dustY + u * 0.3,
            Math.sin(spiral) * r,
          );

          write(string, cursor, (rand() - 0.5) * 0.03, stringY, (rand() - 0.5) * 0.03);

          seed[cursor] = barbSeed;
          shade[cursor] = Math.min(1, u * 0.75 + envelopeShade(t));
          cursor += 1;
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aDust", new THREE.BufferAttribute(dust, 3));
  geometry.setAttribute("aString", new THREE.BufferAttribute(string, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geometry.setAttribute("aShade", new THREE.BufferAttribute(shade, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#6d4a12") },
      uBright: { value: new THREE.Color("#f2cd7a") },
    },
  });

  const plume = new THREE.LineSegments(geometry, material);
  group.add(plume);

  return {
    render(progress, elapsed) {
      const time = reducedMotion ? 0 : elapsed;
      material.uniforms.uProgress.value = progress;
      material.uniforms.uTime.value = time;

      group.rotation.y = progress * Math.PI * 1.35 + (reducedMotion ? 0 : time * 0.05);
      group.rotation.z = Math.sin(progress * Math.PI) * 0.12;
      group.position.y = -progress * 0.35;

      camera.position.z = 5.4 - progress * 1.9;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    },

    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },

    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
