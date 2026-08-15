import * as THREE from "three";
import { photos } from "../../content/media";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * Molten gold, one seam of light, and him framed inside it.
 *
 * The previous hero sliced the photograph into bands driven by the waveform. On
 * paper that was a good idea; on screen it was jagged, and because a 1000-pixel
 * press photograph was being stretched across a 1440-pixel frame it was soft as
 * well. Jagged and soft is the worst of both.
 *
 * So the ground is procedural now — a domain-warped molten metal that is exactly
 * as sharp as the display it is drawn on, at any size, forever — and the
 * photograph is composed as an inset panel roughly the size it actually is, so
 * it is *downsampled* rather than enlarged. Nothing is stretched and nothing is
 * stepped.
 *
 * The motion is continuous rather than per-frame: the metal flows, a specular
 * band sweeps it, and the seam of gold down the frame opens as you scroll. His
 * playing pushes the flow and lifts the seam. That is the whole hero.
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
  uniform vec2 uCursor;
  uniform float uPanelOn;

  uniform vec3 uLacquer;
  uniform vec3 uGoldDeep;
  uniform vec3 uGold;
  uniform vec3 uGoldLit;
  uniform vec3 uIvory;

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

  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      total += noise(p) * amp;
      p *= 2.02;
      amp *= 0.5;
    }
    return total;
  }

  float grey(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) * 2.2;

    /* ---- molten metal: two domain warps, so it folds rather than ripples ---- */
    // Constant flow. Driving this from the amplitude made the metal shake in time
    // with the music, which looked like a novelty filter rather than a material.
    float flow = uTime * 0.035;
    vec2 q = vec2(fbm(p * 0.9 + flow), fbm(p * 0.9 + vec2(3.1, 1.7) - flow * 0.8));
    vec2 r = vec2(
      fbm(p * 1.1 + 2.0 * q + vec2(1.7, 9.2) + flow * 1.2),
      fbm(p * 1.1 + 2.0 * q + vec2(8.3, 2.8) - flow * 0.9)
    );
    float metal = fbm(p * 1.25 + 2.4 * r);

    // Gold reads by its highlight, so the ramp is weighted to the top end.
    vec3 colour = mix(uLacquer, uGoldDeep, smoothstep(0.34, 0.62, metal));
    colour = mix(colour, uGold, smoothstep(0.58, 0.78, metal));
    colour = mix(colour, uGoldLit, smoothstep(0.76, 0.9, metal));

    // A specular band crossing the metal, and a second, slower one behind it.
    float sweep = sin((uv.x * 1.4 + uv.y * 0.6) * 3.14159 - uTime * 0.22 + uProgress * 2.2);
    float spec = pow(max(0.0, sweep), 5.0) * 0.45;
    colour += uGoldLit * spec * smoothstep(0.45, 0.95, metal) * 0.7;

    // The whole field settles toward lacquer away from the seam, so it stays a
    // dark room with gold in it rather than a gold page.
    float depth = smoothstep(0.1, 0.85, metal);
    colour = mix(uLacquer, colour, 0.28 + 0.72 * depth);

    /* ---- one seam of 24K gold, opening as you scroll ---- */
    /* The seam sits left of the type on a wide screen. On a phone the type runs
       the full measure, so the seam moves to the far side rather than drawing a
       line through his name. */
    float narrowSeam = step(uAspect, 0.95);
    float seamX = mix(0.34, 0.9, narrowSeam);
    float width = 0.006 + uProgress * 0.05;
    float seam = exp(-pow((uv.x - seamX) / width, 2.0));
    // It is brighter where the metal behind it is already lit.
    colour += mix(uGold, uIvory, 0.35) * seam * 0.72;
    // And it throws light sideways.
    colour += uGoldDeep * exp(-pow((uv.x - seamX) / (width * 9.0), 2.0)) * 0.28;

    /* ---- him, framed: a panel, not a stretched backdrop ----
       On a narrow screen the panel cannot sit beside the type, so it moves above
       it and the type takes the floor. Same picture, different plate. */
    float narrow = step(uAspect, 0.95);
    /* On a phone it is not a plate at all. It ran edge to edge across the top
       half and stopped on a ruled line with a floor of dead black underneath,
       which is the one composition a poster never has — and it wasted the half
       of a phone screen that a portrait most wants. So on a narrow frame the
       picture runs the full width and nearly the full height, and its lower edge
       is dissolved into the metal instead of ruled against it. */
    float top = mix(0.08, 0.28, narrow);
    float bottom = mix(0.94, 1.0, narrow);
    float right = mix(0.955, 1.0, narrow);
    float panelHeight = bottom - top;
    float panelWidth = mix(panelHeight / uAspect * 0.92, 1.0, narrow);
    float left = right - panelWidth;

    vec2 panel = (uv - vec2(left, top)) / vec2(panelWidth, panelHeight);
    float inPanel = step(0.0, panel.x) * step(panel.x, 1.0) * step(0.0, panel.y) * step(panel.y, 1.0) * uPanelOn;
    /* Wide: a ruled plate, in or out. Narrow: the bottom third of the picture
       goes down into the metal, so the type has ground rather than an edge. */
    float hold = inPanel * mix(1.0, smoothstep(0.0, 0.36, panel.y), narrow);

    /* ---- on a phone, the gilding comes off him ----

       A phone scroll had nothing to watch. The picture rose a few percent and a
       light crossed it, which is a screensaver, not an event — and this concept
       is called Gilded, which was a word nowhere in the picture.

       So on a narrow frame he starts as a gold statue: the duotone below,
       already computed for the grade, taken almost pure. Scrolling melts it off
       him from the head down and the photograph underneath comes through behind
       a hot rim, the way real gilding lifts. He is never absent, which is the
       whole reason it is a change of material rather than a dissolve — a hero
       whose subject is missing until you scroll is a hero with no subject.

       The front is the frame's own height roughened by the metal's grain, so
       the edge is torn rather than ruled, and the grain is not animated: a
       moving noise under a scroll-driven front makes the edge shimmer, and the
       edge is the thing being watched. */
    float melt = 1.0;
    float meltRim = 0.0;
    if (narrow > 0.5) {
      /* The grain is kept small deliberately. At a third of the frame height it
         smeared the front over a band that read as fog, and gilding does not
         fog — it lifts along an edge. Enough roughness to tear it, not enough
         to lose it. */
      float grain = fbm(uv * vec2(uAspect, 1.0) * 4.6);
      float field = uv.y + grain * 0.15 - 0.075;
      // From above the frame to below it, finished with a third of the scroll
      // left over, which is where the shaft of light takes it on.
      float front = mix(1.24, -0.12, clamp(uProgress / 0.68, 0.0, 1.0));
      melt = smoothstep(front - 0.07, front + 0.015, field);
      meltRim = exp(-pow((field - front) / 0.032, 2.0));
    }

    if (inPanel > 0.5 && uHasPhoto > 0.5) {
      /* Cover-fit inside the panel, with a slow rise as the page scrolls.

         The rise used to be a straight subtraction from the sample coordinate,
         which walked it off the top of the photograph: past the edge the sampler
         clamps, and the last row of pixels smears down the bottom of the plate as
         a hard dark band. So the plate is held slightly zoomed in and the rise is
         bounded by exactly the margin that zoom creates — it can never run out
         of picture. */
      float panelAspect = panelWidth * uAspect / panelHeight;
      const float zoom = 1.09;
      vec2 shot = (panel - 0.5) / zoom + 0.5;
      shot.y += (uProgress - 0.5) * (1.0 - 1.0 / zoom);

      float scale = panelAspect / uPhotoAspect;
      if (scale > 1.0) {
        shot.y = (shot.y - 0.5) / scale + 0.5;
      } else {
        shot.x = (shot.x - 0.5) * scale + 0.5;
      }
      shot = clamp(shot, vec2(0.0), vec2(1.0));

      vec3 photo = texture2D(uPhoto, shot).rgb;
      float l = grey(photo);
      // Lifted, then warmed toward the room's own light rather than regraded.
      vec3 lifted = pow(max(photo, vec3(0.0)), vec3(0.82)) * vec3(1.06, 0.99, 0.9);
      vec3 gilded = mix(uLacquer, uGoldDeep, smoothstep(0.05, 0.34, l));
      gilded = mix(gilded, uGold, smoothstep(0.3, 0.66, l));
      gilded = mix(gilded, uIvory, smoothstep(0.72, 0.99, l));
      /* Wide: one settled grade. Narrow: metal at the top of the scroll and
         photograph at the bottom of it, with the front travelling between. */
      float grade = mix(0.62, mix(0.04, 0.84, melt), narrow);
      vec3 framed = mix(gilded, lifted, grade) * 1.06;

      // Gold runs hotter while it is still on him.
      framed += uGold * (1.0 - melt) * narrow * 0.16;

      // The seam's light falls on him too.
      framed += uGoldLit * seam * 0.25;

      colour = mix(colour, framed, hold);
    }

    // The rim the gilding lifts along: the hottest gold in the frame, and the
    // only thing in it that is moving because you are scrolling.
    colour += mix(uGold, uIvory, 0.42) * meltRim * 0.8 * uPanelOn;

    /* A gold hairline around the panel, and a soft drop beneath it. Only where
       there is an edge to rule: on a phone the picture has no bottom, and a
       hairline drawn across the dissolve would put back the line the dissolve
       exists to remove. */
    float edgeX = min(abs(uv.x - left), abs(uv.x - right));
    float edgeY = min(abs(uv.y - top), abs(uv.y - bottom));
    float onVertical = step(top, uv.y) * step(uv.y, bottom) * exp(-pow(edgeX / 0.0016, 2.0));
    float onHorizontal = step(left, uv.x) * step(uv.x, right) * exp(-pow(edgeY / 0.0016, 2.0));
    colour += uGold * max(onVertical, onHorizontal) * 0.55 * uPanelOn * (1.0 - narrow);

    /* ---- a shaft of light, raking the plate ----

       A phone gets almost none of what makes this hero work on a desktop: the
       seam is pushed off to the side to keep clear of the type, the metal is
       mostly out of frame, and what is left is a photograph that shifts a little
       while some words change. So a narrow screen gets its own event instead, and
       it is the one this concert film is full of: a hard shaft of light swinging
       across the stage. It travels with the scroll, it crosses the photograph
       rather than avoiding it, and it takes the gold in the jacket with it. */
    if (narrow > 0.5) {
      // A diagonal in aspect-corrected space, swept by progress.
      vec2 q = (uv - vec2(0.5)) * vec2(uAspect, 1.0);
      float across = q.x * 0.82 + q.y * 0.57;
      float head = -0.62 + uProgress * 1.45;

      // The beam: a bright core inside a wide, soft spill.
      float core = exp(-pow((across - head) / 0.075, 2.0));
      float spill = exp(-pow((across - head) / 0.30, 2.0));

      // It falls off down the frame, the way a beam from the rig does.
      float reach = smoothstep(-0.15, 0.72, uv.y);

      colour += mix(uGold, uIvory, 0.35) * core * 0.38 * reach;
      colour += uGoldDeep * spill * 0.38 * reach;
      // And whatever it lands on lights up rather than merely being overlaid.
      colour *= 1.0 + spill * 0.48 * reach;

      /* Dust in the beam. There is always dust in a beam, and it is the single
         cheapest thing that makes a light look like it is in a room. */
      vec2 mote = vec2(uv.x * 190.0, uv.y * 130.0 - uTime * 0.30);
      float dust = smoothstep(0.9965, 1.0, hash(floor(mote)));
      colour += uIvory * dust * spill * 1.8 * reach;
    }

    /* ---- cursor light, room falloff, and the side the type sits on ---- */
    float pointer = 1.0 - smoothstep(0.0, 0.42, length((uv - uCursor) * vec2(uAspect, 1.0)));
    colour += uGoldDeep * pointer * 0.12;

    float vignette = 1.0 - smoothstep(0.44, 1.2, length((uv - vec2(0.5)) * vec2(uAspect * 0.8, 1.0)));
    colour *= 0.58 + 0.42 * vignette;

    /* The type sits at the left on a wide screen and along the floor on a narrow
       one, so the scrim follows it.

       On a phone the scrim runs *through* the plate rather than stopping at its
       edge. Excluding it there was the reason his name was unreadable: bright
       ivory type set straight onto a lit photograph of a man in a gold jacket.
       A picture that a caption sits on has to be darkened under the caption;
       that is true of every magazine ever printed. */
    float sideScrim = smoothstep(0.42, 0.0, uv.x) * (1.0 - narrow);
    /* The band the type occupies on a phone is the *lower* third of the plate,
       not the floor of the frame, so the scrim has to reach up into the picture
       that far. His face stays clear at the top of the plate; everything below
       it is taken down until ivory type on a lit stage photograph has somewhere
       to sit. */
    float baseScrim = smoothstep(0.86, 0.40, uv.y) * narrow;
    float scrim = max(sideScrim * (1.0 - inPanel), baseScrim);
    colour = mix(colour, uLacquer, scrim * 0.86);
    float floorScrim = smoothstep(0.22, 0.0, uv.y) * (1.0 - inPanel) * (1.0 - narrow);
    colour = mix(colour, uLacquer, floorScrim * 0.5);

    gl_FragColor = vec4(colour, 1.0);
  }
