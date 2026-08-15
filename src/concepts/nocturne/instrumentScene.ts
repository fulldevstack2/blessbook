import * as THREE from "three";
import { instrument } from "../../lib/loadModel";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * The same instrument, on the stand under the lamp.
 *
 * Phoenix shows it as gold in a dark room and Dragon draws it in ink. Here it is
 * an object on a stage: one brass lamp above and slightly behind it, the velvet
 * of the house swallowing everything the lamp does not reach, and the whole
 * thing seen through the proscenium arch this concept looks at everything
 * through. Almost all of it is in shadow, which is the point. A house does not
 * floodlight the instrument; it puts one light on it.
 */

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vScreen;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    vec4 clip = projectionMatrix * viewMatrix * world;
    vScreen = clip.xy / clip.w * 0.5 + 0.5;
    gl_Position = clip;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uBrass;
  uniform vec3 uIvory;
  uniform vec3 uVelvet;
  uniform float uAspect;

  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vScreen;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);

    // One lamp, high and just behind the shoulder of the object.
    vec3 lamp = normalize(vec3(-0.32, 0.86, 0.38));
    float key = max(dot(n, lamp), 0.0);
    // Brass is metal, so most of what it shows is a tight reflection.
    float gloss = pow(max(dot(reflect(-lamp, n), v), 0.0), 44.0);
    // A rim off the house behind it, which is what lifts it off the velvet.
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.4);

    vec3 colour = uVelvet * 0.30;
    colour += uBrass * pow(key, 1.7) * 0.95;
    colour += uIvory * gloss * 0.85;
    colour += uBrass * rim * 0.42;

    /* The proscenium. Everything on this concept is seen through it, and the
       object is not going to be the exception. */
    vec2 a = vec2((vScreen.x - 0.5) * uAspect, vScreen.y);
    float halfWidth = 0.5 * uAspect * 0.9;
    float springLine = 0.58;
    float inside;
    if (vScreen.y <= springLine) {
      inside = 1.0 - smoothstep(halfWidth - 0.02, halfWidth, abs(a.x));
    } else {
      vec2 d = vec2(a.x, (a.y - springLine) * (halfWidth / max(0.001, 1.0 - springLine)));
      inside = 1.0 - smoothstep(halfWidth - 0.02, halfWidth, length(d));
    }
    colour *= inside;

    gl_FragColor = vec4(colour, 1.0);
  }
`;

export function createInstrumentScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x0d_05_07, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 2.6);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uBrass: { value: new THREE.Color("#e0aa5c") },
      uIvory: { value: new THREE.Color("#fff3dd") },
      uVelvet: { value: new THREE.Color("#3a1119") },
      uAspect: { value: 1 },
    },
  });

  const pivot = new THREE.Group();
  scene.add(pivot);

  let mesh: THREE.Mesh | null = null;
  let stopped = false;

  void instrument().then((geometry) => {
    if (!geometry || stopped) return;
    mesh = new THREE.Mesh(geometry, material);
    pivot.add(mesh);
  });

  return {
    render(progress, elapsed) {
      // A slow quarter turn, the way a thing on a stand is walked around.
      pivot.rotation.y = -0.5 + progress * 1.9;
      pivot.rotation.x = 0.2 - progress * 0.3;
      pivot.rotation.z = 0.1;
      if (!reducedMotion) pivot.rotation.y += Math.sin(elapsed * 0.17) * 0.02;
      renderer.render(scene, camera);
    },
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      const aspect = width / Math.max(1, height);
      camera.aspect = aspect;
      camera.position.z = aspect < 1 ? 3.8 : 2.6;
      camera.updateProjectionMatrix();
      material.uniforms.uAspect.value = aspect;
    },
    dispose() {
      stopped = true;
      if (mesh) pivot.remove(mesh);
      material.dispose();
      renderer.dispose();
    },
  };
}
