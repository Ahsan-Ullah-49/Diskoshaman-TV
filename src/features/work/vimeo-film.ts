import type { Project } from "@/content/projects";

export const vimeoOrigin = "https://player.vimeo.com";

export function embedUrl(
  { vimeoId, vimeoHash }: Project,
  { autoplay = true, muted }: { autoplay?: boolean; muted?: boolean } = {},
) {
  const params = new URLSearchParams({
    h: vimeoHash,
    autoplay: autoplay ? "1" : "0",
    playsinline: "1",
    dnt: "1",
    color: "cc9828",
    title: "0",
    byline: "0",
    portrait: "0",
    // Hidden on Vimeo plans that allow it, so the player keeps viewers here.
    vimeo_logo: "0",
  });
  if (muted !== undefined) params.set("muted", muted ? "1" : "0");
  return `${vimeoOrigin}/video/${vimeoId}?${params}`;
}
