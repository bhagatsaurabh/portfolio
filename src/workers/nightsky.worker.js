const clamp = (value, min, max) =>
  Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
const denorm = (value, min, max) => clamp(value * (max - min) + min, min, max);
const rand = (min, max) => denorm(Math.random(), min, max);

let params = {
  starCount: 0,
  minStarRadius: 0,
  minStarBrightness: 0,
  bandWidthFactor: 0,
  angle: 0,
};

self.onmessage = async (e) => {
  const { width, height, dpr } = e.data;
  const { ctx, offCanvas } = createOffCanvas(width, height, dpr);

  setParams();
  renderNightSky(ctx, width, height);

  const bitmap = offCanvas.transferToImageBitmap();
  self.postMessage(bitmap, [bitmap]);
};

function setParams() {
  params = {
    starCount: rand(1500, 2000),
    minStarRadius: 0.25,
    minStarBrightness: 1,
    bandWidthFactor: rand(0.05, 0.15),
    angle: rand(-0.5, 0.5) * (Math.PI / 2),
  };
}
function createOffCanvas(width, height, dpr) {
  const dprWidth = width * dpr;
  const dprHeight = height * dpr;
  const offCanvas = new OffscreenCanvas(dprWidth, dprHeight);
  const ctx = offCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, offCanvas };
}
function renderNightSky(ctx, width, height) {
  drawBackground(ctx, width, height);
  drawStarField(ctx, width, height, params.starCount);
}
function drawBackground(ctx, width, height) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "#000000");
  g.addColorStop(0.4, "rgba(28, 41, 84, 0.65)");
  g.addColorStop(0.75, "rgba(28, 70, 84, 0.65)");
  g.addColorStop(1, "rgba(28, 84, 67, 0.65)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}
function drawStarField(ctx, width, height, count) {
  const cx = width / 2;
  const cy = height / 2;
  const bandWidth = height * params.bandWidthFactor;

  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 5;

  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const x = rand(0, width);
    const y = rand(0, height);
    const rCoord = rotate(x, y, cx, cy, params.angle);
    const density = galaxyDensity(rCoord.y, bandWidth);
    const base = 0.15;
    const noise = pseudoNoise(x, y) * 0.3;
    const p = base + density * (0.7 + noise);

    if (rand(0, 1) > p) continue;

    drawStar(ctx, x, y);
    placed++;
  }
}
function drawStar(ctx, x, y) {
  const r = params.minStarRadius + Math.pow(rand(0, 1), 3) * 1.2;
  const alpha = params.minStarBrightness + (r / 1.5) * 0.5;
  const color = starColor();

  ctx.fillStyle = `rgba(${color}, ${alpha})`;
  if (r < 0.5) {
    ctx.fillRect(x, y, 1, 1);
  } else {
    if (r > 1.0) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${color}, ${alpha})`;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

const starColor = () => {
  const t = rand(0, 1);
  if (t < 0.75) return "255, 255, 255"; // white
  if (t < 0.85) return "255, 226, 147"; // yellow
  if (t < 0.95) return "141, 172, 255"; // blue
  return "255, 190, 190"; // red
};
const rotate = (x, y, cx, cy, ang) => {
  const cosA = Math.cos(ang);
  const sinA = Math.sin(ang);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: dx * cosA - dy * sinA,
    y: dx * sinA + dy * cosA,
  };
};
const galaxyDensity = (y, bandWidth) => {
  const d = y / bandWidth;
  return Math.exp(-d * d);
};
const pseudoNoise = (x, y) => {
  return Math.sin(x * 0.01) * Math.sin(y * 0.01);
};
