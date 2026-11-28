import * as THREE from "three";
import { isSoftwareRenderer } from "@/lib/render-quality";

// Properties only the physical model understands.
const physicalOnly = [
  "clearcoat",
  "clearcoatRoughness",
  "iridescence",
  "iridescenceIOR",
  "iridescenceThicknessRange",
  "iridescenceThicknessMinimum",
  "iridescenceThicknessMaximum",
  "transmission",
  "sheen",
  "specularIntensity",
] as const;

/**
 * A polished surface material. With a GPU it is the full physical model
 * (clear coat, iridescence); drawn in software, those shaders take seconds
 * to compile and freeze the page, so the standard model stands in with the
 * same colour, metalness and roughness.
 */
export function surfaceMaterial(
  parameters: THREE.MeshPhysicalMaterialParameters,
): THREE.MeshStandardMaterial {
  if (!isSoftwareRenderer()) return new THREE.MeshPhysicalMaterial(parameters);
  const standard: Record<string, unknown> = { ...parameters };
  for (const key of physicalOnly) delete standard[key];
  return new THREE.MeshStandardMaterial(
    standard as THREE.MeshStandardMaterialParameters,
  );
}
