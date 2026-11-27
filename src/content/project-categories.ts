export const projectCategories = {
  corporate: "Corporate & investor",
  brand: "Brand & social",
  interview: "Interviews",
  documentary: "Documentaries",
} as const;

export type ProjectCategory = keyof typeof projectCategories;
