import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Ellipsis, Heart, X } from "lucide-react";
export function GitHubMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
    >
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.12.68-3.78-1.32-3.78-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .02 1.3 2.08 3.27.86.1-.73.4-1.23.72-1.51-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.8 10.8 0 0 1 5.59 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.7.11 2.98.73.78 1.16 1.79 1.16 3.02 0 4.32-2.63 5.27-5.15 5.55.41.35.77 1.04.77 2.09v3.17c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>
  );
}

function useProjectLike(id, open) {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const toggleRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    let active = true,
      pending = false;
    const controller = new AbortController();
    const url = "/api/project-likes?project=" + encodeURIComponent(id);
    async function request(desired) {
      const read = desired === undefined;
      const response = await fetch(read ? url : url + "&liked=" + desired, {
        method: read ? "GET" : "POST",
        headers: read ? {} : { "X-Project-Like": "1" },
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Likes unavailable");
      const value = await response.json();
      if (
        !Number.isSafeInteger(value.count) ||
        typeof value.liked !== "boolean"
      )
        throw new Error("Invalid total");
      return value;
    }
    let current, queued;
    async function sync(desired) {
      const write = typeof desired === "boolean";
      if (!active) return;
      if (pending) {
        if (write) queued = desired;
        return;
      }
      pending = true;
      if (write) setBusy(true);
      try {
        let next = await request(desired);
        if (!current && !write) {
          const key = "portfolio:project-like:v1:" + id;
          let legacy;
          try {
            legacy = localStorage.getItem(key);
          } catch {
            /* optional migration */
          }
          if (legacy === "true" && !next.liked) next = await request(true);
          try {
            localStorage.removeItem(key);
          } catch {
            /* optional migration */
          }
        }
        current = next;
        if (active) {
          setState(next);
          setFailed(false);
        }
      } catch {
        current = null;
        if (active) {
          setState(null);
          setFailed(true);
        }
      } finally {
        pending = false;
        if (active) setBusy(false);
        if (active && queued !== undefined) {
          const next = queued;
          queued = undefined;
          void sync(next);
        }
      }
    }
    setState(null);
    setBusy(false);
    setFailed(false);
    toggleRef.current = () => current && sync(!current.liked);
    sync();
    const refresh = () => {
      if (!document.hidden) sync();
    };
    const timer = setInterval(refresh, 5000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      toggleRef.current = null;
    };
  }, [id, open]);
  return {
    liked: state?.liked ?? false,
    count: state?.count,
    disabled: busy || !state,
    failed,
    toggleLike: () => toggleRef.current?.(),
  };
}

// The upper left edge trails the lower left corner during the stretch.
// Every pose uses the same eight segments so the outline interpolates both ways.
function genieFrames(width, height) {
  function shape(topLeft, bottomLeft, top, bottom, radius) {
    const r = Math.min(radius, (width - topLeft) / 2, (bottom - top) / 2);
    const lowerRadius = Math.min(
      radius,
      (width - bottomLeft) / 2,
      (bottom - top) / 2,
    );
    const bend = (bottom - top) * 0.48;
    const d = `M ${topLeft + r} ${top} L ${width - r} ${top}
      Q ${width} ${top} ${width} ${top + r} L ${width} ${bottom - lowerRadius}
      Q ${width} ${bottom} ${width - lowerRadius} ${bottom} L ${bottomLeft + lowerRadius} ${bottom}
      Q ${bottomLeft} ${bottom} ${bottomLeft} ${bottom - lowerRadius}
      C ${bottomLeft} ${bottom - bend} ${topLeft} ${top + bend} ${topLeft} ${top + r}
      Q ${topLeft} ${top} ${topLeft + r} ${top} Z`;
    return `path("${d.replace(/\s+/g, " ")}")`;
  }
  return [
    { offset: 0, clipPath: shape(width - 44, width - 44, 0, 44, 22) },
    { offset: 0.18, clipPath: shape(width - 38, width - 50, 5, 77, 18) },
    {
      offset: 0.42,
      clipPath: shape(width * 0.68, width * 0.45, 24, height * 0.82, 18),
    },
    { offset: 0.76, clipPath: shape(4, 0, 53, height, 17) },
    { offset: 1, clipPath: shape(0, 0, 52, height, 16) },
  ];
}

export default function ProjectOptions({
  project,
  live,
  git,
  gitLabel,
  trigger,
  open,
  onToggle,
  reduced,
}) {
  const { liked, count, disabled, failed, toggleLike } = useProjectLike(
    project.id,
    open,
  );
  const panel = useRef(null),
    shape = useRef(null);
  useLayoutEffect(() => {
    const el = panel.current;
    const animation = el.animate(genieFrames(el.offsetWidth, el.offsetHeight), {
      duration: 340,
      fill: "both",
      easing: "ease-in-out",
    });
    animation.pause();
    animation.currentTime = 0;
    shape.current = animation;
    const observer = new ResizeObserver(() => {
      animation.effect.setKeyframes(
        genieFrames(el.offsetWidth, el.offsetHeight),
      );
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      animation.cancel();
    };
  }, []);
  useLayoutEffect(() => {
    const animation = shape.current;
    if (reduced) {
      animation.pause();
      animation.currentTime = open ? 340 : 0;
    } else if (open || animation.currentTime > 0) {
      animation.playbackRate = open ? 1 : -1.2;
      animation.play();
    } else {
      animation.pause();
      animation.currentTime = 0;
    }
    if (open)
      panel.current
        .querySelector("button:not(:disabled), a[href]")
        ?.focus({ preventScroll: true });
  }, [open, reduced]);

  return (
    <div className="cin-options-anchor">
      <button
        type="button"
        className="cin-options-toggle"
        ref={trigger}
        aria-label="Project options"
        aria-expanded={open}
        aria-controls="project-options"
        onClick={onToggle}
      >
        <Ellipsis size={20} aria-hidden="true" />
        <X size={18} aria-hidden="true" />
      </button>
      <div
        className="cin-options"
        id="project-options"
        ref={panel}
        data-open={open || undefined}
        role="group"
        aria-label="Project options"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="cin-options-rows">
          <button
            type="button"
            disabled={disabled}
            aria-pressed={liked}
            aria-label={(liked ? "Unlike " : "Like ") + project.title}
            onClick={toggleLike}
          >
            <Heart aria-hidden="true" />
            Like{" "}
            <output aria-live="polite">
              {failed ? "Unavailable" : (count ?? "�")}
            </output>
          </button>
          {live ? (
            <a href={live} target="_blank" rel="noopener noreferrer">
              <ArrowUpRight aria-hidden="true" />
              Open live preview
            </a>
          ) : (
            <button type="button" disabled>
              <ArrowUpRight aria-hidden="true" />
              Open live preview
            </button>
          )}
          <a href={git} target="_blank" rel="noopener noreferrer">
            <GitHubMark />
            {gitLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
