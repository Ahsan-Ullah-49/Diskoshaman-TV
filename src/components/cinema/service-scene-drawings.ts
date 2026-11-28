/**
 * Hairline 3D scenes for the services pages, drawn on a 2D canvas with a
 * small perspective projection. Each scene takes the page accent, the eased
 * pointer (-1 to 1 across the hero) and how strongly the pointer is over it.
 */

export type SceneFrame = {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Seconds of scene time; it stands still with motion off. */
  time: number;
  pointerX: number;
  pointerY: number;
  /** 0 with no fine pointer over the hero, easing to 1 while one is. */
  hover: number;
  /** The accent as "r, g, b". */
  accent: string;
};

export type SceneKind =
  "aperture" | "network" | "growth" | "ribbon" | "reels" | "lens";

type Point3 = [number, number, number];

function turn([x, y, z]: Point3, yaw: number, pitch: number): Point3 {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const turnedX = x * cosYaw + z * sinYaw;
  const turnedZ = -x * sinYaw + z * cosYaw;
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  return [
    turnedX,
    y * cosPitch - turnedZ * sinPitch,
    y * sinPitch + turnedZ * cosPitch,
  ];
}

/** Screen x, y and a depth factor (larger is nearer) for a turned point. */
function project(
  [x, y, z]: Point3,
  centreX: number,
  centreY: number,
  scale: number,
  distance = 4,
) {
  const depth = distance / (distance + z);
  return {
    x: centreX + x * scale * depth,
    y: centreY + y * scale * depth,
    depth,
  };
}

