const canvas = document.querySelector("#star-canvas");
const context = canvas.getContext("2d");
const staticCanvas = document.createElement("canvas");
const staticContext = staticCanvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let pixelRatio = 1;
let animationFrame = 0;
let resizeFrame = 0;
let lastTime = 0;
let meteorTimer = 0;
let backdropStars = [];
let twinkleStars = [];
let meteors = [];

const random = (min, max) => Math.random() * (max - min) + min;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const focusedRandom = () => (Math.random() + Math.random() + Math.random()) / 3;

function createBackdropStar(zone) {
  const top = zone === "top";
  const depth = Math.random();
  const horizon = 0.72;

  if (top) {
    const normalizedX = Math.random();
    const distanceFromCenter = Math.abs(normalizedX - 0.5) * 2;
    const focus = 1 - distanceFromCenter;
    const band = 0.115 + distanceFromCenter * 0.045;
    const verticalNoise = (focusedRandom() - 0.5) * 0.2;
    const sizeRoll = Math.random();
    const radius = sizeRoll > 0.965
      ? random(1.8, 3.1)
      : sizeRoll > 0.76
        ? random(0.8, 1.65)
        : random(0.24, 0.82);

    return {
      x: normalizedX * width,
      y: clamp(band + verticalNoise, 0.004, 0.275) * height,
      radius: radius + Math.pow(focus, 3) * random(0.05, 0.45),
      alpha: clamp(random(0.42, 0.92) + Math.pow(focus, 2) * 0.2, 0, 1),
      phase: random(0, Math.PI * 2),
      speed: random(0.0008, 0.0028),
      flare: Math.random() < 0.018 + focus * 0.035,
      glow: (radius > 1.5 && Math.random() < 0.28) || (focus > 0.7 && Math.random() < 0.06),
    };
  }

  const floorDepth = Math.pow(depth, 1.65);
  const edgeInset = Math.min(18, width * 0.025);
  const x = random(edgeInset, width - edgeInset);
  const normalizedX = x / width;
  const distanceFromCenter = Math.abs(normalizedX - 0.5) * 2;
  const focus = 1 - distanceFromCenter;
  const bottomInset = Math.min(26, height * 0.03);
  const floorHeight = height * (1 - horizon) - bottomInset;
  const y = height * horizon + floorDepth * floorHeight;
  const sizeRoll = Math.random();
  const baseRadius = sizeRoll > 0.94 ? random(1.1, 2.1) : random(0.22, 0.9);

  return {
    x,
    y,
    radius: baseRadius + Math.pow(floorDepth, 1.8) * random(0.5, 6.8),
    alpha: clamp(random(0.44, 0.86) + floorDepth * 0.12 + Math.pow(focus, 3) * 0.16, 0, 1),
    phase: random(0, Math.PI * 2),
    speed: random(0.0008, 0.0028),
    flare: Math.random() < 0.012 + floorDepth * 0.025,
    glow: floorDepth > 0.58 && Math.random() < 0.16,
  };
}

function createMeteor() {
  const length = random(90, 190);
  const speed = random(360, 620);

  meteors.push({
    x: random(width * 0.06, width * 0.94),
    y: -length,
    length,
    speed,
    alpha: random(0.65, 1),
    life: 0,
    duration: (height + length * 2) / speed,
  });
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  if (!bounds.width || !bounds.height) {
    return;
  }

  if (
    width
    && nextPixelRatio === pixelRatio
    && Math.abs(bounds.width - width) < 8
    && Math.abs(bounds.height - height) < 8
  ) {
    return;
  }

  width = bounds.width;
  height = bounds.height;
  pixelRatio = nextPixelRatio;

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  staticCanvas.width = canvas.width;
  staticCanvas.height = canvas.height;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  staticContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const areaScale = Math.sqrt((width * height) / (1100 * 800));
  const density = Math.max(0.3, Math.min(1.3, areaScale));
  const topCount = Math.round(4200 * density);
  const bottomCount = Math.round(3600 * density);
  backdropStars = [
    ...Array.from({ length: topCount }, () => createBackdropStar("top")),
    ...Array.from({ length: bottomCount }, () => createBackdropStar("bottom")),
  ];
  twinkleStars = backdropStars.filter(() => Math.random() < 0.045).slice(0, 90);
  renderStaticStars();
}

