import * as THREE from "three";
import { photos } from "../../content/media";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * Him, dropped into water as ink. A domain-warped noise field blooms outward as you
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

  uniform sampler2D uPhoto;
  uniform float uHasPhoto;
  uniform float uPhotoAspect;
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

  /* Named grey, not luminance: three.js already defines one of those. */
  float grey(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  /* Him, read straight off the plate.

     The plate is a studio silhouette on white — see silhouettePose in media.ts.
     That is the whole reason there is no apparatus here at all: the ground is
     254 out of 255 and he is under 60, so the plate's own darkness *is* the ink.
     No threshold, no mask, no crop, no box around his shoulders.

     The earlier plate was a frame from the concert film, and every attempt to
     use it failed the same way: a cloud bank pressed against his shoulder and
     his boots, dark as he was, and nothing separates two things that touch and
     match. That is what this replaces. */

  /* Where he stands on the plate: his own bounding box, measured off it. */
  const vec2 HIM_CENTRE = vec2(0.569, 0.524);
  const float HIM_HEIGHT = 0.928;

  /* Fit him to the frame, rather than cropping the frame to him.

     Cover-fitting is what a background image does, and it is wrong for a figure:
     it decides how much of a man you see from the shape of the window. So the
     scale comes from him — he is given a share of the frame's height, and the
     horizontal factor is derived from the two aspect ratios so nothing is
     stretched. He lands upright, whole, and the same proportions on every
     screen; only how much room he gets, and which side he stands on, change.

     He is not mirrored. On this plate he already faces left, which is into the
     page on a phone, where the type is a left-hand column and he stands to the
     right of it. On a wide screen the type moves right and so does he. */
  vec2 fitFigure(vec2 uv, float narrow) {
    float share = mix(0.78, 0.55, narrow);
    vec2 onScreen = mix(vec2(0.245, 0.47), vec2(0.72, 0.47), narrow);

    float ky = HIM_HEIGHT / share;
    float kx = ky * uAspect / uPhotoAspect;
    return HIM_CENTRE + (uv - onScreen) * vec2(kx, ky);
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

    // No breath from the amplitude: pushing the wash around in time with the
    // music read as a novelty. The ink moves on its own slow clock.
    float breath = 1.0;
    float edge = length(p) + (turbulence - 0.5) * mix(0.55, 1.35, open) * breath;
    float bloom = smoothstep(radius * breath, radius * 0.28, edge);

    /* The scroll closes on nothing but the ink.
       It resolved into f-holes once, and into a stamped seal after that; both
       read as an object dropped onto the page at the last moment — the seal in
       particular came out as a pale square floating in the paper. A wash should
       end the way a wash ends, by settling. */
    float board = 0.0;

    /* ---- him, as ink ----

       Read straight off the plate, at full resolution, with nothing done to it.

       Everything that used to happen here was damage. The plate was thresholded
       to a flat stencil, the stencil was warped by turbulence, and the warped
       edge was chewed by a second, finer noise — three operations whose combined
       effect was to take a sharp studio photograph and make it look like a bad
       scan of itself. All three existed to solve a problem the old plate had and
       this one does not: separating him from a background that was as dark as he
       was.

       This plate is a cut-out on white. Its own values are already exactly the
       ink — the ground lands on zero and what is left is him, with the edges the
       photographer's lens gave him and the pinstripes and the rim light on his
       sleeve still in it. That internal detail is the difference between a
       figure and a sticker, and it survives only if nothing here flattens it. */
    float narrow = step(uAspect, 0.95);

    /* The one liberty taken, and it is small: a slow drift of the sample point,
       so the ink is not quite still on the page. Two pixels, not fourteen — at
       fourteen it was wider than his forearm. */
    vec2 wobble = vUv + (r - vec2(0.5)) * 0.045 * 0.09;
    vec2 photoUv = fitFigure(wobble, narrow);

    // Outside the plate there is only paper, and the sampler clamps to white.
    vec2 plateEdge = min(photoUv, 1.0 - photoUv);
    float inFrame = smoothstep(0.0, 0.004, plateEdge.x) * smoothstep(0.0, 0.004, plateEdge.y);

    float lit = grey(texture2D(uPhoto, photoUv).rgb);
    /* The floor lifts the ground clear of zero — the white is 254, not 255, and
       without it the whole sheet carries a film of ink. The gain restores what
       that costs him. */
    float figure = clamp((1.0 - lit - 0.03) * 1.18, 0.0, 1.0) * inFrame * uHasPhoto;
    // Lifts off the floor of the frame rather than being sawn off by it.
    figure *= smoothstep(0.0, 0.05, vUv.y);
    // Present from the first frame, and deepest once the wash has opened.
    figure *= 0.86 + 0.14 * open;

    /* The wash used to be held off the corner he stands in, because it settled
       on top of a figure that was itself only a shade of the same grey. He is
       ink now and the wash cannot cover him, so it gets the sheet back — only
       the type's own column is kept open, and only on a narrow screen where the
       type sits over the wash rather than beside it. */
    float clearForType = mix(
      1.0,
      1.0 - 0.42 * smoothstep(0.62, 0.14, vUv.x),
      narrow
    );
    /* Diluted on a phone. At that width the wash filled most of the sheet and
       stopped reading as ink in water, which is pale and open, and started
       reading as grey smoke. */
    /* Held back at the top of the scroll. The drop starts small and centred, and
       a small centred drop sitting behind the name is not a wash, it is a
       smudge on the paper. The sheet opens bare — him on it and nothing else —
       and the ink arrives once the page is moving, which is the metaphor
       anyway: it is dropped in, it is not already there. */
    float wash = bloom * (1.0 - gather * 0.78) * 0.92 * clearForType
      * mix(1.0, 0.82, narrow) * smoothstep(0.015, 0.16, uProgress);

    /* The wash and the man are two different things and used to be one number,
       which is what made him look cheap. Thin ink goes green before it goes
       black — true of a wash, and the reason for the jade — but he is not a
       wash. He is lit from behind, so the plate hands over a bright edge down
       his front, and running that through the same ramp turned his bow arm and
       his leading leg pale green. He is one colour at whatever density the
       photograph gives him; the ramp belongs to the water around him. */
    vec3 washTone = mix(uJade, uInk, smoothstep(0.25, 0.85, wash));
    // A trace of cinnabar where the wash is thinnest, like a seal bleeding through.
    washTone = mix(washTone, uCinnabar, smoothstep(0.06, 0.2, wash) * (1.0 - smoothstep(0.2, 0.42, wash)) * 0.35);

    // Him over the water, composited properly rather than taken as a maximum.
    float washA = clamp(wash * 0.96, 0.0, 1.0);
    float figA = clamp(figure * 0.96, 0.0, 1.0);
    float alpha = figA + washA * (1.0 - figA);
    vec3 tone = alpha > 0.0001
      ? (uInk * figA + washTone * washA * (1.0 - figA)) / alpha
      : washTone;

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
      uPhoto: { value: null },
      uHasPhoto: { value: 0 },
      uPhotoAspect: { value: photos.silhouettePose.width / photos.silhouettePose.height },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uAspect: { value: 1 },
      uInk: { value: new THREE.Color("#1b2430") },
      uJade: { value: new THREE.Color("#6f9a86") },
      uCinnabar: { value: new THREE.Color("#a8402a") },
    },
  });

  const loader = new THREE.TextureLoader();
  loader.load(photos.silhouettePose.src, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    /* Mipmapped, and this is the whole reason his outline was a staircase.

       He occupies about 1150 px of a 3840 px still and lands in roughly 640
       device pixels of a phone, so the plate is being *minified* — and a
       minified texture read with a plain linear filter samples one texel per
       pixel and skips the rest, which aliases. Thresholding that turns the
       aliasing into hard steps along every edge that is nearly vertical.
       Trilinear plus anisotropy prefilters it, so the tone arriving at the
       threshold is smooth and the edge comes out of it clean. */
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    material.uniforms.uPhoto.value = texture;
    material.uniforms.uHasPhoto.value = 1;
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);

  return {
    render(progress, elapsed, level) {
      material.uniforms.uProgress.value = progress;
      material.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
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
      (material.uniforms.uPhoto.value as THREE.Texture | null)?.dispose();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
