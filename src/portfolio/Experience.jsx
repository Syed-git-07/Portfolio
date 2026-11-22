import { usePortfolioScroll } from "./usePortfolioScroll";
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowUpRight,
  Search,
  FileText,
  RotateCcw,
  Download,
  Layers,
} from "lucide-react";
import Modal from "./Modal";
import GitHubActivity from "./GitHubActivity";
import Contact from "./Contact";
import { ProjectDeck, ProjectStory } from "./WorkShowcase";
import "./showcase.css";
import { HomeNavigation } from "./HomePage";
import { safeUrl } from "./content";
import "./experience.css";
import { EditorialContent, EditorialFooter, EditorialHeader, EditorialPointer } from "./EditorialHome";
const Ball = lazy(() => import("./reference/Ball").then(module => ({ default: module.Ball })));
const InfiniteSpiral = lazy(() => import("./reference/InfiniteSpiral"));

const ext = { target: "_blank", rel: "noopener noreferrer" };
const colours = ["#a8baff", "#bdc6d5", "#aea0f5", "#98c7d2"];

const certImage = (c) =>
  safeUrl(c.image, "media") ||
  (["iiot", "iot", "english", "python", "deep-learning"].includes(c.id)
    ? `/assets/certificates/${c.id}.webp`
    : "/assets/certificate-placeholder.svg");
const words = (s) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

