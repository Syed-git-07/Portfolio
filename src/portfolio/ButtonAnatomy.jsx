import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { safeUrl } from "./content";
import "./button-anatomy.css";

const layers = [
  ["Drop shadow", "Y 1, blur 2, #00285A 14%", 104],
  ["Stroke", "1 outside, #0A86DC", 55],
  ["Fill", "Linear, #76C8F5 #2DB1FE #0094F6", 4],
  ["Inner shadow", "Blur 1, spread 1, #FFF 16%", -48],
  ["Text", "Inter Medium 16, #F5FAFC", -103],
];

export default function ButtonAnatomy({ profile, paused }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const still = paused || reduced;
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });
  const sceneScale = useTransform(scrollYProgress, [0, 0.15, 1], [1, 1, 0.82]);
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section
      id="home"
      ref={root}
      className={`anatomy-home ${still ? "still" : ""}`}
    >
      <div className="anatomy-viewport">
        <header className="anatomy-heading">
          <div>
            <p>{profile.role}</p>
            <h1>{profile.name.replace(/\s+M\.?$/, "")}</h1>
          </div>
          <a
            href={safeUrl(profile.resume, "media")}
            target="_blank"
            rel="noreferrer"
          >
            Résumé ↗
          </a>
        </header>
        <motion.div
          className="anatomy-stage"
          style={still ? {} : { scale: sceneScale, y: sceneY }}
        >
          <div className="anatomy-diagram">
            {layers.map(([label, spec, offset], i) => (
              <div
                className="anatomy-track"
                key={label}
                style={{ "--dy": offset + "cqw" }}
              >
                <div className={`anatomy-plane anatomy-p${i}`}>
                  {i === 4 && "Get started"}
                </div>
                <div className="anatomy-caption">
                  <strong>{label}</strong>
                  <small>{spec}</small>
                </div>
                {i === 4 && (
                  <a
                    className="anatomy-action"
                    href="#work"
                    aria-label="Get started — explore selected work"
                  />
                )}
              </div>
            ))}
            <div className="anatomy-blue" aria-hidden="true">
              Get started
            </div>
          </div>
        </motion.div>
        <div className="anatomy-foot">
          <span>{profile.location}</span>
          <a href="#work">Selected work ↓</a>
        </div>
      </div>
    </section>
  );
}