`;

function build({ canvas, reducedMotion }: SceneContext, panel: boolean): SceneHandle {
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
      uCursor: { value: new THREE.Vector2(0.3, 0.6) },
      uPanelOn: { value: panel ? 1 : 0 },
      uLacquer: { value: new THREE.Color("#150f0c") },
      uGoldDeep: { value: new THREE.Color("#6d4a12") },
      uGold: { value: new THREE.Color("#c99a45") },
      uGoldLit: { value: new THREE.Color("#f2cd7a") },
      uIvory: { value: new THREE.Color("#f7ecd6") },
    },
  });

  const loader = new THREE.TextureLoader();
  loader.load(photos.press.src, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
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

  const cursor = material.uniforms.uCursor.value as THREE.Vector2;
  const target = new THREE.Vector2(0.3, 0.6);
  const onPointer = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    target.set((event.clientX - box.left) / box.width, 1 - (event.clientY - box.top) / box.height);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  return {
    render(progress, elapsed, level) {
      material.uniforms.uProgress.value = progress;
      // The metal flows on its own clock. It used to be pushed by the amplitude
      // of whatever was playing, and that read as a gimmick, so the audio no
      // longer touches this scene's geometry at all.
      material.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      material.uniforms.uLevel.value = level;
      cursor.lerp(target, reducedMotion ? 1 : 0.05);
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

/** The hero: molten gold with him framed inside it. */
export function createPhoenixScene(context: SceneContext): SceneHandle {
  return build(context, true);
}

/**
 * The loader: the same room, without the portrait. Holding the whole hero up as
 * a loading screen showed the page before the page, and the name had to compete
 * with a photograph for the two seconds it was on screen.
 */
export function createPhoenixVeilScene(context: SceneContext): SceneHandle {
  return build(context, false);
}
