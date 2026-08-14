import * as THREE from "three";
import { photos } from "../../content/media";
import { waveform } from "../../lib/listening";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * The photograph *is* the scene.
 *
 * An earlier version put a gilded particle plume over a CSS `<img>` of Dennis,
 * and it read exactly as what it was: a graphic sitting on top of a picture. So
 * the picture is now the material. It is uploaded as a texture and everything
 * happens to it inside one shader:
 *
 *   · it is gradient-mapped into lacquer, deep gold and ivory, so it belongs to
 *     this concept instead of being a colour photograph dropped into it;
 *   · it is sliced into horizontal bands, and each band is displaced by the
 *     amplitude of whatever Dennis is playing at that moment — his own signal
 *     cuts his own photograph;
 *   · five staff lines are ruled across the frame and drawn in as you scroll,
 *     bending with the same signal;
 *   · gold dust is struck off his bright edges, so the gold comes out of him
 *     rather than floating in front of him;
 *   · and as the scroll ends the photograph dissolves upward into that dust, so
 *     the hero has an arc: a man, gilded, becoming music.
 *
 * One texture, one light, one hand.
 */

const BANDS = 18;
const WAVE_SIZE = 256;

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
  uniform sampler2D uWave;
  uniform float uHasPhoto;
  uniform float uProgress;
  uniform float uTime;
  uniform float uLevel;
  uniform float uAspect;
  uniform float uPhotoAspect;
  uniform vec2 uCursor;

  uniform vec3 uLacquer;
  uniform vec3 uGoldDeep;
  uniform vec3 uGold;
  uniform vec3 uGoldLit;
  uniform vec3 uIvory;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  /* Cover-fit, so the frame is filled at any viewport without squashing him. */
  vec2 cover(vec2 uv) {
    float scale = uAspect / uPhotoAspect;
    if (scale > 1.0) {
      uv.y = (uv.y - 0.5) / scale + 0.5;
    } else {
      uv.x = (uv.x - 0.5) * scale + 0.5;
    }
    return uv;
  }

  /* Named grey, not luminance: three.js already defines one of those in its
     shader prefix, and a second body is a compile error. */
  float grey(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  /* Lacquer → deep gold → gold → lit gold → ivory. A gilded photograph rather
     than a tinted one: the ramp is uneven on purpose, so highlights carry the
     metal and the shadows stay lacquer. */
  vec3 gild(float l) {
    // Open the shadows first: an arena photograph is mostly black, and mapping
    // that straight onto the ramp threw his face away.
    float t = pow(clamp(l, 0.0, 1.0), 0.78);
    vec3 c = mix(uLacquer, uGoldDeep, smoothstep(0.02, 0.26, t));
    c = mix(c, uGold, smoothstep(0.2, 0.54, t));
    c = mix(c, uGoldLit, smoothstep(0.5, 0.8, t));
    c = mix(c, uIvory, smoothstep(0.78, 1.0, t));
    // Multiply the original tonality back in so it grades rather than posterises.
    return c * (0.78 + 0.42 * t);
  }

  float wave(float y) {
    return texture2D(uWave, vec2(clamp(y, 0.0, 1.0), 0.5)).r;
  }

  void main() {
    vec2 uv = vUv;

    /* ---- the bands: his signal cuts his own photograph ---- */
    float bandIndex = floor(uv.y * float(${BANDS}));
    float bandCentre = (bandIndex + 0.5) / float(${BANDS});
    float amp = wave(bandCentre) - 0.5;
    // Alternating direction, so it reads as a cut rather than a wobble.
    float direction = mod(bandIndex, 2.0) < 1.0 ? 1.0 : -1.0;
    float slice = amp * direction * (0.014 + uLevel * 0.115);
    // Scroll widens the cut a little: the picture is most whole at the top.
    slice *= 0.55 + uProgress * 0.9;

    // A hairline of gold along the shear, so a displaced band reads as a
    // deliberate cut in the picture rather than as compression noise.
    float inBand = fract(uv.y * float(${BANDS}));
    float boundary = min(inBand, 1.0 - inBand);
    float cut = smoothstep(0.055, 0.0, boundary) * clamp(abs(slice) * 26.0, 0.0, 1.0);

    vec2 photoUv = cover(uv + vec2(slice, 0.0));
    vec3 photo = texture2D(uPhoto, photoUv).rgb;
    float l = grey(photo);

    vec3 colour = gild(l);
    if (uHasPhoto < 0.5) {
      // No texture yet: hold the lacquer ground rather than flashing black.
      colour = uLacquer;
      l = 0.0;
    }

    /* ---- his edges, and the gold struck off them ---- */
    float tap = 0.0022;
    float lx = grey(texture2D(uPhoto, photoUv + vec2(tap, 0.0)).rgb)
             - grey(texture2D(uPhoto, photoUv - vec2(tap, 0.0)).rgb);
    float ly = grey(texture2D(uPhoto, photoUv + vec2(0.0, tap)).rgb)
             - grey(texture2D(uPhoto, photoUv - vec2(0.0, tap)).rgb);
    float edge = clamp(length(vec2(lx, ly)) * 3.4, 0.0, 1.0) * uHasPhoto;

    // Dust rises: sparse, deterministic, and only where an edge is lit.
    vec2 dustCell = vec2(uv.x * 220.0, uv.y * 130.0 - uTime * 0.5 - uProgress * 6.0);
    float spark = hash(floor(dustCell));
    float dust = smoothstep(0.982, 1.0, spark) * edge * (0.3 + uLevel * 2.0 + uProgress * 0.8);

    /* ---- the photograph dissolves upward as the scroll ends ---- */
    float dissolve = smoothstep(0.55, 1.0, uProgress);
    float rise = smoothstep(0.0, 0.85, uv.y + (hash(floor(uv * vec2(90.0, 70.0))) - 0.5) * 0.22);
    float held = 1.0 - dissolve * rise;
    colour = mix(uLacquer, colour, held);

    /* ---- five staff lines, ruled across and drawn in on scroll ---- */
    float staff = 0.0;
    float drawn = smoothstep(0.02, 0.62, uProgress);
    for (int i = 0; i < 5; i += 1) {
      float base = 0.13 + float(i) * 0.031;
      // The lines bend with the playing: a bowed string, not a rule.
      float bend = sin(uv.x * 7.5 + uTime * 1.6 + float(i) * 0.7) * uLevel * 0.012;
      float d = abs(uv.y - (base + bend));
      float line = smoothstep(0.0016, 0.0, d);
      // They arrive left to right, like a pen.
      line *= smoothstep(0.0, 0.35, drawn - uv.x * 0.55);
      staff += line;
    }
    staff = clamp(staff, 0.0, 1.0) * (0.46 + uLevel * 0.6);

    /* ---- cursor light: the lacquer catches a highlight near the pointer ---- */
    float pointer = 1.0 - smoothstep(0.0, 0.38, length((uv - uCursor) * vec2(uAspect, 1.0)));
    colour += uGoldDeep * pointer * 0.09 * (0.4 + uLevel);

    colour += uGold * staff;
    colour += uGoldLit * dust;
    colour += uGoldLit * cut * 0.6;

    /* ---- the room falls off, and the type side is held down ---- */
    float vignette = 1.0 - smoothstep(0.42, 1.15, length((uv - vec2(0.5)) * vec2(uAspect * 0.82, 1.0)));
    colour *= 0.6 + 0.4 * vignette;
    float scrim = smoothstep(0.62, 0.02, uv.x);
    colour = mix(colour, uLacquer, scrim * 0.66);
    float floorScrim = smoothstep(0.34, 0.0, uv.y);
    colour = mix(colour, uLacquer, floorScrim * 0.55);

    gl_FragColor = vec4(colour, 1.0);
  }
`;

export function createPhoenixScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
  });

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  /** His signal, as a texture the shader can index by band. */
  const waveData = new Uint8Array(WAVE_SIZE).fill(128);
  const waveTexture = new THREE.DataTexture(waveData, WAVE_SIZE, 1, THREE.RedFormat);
  waveTexture.minFilter = THREE.LinearFilter;
  waveTexture.magFilter = THREE.LinearFilter;
  waveTexture.needsUpdate = true;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uPhoto: { value: null },
      uWave: { value: waveTexture },
      uHasPhoto: { value: 0 },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uAspect: { value: 1 },
      uPhotoAspect: { value: photos.goldViolin.width / photos.goldViolin.height },
      uCursor: { value: new THREE.Vector2(0.72, 0.55) },
      uLacquer: { value: new THREE.Color("#150f0c") },
      uGoldDeep: { value: new THREE.Color("#6d4a12") },
      uGold: { value: new THREE.Color("#c99a45") },
      uGoldLit: { value: new THREE.Color("#f2cd7a") },
      uIvory: { value: new THREE.Color("#f7ecd6") },
    },
  });

  const loader = new THREE.TextureLoader();
  loader.load(photos.goldViolin.src, (texture) => {
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

  /* The cursor light is a desktop nicety, and costs one pointer listener. */
  const cursor = material.uniforms.uCursor.value as THREE.Vector2;
  const target = new THREE.Vector2(0.72, 0.55);
  const onPointer = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    target.set((event.clientX - box.left) / box.width, 1 - (event.clientY - box.top) / box.height);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const samples = new Float32Array(1024) as Float32Array<ArrayBuffer>;

  return {
    render(progress, elapsed, level) {
      const time = reducedMotion ? (level > 0.01 ? elapsed : 0) : elapsed;
      material.uniforms.uProgress.value = progress;
      material.uniforms.uTime.value = time;
      material.uniforms.uLevel.value = level;

      // Pull the waveform into the band texture. When nothing is playing the
      // bands relax back to centre rather than snapping flat.
      if (waveform(samples)) {
        const stride = Math.floor(samples.length / WAVE_SIZE);
        for (let i = 0; i < WAVE_SIZE; i += 1) {
          let peak = 0;
          for (let k = 0; k < stride; k += 1) {
            const value = samples[i * stride + k] as number;
            if (Math.abs(value) > Math.abs(peak)) peak = value;
          }
          waveData[i] = Math.round(Math.max(0, Math.min(255, 128 + peak * 127)));
        }
        waveTexture.needsUpdate = true;
      } else {
        let moved = false;
        for (let i = 0; i < WAVE_SIZE; i += 1) {
          const value = waveData[i] as number;
          if (value !== 128) {
            waveData[i] = value + Math.sign(128 - value) * Math.min(3, Math.abs(128 - value));
            moved = true;
          }
        }
        if (moved) waveTexture.needsUpdate = true;
      }

      cursor.lerp(target, reducedMotion ? 1 : 0.06);

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
      waveTexture.dispose();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
