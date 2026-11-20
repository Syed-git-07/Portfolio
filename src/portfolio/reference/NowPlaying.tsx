// Project adaptation of Bencho Now playing (MIT).
import { useState, useRef, useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { Heart, ChevronDown } from "lucide-react";
import { safeUrl } from "../content";
import "./NowPlaying.css";

const BASE = 460;

const QUART = (t: number) => 1 - (1 - t) ** 4;
/* the swell's clock — see the note where it is used */
const FLAT = (t: number) => t;
function useTween(to: number, ms: number, instant = false, ease = QUART) {
  const [at, setAt] = useState(to);
  const cur = useRef(to);
  const raf = useRef(0);

  useEffect(() => {
    if (instant) {
      cur.current = to;
      setAt(to);
      return;
    }
    const from = cur.current;
    if (from === to) return;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      cur.current = from + (to - from) * ease(t);
      setAt(cur.current);
      raf.current = t < 1 ? requestAnimationFrame(step) : 0;
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [to, ms, instant, ease]);

  return at;
}
type Props = {
  project: {
    title: string;
    category: string;
    image: string;
    tags: string;
    url: string;
    source: string;
  };
  expanded: boolean;
  liked: boolean;
  onLike: () => void;
  onToggle: () => void;
  onDetails: () => void;
};
export default function NowPlaying({
  project,
  expanded,
  liked,
  onToggle,
  onLike,
  onDetails,
}: Props) {
  const still = Boolean(useReducedMotion());
  const p = useTween(Number(expanded), BASE, still);
  const u = useTween(Number(expanded), BASE, still, FLAT);
  const image = safeUrl(project.image, "media");
  const links = [
    ["Live demo", safeUrl(project.url)],
    ["GitHub", safeUrl(project.source)],
  ];
  return (
    <div
      className="project-island"
      style={{
        height: 78 + 185 * p,
        borderRadius: 20 + 6 * p,
        transform: `scale(${expanded ? 1 : 1 - 0.035 * Math.sin(Math.PI * u ** 1.5)})`,
      }}
    >
      <button
        className="island-toggle"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {image && (
          <img
            src={image}
            alt=""
            style={{
              width: 40 + 24 * p,
              height: 40 + 24 * p,
              borderRadius: 10 + 6 * p,
            }}
          />
        )}
        <span>
          <small>{project.category}</small>
          <strong>{project.title}</strong>
        </span>
        <ChevronDown size={18} style={{ transform: `rotate(${180 * p}deg)` }} />
      </button>
      <div
        className="island-body"
        inert={!expanded}
        style={{ opacity: p, visibility: p === 0 ? "hidden" : "visible" }}
      >
        {image && (
          <button
            className="island-preview"
            onClick={onDetails}
            aria-label={`Inspect ${project.title}`}
          >
            <img src={image} alt={`${project.title} preview`} />
          </button>
        )}
        <div className="island-stack">{project.tags}</div>
        <div className="island-links">
          <button onClick={onDetails}>Details</button>
          {links.map(
            ([label, url]) =>
              url && (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              ),
          )}
          <button
            className="island-like"
            aria-label={`Like ${project.title}`}
            aria-pressed={liked}
            onClick={onLike}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}
