import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { brandLogoSource, brandLogos } from "@/content/brand-logos";
import { createReelAtmosphere } from "./brand-reel-atmosphere";

const radius = 3.14;
const slideWidth = 1.16;
const slideHeight = 0.83;
const spindleTop = -0.202;
const turnPerLogo = (Math.PI * 2) / brandLogos.length;
const idleDelay = 1450;
const idleLogosPerSecond = 0.3;

export type BrandReelScene = {
  followScroll: (turn: number, finished: boolean) => void;
  turnBy: (direction: number) => number;
  setAutoRotation: (playing: boolean) => void;
  drag: (distance: number) => void;
  dispose: () => void;
};

function roundedFrame(
  width: number,
  height: number,
  corner: number,
  x = 0,
  y = 0,
) {
  const left = x - width / 2;
  const right = x + width / 2;
  const bottom = y - height / 2;
  const top = y + height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(left + corner, bottom);
  shape.lineTo(right - corner, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + corner);
  shape.lineTo(right, top - corner);
  shape.quadraticCurveTo(right, top, right - corner, top);
  shape.lineTo(left + corner, top);
  shape.quadraticCurveTo(left, top, left, top - corner);
  shape.lineTo(left, bottom + corner);
  shape.quadraticCurveTo(left, bottom, left + corner, bottom);
  return shape;
}

function releaseMeshes(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      materials.add(material);
      if (
        (material instanceof THREE.MeshBasicMaterial ||
          material instanceof THREE.MeshStandardMaterial) &&
        material.map
      ) {
        textures.add(material.map);
      }
    }
    if (object instanceof THREE.InstancedMesh) object.dispose();
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
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

