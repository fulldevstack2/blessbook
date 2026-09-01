import * as THREE from "three";
import { clients } from "../../content/clients";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * Who books him, engraved into a bar of gold.
 *
 * Two versions of this section were thrown away. A grid of logo masks read like
 * every "as featured in" strip on the web, and setting the names as a wall of
 * display type made a loud slab that fought everything around it. Both had the
 * same flaw: they were a list, laid out.
 *
 * This is an object instead. A solid gold cylinder lies across the page with the
 * names cut into its face, and scrolling rolls it — each name rises over the
 * crown, passes under the light, and goes down the far side. The engraving has a
 * bevel that catches the lamp on one edge and shadows on the other, which is how
 * you can tell cut metal from printed metal.
 *
 * The cylinder is not geometry. The band is one quad, and the shader solves the
 * surface: for each row of pixels it finds the angle on a cylinder that would
 * project there, and reads the names at that angle. Foreshortening at the top and
 * bottom edges therefore comes out exactly right, the silhouette is a hairline
 * rather than a polygon edge, and there is nothing to tessellate.
 */

/** Enough resolution that a name is crisp on a 4K display. */
const TEXTURE_W = 2048;
/* One name's cell has to have roughly the proportions it will be seen at, or
   the letters arrive stretched. A bar 1440 wide showing 1.25 names across a
   270-tall face gives a cell of about 1440 x 216, so 6.7 to 1.

   How many names the face shows is then derived from this in the shader rather
   than fixed: the face always spans the bar's full height, so on a phone, where
   the bar is far less wide relative to its depth, a constant stacks three
   half-cropped names on top of each other. Clamped, so an extreme viewport
   cannot turn the object back into a list. */
const CELL_ASPECT = 6.7;
const LINE_H = Math.round(TEXTURE_W / CELL_ASPECT);

/** The concept's own display face, which is what the rest of the page is set in. */
const PLATE_FACE = '"Bodoni Moda", Georgia, serif';

function paint(context: CanvasRenderingContext2D): void {
  context.fillStyle = "#000000";
  context.fillRect(0, 0, TEXTURE_W, LINE_H * clients.length);

  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const MEASURE = TEXTURE_W * 0.86;

  clients.forEach((client, index) => {
    const name = client.name.toUpperCase();
    // Set it large, then bring it back until it fits the plate. An engraver
    // sizes the letter to the plate, never the plate to the letter.
    let size = LINE_H * 0.5;
    for (let attempt = 0; attempt < 14; attempt += 1) {
      context.letterSpacing = `${Math.round(size * 0.14)}px`;
      context.font = `${size}px ${PLATE_FACE}`;
      if (context.measureText(name).width <= MEASURE) break;
      size *= 0.94;
    }
    context.fillText(name, TEXTURE_W / 2, LINE_H * (index + 0.5));
  });
}

