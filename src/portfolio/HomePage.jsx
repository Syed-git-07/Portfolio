import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Minus,
  Plus,
  Search,
  SunMoon,
} from "lucide-react";
import ButtonAnatomy from "./ButtonAnatomy";
import "./homepage.css";

const destinations = [
  ["About", "journey"],
  ["Skills", "toolkit"],
  ["Work", "work"],
  ["Certificates", "credentials"],
  ["Contact", "contact"],
];
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
});

export function HomeNavigation({ onSearch }) {
  const [open, setOpen] = useState(false),
    [light, setLight] = useState(false),
    [now, setNow] = useState(() => new Date());
  const nav = useRef(null),
    trigger = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!open) return;
    function close(e) {
      if (!nav.current.contains(e.target)) setOpen(false);
    }
    function escape(e) {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current.focus();
      }
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <header className="lab-header">
      <a className="lab-monogram" href="#home" aria-label="Home">
        ss.
      </a>
      <motion.nav
        layout={!reduced}
        className={`lab-menu ${open ? "expanded" : ""} ${light ? "light" : ""}`}
        ref={nav}
        aria-label="Main navigation"
      >
        <button
          ref={trigger}
          className="menu-trigger"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <Minus size={16} /> : <Plus size={16} />} Menu{" "}
          <time>{timeFormat.format(now)}</time>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              className="menu-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.16 }}
            >
              {destinations.map(([label, id]) => (
                <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                  <span>
                    <i>{label}</i>
                    <i aria-hidden="true">{label}</i>
                  </span>
                  <ArrowUpRight size={17} />
                </a>
              ))}
              <button
                className="menu-tone"
                aria-pressed={light}
                onClick={() => setLight(!light)}
              >
                <SunMoon size={15} /> Light menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <button
        className="lab-search"
        aria-label="Search portfolio"
        onClick={onSearch}
      >
        <Search size={18} />
      </button>
    </header>
  );
}

export default function HomePage({ profile, paused }) {
  return <ButtonAnatomy profile={profile} paused={paused} />;
}
