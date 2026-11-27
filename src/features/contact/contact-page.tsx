import { FlipTitle } from "@/components/cinema/flip-title";
import { ScrollReveal } from "@/components/cinema/scroll-reveal";
import { SignalWaves } from "@/components/cinema/signal-waves";
import { PillLink } from "@/components/pill-link";
import { SocialIcon } from "@/components/social-icon";
import { pages, site } from "@/content/site";
import { socialLinks } from "@/content/studio";
import { BookingAction } from "./booking-action";
import { bookingUrl, formMode } from "./delivery";
import { StudioForm } from "./studio-form";
import styles from "./contact-page.module.css";

/**
 * Contact: gold signal lines run behind the page like a conversation drawn as
 * sound. The 20-minute call leads; the project enquiry sits beside it.
 */
export function ContactPage() {
  const event = bookingUrl();

  return (
    <section className={styles.page} aria-labelledby="contact-title">
      <SignalWaves className={styles.waves} />
      <div className={`container ${styles.layout}`}>
        <header className={styles.hero}>
          <FlipTitle
            as="h1"
            id="contact-title"
            label="Contact"
            words={["Talk", "to us"]}
            size="display"
          />
          <p className={styles.lede}>{pages.contact.intro}</p>
          <ul className={styles.reach} aria-label="Reach the studio">
            <li>
              <a href={`mailto:${site.email}`} className={styles.email}>
                {site.email}
              </a>
            </li>
            <li className={styles.location}>{site.location}</li>
            {socialLinks.map(({ label, platform, href }) => (
              <li key={platform}>
                <a href={href} className={styles.social} aria-label={label}>
                  <SocialIcon platform={platform} />
                </a>
              </li>
            ))}
          </ul>
        </header>

        <ScrollReveal className={styles.cards}>
          <section
            className={`${styles.card} ${styles.booking}`}
            id="booking"
            aria-labelledby="booking-title"
            data-reveal
          >
            {/* A clock face for the 20-minute call; its sweep turns slowly. */}
            <div className={styles.dial} aria-hidden="true">
              <span className={styles.sweep} />
              <strong>20</strong>
              <small>min</small>
            </div>
            <h2 id="booking-title">Book a discovery call</h2>
            <p>
              A 20-minute call to talk through what you want to make, who it is
              for and when you need it.
            </p>
            {event ? (
              <BookingAction url={event} />
            ) : (
              <PillLink
                href={`mailto:${site.email}?subject=20-minute%20discovery%20call`}
              >
                Email to book a call
              </PillLink>
            )}
          </section>

          <section
            className={`${styles.card} ${styles.enquiry}`}
            id="enquiry"
            aria-labelledby="enquiry-title"
            data-reveal
          >
            <h2 id="enquiry-title">Send a project enquiry</h2>
            <p>Share the format, deadline and any details you already have.</p>
            <StudioForm kind="enquiry" mode={formMode("enquiry")} />
          </section>
        </ScrollReveal>
      </div>
    </section>
  );
}
