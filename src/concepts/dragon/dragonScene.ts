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

  /* Him, cut out of the photograph by tone rather than by shape.

     Most of that 2.37:1 frame is not him: a cloud bank runs down the whole left
     edge and sweeps across the top, and it is dark. Two attempts to fence it off
     geometrically both failed, and they failed for the same reason — the cloud
     is not beside him, it is *against* him, meeting his shoulder at the top and
     his boots at the bottom. A box cut him with a ruled edge down the chest; an
     ellipse fixed the ruled edge and then dissolved his outline instead, which
     is the white fade around him.

     Neither was necessary. Measured off the still, his silhouette runs 9–17 out
     of 255 and the nearest cloud runs 25–31: they never touch. So the cut is a
     threshold in that gap, and there is no mask at all. The cloud is not
     excluded, it simply is not dark enough to be ink.

     The numbers below are linear, because the texture is tagged sRGB and the
     sampler converts on read: 18/255 and 26/255 sRGB, either side of 22. */
  const float HIM_DARK = 0.0058;
  const float HIM_LIGHT = 0.0105;
  const float HIM_HEIGHT = 0.97;

  /* The focus argument is where along the photograph's width the crop is
     centred.

     It matters on a phone. This still is 2.37 to 1 and he stands at the far
     left of it; cover-fitting that into a portrait viewport keeps about a fifth
     of the width, and centred, that fifth is sky. The hero simply had no man in
     it. Anchoring the crop on him puts him back. */
  vec2 cover(vec2 uv, float focus) {
    float scale = uAspect / uPhotoAspect;
    if (scale > 1.0) {
      uv.y = (uv.y - 0.5) / scale + 0.5;
    } else {
      uv.x = (uv.x - 0.5) * scale + focus;
    }
    return uv;
  }

  /* Fit him, rather than cropping to him.

     Cover-fitting a 2.37 to 1 photograph into a portrait phone keeps a fifth of
     its width. Anchoring that fifth on him does not help: a vertical sliver of a
     man, blown up, is an abstract smudge and not a figure. So on a phone the
     figure is *scaled* to the frame instead. The scale factors are worked out
     from the two aspect ratios so nothing is stretched: he lands upright, whole,
     and about half the height of the screen, with bare paper around him. */
  vec2 fitFigure(vec2 uv) {
    /* Where he stands in the photograph, and where he should stand on screen.

       Both were measured off the still rather than guessed. He runs the whole
       height of a 2.37:1 frame between x 0.20 and 0.50 — body on the left of
       that, violin and bow reaching across the rest — so the anchor is the
       centre of that box.

       The share is how much of the frame's height he gets. At 0.30 he was a
       third of a tall screen: a small grey mark in a lot of bare paper, on a
       page whose entire subject is him. */
    const vec2 inPhoto = vec2(0.35, 0.485);
    const vec2 onScreen = vec2(0.56, 0.42);
    const float share = 0.52;

    float ky = HIM_HEIGHT / share;
    // Negative, so he is mirrored and looks back into the page rather than out
    // of it. He stands to the right of the type, so he has to face left.
    float kx = -ky * uAspect / uPhotoAspect;
    return inPhoto + (uv - onScreen) * vec2(kx, ky);
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
       His silhouette is sampled from the photograph and its edge is pushed
       around by the same turbulence that moves the wash, so the figure bleeds
       into the water instead of being a picture laid behind it. He holds the
       left of the frame and runs out before the type, the way a brush does. */
    float narrow = step(uAspect, 0.95);
    vec2 wobble = vUv + (r - vec2(0.5)) * 0.045 * 0.8;
    vec2 photoUv = narrow > 0.5 ? fitFigure(wobble) : cover(wobble, 0.5);
    /* Past the edge of the plate there is only paper, never a smeared last row.
       Softened, so the wash runs out the way a brush does rather than ending on
       a rectangle. */
    /* Wide runs out softly at the plate edge, as it always did. Narrow only
       needs to know where the photograph stops, because the threshold does the
       rest — so the guard is a hairline rather than a fade, and his outline
       arrives intact. */
    vec2 plateEdge = min(photoUv, 1.0 - photoUv);
    float guard = mix(0.20, 0.012, narrow);
    float inFrame = smoothstep(0.0, guard, plateEdge.x) * smoothstep(0.0, guard, plateEdge.y);

    /* Wide keeps the photograph's own values: at that size the sky's gradient is
       most of what the wash is made of, and a threshold there turns him into a
       slab. Narrow is a silhouette against a bright sky and nothing else, so it
       is cut at the tone that separates him from the weather. */
    float lit = grey(texture2D(uPhoto, photoUv).rgb);
    float tonal = 1.0 - lit;

    /* A threshold is a cliff, and a cliff blown up to half a phone screen is a
       staircase. Two things take that out, and neither of them is a blur.

       The ramp is scaled by how fast the tone is changing on screen — so the
       edge is about a pixel wide however far the picture is magnified, which is
       what antialiasing means and is the part that removes the steps.

       Then the cut point itself is walked around by two noises: a fine one for
       the tooth of the paper, and a slow drifting one so the boundary is never
       quite still. Ink on paper does not have a fixed edge; it creeps along the
       fibres and it is still moving while it dries. That is the part that makes
       it look drawn rather than keyed. */
    /* The fibre is measured in the photograph's own space, not the screen's, for
       two reasons: it stays put on him instead of crawling underneath him as the
       page scrolls, and its frequency lands at a couple of pixels rather than a
       dozen. At a dozen it stopped being tooth and became scallops cut out of
       his back. */
    float fibre = noise(photoUv * vec2(uPhotoAspect, 1.0) * 320.0);
    float creep = fbm(vUv * vec2(uAspect, 1.0) * 7.0 - uTime * 0.02);
    float mid = 0.5 * (HIM_DARK + HIM_LIGHT)
      + (fibre - 0.5) * 0.0013
      + (creep - 0.5) * 0.0011;
    float aa = max(fwidth(lit) * 1.25, 0.0005);
    float cut = 1.0 - smoothstep(mid - aa, mid + aa, lit);

    float dark = mix(tonal, cut, narrow) * inFrame;
    float bleed = (turbulence - 0.5) * mix(0.3, 0.12, open);
    /* Tonal, not binary. Thresholding turned him into black slabs; ink density
       has to follow the photograph's own values, with the mid-tones staying
       grey so the wash reads as a wash and the paper still breathes. */
    float figure = pow(clamp(dark * 0.98 + bleed * 0.55, 0.0, 1.0), 1.42) * uHasPhoto;
    // Runs out to bare paper on the right, and lifts off the floor.
    /* He runs out before the type. On a wide screen the type is beside him, so
       the wash ends around two thirds across; on a phone the type is below him,
       so he fades into the paper on the way down instead. */
    figure *= mix(smoothstep(0.72, 0.3, vUv.x), 1.0, narrow)
      * smoothstep(0.0, 0.12, vUv.y)
      * mix(1.0, smoothstep(0.03, 0.13, vUv.y), narrow);
    // Present from the first frame, and deepest once the wash has opened.
    // Solid on a phone, because a silhouette is solid; the bleed above is what
    // keeps its edge brushed rather than cut out with scissors.
    figure *= (0.62 + 0.38 * open) * mix(1.0, 1.3, narrow);

    /* On a phone he stands in the lower right, and the wash was settling on top
       of him there. The bloom is pulled back over that corner so the figure has
       clean paper to be read against; the wash keeps the rest of the sheet. */
    /* The corner he stands in is kept clear of the wash, and kept clearer the
       further the wash opens: by the last cut the bloom is at its widest and was
       settling straight on top of him. It follows the whole of him now, not just
       his feet. */
    /* Pulled back less than it was. Between taking three quarters of the bloom
       off his corner and diluting the rest to 0.6, a narrow sheet came out
       almost bare — and bare paper with a small grey man on it is not restraint,
       it is an empty page. He needs clean paper immediately around him, not a
       whole side of the sheet. */
    float clearForHim = mix(
      1.0,
      1.0 - (0.52 + 0.18 * open) * smoothstep(0.24, 0.60, vUv.x) * smoothstep(0.80, 0.14, vUv.y),
      narrow
    );
    /* Diluted on a phone. At that width the wash filled most of the sheet and
       stopped reading as ink in water, which is pale and open, and started
       reading as grey smoke. */
    float ink = max(bloom * (1.0 - gather * 0.78) * 0.92 * clearForHim * mix(1.0, 0.82, narrow), figure);

    // Thin ink goes green before it goes black, the way a wash separates.
    vec3 tone = mix(uJade, uInk, smoothstep(0.25, 0.85, ink));
    // A trace of cinnabar where the wash is thinnest, like a seal bleeding through.
    tone = mix(tone, uCinnabar, smoothstep(0.06, 0.2, ink) * (1.0 - smoothstep(0.2, 0.42, ink)) * 0.35);

    float alpha = clamp(ink * 0.96, 0.0, 1.0);
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
      uPhotoAspect: { value: photos.silhouette.width / photos.silhouette.height },
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
  loader.load(photos.silhouette.src, (texture) => {
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
