import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  canvasPixelRatio,
  createFrameGate,
  isSoftwareRenderer,
  wantsAntialias,
} from "@/lib/render-quality";
import { surfaceMaterial } from "./scene-materials";

export type FooterDepthScene = {
  setRunning: (running: boolean) => void;
  /** Lean the view toward the pointer, given across the area from -0.5 to 0.5. */
  aim: (x: number, y: number) => void;
  dispose: () => void;
};

type Drifter = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  spin: THREE.Vector3;
  rise: number;
  scale: number;
};

const background = "#070607";
// Positions across and up the frame are fractions of the visible area at
// each depth, so the field fills a wide desktop footer and a tall phone alike.
const fieldWidth = 1.15;
const fieldHeight = 1.3;
const nearZ = 1.5;
const farZ = -18;

function scatter(count: number, scaleRange: [number, number]): Drifter[] {
  return Array.from({ length: count }, () => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * fieldWidth,
      (Math.random() - 0.5) * fieldHeight,
      farZ + Math.random() * (nearZ - farZ),
    ),
    rotation: new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    ),
    spin: new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.3,
    ),
    rise: 0.012 + Math.random() * 0.02,
    scale: scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]),
  }));
}

/**
 * A deep, quiet space of studio objects: polished gold rings, black glass
 * blocks and small gold beads drift upward and turn slowly, fading into fog
 * with distance. The view leans toward a fine pointer. The caller owns
 * disposal.
 */
export async function mountFooterDepth(
  stage: HTMLElement,
  canvas: HTMLCanvasElement,
): Promise<FooterDepthScene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: wantsAntialias(),
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(canvasPixelRatio(1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(background, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(background, 7, 24);
  const environment = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // A smaller reflection map in software keeps the first build from freezing the page.
  scene.environment = environment.fromScene(room, 0.04, 0.1, 100, {
    size: isSoftwareRenderer() ? 64 : 256,
  }).texture;
  scene.environmentIntensity = 0.55;
  room.dispose?.();

  const view = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  view.position.set(0, 0, 8);

  const key = new THREE.DirectionalLight("#ffd9a0", 2.2);
  key.position.set(-4, 5, 6);
  const rim = new THREE.DirectionalLight("#cfd8ff", 1.2);
  rim.position.set(5, -2, -4);
  scene.add(key, rim);

  const gold = new THREE.MeshStandardMaterial({
    color: "#d8a238",
    metalness: 1,
    roughness: 0.24,
  });
  const glass = surfaceMaterial({
    color: "#0b0b0d",
    metalness: 0.2,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  const bead = new THREE.MeshStandardMaterial({
    color: "#f1d08a",
    metalness: 0.9,
    roughness: 0.3,
    emissive: "#6b4410",
    emissiveIntensity: 0.4,
  });

  const groups = [
    {
      mesh: new THREE.InstancedMesh(
        new THREE.TorusGeometry(0.55, 0.055, 16, 64),
        gold,
        18,
      ),
      drifters: scatter(18, [0.6, 1.3]),
    },
    {
      mesh: new THREE.InstancedMesh(
        new RoundedBoxGeometry(0.8, 0.8, 0.8, 3, 0.08),
        glass,
        16,
      ),
      drifters: scatter(16, [0.5, 1.1]),
    },
    {
      mesh: new THREE.InstancedMesh(
        new THREE.IcosahedronGeometry(0.16, 2),
        bead,
        34,
      ),
      drifters: scatter(34, [0.6, 1.4]),
    },
  ];
  groups.forEach(({ mesh }) => scene.add(mesh));

  const slot = new THREE.Object3D();
  function place(elapsed: number) {
    for (const { mesh, drifters } of groups) {
      drifters.forEach((drifter, index) => {
        drifter.position.y += drifter.rise * elapsed;
        // Objects that float off the top return from below.
        if (drifter.position.y > fieldHeight / 2) {
          drifter.position.y = -fieldHeight / 2;
          drifter.position.x = (Math.random() - 0.5) * fieldWidth;
        }
        drifter.rotation.x += drifter.spin.x * elapsed;
        drifter.rotation.y += drifter.spin.y * elapsed;
        drifter.rotation.z += drifter.spin.z * elapsed;
        const visibleHeight =
          2 *
          (8 - drifter.position.z) *
          Math.tan(THREE.MathUtils.degToRad(view.fov / 2));
        slot.position.set(
          drifter.position.x * visibleHeight * view.aspect,
          drifter.position.y * visibleHeight,
          drifter.position.z,
        );
        slot.rotation.copy(drifter.rotation);
        slot.scale.setScalar(drifter.scale);
        slot.updateMatrix();
        mesh.setMatrixAt(index, slot.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  let running = false;
  let disposed = false;
  let previous = performance.now();
  let leanX = 0;
  let leanY = 0;
  let targetX = 0;
  let targetY = 0;

  function render() {
    if (!disposed) renderer.render(scene, view);
  }

  // Software rendering draws at 30 fps; skipped frames keep their time for the next.
  const gate = createFrameGate();
  function frame(time: number) {
    if (!gate(time)) return;
    const elapsed = Math.min(time - previous, 60) / 1000;
    previous = time;
    place(elapsed);
    const ease = 1 - Math.exp(-elapsed * 2.5);
    leanX += (targetX - leanX) * ease;
    leanY += (targetY - leanY) * ease;
    // A small dolly toward the pointer makes the layers slide past each other.
    view.position.x = leanX * 2.2;
    view.position.y = -leanY * 1.2;
    view.lookAt(0, 0, -6);
    render();
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    view.aspect = width / height;
    view.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    // Placement depends on the frame shape, so lay the objects out again.
    place(0);
    render();
  }

  // Compile the shaders off the main thread before the first frame, so the
  // footer does not freeze the page while it is built.
  await renderer.compileAsync(scene, view);

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  place(0);
  view.lookAt(0, 0, -6);
  resize();

  return {
    setRunning(next) {
      running = next;
      previous = performance.now();
      renderer.setAnimationLoop(running ? frame : null);
      if (!running) render();
    },
    aim(x, y) {
      targetX = x;
      targetY = y;
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      groups.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.dispose();
      });
      [gold, glass, bead].forEach((material) => material.dispose());
      scene.environment?.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
