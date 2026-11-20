import { createPortal, flushSync } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  animate,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight, Plus, X } from "lucide-react";
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
function Links({ project }) {
  return (
    <div className="folio-links">
      {[
        ["Live site", project.url],
        ["GitHub", project.source],
      ].map(([label, url]) => {
        const href = safeUrl(url);
        return (
          href && (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
              <ArrowUpRight size={14} />
            </a>
          )
        );
      })}
    </div>
  );
}
const dialogSpring = { type: "spring", stiffness: 200, damping: 24 };
function useReflection(row, paused) {
  const x = useSpring(0, { stiffness: 220, damping: 27 });
  const y = useSpring(0, { stiffness: 220, damping: 27 });
  const light = useSpring(0, { stiffness: 200, damping: 25 });
  const bounds = useRef(null);
  const style = {
    rotateX: useTransform(y, (v) => -1.7 * v),
    rotateY: useTransform(x, (v) => 2.1 * v),
    transformPerspective: 1100,
    "--shine-x": useTransform(x, (v) => v * 33 + "%"),
    "--shine-y": useTransform(y, (v) => v * 13 + "%"),
    "--shine": light,
  };
  function reset() {
    bounds.current = null;
    x.set(0);
    y.set(0);
    light.set(0);
  }
  useEffect(() => {
    window.addEventListener("scroll", reset, { passive: true });
    window.addEventListener("resize", reset);
    return () => {
      window.removeEventListener("scroll", reset);
      window.removeEventListener("resize", reset);
    };
  }, [x, y, light]);
  function move(e) {
    if (paused || e.pointerType !== "mouse") return;
    const r = (bounds.current ??= row.current
      .querySelector(".folio-surface")
      .getBoundingClientRect());
    const normalized = (n, size) =>
      Math.max(-1, Math.min(1, (2 * n) / Math.max(size, 1) - 1));
    x.set(normalized(e.clientX - r.left, r.width));
    y.set(normalized(e.clientY - r.top, r.height));
    light.set(1);
  }
  return { style, move, reset };
}

