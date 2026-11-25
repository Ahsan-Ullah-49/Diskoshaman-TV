import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { servicePages } from "@/content/services";
import { interiorPages, pages, site } from "@/content/site";
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
  return pageMetadata(findPage((await params).slug));
}

export default async function InteriorPage({ params }: RouteProps) {
  const page = findPage((await params).slug);

  return (
    <div className="container interior">
      <h1>{page.heading}</h1>
      <p>{page.intro}</p>

      {page === pages.services && (
        <ul className="page-links">
          {servicePages.map(({ path, heading }) => (
            <li key={path}>
              <Link href={path}>
                {heading} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {page === pages.contact ? (
        <section
          className="booking-section"
          id="booking"
          aria-labelledby="booking-title"
        >
          <h2 id="booking-title">Book a 20-minute discovery call</h2>
          <p>Email Hammad to arrange a time or send a project enquiry.</p>
          <a className="button button-primary" href={`mailto:${site.email}`}>
            Email Hammad
          </a>
        </section>
      ) : (
        <Link className="button button-primary" href={pages.contact.path}>
          Talk to us <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}