function engraving(): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_W;
  canvas.height = LINE_H * clients.length;
  const context = canvas.getContext("2d");
  if (!context) return null;

  paint(context);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  /* Canvas does not wait for a webfont: ask it to draw in a face that has not
     arrived and it quietly substitutes one that has, which is why these names
     were being cut in Georgia while the rest of the page was set in Bodoni Moda.
     Draw once so the bar is never blank, then draw again once the real face is
     in and hand the texture back to the GPU. */
  void document.fonts
    ?.load(`${Math.round(LINE_H * 0.5)}px ${PLATE_FACE}`)
    .then(() => document.fonts.ready)
    .then(() => {
      paint(context);
      texture.needsUpdate = true;
    })
    .catch(() => undefined);

  return texture;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uNames;
  uniform float uRoll;
  uniform float uAspect;
  uniform float uTime;
  uniform float uNames_;
  uniform float uCell;
  uniform vec3 uGold;
  uniform vec3 uGoldDeep;
  uniform vec3 uIvory;
  uniform vec3 uLacquer;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // Across the band, -1 at the bottom edge, +1 at the top.
    float y = vUv.y * 2.0 - 1.0;
    float edge = 1.0 - abs(y);

    // Off the cylinder entirely: the room behind it.
    if (edge <= 0.0) {
      gl_FragColor = vec4(uLacquer, 1.0);
      return;
    }

    /* The surface. A point at screen height y sits at angle asin(y) on a
       cylinder of radius one, so the arc coordinate — and with it every bit of
       foreshortening near the edges — falls straight out of the geometry. */
    float theta = asin(clamp(y, -1.0, 1.0));
    float depth = cos(theta);
    vec3 normal = vec3(0.0, sin(theta), depth);

    /* Where on the roll this pixel is, counted in names. The visible face holds
       about one and a quarter of them, so a name is legible while it passes and
       the next is already coming over the crown. */
    float v = theta / 3.14159265 + 0.5;
    float face = clamp(uCell / max(uAspect, 0.001), 1.05, 1.7);
    /* The roll dwells on each name and flicks between them, so scrolling feels
       like it is stopping at every company rather than sliding past them. Done
       by easing the fractional part rather than by CSS scroll snapping, which
       would fight the page's own weighted scrolling. */
    /* A name occupies row i to i+1 in the texture, so it is centred on the face
       when this reads i + 0.5. Dwelling on whole numbers rested the bar on the
       gap between two names instead, which is why it kept stopping on nothing.
       The half shifts the rest points onto the names themselves. */
    /* A name occupies row i to i+1 in the texture, so it is centred on the face
       when this reads i + 0.5. Dwelling on whole numbers rested the bar on the
       gap between two names instead, which is why it kept stopping on nothing.
       The half shifts the rest points onto the names themselves.

       The turn takes most of each name's share of the scroll and eases in and
       out of it, so the bar is visibly rotating rather than cutting: a short
       hold on the name, a long smooth quarter-turn, another hold. A narrow band
       here reads as a jump cut, which is not what a heavy object does. */
    float turned = uRoll * uNames_ - 0.5;
    float step_ = clamp((fract(turned) - 0.14) / 0.72, 0.0, 1.0);
    // Quintic, so the acceleration itself is continuous and nothing snaps.
    float eased = step_ * step_ * step_ * (step_ * (step_ * 6.0 - 15.0) + 10.0);
    float held = floor(turned) + eased + 0.5;
    float names = held + (v - 0.5) * face;
    float row = names / uNames_;
    vec2 at = vec2(vUv.x, fract(row));

    /* The cut, and its walls.

       Sampling one offset above and one below gave a thick band of light under
       every stroke and a thick band of dark over it, which reads as a drop
       shadow rather than as metal that has been cut into. A wall is a direction,
       not an offset: the gradient of the mask says which way each wall faces,
       and that is what decides whether it catches the light or hides from it.
       Shadow at the top left, catch at the bottom right, which is how incised
       lettering has been cut since Trajan. */
    float bevelV = 0.013 / uNames_ / max(depth, 0.3);
    float bevelU = 0.0015 / max(depth, 0.3);

    float cut = texture2D(uNames, at).r;
    float up = texture2D(uNames, vec2(at.x, fract(row + bevelV))).r;
    float down = texture2D(uNames, vec2(at.x, fract(row - bevelV))).r;
    float left = texture2D(uNames, vec2(at.x - bevelU, at.y)).r;
    float right = texture2D(uNames, vec2(at.x + bevelU, at.y)).r;

    vec2 wallGrad = vec2(right - left, up - down);
    float wall = clamp(length(wallGrad), 0.0, 1.0);
    vec2 wallDir = wallGrad / max(length(wallGrad), 0.0001);
    /* Light travels down and to the right. In a groove that lights the wall on
       the *left* of each stroke, which faces right into the cut, and shadows the
       wall on the right. Getting this sign backwards is what makes incised type
       look raised, and it was backwards. */
    float facing = dot(wallDir, normalize(vec2(0.45, -0.9)));

    /* Gold, as a reflection rather than as a colour.

       Shading this with a diffuse term gave a flat orange ramp, and a flat
       orange ramp is what a plastic tube looks like. Metal has almost no diffuse
       component: what you see in it is the room. So the surface angle indexes a
       little environment instead — a dark ceiling, one hard lamp, a broad sky,
       a shadowed band, and a warm bounce up off the floor — and the gold tint is
       applied to that. The highlight goes pale rather than more orange, which is
       the single thing that separates gold from brass on a screen. */
    float t = theta / 1.5707963;

    float env = 0.09;
    env += 1.45 * exp(-pow((t - 0.34) / 0.085, 2.0));   // the lamp itself
    env += 0.42 * exp(-pow((t - 0.02) / 0.26, 2.0));    // the room above it
    env += 0.34 * exp(-pow((t + 0.66) / 0.20, 2.0));    // bounce off the floor
    env *= 1.0 - 0.62 * smoothstep(0.50, 1.0, t);       // and the dark ceiling

    /* A bar is not a perfect extrusion. Very low-frequency variation along its
       length keeps the reflection from being the same pixel column repeated. */
    float along = hash(vec2(floor(vUv.x * 7.0), 3.0));
    env *= 0.93 + 0.14 * along;
    env *= 0.97 + 0.06 * hash(vec2(floor(vUv.x * 31.0), 9.0));

    // Brushed, not scanlined: fine marks that vary in weight down the bar.
    float grain = hash(vec2(floor(vUv.x * 1700.0), 1.0));
    float polish = (grain - 0.5) * (0.035 + 0.03 * along);

    float lambert = clamp(env, 0.0, 1.0);
    vec3 metal = mix(uGoldDeep * 0.26, uGold, lambert);
    // The hot part of the reflection loses its colour, the way real gold does.
    metal = mix(metal, uIvory, clamp(env - 1.05, 0.0, 1.0) * 0.85);
    metal *= 1.0 + polish;

    /* Into the cut: darker, and the light that does reach it is redder. Not
       black: a groove in gold is still gold, and near-black interiors were half
       of why the letters looked pasted on. */
    /* Engraving fades into the curve at both rims rather than being sliced off
       by them, so a name arrives out of the roll instead of appearing already
       cut in half. */
    float onFace = smoothstep(0.0, 0.20, edge);

    vec3 sunk = mix(metal * 0.40, uGoldDeep * 0.66, lambert);
    vec3 colour = mix(metal, sunk, cut * onFace);
    // A narrow catch rather than a broad one: a cut wall is a facet, not a fade.
    float catches = pow(max(facing, 0.0), 1.5);
    float hides = pow(max(-facing, 0.0), 1.2);
    colour += mix(uGold, uIvory, 0.45) * wall * catches * 0.46 * onFace * (0.5 + lambert);
    colour *= 1.0 - wall * hides * 0.5 * onFace;
    // And the groove is darker where it is deepest, close to its own walls.
    colour *= 1.0 - cut * wall * 0.22 * onFace;

    /* The silhouette. A cylinder reads as round because both of its edges catch
       a hairline: the top one bright and cool, the bottom one a dim warm rim off
       whatever it is standing on. */
    colour += uIvory * smoothstep(0.055, 0.0, edge) * smoothstep(0.0, 0.4, y) * 0.62;
    colour += uGold * smoothstep(0.035, 0.0, edge) * smoothstep(0.0, -0.4, y) * 0.30;
    colour *= 1.0 - smoothstep(0.16, 0.02, edge) * smoothstep(0.0, -0.6, y) * 0.45;

    // And the bar sits in the room rather than being cut out of it.
    colour = mix(uLacquer, colour, smoothstep(0.0, 0.012, edge));

    gl_FragColor = vec4(colour, 1.0);
  }
`;

export function createBandScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setClearColor(0x140f0a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const names = engraving();

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uNames: { value: names },
      uNames_: { value: clients.length },
      uCell: { value: CELL_ASPECT },
      uRoll: { value: 0 },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uGold: { value: new THREE.Color("#e2b45f") },
      uGoldDeep: { value: new THREE.Color("#8a5f21") },
      uIvory: { value: new THREE.Color("#fbf1dc") },
      uLacquer: { value: new THREE.Color("#140f0a") },
    },
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  return {
    render(progress, elapsed) {
      // A whole turn and a bit across the pinned track, so every name passes the
      // light and the last one is still arriving as the section leaves.
      // Every name passes the light across the pinned track, with a little of
      // the next one still arriving as the section leaves.
      material.uniforms.uRoll.value = reducedMotion ? 0.5 : progress * 1.04;
      material.uniforms.uTime.value = elapsed;
      renderer.render(scene, camera);
    },
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      material.uniforms.uAspect.value = width / Math.max(1, height);
    },
    dispose() {
      names?.dispose();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
