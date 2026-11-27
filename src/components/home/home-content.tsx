import Link from "next/link";
import { DiagonalArrow } from "@/components/cinema/diagonal-arrow";
import cinema from "@/components/cinema/cinema.module.css";
import { ParticleField } from "@/components/cinema/particle-field";
import { ContactBand } from "@/components/page-sections";
import { featuredProject, featuredProjects } from "@/content/projects";
import { pages } from "@/content/site";
import { SurveySection } from "@/features/contact/survey-section";
import { homeServices } from "@/features/services/service-pages";
import { FilmStage } from "@/features/work/film-stage";
import { BrandLogoSection } from "./brand-logo-section";
import { ServiceShowcase } from "./service-showcase";
import styles from "./home-content.module.css";

export function HomeContent() {
  return (
    <>
      <BrandLogoSection />

      <section
        className={`${cinema.litSet} ${styles.work}`}
        aria-labelledby="home-work-title"
      >
        <div className="container">
          <div className={styles.workHeading}>
            <h2 id="home-work-title" className={cinema.display}>
              Selected work
            </h2>
            <Link href={pages.work.path} className={cinema.lineLink}>
              Explore all films <DiagonalArrow />
            </Link>
          </div>
          <FilmStage
            films={[featuredProject, ...featuredProjects]}
            scrollReveal
          />
        </div>
      </section>

      <section
        className={`${cinema.litSet} ${styles.services}`}
        aria-labelledby="home-services-title"
      >
        <ParticleField well={{ x: 0.74, z: 0.38 }} />
        <div className="container">
          <ServiceShowcase services={homeServices} />
        </div>
      </section>
      <ContactBand />
      <SurveySection />
    </>
  );
}
