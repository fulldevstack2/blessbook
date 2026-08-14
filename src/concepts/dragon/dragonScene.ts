import * as THREE from "three";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * Ink dropped into water. A domain-warped noise field blooms outward as you
 * scroll, then draws itself back in and settles into the two f-holes of a
 * violin. Drawn entirely in a fragment shader over a full-screen quad, so it
 * composites straight onto the paper background.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uProgress;
  uniform float uTime;
  uniform float uLevel;
  uniform float uAspect;
  uniform vec3 uInk;
  uniform vec3 uJade;
  uniform vec3 uCinnabar;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      total += noise(p) * amp;
      p *= 2.03;
      amp *= 0.5;
    }
    return total;
  }

  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  vec2 bez3(vec2 a, vec2 b, vec2 c, vec2 d, float t) {
    vec2 ab = mix(a, b, t);
    vec2 bc = mix(b, c, t);
    vec2 cd = mix(c, d, t);
    return mix(mix(ab, bc, t), mix(bc, cd, t), t);
  }

  // One f-hole: an S-curved slit, waisted in the middle, with a bulb at each end
  // flared to opposite sides — the shape a luthier actually cuts.
  float fhole(vec2 p) {
    vec2 a = vec2(0.15, -0.60);
    vec2 b = vec2(-0.16, -0.23);
    vec2 c = vec2(0.16, 0.23);
    vec2 d = vec2(-0.15, 0.60);

    float dist = 1e9;
    vec2 prev = a;
    for (int i = 1; i <= 24; i++) {
      vec2 cur = bez3(a, b, c, d, float(i) / 24.0);
      dist = min(dist, sdSegment(p, prev, cur));
      prev = cur;
    }

    float waist = clamp(1.0 - abs(p.y) / 0.62, 0.0, 1.0);
    float slit = dist - (0.017 + 0.019 * waist);

    float upper = length(p - vec2(0.175, -0.625)) - 0.048;
    float lower = length(p - vec2(-0.175, 0.625)) - 0.058;

    // The nicks either side of the waist, sitting just inside the slit edge.
    float nickL = length(p - vec2(-0.056, 0.0)) - 0.026;
    float nickR = length(p - vec2(0.056, 0.0)) - 0.026;

    return min(min(slit, min(upper, lower)), min(nickL, nickR));
  }

  float soundboard(vec2 p, float grain) {
    vec2 q = p * 1.8;
    float left = fhole(vec2(q.x + 0.52, q.y));
    float right = fhole(vec2(-q.x + 0.52, q.y));
    // Perturbing the edge keeps it brushed rather than vector-sharp.
    float d = min(left, right) + (grain - 0.5) * 0.012;
    return 1.0 - smoothstep(0.0, 0.016, d);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;

    // Slow domain warp: the water is never quite still.
    vec2 q = vec2(fbm(p * 1.3 + uTime * 0.021), fbm(p * 1.3 + vec2(5.2, 1.3) - uTime * 0.017));
    vec2 r = vec2(
      fbm(p * 1.6 + 2.0 * q + vec2(1.7, 9.2) + uTime * 0.03),
      fbm(p * 1.6 + 2.0 * q + vec2(8.3, 2.8) - uTime * 0.024)
    );
    float turbulence = fbm(p * 1.9 + 2.4 * r);

    // The drop opens out, then is pulled back in.
    float open = smoothstep(0.0, 0.5, uProgress);
    float gather = smoothstep(0.55, 1.0, uProgress);
    float radius = mix(0.18, 1.5, open) * (1.0 - 0.55 * gather);

    // The wash breathes with the playing: a bowed note pushes the ink outward
    // and darkens it, and it settles back in the silence between phrases.
    float breath = 1.0 + uLevel * 0.34;
    float edge = length(p) + (turbulence - 0.5) * mix(0.55, 1.35, open) * breath;
    float bloom = smoothstep(radius * breath, radius * 0.28, edge);

    float board = soundboard(p, turbulence) * smoothstep(0.6, 0.99, uProgress);
    float ink = max(bloom * (1.0 - gather * 0.72), board);

    // Thin ink goes green before it goes black, the way a wash separates.
    vec3 tone = mix(uJade, uInk, smoothstep(0.25, 0.85, ink));
    // A trace of cinnabar where the wash is thinnest, like a seal bleeding through.
    tone = mix(tone, uCinnabar, smoothstep(0.06, 0.2, ink) * (1.0 - smoothstep(0.2, 0.42, ink)) * 0.35);

    float alpha = clamp(ink * (0.94 + uLevel * 0.24), 0.0, 1.0);
    gl_FragColor = vec4(tone, alpha);
  }
`;

export function createDragonScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uAspect: { value: 1 },
      uInk: { value: new THREE.Color("#1b2430") },
      uJade: { value: new THREE.Color("#6f9a86") },
      uCinnabar: { value: new THREE.Color("#a8402a") },
    },
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);

  return {
    render(progress, elapsed, level) {
      material.uniforms.uProgress.value = progress;
      // Held still under reduced motion, except while the listener has music
      // playing — their own gesture, and the only thing allowed to move here.
      material.uniforms.uTime.value = reducedMotion ? (level > 0.01 ? elapsed : 0) : elapsed;
      material.uniforms.uLevel.value = level;
      renderer.render(scene, camera);
    },

    resize(width, height, dpr) {
      // The noise field is expensive per pixel; capping density keeps it smooth.
      renderer.setPixelRatio(Math.min(dpr, 1.5));
      renderer.setSize(width, height, false);
      material.uniforms.uAspect.value = width / height;
    },

    dispose() {
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
