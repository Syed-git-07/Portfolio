import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export default function ValidationThreads() {
  const overlay = useRef(null);
  const [lines, setLines] = useState([]);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const svg = overlay.current;
    const form = svg.closest("form");
    const button = form.querySelector(".contact-send");
    const fields = Array.from(form.querySelectorAll("[required]"));
    let attempted = false;
    let frame;

    function measure() {
      frame = undefined;
      if (!attempted) return;
      const bounds = svg.getBoundingClientRect();
      const submit = button.getBoundingClientRect();
      const x = submit.right - bounds.left;
      const y = submit.top + submit.height / 2 - bounds.top;
      const gutter = Math.max(0, bounds.width - x - 2);
      setLines(
        fields.flatMap((field, index) => {
          if (!field.willValidate || field.validity.valid) return [];
          const rect = field.getBoundingClientRect();
          const endX = rect.right - bounds.left;
          const endY = rect.top + rect.height / 2 - bounds.top;
          const rail = x + gutter * (1 - index / (fields.length + 1));
          const bend = Math.min(26, Math.abs(y - endY) / 3);
          return [
            {
              field: field.name,
              x,
              y,
              endX,
              endY,
              path: `M ${x} ${y} C ${rail} ${y}, ${rail} ${y - bend / 2}, ${rail} ${y - bend} L ${rail} ${endY + bend} Q ${rail} ${endY}, ${endX} ${endY}`,
            },
          ];
        }),
      );
    }
    function schedule() {
      if (attempted && frame === undefined)
        frame = requestAnimationFrame(measure);
    }
    function invalid() {
      attempted = true;
      schedule();
    }
    function submitted() {
      attempted = false;
      setLines([]);
    }

    const observer = new ResizeObserver(schedule);
    for (const element of [form, button, ...fields]) observer.observe(element);
    form.addEventListener("invalid", invalid, true);
    form.addEventListener("input", schedule);
    form.addEventListener("submit", submitted);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      form.removeEventListener("invalid", invalid, true);
      form.removeEventListener("input", schedule);
      form.removeEventListener("submit", submitted);
    };
  }, []);

  return (
    <svg
      ref={overlay}
      className="validation-threads"
      aria-hidden="true"
      focusable="false"
    >
      <AnimatePresence>
        {lines.map(({ field, path, endX, endY }, index) => (
          <motion.g
            key={field}
            data-field={field}
            initial="hidden"
            animate="shown"
            exit="hidden"
          >
            <motion.path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinecap="round"
              variants={{
                hidden: {
                  pathLength: 0,
                  opacity: 0,
                  transition: { duration: reduced ? 0 : 0.19 },
                },
                shown: {
                  pathLength: 1,
                  opacity: 0.9,
                  transition: {
                    duration: reduced ? 0 : 0.36,
                    delay: reduced ? 0 : index * 0.035,
                  },
                },
              }}
            />
            <motion.circle
              cx={endX}
              cy={endY}
              r="2"
              fill="currentColor"
              variants={{
                hidden: { opacity: 0 },
                shown: {
                  opacity: 1,
                  transition: { delay: reduced ? 0 : 0.28 + index * 0.035 },
                },
              }}
            />
          </motion.g>
        ))}
        {lines.length > 0 && (
          <motion.circle
            key="origin"
            cx={lines[0].x}
            cy={lines[0].y}
            r="2.25"
            fill="currentColor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}