/** Mount the credits reel and draw on demand while its stage is visible. */
export function mountBrandReel(
  room: HTMLDivElement,
  stage: HTMLDivElement,
  canvas: HTMLCanvasElement,
  initialTurn: number,
  showStep: (step: number) => void,
): BrandReelScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.2, 48);
  const atmosphere = createReelAtmosphere();
  const rig = new THREE.Group();
  const reel = new THREE.Group();
  const emblemMount = new THREE.Group();
  emblemMount.position.y = spindleTop;
  emblemMount.rotation.x = -0.16;
  rig.add(reel, emblemMount);
  scene.add(atmosphere.root, rig);

  const brass = new THREE.MeshStandardMaterial({
    color: "#b48761",
    roughness: 0.36,
    metalness: 0.52,
  });
  const enamel = new THREE.MeshStandardMaterial({
    color: "#332831",
    roughness: 0.39,
    metalness: 0.26,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: "#aaa3ab",
    roughness: 0.38,
    metalness: 0.57,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: "#21191e",
    roughness: 0.57,
    metalness: 0.3,
  });
  const lamp = new THREE.MeshBasicMaterial({
    color: "#ffcb8f",
    toneMapped: false,
  });

  function turnMetal(
    parent: THREE.Group,
    profile: readonly (readonly [number, number])[],
    material: THREE.Material,
  ) {
    const shape = profile.map(([r, y]) => new THREE.Vector2(r, y));
    parent.add(new THREE.Mesh(new THREE.LatheGeometry(shape, 112), material));
  }

  // Closed profiles give the projector magazine visible thickness and machined edges.
  turnMetal(
    rig,
    [
      [0, -0.96],
      [3.37, -0.96],
      [3.51, -0.91],
      [3.53, -0.82],
      [3.43, -0.76],
      [0, -0.76],
    ],
    enamel,
  );
  turnMetal(
    reel,
    [
      [2.79, -0.77],
      [3.4, -0.77],
      [3.52, -0.72],
      [3.52, -0.62],
      [3.43, -0.55],
      [2.9, -0.55],
      [2.79, -0.62],
      [2.79, -0.77],
    ],
    brass,
  );
  turnMetal(
    reel,
    [
      [2.89, -0.56],
      [3.4, -0.56],
      [3.39, -0.51],
      [2.9, -0.51],
      [2.89, -0.56],
    ],
    dark,
  );
  turnMetal(
    reel,
    [
      [0, -0.76],
      [1.16, -0.76],
      [1.2, -0.65],
      [0.76, -0.55],
      [0.58, -0.44],
      [0.58, -0.29],
      [0.52, -0.25],
      [0.27, -0.25],
      [0.26, -0.45],
      [0, -0.45],
    ],
    chrome,
  );
  turnMetal(
    reel,
    [
      [0.26, -0.28],
      [0.55, -0.28],
      [0.59, -0.24],
      [0.56, spindleTop],
      [0.32, spindleTop],
      [0.26, -0.24],
      [0.26, -0.28],
    ],
    brass,
  );
  turnMetal(
    reel,
    [
      [0, -0.447],
      [0.31, -0.447],
      [0.32, -0.291],
      [0.19, -0.27],
      [0, -0.27],
    ],
    dark,
  );

  const carrier = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.34, 0.08, 1.94),
    enamel,
    brandLogos.length,
  );
  const catches = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.55, 0.045, 0.07),
    chrome,
    brandLogos.length,
  );
  const fixture = new THREE.Object3D();
  for (let index = 0; index < brandLogos.length; index++) {
    const angle = index * turnPerLogo;
    fixture.rotation.y = angle;
    fixture.position.set(Math.sin(angle) * 1.92, -0.62, Math.cos(angle) * 1.92);
    fixture.updateMatrix();
    carrier.setMatrixAt(index, fixture.matrix);
    fixture.position.set(
      Math.sin(angle) * 3.38,
      -0.477,
      Math.cos(angle) * 3.38,
    );
    fixture.updateMatrix();
    catches.setMatrixAt(index, fixture.matrix);
  }
  reel.add(carrier, catches);

  const statusLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.026, 0.015),
    lamp,
  );
  statusLight.position.set(0, -0.856, 3.54);
  rig.add(statusLight);

  const mountGeometry = new THREE.ExtrudeGeometry(
    roundedFrame(slideWidth, slideHeight, 0.045),
    {
      depth: 0.067,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.017,
      bevelSegments: 2,
      curveSegments: 4,
    },
  );
  const rimGeometry = new THREE.ShapeGeometry(
    roundedFrame(slideWidth - 0.064, slideHeight - 0.064, 0.031),
    5,
  );
  const matteGeometry = new THREE.ShapeGeometry(
    roundedFrame(slideWidth - 0.103, slideHeight - 0.103, 0.023),
    5,
  );
  const foreground = new THREE.MeshBasicMaterial({
    color: "#f3eadc",
    toneMapped: false,
  });
  const darkMatte = new THREE.MeshBasicMaterial({
    color: "#291d1e",
    toneMapped: false,
  });
  const backPlate = new THREE.MeshStandardMaterial({
    color: "#51414c",
    emissive: "#2f2033",
    emissiveIntensity: 0.2,
    roughness: 0.61,
    metalness: 0.32,
  });
  const vents = [-0.24, -0.08, 0.08, 0.24].map((x) =>
    roundedFrame(0.112, 0.025, 0.009, x, -0.258),
  );
  const ventGeometry = new THREE.ShapeGeometry(vents, 3);
  const textureLoader = new THREE.TextureLoader();
  const logoPlane = new THREE.PlaneGeometry(1, 1);
  let disposed = false;
  let contextLost = false;
  let frame = 0;

  const slides = brandLogos.map((logo, index) => {
    const angle = index * turnPerLogo;
    const slot = new THREE.Group();
    slot.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    slot.rotation.y = angle;
    const slide = new THREE.Group();
    slot.add(slide);
    reel.add(slot);

    slide.add(new THREE.Mesh(mountGeometry, enamel));
    const back = new THREE.Mesh(rimGeometry, backPlate);
    back.rotation.y = Math.PI;
    back.position.z = -0.019;
    slide.add(back);
    const vent = new THREE.Mesh(ventGeometry, dark);
    vent.rotation.y = Math.PI;
    vent.position.z = -0.022;
    slide.add(vent);
    const rim = new THREE.Mesh(rimGeometry, brass);
    rim.position.z = 0.087;
    slide.add(rim);
    const matte = new THREE.Mesh(
      matteGeometry,
      logo.darkBackground ? darkMatte : foreground,
    );
    matte.position.z = 0.09;
    slide.add(matte);

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    const artwork = new THREE.Mesh(logoPlane, material);
    const scale = Math.min(0.89 / logo.width, 0.49 / logo.height);
    artwork.scale.set(logo.width * scale, logo.height * scale, 1);
    artwork.position.z = 0.093;
    artwork.visible = false;
    slide.add(artwork);
    const texture = textureLoader.load(brandLogoSource(logo), (loaded) => {
      if (disposed) {
        loaded.dispose();
        return;
      }
      artwork.visible = true;
      invalidate();
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    material.map = texture;

    return { angle, slide, artwork };
  });

  scene.add(new THREE.HemisphereLight("#f7ddd2", "#49374a", 2.25));
  const key = new THREE.DirectionalLight("#ffd1a1", 3.65);
  key.position.set(-4, 6, 4);
  const edge = new THREE.DirectionalLight("#bec2ed", 2.7);
  edge.position.set(3, 3, -4);
  scene.add(key, edge);

  let turn = initialTurn;
  let targetTurn = initialTurn;
  let reportedStep = Math.round(initialTurn);
  let scrubbing = false;
  let alignToScroll = true;
  let scrollCycle = 0;
  let finished = false;
  let autoRotation = true;
  let lastInput = performance.now();
  let idleSpeed = 0;
  let swipe = 0;
  let swipeAngle = 0;
  let reveal = 0;
  let scrollChanged = true;
  let currentReveal = 0;
  let pointerX = 0;
  let pointerY = 0;
  let aimX = 0;
  let aimY = 0;
  let lastFrame = 0;
  let seconds = 0;
  let idleFrame = 0;
  let emblem: { globe: THREE.Object3D; letters: THREE.Object3D } | undefined;
  const emblemLoad = new AbortController();

  async function loadEmblem() {
    const { signal } = emblemLoad;
    const response = await fetch("/brand/studio-emblem.glb", { signal });
    if (!response.ok) return;
    const bytes = await response.arrayBuffer();
    signal.throwIfAborted();
    const { scene: model } = await new GLTFLoader().parseAsync(bytes, "");
    const globe = model.getObjectByName("Globe");
    const letters = model.getObjectByName("Monogram");
    if (signal.aborted || !globe || !letters) {
      releaseMeshes(model);
      return;
    }

    // Seat the globe over the shaft and keep the lettering facing the viewer.
    const bounds = new THREE.Box3().setFromObject(model);
    const scale = 1.58 / (bounds.max.y - bounds.min.y);
    model.scale.setScalar(scale);
    model.position.y = -bounds.min.y * scale;
    emblemMount.add(model);
    emblem = { globe, letters };
    invalidate();
  }

  function invalidate() {
    window.clearTimeout(idleFrame);
    if (!frame && !disposed && !contextLost) {
      frame = requestAnimationFrame(draw);
    }
  }

  function noteInput() {
    lastInput = performance.now();
    invalidate();
  }

  function draw(now: number) {
    frame = 0;
    if (scrollChanged) {
      const { top, height } = stage.getBoundingClientRect();
      const viewport = window.innerHeight;
      reveal = THREE.MathUtils.smoothstep(
        viewport - top,
        height * 0.14,
        (viewport + height) * 0.5,
      );
      scrollChanged = false;
    }

    const frameTime = now - lastFrame;
    const elapsed = Math.min(frameTime, 32) / 1000;
    const ambientElapsed = Math.min(frameTime, 64) / 1000;
    seconds += ambientElapsed;
    lastFrame = now;
    const settle = (value: number, target: number, rate: number) =>
      Math.abs(target - value) < 0.001
        ? target
        : THREE.MathUtils.damp(value, target, rate, elapsed);
    const canAutoRotate = autoRotation && !finished;
    if (
      canAutoRotate &&
      turn === targetTurn &&
      now - lastInput >= idleDelay &&
      !stage.hasAttribute("data-dragging")
    ) {
      idleSpeed = THREE.MathUtils.damp(
        idleSpeed,
        idleLogosPerSecond,
        4,
        ambientElapsed,
      );
      turn += idleSpeed * ambientElapsed;
      targetTurn = turn;
      alignToScroll = true;
    } else {
      idleSpeed = 0;
      turn = settle(turn, targetTurn, scrubbing ? 10 : 9);
    }

    swipeAngle = settle(swipeAngle, swipe, 12);
    aimX = settle(aimX, pointerX, 6);
    aimY = settle(aimY, pointerY, 6);
    currentReveal = settle(currentReveal, reveal, 8);

    const yaw = -turn * turnPerLogo + swipeAngle;
    reel.rotation.y = yaw;
    rig.rotation.z = -0.075 * (1 - currentReveal) - aimX * 0.045;
    const compact = camera.aspect < 1.25;
    const sweep = Math.sin(seconds * 0.36 + yaw * 0.54);
    camera.position.set(
      aimX * 1.4 + Math.sin(seconds * 0.28) * 0.23,
      3.5 +
        aimY * 0.62 +
        Math.cos(seconds * 0.24) * 0.08 +
        (1 - currentReveal) * 1.25,
      (compact ? 8.65 : 9.12) + (1 - currentReveal) * 1.7,
    );
    camera.lookAt(0, -0.42, 0);
    key.position.x = -4 + sweep * 1.5;
    key.intensity = 3.65 + sweep * 0.22;
    edge.intensity = 2.7 - sweep * 0.25;
    atmosphere.update(seconds, yaw, aimX, aimY, sweep);

    if (emblem) {
      emblem.globe.rotation.y += ambientElapsed * ((Math.PI * 2) / 19);
      emblem.letters.rotation.x = -Math.abs(aimY) * 0.28;
      emblem.letters.rotation.y = aimX * 0.32;
    }

    for (const { angle, slide } of slides) {
      const facingCamera = THREE.MathUtils.smoothstep(
        Math.cos(angle + yaw),
        0.956,
        1,
      );
      slide.position.y = -0.025 + facingCamera * 0.56;
      slide.position.z = facingCamera * 0.15;
      slide.rotation.x = -0.18 * facingCamera;
      slide.scale.setScalar(1 + facingCamera * 0.33);
    }
    renderer.render(scene, camera);

    const step = Math.round(turn);
    const active =
      slides[((step % slides.length) + slides.length) % slides.length];
    stage.toggleAttribute("data-reel-ready", active.artwork.visible);
    if (step !== reportedStep) {
      reportedStep = step;
      showStep(step);
    }
    if (
      turn !== targetTurn ||
      swipeAngle !== swipe ||
      currentReveal !== reveal ||
      aimX !== pointerX ||
      aimY !== pointerY
    ) {
      invalidate();
    } else {
      // Keep the atmosphere moving at a lower cadence while the reel is settled.
      idleFrame = window.setTimeout(invalidate, 24);
    }
  }

  function onScroll() {
    scrollChanged = true;
    noteInput();
  }

  function resize() {
    const bounds = room.getBoundingClientRect();
    const slot = stage.getBoundingClientRect();
    const { width, height } = bounds;
    if (!width || !height || !slot.width || !slot.height) return;
    const left = slot.left - bounds.left;
    const top = slot.top - bounds.top;
    camera.fov = slot.width / slot.height < 1 ? 40 : 35;
    // Extend the camera to the whole room without changing the reel's layout slot.
    camera.setViewOffset(slot.width, slot.height, -left, -top, width, height);
    const scale = Math.min(
      window.devicePixelRatio,
      1.35,
      Math.sqrt(1500000 / (width * height)),
    );
    renderer.setPixelRatio(scale);
    renderer.setSize(width, height, false);
    atmosphere.resize(
      width,
      height,
      (left + slot.width / 2) / width,
      (top + slot.height / 2) / height,
      scale,
    );
    onScroll();
  }

  function aim(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    const bounds = room.getBoundingClientRect();
    pointerX =
      THREE.MathUtils.clamp(
        (event.clientX - bounds.left) / bounds.width,
        0,
        1,
      ) - 0.5;
    pointerY =
      THREE.MathUtils.clamp(
        (event.clientY - bounds.top) / bounds.height,
        0,
        1,
      ) - 0.5;
    invalidate();
  }

  function recenter() {
    pointerX = 0;
    pointerY = 0;
    invalidate();
  }

  function showStill() {
    contextLost = true;
    emblemLoad.abort();
    cancelAnimationFrame(frame);
    window.clearTimeout(idleFrame);
    delete stage.dataset.reelReady;
  }

  const observer = new ResizeObserver(resize);
  observer.observe(room);
  observer.observe(stage);
  window.addEventListener("scroll", onScroll, { passive: true });
  room.addEventListener("pointermove", aim);
  room.addEventListener("pointerleave", recenter);
  canvas.addEventListener("webglcontextlost", showStill);
  resize();
  void loadEmblem().catch(() => {
    // The reel can continue when the decorative model cannot load.
  });

  return {
    followScroll(nextTurn, completed) {
      if (alignToScroll) {
        // Resume on the nearest equivalent lap after a manual or idle turn.
        scrollCycle =
          Math.round((turn - nextTurn) / slides.length) * slides.length;
        alignToScroll = false;
      }
      targetTurn = nextTurn + scrollCycle;
      scrubbing = true;
      finished = completed;
      noteInput();
    },
    turnBy(direction) {
      targetTurn = Math.round(targetTurn) + direction;
      alignToScroll = true;
      scrubbing = false;
      noteInput();
      return targetTurn;
    },
    setAutoRotation(playing) {
      autoRotation = playing;
      noteInput();
    },
    drag(distance) {
      swipe = THREE.MathUtils.clamp(distance / 240, -turnPerLogo, turnPerLogo);
      noteInput();
    },
    dispose() {
      disposed = true;
      emblemLoad.abort();
      cancelAnimationFrame(frame);
      window.clearTimeout(idleFrame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      room.removeEventListener("pointermove", aim);
      room.removeEventListener("pointerleave", recenter);
      canvas.removeEventListener("webglcontextlost", showStill);
      delete stage.dataset.reelReady;

      atmosphere.dispose();
      releaseMeshes(scene);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
