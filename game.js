// game.js

// Setup canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Resize canvas to fill window
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Keep ball within bounds after resize
  if (ball) {
    ball.x = Math.min(Math.max(ball.x, ball.radius), canvas.width - ball.radius);
    ball.y = Math.min(Math.max(ball.y, ball.radius), canvas.height - ball.radius);
  }
}
window.addEventListener('resize', resize);
resize();

// Ball state
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: Math.random() * 4 - 2,  // Random initial velocity -2 to 2
  vy: Math.random() * 4 - 2,
  radius: 80,
  color: randomColor(),
};

// Physics constants
const GRAVITY = 0.3;
const FRICTION = 0.99;
const BOUNCE_DAMPING = 0.85;

// Utility: random bright color
function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 60%)`;
}

// Physics update
function updatePhysics() {
  // Apply gravity
  ball.vy += GRAVITY;

  // Apply friction
  ball.vx *= FRICTION;
  ball.vy *= FRICTION;

  // Update position
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision detection and bouncing
  // Left wall
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx) * BOUNCE_DAMPING;
  }

  // Right wall
  if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.vx = -Math.abs(ball.vx) * BOUNCE_DAMPING;
  }

  // Top wall
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy) * BOUNCE_DAMPING;
  }

  // Bottom wall
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.vy = -Math.abs(ball.vy) * BOUNCE_DAMPING;

    // Stop very small bounces (ball at rest)
    if (Math.abs(ball.vy) < 0.5) {
      ball.vy = 0;
    }
  }
}

// Draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update physics
  updatePhysics();

  // Draw ball
  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}
draw();

console.log('Physics engine initialized. Ball will bounce with gravity!');

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
  color: 'brown',
  cursor: 'pointer',
});
button.addEventListener('click', () => {
  ball.color = randomColor();
  // Give the ball a little kick upward when color changes
  ball.vy -= 5;
  console.log('Ball color changed and kicked!');
});
document.body.appendChild(button);

// ========== Debug Console ==========
const debugConsole = (() => {
  // Create console container
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    maxHeight: '40vh',
    background: 'rgba(0, 0, 0, 0.95)',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '12px',
    overflowY: 'auto',
    borderTop: '2px solid #333',
    display: 'none',
    zIndex: '10000',
  });

  // Create header with title and buttons
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '8px 10px',
    background: '#1a1a1a',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const title = document.createElement('span');
  title.textContent = 'Debug Console';
  title.style.fontWeight = 'bold';

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  Object.assign(clearBtn.style, {
    padding: '4px 8px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
  });

  header.appendChild(title);
  header.appendChild(clearBtn);

  // Create messages container
  const messages = document.createElement('div');
  Object.assign(messages.style, {
    padding: '10px',
    maxHeight: 'calc(40vh - 40px)',
    overflowY: 'auto',
  });

  container.appendChild(header);
  container.appendChild(messages);
  document.body.appendChild(container);

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '🐛';
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: '#333',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: '10001',
  });
  document.body.appendChild(toggleBtn);

  let isVisible = false;

  // Toggle console visibility
  toggleBtn.addEventListener('click', () => {
    isVisible = !isVisible;
    container.style.display = isVisible ? 'block' : 'none';
    toggleBtn.textContent = isVisible ? '✕' : '🐛';
  });

  // Clear messages
  clearBtn.addEventListener('click', () => {
    messages.innerHTML = '';
  });

  // Add message to console
  function addMessage(type, args) {
    const msg = document.createElement('div');
    Object.assign(msg.style, {
      padding: '4px 0',
      borderBottom: '1px solid #222',
    });

    const timestamp = new Date().toLocaleTimeString();
    const typeColors = {
      log: '#aaa',
      warn: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    };

    const typeSpan = document.createElement('span');
    typeSpan.textContent = `[${timestamp}] [${type.toUpperCase()}] `;
    typeSpan.style.color = typeColors[type] || '#aaa';

    const contentSpan = document.createElement('span');
    contentSpan.textContent = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    msg.appendChild(typeSpan);
    msg.appendChild(contentSpan);
    messages.appendChild(msg);

    // Auto-scroll to bottom
    messages.scrollTop = messages.scrollHeight;
  }

  // Intercept console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  console.log = (...args) => {
    originalLog.apply(console, args);
    addMessage('log', args);
  };

  console.warn = (...args) => {
    originalWarn.apply(console, args);
    addMessage('warn', args);
  };

  console.error = (...args) => {
    originalError.apply(console, args);
    addMessage('error', args);
  };

  console.info = (...args) => {
    originalInfo.apply(console, args);
    addMessage('info', args);
  };

  // Catch uncaught errors
  window.addEventListener('error', (event) => {
    addMessage('error', [`Uncaught: ${event.message}`, `at ${event.filename}:${event.lineno}:${event.colno}`]);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    addMessage('error', [`Unhandled Promise Rejection: ${event.reason}`]);
  });

  // Log initial message
  console.log('Debug console initialized. Click the 🐛 button to toggle.');

  return { container, toggleBtn };
})();
