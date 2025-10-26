// game.js

// ========== Debug Console (runs first, always loads) ==========
const debugConsole = (() => {
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

  const messages = document.createElement('div');
  Object.assign(messages.style, {
    padding: '10px',
    maxHeight: 'calc(40vh - 40px)',
    overflowY: 'auto',
  });

  container.appendChild(header);
  container.appendChild(messages);
  document.body.appendChild(container);

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
  toggleBtn.addEventListener('click', () => {
    isVisible = !isVisible;
    container.style.display = isVisible ? 'block' : 'none';
    toggleBtn.textContent = isVisible ? '✕' : '🐛';
  });
  clearBtn.addEventListener('click', () => (messages.innerHTML = ''));

  function addMessage(type, args) {
    const msg = document.createElement('div');
    Object.assign(msg.style, {
      padding: '4px 0',
      borderBottom: '1px solid #222',
    });

    const timestamp = new Date().toLocaleTimeString();
    const typeColors = { log: '#aaa', warn: '#ff9800', error: '#f44336', info: '#2196f3' };

    const typeSpan = document.createElement('span');
    typeSpan.textContent = `[${timestamp}] [${type.toUpperCase()}] `;
    typeSpan.style.color = typeColors[type] || '#aaa';

    const contentSpan = document.createElement('span');
    contentSpan.textContent = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
      .join(' ');

    msg.appendChild(typeSpan);
    msg.appendChild(contentSpan);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  const orig = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  console.log = (...a) => (orig.log(...a), addMessage('log', a));
  console.warn = (...a) => (orig.warn(...a), addMessage('warn', a));
  console.error = (...a) => (orig.error(...a), addMessage('error', a));
  console.info = (...a) => (orig.info(...a), addMessage('info', a));

  window.addEventListener('error', (e) =>
    addMessage('error', [`Uncaught: ${e.message}`, `at ${e.filename}:${e.lineno}:${e.colno}`])
  );
  window.addEventListener('unhandledrejection', (e) =>
    addMessage('error', [`Unhandled Promise Rejection: ${e.reason}`])
  );

  console.log('Debug console initialized. Click 🐛 to toggle.');
  return { container, toggleBtn };
})();

// ========== Game Logic (protected by try/catch) ==========
try {
  // Setup canvas
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // Resize canvas
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (typeof ball !== 'undefined') {
      ball.x = Math.min(Math.max(ball.x, ball.radius), canvas.width - ball.radius);
      ball.y = Math.min(Math.max(ball.y, ball.radius), canvas.height - ball.radius);
    }
  }
  window.addEventListener('resize', resize);

  // Utility: random bright color
  function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 80%, 60%)`;
  }

  // Ball state
  const ball = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: Math.random() * 4 - 2,
    vy: Math.random() * 4 - 2,
    radius: 80,
    color: randomColor(),
  };

  // Now safe to resize
  resize();

  // Physics constants
  const GRAVITY = 0.3;
  const FRICTION = 0.99;
  const BOUNCE_DAMPING = 0.85;

  function updatePhysics() {
    ball.vy += GRAVITY;
    ball.vx *= FRICTION;
    ball.vy *= FRICTION;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx) * BOUNCE_DAMPING;
    }
    if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius;
      ball.vx = -Math.abs(ball.vx) * BOUNCE_DAMPING;
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy) * BOUNCE_DAMPING;
    }
    if (ball.y + ball.radius > canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.vy = -Math.abs(ball.vy) * BOUNCE_DAMPING;
      if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePhysics();
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
    font: '16px system-ui
