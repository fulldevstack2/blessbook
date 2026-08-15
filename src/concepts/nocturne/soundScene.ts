import * as THREE from "three";
import { waveform } from "../../content/waveform";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * Forty seconds of that night, built as a room and walked down.
 *
 * Every pipe is one measured peak of the recording of The Journey played live on
 * the Phoenix on 22 October 2016 — see `tools/waveform.mjs`. Where he leans on
 * the bow the rank stands tall; where he lifts it, it drops away to nothing. The
 * page travels between two ranks of them at the speed of the take, so scrolling
 * is moving through the performance rather than past a picture of one.
 *
 * It was a twisting ribbon first, and a ribbon was wrong twice over. One large
 * smooth surface in a dark room has no silhouette, so it filled the frame as a
 * flat orange wedge and read as a graph that had been shaded in; and a graph is
 * the one thing this concept must not be, because the concept is a hall. Many
 * small hard objects are the opposite: each one is a clean edge against black,
 * the rank makes a skyline, and the skyline is the music. An organ front is also
 * simply what a room like this has in it, so the picture explains itself without
 * a caption — which is the test any of this has to pass.
 *
 * The floor is not modelled. The second rank below the line is the same
 * instances mirrored and dimmed, which is what a polished floor does anyway, and
 * costs one more draw call rather than a render target.
 *
 * Press play and it stops being a recording of a night and becomes that night:
 * `uLevel` is the live signal off the same audio the pipes were measured from,
 * so the brass answers on the beat it was cut from.
 */

const COUNT = waveform.length;
/** World units between pipes. At this spacing a rank reads as one comb. */
const STEP = 0.085;
/** Half the width of the nave — the camera travels between the two ranks. */
const NAVE = 1.62;
const FLOOR = -1.15;
const RADIUS = 0.03;
const SHORTEST = 0.14;
const TALLEST = 2.5;
/** How far ahead the camera looks, in pipes. Sets how much length is in frame. */
const AHEAD = 120;
/** Pipes held back at each end so the camera never runs off the rank. */
const MARGIN = 40;

/** The nave's own slow wander, so it is a room rather than a tunnel. */
function swayAt(i: number): number {
  return Math.sin(i * 0.0042) * 0.34;
}

/**
 * A pipe's height. The exponent lifts the quiet passages off the floor: raw
 * peaks put two thirds of the take under an inch and the rank went flat wherever
 * he played softly, which is exactly where the playing is worth looking at.
 */
function heightAt(i: number): number {
  return SHORTEST + Math.pow(waveform[i] ?? 0, 0.72) * TALLEST;
}

const vertexShader = /* glsl */ `
  attribute float aTall;

  varying vec3 vNormal;
  varying vec3 vView;
  varying float vUp;
  varying float vTall;
  varying float vDepth;

  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vec4 view = viewMatrix * world;

    /* The pipes are scaled along their own axis only, and a cylinder's side
       normals are horizontal, so the instance scale never tilts them. */
    vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    // 0 at the foot of the pipe, 1 at its lip.
    vUp = position.y + 0.5;
    vTall = aTall;
    vDepth = -view.z;

    gl_Position = projectionMatrix * view;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uBrass;
  uniform vec3 uGold;
  uniform vec3 uVelvet;
  uniform float uLevel;
  uniform float uMirror;

  varying vec3 vNormal;
  varying vec3 vView;
  varying float vUp;
  varying float vTall;
  varying float vDepth;

  void main() {
    vec3 normal = normalize(vNormal);
    float facing = abs(dot(normal, vView));

    // Turned metal: dark down the middle of each pipe, bright round the shoulder.
    float round = pow(1.0 - facing, 2.2);
    vec3 colour = mix(uBrass * 0.2, uGold, round);

    /* Lit from above, the way a house lights its own front. The lip of a pipe
       is the brightest thing on it and the foot is in shadow, and the taller the
       pipe the further into the light it reaches. */
    float rise = pow(vUp, 1.5);
    colour += uGold * rise * (0.34 + vTall * 0.5);
    colour *= 0.24 + rise * 0.9;

    // The lamp travels with the camera; ahead and behind are both velvet.
    float lamp = 1.0 - smoothstep(5.0, 26.0, vDepth);
    lamp *= smoothstep(0.5, 3.5, vDepth);
    colour *= 0.16 + lamp * 1.4;

    // While he is playing, the brass answers the signal it was measured from.
    colour += uGold * rise * vTall * uLevel * 0.85;

    // A polished floor returns a fraction of the light and none of the detail.
    colour *= uMirror;

    float fog = 1.0 - smoothstep(13.0, 34.0, vDepth);
    colour = mix(uVelvet, colour, fog);

    gl_FragColor = vec4(colour, 1.0);
  }
`;

