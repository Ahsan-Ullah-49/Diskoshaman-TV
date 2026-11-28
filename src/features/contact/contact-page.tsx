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
 * Contact: a centred opening screen like the rest of the site, with gold
 * signal lines running behind it like a conversation drawn as sound. Below,
 * the 20-minute call and the project enquiry sit in frosted glass over
 * slowly drifting light.
 */
export function ContactPage() {
  const event = bookingUrl();

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="contact-title">
        <SignalWaves className={styles.waves} />
        <div className={`container ${styles.heroInner}`}>
          <FlipTitle
            as="h1"
            id="contact-title"
            label="Contact"
            words={["Talk", "to us"]}
            size="display"
            align="center"
            oneLine
          />
          {/* Headings from the studio's current Contact page sit as subheadings. */}
          <p className={styles.tagline}>Make Videos Great Again!</p>
          <p className={styles.lede}>{pages.contact.intro}</p>
          <div className={styles.heroActions}>
            <PillLink href="#booking" arrow="right">
              Book a call
            </PillLink>
            <PillLink href="#enquiry" variant="secondary" arrow="right">
              Send an enquiry
            </PillLink>
          </div>
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
        </div>
      </section>

      <section
        className={styles.panels}
        aria-label="Book a call or send an enquiry"
      >
        {/* Soft drifting light gives the frosted glass something to blur. */}
        <div className={styles.glow} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <ScrollReveal className={`container ${styles.cards}`}>
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
            <p className={styles.eyebrow}>
              Free 20-Min Creative Discovery Call
            </p>
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
            <p className={styles.eyebrow}>Get in Touch with Us</p>
            <h2 id="enquiry-title">Send a project enquiry</h2>
            <p>Share the format, deadline and any details you already have.</p>
            <StudioForm kind="enquiry" mode={formMode("enquiry")} />
          </section>
        </ScrollReveal>
      </section>
    </div>
  );
}
