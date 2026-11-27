import type { servicePages } from "./services";

type ServiceSlug = (typeof servicePages)[number]["slug"];

type ServiceFrame = { src: string; alt: string };

export type ServiceMediaDetails = {
  frames: readonly [ServiceFrame, ...ServiceFrame[]];
  clip?: string;
  framing?: "portrait";
};

type ServiceDetail = {
  short: string;
  body: string;
  deliverables: readonly { title: string; description: string }[];
  media: ServiceMediaDetails;
  related: readonly string[];
};

export const serviceDetails: Record<ServiceSlug, ServiceDetail> = {
  "corporate-video-production-perth": {
    short: "Company profiles, investor updates and recruitment films.",
    body: "We film on site with WA industry and government. From inductions and approvals to the final edit, we plan around your operations and deliver versions for the channels where your audience will watch.",
    deliverables: [
      {
        title: "Company profiles",
        description:
          "Show prospective clients who you are, what your team does and how you work.",
      },
      {
        title: "Investor and project updates",
        description:
          "Use interviews, footage and graphics to make results and complex projects easier to follow.",
      },
      {
        title: "Recruitment and internal communications",
        description:
          "Show candidates what the job is like, capture events or share leadership updates.",
      },
    ],
    media: {
      clip: "/media/services/corporate-excerpt.mp4",
      frames: [
        {
          src: "/media/work/rio-tinto.webp",
          alt: "Title frame for the studio’s Rio Tinto film",
        },
        {
          src: "/media/work/investor-update.webp",
          alt: "Title frame from Investor Update",
        },
        {
          src: "/media/work/patrick-bet-david-facility-tour.webp",
          alt: "Two people in conversation during a facility tour",
        },
      ],
    },
    related: [
      "rio-tinto",
      "investor-update",
      "patrick-bet-david-facility-tour",
    ],
  },
  "business-video-production-perth": {
    short: "Training, safety, onboarding and explainer videos.",
    body: "We turn repeated explanations into videos your staff or customers can revisit. We can film on site with your people, record a walkthrough or use graphics to show a process step by step.",
    deliverables: [
      {
        title: "Safety and site inductions",
        description:
          "Show workers the site, personal protective equipment, hazards and emergency procedures.",
      },
      {
        title: "Training and onboarding",
        description:
          "Give new starters a consistent introduction and build short modules staff can revisit on the job.",
      },
      {
        title: "Explainers and product demos",
        description:
          "Explain a service, policy or product through live footage, screen recording and graphics.",
      },
      {
        title: "Internal updates",
        description:
          "Share leadership messages, project progress and company announcements.",
      },
    ],
    media: {
      frames: [
        {
          src: "/media/work/patrick-bet-david-facility-tour.webp",
          alt: "A conversation filmed during a facility tour",
        },
        {
          src: "/media/work/autolinx-australia.webp",
          alt: "Autolinx’s vehicle yard in a business profile film",
        },
        {
          src: "/media/work/investor-update.webp",
          alt: "Opening graphic for a company investor update",
        },
      ],
    },
    related: ["patrick-bet-david-facility-tour", "autolinx-australia"],
  },
  "brand-film-production-perth": {
    short: "Documentary-style films about the people behind a brand.",
    body: "A brand film can sit at the top of your website or be pinned to your profile. We use documentary techniques to find the story in your own people and footage. The published offer is typically 60 seconds to three minutes, with 15- and 30-second cuts for ads and social.",
    deliverables: [
      {
        title: "Founder and team stories",
        description:
          "Use interviews and footage of real work to introduce the people behind the brand.",
      },
      {
        title: "Launches and rebrands",
        description:
          "Tell people what has changed and why it matters in a film for your website or campaign.",
      },
      {
        title: "Campaign cutdowns",
        description:
          "Adapt the main story into shorter versions for social media and advertising.",
      },
    ],
    media: {
      frames: [
        {
          src: "/media/work/beast-philanthropy.webp",
          alt: "An outdoor interview from Beast Philanthropy",
        },
        {
          src: "/media/work/dr-nakamatsu.webp",
          alt: "Two people in conversation in The Answer documentary series",
        },
        {
          src: "/media/work/birth-of-the-automobile.webp",
          alt: "A hand adding detail to a drawing of a sports car",
        },
      ],
    },
    related: ["beast-philanthropy", "the-orient", "birth-of-the-automobile"],
  },
  "social-media-reels-perth": {
    short: "Short-form films for Instagram, TikTok, LinkedIn and YouTube.",
    body: "We plan the hooks and structure before the shoot, then edit and caption each cut for the channel it’s going on. The existing offer includes one-off shoots and monthly packages, with 8 to 12 reels planned around a monthly shoot day.",
    deliverables: [
      {
        title: "Monthly reel shoots",
        description:
          "Capture several pieces in one day and review what worked before the next shoot.",
      },
      {
        title: "One-off campaigns",
        description:
          "Film a product launch, event or brand collaboration as a standalone project.",
      },
      {
        title: "Platform-ready cuts",
        description:
          "Get edited, captioned files for Instagram, TikTok, LinkedIn and YouTube Shorts.",
      },
    ],
    media: {
      framing: "portrait",
      frames: [
        {
          src: "/media/work/running-and-cycling.webp",
          alt: "A track and athlete from Running and Cycling",
        },
        {
          src: "/media/work/lee-and-noah.webp",
          alt: "A frame from the Lee and Noah social reel",
        },
        {
          src: "/media/work/coffee.webp",
          alt: "A close-up of a coffee bag from a product reel",
        },
      ],
    },
    related: ["running-and-cycling", "lee-and-noah", "asv-hyper-cars"],
  },
  "photography-perth": {
    short: "Product, team, brand and behind-the-scenes photography.",
    body: "Plan commercial photos around your website, social channels and press kit. Photography can run on the same day as your video shoot so both sets of images share a consistent look.",
    deliverables: [
      {
        title: "Products and food",
        description:
          "Photograph products and food for websites, campaigns and social channels.",
      },
      {
        title: "Headshots and team photos",
        description:
          "Create consistent portraits for company profiles and press material.",
      },
      {
        title: "Brand, events and behind the scenes",
        description:
          "Capture your people, spaces or event, with stills from a production day where needed.",
      },
    ],
    media: {
      frames: [
        {
          src: "/media/work/rolex.webp",
          alt: "A close-up of a watch from the studio’s Rolex product reel",
        },
        {
          src: "/media/work/coffee.webp",
          alt: "A product close-up from the studio’s Coffee reel",
        },
        {
          src: "/media/studio/hammad.webp",
          alt: "Studio producer Hammad Chaudhry",
        },
      ],
    },
    related: ["rolex", "coffee"],
  },
};
