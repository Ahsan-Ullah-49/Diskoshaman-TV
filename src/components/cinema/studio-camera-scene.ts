import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { sharpenEmblemTextures } from "@/components/brand/emblem-textures";
import {
  canvasPixelRatio,
  createFrameGate,
  isSoftwareRenderer,
  wantsAntialias,
} from "@/lib/render-quality";
import { surfaceMaterial } from "./scene-materials";

export type StudioCameraScene = {
  /** 0 is the exploded camera, 1 the assembled one with the emblem showing. */
  setAssembly: (progress: number) => void;
  /** Idle float, emblem spin and interaction run only while motion is on. */
  setRunning: (running: boolean) => void;
  /** Turn toward the pointer, given across the stage from -0.5 to 0.5. */
  aim: (x: number, y: number) => void;
  /** Pointer over the camera: the AF lamp lights, the lens zooms and focuses. */
  setHover: (active: boolean) => void;
  /** Take a picture: flash, shutter press and a kick to the emblem's spin. */
  fire: () => void;
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
/** Frame-rate independent approach toward a target. */
const approach = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

// Where the lens sits on the body front, and where the front element ends.
const mountCentre = new THREE.Vector3(0.1, -0.17, 0.56);
const lensFrontFace = 1.07;
const restYaw = -0.3;
// How far in front of the glass the turning emblem floats, clear of the barrel.
const emblemFloat = 0.54;
const restPitch = 0.16;

function canvasTexture(
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void,
  colour = true,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) paint(context);
  const texture = new THREE.CanvasTexture(canvas);
  if (colour) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Pebbled leatherette, used as a bump map on the grip and body. */
function leatherGrain() {
  const texture = canvasTexture(
    256,
    256,
    (context) => {
      context.fillStyle = "#808080";
      context.fillRect(0, 0, 256, 256);
      for (let index = 0; index < 5200; index++) {
        const shade = 60 + Math.random() * 140;
        context.fillStyle = `rgb(${shade} ${shade} ${shade})`;
        context.beginPath();
        context.arc(
          Math.random() * 256,
          Math.random() * 256,
          0.8 + Math.random() * 2.2,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    },
    false,
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/** Shooting modes printed around the top of the mode dial. */
function modeDialFace() {
  return canvasTexture(256, 256, (context) => {
    context.fillStyle = "#151517";
    context.beginPath();
    context.arc(128, 128, 128, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#2a2a2e";
    context.lineWidth = 6;
    context.beginPath();
    context.arc(128, 128, 70, 0, Math.PI * 2);
    context.stroke();
    const modes = ["M", "Av", "Tv", "P", "A+", "C", "SCN", "★"];
    context.font = "700 26px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    modes.forEach((mode, index) => {
      const angle = (index / modes.length) * Math.PI * 2 - Math.PI / 2;
      context.fillStyle = mode === "M" ? "#e7ba60" : "#ece7dd";
      context.fillText(
        mode,
        128 + Math.cos(angle) * 98,
        128 + Math.sin(angle) * 98,
      );
    });
  });
}

/** Lens name set in a circle around the front element. */
function lensFaceText(outerRadius: number, textRadius: number) {
  return canvasTexture(512, 512, (context) => {
    const radius = (textRadius / outerRadius) * 256;
    const label =
      "DS OPTICS  ·  ZOOM LENS  18-135mm  1:3.5-5.6  ·  Ø67mm  ·  INFINITY LIES WITHIN  ·";
    context.font = "600 17px Arial, sans-serif";
    context.fillStyle = "#d9d4ca";
    context.textAlign = "center";
    context.textBaseline = "middle";
    let angle = -Math.PI / 2 - 1.6;
    for (const character of label) {
      const step = (context.measureText(character).width + 1.6) / radius;
      angle += step / 2;
      context.save();
      context.translate(
        256 + Math.cos(angle) * radius,
        256 + Math.sin(angle) * radius,
      );
      context.rotate(angle + Math.PI / 2);
      context.fillText(character, 0, 0);
      context.restore();
      angle += step / 2;
    }
  });
}

/** Silver studio name for the front of the prism housing. */
function brandPlate() {
  return canvasTexture(512, 80, (context) => {
    const silver = context.createLinearGradient(0, 10, 0, 70);
    silver.addColorStop(0, "#fbfaf6");
    silver.addColorStop(0.55, "#b9b6ae");
    silver.addColorStop(1, "#efe9dc");
    context.fillStyle = silver;
    context.font = "800 50px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.letterSpacing = "6px";
    context.fillText("DISKOSHAMAN", 256, 42);
  });
}

/** Zoom focal lengths printed on the barrel. */
function zoomScale() {
  const texture = canvasTexture(1024, 64, (context) => {
    context.font = "700 30px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    ["18", "24", "35", "50", "85", "135"].forEach((mark, index) => {
      context.fillStyle = index === 5 ? "#e7ba60" : "#ece7dd";
      context.fillText(mark, 90 + index * 168, 34);
    });
  });
  // The band is seen from outside the barrel, so read it mirrored.
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  return texture;
}

/** Soft gold falloff for the beam that projects the emblem out of the lens. */
function beamFade() {
  return canvasTexture(
    4,
    128,
    (context) => {
      const fade = context.createLinearGradient(0, 0, 0, 128);
      fade.addColorStop(0, "#000");
      fade.addColorStop(1, "#fff");
      context.fillStyle = fade;
      context.fillRect(0, 0, 4, 128);
    },
    false,
  );
}

/** A profile spun around the lens axis; points are [radius, z]. */
function lathe(points: [number, number][], segments = 96) {
  const geometry = new THREE.LatheGeometry(
    points.map(([radius, z]) => new THREE.Vector2(radius, z)),
    segments,
  );
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/** Fine rubber ridges running along a lens ring. */
function ridges(
  count: number,
  radius: number,
  length: number,
  z: number,
  material: THREE.Material,
) {
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.03, 0.02, length),
    material,
    count,
  );
  const slot = new THREE.Object3D();
  for (let index = 0; index < count; index++) {
    const angle = (index / count) * Math.PI * 2;
    slot.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
    slot.rotation.set(0, 0, angle);
    slot.updateMatrix();
    mesh.setMatrixAt(index, slot.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function cylinderAlongZ(radius: number, depth: number, segments = 48) {
  const geometry = new THREE.CylinderGeometry(radius, radius, depth, segments);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

const bevel = {
  bevelEnabled: true,
  bevelSegments: 5,
  curveSegments: 14,
} as const;

/** Front silhouette of the body: a wide shell with the grip shoulder raised. */
function bodyGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.12, -0.85);
  shape.lineTo(1.12, -0.85);
  shape.quadraticCurveTo(1.3, -0.85, 1.3, -0.67);
  shape.lineTo(1.3, 0.36);
  shape.quadraticCurveTo(1.3, 0.5, 1.16, 0.5);
  shape.lineTo(-0.82, 0.5);
  shape.quadraticCurveTo(-0.95, 0.5, -1.05, 0.6);
  shape.quadraticCurveTo(-1.3, 0.66, -1.3, 0.44);
  shape.lineTo(-1.3, -0.67);
  shape.quadraticCurveTo(-1.3, -0.85, -1.12, -0.85);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    ...bevel,
    depth: 0.92,
    bevelThickness: 0.09,
    bevelSize: 0.08,
  });
  geometry.translate(0, 0, -0.46);
  return geometry;
}

/** The pentaprism hump over the lens, set slightly back from the body front. */
function prismGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, 0.42);
  shape.lineTo(0.72, 0.42);
  shape.lineTo(0.5, 0.94);
  shape.quadraticCurveTo(0.44, 1.05, 0.32, 1.05);
  shape.lineTo(-0.1, 1.05);
  shape.quadraticCurveTo(-0.22, 1.05, -0.28, 0.94);
  shape.lineTo(-0.5, 0.42);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    ...bevel,
    depth: 0.74,
    bevelThickness: 0.06,
    bevelSize: 0.05,
  });
  geometry.translate(0, 0, -0.42);
  return geometry;
}

