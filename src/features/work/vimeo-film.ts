import type { Project } from "@/content/projects";

export const vimeoOrigin = "https://player.vimeo.com";

export function embedUrl({ vimeoId, vimeoHash }: Project) {
  const params = new URLSearchParams({
    h: vimeoHash,
    autoplay: "1",
    playsinline: "1",
    dnt: "1",
    color: "cc9828",
    title: "0",
    byline: "0",
    portrait: "0",
    // Hidden on Vimeo plans that allow it, so the player keeps viewers here.
    vimeo_logo: "0",
  });
  return `${vimeoOrigin}/video/${vimeoId}?${params}`;
}