function drawStar(target, star, alpha) {
  if (star.glow) {
    target.shadowColor = "rgba(235, 242, 255, 0.9)";
    target.shadowBlur = star.radius * 3.5;
  }

  target.beginPath();
  target.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  target.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
  target.fill();

  if (star.flare && star.radius > 1) {
    target.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
    target.lineWidth = 0.55;
    target.beginPath();
    target.moveTo(star.x - star.radius * 4.5, star.y);
    target.lineTo(star.x + star.radius * 4.5, star.y);
    target.moveTo(star.x, star.y - star.radius * 4.5);
    target.lineTo(star.x, star.y + star.radius * 4.5);
    target.stroke();
  }

  target.shadowBlur = 0;
}

function renderStaticStars() {
  staticContext.clearRect(0, 0, width, height);
  drawLightBeams();
  for (const star of backdropStars) {
    drawStar(staticContext, star, star.alpha * 0.82);
  }
}

function drawLightBeams() {
  const sources = [0.09, 0.22, 0.37, 0.5, 0.63, 0.78, 0.91];
  staticContext.save();
  staticContext.globalCompositeOperation = "screen";

  for (const source of sources) {
    const sourceX = width * source;
    const beamWidth = width * (source === 0.5 ? 0.035 : 0.022);
    const gradient = staticContext.createLinearGradient(0, height * 0.11, 0, height * 0.72);
    gradient.addColorStop(0, "rgba(210, 225, 248, 0.12)");
    gradient.addColorStop(0.36, "rgba(190, 210, 240, 0.055)");
    gradient.addColorStop(1, "rgba(160, 190, 225, 0)");

    staticContext.fillStyle = gradient;
    staticContext.beginPath();
    staticContext.moveTo(sourceX - 2, height * 0.1);
    staticContext.lineTo(sourceX + 2, height * 0.1);
    staticContext.lineTo(sourceX + beamWidth, height * 0.72);
    staticContext.lineTo(sourceX - beamWidth, height * 0.72);
    staticContext.closePath();
    staticContext.fill();
  }

  staticContext.restore();
}

function drawTwinkles(time) {
  for (const star of twinkleStars) {
    const flicker = 0.18 + (Math.sin(time * star.speed + star.phase) + 1) * 0.16;
    drawStar(context, star, star.alpha * flicker);
  }
}

function drawMeteors(deltaTime) {
  meteors = meteors.filter((meteor) => {
    meteor.life += deltaTime;
    meteor.y += meteor.speed * deltaTime;

    const progress = meteor.life / meteor.duration;
    const opacity = Math.sin(Math.min(progress, 1) * Math.PI) * meteor.alpha;
    const tailX = meteor.x;
    const tailY = meteor.y - meteor.length;
    const gradient = context.createLinearGradient(tailX, tailY, meteor.x, meteor.y);

    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.78, `rgba(220, 232, 255, ${opacity * 0.45})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);

    context.lineCap = "round";
    context.lineWidth = 1.5;
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(tailX, tailY);
    context.lineTo(meteor.x, meteor.y);
    context.stroke();

    context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.beginPath();
    context.arc(meteor.x, meteor.y, 1.8, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    return progress < 1 && meteor.y < height + meteor.length;
  });
}

function render(time) {
  const deltaTime = Math.min((time - lastTime) / 1000 || 0, 0.05);
  lastTime = time;
  meteorTimer -= deltaTime;

  context.clearRect(0, 0, width, height);
  context.drawImage(staticCanvas, 0, 0, width, height);
  drawTwinkles(time);

  if (reduceMotion.matches) {
    return;
  }

  if (meteorTimer <= 0) {
    createMeteor();
    meteorTimer = random(0.8, 2.1);
  }

  drawMeteors(deltaTime);
  animationFrame = requestAnimationFrame(render);
}

function restartAnimation() {
  cancelAnimationFrame(animationFrame);
  meteors = [];
  meteorTimer = 0;
  lastTime = 0;
  animationFrame = requestAnimationFrame(render);
}

function scheduleResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    resizeCanvas();
    meteors = [];
  });
}

function handleVisibilityChange() {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    return;
  }

  restartAnimation();
}

resizeCanvas();
restartAnimation();

window.addEventListener("resize", scheduleResize, { passive: true });
document.addEventListener("visibilitychange", handleVisibilityChange);
reduceMotion.addEventListener("change", restartAnimation);
