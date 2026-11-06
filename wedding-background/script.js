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
let stars = [];
let meteors = [];

const random = (min, max) => Math.random() * (max - min) + min;

function createStar() {
  return {
    x: random(0, width),
    y: random(0, height * 0.72),
    radius: random(0.35, 1.45),
    alpha: random(0.18, 0.9),
    phase: random(0, Math.PI * 2),
    speed: random(0.0012, 0.0035),
  };
}

function createMeteor() {
  const travel = random(140, 300);

  meteors.push({
    x: random(-width * 0.05, width * 0.72),
    y: random(-40, height * 0.3),
    length: travel,
    speed: random(620, 980),
    alpha: random(0.65, 1),
    life: 0,
    duration: random(0.7, 1.15),
  });
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const starCount = Math.min(150, Math.max(45, Math.round((width * height) / 13000)));
  stars = Array.from({ length: starCount }, createStar);
}

function drawStars(time) {
  for (const star of stars) {
    const flicker = 0.55 + Math.sin(time * star.speed + star.phase) * 0.45;
    const alpha = star.alpha * flicker;

    context.beginPath();
    context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();

    if (star.radius > 1.1) {
      context.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
      context.lineWidth = 0.55;
      context.beginPath();
      context.moveTo(star.x - star.radius * 3, star.y);
      context.lineTo(star.x + star.radius * 3, star.y);
      context.moveTo(star.x, star.y - star.radius * 3);
      context.lineTo(star.x, star.y + star.radius * 3);
      context.stroke();
    }
  }
}

function drawMeteors(deltaTime) {
  meteors = meteors.filter((meteor) => {
    meteor.life += deltaTime;
    meteor.x += meteor.speed * deltaTime;
    meteor.y += meteor.speed * 0.58 * deltaTime;

    const progress = meteor.life / meteor.duration;
    const opacity = Math.sin(Math.min(progress, 1) * Math.PI) * meteor.alpha;
    const tailX = meteor.x - meteor.length;
    const tailY = meteor.y - meteor.length * 0.58;
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

    return progress < 1 && meteor.x < width + meteor.length;
  });
}

function render(time) {
  const deltaTime = Math.min((time - lastTime) / 1000 || 0, 0.05);
  lastTime = time;
  meteorTimer -= deltaTime;

  context.clearRect(0, 0, width, height);
  drawStars(time);

  if (reduceMotion.matches) {
    return;
  }

  if (meteorTimer <= 0) {
    createMeteor();
    meteorTimer = random(1.2, 3.2);
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
