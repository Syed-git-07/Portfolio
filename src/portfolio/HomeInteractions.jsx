import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight } from "lucide-react";

const fineMouse = "(hover: hover) and (pointer: fine)";

export function FillControl({ href, children, disabled }) {
  const Tag = href ? "a" : "button";
  const props = href ? { href } : { type: "submit", disabled };
  const reset = (e) => {
    e.currentTarget.style.removeProperty("--pull-x");
    e.currentTarget.style.removeProperty("--pull-y");
  };
  return (
    <Tag
      {...props}
      className={href ? "ed-fill dark" : "ed-fill contact-send"}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || disabled) return;
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--pull-x",
          ((e.clientX - box.left) / box.width - 0.5) * 6 + "px",
        );
        e.currentTarget.style.setProperty(
          "--pull-y",
          ((e.clientY - box.top) / box.height - 0.5) * 6 + "px",
        );
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <span className="ed-fill-face">
        <span>{children}</span>
        <span className="ed-fill-ink" aria-hidden="true">
          {children}
        </span>
        <i aria-hidden="true">
          <ArrowRight size={15} />
          <ArrowRight size={15} />
        </i>
      </span>
    </Tag>
  );
}

export function DesktopNav({ links, route }) {
  const nav = useRef(null);
  useLayoutEffect(() => {
    const el = nav.current;
    let previousTarget = null;
    const update = () => {
      const target =
        el.querySelector("a:hover") ||
        el.querySelector("a:focus-visible") ||
        el.querySelector("[aria-current]");
      if (target !== previousTarget) {
        el.toggleAttribute("data-slide", Boolean(target && previousTarget));
        previousTarget = target;
      }
      el.toggleAttribute("data-highlight", Boolean(target));
      if (target) {
        el.style.setProperty("--pill-x", target.offsetLeft + "px");
        el.style.setProperty("--pill-w", target.offsetWidth + "px");
      }
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.querySelectorAll("a").forEach((a) => ro.observe(a));
    const events = ["pointerover", "pointerleave", "focusin", "focusout"];
    let frame;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    events.forEach((event) => el.addEventListener(event, schedule));
    update();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      events.forEach((event) => el.removeEventListener(event, schedule));
    };
  }, [route]);
  return (
    <nav ref={nav} className="ed-nav" aria-label="Main navigation">
      {links.map(([label, id]) => (
        <a
          key={id}
          href={"#" + id}
          aria-current={route === "#" + id ? "location" : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

// Halden fills the disc over a text line's box, including inter-word space.
// The pinned headline occupies the stage, with the media hit area in front.
function cursorState(target, badge) {
  if (badge) return "badge";
  if (
    target.closest(".ed-nav, .ed-fill, .ed-menu-button, .ed-footer")
  )
    return "quiet";
  if (target.closest("a, button, [role=button]")) return "link";
  if (target.closest("img, video, canvas, .ed-reel")) return "idle";
  if (
    target.closest(
      "h1,h2,h3,h4,h5,h6,p,strong,em,small,label,figcaption,dt,dd,.ed-mark,.ed-pin",
    )
  )
    return "text";
  return Array.from(target.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
  )
    ? "text"
    : "idle";
}

export function EditorialPointer({ paused, blocked }) {
  const ref = useRef(null);
  const lastPoint = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    const shell = document.querySelector(".ed-shell");
    const media = matchMedia(fineMouse);
    let frame = 0,
      hitFrame = 0,
      ringX,
      ringY,
      previousTime;

    function hide() {
      el.hidden = true;
      if (root.classList.contains("ed-pointer-on"))
        root.classList.remove("ed-pointer-on");
      cancelAnimationFrame(frame);
      frame = 0;
    }
    function clear() {
      lastPoint.current = null;
      hide();
    }
    function paint(time) {
      frame = 0;
      if (el.hidden || !lastPoint.current) return;
      const [x, y] = lastPoint.current;
      const amount =
        1 - Math.exp(-Math.max(0, Math.min(64, time - previousTime)) / 35);
      previousTime = time;
      ringX += (x - ringX) * amount;
      ringY += (y - ringY) * amount;
      el.style.setProperty("--ring-x", ringX + "px");
      el.style.setProperty("--ring-y", ringY + "px");
      if (Math.abs(x - ringX) + Math.abs(y - ringY) > 0.1)
        frame = requestAnimationFrame(paint);
    }
    function sync() {
      hitFrame = 0;
      if (!lastPoint.current || blocked || paused || !media.matches)
        return hide();
      const [x, y] = lastPoint.current;
      const target = document.elementFromPoint(x, y);
      const opening = shell?.classList.contains("is-opening");
      // During the opening the shell is inert, so hit testing resolves to body.
      if (
        !target ||
        x >= root.clientWidth ||
        y >= root.clientHeight ||
        !(opening || shell?.contains(target)) ||
        root.classList.contains("ed-transfer") ||
        target.closest(
          "input,textarea,select,[contenteditable]:not([contenteditable=false]),.signature-field,[disabled],dialog,[role=dialog]",
        ) ||
        document.querySelector("dialog[open],[aria-modal=true]")
      )
        return hide();
      const badge = opening
        ? ""
        : target.closest("[data-cursor]")?.dataset.cursor || "";
      el.dataset.state = opening ? "quiet" : cursorState(target, badge);
      const label = el.lastElementChild.firstElementChild;
      const words = badge.replace(" ", "\n");
      if (badge && label.textContent !== words) label.textContent = words;
      el.style.setProperty("--point-x", x + "px");
      el.style.setProperty("--point-y", y + "px");
      if (el.hidden) {
        ringX = x;
        ringY = y;
        previousTime = performance.now();
        el.style.setProperty("--ring-x", x + "px");
        el.style.setProperty("--ring-y", y + "px");
      }
      el.hidden = false;
      if (!root.classList.contains("ed-pointer-on"))
        root.classList.add("ed-pointer-on");
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function refresh() {
      if (lastPoint.current && !hitFrame)
        hitFrame = requestAnimationFrame(sync);
    }
    function move(e) {
      if (e.pointerType !== "mouse" || !media.matches) return clear();
      lastPoint.current = [e.clientX, e.clientY];
      cancelAnimationFrame(hitFrame);
      sync();
    }
    const abort = new AbortController();
    const opts = { signal: abort.signal, passive: true };
    window.addEventListener("pointermove", move, opts);
    window.addEventListener("pointerover", move, opts);
    window.addEventListener("scroll", refresh, { ...opts, capture: true });
    window.addEventListener("resize", refresh, opts);
    window.addEventListener("hashchange", refresh, opts);
    window.addEventListener("blur", clear, opts);
    document.addEventListener("pointerleave", clear, opts);
    document.addEventListener("keydown", clear, opts);
    media.addEventListener("change", clear, opts);
    // Re-hit-test a resting pointer when content moves under it, a dialog closes,
    // or the opening releases the inert shell.
    for (const event of ["animationend", "transitionend"])
      shell?.addEventListener(event, refresh, opts);
    const changes = new MutationObserver(refresh);
    changes.observe(root, { attributes: true, attributeFilter: ["class"] });
    if (shell)
      changes.observe(shell, {
        attributes: true,
        attributeFilter: ["class", "inert"],
      });
    const modals = new MutationObserver((records) => {
      const selector = "dialog,[aria-modal=true]";
      if (
        records.some(
          (record) =>
            record.type === "attributes" ||
            [...record.addedNodes, ...record.removedNodes].some(
              (node) =>
                node instanceof Element &&
                (node.matches(selector) || node.querySelector(selector)),
            ),
        )
      )
        refresh();
    });
    modals.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ["open", "aria-modal"],
    });
    sync();
    return () => {
      abort.abort();
      changes.disconnect();
      modals.disconnect();
      cancelAnimationFrame(hitFrame);
      hide();
    };
  }, [paused, blocked]);
  return createPortal(
    <div hidden ref={ref} className="ed-pointer" aria-hidden="true">
      <i />
      <svg aria-hidden="true" viewBox="0 0 18 22">
        <path
          d="M2 2 15.5 13l-6 .8-3.2 6.1Z"
          fill="#080708"
          stroke="#edf5fc"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        <em />
      </span>
    </div>,
    document.body,
  );
}

export function FooterLetters({ name }) {
  const ref = useRef(null);
  useEffect(() => {
    const row = ref.current;
    const footer = row.closest("footer");
    const letters = Array.from(row.children);
    const reset = () =>
      letters.forEach((letter) => letter.style.removeProperty("--weight"));
    const move = (e) => {
      if (
        e.pointerType !== "mouse" ||
        !matchMedia(fineMouse).matches ||
        footer.closest(".motion-paused")
      )
        return;
      const boxes = letters.map((letter) => letter.getBoundingClientRect());
      const radius = Math.max(55, row.offsetHeight * 1.2);
      boxes.forEach((box, i) => {
        const distance = Math.hypot(
          e.clientX - box.left - box.width / 2,
          e.clientY - box.top - box.height / 2,
        );
        letters[i].style.setProperty(
          "--weight",
          Math.round(600 + 250 * Math.max(0, 1 - distance / radius)),
        );
      });
    };
    footer.addEventListener("pointermove", move);
    footer.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    window.addEventListener("scroll", reset, { passive: true });
    return () => {
      footer.removeEventListener("pointermove", move);
      footer.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      window.removeEventListener("scroll", reset);
    };
  }, [name]);
  return (
    <span ref={ref} className="ed-letters" aria-hidden="true">
      {Array.from(name, (letter, i) => (
        <span key={i} data-letter={letter}>
          {letter}
        </span>
      ))}
    </span>
  );
}
