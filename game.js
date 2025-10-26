// game.js

// Setup canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Resize canvas to fill window
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Circle state
let circleColor = randomColor();

// Utility: random bright color
function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 60%)`;
}

// Draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = circleColor;
  const r = 80;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
  ctx.fill();
  requestAnimationFrame(draw);
}
draw();

// Button logic
const button = document.createElement('button');
button.textContent = 'Change Color';
Object.assign(button.style, {
  position: 'fixed',
  left: '50%',
  bottom: '40px',
  transform: 'translateX(-50%)',
  font: '16px system-ui, -apple-system, sans-serif',
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#FFFF00',
  color: '#fff',
  cursor: 'pointer',
});
button.addEventListener('click', () => {
  circleColor = randomColor();
});
document.body.appendChild(button);
