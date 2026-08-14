import * as THREE from "three";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * The Chosen violin is a single-piece carbon teardrop. This scene starts as a
 * flat measured drawing and assembles it: points and section rings lift off the
 * sheet into a solid of revolution while an ember scan line runs the length of
 * the body.
 */

const POINT_COUNT = 9000;
const RING_COUNT = 11;
const RING_SEGMENTS = 72;
const BODY_HEIGHT = 1.15;
const BODY_DEPTH = 0.38;

/**
 * Classic teardrop curve: tip at the top, the bulge carried low. The width is
 * set so the body lands near a real violin's proportions, roughly 20cm across
 * to 35cm long.
 */
function bodyProfile(t: number): { halfWidth: number; y: number } {
  const halfWidth = Math.sin(t) * Math.pow(Math.sin(t / 2), 1.7) * 1.0;
  return { halfWidth, y: Math.cos(t) * BODY_HEIGHT };
}

function bodyPoint(t: number, phi: number): THREE.Vector3 {
  const { halfWidth, y } = bodyProfile(t);
  return new THREE.Vector3(
    halfWidth * Math.sin(phi),
    y,
    halfWidth * BODY_DEPTH * Math.cos(phi),
  );
}

const shared = /* glsl */ `
  attribute vec3 aSheet;
  attribute float aSeed;

  uniform float uProgress;
  uniform float uTime;

  varying float vScan;
  varying float vDepth;

  vec3 assemble(vec3 body, vec3 sheet, float seed) {
    // Parts lift off the drawing at slightly different times, so it reads as an
    // assembly rather than a single cross-fade.
    float stagger = 0.34 * seed;
    float lift = smoothstep(0.05 + stagger, 0.62 + stagger, uProgress);
    return mix(sheet, body, lift);
  }
`;

const pointVertex = /* glsl */ `
  ${shared}

  uniform float uSize;
  uniform float uPixelRatio;

  void main() {
    vec3 pos = assemble(position, aSheet, aSeed);

    // The scan runs bottom to top once the body has formed.
    float scanY = mix(-1.4, 1.4, fract(uProgress * 1.6 + uTime * 0.06));
    vScan = 1.0 - smoothstep(0.0, 0.22, abs(pos.y - scanY));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth = clamp(-mv.z / 6.0, 0.0, 1.0);

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (5.2 / -mv.z);
  }
`;

const pointFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uSilver;
  uniform vec3 uEmber;

  varying float vScan;
  varying float vDepth;

  void main() {
    // Square points, not discs: this is a machined object, not a spark.
    vec2 d = abs(gl_PointCoord - 0.5);
    if (max(d.x, d.y) > 0.5) discard;

    vec3 tone = mix(uSilver, uEmber, vScan * 0.85);
    float fade = mix(1.0, 0.42, vDepth);
    gl_FragColor = vec4(tone, fade * (0.5 + 0.5 * vScan));
  }
