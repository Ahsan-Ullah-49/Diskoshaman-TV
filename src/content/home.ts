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
