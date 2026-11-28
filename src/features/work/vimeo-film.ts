import type { Project } from "@/content/projects";

export const vimeoOrigin = "https://player.vimeo.com";

type EmbedOptions = {
  autoplay?: boolean;
  muted?: boolean;
  /** Repeat the film, for previews that play inside their frame. */
  loop?: boolean;
  /** Show Vimeo's own title bar over the film. */
  title?: boolean;
};

export function embedUrl(
  { vimeoId, vimeoHash }: Project,
  { autoplay = true, muted, loop = false, title = false }: EmbedOptions = {},
) {
  const params = new URLSearchParams({
    h: vimeoHash,
    autoplay: autoplay ? "1" : "0",
    playsinline: "1",
    dnt: "1",
    color: "cc9828",
    title: title ? "1" : "0",
    byline: "0",
    portrait: "0",
    // Hidden on Vimeo plans that allow it, so the player keeps viewers here.
    vimeo_logo: "0",
  });
  if (muted !== undefined) params.set("muted", muted ? "1" : "0");
  if (loop) params.set("loop", "1");
  return `${vimeoOrigin}/video/${vimeoId}?${params}`;
}

/** Send a player API call to an embedded Vimeo player. */
export function commandVimeo(
  frame: HTMLIFrameElement | null,
  method: "play" | "pause" | "ping" | "setMuted",
  value?: boolean,
) {
  frame?.contentWindow?.postMessage({ method, value }, vimeoOrigin);
}

export type VimeoMessage = {
  event?: string;
  method?: string;
  data?: { name?: string };
};

/** Read a message from a Vimeo player, which may arrive as JSON text or an object. */
export function readVimeoMessage(value: unknown): VimeoMessage | null {
  try {
    const message: unknown =
      typeof value === "string" ? JSON.parse(value) : value;
    return message && typeof message === "object"
      ? (message as VimeoMessage)
      : null;
  } catch {
    return null;
  }
}
