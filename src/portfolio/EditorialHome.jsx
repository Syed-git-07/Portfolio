import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { safeUrl } from "./content";
import "@fontsource-variable/schibsted-grotesk";
import "./editorial-home.css";
import { DesktopNav, FillControl, FooterLetters } from "./HomeInteractions";
import { AsciiWake } from "./reference/AsciiWake";
export { EditorialPointer } from "./HomeInteractions";

const links = [
  ["Work", "work"],
  ["Capabilities", "capabilities"],
  ["About", "profile"],
  ["Certifications", "credentials"],
];
const hue = {
  "fee-portal": "#2065e7",
  achuppori: "#c87943",
  sso: "#66bfc1",
  scheduler: "#827ac7",
  riskguard: "#708e78",
  "kr-exports": "#99aebb",
  youtube: "#e7b586",
  ims: "#8984c4",
};
function ArrowLink({ href, children }) {
  return (
    <a className="ed-link" href={href}>
      {children}
      <i aria-hidden="true">
        <ArrowRight size={15} />
      </i>
    </a>
  );
}
function Media({ project, priority = false, lead = false }) {
  const src = safeUrl(project.image, "media");
  const [failed, setFailed] = useState("");
  return (
    <div
      className="ed-art"
      style={{ "--art": hue[project.id] || "#799eb0" }}
      data-id={project.id}
    >
      {src && failed !== src ? (
        <img
          src={src}
          alt={project.title + " interface"}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={lead ? "high" : "auto"}
          draggable="false"
          onError={() => setFailed(src)}
        />
      ) : (
        <b>{project.title}</b>
      )}
    </div>
  );
}
function Wordmark({ name, interactive = false }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current,
      text = el.firstElementChild;
    const resize = () => {
      const size = parseFloat(getComputedStyle(text).fontSize),
        width = text.getBoundingClientRect().width;
      if (width > 0 && el.clientWidth)
        el.style.setProperty(
          "--mark-size",
          (size * el.clientWidth) / width + "px",
        );
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    document.fonts.addEventListener("loadingdone", resize);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", resize);
    };
  }, [name]);
  return (
    <div
      className="ed-mark"
      ref={ref}
      role={interactive ? "img" : undefined}
      aria-label={interactive ? name : undefined}
    >
      {interactive ? <FooterLetters name={name} /> : <span>{name}</span>}
    </div>
  );
}
export function EditorialHeader({ profile, route, overlay }) {
  const [menu, setMenu] = useState("closed"),
    trigger = useRef(null),
    panel = useRef(null);
  const open = menu === "open";
  const mounted = menu !== "closed";
  const [scrolled, setScrolled] = useState(false),
    [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    setScrolled(last > 24);
    function track() {
      const y = Math.max(
        0,
        Math.min(
          window.scrollY,
          document.documentElement.scrollHeight - innerHeight,
        ),
      );
      const delta = y - last;
      last = y;
      setScrolled(y > 24);
      if (
        y <= 24 ||
        document.documentElement.classList.contains("ed-transfer")
      ) {
        setHidden(false);
        return;
      }
      // Ignore the single-pixel tail of smooth scrolling on direction changes.
      if (delta < -2) setHidden(false);
      else if (delta > 2 && y > innerHeight * 0.6) setHidden(true);
    }
    window.addEventListener("scroll", track, { passive: true });
    return () => window.removeEventListener("scroll", track);
  }, []);
  useEffect(() => {
    setMenu("closed");
  }, [route, overlay]);
  useEffect(() => {
    if (menu !== "closing") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMenu("closed");
      return;
    }
    const timeout = setTimeout(() => setMenu("closed"), 850);
    return () => clearTimeout(timeout);
  }, [menu]);
  useEffect(() => {
    if (!mounted) return;
    const media = matchMedia("(min-width: 1024px)");
    const close = () => setMenu("closing");
    const resize = () => {
      if (media.matches) setMenu("closed");
    };
    const header = trigger.current.closest("header");
    const background = [
      document.getElementById("main"),
      document.querySelector(".ed-footer-slot"),
    ].filter(Boolean);
    document.documentElement.classList.add("ed-menu-open");
    background.forEach((el) => (el.inert = true));

    function cycle(e) {
      if (e.key !== "Tab") return;
      const items = Array.from(header.querySelectorAll("a,button")).filter(
        (el) => el.getClientRects().length && !el.closest("[inert]"),
      );
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault();
        items.at(-1).focus();
      } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
        e.preventDefault();
        items[0].focus();
      }
    }
    header.addEventListener("keydown", cycle);
    const key = (e) => {
      if (e.key === "Escape") {
        close();
        trigger.current.focus();
      }
    };
    const outside = (e) => {
      if (
        !panel.current?.contains(e.target) &&
        !trigger.current?.contains(e.target)
      )
        close();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", outside);
    media.addEventListener("change", resize);
    return () => {
      header.removeEventListener("keydown", cycle);
      background.forEach((el) => (el.inert = false));
      document.documentElement.classList.remove("ed-menu-open");
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", outside);
      media.removeEventListener("change", resize);
    };
  }, [mounted]);
  return (
    <header
      className="ed-header"
      data-scrolled={scrolled || undefined}
      data-away={(hidden && !mounted) || undefined}
      data-menu-mounted={mounted || undefined}
      data-open={open || undefined}
    >
      <a className="ed-brand" href="#home">
        {profile.name}
      </a>
      <DesktopNav links={links} route={route} />
      <div className="ed-actions">
        <FillControl href="#contact">Let’s talk</FillControl>
        <button
          className="ed-menu-button"
          ref={trigger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="ed-menu"
          aria-expanded={open}
          onClick={() => setMenu(open ? "closing" : "open")}
        >
          <span className="ed-menu-icon" aria-hidden="true" />
        </button>
      </div>
      {mounted && (
        <nav
          id="ed-menu"
          className="ed-drawer"
          ref={panel}
          aria-label="Mobile navigation"
          data-phase={menu}
          inert={!open}
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "clip-path" &&
              menu === "closing"
            )
              setMenu("closed");
          }}
          onClick={(event) => {
            if (event.target.closest("a")) setMenu("closed");
          }}
        >
          {[...links, ["Contact", "contact"]].map(([label, id], index) => (
            <a style={{ "--row": index }} key={id} href={"#" + id}>
              <span>{label}</span>
              <ArrowUpRight />
            </a>
          ))}
          <div className="ed-menu-meta">
            <div>
              <strong>{profile.location}</strong>
              <p>{profile.availability}</p>
            </div>
            <a href={"mailto:" + profile.email}>{profile.email}</a>
          </div>
        </nav>
      )}
    </header>
  );
}

