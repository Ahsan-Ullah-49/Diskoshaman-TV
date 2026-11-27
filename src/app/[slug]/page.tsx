import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/about-page";
import styles from "@/components/page-sections.module.css";
import { featuredProject } from "@/content/projects";
import { serviceDetails } from "@/content/service-details";
import { servicePages } from "@/content/services";
import { interiorPages, pages } from "@/content/site";
import { producer } from "@/content/studio";
import { ContactPage } from "@/features/contact/contact-page";
import { ServicePage, ServicesPage } from "@/features/services/service-pages";
import { WorkPage } from "@/features/work/work-page";
import { pageMetadata } from "@/lib/metadata";

type RouteProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return interiorPages.map(({ slug }) => ({ slug }));
}

function findPage(slug: string) {
  const page = interiorPages.find((entry) => entry.slug === slug);
  if (!page) notFound();
  return page;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const page = findPage((await params).slug);
  const service = servicePages.find(({ slug }) => slug === page.slug);
  const socialImage =
    page === pages.work
      ? { url: featuredProject.poster, alt: featuredProject.title }
      : page === pages.about
        ? { url: producer.portrait, alt: producer.name }
        : service
          ? {
              url: serviceDetails[service.slug].media.frames[0].src,
              alt: serviceDetails[service.slug].media.frames[0].alt,
            }
          : undefined;
  return pageMetadata(page, socialImage);
}

function renderPage(slug: string) {
  if (slug === pages.work.slug) return <WorkPage />;
  if (slug === pages.services.slug) return <ServicesPage />;
  if (slug === pages.about.slug) return <AboutPage />;
  if (slug === pages.contact.slug) return <ContactPage />;
  const service = servicePages.find((page) => page.slug === slug);
  if (!service) notFound();
  return <ServicePage service={service} />;
}

export default async function InteriorPage({ params }: RouteProps) {
  const { slug } = await params;
  return (
    <div className={styles.route} key={slug}>
      {renderPage(slug)}
    </div>
  );
}
