import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export type ScreeningDeckScene = {
  dispose: () => void;
};

type DeckInput = { selection: number; approach: number };

/** Draw the transport under the films. The CSS gate owns the level media surface. */
export function mountScreeningDeck(
  canvas: HTMLCanvasElement,
  readInput: () => DeckInput,
): ScreeningDeckScene {
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  if (!context) throw new Error("The screening deck requires WebGL 2.");

  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  const cameraDistance = 14;
  camera.position.z = cameraDistance;
  const frustumSlope = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const viewHeight = 2 * cameraDistance * frustumSlope;
  const transport = new THREE.Group();
  scene.add(transport);

  const key = new THREE.DirectionalLight("#fff1ce", 2.65);
  key.position.set(-2.7, 5, 3.7);
  const edge = new THREE.DirectionalLight("#aabed6", 1.25);
  edge.position.set(3.5, 1, -4.2);
  scene.add(key, edge, new THREE.HemisphereLight("#c5c8cf", "#35261c", 1.1));

  const graphite = new THREE.MeshStandardMaterial({
    color: "#23262a",
    metalness: 0.35,
    roughness: 0.68,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: "#79818a",
    metalness: 0.55,
    roughness: 0.35,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: "#131417",
    roughness: 0.9,
  });
  const indicator = new THREE.MeshBasicMaterial({ color: "#e9a958" });
  const colors = ["#e9a958", "#ddbb87", "#a2bfde", "#f3d097"].map(
    (color) => new THREE.Color(color),
  );
  const geometries = new Set<THREE.BufferGeometry>();

  function place(
    parent: THREE.Group,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) {
    geometries.add(geometry);
    const part = new THREE.Mesh(geometry, material);
    part.position.set(x, y, z);
    parent.add(part);
    return part;
  }

  place(
    transport,
    new RoundedBoxGeometry(10, 0.43, 3.6, 2, 0.15),
    graphite,
    0,
    0,
    0,
  );
  place(transport, new THREE.BoxGeometry(9.65, 0.08, 3.2), rubber, 0, 0.24, 0);
  const track = new THREE.CylinderGeometry(0.042, 0.042, 9.45, 10);
  for (const z of [-1.16, 1.16]) {
    place(transport, track, steel, 0, 0.3, z).rotation.z = Math.PI / 2;
  }
  const pad = new THREE.BoxGeometry(0.72, 0.17, 0.48);
  for (const x of [-4.3, 4.3]) {
    place(transport, pad, rubber, x, -0.28, 1.05);
    place(transport, pad, rubber, x, -0.28, -1.05);
  }
  const fastener = new THREE.CylinderGeometry(0.06, 0.06, 0.054, 6);
  for (const x of [-4.6, 4.6]) {
    for (const z of [-1.48, 1.48])
      place(transport, fastener, steel, x, 0.25, z);
  }

  const carriage = new THREE.Group();
  transport.add(carriage);
  place(
    carriage,
    new RoundedBoxGeometry(1.35, 0.19, 2.7, 2, 0.08),
    steel,
    0,
    0.37,
    0,
  );
  place(carriage, new THREE.BoxGeometry(1.18, 0.16, 2.6), graphite, 0, 0.46, 0);
  place(
    carriage,
    new THREE.BoxGeometry(0.7, 0.045, 0.022),
    indicator,
    0,
    0.43,
    1.31,
  );

  const wheel = new THREE.Group();
  wheel.position.set(-3.95, 0.37, 0.36);
  transport.add(wheel);
  place(
    wheel,
    new THREE.CylinderGeometry(0.63, 0.63, 0.13, 36),
    steel,
    0,
    0,
    0,
  );
  place(
    wheel,
    new THREE.CylinderGeometry(0.49, 0.49, 0.08, 36),
    rubber,
    0,
    0.1,
    0,
  );
  place(
    wheel,
    new THREE.CylinderGeometry(0.14, 0.14, 0.11, 18),
    graphite,
    0,
    0.16,
    0,
  );
  const tooth = new THREE.BoxGeometry(0.045, 0.035, 0.12);
  for (let index = 0; index < 12; index++) {
    const angle = (index / 12) * Math.PI * 2;
    place(
      wheel,
      tooth,
      steel,
      0.51 * Math.sin(angle),
      0.09,
      0.51 * Math.cos(angle),
    ).rotation.y = angle;
  }
  place(
    wheel,
    new THREE.BoxGeometry(0.055, 0.04, 0.11),
    indicator,
    0,
    0.17,
    0.36,
  );

  const transportBounds = new THREE.Box3().setFromObject(transport);
  const { min, max } = transportBounds;
  const transportWidth = max.x - min.x;
  const corners = [min.x, max.x].flatMap((x) =>
    [min.y, max.y].flatMap((y) =>
      [min.z, max.z].map((z) => new THREE.Vector3(x, y, z)),
    ),
  );
  const rotatedCorners = corners.map(() => new THREE.Vector3());
  const verticalLimit = frustumSlope * 0.94;
  let preferredScale = 1;
  let lastFrame = 0;
  let lean = 0;
  const host = canvas.parentElement ?? canvas;
  function aim(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    const bounds = host.getBoundingClientRect();
    lean = THREE.MathUtils.clamp(
      (event.clientX - bounds.left) / bounds.width - 0.5,
      -0.5,
      0.5,
    );
  }
  function resetAim() {
    lean = 0;
  }
  host.addEventListener("pointermove", aim, { passive: true });
  host.addEventListener("pointerleave", resetAim);

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.3,
        Math.sqrt(950000 / (width * height)),
      ),
    );
    renderer.setSize(width, height, false);
    preferredScale = (viewHeight * camera.aspect * 0.88) / transportWidth;
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  function fitTransport() {
    // The near corners grow in perspective as the deck turns towards the viewer.
    const horizontalLimit = verticalLimit * camera.aspect;
    let scale = preferredScale;
    for (const [index, corner] of corners.entries()) {
      const rotated = rotatedCorners[index]
        .copy(corner)
        .applyQuaternion(transport.quaternion);
      const extent = Math.abs(rotated.x) + rotated.z * horizontalLimit;
      if (extent > 0) {
        scale = Math.min(scale, (cameraDistance * horizontalLimit) / extent);
      }
    }
    transport.scale.setScalar(scale);

    // Lift the base just enough to keep its closest corner inside the bottom edge.
    let deckY = -viewHeight * 0.322;
    for (const corner of rotatedCorners) {
      const depth = cameraDistance - corner.z * scale;
      deckY = Math.max(deckY, -depth * verticalLimit - corner.y * scale);
    }
    transport.position.y = deckY;
  }

  const { damp } = THREE.MathUtils;
  function draw(now: number) {
    if (lastFrame && now - lastFrame < 32) return;
    const delta = Math.min((now - lastFrame) / 1000, 0.07);
    lastFrame = now;
    const { selection, approach } = readInput();
    const distance = 1 - approach;
    transport.rotation.set(
      damp(transport.rotation.x, 0.38 + distance * 0.24, 6, delta),
      damp(
        transport.rotation.y,
        -0.13 - distance * 0.5 + lean * 0.19,
        6,
        delta,
      ),
      damp(transport.rotation.z, -distance * 0.05, 6, delta),
    );
    fitTransport();
    carriage.position.x = damp(
      carriage.position.x,
      (selection - 1.5) * 1.72,
      6,
      delta,
    );
    wheel.rotation.y += delta * 0.9;
    indicator.color.lerp(colors[selection], 1 - Math.exp(-6 * delta));
    renderer.render(scene, camera);
    if (!canvas.dataset.ready) canvas.dataset.ready = "true";
  }

  function loseContext(event: Event) {
    event.preventDefault();
    delete canvas.dataset.ready;
    renderer.setAnimationLoop(null);
  }
  function restoreContext() {
    lastFrame = 0;
    renderer.setAnimationLoop(draw);
  }
  canvas.addEventListener("webglcontextlost", loseContext);
  canvas.addEventListener("webglcontextrestored", restoreContext);
  renderer.setAnimationLoop(draw);

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", aim);
      host.removeEventListener("pointerleave", resetAim);
      canvas.removeEventListener("webglcontextlost", loseContext);
      canvas.removeEventListener("webglcontextrestored", restoreContext);
      geometries.forEach((geometry) => geometry.dispose());
      for (const material of [graphite, steel, rubber, indicator])
        material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
