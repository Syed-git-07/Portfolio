import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { contributionScene } from "./contributionScene";
import "./github-activity.css";

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
async function load(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error();
  const data = await response.json();
  if (
    data.account !== "Syed-git-07" ||
    !Array.isArray(data.days) ||
    !data.days.length
  )
    throw new Error();
  return data.days;
}

export default function GitHubActivity({ paused }) {
  const section = useRef(null),
    canvas = useRef(null),
    scene = useRef(null),
    redraw = useRef(null);
  const [days, setDays] = useState(null),
    [unavailable, setUnavailable] = useState(false);
  const [selected, setSelected] = useState(-1);
  const selection = useRef(-1);
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  useEffect(() => {
    const controller = new AbortController();
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        (async () => {
          for (const url of ["/api/github-activity", "/github-activity.json"]) {
            try {
              const result = await load(url, controller.signal);
              if (!controller.signal.aborted) setDays(result);
              return;
            } catch {
              if (controller.signal.aborted) return;
            }
          }
          setUnavailable(true);
        })();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section.current);
    return () => {
      controller.abort();
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!days) return;
    const instance = contributionScene(canvas.current, days);
    if (!instance) {
      setUnavailable(true);
      return;
    }
    scene.current = instance;
    let visible = false,
      frame = 0;
    function schedule() {
      if (!visible || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        instance.draw(paused ? 0 : scrollYProgress.get(), selection.current);
      });
    }
    redraw.current = schedule;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(canvas.current);
    const resize = new ResizeObserver(() => {
      instance.resize();
      schedule();
    });
    resize.observe(canvas.current);
    const stop = scrollYProgress.on("change", schedule);
    return () => {
      stop();
      resize.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);
      scene.current = null;
      redraw.current = null;
    };
  }, [days, paused, scrollYProgress]);
  function select(i) {
    if (selection.current !== i) {
      selection.current = i;
      setSelected(i);
      redraw.current?.();
    }
  }
  function point(e) {
    const r = e.currentTarget.getBoundingClientRect();
    select(scene.current?.hit(e.clientX - r.left, e.clientY - r.top) ?? -1);
  }
  function key(e) {
    const steps = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 };
    if (e.key in steps) {
      e.preventDefault();
      select(
        Math.min(
          days.length - 1,
          Math.max(0, selection.current + steps[e.key]),
        ),
      );
    }
  }
  const day = days?.[selected];
  return (
    <section
      id="github-activity"
      className="github-activity"
      data-still={paused || undefined}
      ref={section}
      aria-labelledby="activity-heading"
    >
      <div className="activity-stage">
        <div className="activity-panel">
          <header>
            <h2 id="activity-heading">GitHub Activity</h2>
            <a
              href="https://github.com/Syed-git-07"
              target="_blank"
              rel="noopener noreferrer"
            >
              Syed-git-07 <ArrowUpRight size={15} />
            </a>
          </header>
          <div className="activity-drawing">
            <canvas
              ref={canvas}
              tabIndex={days && !unavailable ? 0 : -1}
              role="group"
              aria-label="Daily GitHub contributions. Use arrow keys to explore dates."
              onKeyDown={key}
              onFocus={() => {
                if (days && selected < 0) select(days.length - 1);
              }}
              onBlur={() => select(-1)}
              onPointerMove={point}
              onPointerDown={point}
              onPointerLeave={() => select(-1)}
            />
            {(!days || unavailable) && (
              <p role="status">
                {unavailable
                  ? "Contribution calendar unavailable."
                  : "Loading contributions…"}
              </p>
            )}
          </div>
          {days && (
            <div className="activity-caption">
              <span>
                {dateFormat.format(new Date(days[0].date))} –{" "}
                {dateFormat.format(new Date(days.at(-1).date))}
              </span>
              <span aria-live="polite">
                {day
                  ? `${dateFormat.format(new Date(day.date))} · ${day.count} contribution${day.count === 1 ? "" : "s"}`
                  : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
