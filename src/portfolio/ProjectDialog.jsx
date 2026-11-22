import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import ProjectOptions, { GitHubMark } from "./ProjectOptions";
import {
  ProjectTitle,
  ProjectDescription,
  BrowserBar,
} from "./ProjectPresentation";
import CornerAction from "./CornerAction";
import { safeUrl } from "./content";
import "./project-dialog.css";

const external = { target: "_blank", rel: "noopener noreferrer" };
const dimensions = {
  "fee-portal": [1440, 1077],
  collection: [1101, 529],
  "payment-mobile": [390, 1013],
  "receipt-half": [374, 707],
  "print-checkout": [1100, 740],
  "print-upload": [1280, 900],
  "nec-signin": [1440, 900],
  "keycloak-admin": [1280, 720],
  ims: [1280, 784],
  "kr-exports": [1917, 961],
  riskguard: [1440, 2365],
  scheduler: [1380, 880],
  youtube: [1200, 800],
};
// The frame is in normal flow at the handoff. Above it, the transform cancels
// native scroll travel so the reveal can ease independently in both directions.
function useMediaReveal(view, reduced, hasMedia) {
  const measureView = useRef(null);
  useLayoutEffect(() => {
    if (reduced || !hasMedia) return;
    const el = view.current;
    const frame = el.querySelector(".cin-frame"),
      sheet = el.querySelector(".cin-sheet");
    const intro = el.querySelector(".cin-intro");
    let raf = 0,
      p = 0,
      h,
      distance,
      scale;
    let last = 0;
    function draw(time = performance.now()) {
      const y = el.scrollTop;
      const target = Math.min(1, y / distance);
      const dt = last ? Math.max(0, time - last) : 16.67;
      p += (target - p) * (1 - Math.pow(0.88, dt / 16.67));
      if (y >= distance + h || Math.abs(target - p) < 0.001) p = target;
      const shift = Math.min(y, distance) - distance + h * 0.62 * (1 - p);
      const zoom = scale + (1 - scale) * p;
      frame.style.transform = `translateY(${shift}px) scale(${zoom})`;
      frame.style.borderRadius = 16 * (1 - p) + "px";
      sheet.style.transform = `translateY(${shift - 12}px) scale(${zoom})`;
      sheet.style.opacity = Math.max(0, 1 - 2 * p);
      intro.style.transform = `translateY(${Math.min(y, distance) - 60 * p}px) scale(${1 - 0.06 * p})`;
      intro.style.opacity = Math.max(0, 1 - p / 0.6);
      intro.inert = p >= 0.6;
      raf = p === target ? 0 : requestAnimationFrame(draw);
      last = raf ? time : 0;
    }
    function scroll() {
      if (!raf) raf = requestAnimationFrame(draw);
    }
    function measure() {
      const mobile = matchMedia("(max-width:768px)").matches;
      h = el.clientHeight;
      if (!h) return;
      el.style.setProperty("--viewport-height", h + "px");
      distance = Math.max(1, h * (mobile ? 0.6 : 0.7));
      scale = mobile ? 0.88 : Math.min(620 / el.clientWidth, 0.8);
      el.style.setProperty("--travel", distance + "px");
      el.style.setProperty("--intro-height", h * 0.62 + "px");
      cancelAnimationFrame(raf);
      draw();
    }
    measureView.current = measure;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", scroll, { passive: true });
    return () => {
      measureView.current = null;
      ro.disconnect();
      el.removeEventListener("scroll", scroll);
      cancelAnimationFrame(raf);
      for (const layer of [frame, sheet, intro]) layer.removeAttribute("style");
      intro.inert = false;
    };
  }, [view, reduced, hasMedia]);
  return measureView;
}

