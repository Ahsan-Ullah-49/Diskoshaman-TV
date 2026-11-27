import { servicePages } from "./services";

export const site = {
  name: "Diskoshaman TV",
  url: "https://diskoshaman.tv",
  email: "hammadchaudhry@diskoshaman.tv",
  location: "Perth, Western Australia",
  logo: "/brand/diskoshaman-mark.webp",
} as const;

export const showreelPoster = {
  src: "/media/showreel-still.webp",
  socialImage: "/media/studio-social.jpg",
  alt: "A camera operator works with a cinema rig on a colour-lit set",
  width: 1200,
  height: 675,
} as const;

export const pages = {
  home: {
    slug: "",
    path: "/",
    label: "Home",
    title: "Perth Video Production & Photography",
    description:
      "Diskoshaman TV is a Perth video production and photography studio, taking projects across Australia from filming to editing and final delivery.",
  },
  work: {
    slug: "our-work",
    path: "/our-work/",
    label: "Work",
    title: "Video Production Portfolio",
    description:
      "Explore Diskoshaman TV's production work across brand stories, commercials, corporate films, social video and long-form projects.",
    heading: "Our work",
    intro:
      "Brand films, corporate productions and documentaries from our Perth studio.",
  },
  services: {
    slug: "video-production-services",
    path: "/video-production-services/",
    label: "Services",
    title: "Video Production Services in Perth",
    description:
      "Explore Perth videography, photography and editing services for corporate, promotional, brand and social projects across Australia.",
    heading: "Production services",
    intro:
      "Our Perth studio handles videography, photography, editing and delivery for clients in Western Australia and across the country.",
  },
  about: {
    slug: "about-us",
    path: "/about-us/",
    label: "About",
    title: "About Our Perth Production Studio",
    description:
      "Meet Diskoshaman TV, a Perth production studio working with individuals and businesses across Western Australia and Australia.",
    heading: "About the studio",
    intro:
      "Diskoshaman TV is a Perth-based media production studio working with individuals and businesses across Western Australia and beyond.",
  },
  contact: {
    slug: "contact-us",
    path: "/contact-us/",
    label: "Contact",
    title: "Contact Our Perth Video Production Studio",
    description:
      "Get in touch with Diskoshaman TV in Perth about video production, photography, editing or a 20-minute discovery call.",
    heading: "Contact us",
    intro:
      "Tell us what you want to make, who it’s for and when you need it. We’ll work with you to find the right approach.",
  },
} as const;

export const navigation = [pages.home, pages.work, pages.services, pages.about];
export const interiorPages = [
  pages.work,
  pages.services,
  pages.about,
  pages.contact,
  ...servicePages,
];
export const sitePages = [pages.home, ...interiorPages];
export const bookingPath = `${pages.contact.path}#booking`;
