import * as THREE from "three";

const lightVertex = ` 
  varying vec2 screenUV;

  void main() {
    screenUV = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

const lightFragment = `
  uniform float aspect;
  uniform vec2 focus;
  uniform vec2 aim;
  uniform vec2 keyDirection;
  uniform vec2 washDirection;
  varying vec2 screenUV;

  float spill(vec2 point, vec2 source, vec2 direction, float spread) {
    vec2 ray = point - source;
    float distanceAlong = dot(ray, direction);
    float edge = abs(ray.x * direction.y - ray.y * direction.x);
    float width = 0.023 + max(distanceAlong, 0.0) * spread;
    float softness = 1.0 - smoothstep(width * 0.16, width, edge);
    return softness * smoothstep(0.0, 0.12, distanceAlong)
      * (1.0 - smoothstep(0.50, 1.11, distanceAlong));
  }

  void main() {
    vec2 uv = vec2(screenUV.x, 1.0 - screenUV.y);
    vec2 point = (uv - focus) * vec2(aspect, 1.0);
    vec2 source = vec2(min(aspect * 0.31, 0.43), -focus.y - 0.03 + aim.y * 0.04);
    float beam = spill(point, source, keyDirection, 0.30);
    float wash = spill(
      point,
      source + vec2(-min(aspect * 0.18, 0.28), -0.07),
      washDirection,
      0.46
    );
    vec2 hazePoint = (point - vec2(aim.x * 0.07, -0.03)) * vec2(1.08, 1.72);
    float haze = exp(-dot(hazePoint, hazePoint) * 2.6);
    float horizon = exp(-abs(point.y - 0.17) * 6.5);
    float edgeFade = 1.0 - smoothstep(0.45, 0.78, abs(uv.y - 0.48));
    float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    vec3 color = vec3(0.040, 0.052, 0.069);
    color += vec3(0.054, 0.068, 0.092) * haze;
    color += vec3(0.030, 0.040, 0.058) * horizon;
    color += vec3(0.22, 0.145, 0.077) * beam;
    color += vec3(0.067, 0.092, 0.132) * wash;
    color = color * edgeFade + (grain - 0.5) * 0.013;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const dustVertex = `
  uniform float time;
  uniform float rotation;
  uniform float pixelRatio;
  attribute float seed;
  attribute float airborne;
  varying float glow;
  varying float tint;

  void main() {
    vec3 point = position;
    float drift = time * 0.91 + rotation * 0.28;
    float radius = length(point.xz * vec2(1.0, 0.91));
    float pulse = 0.5 + 0.5 * cos(radius * 0.94 - drift);
    float clearing = smoothstep(3.55, 4.85, radius);
    if (airborne > 0.5) {
      point.x += sin(time * 0.29 + seed * 12.0) * 0.42;
      point.y += cos(time * 0.38 + seed * 17.0) * 0.26;
      glow = (0.19 + 0.38 * pow(0.5 + 0.5 * sin(drift * 0.61 + seed * 13.0), 2.0));
      tint = 0.26 + seed * 0.62;
    } else {
      float crest = pow(pulse, 2.25);
      point.y += clearing * (crest * 1.08 + sin(point.x * 0.36 + drift * 0.51) * 0.36);
      glow = clearing * (0.15 + 0.62 * crest) * (0.66 + seed * 0.34);
      tint = 0.76 + crest * 0.24;
    }
    vec4 view = modelViewMatrix * vec4(point, 1.0);
    float depth = max(1.0, -view.z);
    glow *= 1.0 - smoothstep(11.0, 32.0, depth);
    float size = mix(26.0, 18.0, airborne) + seed * 12.0;
    gl_PointSize = clamp(size / depth, 1.0, 3.9) * pixelRatio;
    gl_Position = projectionMatrix * view;
  }
`;

const dustFragment = `
  varying float glow;
  varying float tint;

  void main() {
    float radius = length(gl_PointCoord - 0.5);
    float softDot = 1.0 - smoothstep(0.12, 0.49, radius);
    vec3 color = mix(vec3(0.48, 0.65, 0.84), vec3(1.0, 0.72, 0.43), tint);
    gl_FragColor = vec4(color, glow * softDot);
  }
`;

/** Light and particles share the reel camera so the backdrop moves with the set. */
export function createReelAtmosphere() {
  const root = new THREE.Group();
  const time = { value: 0 };
  const rotation = { value: 0 };
  const aim = { value: new THREE.Vector2() };
  const aspect = { value: 1 };
  const focus = { value: new THREE.Vector2(0.5, 0.5) };
  const keyDirection = { value: new THREE.Vector2(-0.56, 0.95).normalize() };
  const washDirection = { value: new THREE.Vector2(-0.38, 1).normalize() };
  const pixelRatio = { value: 1 };

  const light = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: { aim, aspect, focus, keyDirection, washDirection },
      vertexShader: lightVertex,
      fragmentShader: lightFragment,
      depthTest: false,
      depthWrite: false,
    }),
  );
  light.frustumCulled = false;
  light.renderOrder = -10;
  root.add(light);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(10.8, 10),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: `
        varying vec2 groundUV;
        void main() {
          groundUV = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 groundUV;
        void main() {
          float radius = length((groundUV - 0.5) * 2.0);
          float opacity = (1.0 - smoothstep(0.48, 0.98, radius)) * 0.82;
          gl_FragColor = vec4(0.019, 0.022, 0.028, opacity);
        }
      `,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -1.06, 0.38);
  root.add(shadow);

  const columns = 64;
  const rows = 29;
  const floorCount = columns * rows;
  const count = floorCount + 72;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const layers = new Float32Array(count);
  let seed = 31415;
  const sample = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    seeds[i] = sample();
    if (i < floorCount) {
      positions[offset] = -22 + (i % columns) * 0.61 + sample() * 0.14;
      positions[offset + 1] = -1.16;
      positions[offset + 2] = -16.5 + Math.floor(i / columns) * 0.79;
    } else {
      layers[i] = 1;
      positions[offset] = -17 + sample() * 26;
      positions[offset + 1] = -0.2 + sample() * 7;
      positions[offset + 2] = -15 + sample() * 17;
    }
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
  dustGeometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
  dustGeometry.setAttribute("airborne", new THREE.BufferAttribute(layers, 1));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.ShaderMaterial({
      uniforms: { time, rotation, pixelRatio },
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  dust.frustumCulled = false;
  dust.renderOrder = 1;
  root.add(dust);

  return {
    root,
    resize(width: number, height: number, x: number, y: number, scale: number) {
      aspect.value = width / height;
      focus.value.set(x, y);
      pixelRatio.value = scale;
    },
    update(seconds: number, yaw: number, x: number, y: number, sweep: number) {
      time.value = seconds;
      rotation.value = yaw;
      aim.value.set(x, y);
      keyDirection.value.set(-0.56 + sweep * 0.2 + x * 0.28, 0.95).normalize();
      washDirection.value.set(-0.38 - x * 0.16, 1).normalize();
    },
    dispose() {
      for (const object of [light, shadow, dust]) {
        object.geometry.dispose();
        object.material.dispose();
      }
      root.removeFromParent();
    },
  };
}
