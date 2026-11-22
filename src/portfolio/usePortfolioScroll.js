import { useLayoutEffect, useRef } from "react";

// Animate the real document scroll position so sticky stages, focus, history,
// and the scrollbar all continue to use the browser's coordinate system.
export function usePortfolioScroll(opening, reduced, route) {
  const lastLockedWheel = useRef(null);
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (opening) {
      root.classList.add("ed-intro-locked");
      window.scrollTo({ top: 0, behavior: "instant" });
      const swallow = (event) => {
        if (!event.ctrlKey && event.cancelable) {
          event.preventDefault();
          lastLockedWheel.current = {
            at: event.timeStamp,
            delta: event.deltaY,
          };
        }
      };
      window.addEventListener("wheel", swallow, { passive: false });
      return () => {
        window.removeEventListener("wheel", swallow);
        root.classList.remove("ed-intro-locked");
      };
    }
    if (reduced) return;

    let frame = 0,
      target = 0,
      position = 0,
      lastWritten = 0,
      previousTime = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const locked = () =>
      root.matches(".ed-menu-open,.ed-transfer") ||
      document.body.style.overflow === "hidden";

    function advance(time) {
      if (locked() || Math.abs(window.scrollY - lastWritten) > 1) return stop();
      const elapsed = Math.max(0, time - previousTime);
      previousTime = time;
      position += (target - position) * (1 - Math.exp(-elapsed / 200));
      if (Math.abs(target - position) < 0.55) position = target;
      window.scrollTo({ top: Math.round(position), behavior: "instant" });
      lastWritten = window.scrollY;
      frame = position === target ? 0 : requestAnimationFrame(advance);
    }
    function wheel(event) {
      if (
        event.defaultPrevented ||
        !event.cancelable ||
        event.ctrlKey ||
        event.shiftKey ||
        !event.deltaY ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        locked()
      )
        return;
      // A trackpad can keep sending a decaying tail across the unlock frame.
      // A pause, a direction change or a fresh acceleration starts a new gesture.
      const tail = lastLockedWheel.current;
      const shrinking = tail && Math.abs(event.deltaY) < Math.abs(tail.delta);
      if (
        tail &&
        event.timeStamp - tail.at < (shrinking ? 250 : 55) &&
        Math.sign(tail.delta) === Math.sign(event.deltaY) &&
        Math.abs(event.deltaY) <= Math.abs(tail.delta)
      ) {
        lastLockedWheel.current = { at: event.timeStamp, delta: event.deltaY };
        event.preventDefault();
        return;
      }
      lastLockedWheel.current = null;
      // Leave nested scrolling surfaces and editable controls to the browser.
      for (const node of event.composedPath()) {
        if (node === document.body || !(node instanceof Element)) break;
        if (
          node.matches("dialog,input,select,textarea,[contenteditable=true]") ||
          (node.scrollHeight > node.clientHeight + 1 &&
            /auto|scroll/.test(getComputedStyle(node).overflowY))
        ) {
          stop();
          return;
        }
      }
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
      if (!frame || Math.abs(window.scrollY - lastWritten) > 1) {
        stop();
        position = target = lastWritten = window.scrollY;
        previousTime = performance.now() - 21;
      }
      target = Math.max(
        0,
        Math.min(
          root.scrollHeight - root.clientHeight,
          target + event.deltaY * unit,
        ),
      );
      event.preventDefault();
      if (!frame) advance(performance.now());
    }
    const controller = new AbortController();
    const options = { signal: controller.signal, capture: true, passive: true };
    window.addEventListener("wheel", wheel, {
      signal: controller.signal,
      passive: false,
    });
    for (const type of [
      "pointerdown",
      "touchstart",
      "keydown",
      "resize",
      "popstate",
      "blur",
      "pagehide",
    ])
      window.addEventListener(type, stop, options);
    return () => {
      controller.abort();
      stop();
    };
  }, [opening, reduced, route]);
}