`;

const ringVertex = /* glsl */ `
  ${shared}

  void main() {
    vec3 pos = assemble(position, aSheet, aSeed);
    float scanY = mix(-1.4, 1.4, fract(uProgress * 1.6 + uTime * 0.06));
    vScan = 1.0 - smoothstep(0.0, 0.18, abs(pos.y - scanY));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth = clamp(-mv.z / 6.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const ringFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uSilver;
  uniform vec3 uEmber;
  uniform float uReveal;

  varying float vScan;
  varying float vDepth;

  void main() {
    vec3 tone = mix(uSilver, uEmber, vScan);
    float fade = mix(0.62, 0.14, vDepth);
    gl_FragColor = vec4(tone, fade * uReveal * (0.4 + 0.6 * vScan));
  }
`;

export function createChosenScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const group = new THREE.Group();
  scene.add(group);

  let rngState = 0x9e3779b9;
  const rand = () => {
    rngState = (rngState * 1664525 + 1013904223) >>> 0;
    return rngState / 0xffffffff;
  };

  const silver = new THREE.Color("#c9cdd2");
  const ember = new THREE.Color("#ff7a3c");

  // ---- point cloud ----
  const positions = new Float32Array(POINT_COUNT * 3);
  const sheet = new Float32Array(POINT_COUNT * 3);
  const seeds = new Float32Array(POINT_COUNT);

  const sheetColumns = 120;
  for (let i = 0; i < POINT_COUNT; i += 1) {
    const t = Math.acos(1 - 2 * rand());
    const phi = rand() * Math.PI * 2;
    const p = bodyPoint(t, phi);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;

    // The drawing: a flat measured grid, wider than the body and dead flat in z.
    const col = i % sheetColumns;
    const row = Math.floor(i / sheetColumns);
    sheet[i * 3] = (col / (sheetColumns - 1) - 0.5) * 3.4;
    sheet[i * 3 + 1] = (row / (POINT_COUNT / sheetColumns - 1) - 0.5) * 2.6;
    sheet[i * 3 + 2] = 0;

    seeds[i] = rand();
  }

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pointGeometry.setAttribute("aSheet", new THREE.BufferAttribute(sheet, 3));
  pointGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const pointMaterial = new THREE.ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 2.1 },
      uPixelRatio: { value: 1 },
      uSilver: { value: silver },
      uEmber: { value: ember },
    },
  });

  group.add(new THREE.Points(pointGeometry, pointMaterial));

  // ---- section rings ----
  const ringVertices = RING_COUNT * RING_SEGMENTS * 2;
  const ringPos = new Float32Array(ringVertices * 3);
  const ringSheet = new Float32Array(ringVertices * 3);
  const ringSeed = new Float32Array(ringVertices);

  let cursor = 0;
  for (let r = 0; r < RING_COUNT; r += 1) {
    const t = ((r + 1) / (RING_COUNT + 1)) * Math.PI;
    const { y } = bodyProfile(t);
    const seed = r / RING_COUNT;

    for (let s = 0; s < RING_SEGMENTS; s += 1) {
      const a = (s / RING_SEGMENTS) * Math.PI * 2;
      const b = ((s + 1) / RING_SEGMENTS) * Math.PI * 2;

      for (const phi of [a, b]) {
        const p = bodyPoint(t, phi);
        ringPos[cursor * 3] = p.x;
        ringPos[cursor * 3 + 1] = p.y;
        ringPos[cursor * 3 + 2] = p.z;

        // On the sheet each ring is a straight measurement line at its own height.
        ringSheet[cursor * 3] = Math.sin(phi) * 1.5;
        ringSheet[cursor * 3 + 1] = y;
        ringSheet[cursor * 3 + 2] = 0;

        ringSeed[cursor] = seed;
        cursor += 1;
      }
    }
  }

  const ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
  ringGeometry.setAttribute("aSheet", new THREE.BufferAttribute(ringSheet, 3));
  ringGeometry.setAttribute("aSeed", new THREE.BufferAttribute(ringSeed, 1));

  const ringMaterial = new THREE.ShaderMaterial({
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uSilver: { value: silver },
      uEmber: { value: ember },
    },
  });

  group.add(new THREE.LineSegments(ringGeometry, ringMaterial));

  return {
    render(progress, elapsed) {
      const time = reducedMotion ? 0 : elapsed;

      pointMaterial.uniforms.uProgress.value = progress;
      pointMaterial.uniforms.uTime.value = time;
      ringMaterial.uniforms.uProgress.value = progress;
      ringMaterial.uniforms.uTime.value = time;
      ringMaterial.uniforms.uReveal.value = Math.min(1, Math.max(0, (progress - 0.3) / 0.4));

      // Flat on to the drawing, turning to three-quarter as the body assembles.
      group.rotation.y = progress * Math.PI * 0.85;
      group.rotation.x = Math.sin(progress * Math.PI) * 0.16;

      camera.position.set(0, 0, 4.6 - progress * 0.9);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    },

    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      pointMaterial.uniforms.uPixelRatio.value = dpr;

      const aspect = width / height;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      // On a wide screen the drawing sits to the right of the copy, the way it
      // would on a spec sheet. On a narrow one it goes back behind the text.
      group.position.x = aspect > 1.15 ? 0.95 : 0;
    },

    dispose() {
      pointGeometry.dispose();
      pointMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    },
  };
}