function tint(frame: SceneFrame, alpha: number) {
  return `rgba(${frame.accent}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

function glowPool(frame: SceneFrame, x: number, y: number, radius: number) {
  const { context } = frame;
  const pool = context.createRadialGradient(x, y, 0, x, y, radius);
  pool.addColorStop(0, tint(frame, 0.13 + frame.hover * 0.05));
  pool.addColorStop(1, tint(frame, 0));
  context.fillStyle = pool;
  context.fillRect(0, 0, frame.width, frame.height);
}

/** A seeded random sequence so every visit draws the same scene. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

/* Overview: a camera aperture with a dense focus ring and two iris layers. */
function drawAperture(frame: SceneFrame) {
  const { context, width, height, time, pointerX, pointerY, hover } = frame;
  const radius = Math.min(width * 0.46, height * 0.46, 430);
  // The lens leans a little toward the pointer.
  const centreX = width / 2 + pointerX * hover * radius * 0.06;
  const centreY = height / 2 + pointerY * hover * radius * 0.06;
  const pointerAngle = Math.atan2(pointerY * height, pointerX * width);
  glowPool(frame, centreX, centreY, radius * 1.1);
  context.lineWidth = 1;

  const ringTurn = time * 0.025 + pointerX * hover * 0.9;
  for (const [count, inner, outer, alpha, direction] of [
    [240, 1.09, 1.12, 0.24, 1],
    [120, 1.2, 1.24, 0.16, -1],
    [72, 0.93, 0.96, 0.18, 1],
  ] as const) {
    context.strokeStyle = tint(frame, alpha + hover * 0.08);
    context.beginPath();
    for (let tick = 0; tick < count; tick++) {
      const angle = (tick / count) * Math.PI * 2 + ringTurn * direction;
      const long = tick % 10 === 0 ? 0.035 : 0;
      context.moveTo(
        centreX + Math.cos(angle) * radius * (inner - long),
        centreY + Math.sin(angle) * radius * (inner - long),
      );
      context.lineTo(
        centreX + Math.cos(angle) * radius * outer,
        centreY + Math.sin(angle) * radius * outer,
      );
    }
    context.stroke();
  }

  context.strokeStyle = tint(frame, 0.14);
  for (const scale of [0.9, 1, 1.18, 1.3]) {
    context.beginPath();
    context.arc(centreX, centreY, radius * scale, 0, Math.PI * 2);
    context.stroke();
  }

  // A bright arc on the focus ring follows the pointer round the lens.
  if (hover > 0.01) {
    context.strokeStyle = tint(frame, 0.75 * hover);
    context.lineWidth = 2;
    context.beginPath();
    context.arc(
      centreX,
      centreY,
      radius * 1.105,
      pointerAngle - 0.32,
      pointerAngle + 0.32,
    );
    context.stroke();
    context.lineWidth = 1;
  }

  // Two iris layers turning against each other; the pointer opens them.
  const breathe = 0.5 + Math.sin(time * 0.35) * 0.5;
  const opening = radius * (0.26 + breathe * 0.14 + hover * 0.2);
  for (const [count, offset, alpha, spin] of [
    [9, 0, 0.42, -0.04],
    [9, Math.PI / 9, 0.2, 0.03],
  ] as const) {
    const bladeTurn = time * spin - pointerX * hover * 0.8 + offset;
    const reach = Math.sqrt(Math.max(0, radius * radius - opening * opening));
    context.strokeStyle = tint(frame, alpha + hover * 0.1);
    context.lineWidth = 1.2;
    context.beginPath();
    for (let blade = 0; blade < count; blade++) {
      const angle = (blade / count) * Math.PI * 2 + bladeTurn;
      const touchX = centreX + Math.cos(angle) * opening;
      const touchY = centreY + Math.sin(angle) * opening;
      const alongX = -Math.sin(angle);
      const alongY = Math.cos(angle);
      context.moveTo(
        touchX - alongX * reach * 0.3,
        touchY - alongY * reach * 0.3,
      );
      context.lineTo(touchX + alongX * reach, touchY + alongY * reach);
    }
    context.stroke();
  }

  // Fine spokes between the iris and the ring.
  context.strokeStyle = tint(frame, 0.08 + hover * 0.06);
  context.lineWidth = 1;
  context.beginPath();
  for (let spoke = 0; spoke < 36; spoke++) {
    const angle = (spoke / 36) * Math.PI * 2 - ringTurn * 0.5;
    context.moveTo(
      centreX + Math.cos(angle) * radius * 0.62,
      centreY + Math.sin(angle) * radius * 0.62,
    );
    context.lineTo(
      centreX + Math.cos(angle) * radius * 0.88,
      centreY + Math.sin(angle) * radius * 0.88,
    );
  }
  context.stroke();
}

/* Corporate: a turning wireframe globe with arcs of light between offices. */
const networkRandom = seeded(11);
const networkNodes: Point3[] = Array.from({ length: 30 }, () => {
  const latitude = Math.asin(networkRandom() * 1.7 - 0.85);
  const longitude = networkRandom() * Math.PI * 2;
  return [
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    Math.cos(latitude) * Math.sin(longitude),
  ];
});
const networkLinks = networkNodes.map((_, index) => [
  index,
  (index * 7 + 3) % networkNodes.length,
]);

function drawNetwork(frame: SceneFrame) {
  const { context, width, height, time, pointerX, pointerY, hover } = frame;
  const radius = Math.min(width * 0.34, height * 0.4, 360);
  const centreX = width / 2;
  const centreY = height / 2;
  const yaw = time * 0.1 + pointerX * 0.7;
  const pitch = -0.3 + pointerY * 0.35;
  glowPool(frame, centreX, centreY, radius * 1.5);
  const place = (point: Point3) =>
    project(turn(point, yaw, pitch), centreX, centreY, radius);

  // Parallels and meridians: the far side is fainter than the near side.
  function strokeCurve(points: Point3[], alpha: number) {
    for (let index = 1; index < points.length; index++) {
      const from = place(points[index - 1]);
      const to = place(points[index]);
      context.strokeStyle = tint(frame, alpha * (from.depth - 0.55) * 1.6);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }
  }
  context.lineWidth = 1;
  for (let latitude = -60; latitude <= 60; latitude += 20) {
    const angle = (latitude * Math.PI) / 180;
    strokeCurve(
      Array.from({ length: 49 }, (_, step): Point3 => {
        const around = (step / 48) * Math.PI * 2;
        return [
          Math.cos(angle) * Math.cos(around),
          Math.sin(angle),
          Math.cos(angle) * Math.sin(around),
        ];
      }),
      0.32,
    );
  }
  for (let meridian = 0; meridian < 12; meridian++) {
    const around = (meridian / 12) * Math.PI;
    strokeCurve(
      Array.from({ length: 33 }, (_, step): Point3 => {
        const angle = (step / 32) * Math.PI * 2;
        return [
          Math.cos(angle) * Math.cos(around),
          Math.sin(angle),
          Math.cos(angle) * Math.sin(around),
        ];
      }),
      0.22,
    );
  }

  // Arcs rise off the surface; a pulse of light runs along each one.
  networkLinks.forEach(([from, to], index) => {
    const start = networkNodes[from];
    const end = networkNodes[to];
    const arc: Point3[] = Array.from({ length: 25 }, (_, step) => {
      const share = step / 24;
      const lift = 1 + Math.sin(share * Math.PI) * (0.28 + hover * 0.12);
      const mixed: Point3 = [
        start[0] + (end[0] - start[0]) * share,
        start[1] + (end[1] - start[1]) * share,
        start[2] + (end[2] - start[2]) * share,
      ];
      const length = Math.hypot(...mixed) || 1;
      return [
        (mixed[0] / length) * lift,
        (mixed[1] / length) * lift,
        (mixed[2] / length) * lift,
      ];
    });
    strokeCurve(arc, 0.4 + hover * 0.3);
    const pulse = arc[Math.floor(((time * 0.22 + index * 0.137) % 1) * 24)];
    const spot = place(pulse);
    context.fillStyle = tint(frame, (spot.depth - 0.5) * (1.3 + hover));
    context.beginPath();
    context.arc(spot.x, spot.y, 1.6 + hover * 1.4, 0, Math.PI * 2);
    context.fill();
  });

  for (const node of networkNodes) {
    const spot = place(node);
    context.fillStyle = tint(frame, (spot.depth - 0.6) * 2.2);
    context.beginPath();
    context.arc(spot.x, spot.y, 2.2 * spot.depth, 0, Math.PI * 2);
    context.fill();
  }
}

/* Business: a living bar chart of columns rising off a perspective floor. */
const growthSize = 7;

function drawGrowth(frame: SceneFrame) {
  const { context, width, height, time, pointerX, pointerY, hover } = frame;
  const scale = Math.min(width * 0.075, height * 0.105, 82);
  const centreX = width / 2;
  const centreY = height * 0.7;
  // Sway either side of a three-quarter view rather than spinning away.
  const yaw = -0.78 + Math.sin(time * 0.12) * 0.25 + pointerX * 0.5;
  const pitch = 0.42 + pointerY * 0.12;
  const half = growthSize / 2;
  glowPool(frame, centreX, centreY - scale, scale * 6);
  const place = (point: Point3) =>
    project(turn(point, yaw, pitch), centreX, centreY, scale, 14);

  context.lineWidth = 1;
  context.strokeStyle = tint(frame, 0.16);
  context.beginPath();
  for (let line = 0; line <= growthSize; line++) {
    const offset = line - half;
    for (const [from, to] of [
      [
        [offset, 0, -half],
        [offset, 0, half],
      ],
      [
        [-half, 0, offset],
        [half, 0, offset],
      ],
    ] as [Point3, Point3][]) {
      const a = place(from);
      const b = place(to);
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
    }
  }
  context.stroke();

  // Columns breathe in a travelling wave; the pointer lifts the whole chart.
  const pointerColumn = pointerX * half;
  const pointerRow = pointerY * half;
  const columns: { corners: Point3[]; depth: number; lift: number }[] = [];
  for (let row = 0; row < growthSize; row++) {
    for (let column = 0; column < growthSize; column++) {
      if ((row * 3 + column * 5) % 4 === 0) continue;
      const x = column - half + 0.5;
      const z = row - half + 0.5;
      const trend =
        0.4 + ((column + growthSize - row) / (growthSize * 2)) * 2.4;
      const wave = Math.sin(time * 0.9 + column * 0.6 + row * 0.4) * 0.35;
      const near = Math.max(
        0,
        1 - Math.hypot(x - pointerColumn, z - pointerRow) / 2.6,
      );
      const lift = Math.max(0.15, trend + wave + near * hover * 1.6);
      const size = 0.32;
      const corners: Point3[] = [
        [x - size, 0, z - size],
        [x + size, 0, z - size],
        [x + size, 0, z + size],
        [x - size, 0, z + size],
      ].flatMap(([cx, , cz]): Point3[] => [
        [cx, 0, cz],
        [cx, -lift, cz],
      ]);
      columns.push({ corners, depth: turn([x, 0, z], yaw, pitch)[2], lift });
    }
  }
  columns.sort((a, b) => b.depth - a.depth);
  for (const { corners, lift } of columns) {
    const screen = corners.map(place);
    const top = [screen[1], screen[3], screen[5], screen[7]];
    context.fillStyle = tint(frame, 0.03 + lift * 0.025 + hover * 0.03);
    context.beginPath();
    top.forEach((point, index) =>
      index
        ? context.lineTo(point.x, point.y)
        : context.moveTo(point.x, point.y),
    );
    context.closePath();
    context.fill();
    context.strokeStyle = tint(frame, 0.16 + lift * 0.06 + hover * 0.08);
    context.stroke();
    context.beginPath();
    for (let corner = 0; corner < 4; corner++) {
      context.moveTo(screen[corner * 2].x, screen[corner * 2].y);
      context.lineTo(screen[corner * 2 + 1].x, screen[corner * 2 + 1].y);
    }
    context.stroke();
  }
}

/* Brand film: a twisting strip of film looping through space. */
function drawRibbon(frame: SceneFrame) {
  const { context, width, height, time, pointerX, pointerY, hover } = frame;
  const scale = Math.min(width * 0.2, height * 0.34, 260);
  const centreX = width / 2;
  const centreY = height / 2;
  const yaw = time * 0.08 + pointerX * 0.8;
  const pitch = 0.25 + pointerY * 0.4;
  const steps = 160;
  const halfWidth = 0.2 + hover * 0.05;
  glowPool(frame, centreX, centreY, scale * 2.4);

  const edges: {
    a: ReturnType<typeof project>;
    b: ReturnType<typeof project>;
  }[] = [];
  for (let step = 0; step <= steps; step++) {
    const t = (step / steps) * Math.PI * 2;
    const point: Point3 = [
      1.7 * Math.sin(t),
      0.55 * Math.sin(2 * t),
      1.1 * Math.cos(t),
    ];
    const tangent: Point3 = [
      1.7 * Math.cos(t),
      1.1 * Math.cos(2 * t),
      -1.1 * Math.sin(t),
    ];
    const tangentLength = Math.hypot(...tangent) || 1;
    const side: Point3 = [
      -tangent[2] / tangentLength,
      0,
      tangent[0] / tangentLength,
    ];
    const sideLength = Math.hypot(...side) || 1;
    const across: Point3 = [
      side[0] / sideLength,
      side[1],
      side[2] / sideLength,
    ];
    const up: Point3 = [
      (tangent[1] * across[2] - tangent[2] * across[1]) / tangentLength,
      (tangent[2] * across[0] - tangent[0] * across[2]) / tangentLength,
      (tangent[0] * across[1] - tangent[1] * across[0]) / tangentLength,
    ];
    // The strip turns about its own length as it travels.
    const twist = t * 2 + time * 0.4;
    const direction: Point3 = [
      across[0] * Math.cos(twist) + up[0] * Math.sin(twist),
      across[1] * Math.cos(twist) + up[1] * Math.sin(twist),
      across[2] * Math.cos(twist) + up[2] * Math.sin(twist),
    ];
    const edgeA: Point3 = [
      point[0] + direction[0] * halfWidth,
      point[1] + direction[1] * halfWidth,
      point[2] + direction[2] * halfWidth,
    ];
    const edgeB: Point3 = [
      point[0] - direction[0] * halfWidth,
      point[1] - direction[1] * halfWidth,
      point[2] - direction[2] * halfWidth,
    ];
    edges.push({
      a: project(turn(edgeA, yaw, pitch), centreX, centreY, scale, 6),
      b: project(turn(edgeB, yaw, pitch), centreX, centreY, scale, 6),
    });
  }

  context.lineWidth = 1;
  // Frame lines travel along the strip like film through a gate.
  const flow = (time * (6 + hover * 10)) % 4;
  for (let step = 1; step < edges.length; step++) {
    const previous = edges[step - 1];
    const current = edges[step];
    const depth = (current.a.depth + current.b.depth) / 2;
    const alpha = 0.12 + (depth - 0.75) * 1.4 + hover * 0.08;
    context.strokeStyle = tint(frame, alpha);
    context.beginPath();
    context.moveTo(previous.a.x, previous.a.y);
    context.lineTo(current.a.x, current.a.y);
    context.moveTo(previous.b.x, previous.b.y);
    context.lineTo(current.b.x, current.b.y);
    context.stroke();
    if (Math.floor(step + flow) % 4 === 0) {
      context.strokeStyle = tint(frame, alpha * 0.7);
      context.beginPath();
      context.moveTo(current.a.x, current.a.y);
      context.lineTo(current.b.x, current.b.y);
      context.stroke();
      // Sprocket marks just inside each edge.
      for (const share of [0.14, 0.86]) {
        const x = current.a.x + (current.b.x - current.a.x) * share;
        const y = current.a.y + (current.b.y - current.a.y) * share;
        context.fillStyle = tint(frame, alpha);
        context.fillRect(x - 1, y - 1, 2, 2);
      }
    }
  }
}

/* Social reels: phone-shaped frames turning on a carousel. */
const reelCount = 9;

function drawReels(frame: SceneFrame) {
  const { context, width, height, time, pointerX, pointerY, hover } = frame;
  const scale = Math.min(width * 0.11, height * 0.19, 160);
  const centreX = width / 2;
  const centreY = height * 0.52;
  const spin = time * (0.22 + hover * 0.25) + pointerX * 0.9;
  const pitch = 0.22 + pointerY * 0.22;
  const ringRadius = 3.2;
  glowPool(frame, centreX, centreY, scale * 3);

  const cards = Array.from({ length: reelCount }, (_, index) => {
    const angle = (index / reelCount) * Math.PI * 2 + spin;
    const facing = Math.cos(angle);
    // The card nearest the viewer lifts out of the ring while pointed at.
    const lift = 1 + Math.max(0, facing) ** 8 * hover * 0.18;
    const halfWidth = 0.42 * lift;
    const halfHeight = 0.75 * lift;
    const corner = 0.12 * lift;
    const outline: [number, number][] = [
      [-halfWidth + corner, -halfHeight],
      [halfWidth - corner, -halfHeight],
      [halfWidth, -halfHeight + corner],
      [halfWidth, halfHeight - corner],
      [halfWidth - corner, halfHeight],
      [-halfWidth + corner, halfHeight],
      [-halfWidth, halfHeight - corner],
      [-halfWidth, -halfHeight + corner],
    ];
    const place = (x: number, y: number) => {
      const local: Point3 = [
        Math.sin(angle) * ringRadius + Math.cos(angle) * x,
        y,
        -Math.cos(angle) * ringRadius + Math.sin(angle) * x,
      ];
      return project(turn(local, 0, pitch), centreX, centreY, scale, 9);
    };
    return { angle, facing, outline, place, halfHeight };
  });
  cards.sort((a, b) => a.facing - b.facing);

  context.lineWidth = 1;
  for (const { facing, outline, place, halfHeight } of cards) {
    const alpha = 0.08 + Math.max(0, facing + 0.4) * 0.26 + hover * 0.08;
    const points = outline.map(([x, y]) => place(x, y));
    context.beginPath();
    points.forEach((point, index) =>
      index
        ? context.lineTo(point.x, point.y)
        : context.moveTo(point.x, point.y),
    );
    context.closePath();
    context.fillStyle = tint(frame, alpha * 0.18);
    context.fill();
    context.strokeStyle = tint(frame, alpha);
    context.stroke();
    // A play mark and a progress line on each reel.
    const play = [place(-0.1, -0.13), place(0.14, 0), place(-0.1, 0.13)];
    context.beginPath();
    context.moveTo(play[0].x, play[0].y);
    context.lineTo(play[1].x, play[1].y);
    context.lineTo(play[2].x, play[2].y);
    context.closePath();
    context.stroke();
    const progress = (time * 0.12 + facing) % 1;
    const barStart = place(-0.3, halfHeight - 0.14);
    const barEnd = place(0.3, halfHeight - 0.14);
    const barNow = place(-0.3 + Math.abs(progress) * 0.6, halfHeight - 0.14);
    context.strokeStyle = tint(frame, alpha * 0.45);
    context.beginPath();
    context.moveTo(barStart.x, barStart.y);
    context.lineTo(barEnd.x, barEnd.y);
    context.stroke();
    context.strokeStyle = tint(frame, alpha * 1.4);
    context.beginPath();
    context.moveTo(barStart.x, barStart.y);
    context.lineTo(barNow.x, barNow.y);
    context.stroke();
  }
}

/* Photography: a tunnel of lens elements with soft bokeh drifting through it. */
const bokehRandom = seeded(23);
const bokeh = Array.from({ length: 28 }, () => ({
  x: bokehRandom() * 2 - 1,
  y: bokehRandom() * 2 - 1,
  size: 0.025 + bokehRandom() * 0.07,
  drift: 0.02 + bokehRandom() * 0.05,
  phase: bokehRandom() * Math.PI * 2,
}));

function drawLens(frame: SceneFrame) {
  const { context, width, height, time, pointerX, pointerY, hover } = frame;
  const radius = Math.min(width * 0.4, height * 0.44, 420);
  const centreX = width / 2;
  const centreY = height / 2;
  glowPool(frame, centreX, centreY, radius * 1.2);
  context.lineWidth = 1;

  // Each element sits deeper in the barrel; the pointer shifts the far end.
  const rings = 11;
  for (let ring = 0; ring < rings; ring++) {
    const depth = ring / (rings - 1);
    const size = radius * (1.12 - depth * 0.82);
    const x = centreX + pointerX * depth * radius * 0.28;
    const y = centreY + pointerY * depth * radius * 0.28;
    const focus = 0.5 + Math.sin(time * 0.6 - depth * 3) * 0.5;
    context.strokeStyle = tint(
      frame,
      0.08 + (1 - depth) * 0.14 + focus * 0.08 + hover * 0.1,
    );
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.stroke();
    if (ring % 3 === 0) {
      const ticks = 60;
      const spin = time * (ring % 2 ? -0.03 : 0.03) + pointerX * hover * 0.5;
      context.beginPath();
      for (let tick = 0; tick < ticks; tick++) {
        const angle = (tick / ticks) * Math.PI * 2 + spin;
        context.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
        context.lineTo(
          x + Math.cos(angle) * size * 0.95,
          y + Math.sin(angle) * size * 0.95,
        );
      }
      context.stroke();
    }
  }

  // The shutter at the back of the barrel opens as the pointer arrives.
  const backX = centreX + pointerX * radius * 0.28;
  const backY = centreY + pointerY * radius * 0.28;
  const backRadius = radius * 0.3;
  const opening =
    backRadius * (0.35 + hover * 0.4 + Math.sin(time * 0.4) * 0.08);
  const reach = Math.sqrt(Math.max(0, backRadius ** 2 - opening ** 2));
  context.strokeStyle = tint(frame, 0.32 + hover * 0.15);
  context.beginPath();
  for (let blade = 0; blade < 7; blade++) {
    const angle = (blade / 7) * Math.PI * 2 - time * 0.05;
    const touchX = backX + Math.cos(angle) * opening;
    const touchY = backY + Math.sin(angle) * opening;
    context.moveTo(touchX, touchY);
    context.lineTo(
      touchX - Math.sin(angle) * reach,
      touchY + Math.cos(angle) * reach,
    );
  }
  context.stroke();

  // Out-of-focus highlights; pulling focus with the pointer sharpens them.
  for (const light of bokeh) {
    const x =
      centreX +
      (light.x + Math.sin(time * light.drift + light.phase) * 0.1) *
        radius *
        1.3;
    const y =
      centreY +
      (light.y + Math.cos(time * light.drift + light.phase) * 0.1) * radius;
    const size = radius * light.size * (1.4 - hover * 0.5);
    const glow = context.createRadialGradient(x, y, 0, x, y, size);
    glow.addColorStop(0, tint(frame, 0.05 + hover * 0.1));
    glow.addColorStop(0.75, tint(frame, 0.08 + hover * 0.12));
    glow.addColorStop(1, tint(frame, 0));
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }
}

export const sceneDrawings: Record<SceneKind, (frame: SceneFrame) => void> = {
  aperture: drawAperture,
  network: drawNetwork,
  growth: drawGrowth,
  ribbon: drawRibbon,
  reels: drawReels,
  lens: drawLens,
};