// Project the tile contents into panel coordinates before the outer FLIP starts.
// The scrolling frame keeps its own transform; its wrapper owns the entry motion.
function alignContents(tile, panel, returning = false) {
  const source = tile.getBoundingClientRect(),
    dest = panel.getBoundingClientRect();
  const layoutRatio = dest.width / tile.offsetWidth;
  const ratio = dest.width / source.width;
  const flights = [];
  for (const [start, end, layer] of [
    [".work-sheet-name", ".cin-intro h2", ".cin-intro h2"],
    [".work-sheet-summary", ".cin-intro p", ".cin-intro p"],
    [".work-sheet-preview", ".cin-frame", ".cin-media"],
  ]) {
    const a = tile.querySelector(start),
      b = panel.querySelector(end),
      el = panel.querySelector(layer);
    if (!a || !b || !el) continue;
    const first = a.getBoundingClientRect(),
      last = b.getBoundingClientRect(),
      box = el.getBoundingClientRect();
    const cx = last.left + last.width / 2;
    const dx =
      (first.left + first.width / 2 - source.left) * ratio - (cx - dest.left);
    const dy = (first.top - source.top) * ratio - (last.top - dest.top);
    const scale =
      b === el
        ? (layoutRatio * parseFloat(getComputedStyle(a).fontSize)) /
          parseFloat(getComputedStyle(b).fontSize)
        : (first.width * ratio) / last.width;
    el.style.transformOrigin = `${cx - box.left}px ${last.top - box.top}px`;
    flights.push(
      el.animate(
        [
          {
            transform: `translate(${dx}px,${dy}px) scale(${scale})`,
            opacity: 0,
          },
          { opacity: 1, offset: 0.45 },
          { transform: "none", opacity: 1 },
        ],
        returning
          ? {
              duration: 500,
              direction: "reverse",
              easing: "cubic-bezier(.65,0,.35,1)",
              fill: "forwards",
            }
          : { duration: 700, easing: "cubic-bezier(.22,1,.36,1)" },
      ),
    );
  }
  return flights;
}

