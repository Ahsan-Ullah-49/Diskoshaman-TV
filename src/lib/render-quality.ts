/**
 * Rendering budget for the site's 3D scenes and canvas fields.
 *
 * On machines without a usable GPU, browsers draw WebGL in software on the
 * CPU (SwiftShader, Microsoft Basic Render Driver, llvmpipe). The same scenes
 * then cost ten times more and scrolling stutters. Those machines get the
 * same design at a lower pixel ratio, without multisampling and at 30 frames
 * a second, so the page stays smooth.
 */

const softwarePattern = /swiftshader|basic render|llvmpipe|softpipe|software/i;
let softwareRenderer: boolean | undefined;

/** True when WebGL is drawn in software. Measured once and cached. */
export function isSoftwareRenderer(): boolean {
  if (softwareRenderer !== undefined) return softwareRenderer;
  softwareRenderer = false;
  if (typeof document === "undefined") return softwareRenderer;
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl");
    if (!gl) return softwareRenderer;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    softwareRenderer = softwarePattern.test(name);
    // Release the probe context straight away; browsers limit live contexts.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    // Keep the full budget when the renderer cannot be read.
  }
  return softwareRenderer;
}

/** Pixel ratio for a canvas: the scene's own cap, or 1 when drawing in software. */
export function canvasPixelRatio(cap: number): number {
  const ratio = Math.min(window.devicePixelRatio || 1, cap);
  return isSoftwareRenderer() ? Math.min(ratio, 1) : ratio;
}

/** Whether a WebGL scene should ask for multisampled edges. */
export function wantsAntialias(): boolean {
  return !isSoftwareRenderer();
}

/** Shortest time between drawn frames, in milliseconds. */
export function frameBudget(): number {
  return isSoftwareRenderer() ? 1000 / 30 : 0;
}

/**
 * Returns a gate for an animation loop: call it with the frame time and
 * skip the frame when it returns false. Keeps software rendering at 30 fps.
 */
export function createFrameGate() {
  const budget = frameBudget();
  let last = -Infinity;
  return (time: number) => {
    if (!budget) return true;
    // Allow a little slack so a 60 Hz display settles on every other frame.
    if (time - last < budget - 4) return false;
    last = time;
    return true;
  };
}
