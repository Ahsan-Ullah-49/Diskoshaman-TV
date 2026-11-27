import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export type StudioCameraScene = {
  /** 0 is the exploded camera, 1 the assembled one with the emblem showing. */
  setAssembly: (progress: number) => void;
  /** Idle float and emblem spin run only while motion is on. */
  setRunning: (running: boolean) => void;
  dispose: () => void;
};

type Part = {
  object: THREE.Object3D;
  home: THREE.Vector3;
  homeRotation: THREE.Euler;
  from: THREE.Vector3;
  fromRotation: THREE.Euler;
  /** Slice of the overall progress in which this part travels home. */
  span: readonly [number, number];
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

/**
 * Build a cinema camera from simple parts, explode it, and let scroll
 * reassemble it. The studio emblem turns inside the lens once it is whole:
 * the DS monogram and globe turn together while the motto stays still.
 * The caller owns disposal.
 */
export async function mountStudioCamera(
  stage: HTMLElement,
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
): Promise<StudioCameraScene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const environment = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = environment.fromScene(room, 0.04).texture;
  room.dispose?.();

  const view = new THREE.PerspectiveCamera(27, 1, 0.1, 40);
  view.position.set(0, 0.35, 10);
  view.lookAt(0, 0.1, 0);

  const key = new THREE.DirectionalLight("#ffe2b0", 2.4);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight("#9fb8ff", 1.6);
  rim.position.set(4, 1.5, -3);
  scene.add(key, rim, new THREE.HemisphereLight("#fff1d8", "#140f0a", 0.6));

  const rig = new THREE.Group();
  rig.rotation.set(0.1, -0.52, 0);
  scene.add(rig);

  // Materials
  const graphite = new THREE.MeshStandardMaterial({
    color: "#1c1c20",
    metalness: 0.7,
    roughness: 0.38,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: "#0d0d0f",
    metalness: 0.15,
    roughness: 0.82,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: "#d8a238",
    metalness: 0.95,
    roughness: 0.28,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#1a1c26",
    metalness: 0.1,
    roughness: 0.04,
    transmission: 0,
    transparent: true,
    opacity: 0.16,
    clearcoat: 1,
  });
  const backplate = new THREE.MeshStandardMaterial({
    color: "#07070a",
    metalness: 0.3,
    roughness: 0.7,
  });
  const screen = new THREE.MeshStandardMaterial({
    color: "#120d06",
    emissive: "#c58a22",
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const recLight = new THREE.MeshStandardMaterial({
    color: "#ff3b2f",
    emissive: "#ff2a1c",
    emissiveIntensity: 2.2,
  });
  const materials = [
    graphite,
    rubber,
    gold,
    glass,
    backplate,
    screen,
    recLight,
  ];

  const parts: Part[] = [];
  function addPart(
    object: THREE.Object3D,
    from: [number, number, number],
    fromRotation: [number, number, number],
    span: readonly [number, number],
  ) {
    rig.add(object);
    parts.push({
      object,
      home: object.position.clone(),
      homeRotation: object.rotation.clone(),
      from: object.position.clone().add(new THREE.Vector3(...from)),
      fromRotation: new THREE.Euler(
        object.rotation.x + fromRotation[0],
        object.rotation.y + fromRotation[1],
        object.rotation.z + fromRotation[2],
      ),
      span,
    });
  }

  const cylinder = (radius: number, depth: number, segments = 64) => {
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      depth,
      segments,
    );
    geometry.rotateX(Math.PI / 2);
    return geometry;
  };

  // Body
  const body = new THREE.Group();
  body.add(
    new THREE.Mesh(new RoundedBoxGeometry(2, 1.36, 1.5, 5, 0.14), graphite),
  );
  const sidePanel = new THREE.Mesh(
    new RoundedBoxGeometry(0.05, 0.9, 1.05, 3, 0.02),
    rubber,
  );
  sidePanel.position.set(1.01, -0.05, -0.05);
  body.add(sidePanel);
  for (let index = 0; index < 5; index++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.7), rubber);
    vent.position.set(-1.01, 0.32 - index * 0.13, -0.1);
    body.add(vent);
  }
  [0.28, 0.08, -0.12].forEach((y, index) => {
    const button = new THREE.Mesh(cylinder(0.055, 0.04, 24), gold);
    button.rotation.y = Math.PI / 2;
    button.position.set(1.04, y, 0.42 - index * 0.02);
    body.add(button);
  });
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), recLight);
  rec.position.set(0.72, 0.5, 0.76);
  body.add(rec);
  const goldSeam = new THREE.Mesh(
    new THREE.BoxGeometry(2.02, 0.025, 1.52),
    gold,
  );
  goldSeam.position.y = -0.42;
  body.add(goldSeam);
  addPart(body, [0, 0, 0], [0, 0, 0], [0, 0.4]);

  // Lens mount, barrel and hood travel in from the front, one after another.
  const mount = new THREE.Group();
  mount.add(new THREE.Mesh(cylinder(0.66, 0.14), graphite));
  const mountRing = new THREE.Mesh(cylinder(0.69, 0.035), gold);
  mountRing.position.z = 0.05;
  mount.add(mountRing);
  mount.position.z = 0.82;
  addPart(mount, [0, 0, 1.6], [0, 0, 1.2], [0.15, 0.6]);

  const barrel = new THREE.Group();
  barrel.add(new THREE.Mesh(cylinder(0.58, 0.86), graphite));
  const knurl = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.035, 0.07, 0.3),
    rubber,
    72,
  );
  const tooth = new THREE.Object3D();
  for (let index = 0; index < knurl.count; index++) {
    const angle = (index / knurl.count) * Math.PI * 2;
    tooth.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, -0.12);
    tooth.rotation.z = angle;
    tooth.updateMatrix();
    knurl.setMatrixAt(index, tooth.matrix);
  }
  knurl.instanceMatrix.needsUpdate = true;
  barrel.add(knurl);
  const focusRing = new THREE.Mesh(cylinder(0.605, 0.05), gold);
  focusRing.position.z = 0.22;
  barrel.add(focusRing);
  barrel.position.z = 1.32;
  addPart(barrel, [0, 0, 2.6], [0, 0, -1.6], [0.25, 0.72]);

  const hood = new THREE.Group();
  const hoodShell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.62, 0.3, 64, 1, true),
    rubber,
  );
  hoodShell.rotation.x = Math.PI / 2;
  rubber.side = THREE.DoubleSide;
  hood.add(hoodShell);
  const hoodRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.025, 12, 80),
    gold,
  );
  hoodRim.position.z = 0.15;
  hood.add(hoodRim);
  const plate = new THREE.Mesh(new THREE.CircleGeometry(0.6, 64), backplate);
  plate.position.z = -0.1;
  hood.add(plate);
  const frontGlass = new THREE.Mesh(new THREE.CircleGeometry(0.62, 64), glass);
  frontGlass.position.z = 0.12;
  hood.add(frontGlass);
  hood.position.z = 1.9;
  addPart(hood, [0, 0, 3.6], [0, 0, 2], [0.35, 0.82]);

  // Top handle drops in from above.
  const handle = new THREE.Group();
  const bar = new THREE.Mesh(
    new RoundedBoxGeometry(1.5, 0.14, 0.2, 3, 0.05),
    rubber,
  );
  bar.position.y = 0.32;
  handle.add(bar);
  [-0.6, 0.6].forEach((x) => {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.3, 0.16),
      graphite,
    );
    post.position.set(x, 0.15, 0);
    handle.add(post);
  });
  handle.position.set(0, 0.68, 0);
  addPart(handle, [0, 1.6, 0], [0.6, 0, 0.3], [0.2, 0.66]);

  // Side monitor swings in on its arm.
  const monitor = new THREE.Group();
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.08), graphite);
  arm.position.x = -0.15;
  monitor.add(arm);
  const bezel = new THREE.Mesh(
    new RoundedBoxGeometry(0.08, 0.6, 0.9, 3, 0.03),
    graphite,
  );
  bezel.position.x = 0.04;
  monitor.add(bezel);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.5), screen);
  display.rotation.y = Math.PI / 2;
  display.position.x = 0.085;
  monitor.add(display);
  monitor.position.set(1.3, 0.25, 0.1);
  addPart(monitor, [1.6, 0.4, 0.6], [0, 1.4, 0.4], [0.3, 0.78]);

  // Viewfinder slides in from behind.
  const viewfinder = new THREE.Group();
  const eyepiece = new THREE.Mesh(cylinder(0.17, 0.55, 32), graphite);
  viewfinder.add(eyepiece);
  const eyecup = new THREE.Mesh(cylinder(0.2, 0.14, 32), rubber);
  eyecup.position.z = -0.32;
  viewfinder.add(eyecup);
  viewfinder.position.set(-0.55, 0.42, -1.0);
  addPart(viewfinder, [-0.6, 0.6, -1.8], [0.4, -0.8, 0], [0.22, 0.7]);

  // The emblem sits inside the hood, behind the front glass.
  const emblem = new THREE.Group();
  emblem.position.z = 1.9;
  rig.add(emblem);

  let turning: { part: THREE.Object3D; base: number }[] = [];
  let model: THREE.Group | null = null;
  try {
    const response = await fetch("/brand/studio-emblem.glb", { signal });
    if (response.ok) {
      const { scene: loaded } = await new GLTFLoader().parseAsync(
        await response.arrayBuffer(),
        "",
      );
      model = loaded;
      // Measure the model on its own, centre it, then fit it inside the lens hood.
      const bounds = new THREE.Box3().setFromObject(loaded);
      const size = bounds.getSize(new THREE.Vector3());
      const centre = bounds.getCenter(new THREE.Vector3());
      loaded.position.sub(centre);
      const holder = new THREE.Group();
      holder.scale.setScalar(1.02 / Math.max(size.x, size.y));
      holder.add(loaded);
      emblem.add(holder);
      turning = ["Monogram", "Globe"]
        .map((name) => loaded.getObjectByName(name))
        .filter((part): part is THREE.Object3D => Boolean(part))
        .map((part) => ({ part, base: part.rotation.y }));
    }
  } catch (error) {
    if (signal.aborted) {
      renderer.dispose();
      throw error;
    }
    // The camera still assembles without the emblem.
  }

  let assembly = 0;
  let running = false;
  let disposed = false;
  let previous = performance.now();
  let spin = 0;
  let leanX = 0;
  let leanY = 0;
  let targetLeanX = 0;
  let targetLeanY = 0;

  function applyAssembly() {
    for (const part of parts) {
      const local = easeInOut(
        clamp01((assembly - part.span[0]) / (part.span[1] - part.span[0])),
      );
      part.object.position.lerpVectors(part.from, part.home, local);
      part.object.rotation.set(
        THREE.MathUtils.lerp(part.fromRotation.x, part.homeRotation.x, local),
        THREE.MathUtils.lerp(part.fromRotation.y, part.homeRotation.y, local),
        THREE.MathUtils.lerp(part.fromRotation.z, part.homeRotation.z, local),
      );
    }
    // The emblem grows into the lens over the last part of the assembly.
    const reveal = easeInOut(clamp01((assembly - 0.78) / 0.22));
    emblem.scale.setScalar(Math.max(0.001, reveal));
    // Open, the camera turns to show its parts; whole, it settles to face the copy.
    rig.rotation.y = -0.52 - (1 - assembly) * 0.5;
    rig.rotation.x = 0.1 + (1 - assembly) * 0.18;
  }

  function render() {
    if (!disposed) renderer.render(scene, view);
  }

  function frame(time: number) {
    const elapsed = Math.min(time - previous, 60) / 1000;
    previous = time;
    // The emblem turns once every 9 seconds, faster than the header's globe, so it reads as alive.
    if (assembly > 0.9) spin += elapsed * ((Math.PI * 2) / 9);
    for (const { part, base } of turning) part.rotation.y = base + spin;
    leanX += (targetLeanX - leanX) * 0.06;
    leanY += (targetLeanY - leanY) * 0.06;
    const seconds = time / 1000;
    rig.position.y = Math.sin(seconds * 0.9) * 0.06;
    rig.rotation.z = Math.sin(seconds * 0.5) * 0.025;
    applyAssembly();
    rig.rotation.x += leanX;
    rig.rotation.y += leanY;
    render();
  }

  function setRunning(next: boolean) {
    running = next;
    previous = performance.now();
    renderer.setAnimationLoop(running ? frame : null);
    if (!running) {
      applyAssembly();
      render();
    }
  }

  function setAssembly(progress: number) {
    assembly = clamp01(progress);
    if (!running) {
      applyAssembly();
      render();
    }
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    view.aspect = width / height;
    // Pull back on narrow frames so the open camera always fits.
    view.position.z = view.aspect < 1 ? 10 / view.aspect ** 0.6 : 10;
    view.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }

  function aim(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    const bounds = stage.getBoundingClientRect();
    targetLeanY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.5;
    targetLeanX = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.25;
  }

  function recenter() {
    targetLeanX = 0;
    targetLeanY = 0;
  }

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  stage.addEventListener("pointermove", aim);
  stage.addEventListener("pointerleave", recenter);
  resize();
  applyAssembly();
  render();
  stage.dataset.cameraReady = "";

  return {
    setAssembly,
    setRunning,
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      stage.removeEventListener("pointermove", aim);
      stage.removeEventListener("pointerleave", recenter);
      delete stage.dataset.cameraReady;
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
      model?.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const own = Array.isArray(child.material)
          ? child.material
          : [child.material];
        own.forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      });
      materials.forEach((material) => material.dispose());
      scene.environment?.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
