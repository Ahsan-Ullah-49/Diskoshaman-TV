type BrandLogo = {
  name: string;
  slug: string;
  width: number;
  height: number;
  darkBackground?: boolean;
};

export function brandLogoSource({ slug }: BrandLogo) {
  return `/media/brand-logos/${slug}.webp`;
}

// Artwork from the published homepage's client-logo section.
export const brandLogos: readonly BrandLogo[] = [
  { name: "Apple", slug: "apple", width: 164, height: 196 },
  { name: "Campos Racing", slug: "campos-racing", width: 440, height: 103 },
  { name: "BMW", slug: "bmw", width: 210, height: 210 },
  { name: "Tesla", slug: "tesla", width: 143, height: 185 },
  { name: "Bugatti", slug: "bugatti", width: 359, height: 183 },
  { name: "Danube Group", slug: "danube-group", width: 440, height: 39 },
  { name: "Viome", slug: "viome", width: 336, height: 45 },
  { name: "Nissan", slug: "nissan", width: 245, height: 210 },
  {
    name: "Aubrey Marcus Podcast",
    slug: "aubrey-marcus-podcast",
    width: 250,
    height: 184,
  },
  { name: "NetEase Games", slug: "netease-games", width: 393, height: 157 },
  {
    name: "Gracie Jiu-Jitsu Academy",
    slug: "gracie-jiu-jitsu-academy",
    width: 205,
    height: 205,
  },
  { name: "AutoLinx", slug: "autolinx", width: 197, height: 116 },
  {
    name: "Arise Racing",
    slug: "arise-racing",
    width: 416,
    height: 89,
    darkBackground: true,
  },
  {
    name: "Beast Philanthropy",
    slug: "beast-philanthropy",
    width: 440,
    height: 106,
    darkBackground: true,
  },
  {
    name: "Luxury Supercar Rentals",
    slug: "luxury-supercar-rentals",
    width: 354,
    height: 176,
    darkBackground: true,
  },
  {
    name: "Valuetainment",
    slug: "valuetainment",
    width: 420,
    height: 93,
    darkBackground: true,
  },
];
