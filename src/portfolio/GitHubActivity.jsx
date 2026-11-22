import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { contributionScene } from "./contributionScene";
import "./github-activity.css";

const platforms = [
  {
    id: "github",
    name: "GitHub",
    account: "Syed-git-07",
    href: "https://github.com/Syed-git-07",
    unit: "contribution",
  },
  {
    id: "leetcode",
    name: "LeetCode",
    account: "Mightbe_Syed",
    href: "https://leetcode.com/u/Mightbe_Syed/",
    unit: "submission",
  },
];
const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatDate = (day) => dateFormat.format(new Date(day.date));

async function loadCalendar(platform, signal) {
  const path = platform.id + "-activity";
  for (const url of ["/api/" + path, "/" + path + ".json"]) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) continue;
      const data = await response.json();
      if (
        data.account === platform.account &&
        Array.isArray(data.days) &&
        data.days.length
      )
        return data.days;
    } catch (error) {
      if (signal.aborted) throw error;
    }
  }
  throw new Error("Calendar unavailable");
}

function ActivityPanel({ platform, enabled, register }) {
  const canvas = useRef(null),
    scene = useRef(null),
    redraw = useRef(null);
  const selection = useRef(-1);
  const [days, setDays] = useState(null),
    [unavailable, setUnavailable] = useState(false);
  const [selected, setSelected] = useState(-1);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    loadCalendar(platform, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setDays(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setUnavailable(true);
      });
    return () => controller.abort();
  }, [platform, enabled]);

  useEffect(() => {
    if (!days) return;
    const instance = contributionScene(canvas.current, days);
    if (!instance) {
      setUnavailable(true);
      return;
    }
    scene.current = instance;
    const { schedule, remove } = register((progress) =>
      instance.draw(progress, selection.current),
    );
    redraw.current = schedule;
    const resize = new ResizeObserver(() => {
      instance.resize();
      schedule();
    });
    resize.observe(canvas.current);
    return () => {
      remove();
      resize.disconnect();
      scene.current = null;
      redraw.current = null;
    };
  }, [days, register]);

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
    if (days && e.key in steps) {
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
  const stats = useMemo(
    () =>
      days && {
        total: days.reduce((sum, d) => sum + d.count, 0),
        active: days.filter((d) => d.count > 0).length,
      },
    [days],
  );
  const heading =
    platform.id === "github" ? "activity-heading" : "leetcode-activity-heading";
  return (
    <article className="activity-panel" aria-labelledby={heading}>
      <header>
        <h2 id={heading}>{platform.name} Activity</h2>
        <a href={platform.href} target="_blank" rel="noopener noreferrer">
          {platform.account} <ArrowUpRight size={15} />
        </a>
      </header>
      <div className="activity-metrics">
        {stats && (
          <>
            {stats.total.toLocaleString("en")} {platform.unit}
            {stats.total === 1 ? "" : "s"} · {stats.active} active{" "}
            {stats.active === 1 ? "day" : "days"}
          </>
        )}
      </div>
      <div className="activity-drawing">
        <canvas
          ref={canvas}
          tabIndex={days && !unavailable ? 0 : -1}
          role="group"
          aria-label={`Daily ${platform.name} ${platform.unit}s. Use arrow keys to explore dates.`}
          aria-describedby={platform.id + "-day"}
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
              ? "Activity calendar unavailable."
              : `Loading ${platform.unit}s…`}
          </p>
        )}
      </div>
      <div className="activity-caption">
        <span>
          {days && `${formatDate(days[0])} – ${formatDate(days.at(-1))}`}
        </span>
        <span id={platform.id + "-day"} aria-live="polite">
          {day &&
            `${formatDate(day)} · ${day.count} ${platform.name} ${platform.unit}${day.count === 1 ? "" : "s"}`}
        </span>
      </div>
    </article>
  );
}

export default function GitHubActivity({ paused }) {
  const section = useRef(null),
    stage = useRef(null);
  const drawings = useRef(new Set()),
    request = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const register = useCallback((draw) => {
    drawings.current.add(draw);
    const schedule = () => request.current?.();
    schedule();
    return { schedule, remove: () => drawings.current.delete(draw) };
  }, []);

  useEffect(() => {
    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEnabled(true);
          near.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(section.current);
    let visible = false,
      frame = 0;
    function schedule() {
      if (!visible || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const progress = paused ? 0 : scrollYProgress.get();
        drawings.current.forEach((draw) => draw(progress));
      });
    }
    request.current = schedule;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(stage.current);
    const stop = scrollYProgress.on("change", schedule);
    return () => {
      stop();
      near.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);
      request.current = null;
    };
  }, [paused, scrollYProgress]);

  return (
    <section
      id="github-activity"
      className="github-activity"
      data-still={paused || undefined}
      ref={section}
      aria-label="GitHub and LeetCode activity"
    >
      <div className="activity-stage" ref={stage}>
        <div className="activity-pair">
          {platforms.map((platform) => (
            <ActivityPanel
              key={platform.id}
              {...{ platform, enabled, register }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
