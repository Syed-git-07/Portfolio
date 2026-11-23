import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { safeUrl } from "./content";
import "./certificate-drawer.css";

const labels = {
  iiot: "Industry 4.0",
  iot: "Internet of Things",
  english: "Technical English",
  python: "Python",
  "deep-learning": "Deep Learning",
};
const ease = "cubic-bezier(.22,.74,.22,1)";
const travel = { x: 112, y: 158 };
const slottedClip = "inset(-18px -1px calc(100% - 116px) -1px round 3px)";
const fullClip = "inset(-18px -1px -1px -1px round 3px)";
const slotMatrix = (x, y) => {
  const widthScale = 0.9 + 0.09 * Math.max(0, Math.min(1, (x - 165) / 66));
  return `matrix(${widthScale},${-0.22 * widthScale},-.034,.98,${x},${y})`;
};

export default function CertificateDrawer({ certificates, paused }) {
  const stage = useRef(null),
    front = useRef(null),
    flight = useRef(null);
  const [open, setOpen] = useState(false),
    [ready, setReady] = useState(false);
  const [hover, setHover] = useState(null),
    [selected, setSelected] = useState(null);
  const [reading, setReading] = useState(false),
    [scale, setScale] = useState(1);
  const returnFocus = useRef(null);
  const resizeFlight = useRef(null);
  const closeTrayAfterReturn = useRef(false);

  useLayoutEffect(() => {
    const el = stage.current;
    const measure = () => {
      setScale(el.clientWidth / 760);
      resizeFlight.current?.();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      flight.current?.cancel();
    };
  }, []);

  const moveTray = useCallback(
    (next) => {
      setOpen(next);
      setReady(paused && next);
      setHover(null);
    },
    [paused],
  );
  useLayoutEffect(() => {
    if (reading)
      stage.current
        .querySelector(".drawer-paper[data-reading] button")
        ?.focus({ preventScroll: true });
    if (!selected && returnFocus.current) {
      returnFocus.current.focus({ preventScroll: true });
      returnFocus.current = null;
    }
  }, [reading, selected]);
  function returnCard(retract = false) {
    const animation = flight.current;
    if (!animation) return;
    closeTrayAfterReturn.current ||= retract;
    setReading(false);
    animation.playbackRate = -1;
    animation.play();
  }

  function selectCard(record, index, x, y) {
    if (!ready || flight.current) return;
    const el = stage.current.querySelectorAll(".drawer-paper")[index];
    const trigger = stage.current.querySelectorAll(".drawer-slot")[index];
    const start = getComputedStyle(el).transform;
    const z = 8 + index;
    function poses() {
      const width = stage.current.clientWidth < 560 ? 696 : 424;
      const zoom = Math.min(width / 235, 550 / (el.offsetHeight + 16));
      const left = (760 - 235 * zoom) / 2 - travel.x;
      const top = (580 - (el.offsetHeight - 16) * zoom) / 2 - travel.y;
      return [
        { transform: start, clipPath: slottedClip, zIndex: z, offset: 0 },
        {
          transform: slotMatrix(x, y - 131),
          clipPath: fullClip,
          zIndex: z,
          offset: 0.34,
        },
        {
          transform: slotMatrix(x, y - 132),
          clipPath: fullClip,
          zIndex: 55,
          offset: 0.345,
        },
        {
          transform: `matrix(${zoom},0,0,${zoom},${left},${top})`,
          clipPath: fullClip,
          zIndex: 55,
          offset: 1,
        },
      ];
    }
    setSelected(record.id);
    setHover(null);
    const animation = el.animate(poses(), {
      duration: paused ? 1 : 690,
      easing: ease,
      fill: "both",
    });
    flight.current = animation;
    resizeFlight.current = () => animation.effect.setKeyframes(poses());
    animation.onfinish = () => {
      if (animation.playbackRate > 0) {
        setReading(true);
      } else {
        el.style.transform = start;
        animation.cancel();
        el.getBoundingClientRect();
        el.style.removeProperty("transform");
        flight.current = null;
        resizeFlight.current = null;
        setSelected(null);
        if (closeTrayAfterReturn.current) {
          closeTrayAfterReturn.current = false;
          moveTray(false);
          front.current?.focus({ preventScroll: true });
        } else returnFocus.current = trigger;
      }
    };
  }

  useEffect(() => {
    if (!open) return;
    function escape(event) {
      if (event.defaultPrevented || event.key !== "Escape") return;
      if (flight.current) returnCard();
      else if (stage.current.contains(document.activeElement)) {
        moveTray(false);
        front.current.focus({ preventScroll: true });
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open, moveTray]);

  const toggle = () => (flight.current ? returnCard(true) : moveTray(!open));
  return (
    <section
      id="capabilities"
      className="drawer-section ed-section ed-zone"
      aria-labelledby="credentials"
    >
      <div className="ed-heading">
        <h2 id="credentials">Certifications</h2>
      </div>
      <div className="drawer-entrance">
        <div
          ref={stage}
          className="drawer-stage"
          data-image-entry=""
          data-open={open || undefined}
          data-paused={paused || undefined}
        >
          <div
            className="drawer-world"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="drawer-shadow" />
            <div className="drawer-mouth" />
            <div className="drawer-roof" />
            <div className="drawer-wall" />
            <div className="rail-mask far">
              <div className="drawer-rail far drawer-moving" />
            </div>
            <div className="rail-mask near">
              <div className="drawer-rail near drawer-moving" />
            </div>
            {certificates.map((c, i) => {
              const t = i / Math.max(1, certificates.length - 1);
              const x = 165 + 66 * t,
                y = 110 + 117 * t;
              const matrix = slotMatrix(x, y);
              const active = c.id === selected;
              const image =
                safeUrl(c.image, "media") ||
                (labels[c.id]
                  ? "/assets/certificates/" + c.id + ".webp"
                  : "/assets/certificate-placeholder.svg");
              const file = safeUrl(c.file, "media") || image;
              return (
                <div
                  key={c.id}
                  className="drawer-file"
                  style={{
                    "--slot": matrix,
                    "--tab": 6 + (i % 3) * 62 + "px",
                    "--depth": 8 + i,
                  }}
                >
                  <button
                    type="button"
                    className="drawer-slot drawer-moving"
                    aria-label={c.title}
                    disabled={!ready || !!selected}
                    onPointerEnter={(e) =>
                      e.pointerType !== "touch" && setHover(c.id)
                    }
                    onPointerLeave={() => setHover(null)}
                    onFocus={(e) =>
                      e.target.matches(":focus-visible") && setHover(c.id)
                    }
                    onBlur={() => setHover(null)}
                    onClick={() => selectCard(c, i, x, y)}
                  />
                  <div
                    className="drawer-paper drawer-moving"
                    data-lift={hover === c.id || undefined}
                    data-reading={(active && reading) || undefined}
                    style={{ "--lifted": slotMatrix(x - 1, y - 26) }}
                    aria-hidden={!active}
                  >
                    <span className="drawer-tab">
                      {labels[c.id] || c.title}
                    </span>
                    <div className="drawer-document">
                      <img
                        src={image}
                        width="3574"
                        height="2560"
                        alt={c.title}
                        loading="lazy"
                      />
                      <div
                        className="drawer-actions"
                        inert={!active || !reading}
                      >
                        <small>
                          {c.issuer} · {c.score}
                        </small>
                        <a
                          href={file}
                          download={
                            c.id +
                            (file.toLowerCase().endsWith(".pdf")
                              ? ".pdf"
                              : ".webp")
                          }
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          aria-label="Close certificate"
                          onClick={() => returnCard()}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              className="drawer-front drawer-moving"
              type="button"
              ref={front}
              aria-expanded={open}
              aria-label={
                open ? "Close certificate drawer" : "Open certificate drawer"
              }
              onClick={toggle}
              onTransitionEnd={(e) => {
                if (
                  e.target === front.current &&
                  e.propertyName === "translate"
                )
                  setReady(open);
              }}
            >
              <span className="drawer-label">NPTEL</span>
              <span className="drawer-handle" />
              <i />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
