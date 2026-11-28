import Link from "next/link";
import { serviceNavigation, servicePages } from "@/content/services";
import { navigation, pages, site } from "@/content/site";
import { socialLinks } from "@/content/studio";
import { formMode } from "@/features/contact/delivery";
import { StudioForm } from "@/features/contact/studio-form";
import { BackToTop } from "./back-to-top";
import { StudioMark } from "./brand/studio-mark";
import { FooterDepth } from "./cinema/footer-depth";
import { WaveRibbon } from "./cinema/wave-ribbon";
import { FooterWordmark } from "./footer-wordmark";
import { SocialIcon } from "./social-icon";
import styles from "./site-footer.module.css";

const exploreLinks = [
  ...navigation,
  pages.contact,
  { path: "/#survey", label: "Survey" },
];

const serviceLinks = serviceNavigation.map(({ slug, label }) => ({
  label,
  path: servicePages.find((page) => page.slug === slug)?.path ?? "/",
}));

const contactLinks = [
  ...socialLinks,
  {
    label: "Email the studio",
    platform: "email",
    href: `mailto:${site.email}`,
  },
] as const;

function FooterLinks({
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: readonly { path: string; label: string }[];
}) {
  return (
    <nav className={styles.column} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul>
        {links.map(({ path, label }) => (
          <li key={path}>
            <Link href={path}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      {/* Links and newsletter: frosted glass over a 3D field of drifting studio objects. */}
      <div className={styles.upper}>
        <FooterDepth />
        <div className={styles.glass}>
          <div className={`container ${styles.layout}`}>
            <div className={styles.studio}>
              <div className={styles.emblem}>
                <StudioMark />
              </div>
              <a className={styles.email} href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </div>

            <FooterLinks
              id="footer-explore"
              title="Explore"
              links={exploreLinks}
            />
            <FooterLinks
              id="footer-services"
              title="Services"
              links={serviceLinks}
            />

            <section
              className={styles.newsletter}
              aria-labelledby="newsletter-title"
            >
              <h2 id="newsletter-title">Subscribe to our newsletter</h2>
              <StudioForm kind="newsletter" mode={formMode("newsletter")} />
              <ul className={styles.social} aria-label="Follow the studio">
                {contactLinks.map(({ label, platform, href }) => (
                  <li key={platform}>
                    <a href={href} aria-label={label}>
                      <SocialIcon platform={platform} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Sign-off: the wordmark and copyright on their own quiet, minimal stage. */}
      <div className={styles.signoff}>
        <WaveRibbon className={styles.ribbon} />
        <FooterWordmark />

        <div className={`container ${styles.base}`}>
          <small>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </small>
          <BackToTop className={styles.top} />
        </div>
      </div>
    </footer>
  );
}