/** The hand grip bulges forward from the body, drawn from above. */
function gripGeometry() {
  const shape = new THREE.Shape();
  // Shape y is minus the final z, so the profile reads as seen from above.
  shape.moveTo(-1.34, -0.3);
  shape.lineTo(-1.34, -0.72);
  shape.quadraticCurveTo(-1.34, -1.04, -1.04, -1.04);
  shape.lineTo(-0.86, -1.02);
  shape.quadraticCurveTo(-0.6, -0.97, -0.6, -0.66);
  shape.lineTo(-0.6, -0.3);
  shape.lineTo(-1.34, -0.3);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    ...bevel,
    depth: 1.42,
    bevelThickness: 0.1,
    bevelSize: 0.08,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -0.86, 0);
  return geometry;
}

/**
 * Build a DSLR from shaped parts, explode it, and let scroll reassemble it.
 * Once whole, the studio emblem rises out of the lens and turns: the DS
 * monogram and globe turn together while the motto stays still. Hover and
 * click drive the camera like the real thing. The caller owns disposal.
 */
export async function mountStudioCamera(
  stage: HTMLElement,
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
): Promise<StudioCameraScene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: wantsAntialias(),
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(canvasPixelRatio(1.4));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const environment = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // A smaller reflection map in software keeps the first build from freezing the page.
  scene.environment = environment.fromScene(room, 0.04, 0.1, 100, {
    size: isSoftwareRenderer() ? 64 : 256,
  }).texture;
  scene.environmentIntensity = 0.6;
  room.dispose?.();

  const view = new THREE.PerspectiveCamera(27, 1, 0.1, 40);
  view.position.set(0, 0.45, 10);
  view.lookAt(0, 0.1, 0);

  const key = new THREE.DirectionalLight("#fff1e0", 2.4);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight("#9fb8ff", 2.2);
  rim.position.set(4, 2, -3);
  const under = new THREE.DirectionalLight("#e7ba60", 0.7);
  under.position.set(0, -4, 2);
  // A warm point light follows the pointer so highlights slide over the body.
  const glint = new THREE.PointLight("#ffd28a", 0, 9, 1.2);
  glint.position.set(0, 0.4, 3.2);
  scene.add(
    key,
    rim,
    under,
    glint,
    new THREE.HemisphereLight("#f3f0ea", "#0a0908", 0.35),
  );

  const rig = new THREE.Group();
  rig.rotation.set(restPitch, restYaw, 0);
  scene.add(rig);

  // Materials and textures
  const grain = leatherGrain();
  const bodyGrain = grain.clone();
  bodyGrain.repeat.set(6, 6);
  const dialFace = modeDialFace();
  const lensText = lensFaceText(0.675, 0.625);
  const plateText = brandPlate();
  const zoomMarks = zoomScale();
  const beamAlpha = beamFade();
  const textures = [
    grain,
    bodyGrain,
    dialFace,
    lensText,
    plateText,
    zoomMarks,
    beamAlpha,
  ];

  const body = surfaceMaterial({
    color: "#09090a",
    metalness: 0.05,
    roughness: 0.58,
    // A sharp clear coat gives crisp highlights over a deep black, like moulded polycarbonate.
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.45,
    bumpMap: bodyGrain,
    bumpScale: 0.35,
  });
  const leather = new THREE.MeshStandardMaterial({
    color: "#070708",
    metalness: 0,
    roughness: 0.86,
    envMapIntensity: 0.35,
    bumpMap: grain,
    bumpScale: 1.6,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: "#0b0b0d",
    metalness: 0.05,
    roughness: 0.72,
    envMapIntensity: 0.5,
  });
  const lensShell = surfaceMaterial({
    color: "#0a0a0b",
    metalness: 0.15,
    roughness: 0.32,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: "#cfd1d6",
    metalness: 1,
    roughness: 0.22,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: "#d8a238",
    metalness: 0.95,
    roughness: 0.28,
    emissive: "#7a4a08",
    emissiveIntensity: 0,
  });
  // Multi-coated glass picks up the violet and green sheen of a real front element.
  const frontGlass = surfaceMaterial({
    color: "#0a0c14",
    metalness: 0.2,
    roughness: 0.04,
    clearcoat: 1,
    iridescence: 1,
    iridescenceIOR: 1.8,
    iridescenceThicknessMinimum: 260,
    iridescenceThicknessMaximum: 640,
    envMapIntensity: 1.6,
    transparent: true,
    opacity: 0.9,
  });
  const innerGlass = frontGlass.clone();
  innerGlass.opacity = 0.75;
  if (innerGlass instanceof THREE.MeshPhysicalMaterial) {
    innerGlass.iridescenceThicknessMinimum = 400;
    innerGlass.iridescenceThicknessMaximum = 900;
  }
  const shadow = new THREE.MeshStandardMaterial({
    color: "#040405",
    roughness: 0.95,
  });
  const lcd = new THREE.MeshStandardMaterial({
    color: "#06070a",
    emissive: "#c58a22",
    emissiveIntensity: 0.12,
    roughness: 0.12,
  });
  const afLamp = new THREE.MeshStandardMaterial({
    color: "#2a0905",
    emissive: "#ff6a2a",
    emissiveIntensity: 0,
    roughness: 0.3,
  });
  const dialTop = new THREE.MeshStandardMaterial({
    map: dialFace,
    roughness: 0.5,
    metalness: 0.2,
  });
  const lensLettering = new THREE.MeshStandardMaterial({
    map: lensText,
    transparent: true,
    roughness: 0.5,
  });
  const plateLettering = new THREE.MeshStandardMaterial({
    map: plateText,
    transparent: true,
    metalness: 0.6,
    roughness: 0.3,
  });
  const zoomLettering = new THREE.MeshStandardMaterial({
    map: zoomMarks,
    transparent: true,
    roughness: 0.5,
  });
  const beam = new THREE.MeshBasicMaterial({
    color: "#f2c46b",
    alphaMap: beamAlpha,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const materials: THREE.Material[] = [
    body,
    leather,
    rubber,
    lensShell,
    metal,
    gold,
    frontGlass,
    innerGlass,
    shadow,
    lcd,
    afLamp,
    dialTop,
    lensLettering,
    plateLettering,
    zoomLettering,
    beam,
  ];

  // A soft contact shadow grounds the floating camera over the particle floor.
  const shadowFade = canvasTexture(
    128,
    128,
    (context) => {
      const fade = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      fade.addColorStop(0, "#fff");
      fade.addColorStop(1, "#000");
      context.fillStyle = fade;
      context.fillRect(0, 0, 128, 128);
    },
    false,
  );
  const groundShadow = new THREE.MeshBasicMaterial({
    color: "#000",
    alphaMap: shadowFade,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  textures.push(shadowFade);
  materials.push(groundShadow);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 2.6),
    groundShadow,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0.1, -1.25, 0.4);
  scene.add(ground);

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

  function place(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: [number, number, number] = [0, 0, 0],
    rotation: [number, number, number] = [0, 0, 0],
  ) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    parent.add(mesh);
    return mesh;
  }

  // Body shell with its front details.
  const shell = new THREE.Group();
  place(shell, bodyGeometry(), body);
  // Metal bayonet ring the lens locks into.
  place(
    shell,
    lathe([
      [0.56, 0],
      [0.7, 0],
      [0.7, 0.03],
      [0.64, 0.05],
      [0.56, 0.05],
    ]),
    metal,
    [mountCentre.x, mountCentre.y, mountCentre.z - 0.03],
  );
  // Lens release button and depth-of-field button beside the mount.
  place(shell, cylinderAlongZ(0.085, 0.06, 32), metal, [0.95, -0.3, 0.57]);
  place(shell, cylinderAlongZ(0.065, 0.07, 32), rubber, [0.95, -0.3, 0.6]);
  place(shell, cylinderAlongZ(0.05, 0.05, 24), rubber, [0.95, -0.62, 0.57]);
  // AF assist lamp between the grip and the mount lights while focusing.
  place(
    shell,
    new RoundedBoxGeometry(0.16, 0.1, 0.04, 2, 0.02),
    afLamp,
    [-0.48, 0.34, 0.56],
  );
  // Strap lugs on both shoulders.
  [-1.4, 1.38].forEach((x) => {
    place(
      shell,
      new THREE.TorusGeometry(0.07, 0.022, 10, 24),
      metal,
      [x, 0.38, -0.02],
      [0, Math.PI / 2, 0],
    );
  });
  // A thin gold line marks the studio's own body.
  place(
    shell,
    new THREE.BoxGeometry(2.42, 0.012, 0.012),
    gold,
    [0.05, -0.78, 0.565],
  );
  addPart(shell, [0, -0.3, -0.5], [0, 0, 0], [0, 0.38]);

  // Hand grip, wrapped in leatherette.
  const grip = new THREE.Group();
  place(grip, gripGeometry(), leather);
  addPart(grip, [-1.15, 0.1, 0.3], [0, -0.7, 0.2], [0.08, 0.5]);

  // Pentaprism housing with the studio name and the hot shoe.
  const prism = new THREE.Group();
  place(prism, prismGeometry(), body);
  place(
    prism,
    new THREE.PlaneGeometry(0.66, 0.103),
    plateLettering,
    [0.11, 0.78, 0.38],
  );
  place(
    prism,
    new THREE.BoxGeometry(0.42, 0.03, 0.36),
    metal,
    [0.11, 1.115, -0.06],
  );
  [-0.08, 0.3].forEach((x) => {
    place(prism, new THREE.BoxGeometry(0.04, 0.05, 0.36), metal, [
      x,
      1.14,
      -0.06,
    ]);
  });
  addPart(prism, [0, 1.05, 0.1], [-0.5, 0, 0.2], [0.12, 0.56]);

  // Top controls: mode dial, shutter release and main dial.
  const controls = new THREE.Group();
  const modeDial = new THREE.Group();
  modeDial.position.set(0.98, 0.66, -0.06);
  place(modeDial, new THREE.CylinderGeometry(0.25, 0.25, 0.15, 64), rubber);
  modeDial.add(ridgesAround(56, 0.252, 0.13));
  const dialCap = new THREE.CircleGeometry(0.24, 64);
  dialCap.rotateX(-Math.PI / 2);
  place(modeDial, dialCap, dialTop, [0, 0.076, 0]);
  controls.add(modeDial);

  const shutter = new THREE.Group();
  shutter.position.set(-0.98, 0.69, 0.72);
  shutter.rotation.x = 0.28;
  place(shutter, new THREE.CylinderGeometry(0.135, 0.15, 0.05, 48), metal);
  const shutterCap = place(
    shutter,
    new THREE.CylinderGeometry(0.1, 0.105, 0.07, 48),
    rubber,
    [0, 0.045, 0],
  );
  controls.add(shutter);

  const mainDial = new THREE.Group();
  mainDial.position.set(-0.98, 0.64, 0.42);
  place(
    mainDial,
    new THREE.CylinderGeometry(0.17, 0.17, 0.09, 48),
    rubber,
    [0, 0, 0],
    [0, 0, Math.PI / 2],
  );
  controls.add(mainDial);
  addPart(controls, [0, 1.25, 0.2], [0.6, 0, 0.4], [0.28, 0.66]);

  // Back: rear screen and the viewfinder eyecup.
  const back = new THREE.Group();
  place(
    back,
    new RoundedBoxGeometry(1.62, 1.04, 0.06, 3, 0.03),
    rubber,
    [0.18, -0.2, -0.57],
  );
  place(
    back,
    new THREE.PlaneGeometry(1.5, 0.92),
    lcd,
    [0.18, -0.2, -0.602],
    [0, Math.PI, 0],
  );
  place(
    back,
    new RoundedBoxGeometry(0.62, 0.42, 0.2, 3, 0.08),
    rubber,
    [0.11, 0.8, -0.55],
  );
  addPart(back, [0, 0, -1.3], [0, 0.6, 0], [0.14, 0.52]);

  // Lens, rear section: mount, base and the ribbed zoom ring.
  const lensRear = new THREE.Group();
  lensRear.position.copy(mountCentre);
  place(
    lensRear,
    lathe([
      [0.55, 0],
      [0.64, 0],
      [0.64, 0.05],
      [0.6, 0.05],
    ]),
    metal,
  );
  place(
    lensRear,
    lathe([
      [0.6, 0.05],
      [0.63, 0.06],
      [0.63, 0.2],
      [0.62, 0.21],
    ]),
    lensShell,
  );
  place(
    lensRear,
    lathe([
      [0.62, 0.21],
      [0.665, 0.225],
      [0.665, 0.575],
      [0.62, 0.59],
    ]),
    rubber,
  );
  lensRear.add(ridges(110, 0.668, 0.33, 0.4, rubber));
  // Inner barrel shows when the zoom extends.
  place(
    lensRear,
    lathe([
      [0.6, 0.5],
      [0.6, 0.78],
    ]),
    lensShell,
  );
  addPart(lensRear, [0.25, 0.1, 0.9], [0, 0, 1.4], [0.3, 0.74]);

  // Lens, front section: zoom scale, focus ring, front element and emblem.
  const lensFront = new THREE.Group();
  lensFront.position.copy(mountCentre);
  place(
    lensFront,
    lathe([
      [0.62, 0.59],
      [0.635, 0.6],
      [0.635, 0.72],
      [0.645, 0.73],
    ]),
    lensShell,
  );
  const zoomBand = new THREE.CylinderGeometry(
    0.637,
    0.637,
    0.07,
    64,
    1,
    true,
    Math.PI - 1.35,
    1.5,
  );
  zoomBand.rotateX(Math.PI / 2);
  place(lensFront, zoomBand, zoomLettering, [0, 0, 0.635]);
  place(
    lensFront,
    new THREE.TorusGeometry(0.64, 0.008, 8, 96),
    gold,
    [0, 0, 0.695],
  );
  const focusRing = new THREE.Group();
  place(
    focusRing,
    lathe([
      [0.645, 0.73],
      [0.66, 0.74],
      [0.66, 0.88],
      [0.65, 0.89],
    ]),
    rubber,
  );
  focusRing.add(ridges(140, 0.662, 0.13, 0.81, rubber));
  lensFront.add(focusRing);
  place(
    lensFront,
    lathe([
      [0.65, 0.89],
      [0.68, 0.96],
      [0.68, 1.04],
      [0.675, 1.06],
      [0.66, 1.065],
      [0.575, 1.065],
      [0.56, 1.03],
      [0.555, 0.94],
    ]),
    lensShell,
  );
  place(
    lensFront,
    new THREE.RingGeometry(0.575, 0.675, 96),
    lensLettering,
    [0, 0, 1.067],
  );
  // Recessed elements: a dark tube, two inner lenses and the curved front glass.
  place(lensFront, new THREE.CircleGeometry(0.56, 64), shadow, [0, 0, 0.62]);
  place(
    lensFront,
    new THREE.CircleGeometry(0.42, 64),
    innerGlass,
    [0, 0, 0.78],
  );
  place(lensFront, new THREE.CircleGeometry(0.5, 64), innerGlass, [0, 0, 0.88]);
  const capRadius = 1.4;
  const capAngle = Math.asin(0.555 / capRadius);
  const frontCap = new THREE.SphereGeometry(
    capRadius,
    96,
    12,
    0,
    Math.PI * 2,
    0,
    capAngle,
  );
  frontCap.rotateX(Math.PI / 2);
  place(lensFront, frontCap, frontGlass, [
    0,
    0,
    0.95 - capRadius * Math.cos(capAngle),
  ]);

  // The emblem is projected out of the lens on a soft gold beam.
  const beamCone = new THREE.CylinderGeometry(
    0.5,
    0.36,
    emblemFloat,
    64,
    1,
    true,
  );
  beamCone.rotateX(Math.PI / 2);
  const beamMesh = place(lensFront, beamCone, beam, [
    0,
    0,
    lensFrontFace + emblemFloat / 2,
  ]);
  const emblem = new THREE.Group();
  emblem.position.z = lensFrontFace + emblemFloat;
  lensFront.add(emblem);
  addPart(lensFront, [0.45, 0.2, 1.3], [0, 0, -1.8], [0.42, 0.86]);

  function ridgesAround(count: number, radius: number, height: number) {
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.02, height, 0.026),
      rubber,
      count,
    );
    const slot = new THREE.Object3D();
    for (let index = 0; index < count; index++) {
      const angle = (index / count) * Math.PI * 2;
      slot.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      slot.rotation.set(0, -angle, 0);
      slot.updateMatrix();
      mesh.setMatrixAt(index, slot.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  // A burst of light from the top of the camera when a picture is taken.
  const flashLight = new THREE.PointLight("#fff6e6", 0, 14, 1);
  flashLight.position.set(0.11, 1.2, 1.4);
  rig.add(flashLight);

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
      sharpenEmblemTextures(loaded, renderer);
      // Measure the model on its own, centre it, then size it to the front element.
      const bounds = new THREE.Box3().setFromObject(loaded);
      const size = bounds.getSize(new THREE.Vector3());
      const centre = bounds.getCenter(new THREE.Vector3());
      loaded.position.sub(centre);
      const holder = new THREE.Group();
      holder.scale.setScalar(0.92 / Math.max(size.x, size.y));
      holder.add(loaded);
      emblem.add(holder);
      // The monogram and globe have different pivots in the model, so turning
      // them one by one pulls the DS off the globe. Move both onto one turntable
      // on the globe's axis so they turn as a single piece over the still motto.
      const turntable = new THREE.Group();
      loaded.add(turntable);
      ["Monogram", "Globe"]
        .map((name) => loaded.getObjectByName(name))
        .filter((part): part is THREE.Object3D => Boolean(part))
        .forEach((part) => turntable.attach(part));
      turning = [{ part: turntable, base: 0 }];
    }
  } catch (error) {
    if (signal.aborted) {
      renderer.dispose();
      throw error;
    }
    // The camera still assembles without the emblem.
  }

  let assembly = 0;
  let viewDistance = 9.6;
  let running = false;
  let disposed = false;
  let previous = performance.now();
  let spin = 0;
  let spinBoost = 0;
  let leanX = 0;
  let leanY = 0;
  let targetLeanX = 0;
  let targetLeanY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let hover = 0;
  let hoverTarget = 0;
  let flash = 0;
  let press = 0;

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
    // The emblem rises out of the lens over the last part of the assembly.
    const reveal = easeInOut(clamp01((assembly - 0.8) / 0.2));
    emblem.scale.setScalar(Math.max(0.001, reveal));
    beamMesh.visible = reveal > 0.01;
    // Open, the camera turns to show its parts; whole, it settles toward the copy.
    rig.rotation.y = restYaw - (1 - assembly) * 0.7;
    rig.rotation.x = restPitch + (1 - assembly) * 0.2;
    // The view backs away while the parts are spread, so none leave the frame.
    view.position.z = viewDistance * (1 + (1 - assembly) * 0.6);
  }

  /** Hover, shutter and flash sit on top of the assembled pose. */
  function applyInteraction(seconds: number) {
    // Zooming in pushes the front of the lens out; the focus ring turns to lock.
    lensFront.position.z += hover * 0.16;
    focusRing.rotation.z = hover * 1.1;
    emblem.position.z = lensFrontFace + emblemFloat + hover * 0.14;
    emblem.scale.multiplyScalar(1 + hover * 0.08);
    afLamp.emissiveIntensity =
      hover * (1.4 + Math.max(0, Math.sin(seconds * 14)) * 2.2);
    gold.emissiveIntensity = hover * 0.6 + flash * 2;
    beam.opacity = (0.08 + hover * 0.2 + flash * 0.5) * emblem.scale.x;
    glint.intensity = hover * 12;
    glint.position.set(pointerX * 6, 0.4 - pointerY * 4, 3.2);
    flashLight.intensity = flash * 90;
    shutterCap.position.y = 0.045 - press * 0.03;
    lcd.emissiveIntensity = 0.12 + flash * 1.4;
    // The mirror slap gives the body a tiny shake.
    rig.position.x = Math.sin(seconds * 95) * 0.014 * press;
  }

  function render() {
    if (!disposed) renderer.render(scene, view);
  }

  // Software rendering draws at 30 fps; skipped frames keep their time for the next.
  const gate = createFrameGate();
  function frame(time: number) {
    if (!gate(time)) return;
    const elapsed = Math.min(time - previous, 60) / 1000;
    previous = time;
    const seconds = time / 1000;
    hover = approach(hover, hoverTarget, 6, elapsed);
    flash = approach(flash, 0, 7, elapsed);
    press = approach(press, 0, 9, elapsed);
    spinBoost = approach(spinBoost, 0, 1.6, elapsed);
    // The emblem turns once every 9 seconds, quicker under the pointer and after a shot.
    if (assembly > 0.9) {
      spin += elapsed * ((Math.PI * 2) / 9) * (1 + hover) + elapsed * spinBoost;
    }
    for (const { part, base } of turning) part.rotation.y = base + spin;
    leanX = approach(leanX, targetLeanX, 3.5, elapsed);
    leanY = approach(leanY, targetLeanY, 3.5, elapsed);
    rig.position.y = Math.sin(seconds * 0.9) * 0.06;
    applyAssembly();
    rig.rotation.z = Math.sin(seconds * 0.5) * 0.02;
    rig.rotation.x += leanX;
    rig.rotation.y += leanY;
    applyInteraction(seconds);
    render();
  }

  function setRunning(next: boolean) {
    running = next;
    previous = performance.now();
    renderer.setAnimationLoop(running ? frame : null);
    if (!running) {
      hover = 0;
      hoverTarget = 0;
      flash = 0;
      press = 0;
      applyAssembly();
      applyInteraction(0);
      render();
    }
  }

  function setAssembly(progress: number) {
    assembly = clamp01(progress);
    if (!running) {
      applyAssembly();
      applyInteraction(0);
      render();
    }
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    view.aspect = width / height;
    // Pull back on narrow frames so the open camera always fits.
    viewDistance = view.aspect < 1 ? 9.6 / view.aspect ** 0.6 : 9.6;
    view.position.z = viewDistance * (1 + (1 - assembly) * 0.6);
    view.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }

  // Compile every shader before the first frame. With parallel compilation
  // the browser does this off the main thread, so the page keeps scrolling
  // instead of freezing for seconds while the camera is built.
  beamMesh.visible = true;
  await renderer.compileAsync(scene, view);

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();
  applyAssembly();
  applyInteraction(0);
  render();
  stage.dataset.cameraReady = "";

  return {
    setAssembly,
    setRunning,
    aim(x, y) {
      pointerX = x;
      pointerY = y;
      // The lens follows the pointer as if it were tracking a subject.
      targetLeanY = x * 0.7;
      targetLeanX = y * 0.32;
    },
    setHover(active) {
      hoverTarget = active ? 1 : 0;
      if (!active) {
        targetLeanX = 0;
        targetLeanY = 0;
      }
    },
    fire() {
      if (!running || assembly < 0.9) return;
      flash = 1;
      press = 1;
      spinBoost = 9;
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
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
      textures.forEach((texture) => texture.dispose());
      scene.environment?.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
