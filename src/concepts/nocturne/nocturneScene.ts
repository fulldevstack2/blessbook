import * as THREE from "three";
import { photos } from "../../content/media";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * The house, before the doors open.
 *
 * Oxblood velvet hangs across the frame with one brass lamp on it, and as you
 * scroll the curtain parts — not a graphic sliding, the actual halves travelling
 * outward with their own folds — to reveal him standing behind it. Dust hangs in
 * the lamp's beam. When he plays, the lamp brightens and the velvet breathes.
 *
 * Everything is in one shader over one quad: the photograph, the cloth, the light
 * and the dust, so nothing is layered on top of anything. The lamp follows the
 * pointer, which is the only interaction the concept allows itself.
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

  uniform sampler2D uPhoto;
  uniform float uHasPhoto;
  uniform float uPhotoAspect;
  uniform float uAspect;
  uniform float uProgress;
  uniform float uTime;
  uniform float uLevel;
  uniform vec2 uLamp;

  uniform vec3 uVelvet;
  uniform vec3 uVelvetLit;
  uniform vec3 uBrass;
  uniform vec3 uIvory;
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

  float grey(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  vec2 cover(vec2 uv) {
    float scale = uAspect / uPhotoAspect;
    if (scale > 1.0) {
      uv.y = (uv.y - 0.5) / scale + 0.5;
    } else {
      uv.x = (uv.x - 0.5) * scale + 0.5;
    }
    return uv;
  }

  void main() {
    vec2 uv = vUv;
    vec2 lamp = uLamp;

    /* ---- the lamp: one warm source, brighter when he plays ---- */
    float toLamp = length((uv - lamp) * vec2(uAspect, 1.0));
    // The lamp lifts a little while he plays. Light, not geometry.
    float glow = exp(-toLamp * toLamp * 2.4) * (0.9 + uLevel * 0.22);
    float wash = exp(-toLamp * 1.35) * 0.5;

    /* ---- behind the cloth: him, lit by that lamp ---- */
    vec2 photoUv = cover(uv);
    vec3 shot = texture2D(uPhoto, photoUv).rgb;
    float l = grey(shot);
    // Graded warm: velvet in the shadows, ivory in the highlights, brass between.
    vec3 stage = mix(uShadow, uVelvet, smoothstep(0.02, 0.3, l));
    stage = mix(stage, uBrass, smoothstep(0.26, 0.66, l));
    stage = mix(stage, uIvory, smoothstep(0.62, 0.98, l));
    stage *= 0.5 + 0.85 * (glow + wash);
    if (uHasPhoto < 0.5) stage = uShadow;

    // Dust in the beam: only where the light is, drifting upward.
    vec2 mote = vec2(uv.x * 150.0, uv.y * 110.0 - uTime * 0.35);
    float dust = smoothstep(0.9975, 1.0, hash(floor(mote))) * glow * 2.2;
    stage += uIvory * dust * 0.9;

    /* ---- the cloth, and its parting ---- */
    float part = smoothstep(0.1, 0.86, uProgress);
    float dx = uv.x - 0.5;
    float travel = part * 0.66;
    // Distance into the curtain from its leading edge: negative once it has passed.
    float into = abs(dx) - travel;
    float cloth = smoothstep(-0.004, 0.012, into);

    // Folds travel with the cloth rather than staying pinned to the screen.
    float foldX = (abs(dx) - travel) * 30.0 + noise(vec2(uv.y * 3.0, sign(dx) * 7.0)) * 1.8;
    // Deeper troughs than a plain sine: velvet reads by its shadow, not its sheen.
    float fold = pow(0.5 + 0.5 * sin(foldX), 1.5);
    fold += 0.16 * pow(0.5 + 0.5 * sin(foldX * 2.7 + 1.1), 2.0);
    // Velvet is never quite still, but it does not shake to the beat: this is a
    // slow drift on its own clock, not an amplitude response.
    fold += sin(uv.y * 5.0 + uTime * 0.35) * 0.02;
    float weave = noise(uv * vec2(420.0, 160.0)) * 0.06;

    vec3 velvet = mix(uVelvet * 0.72, uVelvetLit, pow(clamp(fold, 0.0, 1.0), 1.35));
    velvet *= 0.42 + 0.9 * (glow + wash);
    velvet += velvet * weave;
    // Nap: velvet goes darker toward the floor, which is what makes it velvet.
    velvet *= 0.72 + 0.34 * smoothstep(0.0, 0.75, uv.y);

    // A brass thread catching the light down the leading edge.
    float edge = exp(-pow(into / 0.014, 2.0)) * step(0.001, travel);
    velvet += uBrass * edge * 0.6;

    vec3 colour = mix(stage, velvet, cloth);

    /* ---- the proscenium: everything is seen through an arch ---- */
    vec2 a = vec2((uv.x - 0.5) * uAspect, uv.y);
    float halfWidth = 0.5 * uAspect * 0.94;
    float springLine = 0.52;
    float inside;
    if (uv.y <= springLine) {
      inside = 1.0 - smoothstep(halfWidth - 0.012, halfWidth, abs(a.x));
    } else {
      // A round-headed arch above the spring line, the shape of a proscenium.
      vec2 c = vec2(0.0, springLine);
      vec2 d = vec2(a.x, (a.y - c.y) * (halfWidth / max(0.001, 1.0 - springLine)));
      inside = 1.0 - smoothstep(halfWidth - 0.012, halfWidth, length(d));
    }
    colour = mix(uShadow * 0.6, colour, inside);

    // The room falls away at the edges.
    float vignette = 1.0 - smoothstep(0.46, 1.16, length((uv - vec2(0.5)) * vec2(uAspect * 0.8, 1.0)));
    colour *= 0.5 + 0.5 * vignette;

    gl_FragColor = vec4(colour, 1.0);
  }
`;

export function createNocturneScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
  });

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uPhoto: { value: null },
      uHasPhoto: { value: 0 },
      uPhotoAspect: { value: photos.press.width / photos.press.height },
      uAspect: { value: 1 },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uLamp: { value: new THREE.Vector2(0.5, 0.72) },
      uVelvet: { value: new THREE.Color("#3a1119") },
      uVelvetLit: { value: new THREE.Color("#7c2531") },
      uBrass: { value: new THREE.Color("#d3a459") },
      uIvory: { value: new THREE.Color("#f3ecdd") },
      uShadow: { value: new THREE.Color("#150609") },
    },
  });

  const loader = new THREE.TextureLoader();
  loader.load(photos.press.src, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    material.uniforms.uPhoto.value = texture;
    material.uniforms.uHasPhoto.value = 1;
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);

  const lamp = material.uniforms.uLamp.value as THREE.Vector2;
  const target = new THREE.Vector2(0.5, 0.72);
  const onPointer = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    target.set((event.clientX - box.left) / box.width, 1 - (event.clientY - box.top) / box.height);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  return {
    render(progress, elapsed, level) {
      material.uniforms.uProgress.value = progress;
      material.uniforms.uTime.value = reducedMotion ? (level > 0.01 ? elapsed : 0) : elapsed;
      material.uniforms.uLevel.value = level;
      lamp.lerp(target, reducedMotion ? 1 : 0.045);
      renderer.render(scene, camera);
    },

    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      material.uniforms.uAspect.value = width / height;
    },

    dispose() {
      window.removeEventListener("pointermove", onPointer);
      (material.uniforms.uPhoto.value as THREE.Texture | null)?.dispose();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