export function createSoundScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x0a_04_06, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.05, 60);

  const uniforms = {
    uBrass: { value: new THREE.Color("#7d4f1a") },
    uGold: { value: new THREE.Color("#f2c680") },
    uVelvet: { value: new THREE.Color("#0a0406") },
    uLevel: { value: 0 },
    uMirror: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  const reflected = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { ...uniforms, uMirror: { value: 0.26 } },
  });

  // Twelve sides: the silhouette is what carries, and the shading is broad.
  const pipe = new THREE.CylinderGeometry(RADIUS, RADIUS, 1, 12, 1, true);

  const total = COUNT * 2;
  const tall = new Float32Array(total);
  const standing = new THREE.InstancedMesh(pipe, material, total);
  const mirror = new THREE.InstancedMesh(pipe, reflected, total);

  const place = new THREE.Matrix4();
  const scale = new THREE.Vector3();
  const at = new THREE.Vector3();
  const still = new THREE.Quaternion();

  for (let i = 0; i < COUNT; i += 1) {
    const height = heightAt(i);
    const z = -i * STEP;
    const sway = swayAt(i);

    for (let rank = 0; rank < 2; rank += 1) {
      const index = i * 2 + rank;
      const x = sway + (rank === 0 ? -NAVE : NAVE);

      scale.set(1, height, 1);
      at.set(x, FLOOR + height / 2, z);
      place.compose(at, still, scale);
      standing.setMatrixAt(index, place);

      // The same pipe hanging under the floor, which is all a reflection is.
      at.set(x, FLOOR - height / 2, z);
      place.compose(at, still, scale);
      mirror.setMatrixAt(index, place);

      tall[index] = (height - SHORTEST) / TALLEST;
    }
  }

  const tallness = new THREE.InstancedBufferAttribute(tall, 1);
  pipe.setAttribute("aTall", tallness);
  standing.instanceMatrix.needsUpdate = true;
  mirror.instanceMatrix.needsUpdate = true;
  scene.add(standing, mirror);

  const eye = new THREE.Vector3();
  const target = new THREE.Vector3();

  return {
    render(progress, elapsed, level) {
      const head = MARGIN + progress * (COUNT - AHEAD - MARGIN * 2);

      /* Below the lips and just off the centre line: dead centre in a symmetric
         colonnade is a diagram of one, and the rank on the near side has to be
         close enough to pass. */
      const lean = reducedMotion ? 0 : Math.sin(elapsed * 0.19) * 0.16;
      eye.set(swayAt(head) + 0.34 + lean, -0.46, -head * STEP);
      target.set(swayAt(head + AHEAD) - 0.1, -0.2, -(head + AHEAD) * STEP);
      camera.position.copy(eye);
      camera.lookAt(target);

      // Eased rather than tracked exactly: brass has weight, a signal does not.
      const lit = material.uniforms.uLevel;
      lit.value += (level - lit.value) * 0.18;
      reflected.uniforms.uLevel.value = lit.value;

      renderer.render(scene, camera);
    },
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      // A narrow frame sees less of the nave, so it is given a wider lens.
      camera.fov = camera.aspect < 1 ? 70 : 52;
      camera.updateProjectionMatrix();
    },
    dispose() {
      pipe.dispose();
      material.dispose();
      reflected.dispose();
      renderer.dispose();
    },
  };
}
