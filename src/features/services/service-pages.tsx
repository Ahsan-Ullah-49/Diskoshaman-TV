import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { DiagonalArrow } from "@/components/cinema/diagonal-arrow";
import cinema from "@/components/cinema/cinema.module.css";
import { FlipTitle } from "@/components/cinema/flip-title";
import { ScrollReveal } from "@/components/cinema/scroll-reveal";
import { ServiceScene } from "@/components/cinema/service-scene";
import type { SceneKind } from "@/components/cinema/service-scene-drawings";
import { PillLink } from "@/components/pill-link";
import { relatedProjects } from "@/content/projects";
import {
  serviceDetails,
  type ServiceMediaDetails,
} from "@/content/service-details";
import { serviceNavigation, servicePages } from "@/content/services";
import { bookingPath, pages } from "@/content/site";
import { FilmGrid } from "@/features/work/content-library";
import { ProcessTimeline } from "./process-timeline";
import styles from "./services.module.css";

type Service = (typeof servicePages)[number];
type ServiceSlug = Service["slug"];

type ServicePreview = {
  slug: ServiceSlug;
  label: string;
  path: string;
  short: string;
  media: ServiceMediaDetails;
};

/**
 * Each service has its own light, like a product colour. The accent tints
 * the hero lens, labels and card edges; the gold call to action stays the
 * same everywhere so the next step is always recognisable.
 */
const serviceAccents: Record<ServiceSlug, string> = {
  "corporate-video-production-perth": "#2f6bd8",
  "business-video-production-perth": "#0f8f78",
  "brand-film-production-perth": "#b47a12",
  "social-media-reels-perth": "#d23f7c",
  "photography-perth": "#e3ac0b",
};

/** Each service hero has its own live scene; the overview shows the aperture. */
const serviceScenes: Record<ServiceSlug, SceneKind> = {
  "corporate-video-production-perth": "network",
  "business-video-production-perth": "growth",
  "brand-film-production-perth": "ribbon",
  "social-media-reels-perth": "reels",
  "photography-perth": "camera",
};

/** Photography takes its yellow through the whole page, not only the accents. */
const pageTints: Partial<Record<ServiceSlug, string>> = {
  "photography-perth": "11%",
};

const overviewAccent = "#b47a12";

function accentStyle(accent: string, pageTint?: string) {
  return {
    "--service-accent": accent,
    ...(pageTint && { "--page-tint": pageTint }),
  } as CSSProperties;
}

function getServicePreview({
  slug,
  label,
}: (typeof serviceNavigation)[number]): ServicePreview {
  const service = servicePages.find((page) => page.slug === slug);
  if (!service) throw new Error(`Unknown service: ${slug}`);
  const detail = serviceDetails[slug];
  return {
    slug,
    label,
    path: service.path,
    short: detail.short,
    media: detail.media,
  };
}

const publishedServices = serviceNavigation.map(getServicePreview);

/** The five services in menu order, with the short line and lead frame the home showcase needs. */
export const homeServices = publishedServices.map(
  ({ slug, label, path, media, short }) => ({
    slug,
    label,
    path,
    short,
    image: media.frames[0].src,
  }),
);

export type HomeService = (typeof homeServices)[number];

/** A service card: picture, name, short line and a Learn more prompt. */
function ServiceCard({
  service,
  sizes,
}: {
  service: ServicePreview;
  sizes: string;
}) {
  return (
    <Link
      href={service.path}
      className={styles.card}
      style={accentStyle(serviceAccents[service.slug])}
    >
      <span className={styles.cardMedia}>
        <Image src={service.media.frames[0].src} alt="" fill sizes={sizes} />
      </span>
      <span className={styles.cardCopy}>
        <span className={styles.cardLabel}>{service.label}</span>
        <span className={styles.cardShort}>{service.short}</span>
        <span className={styles.cardMore}>
          Learn more <span aria-hidden="true">›</span>
        </span>
      </span>
    </Link>
  );
}

/** The plan, shoot and deliver stages shared by every service page. */
function ProcessSection() {
  return (
    <section
      id="process"
      className={styles.process}
      aria-labelledby="process-title"
    >
      <div className="container">
        <div className={styles.sectionHead}>
          <h2 id="process-title" className={styles.sectionTitle}>
            How we work
          </h2>
          <p className={styles.lede}>
            Three stages, agreed with you before the camera rolls.
          </p>
        </div>
        <ProcessTimeline />
      </div>
    </section>
  );
}

