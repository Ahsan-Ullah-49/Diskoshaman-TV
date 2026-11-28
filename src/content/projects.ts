import type { ProjectCategory } from "./project-categories";

type ProjectRecord = {
  slug: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  credit?: string;
  portrait?: boolean;
  vimeoId: string;
  vimeoHash: string;
};

export type Project = ProjectRecord & { poster: string };

export type HomeScreeningFilm = {
  project: Project;
  category: string;
  label: string;
  seconds: number;
};

export type HomeScreeningProgram = readonly [
  HomeScreeningFilm,
  HomeScreeningFilm,
  HomeScreeningFilm,
  HomeScreeningFilm,
];

const portfolio: ProjectRecord[] = [
  {
    slug: "rio-tinto",
    title: "Rio Tinto: The Silent Force Powering the Modern World",
    category: "corporate",
    summary: "A corporate film about the role of mining in everyday life.",
    credit: "Corporate film",
    vimeoId: "1098127766",
    vimeoHash: "0d302548d5",
  },
  {
    slug: "beast-philanthropy",
    title: "Beast Philanthropy",
    category: "documentary",
    summary: "A short documentary-style film for Beast Philanthropy.",
    credit: "Short documentary",
    vimeoId: "1004315356",
    vimeoHash: "25ad4635a2",
  },
  {
    slug: "the-orient",
    title: "The Orient",
    category: "brand",
    summary: "A brand collaboration film.",
    credit: "Brand collaboration",
    portrait: true,
    vimeoId: "1167998253",
    vimeoHash: "a32c575e78",
  },
  {
    slug: "birth-of-the-automobile",
    title: "The Answer: The Birth of the Automobile",
    category: "documentary",
    summary: "An episode of The Answer about the origins of the automobile.",
    credit: "Research, interviews and editing",
    vimeoId: "1074560834",
    vimeoHash: "8084672e6d",
  },
  {
    slug: "investor-update",
    title: "Investor Update",
    category: "corporate",
    summary: "A corporate update on results and progress for shareholders.",
    vimeoId: "1104716998",
    vimeoHash: "e0d917b388",
  },
  {
    slug: "australia",
    title: "Australia",
    category: "brand",
    summary: "A short-form brand collaboration.",
    vimeoId: "1163517619",
    vimeoHash: "eee8636054",
  },
  {
    slug: "lee",
    title: "Lee",
    category: "brand",
    summary: "A brand collaboration reel.",
    vimeoId: "1163513658",
    vimeoHash: "c0579429d7",
  },
  {
    slug: "lee-and-noah",
    title: "Lee and Noah",
    category: "brand",
    summary: "A short reel made for social media.",
    portrait: true,
    vimeoId: "1163514779",
    vimeoHash: "3f41d71af7",
  },
  {
    slug: "running-and-cycling",
    title: "Running and Cycling",
    category: "brand",
    summary: "A sports brand reel.",
    portrait: true,
    vimeoId: "1168000574",
    vimeoHash: "564e3828f0",
  },
  {
    slug: "coffee",
    title: "Coffee",
    category: "brand",
    summary: "A short-form product reel for social media.",
    portrait: true,
    vimeoId: "1026837092",
    vimeoHash: "1eaa28563e",
  },
  {
    slug: "studio-showreel",
    title: "Diskoshaman TV Showreel",
    category: "brand",
    summary: "A selection of the studio’s short-form brand work.",
    portrait: true,
    vimeoId: "1026839602",
    vimeoHash: "ed7bfd0fc6",
  },
  {
    slug: "patrick-bet-david-facility-tour",
    title: "Patrick Bet-David: Facility Tour",
    category: "interview",
    summary: "An executive feature filmed on location.",
    vimeoId: "1163495601",
    vimeoHash: "fb2a72bad0",
  },
  {
    slug: "rorion-gracie-interview",
    title: "Rorion Gracie for The Answer",
    category: "interview",
    summary: "An interview with the Gracie Jiu-Jitsu pioneer for The Answer.",
    vimeoId: "1075036197",
    vimeoHash: "df3374554c",
  },
  {
    slug: "patrick-bet-david",
    title: "Patrick Bet-David",
    category: "interview",
    summary: "A creator highlight featuring Patrick Bet-David.",
    portrait: true,
    vimeoId: "1162156214",
    vimeoHash: "808db0e39e",
  },
  {
    slug: "executive-highlight",
    title: "Executive Highlight Reel",
    category: "interview",
    summary: "A short executive highlight.",
    portrait: true,
    vimeoId: "1162137361",
    vimeoHash: "f593bb37a2",
  },
  {
    slug: "naveen-jain",
    title: "Naveen Jain",
    category: "interview",
    summary: "A highlight from an interview with Naveen Jain.",
    portrait: true,
    vimeoId: "1163479539",
    vimeoHash: "4e4a2ef9ad",
  },
  {
    slug: "rorion-gracie-reel",
    title: "Rorion Gracie",
    category: "interview",
    summary: "A creator highlight reel featuring Rorion Gracie.",
    portrait: true,
    vimeoId: "1162133119",
    vimeoHash: "5ca6d77c54",
  },
  {
    slug: "gaming-legends",
    title: "The Answer: Gaming Legends",
    category: "documentary",
    summary: "A documentary episode from The Answer, produced under FocusTV.",
    vimeoId: "1090472083",
    vimeoHash: "f7de1ad21b",
  },
  {
    slug: "dr-nakamatsu",
    title: "The Answer: Dr. Nakamatsu, The Greatest Inventor of All Time",
    category: "documentary",
    summary:
      "An episode of The Answer about the Japanese inventor Dr. Nakamatsu.",
    vimeoId: "996154729",
    vimeoHash: "aaeb75791c",
  },
  {
    slug: "the-answer-ahmed-amwell",
    title: "The Answer: Ahmed Amwell",
    category: "documentary",
    summary: "A docuseries episode featuring Ahmed Amwell.",
    vimeoId: "1075035916",
    vimeoHash: "36cd6f698c",
  },
  {
    slug: "autolinx-australia",
    title: "Autolinx Australia",
    category: "brand",
    summary: "A brand film for a Perth vehicle sales business.",
    credit: "Filming and editing for web and social",
    vimeoId: "1026831605",
    vimeoHash: "2f7fd7afde",
  },
  {
    slug: "turning-thoughts-into-reality",
    title: "The Answer: Turning Thoughts Into Reality",
    category: "documentary",
    summary: "A documentary short from The Answer.",
    vimeoId: "1075036022",
    vimeoHash: "417f274a07",
  },
  {
    slug: "ahmed-amwell-reel",
    title: "Ahmed Amwell",
    category: "interview",
    summary: "An interview-led creator highlight cut for social media.",
    vimeoId: "1040283476",
    vimeoHash: "b41229fddb",
  },
  {
    slug: "autolinx-voxy",
    title: "Autolinx: Voxy",
    category: "brand",
    summary: "A vehicle showcase reel for Autolinx.",
    vimeoId: "1040297980",
    vimeoHash: "39177d6e42",
  },
  {
    slug: "bill-dorfman",
    title: "Dr. Bill Dorfman",
    category: "interview",
    summary: "An executive interview filmed and edited for social media.",
    vimeoId: "1040286741",
    vimeoHash: "61dc98aeb4",
  },
  {
    slug: "autolinx-hijet",
    title: "Autolinx: Hijet",
    category: "brand",
    summary: "A vehicle showcase reel for Autolinx.",
    vimeoId: "1026844098",
    vimeoHash: "50ae516a58",
  },
  {
    slug: "asv-reel",
    title: "ASV Reel",
    category: "brand",
    summary: "An automotive reel for social media.",
    vimeoId: "1026832951",
    vimeoHash: "adcbc0eec6",
  },
  {
    slug: "creator-reel",
    title: "Creator",
    category: "interview",
    summary: "A creator highlight made for Instagram and TikTok.",
    vimeoId: "1026840844",
    vimeoHash: "237105b656",
  },
  {
    slug: "focu-tivity",
    title: "Focu-Tivity: Unlock the Secret to Manifestation",
    category: "documentary",
    summary: "A documentary trailer.",
    vimeoId: "973631375",
    vimeoHash: "af9c91c2dc",
  },
  {
    slug: "rolex",
    title: "Rolex",
    category: "brand",
    summary: "A product reel with watch close-ups, cut for social media.",
    vimeoId: "1026829362",
    vimeoHash: "76609af744",
  },
  {
    slug: "asv-hyper-cars",
    title: "ASV: Hyper Cars",
    category: "brand",
    summary: "An automotive social reel featuring hypercars.",
    portrait: true,
    vimeoId: "1026850008",
    vimeoHash: "d0110ce9b1",
  },
];

