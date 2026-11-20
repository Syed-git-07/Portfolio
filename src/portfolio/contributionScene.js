const radians = Math.PI / 180;
const month = new Intl.DateTimeFormat("en", {
  month: "short",
  timeZone: "UTC",
});
const clamp = (n) => Math.max(0, Math.min(1, n));
function phase(t, start, end) {
  const u = clamp((t - start) / (end - start));
  return u * u * (3 - 2 * u);
}
function shade(hex, light) {
  const value = parseInt(hex.slice(1), 16);
  return (
    "rgb(" +
    [value >> 16, (value >> 8) & 255, value & 255]
      .map((n) => Math.round(n * light))
      .join(",") +
    ")"
  );
}
function face(points) {
  const path = new Path2D();
  path.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) path.lineTo(...points[i]);
  path.closePath();
  return path;
}

// Orthographic projection of cuboids in week, weekday and height coordinates.
export function contributionScene(canvas, days) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const offset = new Date(days[0].date).getUTCDay();
  const weeks = Math.ceil((days.length + offset) / 7);
  const maximum = Math.log1p(Math.max(1, ...days.map((day) => day.count)));
  const cells = days.map((day, i) => {
    const col = Math.floor((i + offset) / 7),
      row = (i + offset) % 7;
    const color = day.level === 0 ? "#e1e8e4" : day.color;
    return {
      col,
      row,
      i,
      color,
      front: shade(color, 0.81),
      side: shade(color, 0.62),
      peak: (7.6 * Math.log1p(day.count)) / maximum,
    };
  });
  const months = cells.filter(({ i }) => days[i].date.endsWith("-01"));
  // Both visible side faces face increasing coordinates. This order remains
  // valid throughout the camera orbit, including for taller neighboring bars.
  const ordered = [...cells].sort((a, b) => a.col + a.row - b.col - b.row);
  let width = 0,
    height = 0,
    ratio = 1,
    hits = [];
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }
  function draw(progress, selected) {
    if (!width || !height) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const orbit = phase(progress, 0.13, 0.89);
    const yaw = orbit * 27 * radians,
      tilt = orbit * 56 * radians;
    const cy = Math.cos(yaw),
      sy = Math.sin(yaw),
      ct = Math.cos(tilt),
      st = Math.sin(tilt);
    const spanX = weeks * cy + 7 * sy,
      spanY = (weeks * sy + 7 * cy) * ct + 7.6 * st;
    const labelGutter = width >= 580 ? 29 * (1 - orbit) : 0;
    const scale = Math.min(
      (width - 12 - labelGutter) / spanX,
      (height - 30) / spanY,
    );
    const project = (x, z, h) => [
      (width + labelGutter) / 2 +
        ((x - weeks / 2) * cy - (z - 3.5) * sy) * scale,
      height / 2 +
        ((x - weeks / 2) * sy * ct + (z - 3.5) * cy * ct + (3.8 - h) * st) *
          scale,
    ];
    ctx.font = "11px system-ui";
    ctx.fillStyle = "#56615c";
    ctx.globalAlpha = 1 - phase(progress, 0.15, 0.48);
    months.forEach(({ col, i }, j) => {
      if (width < 580 && j % 3 !== 0) return;
      const [x, y] = project(col, 0, 0);
      ctx.fillText(month.format(new Date(days[i].date)), x, y - 8);
    });
    if (labelGutter > 1) {
      ["Mon", "Wed", "Fri"].forEach((label, i) => {
        const [x, y] = project(0, 1.7 + i * 2, 0);
        ctx.fillText(label, x - 28, y);
      });
    }
    ctx.globalAlpha = 1;
    hits = [];
    for (const c of ordered) {
      const l = c.col + 0.09,
        r = c.col + 0.91,
        b = c.row + 0.09,
        f = c.row + 0.91;
      const lift =
        c.peak *
        phase(
          progress,
          0.24 + (0.07 * c.col) / weeks,
          0.74 + (0.07 * c.col) / weeks,
        );
      const a = project(l, b, lift),
        e = project(r, b, lift),
        g = project(r, f, lift),
        j = project(l, f, lift);
      const silhouette = new Path2D();
      if (lift > 0.001) {
        const foot = project(r, f, 0);
        const side = face([e, g, foot, project(r, b, 0)]),
          front = face([j, g, foot, project(l, f, 0)]);
        ctx.fillStyle = c.side;
        ctx.fill(side);
        ctx.fillStyle = c.front;
        ctx.fill(front);
        silhouette.addPath(side);
        silhouette.addPath(front);
      }
      const top = face([a, e, g, j]);
      ctx.fillStyle = c.color;
      ctx.fill(top);
      silhouette.addPath(top);
      if (c.i === selected) {
        ctx.strokeStyle = "#152c28";
        ctx.lineWidth = 1.5;
        ctx.stroke(top);
      }
      hits.push({ index: c.i, path: silhouette });
    }
  }
  function hit(x, y) {
    for (let i = hits.length - 1; i >= 0; i--)
      if (ctx.isPointInPath(hits[i].path, x * ratio, y * ratio))
        return hits[i].index;
    return -1;
  }
  resize();
  return { draw, resize, hit };
}