function Roll({ value }) {
  return (
    <span className="rolling-number" aria-label={String(value)}>
      {String(value)
        .padStart(2, "0")
        .split("")
        .map((n, i) => (
          <span className="number-reel" key={i} aria-hidden="true">
            <motion.span
              animate={{ y: `-${Number(n) * 10}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            >
              {Array.from({ length: 10 }, (_, j) => (
                <span key={j}>{j}</span>
              ))}
            </motion.span>
          </span>
        ))}
    </span>
  );
}
function Mask({ children, as = "div", className = "" }) {
  const Component = motion[as];
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <Component
        initial={false}
        variants={{
          hidden: {
            clipPath: reduced ? "inset(0)" : "inset(0 0 100% 0)",
            y: reduced ? 0 : 25,
          },
          visible: { clipPath: "inset(0)", y: 0 },
        }}
        transition={{ duration: reduced ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </Component>
    </motion.div>
  );
}
function SkillMeter({ skills }) {
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState("field");
  const total = skills.reduce((n, s) => n + words(s.items).length, 0);
  const current = skills.find((s) => s.id === active);
  const dots = skills.flatMap((s, i) =>
    words(s.items).map((name) => ({ name, id: s.id, colour: colours[i % 4] })),
  );
  return (
    <section id="toolkit" className="new-toolkit">
      <div>
        <span className="micro-label">02 — THE TOOLKIT</span>
        <Mask>
          <h2>
            One mind.
            <br />
            Many <em>tools.</em>
          </h2>
        </Mask>
        <p>
          I connect interfaces, data and intelligent systems.
          <br />
          Here’s what I work with.
        </p>
        <Suspense fallback={null}><Ball /></Suspense>
        <div className="tool-tags">
          {(current
            ? words(current.items)
            : ["React", "Next.js", "Java", "Python", "MySQL", "Git"]
          ).map((t) => (
            <motion.span layout key={t}>
              {t}
            </motion.span>
          ))}
        </div>
      </div>
      <div className="context-meter">
        <div className="meter-top">
          <span>Technical context</span>
          <button onClick={() => setMode(mode === "field" ? "bar" : "field")}>
            <Layers size={14} />
            {mode === "field" ? "Bar view" : "Dot view"}
          </button>
        </div>
        <div className="meter-number">
          <Roll value={current ? words(current.items).length : total} />
          <span>{current ? current.title : "tools & technologies"}</span>
        </div>
        <div
          className={`meter-visual ${mode}`}
          onPointerLeave={() => setActive(null)}
        >
          {dots.map((dot, i) => (
            <button
              key={`${dot.id}-${i}`}
              aria-label={`${dot.name}, ${skills.find((s) => s.id === dot.id).title}`}
              onFocus={() => setActive(dot.id)}
              onPointerEnter={() => setActive(dot.id)}
              onClick={() => setActive(active === dot.id ? null : dot.id)}
              style={{
                background: dot.colour,
                opacity: active && active !== dot.id ? 0.2 : 1,
                transitionDelay: `${i * 5}ms`,
              }}
              title={dot.name}
            />
          ))}
          {mode === "field" &&
            Array.from({ length: Math.max(0, 60 - dots.length) }, (_, i) => (
              <i key={`empty-${i}`} />
            ))}
        </div>
        <div className="meter-legend">
          {skills.map((s, i) => (
            <button
              key={s.id}
              onPointerEnter={() => setActive(s.id)}
              onFocus={() => setActive(s.id)}
              onClick={() => setActive(active === s.id ? null : s.id)}
              aria-pressed={active === s.id}
            >
              <i style={{ background: colours[i % 4] }} />
              {s.title}
              <span>{words(s.items).length}</span>
            </button>
          ))}
        </div>
        <p className="meter-foot">
          {current?.description || "Each lit dot represents one listed tool."}
        </p>
      </div>
    </section>
  );
}

function CertificateFan({ certificates }) {
  const [fanned, setFanned] = useState(false);
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState(null);
  const item = certificates[selected % Math.max(certificates.length, 1)];
  if (!item) return null;
  return (
    <section id="credentials" className="credential-section">
      <div className="credential-heading">
        <span className="micro-label">03 — LEARNING, COLLECTED</span>
        <h2>
          Earned.
          <br />
          <em>Not just listed.</em>
        </h2>
      </div>
      <div
        className="certificate-stage"
        onPointerEnter={() => setFanned(true)}
        onPointerLeave={() => setFanned(false)}
        onFocusCapture={() => setFanned(true)}
      >
        <div className="fan-ground" />
        {certificates.map((c, i) => {
          const angle = (i - (certificates.length - 1) / 2) * (fanned ? 14 : 3);
          return (
            <motion.button
              key={c.id}
              className={`credential-card ${i === selected ? "selected" : ""}`}
              style={{ zIndex: i, transformOrigin: "50% 380px" }}
              animate={{ rotate: angle, y: i === selected ? -35 : 0 }}
              whileHover={{ scale: 1.025 }}

              transition={{ type: "spring", stiffness: 150, damping: 18 }}
              onClick={() => {
                setSelected(i);
                setFanned(true);
                setView(c);
              }}
              aria-label={`Preview ${c.title}`}
              aria-pressed={i === selected}
            >
              <span className="card-edge-number">0{i + 1}</span>
              <div className="credential-symbol">
                N<span>PTEL</span>
              </div>
              <img
                src={certImage(c)}
                onError={(e) => {
                  e.currentTarget.hidden = true;
                }}
                alt=""
                draggable="false"
              />
              <div className="credential-card-label">
                <span>{c.title}</span>
                <b>{c.score}</b>
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="credential-selected">
        <div>
          <span className="micro-label">
            CERTIFICATE {selected + 1} / {certificates.length}
          </span>
          <AnimatePresence mode="wait">
            <motion.h3
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {item.title}
            </motion.h3>
          </AnimatePresence>
          <p>{item.issuer}</p>
        </div>
      </div>
      <div
        className="certificate-dots certificate-names"
        aria-label="Choose certificate"
      >
        {certificates.map((c, i) => (
          <button
            key={c.id}
            onClick={() => {
              setSelected(i);
              setView(c);
            }}
            aria-label={`Certificate ${i + 1}: ${c.title}`}
            aria-pressed={i === selected}
          >
            {c.title}
          </button>
        ))}
      </div>
      {view && (
        <Modal title={view.title} onClose={() => setView(null)}>
          <div className="new-cert-modal">
            <img
              src={certImage(view)}
              alt={view.title}
              onError={(e) => {
                e.currentTarget.hidden = true;
              }}
            />
            <h2>{view.title}</h2>
            <p>
              {view.issuer} · {view.score}
            </p>
            <a
              className="new-button"
              download
              href={safeUrl(view.file, "media")}
              {...ext}
            >
              Download certificate
              <Download size={16} />
            </a>
          </div>
        </Modal>
      )}
    </section>
  );
}

function Journey({ education, profile }) {
  const [index, setIndex] = useState(0),
    [flipped, setFlipped] = useState(false);
  const selected = education[index];
  return (
    <section id="journey" className="new-journey">
      <div className="journey-top">
        <span className="micro-label">04 — THE PERSON, THE PATH</span>
        <h2>
          Still curious.
          <br />
          <em>Still becoming.</em>
        </h2>
        <Suspense fallback={null}><Ball /></Suspense>
      </div>
      <div className="journey-grid">
        <button
          className={`flip-profile ${flipped ? "is-flipped" : ""}`}
          onClick={() => setFlipped(!flipped)}
          aria-label={flipped ? "Show portrait" : "Turn over profile card"}
          aria-pressed={flipped}
        >
          <span className="profile-front">
            <img src={safeUrl(profile.photo, "media")} alt={profile.name} />
            <span className="profile-overlay">
              <span>
                {profile.name}
                <small>{profile.role}</small>
              </span>
              <RotateCcw size={20} />
            </span>
          </span>
          <span className="profile-back">
            <span className="micro-label">A LITTLE ABOUT ME</span>
            <strong>
              Hello,
              <br />
              I’m Syed.
            </strong>
            <span>{profile.about}</span>
            <span className="flip-back-label">Turn back ↗</span>
          </span>
        </button>
        <div className="journey-path">
          <p className="journey-description">
            From learning how things work
            <br />
            to building things that work.
          </p>
          <div className="timeline-track">
            {education.map((e, i) => (
              <button
                key={e.id}
                className={index === i ? "active" : ""}
                onClick={() => setIndex(i)}
                aria-pressed={index === i}
              >
                <span className="timeline-node">
                  {index === i ? <motion.span layoutId="journey-node" /> : null}
                </span>
                <span>
                  {e.period}
                  <strong>{e.title}</strong>
                </span>
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
          {selected && (
            <AnimatePresence mode="wait">
              <motion.div
                className="journey-detail"
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <span>{selected.place}</span>
                <strong>{selected.note}</strong>
              </motion.div>
            </AnimatePresence>
          )}
          <div className="profile-links">
            <a href={safeUrl(profile.github)} {...ext}>
              GitHub
              <ArrowUpRight size={16} />
            </a>
            <a href={safeUrl(profile.linkedin)} {...ext}>
              LinkedIn
              <ArrowUpRight size={16} />
            </a>
            <a href={safeUrl(profile.resume, "media")} {...ext}>
              Résumé
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Archive({ content, paused }) {
  const [view, setView] = useState(null);
  const [open, setOpen] = useState(false);
  const items = useMemo(
    () =>
      content.certificates.map((c) => ({
        id: c.id,
        src: certImage(c),
        alt: c.title,
        href: `#certificate/${c.id}`,
      })),
    [content.certificates],
  );
  useEffect(() => {
    const handle = () => {
      const c = content.certificates.find(
        (c) => location.hash === `#certificate/${c.id}`,
      );
      if (c) setView(c);
    };
    handle();
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, [content.certificates]);
  return (
    <section id="archive" className="new-archive">
      <div
        className="archive-orbit"
        onClick={(event) => {
          const link = event.target.closest("a");
          const c = content.certificates.find(
            (c) => link?.hash === `#certificate/${c.id}`,
          );
          if (c && !event.defaultPrevented) {
            event.preventDefault();
            setView(c);
          }
        }}
      >
        <Suspense fallback={null}>
          <InfiniteSpiral
          items={items}
          animationMode={paused ? "drag" : "all"}
          speed={0.35}
          radius={185}
          cardWidth={220}
          cardHeight={155}
          verticalSpacing={90}
          cardsPerTurn={5}
          centerScale={1}
          edgeBlur={0}
          imageFit="contain"
          cardRadius={5}
          />
        </Suspense>
      </div>
      <div className="archive-content">
        <span className="micro-label">05 — THE ARCHIVE</span>
        <h2>
          Learning,
          <br />
          <em>on record.</em>
        </h2>
        <div
          className={`document-folder ${open ? "is-open" : ""}`}
          onPointerEnter={() => setOpen(true)}
          onPointerLeave={() => setOpen(false)}
          onFocusCapture={() => setOpen(true)}
        >
          <div className="folder-back" />
          {content.certificates.map((c, i) => (
            <motion.button
              className="folder-document"
              key={c.id}
              style={{
                "--i": i,
                "--n": content.certificates.length,
                zIndex: i + 1,
              }}
              animate={{
                x: open ? (i - (content.certificates.length - 1) / 2) * 53 : 0,
                y: open ? -100 - Math.sin(i) * 15 : -i * 5,
                rotate: open
                  ? (i - (content.certificates.length - 1) / 2) * 9
                  : 0,
              }}
              whileHover={{ y: -150, scale: 1.08, zIndex: 20 }}
              drag
              dragSnapToOrigin
              onClick={() => setView(c)}
              aria-label={`Open archived ${c.title}`}
            >
              <img src={certImage(c)} alt="" draggable="false" />
              <span>{c.title}</span>
            </motion.button>
          ))}
          <button
            className="folder-front"
            onClick={() => setOpen(true)}
            aria-expanded={open}
          >
            <FileText size={24} />
            <span>
              Certificates<small>{content.certificates.length} documents</small>
            </span>
          </button>
        </div>
        <div className="archive-counts">
          <div>
            <Roll value={content.projects.length} />
            <span>PROJECTS</span>
          </div>
          <div>
            <Roll value={content.certificates.length} />
            <span>CERTIFICATES</span>
          </div>
          <div>
            <Roll value={content.achievements.length} />
            <span>MILESTONES</span>
          </div>
        </div>
        <div className="achievement-records">
          {content.achievements.map((a) => (
            <details key={a.id}>
              <summary>{a.title}</summary>
              <p>
                {a.award} · {a.place}
              </p>
            </details>
          ))}
        </div>
      </div>
      {view && (
        <Modal title={view.title} onClose={() => setView(null)}>
          <div className="new-cert-modal">
            <img src={certImage(view)} alt={view.title} />
            <h2>{view.title}</h2>
            <a
              className="new-button"
              href={safeUrl(view.file, "media")}
              download
            >
              Download certificate <Download size={16} />
            </a>
          </div>
        </Modal>
      )}
    </section>
  );
}

function SearchMenu({ content, onClose, onOpen }) {
  const [query, setQuery] = useState("");
  return (
    <Modal variant="search-dialog" title="Search portfolio" onClose={onClose}>
      <div className="command-menu search-sheet">
        <h2>Find something.</h2>
        <label>
          <Search />
          <input
            autoFocus
            aria-label="Search portfolio"
            placeholder="Search the portfolio"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div>
          {[
            ["work", "Selected projects"],
            ["toolkit", "Toolkit"],
            ["credentials", "Certifications"],
            ["journey", "Education"],
            ["archive", "Archive"],
            ["contact", "Contact"],
          ]
            .filter(([, n]) => n.toLowerCase().includes(query.toLowerCase()))
            .map(([id, n], i) => (
              <motion.a
                layout
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.025 }}
                key={id}
                href={`#${id}`}
                onClick={onClose}
              >
                {n}
                <ArrowUpRight size={16} />
              </motion.a>
            ))}
          {content.projects
            .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
            .map((p, i) => (
              <motion.button
                layout
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.025 }}
                key={p.id}
                onClick={() => {
                  onClose();
                  onOpen(p);
                }}
              >
                {p.title}
                <span>PROJECT</span>
              </motion.button>
            ))}
          {query &&
            ![
              "Selected projects",
              "Toolkit",
              "Certifications",
              "Education",
              "Archive",
              "Contact",
              ...content.projects.map((p) => p.title),
            ].some((n) => n.toLowerCase().includes(query.toLowerCase())) && (
              <p role="status">No matches.</p>
            )}
        </div>
      </div>
    </Modal>
  );
}

