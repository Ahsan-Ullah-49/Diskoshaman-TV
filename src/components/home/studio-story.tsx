import { PillLink } from "../pill-link";
import { studioStory } from "@/content/home";
import { pages } from "@/content/site";
import { StoryFilm } from "./story-film";
import { StoryMotion } from "./story-motion";
import styles from "./story.module.css";

function SplitLetters({ text }: { text: string }) {
  return Array.from(text).map((letter, index) => (
    <span key={index} className={styles.letter}>
      {letter === " " ? " " : letter}
    </span>
  ));
}

function RevealWords({ text }: { text: string }) {
  // Keep the original spaces as text so punctuation after a highlight stays attached.
  return text.split(/(\s+)/).map((part, index) =>
    part.trim() ? (
      <span key={index} className={styles.word}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Splits a story paragraph on **phrase** markers and highlights those phrases. */
function StoryParagraph({ text }: { text: string }) {
  return text.split(/\*\*(.+?)\*\*/).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className={styles.highlight}>
        <RevealWords text={part} />
      </strong>
    ) : (
      <RevealWords key={index} text={part} />
    ),
  );
}

/** The studio story renders as complete static HTML; StoryMotion layers the 3D scroll sequence on top. */
export function StudioStory() {
  const { heading, story, film } = studioStory;

  return (
    <StoryMotion labelledBy="our-story-title">
      <div className={styles.marquee} aria-hidden="true">
        <span className={styles.marqueeTrack}>
          {heading.name} · {heading.name} · {heading.name} ·
        </span>
      </div>

      <div className={`container ${styles.layout}`}>
        <h2 id="our-story-title" className={styles.heading}>
          <span className={styles.headingLabel}>{heading.label}</span>
          <span className="visually-hidden">{heading.name}</span>
          <span className={styles.headingName} aria-hidden="true">
            <SplitLetters text={heading.name} />
          </span>
        </h2>

        <div className={styles.set}>
          <div className={styles.rig}>
            <span className={styles.beam} aria-hidden="true">
              <span className={styles.beamLight} />
            </span>
            <StoryFilm film={film} />
          </div>
        </div>

        <div className={styles.storyText}>
          <div className={styles.lead}>
            {story.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                <StoryParagraph text={paragraph} />
              </p>
            ))}
          </div>
          <PillLink href={pages.about.path} className={styles.reveal}>
            Meet the studio
          </PillLink>
        </div>
      </div>
    </StoryMotion>
  );
}
