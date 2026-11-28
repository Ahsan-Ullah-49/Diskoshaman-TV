import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  canvasPixelRatio,
  createFrameGate,
  wantsAntialias,
} from "@/lib/render-quality";
import { sharpenEmblemTextures } from "./emblem-textures";

export type OrbitEmblemScene = {
  setRunning: (running: boolean) => void;
  /** Lean toward a pointer given across the stage from -0.5 to 0.5. */
  aim: (x: number, y: number) => void;
  dispose: () => void;
};

const turnSpeed = (Math.PI * 2) / 16;

function releaseModel(model: THREE.Object3D) {
  model.traverse((part) => {
    if (!(part instanceof THREE.Mesh)) return;
    part.geometry.dispose();
    for (const material of [part.material].flat()) {
      material.map?.dispose();
      material.dispose();
    }
  });
}

/**
 * The studio emblem turning on its own, as on the front of the home page
 * camera: the DS monogram and the globe share one turntable on the globe's
 * axis so they turn as a single piece over the still motto. A fine pointer
 * tilts it and speeds the turn. The caller owns disposal.
 */
export async function mountOrbitEmblem(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
): Promise<OrbitEmblemScene> {
  const response = await fetch("/brand/studio-emblem.glb", { signal });
  if (!response.ok) throw new Error("Studio emblem could not be loaded.");
  const bytes = await response.arrayBuffer();
  signal.throwIfAborted();
  const { scene: model } = await new GLTFLoader().parseAsync(bytes, "");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: wantsAntialias(),
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(canvasPixelRatio(2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0, 0);
  sharpenEmblemTextures(model, renderer);

  // Centre the model and fit it to a unit-high frame.
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const centre = bounds.getCenter(new THREE.Vector3());
  model.position.sub(centre);
  const holder = new THREE.Group();
  holder.scale.setScalar(1 / Math.max(size.x, size.y));
  holder.add(model);

  const turntable = new THREE.Group();
  model.add(turntable);
  ["Monogram", "Globe"]
    .map((name) => model.getObjectByName(name))
    .filter((part): part is THREE.Object3D => Boolean(part))
    .forEach((part) => turntable.attach(part));

  const scene = new THREE.Scene();
  const tilt = new THREE.Group();
  tilt.add(holder);
  scene.add(tilt);
  const key = new THREE.DirectionalLight(0xffedc8, 2.7);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0xffe4ac, 2.1);
  rim.position.set(3, 1, -3);
  scene.add(key, rim, new THREE.HemisphereLight(0xfff3d5, 0x78644e, 1.9));

  const view = new THREE.PerspectiveCamera(24, 1, 0.1, 20);
  view.position.set(0, 0.02, 2.6);
  view.lookAt(0, 0, 0);

  let running = false;
  let lost = false;
  let previous = performance.now();
  let targetX = 0;
  let targetY = 0;
  let leanX = 0;
  let leanY = 0;

  function draw() {
    if (!lost) renderer.render(scene, view);
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    view.aspect = width / height;
    view.updateProjectionMatrix();
    draw();
  }

  // Software rendering draws at 30 fps.
  const gate = createFrameGate();
  function frame(time: number) {
    if (!gate(time)) return;
    // Cap the step after a sleeping tab so the turn resumes where it was.
    const elapsed = Math.min(time - previous, 60) / 1000;
    previous = time;
    const pointed = Math.hypot(targetX, targetY) > 0.001 ? 1 : 0;
    turntable.rotation.y += elapsed * turnSpeed * (1 + pointed * 1.4);
    const ease = 1 - Math.exp(-elapsed * 3);
    leanX += (targetX - leanX) * ease;
    leanY += (targetY - leanY) * ease;
    tilt.rotation.y = leanX * 0.5;
    tilt.rotation.x = leanY * 0.35;
    draw();
  }

  function contextLost(event: Event) {
    event.preventDefault();
    lost = true;
    renderer.setAnimationLoop(null);
  }

  function contextRestored() {
    lost = false;
    resize();
    if (running) renderer.setAnimationLoop(frame);
  }

  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  // Start three-quarters on so the first still frame shows depth.
  turntable.rotation.y = -0.5;
  resize();

  return {
    setRunning(next) {
      running = next;
      previous = performance.now();
      renderer.setAnimationLoop(running && !lost ? frame : null);
      if (!running) draw();
    },
    aim(x, y) {
      targetX = x;
      targetY = y;
    },
    dispose() {
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      renderer.setAnimationLoop(null);
      releaseModel(model);
      renderer.dispose();
    },
  };
}
