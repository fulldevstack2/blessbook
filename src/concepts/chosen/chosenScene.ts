import * as THREE from "three";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * Silk, and then a pearl.
 *
 * A woven ground with a broad sheen travelling across it; as you scroll, the
 * light in the weave gathers until it settles into a single pearl with an
 * iridescent rim. That is the concept's argument in one image — couture is
 * selection, one thing chosen out of everything available, which is his own word
 * for himself and also exactly what a commission is.
 *
 * Drawn in a fragment shader over one full-screen quad, so it composites
 * straight onto the silk background rather than sitting in a box. The lustre
 * breathes with `uLevel`: when Dennis is playing, the silk catches more light.
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
  uniform vec3 uSilk;
  uniform vec3 uPearl;
  uniform vec3 uGold;
  uniform vec3 uShadow;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

  /* Anisotropic: stretched along the warp so it reads as thread rather than as
     generic noise. Silk is directional, and the eye knows it. */
  float weave(vec2 p) {
    float warp = noise(vec2(p.x * 220.0, p.y * 3.0));
    float weft = noise(vec2(p.x * 3.0, p.y * 220.0));
    return (warp * 0.55 + weft * 0.45);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;

    /* ---- the weave ---- */
    float threads = weave(vUv + vec2(uTime * 0.0008, 0.0));
    float cloth = (threads - 0.5) * 0.05;

    /* ---- the sheen: a broad band crossing the cloth ---- */
    // Travels with scroll, and drifts a little on its own so the fabric is
    // never quite still.
    float band = (p.x * 0.42 + p.y * 0.9) - (uProgress * 2.6 - 1.1) - sin(uTime * 0.12) * 0.06;
    float sheen = exp(-band * band * 2.1);
    // Playing lifts the lustre: the same light, caught harder.
    sheen *= 0.5 + uLevel * 0.85;

    /* ---- the pearl, gathering as the scroll ends ---- */
    float gather = smoothstep(0.5, 0.97, uProgress);
    vec2 centre = vec2(-0.02, 0.12);
    vec2 d = p - centre;
    // Small on purpose, and small the whole way: it fades in at its final size
    // rather than shrinking from a wall-sized disc, which read as a beach ball.
    float pearlRadius = mix(0.33, 0.26, gather);
    float rr = length(d) / pearlRadius;

    // A crisp silhouette. A pearl has an edge; only its lustre is soft.
    float inside = (1.0 - smoothstep(0.965, 1.0, rr)) * gather;

    // Shaded as a sphere rather than faked with a blur: the normal is recovered
    // from the disc, which is what gives it weight on the cloth.
    float z = sqrt(max(0.0, 1.0 - rr * rr));
    vec3 n = normalize(vec3(d / pearlRadius, z));
    vec3 light = normalize(vec3(-0.42, 0.58, 0.7));
    float diffuse = clamp(dot(n, light), 0.0, 1.0);
    float spec = pow(diffuse, 46.0);
    // Nacre: the rim goes iridescent where the surface turns away.
    float fresnel = pow(1.0 - n.z, 2.6);
    float phase = fresnel * 2.6 + uTime * 0.04 + uLevel * 1.4;
    vec3 nacre = 0.5 + 0.5 * cos(6.2831853 * (phase + vec3(0.0, 0.33, 0.67)));

    vec3 pearlColour = mix(uShadow, uPearl, 0.34 + 0.66 * diffuse);
    pearlColour = mix(pearlColour, mix(uPearl, nacre, 0.44), fresnel * 0.3);
    // A second, dimmer highlight bounced off the cloth, low and to the right.
    pearlColour += pow(clamp(dot(n, normalize(vec3(0.4, -0.7, 0.5))), 0.0, 1.0), 8.0) * 0.06;
    pearlColour += spec * (0.36 + uLevel * 0.5);
    // Gold thread reads in the lustre when he plays hardest.
    pearlColour = mix(pearlColour, uGold, spec * uLevel * 0.3);

    // Contact shadow: soft, offset down, so the pearl sits rather than floats.
    float contact = (1.0 - smoothstep(0.55, 1.35, length((p - centre - vec2(0.02, -0.1)) * vec2(1.0, 2.1)) / pearlRadius)) * gather;

    /* ---- composite ---- */
    vec3 colour = uSilk + cloth;
    colour = mix(colour, uSilk * 1.05 + uPearl * 0.08, sheen * 0.5);
    colour = mix(colour, uShadow, contact * 0.16);
    colour = mix(colour, pearlColour, inside);

    // Alpha keeps the plate transparent where nothing is happening, so the
    // page's own silk shows through and there is no visible canvas edge.
    float alpha = clamp(sheen * 0.34 + contact * 0.2 + inside * 0.98 + abs(cloth) * 5.0, 0.0, 1.0);
    gl_FragColor = vec4(colour, alpha * 0.94);
  }
`;

export function createChosenScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
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
    depthWrite: false,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uAspect: { value: 1 },
      uSilk: { value: new THREE.Color("#f4efe4") },
      uPearl: { value: new THREE.Color("#ebe3e6") },
      uGold: { value: new THREE.Color("#d8b46a") },
      uShadow: { value: new THREE.Color("#a1929a") },
    },
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);

  return {
    render(progress, elapsed, level) {
      material.uniforms.uProgress.value = progress;
      // Still under reduced motion, unless the listener started the music.
      material.uniforms.uTime.value = reducedMotion ? (level > 0.01 ? elapsed : 0) : elapsed;
      material.uniforms.uLevel.value = level;
      renderer.render(scene, camera);
    },

    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
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
