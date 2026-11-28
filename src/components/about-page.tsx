import Image from "next/image";
import Link from "next/link";
import { pages, bookingPath } from "@/content/site";
import { producer, productionSteps, studioAbout } from "@/content/studio";
import { DiagonalArrow } from "./cinema/diagonal-arrow";
import { FlipTitle } from "./cinema/flip-title";
import { FocusFrame } from "./cinema/focus-frame";
import cinema from "./cinema/cinema.module.css";
import { OrbitField } from "./cinema/orbit-field";
import { ScrollReveal } from "./cinema/scroll-reveal";
import { PillLink } from "./pill-link";
import styles from "./about-page.module.css";

const [producerFirstName, ...producerRest] = producer.name.split(" ");

const pillars = [
  { title: "What we create", body: studioAbout.work },
  { title: "How we collaborate", body: studioAbout.collaboration },
];

/**
 * About: the studio's motto, "Infinity lies within", carried by tilted gold
 * orbits like the globe in its emblem. All copy is the studio's published text.
 */
export function AboutPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="about-title">
        <OrbitField centre={{ x: 0.74, y: 0.52 }} />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <FlipTitle
              as="h1"
              id="about-title"
              label={pages.about.heading}
              words={["Infinity", "lies within"]}
              size="display"
            />
            <p className={styles.lede}>{pages.about.intro}</p>
            <div className={styles.actions}>
              <PillLink href="#how-we-work" arrow="right">
                See how we work
              </PillLink>
              <PillLink href={bookingPath} variant="secondary" arrow="right">
                Book a call
              </PillLink>
            </div>
          </div>
          <FocusFrame className={styles.heroFrame}>
            <figure className={styles.still}>
              <Image
                src="/media/studio/on-set.webp"
                alt="The Diskoshaman TV crew filming on set"
                fill
                sizes="(min-width: 52rem) 44vw, 92vw"
                fetchPriority="high"
                loading="eager"
              />
            </figure>
          </FocusFrame>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="people-title">
        <ScrollReveal className={`container ${styles.storyGrid}`}>
          <FlipTitle
            id="people-title"
            label="Who we are"
            words={["Behind", "the work"]}
          />
          <div className={styles.storyCopy}>
            <p className={styles.statement} data-reveal>
              {studioAbout.intro}
            </p>
            <p data-reveal>{studioAbout.team}</p>
          </div>
        </ScrollReveal>
        <ScrollReveal className={`container ${styles.pillars}`}>
          {pillars.map(({ title, body }, index) => (
            <article key={title} className={styles.pillar} data-reveal>
              <span className={styles.number}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </ScrollReveal>
      </section>

      <section className={styles.producer} aria-labelledby="producer-title">
        <div className={`container ${styles.producerGrid}`}>
          <FocusFrame className={styles.portraitFrame}>
            <figure className={styles.portrait}>
              <Image
                src={producer.portrait}
                alt={producer.name}
                fill
                sizes="(min-width: 52rem) 38vw, 92vw"
              />
              <figcaption>
                <span>{producer.role}</span>
                Diskoshaman TV
              </figcaption>
            </figure>
          </FocusFrame>
          <ScrollReveal className={styles.producerCopy}>
            <FlipTitle
              id="producer-title"
              label={producer.role}
              words={[producerFirstName, producerRest.join(" ")]}
            />
            <blockquote className={styles.producerQuote} data-reveal>
              <p>{producer.quote}</p>
            </blockquote>
            {producer.bio.map((paragraph) => (
              <p key={paragraph} data-reveal>
                {paragraph}
              </p>
            ))}
          </ScrollReveal>
        </div>
      </section>

      <section className={styles.motto} aria-label="Studio belief">
        <OrbitField centre={{ x: 0.5, y: 0.55 }} />
        <ScrollReveal className={`container ${styles.mottoInner}`}>
          <blockquote data-reveal>
            <p>{studioAbout.quote}</p>
            <footer>Diskoshaman TV</footer>
          </blockquote>
        </ScrollReveal>
      </section>

      <section
        className={styles.process}
        id="how-we-work"
        aria-labelledby="process-title"
      >
        <div className="container">
          <FlipTitle
            id="process-title"
            label="How we work"
            words={["From brief", "to final cut"]}
          />
          <ScrollReveal>
            <ol className={styles.timeline}>
              {productionSteps.map(({ title, description }, index) => (
                <li key={title} data-reveal>
                  <span className={styles.node}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
            <div className={styles.processActions} data-reveal>
              <PillLink href={pages.services.path}>
                Explore our services
              </PillLink>
              <Link href={pages.work.path} className={cinema.lineLink}>
                See our work <DiagonalArrow />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
