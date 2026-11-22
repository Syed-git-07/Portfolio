// Action Node spring and arc geometry adapted from Bencho (MIT, docs/licenses/bencho-MIT.txt).
import { useState, useEffect, useRef, type ReactNode } from "react";
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
const springOf = (tune: number) => ({
  /* stiffness: how hard it is pulled toward the target */
  k: 0.08 + (tune / 100) * 0.16,
  /* decay, per frame: how much of the velocity survives */
  d: 0.62 + (tune / 100) * 0.2,
});

/* Units matter. The snap threshold is absolute, so a caller
   works in pixels or in 0..100 — a spring driven over 0..1
   would be "settled" before it had visibly moved. */
function useSpring(target: number, tune = 50, instant = false) {
  const [at, setAt] = useState(target);
  const cur = useRef(target);
  const vel = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (instant) {
      cur.current = target;
      vel.current = 0;
      setAt(target);
      return;
    }
    const { k, d } = springOf(tune);
    let prev = 0;
    const tick = (t: number) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      vel.current += (target - cur.current) * k * dt;
      vel.current *= Math.pow(d, dt);
      cur.current += vel.current * dt;
      if (
        Math.abs(target - cur.current) < 0.02 &&
        Math.abs(vel.current) < 0.02
      ) {
        cur.current = target;
        vel.current = 0;
        setAt(target);
        raf.current = 0;
        return;
      }
      setAt(cur.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
    /* `tune` sits here beside `target` for the reason
       Brightness spells out: the loop closes over it, so
       without it a knob turned mid-flight would do nothing
       until something else restarted the effect. Restarting
       picks up from the refs, so it continues rather than
       snapping. */
  }, [target, tune, instant]);

  return at;
}
function ride(s: number, corner: number, off: number) {
  /* the offset arc is concentric with the card's, so its
     radius is the card's plus the offset — and floored just
     above zero for a square card, where the corner is a
     point and the arc is a quarter turn about it */
  const arc = Math.max(0.001, corner + off);
  const len = (arc * Math.PI) / 2;
  if (s <= 0) {
    /* along the top edge, going left */
    return { x: -corner + s, y: -off, nx: 0, ny: -1 };
  }
  if (s >= len) {
    /* down the right edge */
    return { x: off, y: corner + (s - len), nx: 1, ny: 0 };
  }
  const th = Math.PI / 2 - s / arc;
  return {
    x: -corner + arc * Math.cos(th),
    y: corner - arc * Math.sin(th),
    nx: Math.cos(th),
    ny: -Math.sin(th),
  };
}
type Props = {
  index: number;
  count: number;
  open: boolean;
  reduced: boolean;
  children: ReactNode;
};
export default function CornerAction({
  index,
  count,
  open,
  reduced,
  children,
}: Props) {
  const [extended, setExtended] = useState(false);
  useEffect(() => {
    const delay = (open ? index : count - index - 1) * 0.55 * 90;
    const timer = setTimeout(() => setExtended(open), reduced ? 0 : delay);
    return () => clearTimeout(timer);
  }, [index, count, open, reduced]);
  const u = clamp(useSpring(extended ? 100 : 0, 20, reduced) / 100, 0, 1.4);
  const spot = ride(
    (60 * Math.PI) / 4 + (index - (count - 1) / 2) * 48,
    28,
    32,
  );
  return (
    <span
      className="cin-action"
      style={{
        transform: `translate(${-28 + (spot.x + 28) * u}px, ${28 + (spot.y - 28) * u}px) scale(${0.82 + 0.18 * u})`,
      }}
    >
      {children}
    </span>
  );
}
