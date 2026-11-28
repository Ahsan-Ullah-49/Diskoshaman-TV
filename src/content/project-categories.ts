export const projectCategories = {
  corporate: "Corporate & investor",
  brand: "Brand & social",
  interview: "Interviews",
  documentary: "Documentaries",
} as const;

export type ProjectCategory = keyof typeof projectCategories;

/** Category order and headings from the studio's published content library. */
export const libraryCategories: readonly {
  key: ProjectCategory;
  heading: string;
}[] = [
  { key: "corporate", heading: "Corporate & Investor Communications" },
  { key: "brand", heading: "Brand Collaborations" },
  { key: "interview", heading: "Executive & Creator Highlights" },
  { key: "documentary", heading: "Long-Form Cinematic Projects" },
];
