const canvas = document.querySelector("#star-canvas");
const context = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let pixelRatio = 1;
let animationFrame = 0;
let resizeFrame = 0;
let lastTime = 0;
let meteorTimer = 0;
let meteors = [];

const random = (min, max) => Math.random() * (max - min) + min;

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

  if (width && nextPixelRatio === pixelRatio && bounds.width === width && bounds.height === height) {
    return;
  }

  width = bounds.width;
  height = bounds.height;
  pixelRatio = nextPixelRatio;

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
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
    restartAnimation();
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
