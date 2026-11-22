import ProjectDialog from "./ProjectDialog";
import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ProjectTitle,
  ProjectDescription,
  BrowserBar,
} from "./ProjectPresentation";
import { safeUrl } from "./content";
import "./project-index.css";

const captures = {
  "fee-portal": [
    ["Administrator overview", "fee-portal"],
    ["Collection overview", "collection"],
    ["Student payment", "payment-mobile"],
    ["Receipt printing", "receipt-half"],
  ],
  achuppori: [
    ["Slide to pay", "print-checkout"],
    ["Document upload", "print-upload"],
  ],
  sso: [
    ["Single sign-on", "nec-signin"],
    ["Keycloak administration", "keycloak-admin"],
  ],
};
function gallery(p) {
  const src = safeUrl(p.image, "media");
  const list = captures[p.id];
  if (!list) return src ? [[p.title, src]] : [];
  return list.map(([label, name], i) => [
    label,
    i === 0 && src ? src : "/assets/projects/" + name + ".webp",
  ]);
}
function ProjectRow({ project, index, position, active, paused, onOpen }) {
  const ref = useRef(null),
    height = useMotionValue(420),
    strip = useMotionValue(72);
  useLayoutEffect(() => {
    const el = ref.current,
      measure = () => {
        height.set(el.offsetHeight);
        const head = el.querySelector(".work-sheet-head");
        strip.set(head.offsetTop + head.offsetHeight + 12);
      };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(el.querySelector(".work-sheet-head"));
    return () => observer.disconnect();
  }, [height, strip]);
  const distance = useTransform(() => index - position.get());
  const amount = useTransform(() => Math.max(0, 1 - Math.abs(distance.get())));
  const y = useTransform(() => {
    const d = distance.get(),
      h = height.get();
    return (
      -h / 2 +
      (d < 0
        ? d * (strip.get() + 9)
        : Math.min(1, d) * (h + 14) + Math.max(0, d - 1) * (strip.get() + 9))
    );
  });
  const scale = useTransform(
    distance,
    [-2, -1, 0, 1, 2],
    [0.84, 0.94, 1, 0.94, 0.84],
  );
  const opacity = useTransform(
    distance,
    [-2, -1, 0, 1, 2],
    [0, 0.92, 1, 0.92, 0],
  );
  useLayoutEffect(() => {
    const track = ref.current.parentElement;
    const update = (value) => {
      track.inert = !paused && value <= 0;
    };
    update(opacity.get());
    return opacity.on("change", update);
  }, [opacity, paused]);
  const cut = useTransform(
    () => (1 - amount.get()) * Math.max(0, height.get() - strip.get()) + "px",
  );
  // Interpolate from the same spring as the shell, including during reversals.
  const detailOpacity = useTransform(
    amount,
    [0, 0.28, 0.62, 0.88, 1],
    [0, 0.025, 0.17, 0.78, 1],
  );
  const radius = useTransform(amount, [0, 1], ["14px", "20px"]);
  const images = gallery(project);
  const current = paused || active === index;
  return (
    <div
      className="folio-track"
      style={{
        zIndex: 5 - Math.min(4, Math.abs(index - active)),
      }}
    >
      <motion.article
        ref={ref}
        data-project-id={project.id}
        data-current={current || undefined}
        className="folio-row"
        style={
          paused
            ? {}
            : {
                y,
                scale,
                opacity,
                "--cut": cut,
                "--radius": radius,
              }
        }
      >
        <button
          type="button"
          className="folio-trigger work-sheet"
          data-current={current || undefined}
          data-cursor="View project"
          aria-haspopup="dialog"
          aria-label={"Open " + project.title}
          onClick={(event) => {
            ref.current.dataset.origin = "";
            onOpen(project, event.currentTarget);
          }}
        >
          <span className="work-sheet-body">
            <span className="work-sheet-head">
              <strong className="work-sheet-name">
                <ProjectTitle title={project.title} />
              </strong>
            </span>
            {project.description && (
              <motion.span
                className="work-sheet-summary"
                style={paused ? {} : { opacity: detailOpacity }}
              >
                <ProjectDescription project={project} />
              </motion.span>
            )}
            {images[0] && (
              <span className="work-sheet-preview" data-project={project.id}>
                <BrowserBar />
                <img src={images[0][1]} alt="" draggable="false" />
              </span>
            )}
          </span>
        </button>
      </motion.article>
    </div>
  );
}
export function ProjectDeck(props) {
  return props.projects.length ? <ProjectStack {...props} /> : null;
}
function ProjectStack({ projects, onOpen, paused }) {
  const section = useRef(null);
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const target = useTransform(
    scrollYProgress,
    [0, 1],
    [0, projects.length - 1],
  );
  const position = useSpring(target, { stiffness: 222, damping: 34 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(position, "change", (value) =>
    setActive(Math.max(0, Math.min(projects.length - 1, Math.round(value)))),
  );
  const destination = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  useMotionValueEvent(target, "change", (value) => {
    destination.current = Math.round(value);
    setSelectedIndex(destination.current);
  });
  function navigate(step) {
    const i = Math.max(
      0,
      Math.min(projects.length - 1, destination.current + step),
    );
    destination.current = i;
    setSelectedIndex(i);
    const el = section.current;
    window.scrollTo({
      top:
        scrollY +
        el.getBoundingClientRect().top +
        ((el.offsetHeight - innerHeight) * i) /
          Math.max(1, projects.length - 1),
      behavior: "instant",
    });
  }
  return (
    <section
      id="work"
      className="folio-index"
      ref={section}
      data-paused={paused || undefined}
      style={{ "--count": projects.length }}
    >
      <div className="folio-stage">
        <div className="folio-intro">
          <h2>
            Selected
            <br />
            <em>projects.</em>
          </h2>
          <span>{projects.length} projects</span>
          {!paused && (
            <div className="folio-nav">
              <button
                aria-label="Previous project card"
                disabled={selectedIndex === 0}
                onClick={() => navigate(-1)}
              >
                ←
              </button>
              <button
                aria-label="Next project card"
                disabled={selectedIndex === projects.length - 1}
                onClick={() => navigate(1)}
              >
                →
              </button>
            </div>
          )}
        </div>
        <div className="folio-stack">
          {projects.map((project, index) => (
            <ProjectRow
              key={project.id + (paused ? "-static" : "-stack")}
              {...{
                project,
                index,
                active,
                position,
                paused,
                onOpen,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
export function ProjectStory({ project, onClose, paused }) {
  return (
    <ProjectDialog
      key={project.id}
      project={project}
      images={gallery(project)}
      onClose={onClose}
      reduced={paused}
    />
  );
}
