export const heroCopy = {
  headline: "Our goal is to make your brand",
  endings: ["Seen!", "Recognized", "Noticed", "Highlighted", "Remembered"],
  description:
    "Work with a Perth-based video production agency creating high-quality corporate, promotional, and brand videos designed to attract customers and grow your business.",
  signature: "Diskoshaman TV!",
} as const;

export const heroReel = {
  desktop: "/media/showreel.mp4",
  mobile: "/media/showreel-mobile.mp4",
} as const;

export const socialViews = [
  { platform: "YouTube", millions: 1.5, decimals: 1 },
  { platform: "TikTok", millions: 50, decimals: 0 },
  { platform: "Instagram", millions: 45, decimals: 0 },
] as const;

export const studioStory = {
  heading: { label: "About", name: "DiskoShaman TV" },
  // The published story in its original order, with dashes replaced by plain
  // punctuation. Wrap a phrase in **double asterisks** to highlight it.
  story: [
    "At **Disko Shaman TV**, we don’t just make videos. We craft **stories** that dive deep into the **human experience**, weaving **creativity and purpose** into every frame.",
    "We believe that every brand, product, or vision carries a **narrative waiting to be unlocked**, and our mission is to bring that story to life with **authenticity and impact**.",
    "Much like exploring uncharted terrain, we dig beneath the surface, unearthing **the essence of what makes you unique**, and channel it into **cinematic visuals** that captivate and inspire. This isn’t just content; it’s a **journey**, a fusion of **art and storytelling** that connects with audiences on a primal level.",
  ],
  film: {
    title: "The Diskoshaman TV studio story",
    vimeoId: "1057763335",
    vimeoHash: "729712b3c6",
  },
} as const;
