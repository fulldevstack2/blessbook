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

    /* The drape is lit, not tinted.

       Interpolating a colour along a sine gave smooth red bands — an airbrush,
       not cloth. What follows is a height field for the pleats, a normal taken
       from its slope, and a light: creases go almost black by occlusion, the
       flanks catch the lamp, and velvet's pile is a separate high-frequency
       term over the top. That is the whole difference between fabric and a
       gradient. */
    float side = sign(dx);
    // Pleats are hung from a track: tighter at the top, opening toward the hem.
    float pitch = 26.0 * mix(0.82, 1.16, uv.y);
    // No two are the same width, and they wander as they fall.
    float wander = (noise(vec2(uv.y * 2.2, side * 3.0)) - 0.5) * 0.12
      + (noise(vec2(uv.y * 5.6, side * 9.0)) - 0.5) * 0.04;
    // A slow breath on its own clock — not a response to the music.
    float phase = (into + wander) * pitch + sin(uv.y * 4.0 + uTime * 0.28) * 0.05;

    float height = cos(phase);              // +1 on a crest, -1 in a crease
    float slope = -sin(phase);              // which way the surface is facing

    vec3 normal = normalize(vec3(slope * 0.9, 0.16, 1.0));
    vec3 toLight = normalize(vec3((lamp.x - uv.x) * uAspect, lamp.y - uv.y, 0.6));
    float lambert = clamp(dot(normal, toLight), 0.0, 1.0);
    // Velvet scatters back along the pile rather than reflecting a hot spot, so
    // the sheen sits on the flanks of a fold, not on its crest.
    float sheen = pow(clamp(abs(slope), 0.0, 1.0), 2.6);
    float occlusion = 0.34 + 0.66 * smoothstep(-1.0, 0.6, height);

    // The pile itself: fine vertical streaks, plus a coarser mottle.
    float pile = noise(vec2(uv.x * 760.0 + into * 120.0, uv.y * 22.0)) * 0.16
      + noise(uv * vec2(58.0, 17.0)) * 0.09;

    vec3 velvet = mix(uVelvet * 0.22, uVelvet, occlusion);
    velvet = mix(velvet, uVelvetLit, lambert * 0.5 * occlusion);
    velvet += uVelvetLit * sheen * 0.2 * occlusion;
    velvet *= 0.9 + pile;
    velvet *= 0.4 + 0.92 * (glow + wash);
    // Shadow under the track, and the hem falling away into the floor.
    velvet *= 1.0 - 0.34 * smoothstep(0.8, 1.0, uv.y);
    velvet *= 0.66 + 0.34 * smoothstep(0.0, 0.46, uv.y);

    // A brass thread catching the light down the leading edge.
    float edge = exp(-pow(into / 0.012, 2.0)) * step(0.001, travel);
    velvet += uBrass * edge * 0.45;

    vec3 colour = mix(stage, velvet, cloth);

    /* The valance across the top, which does not travel. A stage curtain that
       is only two flat halves reads as a graphic; the pelmet and its fringe are
       what say proscenium. */
    float scallop = 0.888 - 0.009 * cos(uv.x * uAspect * 26.0);
    float valance = smoothstep(scallop - 0.004, scallop + 0.004, uv.y);
    if (valance > 0.001) {
      float vPhase = uv.x * uAspect * 46.0 + noise(vec2(uv.x * 8.0, 2.0)) * 1.4;
      float vHeight = cos(vPhase);
      float vSlope = -sin(vPhase);
      vec3 vNormal = normalize(vec3(vSlope * 0.8, 0.2, 1.0));
      float vLight = clamp(dot(vNormal, toLight), 0.0, 1.0);
      float vOcc = 0.3 + 0.7 * smoothstep(-1.0, 0.6, vHeight);

      vec3 pelmet = mix(uVelvet * 0.18, uVelvet * 0.86, vOcc);
      pelmet = mix(pelmet, uVelvetLit * 0.85, vLight * 0.42 * vOcc);
      pelmet *= 0.9 + noise(vec2(uv.x * 700.0, uv.y * 30.0)) * 0.14;
      pelmet *= 0.42 + 0.85 * (glow + wash);
      colour = mix(colour, pelmet, valance);
    } else {
      float under = exp(-pow((scallop - uv.y) / 0.05, 2.0));
      colour *= 1.0 - under * 0.4;
    }

    if (valance > 0.001) {

      // Bullion fringe along its edge, and the shadow it throws on the cloth
      // below — which is the thing that makes it read as a separate layer
      // rather than a line drawn across the picture.
      float fringe = exp(-pow((uv.y - scallop) / 0.0035, 2.0));
      colour += uBrass * fringe * 0.14 * (0.5 + 0.9 * (glow + wash));
    }

    /* ---- the proscenium: everything is seen through an arch ---- */
    vec2 a = vec2((uv.x - 0.5) * uAspect, uv.y);
    float halfWidth = 0.5 * uAspect * 0.94;
    /* The arch springs high on a phone. Kept at the wide value, a frame taller
       than it is wide turns the proscenium's round head into a dome and the
       whole hero reads as a keyhole. */
    float springLine = mix(0.52, 0.82, step(uAspect, 0.95));
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
      // In house mode the curtain stays shut and the scroll input dims the room
      // instead: the loader is the lights going down, not a second curtain.
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

/** The hero: a velvet house whose curtain parts as you scroll. */