export default function ProjectDialog({ project, images, onClose, reduced }) {
  const host = useRef(null),
    card = useRef(null),
    view = useRef(null),
    closeBtn = useRef(null),
    more = useRef(null);
  const dismiss = useRef(null),
    finish = useRef(onClose);
  finish.current = onClose;
  const originRow = useRef(null);
  const [hover, setHover] = useState(false),
    [keyboard, setKeyboard] = useState(false),
    [menu, setMenu] = useState(false);
  const [compact, setCompact] = useState(
    () =>
      matchMedia("(max-width:960px), (max-height:460px), (hover:none)").matches,
  );
  const open = hover || keyboard || menu || compact;
  const live = safeUrl(project.url),
    repo = safeUrl(project.source);
  const git = repo || "https://github.com/Syed-git-07",
    gitLabel = repo ? "GitHub repository" : "GitHub profile";
  const [short, setShort] = useState(
    () => matchMedia("(max-height:460px)").matches,
  );
  const measureView = useMediaReveal(view, reduced || short, images.length > 0);
  useEffect(() => {
    const mq = matchMedia(
      "(max-width:960px), (max-height:460px), (hover:none)",
    );
    const height = matchMedia("(max-height:460px)");
    const size = () => setShort(height.matches);
    const update = () => setCompact(mq.matches);
    height.addEventListener("change", size);
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      height.removeEventListener("change", size);
    };
  }, []);
  useLayoutEffect(() => {
    const dialog = host.current,
      panel = card.current;
    const row = (originRow.current ||= document.querySelector(
      "[data-origin].folio-row, .ed-feature[data-origin], .ed-notes a[data-origin]",
    ));
    if (row) row.dataset.origin = "";
    const tile = row?.querySelector(".work-sheet,[data-picture]") || row;
    const trigger =
      row?.querySelector(".folio-trigger") || row || document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    measureView.current?.();
    document.body.style.overflow = "hidden";
    closeBtn.current.focus({ preventScroll: true });
    const expanded = {
      transform: "none",
      clipPath: "inset(-90px round 0px)",
      opacity: 1,
    };
    const fallback = {
      transform: "translateY(100dvh) scale(.96)",
      clipPath: expanded.clipPath,
      opacity: 1,
    };
    let ghost, blend;
    function sourcePose() {
      const a = tile?.getBoundingClientRect();
      // Grid centering gives the underlying panel bounds even mid-flight.
      const layout = getComputedStyle(panel);
      const width = parseFloat(layout.width),
        height = parseFloat(layout.height);
      const b = {
        width,
        height,
        x: (dialog.clientWidth - width) / 2,
        y: (dialog.clientHeight - height) / 2,
      };
      const stage = row?.closest(".folio-stage")?.getBoundingClientRect();
      if (!a?.width || !b.width) return fallback;
      const left = Math.max(0, a.left, stage?.left ?? 0);
      const right = Math.min(innerWidth, a.right, stage?.right ?? innerWidth);
      const top = Math.max(0, a.top, stage?.top ?? 0);
      const bottom = Math.min(
        innerHeight,
        a.bottom,
        stage?.bottom ?? innerHeight,
      );
      if (left >= right || top >= bottom) return fallback;
      const scale = a.width / b.width;
      const radius =
        (parseFloat(getComputedStyle(tile).borderTopLeftRadius) * b.width) /
          tile.offsetWidth || 0;
      const inset = [
        (top - a.top) / scale,
        (a.right - right) / scale,
        b.height - (bottom - a.top) / scale,
        (left - a.left) / scale,
      ];
      return {
        opacity: Number(getComputedStyle(row).opacity),
        transform: `translate(${a.x - b.x}px,${a.y - b.y}px) scale(${scale})`,
        clipPath: `inset(${inset.map((n) => n + "px").join(" ")} round ${radius}px)`,
      };
    }
    // Freeze the source at its own layout width so neither its line breaks
    // nor its screenshot crop change when it enters the fixed dialog portal.
    function snapshot(pose, closing, opacity) {
      blend?.cancel();
      ghost?.remove();
      if (reduced || pose === fallback || !tile?.matches(".work-sheet")) return;
      ghost = document.createElement("div");
      ghost.className = "cin-origin";
      ghost.inert = true;
      ghost.setAttribute("aria-hidden", "true");
      const visual = tile.cloneNode(true);
      const style = getComputedStyle(tile);
      Object.assign(visual.style, {
        inset: "0 auto auto 0",
        width: style.width,
        height: style.height,
        borderRadius: style.borderRadius,
        transformOrigin: "0 0",
        transform: `scale(${panel.offsetWidth / parseFloat(style.width)})`,
      });
      visual.style.setProperty(
        "--sheet-height",
        style.getPropertyValue("--sheet-height"),
      );
      ghost.append(visual);
      panel.append(ghost);

      blend = ghost.animate(
        closing
          ? [{ opacity }, { opacity: 1 }]
          : [{ opacity: 1 }, { opacity: 0.9, offset: 0.35 }, { opacity: 0 }],
        {
          duration: closing ? 500 : 280,
          easing: closing ? "ease-in" : "ease-out",
          fill: "both",
        },
      );
      if (!closing) blend.onfinish = () => ghost.remove();
    }
    const from = sourcePose();
    const fromSheet =
      !reduced && from !== fallback && tile?.matches(".work-sheet");
    if (fromSheet) panel.dataset.fromSheet = "";
    const contentFlights = fromSheet ? alignContents(tile, panel) : [];
    snapshot(from, false, 0);
    const flight = panel.animate(
      reduced ? [{ opacity: 0 }, { opacity: 1 }] : [from, expanded],
      { duration: reduced ? 200 : 700, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    let exit,
      retargetFrame,
      closing = false;
    dismiss.current = () => {
      if (closing) return;
      closing = true;
      const style = getComputedStyle(panel);
      const current = {
        opacity: style.opacity,
        transform: style.transform,
        clipPath:
          style.clipPath === "none" ? expanded.clipPath : style.clipPath,
      };
      const opacity = style.opacity;
      const blendOpacity = ghost?.isConnected
        ? Number(getComputedStyle(ghost).opacity)
        : 0;
      flight.cancel();
      const end = sourcePose();
      if (fromSheet && end !== fallback) {
        if (
          view.current.scrollTop === 0 &&
          !contentFlights.some((a) => a.playState === "running")
        ) {
          contentFlights.push(...alignContents(tile, panel, true));
        } else {
          // A scrolled gallery may be showing a different screenshot. Clear
          // that image early so it doesn't remain readable under the tile.
          contentFlights.push(
            view.current
              .querySelector(".cin-story")
              .animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 180,
                fill: "forwards",
              }),
          );
        }
      }
      snapshot(end, true, blendOpacity);
      dialog.dataset.closing = "";
      exit = panel.animate(
        reduced ? [{ opacity }, { opacity: 0 }] : [current, end],
        {
          duration: reduced ? 200 : 500,
          easing: "cubic-bezier(.65,0,.35,1)",
          fill: "forwards",
        },
      );
      // A quick reversal can catch the carousel while its spring is settling.
      // Retarget the same running animation without resetting its clock.
      if (!reduced && tile?.matches(".work-sheet")) {
        let previous = end;
        const retarget = () => {
          if (exit.playState !== "running") return;
          const next = sourcePose();
          if (
            next.transform !== previous.transform ||
            next.clipPath !== previous.clipPath
          ) {
            exit.effect.setKeyframes([current, next]);
            const visual = ghost?.firstElementChild;
            if (visual && next !== fallback) {
              const source = getComputedStyle(tile);
              Object.assign(visual.style, {
                width: source.width,
                height: source.height,
                borderRadius: source.borderRadius,
                transform: `scale(${panel.offsetWidth / parseFloat(source.width)})`,
              });
            }
            previous = next;
          }
          retargetFrame = requestAnimationFrame(retarget);
        };
        retargetFrame = requestAnimationFrame(retarget);
      }
      exit.onfinish = () => finish.current();
    };
    return () => {
      for (const animation of contentFlights) animation.cancel();
      delete panel.dataset.fromSheet;
      cancelAnimationFrame(retargetFrame);
      flight.cancel();
      blend?.cancel();
      ghost?.remove();
      if (exit) {
        exit.onfinish = null;
        exit.cancel();
      }
      dialog.close();
      document.body.style.overflow = overflow;
      if (row) delete row.dataset.origin;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [reduced, measureView]);
  const close = () => dismiss.current?.();
  const collapse = () => {
    setMenu(false);
    more.current.focus({ preventScroll: true });
  };
  const actions = [
    ...(live
      ? [
          <a
            href={live}
            {...external}
            aria-label="Open live preview"
            key="live"
          >
            <ArrowUpRight />
          </a>,
        ]
      : []),
    <a key="git" href={git} {...external} aria-label={gitLabel}>
      <GitHubMark />
    </a>,
  ];
  return createPortal(
    <dialog
      className="cin-dialog"
      aria-modal="true"
      aria-labelledby="folio-title"
      ref={host}
      onCancel={(e) => {
        e.preventDefault();
        if (menu) collapse();
        else close();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        setKeyboard(true);
        const items = [
          ...card.current.querySelectorAll("a[href],button"),
        ].filter((el) => !el.closest("[inert]"));
        const first = items[0],
          last = items.at(-1);
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus({ preventScroll: true });
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        }
      }}
      onPointerDown={(e) => {
        setKeyboard(false);
        if (menu && !e.target.closest(".cin-options-anchor")) collapse();
        if (e.target === host.current) close();
      }}
    >
      <article
        className="cin-card"
        ref={card}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHover(true);
        }}
        onPointerLeave={() => setHover(false)}
      >
        {open && <div className="cin-bridge" aria-hidden="true" />}
        <div className="cin-fan" inert={!open}>
          {actions.map((action, i) => (
            <CornerAction
              key={action.key}
              index={i}
              count={actions.length}
              open={open}
              reduced={reduced}
            >
              {action}
            </CornerAction>
          ))}
        </div>
        <div className="cin-surface">
          <div className="cin-scroll" ref={view}>
            <div className={"cin-story" + (!images.length ? " empty" : "")}>
              <header className="cin-intro">
                <div>
                  <h2 id="folio-title">
                    <ProjectTitle title={project.title} />
                  </h2>
                  <p>
                    <ProjectDescription project={project} />
                  </p>
                  {live && (
                    <a className="cin-live" href={live} {...external}>
                      View live project <ArrowUpRight size={17} />
                    </a>
                  )}
                </div>
              </header>
              {!!images.length && (
                <div className="cin-media">
                  <div className="cin-sheet" aria-hidden="true" />
                  <div className="cin-frame">
                    <BrowserBar />
                    {images.map(([label, url]) => {
                      const [width, height] =
                        dimensions[url.split("/").pop().replace(".webp", "")] ||
                        [];
                      return (
                        <img
                          key={url}
                          alt={label}
                          src={url}
                          width={width}
                          height={height}
                          loading="lazy"
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          ref={closeBtn}
          className="cin-close"
          aria-label="Close project"
          onClick={close}
        >
          <X size={18} />
        </button>
        <ProjectOptions
          project={project}
          live={live}
          git={git}
          gitLabel={gitLabel}
          open={menu}
          onToggle={() => setMenu((value) => !value)}
          trigger={more}
          reduced={reduced}
        />
      </article>
    </dialog>,
    document.body,
  );
}