export function ServicesPage() {
  return (
    <div className={styles.page} style={accentStyle(overviewAccent)}>
      <section className={styles.hero} aria-labelledby="services-title">
        <ServiceScene kind="aperture" />
        {/* Title, lede and buttons follow the Work page's hero. */}
        <div className={`container ${styles.heroInner}`}>
          <FlipTitle
            as="h1"
            id="services-title"
            label="Video & photography"
            words={["Production", "Services"]}
            size="display"
            align="center"
            oneLine
          />
          <p className={styles.heroLede}>{pages.services.intro}</p>
          <div className={styles.actions}>
            <PillLink href={bookingPath}>Book a call</PillLink>
            <PillLink href="#services" variant="secondary" arrow="right">
              See the services
            </PillLink>
          </div>
        </div>
      </section>

      <section
        id="services"
        className={styles.lineup}
        aria-labelledby="lineup-title"
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <FlipTitle
              id="lineup-title"
              label="What we make"
              words={["Our", "Services"]}
              align="center"
              oneLine
            />
          </div>
          <ul className={styles.cardGrid}>
            {publishedServices.map((service) => (
              <li key={service.slug} id={service.slug}>
                <ServiceCard
                  service={service}
                  sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 46vw, 92vw"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The process sits in a dark cinema band, like the rest of the site. */}
      <div className={styles.night}>
        <ProcessSection />
      </div>
    </div>
  );
}

export function ServicePage({ service }: { service: Service }) {
  const detail = serviceDetails[service.slug];
  const label =
    serviceNavigation.find(({ slug }) => slug === service.slug)?.label ??
    service.heading;
  const otherServices = publishedServices.filter(
    ({ slug }) => slug !== service.slug,
  );

  return (
    <div
      className={styles.page}
      style={accentStyle(serviceAccents[service.slug], pageTints[service.slug])}
    >
      <section
        className={`${styles.hero} ${styles.serviceHero}`}
        aria-labelledby="service-title"
      >
        <ServiceScene kind={serviceScenes[service.slug]} />
        <div className={`container ${styles.heroInner}`}>
          <Link href={pages.services.path} className={styles.back}>
            <span aria-hidden="true">‹</span> All services
          </Link>
          <p className={styles.eyebrow}>{label}</p>
          <h1 id="service-title" className={styles.heroTitle}>
            {service.heading}
          </h1>
          <p className={styles.lede}>{service.intro}</p>
          <div className={styles.actions}>
            <PillLink href={bookingPath}>Discuss your project</PillLink>
            <PillLink
              href={`${pages.contact.path}#enquiry`}
              variant="secondary"
              arrow="right"
            >
              Send an enquiry
            </PillLink>
          </div>
        </div>
      </section>

      <section
        id="deliverables"
        className={styles.lineup}
        aria-labelledby="service-deliverables"
      >
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 id="service-deliverables" className={styles.sectionTitle}>
              What you get
            </h2>
            <p className={styles.lede}>{detail.body}</p>
          </div>
          <ScrollReveal className={styles.deliverables}>
            {detail.deliverables.map(({ title, description }) => (
              <article key={title} className={styles.deliverable} data-reveal>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* The process and the films sit in a dark cinema band, like the rest of
          the site; on a service page How we work takes the service's colour. */}
      <div className={`${styles.night} ${styles.serviceNight}`}>
        <ProcessSection />

        <section
          id="work"
          className={styles.related}
          aria-labelledby="related-title"
        >
          <div className="container">
            <div className={styles.relatedHead}>
              <h2 id="related-title" className={styles.sectionTitle}>
                Related work
              </h2>
              <Link href={pages.work.path} className={cinema.lineLink}>
                Browse all films <DiagonalArrow />
              </Link>
            </div>
            {/* Films play in their frames; captions name the format, not the title. */}
            <div className={styles.relatedFilms}>
              <FilmGrid films={relatedProjects(detail.related)} captions row />
            </div>
          </div>
        </section>
      </div>

      <nav className={styles.more} aria-labelledby="more-services">
        <div className="container">
          <h2 id="more-services" className={styles.sectionTitle}>
            More services
          </h2>
          <ul className={styles.moreGrid}>
            {otherServices.map((other) => (
              <li key={other.slug}>
                <ServiceCard
                  service={other}
                  sizes="(min-width: 64rem) 22vw, (min-width: 40rem) 46vw, 92vw"
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
