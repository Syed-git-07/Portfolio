import { Ball } from "./reference/Ball";
import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import {
  ArrowUpRight,
  Search,
  FileText,
  RotateCcw,
  Download,
  Layers,
} from "lucide-react";
import InfiniteSpiral from "./reference/InfiniteSpiral";
import Modal from "./Modal";
import GitHubActivity from "./GitHubActivity";
import Contact from "./Contact";
import { ProjectDeck, ProjectStory } from "./WorkShowcase";
import "./showcase.css";
import HomePage, { HomeNavigation } from "./HomePage";
import { safeUrl } from "./content";
import "./experience.css";
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
        <Ball />
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
        <Ball />
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
            ["work", "Selected work"],
            ["toolkit", "Toolkit"],
            ["credentials", "Certificates"],
            ["journey", "My journey"],
            ["archive", "Archive"],
            ["contact", "Write to me"],
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
              "Selected work",
              "Toolkit",
              "Certificates",
              "My journey",
              "Archive",
              "Write to me",
              ...content.projects.map((p) => p.title),
            ].some((n) => n.toLowerCase().includes(query.toLowerCase())) && (
              <p role="status">No matches.</p>
            )}
        </div>
      </div>
    </Modal>
  );
}

export default function Experience({ content }) {
  const [stopMotion, setStopMotion] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStopMotion(media.matches);
    media.addEventListener("change", sync);
    sync();
    return () => media.removeEventListener("change", sync);
  }, []);
  const [search, setSearch] = useState(false),
    [selected, setSelected] = useState(null),
    [route, setRoute] = useState(location.hash);
  const p = content.profile;
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  useEffect(() => {
    if (stopMotion) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.animate(
              [
                { opacity: 0.35, transform: "translateY(22px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" },
            );
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        ".work-exhibit,.new-toolkit,.credential-section,.new-journey,.archive-content",
      )
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stopMotion]);

  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", key);
    const hash = () => {
      setRoute(location.hash);
      if (location.hash.startsWith("#project/")) {
        const project = content.projects.find(
          (p) => p.id === location.hash.slice(9),
        );
        if (project) setSelected(project);
      }
    };
    window.addEventListener("hashchange", hash);
    hash();
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("hashchange", hash);
    };
  }, [content.projects]);
  const page = content.pages.find((p) => route === `#/pages/${p.id}`);
  useEffect(() => {
    if (page) window.scrollTo(0, 0);
    else if (route && !route.startsWith("#/"))
      requestAnimationFrame(() =>
        document.getElementById(route.slice(1))?.scrollIntoView(),
      );
  }, [route, page]);
  return (
    <div className={`experience ${stopMotion ? "motion-paused" : ""}`}>
      <motion.div className="new-progress" style={{ scaleX: progress }} />
      <a className="new-skip" href="#main">
        Skip to content
      </a>
      <HomeNavigation onSearch={() => setSearch(true)} />
      <main id="main">
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
          <>
            <HomePage profile={p} paused={stopMotion} />
            <ProjectDeck
              projects={content.projects}
              onOpen={setSelected}
              paused={stopMotion}
            />
            <GitHubActivity paused={stopMotion} />
            <SkillMeter skills={content.skills} />
            <CertificateFan certificates={content.certificates} />
            <Journey education={content.education} profile={p} />
            <Archive
              content={content}
              onOpen={setSelected}
              paused={stopMotion}
            />

            <div className="new-contact-wrap">
              <Contact profile={p} />
            </div>
          </>
        )}
      </main>
      <footer className="new-footer">
        <div>
          <span>HAVE SOMETHING IN MIND?</span>
          <a href={`mailto:${p.email}`}>
            Let’s make
            <br />
            <em>it happen.</em>
            <ArrowUpRight />
          </a>
        </div>
        <div className="new-footer-bottom">
          <span>
            © {new Date().getFullYear()} {p.name}
          </span>
          <div>
            <a href={safeUrl(p.github)} {...ext}>
              GitHub
              <ArrowUpRight size={13} />
            </a>
            <a href={safeUrl(p.linkedin)} {...ext}>
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
      {search && (
        <SearchMenu
          content={content}
          onClose={() => setSearch(false)}
          onOpen={setSelected}
        />
      )}{" "}
      {selected && (
        <ProjectStory
          paused={stopMotion}
          project={selected}
          projects={content.projects}
          onSelect={setSelected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
