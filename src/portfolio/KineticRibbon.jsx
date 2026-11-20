import { useEffect, useRef } from "react";

// Draw a ribbon along a closed spatial curve. Paint its facets back to front.
export default function KineticRibbon({ chapter, reduced }) {
  const canvas = useRef(null);
  const target = useRef(chapter);
  useEffect(() => {
    target.current = chapter;
  }, [chapter]);
  useEffect(() => {
    const el = canvas.current,
      ctx = el.getContext("2d");
    if (!ctx) return;
    let frame,
      visible = false,
      width,
      height,
      angle = 0.4,
      shape = target.current;
    let yaw = 0,
      pitch = 0,
      lean = 0,
      last = 0,
      grab = null;
    function draw(time) {
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      if (!reduced) angle += dt * 0.13;
      shape += (target.current - shape) * (reduced ? 1 : 1 - Math.exp(-7 * dt));
      lean += (pitch - lean) * (1 - Math.exp(-8 * dt));
      ctx.clearRect(0, 0, width, height);
      const size = Math.min(width, height) * 0.198,
        facets = [];
      const spin = angle + yaw;
      function project(t, side) {
        const radius =
          1.45 +
          0.42 * Math.cos(3 * t + shape) +
          side * 0.29 * Math.cos(1.5 * t + shape);
        const x = radius * Math.cos(2 * t),
          y = radius * Math.sin(2 * t);
        const z =
          0.82 * Math.sin(3 * t + shape) +
          side * 0.29 * Math.sin(1.5 * t + shape);
        const a = x * Math.cos(spin) - z * Math.sin(spin),
          b = x * Math.sin(spin) + z * Math.cos(spin);
        const tilt = 0.52 + lean,
          depth = y * Math.sin(tilt) + b * Math.cos(tilt);
        const scale = (size * 4.8) / (4.8 - depth);
        return [
          width / 2 + a * scale,
          height / 2 + (y * Math.cos(tilt) - b * Math.sin(tilt)) * scale,
          depth,
        ];
      }
      for (let i = 0; i < 156; i++) {
        const t = (i * Math.PI) / 78,
          next = ((i + 1) * Math.PI) / 78;
        const pts = [
          project(t, -1),
          project(t, 1),
          project(next, 1),
          project(next, -1),
        ];
        facets.push({ pts, d: pts.reduce((n, v) => n + v[2], 0) / 4, t });
      }
      facets.sort((a, b) => a.d - b.d);
      for (const { pts, d, t } of facets) {
        const light = 43 + 17 * d + 14 * Math.cos(t * 4 + spin);
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fillStyle = `hsl(200 76% ${light}%)`;
        ctx.fill();
        ctx.strokeStyle = "rgba(217,245,255,.64)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      if (visible && !reduced) frame = requestAnimationFrame(draw);
    }
    function refresh() {
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(draw);
    }
    const resize = new ResizeObserver(() => {
      const r = el.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio, 2);
      width = r.width;
      height = r.height;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      refresh();
    });
    resize.observe(el);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      refresh();
    });
    observer.observe(el);
    function down(e) {
      grab = e.clientX;
      el.setPointerCapture(e.pointerId);
    }
    function move(e) {
      if (grab !== null) {
        yaw += (e.clientX - grab) * 0.012;
        grab = e.clientX;
      }
      pitch = (e.offsetY / el.clientHeight - 0.5) * 0.6;
      if (reduced) refresh();
    }
    function up() {
      grab = null;
      pitch = 0;
    }
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("lostpointercapture", up);
    el.addEventListener("pointerleave", up);
    return () => {
      visible = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("lostpointercapture", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [reduced, reduced ? chapter : null]);
  return (
    <canvas
      ref={canvas}
      aria-label="Rotating blue ribbon sculpture"
      role="img"
    />
  );
}
