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
  const horizon = 0.755;

  if (top) {
    const normalizedX = Math.random() < 0.18 ? Math.random() : focusedRandom();
    const distanceFromCenter = Math.abs(normalizedX - 0.5) * 2;
    const focus = 1 - distanceFromCenter;
    const band = 0.105 + distanceFromCenter * 0.09;
    const verticalNoise = (focusedRandom() - 0.5) * 0.12;

    return {
      x: normalizedX * width,
      y: clamp(band + verticalNoise, 0.008, 0.29) * height,
      radius: random(0.35, 1.25) + Math.pow(focus, 2) * random(0.15, 1.35),
      alpha: random(0.38, 0.82) + focus * random(0.04, 0.18),
      phase: random(0, Math.PI * 2),
      speed: random(0.0008, 0.0028),
      flare: Math.random() < 0.025 + focus * 0.045,
      glow: focus > 0.62 && Math.random() < 0.12,
    };
  }

  const floorDepth = Math.pow(depth, 1.35);
  const spread = 0.035 + floorDepth * 0.925;
  const x = width * 0.5 + random(-0.5, 0.5) * width * spread;
  const bottomInset = Math.min(12, height * 0.014);
  const floorHeight = height * (1 - horizon) - bottomInset;
  const y = height * horizon + Math.pow(floorDepth, 1.45) * floorHeight;

  return {
    x,
    y,
    radius: random(0.3, 0.9) + Math.pow(floorDepth, 1.7) * random(0.45, 3.2),
    alpha: random(0.42, 0.8) + floorDepth * random(0.06, 0.2),
    phase: random(0, Math.PI * 2),
    speed: random(0.0008, 0.0028),
    flare: Math.random() < 0.025 + floorDepth * 0.035,
    glow: floorDepth > 0.58 && Math.random() < 0.1,
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
  if (width && Math.abs(bounds.width - width) < 8 && Math.abs(bounds.height - height) < 8) {
    return;
  }

  width = bounds.width;
  height = bounds.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  staticCanvas.width = canvas.width;
  staticCanvas.height = canvas.height;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  staticContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const areaScale = (width * height) / (1100 * 800);
  const density = Math.max(0.32, Math.min(1.5, areaScale));
  const topCount = Math.round(1800 * density);
  const bottomCount = Math.round(1400 * density);
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
  for (const star of backdropStars) {
    drawStar(staticContext, star, star.alpha * 0.82);
  }
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