export function Hero({ profile, projects, opening, finish, paused }) {
  const [firstLine, ...otherLines] = profile.headline.trim().split(/\n+/);
  const order = [...projects.slice(0, 4)];
  const featured = order.findIndex((p) => p.id === "fee-portal");
  if (featured > 0) order.unshift(...order.splice(featured, 1));
  const hero = useRef(null);
  const [inView, setInView] = useState(false),
    [tucking, setTucking] = useState(false),
    [front, setFront] = useState(0);
  const count = order.length;
  useEffect(() => {
    let intersects = false;
    const sync = () => setInView(intersects && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      intersects = entry.isIntersecting;
      sync();
    });
    observer.observe(hero.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  useEffect(() => {
    if (!inView || paused || opening || count < 2) {
      setTucking(false);
      return;
    }
    let advance;
    const begin = setTimeout(() => {
      setTucking(true);
      advance = setTimeout(() => {
        setTucking(false);
        setFront((previous) => (previous + 1) % count);
      }, 360);
    }, 2580);
    return () => {
      clearTimeout(begin);
      clearTimeout(advance);
    };
  }, [inView, paused, opening, count, front]);
  useEffect(() => {
    if (!opening) return;
    const timer = setTimeout(finish, 5300);
    const key = (event) => {
      if (event.key === "Escape" || event.key === "Tab") finish();
    };
    window.addEventListener("keydown", key);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", key);
    };
  }, [opening, finish]);
  return (
    <section
      ref={hero}
      className="ed-hero ed-zone"
      id="home"
      aria-label="Introduction"
    >
      <h1 className="ed-intro">
        <strong>{profile.name}</strong>
        <br />
        {profile.intro}
      </h1>
      <div className="ed-sign">{profile.location}</div>
      <div className="ed-hero-mark">
        <Wordmark name={profile.name} />
      </div>
      {order.length > 0 && (
        <a
          className="ed-deck"
          href="#work"
          data-cursor="See Work"
          aria-label="See work"
          data-tucking={tucking || undefined}
        >
          {order.map((p, i) => {
            const layer = (i - (front % count) + count) % count;
            return (
              <div
                className={"ed-card card-" + layer}
                key={p.id}
                style={{
                  "--layer": layer,
                  "--depth": count - layer,
                  "--middle": (count - 1) / 2,
                }}
              >
                <div className="ed-card-face">
                  <Media
                    project={p}
                    priority
                    lead={i === 0 || i === count - 1}
                  />
                </div>
              </div>
            );
          })}
        </a>
      )}
      {opening && (
        <div
          className="ed-opening"
          aria-hidden="true"
          onAnimationEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.animationName === "ed-opening-paper"
            )
              finish();
          }}
        >
          <div>
            <span>{firstLine}</span>
            <span>{otherLines.join(" ")}</span>
          </div>
          <small>
            {profile.role} · {profile.location}
          </small>
        </div>
      )}
    </section>
  );
}
function Statement({ paused }) {
  const section = useRef(null),
    stage = useRef(null),
    slot = useRef(null);
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const grow = useTransform(
    scrollYProgress,
    [0, 0.12, 0.26, 0.4, 0.54, 0.6, 1],
    [0, 0.025, 0.261, 0.78, 0.983, 1, 1],
  );
  const rise = useTransform(scrollYProgress, [0, 0.45], [0, -150]);
  const fall = useTransform(scrollYProgress, [0, 0.45], [0, 150]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.4],
    [1, 0.65, 0.12],
  );
  const radius = useTransform(grow, [0, 0.55, 1], [40, 24, 0]);
  useLayoutEffect(() => {
    if (paused) return;
    const pin = stage.current,
      anchor = slot.current;
    function measure() {
      const frame = pin.getBoundingClientRect(),
        rect = anchor.getBoundingClientRect();
      for (const [name, value] of Object.entries({
        x: rect.left - frame.left,
        y: rect.top - frame.top,
        w: rect.width,
        h: rect.height,
      }))
        pin.style.setProperty("--start-" + name, value + "px");
    }
    measure();
    const observer = new ResizeObserver(measure);
    for (const el of [pin, anchor, pin.querySelector("h2")])
      observer.observe(el);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [paused]);
  return (
    <section
      className="ed-statement ed-zone"
      ref={section}
      aria-label="Portfolio statement"
    >
      <div className="ed-pin" ref={stage}>
        <h2>
          <span className="ed-first-line">
            <motion.span
              className="ed-words"
              style={paused ? {} : { y: rise, opacity }}
            >
              Ideas into
            </motion.span>
            <span className="ed-mobile-break"> </span>
            <motion.span
              className="ed-words"
              style={paused ? {} : { y: rise, opacity }}
            >
              things
            </motion.span>{" "}
            <i className="ed-inline-slot" aria-hidden="true" ref={slot} />
          </span>
          <motion.span
            className="ed-last-line"
            style={paused ? {} : { y: fall, opacity }}
          >
            that <em>move.</em>
          </motion.span>
        </h2>
        <motion.div
          className="ed-reel"
          style={paused ? {} : { "--growth": grow, borderRadius: radius }}
        >
          <img
            src="/assets/projects/fee-portal.webp"
            alt="NEC Fee Portal administrator overview with collection and payment charts"
          />
        </motion.div>
      </div>
    </section>
  );
}
function Count({ value, paused }) {
  return (
    <span aria-label={String(value)} className="ed-count">
      {String(value)
        .split("")
        .map((d, i) => (
          <span key={i} aria-hidden="true">
            <motion.i
              initial={paused ? false : { y: 0 }}
              whileInView={{ y: "-" + Number(d) * 10 + "%" }}
              viewport={{ once: true }}
              transition={{
                duration: paused ? 0 : 0.75,
                delay: paused ? 0 : i * 0.05,
              }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <b key={n}>{n}</b>
              ))}
            </motion.i>
          </span>
        ))}
    </span>
  );
}
function Profile({ content, paused }) {
  const { profile: p, projects, certificates, achievements } = content;
  return (
    <section id="profile" className="ed-profile ed-section ed-zone">
      <div className="ed-profile-intro">
        <AsciiWake key={paused ? "still" : "interactive"} reach={60} />
        <p className="ed-lede">{p.about}</p>
      </div>
      <div className="ed-profile-grid">
        <div>
          <div className="ed-stats">
            {[
              [projects.length, "Projects"],
              [certificates.length, "Certificates"],
              [achievements.length, "Achievements"],
              [
                new Set(projects.map((p) => p.category)).size,
                "Project disciplines",
              ],
            ].map(([n, s]) => (
              <div key={s}>
                <Count value={n} paused={paused} />
                <small>{s}</small>
              </div>
            ))}
          </div>
          <div className="ed-shortcuts">
            <ArrowLink href="#journey">Education</ArrowLink>
            <ArrowLink href="#credentials">Credentials</ArrowLink>
            <ArrowLink href="#github-activity">Coding activity</ArrowLink>
          </div>
        </div>
        {safeUrl(p.photo, "media") && (
          <div className="ed-portrait">
            <div data-image-entry="">
              <img
                src={safeUrl(p.photo, "media")}
                alt={p.name}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
function useMediaEntrance(paused) {
  useLayoutEffect(() => {
    if (paused || !window.IntersectionObserver) return;
    const frames = document.querySelectorAll(".ed-page [data-image-entry]");
    const targets = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0)
            continue;
          targets.get(entry.target).dataset.imageEntry = "shown";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -32% 0px" },
    );
    for (const el of frames) {
      if (el.getBoundingClientRect().top < innerHeight) continue;
      el.dataset.imageEntry = "waiting";
      targets.set(el.parentElement, el);
      observer.observe(el.parentElement);
    }
    return () => {
      observer.disconnect();
      frames.forEach((el) => {
        el.dataset.imageEntry = "";
      });
    };
  }, [paused]);
}

export function EditorialContent({
  content,
  paused,
  opening,
  finish,
  work,
  activity,
  education,
  certifications,
  toolkit,
  archive,
  contact,
}) {
  const { profile, projects } = content;
  useMediaEntrance(paused);
  useEffect(() => {
    if (paused) return;
    const running = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          observer.unobserve(target);
          const animation = target.animate(
            [
              {
                clipPath: "inset(0 0 88% 0)",
                opacity: 0.2,
                transform: "translateY(16px)",
              },
              {
                clipPath: "inset(0 0 -5% 0)",
                opacity: 1,
                transform: "translateY(0)",
              },
            ],
            { duration: 650, easing: "cubic-bezier(.18,.72,.22,1)" },
          );
          running.add(animation);
          animation.onfinish = () => running.delete(animation);
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(".ed-heading h2,.ed-profile-intro>.ed-lede")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      running.forEach((a) => a.cancel());
    };
  }, [paused]);
  return (
    <>
      <Hero {...{ profile, projects, opening, finish, paused }} />
      <Statement paused={paused} />
      <Profile {...{ content, paused }} />
      {activity}
      {work}
      {education}
      {certifications}
      {toolkit}
      {archive}
      {contact}
    </>
  );
}
export function EditorialFooter({ content }) {
  const wrap = useRef(null),
    footer = useRef(null);
  useLayoutEffect(() => {
    const slot = wrap.current,
      el = footer.current;
    const update = () => {
      slot.style.setProperty("--footer-h", el.offsetHeight + "px");
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);
  const p = content.profile;
  return (
    <div className="ed-footer-slot" ref={wrap}>
      <footer
        className="ed-footer"
        ref={footer}
        onFocusCapture={(e) => {
          if (
            getComputedStyle(footer.current).position === "fixed" &&
            e.target.getBoundingClientRect().top <
              wrap.current.getBoundingClientRect().top
          )
            wrap.current.scrollIntoView({ block: "end", behavior: "instant" });
        }}
      >
        <Wordmark name={p.name} interactive />
        <div className="ed-footer-cols">
          <div>
            <small>About</small>
            <p>{p.intro}</p>
            <div className="ed-social">
              {[
                ["GitHub", p.github],
                ["LinkedIn", p.linkedin],
                ["LeetCode", p.leetcode],
              ]
                .filter(([, url]) => safeUrl(url))
                .map(([name, url]) => (
                  <a
                    key={name}
                    href={safeUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {name} ↗
                  </a>
                ))}
            </div>
          </div>
          <div>
            <small>Explore</small>
            {[
              ...links,
              ["Activity", "github-activity"],
              ["Education", "journey"],
              ["Contact", "contact"],
              ["Archive", "archive"],
              ...content.pages.map((s) => [s.title, "/pages/" + s.id]),
            ].map(([name, id]) => (
              <a key={id} href={"#" + id}>
                {name}
              </a>
            ))}
          </div>
          <div>
            <small>Contact</small>
            <a href={"mailto:" + p.email}>{p.email}</a>
            {safeUrl(p.resume, "media") && (
              <a
                href={safeUrl(p.resume, "media")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Résumé ↗
              </a>
            )}
            <span>{p.location}</span>
          </div>
        </div>
        <div className="ed-footer-base">
          <span>
            © {new Date().getFullYear()} {p.name}
          </span>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
