import { Mesh, type Object3D, type WebGLRenderer } from "three";

/**
 * Sample the emblem artwork with the GPU's best texture filtering. The face
 * texture is 2048 px, and anisotropic filtering keeps the lettering sharp
 * while the emblem turns away from the viewer.
 */
export function sharpenEmblemTextures(
  model: Object3D,
  renderer: WebGLRenderer,
) {
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  model.traverse((part) => {
    if (!(part instanceof Mesh)) return;
    for (const material of [part.material].flat()) {
      if (!material.map) continue;
      material.map.anisotropy = anisotropy;
      material.map.needsUpdate = true;
    }
  });
}