const extraSections = new Set([
  "#notes",
  "#featured",
  "#work",
  "#github-activity",
  "#toolkit",
  "#credentials",
  "#journey",
  "#archive",
  "#contact",
]);
function pageHandoff(transitionRef, from, to, change) {
  const isDetail = (hash) => /^#(?:project|certificate)\//.test(hash);
  if (
    (from || "#home") === (to || "#home") ||
    to === "#main" ||
    isDetail(from) ||
    isDetail(to) ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    change();
    return;
  }
  const root = document.documentElement;
  root.classList.add("ed-transfer");
  let transition;
  if (document.startViewTransition) {
    transition = document.startViewTransition(change);
    transition.ready.catch(() => {});
  } else if (Element.prototype.animate) {
    // On browsers without snapshots, cover the change with the same angled edge.
    const curtain = document.createElement("div");
    curtain.className = "ed-route-curtain";
    curtain.setAttribute("aria-hidden", "true");
    document.body.append(curtain);
    const covered = "polygon(0 0,100% 0,100% 100%,0 100%)";
    const below = "polygon(0 100%,100% 130%,100% 130%,0 100%)";
    const above = "polygon(0 -30%,100% 0,100% 0,0 -30%)";
    const options = {
      duration: 360,
      easing: "cubic-bezier(.55,.04,.2,1)",
      fill: "both",
    };
    let animation = curtain.animate(
      [{ clipPath: below }, { clipPath: covered }],
      options,
    );
    let skipped = false;
    transition = {
      skipTransition() {
        skipped = true;
        animation.cancel();
      },
      finished: (async () => {
        try {
          await animation.finished.catch(() => {});
          change();
          if (skipped) return;
          animation = curtain.animate(
            [{ clipPath: covered }, { clipPath: above }],
            options,
          );
          await animation.finished.catch(() => {});
        } finally {
          curtain.remove();
        }
      })(),
    };
  } else {
    root.classList.remove("ed-transfer");
    change();
    return;
  }
  transitionRef.current = transition;
  const cleanup = () => {
    if (transitionRef.current !== transition) return;
    root.classList.remove("ed-transfer");
    transitionRef.current = null;
  };
  transition.finished.then(cleanup, cleanup);
}

