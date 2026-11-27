import { formMode } from "./delivery";
import { StudioForm } from "./studio-form";
import styles from "./contact.module.css";

export function SurveySection() {
  return (
    <section
      className={styles.survey}
      id="survey"
      aria-labelledby="survey-title"
    >
      <details className={`container ${styles.surveyDetails}`}>
        <summary>
          <h2 id="survey-title">Video production survey</h2>
          <span aria-hidden="true" />
        </summary>
        <div className={styles.surveyContent}>
          <p>
            Tell us the role video plays in your business and what you’d like it
            to achieve.
          </p>
          <StudioForm kind="survey" mode={formMode("survey")} />
        </div>
      </details>
    </section>
  );
}
