import Link from "next/link";
import { DiagonalArrow } from "@/components/cinema/diagonal-arrow";
import { FlipTitle } from "@/components/cinema/flip-title";
import { FocusFrame } from "@/components/cinema/focus-frame";
import cinema from "@/components/cinema/cinema.module.css";
import { ParticleField } from "@/components/cinema/particle-field";
import { ScrollReveal } from "@/components/cinema/scroll-reveal";
import { StudioCamera } from "@/components/cinema/studio-camera";
import { ContactBand } from "@/components/page-sections";
import { PillLink } from "@/components/pill-link";
import { relatedProjects } from "@/content/projects";
import {
  serviceDetails,
  type ServiceMediaDetails,
} from "@/content/service-details";
import { serviceNavigation, servicePages } from "@/content/services";
import { bookingPath, pages } from "@/content/site";
import { productionSteps } from "@/content/studio";
import { WorkCollection } from "@/features/work/work-collection";
import { ServiceMedia } from "./service-media";
import styles from "./services.module.css";

type Service = (typeof servicePages)[number];

type ServicePreview = {
  slug: Service["slug"];
  label: string;
  path: string;
  heading: string;
  summary: string;
  media: ServiceMediaDetails;
  deliverables: readonly string[];
};

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
    heading: service.heading,
    summary: service.intro,
    media: detail.media,
    deliverables: detail.deliverables.map(({ title }) => title),
  };
}

const publishedServices = serviceNavigation.map(getServicePreview);

/** The five services in menu order, with the short line and lead frame the home showcase needs. */
export const homeServices = publishedServices.map(
  ({ slug, label, path, media }) => ({
    slug,
    label,
    path,
    short: serviceDetails[slug].short,
    image: media.frames[0].src,
  }),
);

export type HomeService = (typeof homeServices)[number];

// Formats named in the studio's existing services copy.
const otherFormats = [
  "Commercials",
  "Promotional video",
  "Documentary series",
  "Educational content",
  "Drone filming",
  "Post-production",
];

const number = (index: number) => String(index + 1).padStart(2, "0");

/** Split a heading so its last word can take the gold accent line. */
function titleLines(heading: string) {
  const words = heading.split(" ");
  return words.length > 1
    ? [words.slice(0, -1).join(" "), words[words.length - 1]]
    : words;
}

/** The plan, shoot and deliver steps shared by every service page. */
function ProcessSteps() {
  return (
    <section className={styles.process} aria-labelledby="process-title">
      <div className="container">
        <FlipTitle
          id="process-title"
          label="How we work"
          words={["From brief", "to final cut"]}
        />
        <ScrollReveal className={styles.steps}>
          {productionSteps.map(({ title, description }, index) => (
            <article key={title} className={styles.step} data-reveal>
              <span className={styles.stepNumber}>{number(index)}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

export function ServicesPage() {
  return (
    <>
      <section
        className={`${cinema.litSet} ${styles.stage}`}
        aria-labelledby="services-title"
      >
        <ParticleField well={{ x: 0.74, z: 0.4 }} />
        <div className={`container ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <FlipTitle
              as="h1"
              id="services-title"
              label="Perth production studio"
              words={["Production", "Services"]}
              size="display"
            />
            <p className={styles.lede}>{pages.services.intro}</p>
            <div className={styles.actions}>
              <PillLink href={bookingPath}>Book a call</PillLink>
              <PillLink
                href={pages.work.path}
                variant="secondary"
                arrow="right"
              >
                View our work
              </PillLink>
            </div>
          </div>
          <div className={styles.heroCamera}>
            <StudioCamera assemble="load" />
          </div>
        </div>
      </section>

      <section className={styles.chapters} aria-label="Our services">
        <div className="container">
          {publishedServices.map((service, index) => (
            <ScrollReveal key={service.slug} className={styles.chapter}>
              <article
                id={service.slug}
                className={styles.chapterInner}
                data-flip={index % 2 === 1 || undefined}
              >
                <div className={styles.chapterMedia} data-reveal>
                  <FocusFrame>
                    <ServiceMedia
                      title={service.heading}
                      media={service.media}
                    />
                  </FocusFrame>
                </div>
                <div className={styles.chapterCopy}>
                  <span className={styles.chapterNumber} data-reveal>
                    {number(index)}
                  </span>
                  <h2 data-reveal>{service.heading}</h2>
                  <p data-reveal>{service.summary}</p>
                  <ul className={styles.tags} data-reveal>
                    {service.deliverables.map((title) => (
                      <li key={title}>{title}</li>
                    ))}
                  </ul>
                  <div data-reveal>
                    <PillLink href={service.path}>
                      Explore {service.label.toLowerCase()}
                    </PillLink>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <ProcessSteps />

      <section className={styles.formats} aria-labelledby="formats-title">
        <ScrollReveal className={`container ${styles.formatsPanel}`}>
          <FlipTitle
            id="formats-title"
            label="Also on request"
            words={["Other", "formats"]}
          />
          <div>
            <ul className={styles.tags} data-reveal>
              {otherFormats.map((format) => (
                <li key={format}>{format}</li>
              ))}
            </ul>
            <div data-reveal>
              <Link href={pages.work.path} className={cinema.lineLink}>
                Browse our work <DiagonalArrow />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <ContactBand />
    </>
  );
}

export function ServicePage({ service }: { service: Service }) {
  const detail = serviceDetails[service.slug];
  const otherServices = publishedServices.filter(
    ({ slug }) => slug !== service.slug,
  );

  return (
    <>
      <section
        className={`${cinema.litSet} ${styles.stage}`}
        aria-labelledby="service-title"
      >
        <ParticleField well={{ x: 0.72, z: 0.45 }} />
        <div className={`container ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <Link href={pages.services.path} className={styles.back}>
              <span aria-hidden="true">←</span> All services
            </Link>
            <FlipTitle
              as="h1"
              id="service-title"
              words={titleLines(service.heading)}
              size="display"
            />
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
          <div className={styles.heroMedia}>
            <FocusFrame>
              <ServiceMedia title={service.heading} media={detail.media} />
            </FocusFrame>
          </div>
        </div>
      </section>

      <section className={styles.detail} aria-labelledby="service-deliverables">
        <div className={`container ${styles.detailLayout}`}>
          <div className={styles.detailIntro}>
            <FlipTitle
              id="service-deliverables"
              label="Deliverables"
              words={["What we", "make"]}
            />
            <p className={styles.lede}>{detail.body}</p>
          </div>
          <ScrollReveal className={styles.deliverables}>
            {detail.deliverables.map(({ title, description }, index) => (
              <article key={title} className={styles.deliverable} data-reveal>
                <span className={styles.stepNumber}>{number(index)}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </ScrollReveal>
        </div>
      </section>

      <ProcessSteps />

      <section className={styles.related} aria-labelledby="related-title">
        <div className="container">
          <div className={styles.relatedHeading}>
            <FlipTitle
              id="related-title"
              label="Selected films"
              words={["Related", "work"]}
            />
            <Link href={pages.work.path} className={cinema.lineLink}>
              Browse all films <DiagonalArrow />
            </Link>
          </div>
          <WorkCollection projects={relatedProjects(detail.related)} />
        </div>
      </section>

      <nav className={styles.more} aria-labelledby="more-services">
        <div className="container">
          <h2 id="more-services" className={styles.moreTitle}>
            More services
          </h2>
          <ul>
            {otherServices.map((other) => (
              <li key={other.slug}>
                <Link href={other.path}>
                  {other.label}
                  <DiagonalArrow />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <ContactBand />
    </>
  );
}