export const projects: Project[] = portfolio.map((project) => ({
  ...project,
  poster: `/media/work/${project.slug}.webp`,
}));

const projectsBySlug = new Map(
  projects.map((project) => [project.slug, project]),
);
if (projectsBySlug.size !== projects.length) {
  throw new Error("Each portfolio entry needs a unique slug.");
}

export const featuredProject = projects[0];

export function relatedProjects(slugs: readonly string[]) {
  return slugs.map((slug) => {
    const project = projectsBySlug.get(slug);
    if (!project) throw new Error(`Unknown project: ${slug}`);
    return project;
  });
}

export function createFilmSelection(first: string, ...following: string[]) {
  const [lead, ...films] = relatedProjects([first, ...following]);
  return [lead, ...films] as const;
}

const [rioTinto, beastPhilanthropy, facilityTour, birthOfTheAutomobile] =
  createFilmSelection(
    "rio-tinto",
    "beast-philanthropy",
    "patrick-bet-david-facility-tour",
    "birth-of-the-automobile",
  );

// Home follows the published library categories. Work files films by format.
export const homeScreeningFilms = [
  {
    project: rioTinto,
    category: "Corporate & Investor Communications",
    label: "Rio Tinto",
    seconds: 107,
  },
  {
    project: beastPhilanthropy,
    category: "Brand Collaborations",
    label: "Beast Philanthropy",
    seconds: 150,
  },
  {
    project: facilityTour,
    category: "Executive & Creator Highlights",
    label: "Patrick Bet-David: Facility Tour",
    seconds: 108,
  },
  {
    project: birthOfTheAutomobile,
    category: "Long-Form Cinematic Projects",
    label: "The Birth of the Automobile",
    seconds: 459,
  },
] as const satisfies HomeScreeningProgram;

if (homeScreeningFilms.some(({ project }) => project.portrait)) {
  throw new Error("Home screenings need landscape films.");
}