function ProjectRow({
  project,
  index,
  position,
  active,
  paused,
  onOpen,
  hover,
  leave,
}) {
  const ref = useRef(null),
    height = useMotionValue(420),
    strip = useMotionValue(72);
  useLayoutEffect(() => {
    const el = ref.current,
      measure = () => {
        height.set(el.offsetHeight);
        const head = el.querySelector(".folio-card-head");
        strip.set(
          el.querySelector(".folio-trigger").offsetTop +
            head.offsetTop +
            head.offsetHeight +
            8,
        );
      };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
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
  const cut = useTransform(
    () => (1 - amount.get()) * Math.max(0, height.get() - strip.get()) + "px",
  );
  // Interpolate from the same spring as the shell, including during reversals.
  const detailOpacity = useTransform(
    amount,
    [0, 0.28, 0.62, 0.88, 1],
    [0, 0.025, 0.17, 0.78, 1],
  );
  const softness = useTransform(amount, [0, 0.44, 0.77, 1], [0, 3.4, 1.7, 0]);
  const imageFilter = useTransform(() =>
    softness.get() < 0.04 ? "none" : `blur(${softness.get() * 0.75}px)`,
  );
  const detailFilter = useTransform(() =>
    softness.get() < 0.04 ? "none" : `blur(${softness.get()}px)`,
  );
  const headerFilter = useTransform(
    amount,
    [0, 0.45, 1],
    ["blur(0px)", "blur(1.25px)", "blur(0px)"],
  );
  const radius = useTransform(amount, [0, 1], ["14px", "23px"]);
  const detailY = useTransform(amount, [0, 1], [7, 0]);
  const detailStyle = paused
    ? {}
    : { opacity: detailOpacity, filter: detailFilter, y: detailY };
  const spread = useTransform(amount, [0, 1], ["1px", "7px"]);
  const reflection = useReflection(ref, paused);
  const images = gallery(project);
  const current = paused || active === index;
  return (
    <div
      className="folio-track"
      inert={!paused && Math.abs(index - active) > 1}
      style={{
        zIndex: 5 - Math.min(4, Math.abs(index - active)),
        "--card-tone": ["#d5dfdb", "#d7e3f2", "#e5ddf1", "#dae3ec"][index % 4],
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
                "--spread": spread,
                "--expansion": amount,
              }
        }
      >
        <div className="folio-face">
          <div className="folio-surface" aria-hidden="true">
            <motion.div
              className="folio-photo reflective-photo"
              style={paused ? {} : reflection.style}
              transformTemplate={(v, transform) =>
                !parseFloat(v.rotateX) && !parseFloat(v.rotateY)
                  ? "none"
                  : transform
              }
              data-image={project.id}
            >
              {images[0] && (
                <motion.img
                  style={paused ? {} : { filter: imageFilter }}
                  src={images[0][1]}
                  alt=""
                />
              )}
              <span className="reflective-sweep" />
            </motion.div>
          </div>
          <button
            className="folio-trigger"
            aria-haspopup="dialog"
            aria-label={"Open " + project.title}
            onPointerMove={(e) => {
              reflection.move(e);
              hover(e);
            }}
            onPointerLeave={() => {
              reflection.reset();
              leave();
            }}
            onClick={() => {
              reflection.reset();
              leave();
              ref.current.dataset.origin = "";
              onOpen(project);
            }}
          >
            <motion.span
              className="folio-card-head"
              style={paused ? {} : { filter: headerFilter }}
            >
              <span className="folio-name">
                <small>{project.category}</small>
                <strong>{project.title}</strong>
              </span>
            </motion.span>
            <motion.span className="folio-reveal" style={detailStyle}>
              <span className="folio-display" aria-hidden="true" />
              <span className="folio-summary">{project.description}</span>
            </motion.span>
          </button>
          <motion.div inert={!current} style={detailStyle}>
            <Links project={project} />
          </motion.div>
        </div>
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
  const [active, setActive] = useState(0),
    [cursor, setCursor] = useState(false);
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
  const x = useSpring(-100, { bounce: 0.001 }),
    y = useSpring(-100, { bounce: 0.001 });
  const leave = () => setCursor(false);
  useEffect(() => {
    window.addEventListener("scroll", leave, { passive: true });
    return () => window.removeEventListener("scroll", leave);
  }, []);
  function hover(e) {
    if (paused || e.pointerType !== "mouse") return;
    if (!cursor) {
      x.jump(e.clientX);
      y.jump(e.clientY);
    } else {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    setCursor(true);
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
                hover,
                leave,
                onOpen,
              }}
            />
          ))}
        </div>
      </div>
      <motion.div
        aria-hidden="true"
        className="folio-pointer"
        style={{ left: x, top: y, x: "-50%", y: "-50%" }}
        animate={{
          width: cursor ? 80 : 16,
          height: cursor ? 32 : 16,
          scale: cursor ? 1 : 0.3,
          opacity: cursor ? 1 : 0,
        }}
        transition={{ ease: "easeInOut", duration: 0.15 }}
      >
        <AnimatePresence>
          {cursor && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              More <Plus size={16} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
// Read text ranges once at each endpoint. Word positions include real wrapping,
// font metrics and the scroll stack's current scale.
function wordBoxes(element) {
  const node = element.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return [];
  const range = document.createRange();
  return Array.from(node.textContent.matchAll(/\S+/g), (match) => {
    range.setStart(node, match.index);
    range.setEnd(node, match.index + match[0].length);
    return range.getBoundingClientRect();
  });
}
function sourceGeometry(row) {
  const face = row.querySelector(".folio-face"),
    surface = row.querySelector(".folio-surface");
  const box = surface.getBoundingClientRect(),
    photo = row.querySelector(".folio-photo");
  const label = row.querySelector(".folio-name small");
  return {
    box,
    words: wordBoxes(row.querySelector(".folio-name strong")),
    category: wordBoxes(label)[0] || label.getBoundingClientRect(),
    detailOpacity: getComputedStyle(face.querySelector(".folio-reveal"))
      .opacity,
    radius:
      parseFloat(getComputedStyle(face).getPropertyValue("--radius")) || 20,
    tilt: getComputedStyle(photo).transform,
    filter: getComputedStyle(photo.querySelector("img") || photo).filter,
    expansion: getComputedStyle(face).getPropertyValue("--expansion") || 1,
    shine: getComputedStyle(photo).getPropertyValue("--shine") || 0,
    shineX: getComputedStyle(photo).getPropertyValue("--shine-x"),
    shineY: getComputedStyle(photo).getPropertyValue("--shine-y"),
  };
}

export function ProjectStory({ project, projects, onSelect, onClose, paused }) {
  const host = useRef(null),
    scroller = useRef(null),
    closeButton = useRef(null);
  const source = useRef(document.querySelector(".folio-row[data-origin]"));
  const initialProject = useRef(project),
    currentProject = useRef(project);
  currentProject.current = project;

  const motionState = useRef(null);
  const reduced = useReducedMotion() || paused;
  const [slide, setSlide] = useState(-1);
  const images = gallery(project);
  const next =
    projects[
      (projects.findIndex((p) => p.id === project.id) + 1) % projects.length
    ];
  const onFinish = useRef(onClose);
  onFinish.current = onClose;
  const progress = useMotionValue(0);

  useLayoutEffect(() => {
    const dialog = host.current,
      row = source.current;
    const trigger =
      row?.querySelector(".folio-trigger") || document.activeElement;
    const overflow = document.body.style.overflow;
    if (row) row.dataset.origin = "";
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const panel = dialog.querySelector(".project-dialog-panel"),
      hero = panel.querySelector("header");
    const photo = hero.querySelector(".folio-photo"),
      heading = hero.querySelector(".project-dialog-heading");
    const title = heading.querySelector("h2"),
      category = heading.querySelector("small");
    const copy = panel.querySelector(".project-dialog-copy"),
      shade = dialog.querySelector(".project-dialog-shade");
    let sourceBox,
      target,
      flight,
      closing = false,
      disposed = false,
      scrollOffset = 0;
    let glyphs = [],
      fragments = [],
      wordOffsets = [],
      switchBack;
    function clear() {
      for (const el of [
        panel,
        hero,
        photo,
        heading,
        copy,
        category,
        scroller.current,
        closeButton.current,
        shade,
      ]) {
        el?.removeAttribute("style");
      }
      title.style.visibility = "";
      for (const el of [...glyphs, ...fragments]) el.remove();
      glyphs = [];
      fragments = [];
      wordOffsets = [];
    }
    function measure() {
      clear();
      const scroll = scroller.current.scrollTop;
      scroller.current.scrollTop = 0;
      const box = panel.getBoundingClientRect(),
        picture = hero.getBoundingClientRect();
      target = {
        box,
        picture,
        words: wordBoxes(title),
        category: category.getBoundingClientRect(),
        title: getComputedStyle(title).fontSize,
      };
      sourceBox = row?.isConnected ? sourceGeometry(row) : null;
      scroller.current.scrollTop = scroll;
      if (!sourceBox) return;
      copy.inert = true;
      title.style.visibility = "hidden";
      for (const selector of [".folio-summary", ".folio-links"]) {
        const from = row.querySelector(selector);
        if (!from || !from.textContent) continue;
        const rect = from.getBoundingClientRect(),
          copy = from.cloneNode(true);
        const scale =
          sourceBox.box.width / row.querySelector(".folio-face").offsetWidth;
        const style = getComputedStyle(from);
        copy.inert = true;
        copy.setAttribute("aria-hidden", "true");
        copy.classList.add("flight-fragment");
        Object.assign(copy.style, {
          left: rect.left - sourceBox.box.left + "px",
          top: rect.top - sourceBox.box.top + "px",
          width: rect.width / scale + "px",
          transform: "scale(" + scale + ")",
          font: style.font,
          color: style.color,
          textShadow: style.textShadow,
          margin: 0,
          padding: 0,
          border: 0,
        });
        hero.appendChild(copy);
        fragments.push(copy);
      }
      for (const word of title.textContent.match(/\S+/g) || []) {
        const el = document.createElement("span");
        el.className = "flight-word";
        el.setAttribute("aria-hidden", "true");
        el.textContent = word;
        el.style.fontSize = target.title;
        hero.appendChild(el);
        glyphs.push(el);
        const inline = wordBoxes(el)[0],
          bounds = el.getBoundingClientRect();
        wordOffsets.push({ x: inline.x - bounds.x, y: inline.y - bounds.y });
      }
    }
    function draw(value) {
      if (!sourceBox) return;
      const t = Math.max(0, Math.min(1, value)),
        mix = (a, b) => a + (b - a) * t;
      const a = sourceBox.box,
        b = target.box;
      const w = mix(a.width, b.width),
        h = mix(a.height, b.height);
      Object.assign(panel.style, {
        position: "fixed",
        left: 0,
        top: 0,
        width: w + "px",
        height: h + "px",
        transform: `translate3d(${mix(a.x, b.x)}px,${mix(a.y, b.y)}px,0)`,
        borderRadius: mix(sourceBox.radius, 24) + "px",
      });
      hero.style.height = mix(a.height, target.picture.height) + "px";
      const scroll = scroller.current;
      scroll.style.maxHeight = "100%";
      scroll.style.overflow = "hidden";
      scroll.scrollTop = 0;
      hero.style.transform = `translateY(${-scrollOffset * t}px)`;
      copy.style.width = b.width + "px";
      copy.style.transform = hero.style.transform;
      const reveal = Math.max(0, Math.min(1, (t - 0.45) / 0.55));
      copy.style.opacity = reveal;
      closeButton.current.style.opacity = reveal;
      shade.style.opacity = t;
      // Only the screenshot plane tilts. Remove its captured perspective continuously.
      if (sourceBox.tilt !== "none") {
        const m = new DOMMatrix(sourceBox.tilt),
          identity = new DOMMatrix().toFloat64Array();
        photo.style.transform =
          "matrix3d(" +
          Array.from(m.toFloat64Array(), (n, i) => mix(n, identity[i])).join(
            ",",
          ) +
          ")";
      }
      photo.style.setProperty("--shine", sourceBox.shine * (1 - t));
      photo.style.setProperty("--shine-x", sourceBox.shineX);
      photo.style.setProperty("--shine-y", sourceBox.shineY);
      photo.style.setProperty(
        "--expansion",
        mix(Number(sourceBox.expansion), 1),
      );
      if (photo.firstElementChild?.tagName === "IMG")
        photo.firstElementChild.style.filter =
          "blur(" +
          (parseFloat(sourceBox.filter.replace("blur(", "")) || 0) * (1 - t) +
          "px)";
      const position = (el, from, to, offset) => {
        if (!from || !to) return;
        const x = mix(from.x - a.x, to.x - b.x),
          y = mix(from.y - a.y, to.y - b.y);
        const scale = mix(from.width / Math.max(to.width, 1), 1);
        el.style.transform = `translate3d(${x - (offset?.x || 0) * scale}px,${y - (offset?.y || 0) * scale}px,0) scale(${scale})`;
      };
      heading.style.position = "static";
      category.style.position = "absolute";
      category.style.inset = "0 auto auto 0";
      category.style.transformOrigin = "top left";
      position(category, sourceBox.category, target.category);
      glyphs.forEach((el, i) =>
        position(el, sourceBox.words[i], target.words[i], wordOffsets[i]),
      );
      fragments.forEach(
        (el) =>
          (el.style.opacity =
            Math.max(0, 1 - t * 3) * Number(sourceBox.detailOpacity)),
      );
    }
    const unsubscribe = progress.on("change", draw);
    function settle() {
      if (disposed) return;
      if (closing) { onFinish.current(); return; }
      clear();
      copy.inert = false;
      panel.style.borderRadius = "24px";
      photo.firstElementChild?.style.removeProperty("filter");
    }
    function run(end) {
      flight?.stop();
      if (reduced || !sourceBox) {
        progress.jump(end);
        settle();
        return;
      }
      flight = animate(progress, end, { ...dialogSpring, onComplete: settle });
    }
    function close() {
      if (closing) return;
      closing = true;
      if (currentProject.current.id !== initialProject.current.id) {
        if (reduced) {
          onFinish.current();
          return;
        }
        switchBack = hero.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 95,
          fill: "forwards",
        });
        switchBack.finished
          .then(() => {
            if (disposed) return;
            flushSync(() => {
              setSlide(-1);
              onSelect(initialProject.current);
            });
            switchBack.cancel();
            switchBack = hero.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 100,
            });
            contract();
          })
          .catch(() => {});
        return;
      }
      contract();
    }
    function contract() {
      if (!glyphs.length) {
        scrollOffset = scroller.current.scrollTop;
        measure();
      } else if (row?.isConnected) sourceBox = sourceGeometry(row);
      draw(progress.get());
      run(0);
    }
    motionState.current = { close };
    closeButton.current.focus({ preventScroll: true });
    measure();
    progress.jump(0);
    draw(0);
    run(1);
    const resize = () => {
      if (glyphs.length) {
        measure();
        draw(progress.get());
      }
    };
    window.addEventListener("resize", resize);
    return () => {
      disposed = true;
      flight?.stop();
      switchBack?.cancel();
      unsubscribe();
      window.removeEventListener("resize", resize);
      clear();
      if (row) delete row.dataset.origin;
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [progress, reduced]);
  const close = () => motionState.current?.close();
  return createPortal(
    <dialog
      className="project-dialog-host"
      ref={host}
      aria-labelledby="folio-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div
        className="project-dialog-stage"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="project-dialog-shade" />
        <article className="project-dialog-panel" style={{ borderRadius: 24 }}>
          <div className="project-dialog-scroll" ref={scroller}>
            <header className="project-dialog-hero">
              <div
                className="folio-photo reflective-photo"
                data-image={project.id}
              >
                {images[0] && <img src={images[0][1]} alt={images[0][0]} />}
                <span className="reflective-sweep" />
              </div>
              <div className="project-dialog-heading">
                <small>{project.category}</small>
                <h2 id="folio-title">{project.title}</h2>
              </div>
            </header>
            <div className="project-dialog-copy">
              {project.subtitle && <h3>{project.subtitle}</h3>}
              <p>{project.description}</p>
              {project.detail && project.detail !== project.description && (
                <p>{project.detail}</p>
              )}
              <ul aria-label="Technologies">
                {project.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <li key={t}>{t}</li>
                  ))}
              </ul>
              {images.length > 0 && (
                <figure>
                  {images[slide] && (
                    <div className="folio-screen">
                      <img src={images[slide][1]} alt={images[slide][0]} />
                    </div>
                  )}
                  <figcaption>
                    {images.map(([label, url], i) => (
                      <button
                        key={url}
                        type="button"
                        aria-expanded={i === slide}
                        onClick={() => setSlide(i === slide ? -1 : i)}
                      >
                        {label}
                      </button>
                    ))}
                  </figcaption>
                </figure>
              )}
              <footer>
                <Links project={project} />
                {next && next.id !== project.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlide(-1);
                      onSelect(next);
                      scroller.current.scrollTop = 0;
                    }}
                  >
                    Next project →
                  </button>
                )}
              </footer>
            </div>
          </div>
          <button
            ref={closeButton}
            className="project-dialog-close"
            aria-label="Close project"
            onClick={close}
          >
            <X size={18} />
          </button>
        </article>
      </div>
    </dialog>,
    document.body,
  );
}
