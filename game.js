// game.js
import { createWorld } from './physics.js';

// Canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize); resize();

// World
const { M, world, player } = createWorld();

// Fit world bounds to screen
function updateBounds() {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);
  world.bodies.forEach(b => {
    if (b.isStatic) {
      if (b.label.includes('Rectangle Body')) {
        // crude static walls rebuilder if size changes
      }
    }
  });
}
updateBounds();

// Input
let touchStart = null;
function pointerPos(e) {
  const p = e.touches ? e.touches[0] : e;
  return { x: p.clientX, y: p.clientY };
}
window.addEventListener('pointerdown', e => {
  touchStart = pointerPos(e);
});
window.addEventListener('pointerup', e => {
  if (!touchStart) return;
  const end = pointerPos(e);
  const dx = end.x - touchStart.x;
  const dy = end.y - touchStart.y;
  // fling vector
  const mag = Math.hypot(dx, dy) || 1;
  const scale = 0.03; // tweak for feel
  M.Body.applyForce(player, player.position, { x: (dx / mag) * scale, y: (dy / mag) * scale });
  touchStart = null;
});

// Render
function drawBody(b) {
  ctx.save();
  ctx.translate(b.position.x, b.position.y);
  ctx.rotate(b.angle);
  ctx.beginPath();
  if (b.circleRadius) {
    ctx.arc(0, 0, b.circleRadius, 0, Math.PI * 2);
  } else {
    const verts = b.vertices;
    ctx.moveTo(verts[0].x - b.position.x, verts[0].y - b.position.y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x - b.position.x, verts[i].y - b.position.y);
    }
    ctx.closePath();
  }
  ctx.fillStyle = b === player ? '#9cf' : '#e0e0e0';
  ctx.fill();
  ctx.restore();
}

function loop() {
  // clear
  ctx.fillStyle = '#0f1115';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw all bodies
  for (const b of world.bodies) drawBody(b);

  // draw Hello World text in center
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);
  ctx.save();
  ctx.fillStyle = '#ffff00';
  ctx.font = '48px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Hello World', w / 2, h / 2);
  ctx.restore();

  requestAnimationFrame(loop);
}
loop();
