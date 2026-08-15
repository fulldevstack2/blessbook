import * as THREE from "three";
import { instrument } from "../../lib/loadModel";
import type { SceneContext, SceneHandle } from "../../lib/SceneCanvas";

/**
 * The Phoenix itself, in gold, turning under one lamp.
 *
 * The page had been describing this instrument for six movements without ever
 * showing it as an object: a photograph of it is a picture of a thing, and the
 * whole argument of the concept is that it *is* a thing, drawn by him and cut by
 * a maker in Donegal. So here it is, and the scroll turns it.
 *
 * Gold is not a colour, it is a reflection, so there is no diffuse light in
 * here at all. The environment is a small procedural one built in the shader —
 * a dark room, one hard key over the shoulder, a warm bounce off the floor —
 * and the surface samples it by its own normal. That is what makes metal look
 * like metal rather than like orange plastic, and it costs one texture lookup
 * less than a real environment map.
 */

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uGold;
  uniform vec3 uGoldDeep;
  uniform vec3 uIvory;
  uniform vec3 uLacquer;
  uniform float uSweep;

  varying vec3 vNormal;
  varying vec3 vView;

  /* The room the gold is standing in, as a function of which way it faces. */
  vec3 room(vec3 dir) {
    float up = dir.y;

    float ambient = 0.10;
    // One hard key, high and over the left shoulder, and a second, softer one
    // opposite it so the far side of the body is modelled rather than lost.
    float key = pow(max(dot(dir, normalize(vec3(-0.45, 0.78, 0.44))), 0.0), 34.0) * 4.2;
    key += pow(max(dot(dir, normalize(vec3(0.72, 0.30, -0.30))), 0.0), 20.0) * 1.1;
    // The broad soft light it sits under.
    float sky = pow(max(up, 0.0), 1.5) * 0.58;
    // And what comes back off the floor, which is what stops the underside
    // going dead black and is most of why gold reads as gold.
    float floorBounce = pow(max(-up, 0.0), 2.0) * 0.42;

    float energy = ambient + key + sky + floorBounce;
    vec3 tint = mix(uGoldDeep, uGold, clamp(energy, 0.0, 1.0));
    // The hot part of a reflection loses its colour rather than gaining more.
    return mix(tint, uIvory, clamp(energy - 1.1, 0.0, 1.0) * 0.85) * (0.35 + energy);
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);

    vec3 colour = room(reflect(-v, n));

    // A grazing rim, which is what separates a gold edge from the dark behind it.
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    colour += uGold * rim * 0.62;

    /* And a band of light travelling along the body as the page moves, so the
       object is being *looked at* rather than merely spun. */
    float band = exp(-pow((n.y - (uSweep * 2.0 - 1.0)) / 0.22, 2.0));
    colour += uIvory * band * 0.14;

    colour = mix(uLacquer, colour, 0.94);
    gl_FragColor = vec4(colour, 1.0);
  }
`;

export function createInstrumentScene({ canvas, reducedMotion }: SceneContext): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x14_0f_0a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(0, 0, 2.35);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uGold: { value: new THREE.Color("#ffd581") },
      uGoldDeep: { value: new THREE.Color("#6b4a17") },
      uIvory: { value: new THREE.Color("#fff6e2") },
      uLacquer: { value: new THREE.Color("#140f0a") },
      uSweep: { value: 0 },
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
      /* It comes in at an angle, turns most of the way round while it is read,
         and settles. Never a full spin: a spinning object is a product viewer,
         and this is a portrait. */
      const turn = -0.85 + progress * 2.5;
      pivot.rotation.y = turn;
      pivot.rotation.z = -0.16 + Math.sin(progress * Math.PI) * 0.1;
      pivot.rotation.x = 0.12 - progress * 0.24;
      if (!reducedMotion) pivot.rotation.y += Math.sin(elapsed * 0.22) * 0.03;

      material.uniforms.uSweep.value = progress;
      renderer.render(scene, camera);
    },
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      // Narrow frames need the object further away or it is cropped by the sides.
      /* Closer than it used to be. The mesh is normalised on its longest axis,
         and with the display stand cut away that axis is the wingspan, so the
         object is now wide and shallow and was sitting in a lot of black. */
      camera.position.z = camera.aspect < 1 ? 3.0 : 1.95;
      camera.updateProjectionMatrix();
    },
    dispose() {
      stopped = true;
      if (mesh) pivot.remove(mesh);
      material.dispose();
      renderer.dispose();
    },
  };
}
