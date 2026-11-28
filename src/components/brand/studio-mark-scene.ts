import {
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
  type BufferGeometry,
  type Texture,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createFrameGate } from "@/lib/render-quality";
import { sharpenEmblemTextures } from "./emblem-textures";

export type MarkPlayer = {
  setRunning: (running: boolean) => void;
  faceFront: () => void;
  setHover: (hover: boolean) => void;
  turnBy: (radians: number) => void;
  dispose: () => void;
};

function releaseModel(model: Group) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<MeshStandardMaterial>();
  const textures = new Set<Texture>();
  model.traverse((part) => {
    if (!(part instanceof Mesh)) return;
    geometries.add(part.geometry);
    for (const material of Array.isArray(part.material)
      ? part.material
      : [part.material]) {
      materials.add(material);
      if (material.map) textures.add(material.map);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  for (const texture of textures) {
    texture.dispose();
    if (
      typeof ImageBitmap !== "undefined" &&
      texture.image instanceof ImageBitmap
    ) {
      texture.image.close();
    }
  }
}

/** Mount the studio emblem and return controls for visibility, motion preference and teardown. */
export async function createStudioMark(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
): Promise<MarkPlayer> {
  const response = await fetch("/brand/studio-emblem.glb", { signal });
  if (!response.ok) throw new Error("Studio emblem could not be loaded.");
  const bytes = await response.arrayBuffer();
  signal.throwIfAborted();
  const { scene: model } = await new GLTFLoader().parseAsync(bytes, "");
  const monogram = model.getObjectByName("Monogram");
  const globe = model.getObjectByName("Globe");
  if (!monogram || !globe) {
    releaseModel(model);
    throw new Error(
      "The studio emblem needs separate monogram and globe pivots.",
    );
  }
  const letters = monogram;
  const world = globe;
  let renderer: WebGLRenderer;
  try {
    signal.throwIfAborted();
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      // The mark is a small canvas, so it keeps full edge quality even when
      // WebGL is drawn in software.
      antialias: true,
      powerPreference: "low-power",
    });
  } catch (error) {
    releaseModel(model);
    throw error;
  }

  const scene = new Scene();
  const camera = new OrthographicCamera(-1.32, 1.32, 1.32, -1.32, 0.1, 12);
  camera.position.set(0, 0.06, 5);
  camera.lookAt(0, 0, 0);
  const key = new DirectionalLight(0xffedc8, 2.7);
  key.position.set(-3, 4, 5);
  const rim = new DirectionalLight(0xffe4ac, 2.1);
  rim.position.set(3, 1, -3);
  scene.add(model, key, rim, new HemisphereLight(0xfff3d5, 0x78644e, 1.9));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0, 0);
  // Draw at least twice the CSS size so the lettering stays crisp on 1x screens.
  renderer.setPixelRatio(
    Math.min(Math.max(window.devicePixelRatio || 1, 2), 3),
  );
  sharpenEmblemTextures(model, renderer);
  // Only the globe turns by itself. The monogram keeps the angle chosen by the visitor.
  letters.rotation.order = "XYZ";
  let targetTilt = 0;

  let running = false;
  let lost = false;
  let previous = 0;
  function draw() {
    if (lost) return;
    renderer.render(scene, camera);
    canvas.dataset.ready = "true";
  }
  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(Math.ceil(width), Math.ceil(height), false);
    camera.left = (-1.32 * width) / height;
    camera.right = -camera.left;
    camera.updateProjectionMatrix();
    draw();
  }
  // Software rendering draws at 30 fps; skipped frames keep their time for the next.
  const gate = createFrameGate();
  function frame(time: number) {
    if (!gate(time)) return;
    // Cap the delta after a sleeping tab so the emblem resumes at its last angle.
    const elapsed = Math.max(0, Math.min(time - previous, 60));
    previous = time;
    world.rotation.y += elapsed * ((2 * Math.PI) / 19000);
    letters.rotation.x +=
      (targetTilt - letters.rotation.x) * (1 - Math.exp(-elapsed / 130));
    draw();
  }
  function setRunning(next: boolean) {
    running = next;
    previous = performance.now();
    renderer.setAnimationLoop(running && !lost ? frame : null);
  }
  function contextLost() {
    lost = true;
    renderer.setAnimationLoop(null);
    delete canvas.dataset.ready;
  }
  function contextRestored() {
    lost = false;
    resize();
    setRunning(running);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  resize();
  return {
    setRunning,
    faceFront() {
      letters.rotation.y = 0;
      draw();
    },
    setHover(hover) {
      targetTilt = hover ? -0.2 : 0;
    },
    turnBy(radians) {
      letters.rotation.y += radians;
      draw();
    },
    dispose() {
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      renderer.setAnimationLoop(null);
      releaseModel(model);
      renderer.dispose();
      delete canvas.dataset.ready;
    },
  };
}
