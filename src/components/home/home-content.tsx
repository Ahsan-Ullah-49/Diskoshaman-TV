import cinema from "@/components/cinema/cinema.module.css";
import { ParticleField } from "@/components/cinema/particle-field";
import { homeScreeningFilms } from "@/content/projects";
import { SurveySection } from "@/features/contact/survey-section";
import { homeServices } from "@/features/services/service-pages";
import { BrandLogoSection } from "./brand-logo-section";
import { HomeScreening } from "./home-screening";
import { ServiceShowcase } from "./service-showcase";
import styles from "./home-content.module.css";

export function HomeContent() {
  return (
    <>
      <BrandLogoSection />

      <HomeScreening films={homeScreeningFilms} />

      <section
        className={`${cinema.litSet} ${styles.services}`}
        aria-labelledby="home-services-title"
      >
        <ParticleField well={{ x: 0.74, z: 0.38 }} />
        <div className="container">
          <ServiceShowcase services={homeServices} />
        </div>
      </section>
      <SurveySection />
    </>
  );
}