export default function Experience({ content }) {
  const [stopMotion, setStopMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [opening, setOpening] = useState(
    () =>
      document.documentElement.hasAttribute("data-home-opening") &&
      (!location.hash || location.hash === "#home"),
  );
  const finish = useCallback(() => setOpening(false), []);
  const [route, setRoute] = useState(location.hash);
  usePortfolioScroll(opening, stopMotion, route);
  const [base, setBase] = useState(() =>
    location.hash.startsWith("#project/")
      ? history.state?.homeBase || ""
      : location.hash,
  );
  const [search, setSearch] = useState(false);
  const [selected, setSelected] = useState(() =>
    content.projects.find((p) => location.hash === "#project/" + p.id),
  );
  const currentTransition = useRef(null),
    origins = useRef(new Map()),
    scrollPositions = useRef(new Map());
  const nextOrigin = useRef(0),
    generation = useRef(0),
    records = useRef(content.projects);
  records.current = content.projects;
  const page = content.pages.find((p) => base === "#/pages/" + p.id);
  const lastRoute = useRef(route);
  lastRoute.current = route;
  const arrivals = useRef(new Set());
  const profile = content.profile;
  const projectAt = (hash) =>
    content.projects.find((p) => hash === "#project/" + p.id);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setStopMotion(media.matches);
      if (media.matches) {
        finish();
        currentTransition.current?.skipTransition();
        cancelArrivals();
      }
    };
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [finish]);
  useEffect(() => {
    if (!page) return;
    function key(event) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        setSearch((value) => !value);
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [page]);
  function target(hash) {
    if (hash === "#notes") return document.getElementById("credentials");
    if (hash === "#featured") return document.getElementById("work");
    return (
      document.getElementById(hash.slice(1)) || document.getElementById("main")
    );
  }
  function interruptNavigation() {
    currentTransition.current?.skipTransition();
    cancelArrivals();
    return ++generation.current;
  }
  function entryKey() {
    return String(performance.timeOrigin) + "-" + ++nextOrigin.current;
  }
  function cancelArrivals() {
    for (const animation of arrivals.current) animation.cancel();
    arrivals.current.clear();
  }
  function revealDestination(hash) {
    if (
      !document.documentElement.classList.contains("ed-transfer") ||
      !Element.prototype.animate ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const section = target(hash || "#home");
    if (!section || section.getBoundingClientRect().bottom <= 0) return;
    const animate = (element, frames, duration, delay = 0) => {
      if (!element) return;
      const animation = element.animate(frames, {
        duration,
        delay,
        easing: "cubic-bezier(.18,.8,.22,1)",
        fill: "backwards",
      });
      arrivals.current.add(animation);
      animation.finished.then(
        () => arrivals.current.delete(animation),
        () => arrivals.current.delete(animation),
      );
    };
    if (section.id === "home") {
      animate(
        section.querySelector(".ed-mark"),
        [
          { translate: "0 80%", opacity: 0 },
          { translate: "0 0", opacity: 1 },
        ],
        1400,
        240,
      );
      section.querySelectorAll(".ed-card").forEach((card, i) =>
        animate(
          card,
          [
            { translate: "0 100svh", rotate: "14deg" },
            { translate: "0 0", rotate: "0deg" },
          ],
          1400,
          760 + (3 - i) * 100,
        ),
      );
    } else {
      animate(
        section.querySelector("h1,h2,.ed-lede"),
        [
          { translate: "0 22px", clipPath: "inset(0 0 95% 0)" },
          { translate: "0 0", clipPath: "inset(0 0 -10% 0)" },
        ],
        740,
        170,
      );
    }
  }
  function jump(hash) {
    const el = target(hash);
    if (!el) return;
    const y =
      !hash || hash === "#home" || hash.startsWith("#/pages/")
        ? 0
        : scrollY +
          el.getBoundingClientRect().top -
          (document.querySelector(".ed-header")?.offsetHeight || 0);
    window.scrollTo({ top: y, behavior: "instant" });
    el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }
  useLayoutEffect(() => {
    const original = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const initialHome =
      document.documentElement.hasAttribute("data-home-opening");
    document.documentElement.removeAttribute("data-home-opening");
    if (initialHome) window.scrollTo({ top: 0, behavior: "instant" });
    // Content is mounted before native hash targets on a cold visit.
    if (location.hash && !location.hash.startsWith("#project/"))
      jump(location.hash);
    if (!history.state?.homeKey)
      history.replaceState({ ...history.state, homeKey: entryKey() }, "");
    function recordScroll() {
      const key = history.state?.homeKey;
      if (key) scrollPositions.current.set(key, scrollY);
    }
    window.addEventListener("scroll", recordScroll, { passive: true });
    function restore() {
      const ticket = interruptNavigation();
      const hash = location.hash,
        s = history.state;
      const savedY = scrollPositions.current.get(s?.homeKey) ?? s?.homeY;
      const project = records.current.find((p) => hash === "#project/" + p.id);
      pageHandoff(currentTransition, lastRoute.current, hash, () => {
        if (ticket !== generation.current) return;
        flushSync(() => {
          finish();
          setSearch(false);
          setRoute(hash);
          setBase(project ? s?.homeBase || "" : hash);
          setSelected(project || null);
        });
        if (typeof savedY === "number") {
          window.scrollTo({ top: savedY, behavior: "instant" });
          if (!project) {
            const origin = origins.current.get(s.homeKey);
            const focus = origin?.isConnected ? origin : target(hash);
            if (focus) {
              if (focus !== origin) focus.tabIndex = -1;
              focus.focus({ preventScroll: true });
            }
          }
        } else if (!project) jump(hash);
        if (!project) revealDestination(hash);
      });
    }
    // popstate covers both same-document hash navigations and our pushState entries.
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener("scroll", recordScroll);
      interruptNavigation();
      history.scrollRestoration = original;
    };
  }, [finish]);
  useEffect(() => {
    if (location.hash.startsWith("#project/")) {
      const record = content.projects.find(
        (p) => location.hash === "#project/" + p.id,
      );
      if (record) setSelected(record);
    }
  }, [content.projects]);
  function remember(trigger) {
    const key = history.state?.homeKey ?? entryKey();
    scrollPositions.current.set(key, scrollY);
    if (trigger) origins.current.set(key, trigger);
    history.replaceState(
      { ...history.state, homeY: scrollY, homeKey: key },
      "",
    );
  }
  function openProject(project, trigger = document.activeElement) {
    interruptNavigation();
    finish();
    remember(trigger);
    setSearch(false);
    const hash = "#project/" + project.id;
    history.pushState(
      { homeModal: true, homeBase: base, homeY: scrollY },
      "",
      hash,
    );
    setRoute(hash);
    setSelected(project);
  }
  function closeProject() {
    if (history.state?.homeModal) {
      history.back();
      return;
    }
    setSelected(null);
    setRoute(base);
    history.replaceState(
      {},
      "",
      location.pathname +
        location.search +
        (base.startsWith("#project/") ? "" : base),
    );
  }
  function navigate(e) {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    const a = e.target.closest?.("a[href^='#']");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const hash = a.hash;
    if (
      !hash ||
      hash === "#/studio" ||
      hash === "#/syed" ||
      hash.startsWith("#certificate/")
    )
      return;
    const project = projectAt(hash);
    if (project) {
      e.preventDefault();
      openProject(project, a);
      return;
    }
    if (
      !extraSections.has(hash) &&
      !hash.startsWith("#/pages/") &&
      !document.getElementById(hash.slice(1)) &&
      !page
    )
      return;
    e.preventDefault();
    finish();
    remember(a);
    const ticket = interruptNavigation();
    function change() {
      if (generation.current !== ticket) return;
      if ((location.hash || "#home") !== hash)
        history.pushState({ homeKey: entryKey() }, "", hash);
      flushSync(() => {
        setRoute(hash);
        setBase(hash);
        setSelected(null);
        setSearch(false);
      });
      jump(hash);
      revealDestination(hash);
    }
    pageHandoff(currentTransition, route, hash, change);
  }

  return (
    <div
      className={`experience ${page ? "" : "ed-shell"} ${opening && !page ? "is-opening" : ""} ${stopMotion ? "motion-paused" : ""}`}
      inert={opening || undefined}
      onClick={navigate}
    >
      <a className="new-skip" href="#main">
        Skip to content
      </a>
      {page ? (
        <HomeNavigation onSearch={() => setSearch(true)} />
      ) : (
        <EditorialHeader
          overlay={!!selected}
          profile={profile}
          route={route}
        />
      )}
      <main id="main" className={page ? undefined : "ed-page"}>
        {page ? (
          <section className="new-custom-page">
            <a href="#home">← Home</a>
            <h1>{page.title}</h1>
            {safeUrl(page.image, "media") && (
              <img src={safeUrl(page.image, "media")} alt={page.title} />
            )}
            <p>{page.body}</p>
          </section>
        ) : (
          <EditorialContent
            content={content}
            opening={opening}
            finish={finish}
            paused={stopMotion}
            activity={<GitHubActivity paused={stopMotion} />}
            work={
              <ProjectDeck
                projects={content.projects}
                onOpen={openProject}
                paused={stopMotion}
              />
            }
            education={
              <Journey education={content.education} profile={profile} />
            }
            certifications={
              <CertificateFan certificates={content.certificates} />
            }
            toolkit={
              base === "#toolkit" && <SkillMeter skills={content.skills} />
            }
            archive={
              (base === "#archive" || base.startsWith("#certificate/")) && (
                <Archive
                  content={content}
                  onOpen={openProject}
                  paused={stopMotion}
                />
              )
            }
            contact={
              <div className="new-contact-wrap">
                <Contact profile={profile} />
              </div>
            }
          />
        )}
      </main>
      {page ? (
        <footer className="new-footer">
          <div>
            <span>HAVE SOMETHING IN MIND?</span>
            <a href={`mailto:${profile.email}`}>
              Let’s make
              <br />
              <em>it happen.</em>
              <ArrowUpRight />
            </a>
          </div>
          <div className="new-footer-bottom">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <div>
              <a href={safeUrl(profile.github)} {...ext}>
                GitHub
                <ArrowUpRight size={13} />
              </a>
              <a href={safeUrl(profile.linkedin)} {...ext}>
                LinkedIn
                <ArrowUpRight size={13} />
              </a>
              {content.pages.map((p) => (
                <a key={p.id} href={`#/pages/${p.id}`}>
                  {p.title}
                </a>
              ))}
            </div>
            <a href="#home">Back to top ↑</a>
          </div>
        </footer>
      ) : (
        <>
          <EditorialFooter content={content} />
          <EditorialPointer
            paused={stopMotion}
            blocked={!!selected}
          />
        </>
      )}
      {page && search && (
        <SearchMenu
          content={content}
          onClose={() => setSearch(false)}
          onOpen={openProject}
        />
      )}
      {selected && (
        <ProjectStory
          paused={stopMotion}
          project={selected}
          onClose={closeProject}
        />
      )}
    </div>
  );
}
