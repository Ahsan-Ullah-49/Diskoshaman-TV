const existingServicePages = [
  {
    slug: "business-video-production-perth",
    title: "Business Video Production in Perth",
    description:
      "Perth business video production for training, safety, onboarding and explainers. Help staff and customers understand what they need to do.",
    heading: "Business video production",
    intro:
      "Use video to show a process, explain a product or get a new team up to speed. We produce training, safety, onboarding and explainer videos for Perth businesses.",
  },
  {
    slug: "photography-perth",
    title: "Commercial Photography in Perth",
    description:
      "Perth commercial photography for products, teams and headshots, with the option to plan photography and video together.",
    heading: "Commercial photography",
    intro:
      "We shoot product photos, team images and headshots for Perth businesses. Plan photography alongside video when both are part of the same project.",
  },
  {
    slug: "social-media-reels-perth",
    title: "Social Media Reels & Video in Perth",
    description:
      "Perth social video production for Instagram Reels, TikTok and LinkedIn. Get short-form content planned, filmed and edited for each channel.",
    heading: "Social media reels and video",
    intro:
      "We plan, film and edit short-form video for Perth brands. Choose the formats and cuts that suit the way your audience watches on Instagram, TikTok or LinkedIn.",
  },
  {
    slug: "brand-film-production-perth",
    title: "Brand Film Production in Perth",
    description:
      "Perth brand film production for organisations across Western Australia and beyond. Tell your story through interviews, real people and documentary-style footage.",
    heading: "Brand film production",
    intro:
      "A brand film gives customers a look at the people and choices behind your work. We make documentary-style films for Perth organisations and brands across Australia.",
  },
  {
    slug: "corporate-video-production-perth",
    title: "Corporate Video Production in Perth",
    description:
      "Perth corporate video production for company profiles, recruitment, training and investor updates, from filming through final delivery.",
    heading: "Corporate video production",
    intro:
      "Give clients, staff or investors a clear account of your organisation. We produce company profiles, recruitment films, training videos and investor updates.",
  },
] as const;

export const servicePages = existingServicePages.map((page) => ({
  ...page,
  path: `/${page.slug}/`,
}));

// Keep the service names and order visitors know from the studio's existing menu.
export const serviceNavigation = [
  { slug: "corporate-video-production-perth", label: "Corporate Videos" },
  { slug: "business-video-production-perth", label: "Business Videos" },
  { slug: "brand-film-production-perth", label: "Brand Films" },
  { slug: "social-media-reels-perth", label: "Social Media Reels" },
  { slug: "photography-perth", label: "Photography" },
] as const satisfies ReadonlyArray<{
  slug: (typeof servicePages)[number]["slug"];
  label: string;
}>;
