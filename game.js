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

  // Logical dimensions (updated by resize)
  let logicalWidth = window.innerWidth;
  let logicalHeight = window.innerHeight;

  // Resize canvas
  function resize() {
    try {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const vw = Math.round(window.visualViewport?.width || window.innerWidth);
      const vh = Math.round(window.visualViewport?.height || window.innerHeight);

      // Ensure valid dimensions
      if (!vw || !vh || vw <= 0 || vh <= 0) {
        console.warn('Invalid viewport dimensions:', vw, vh);
        return;
      }

      logicalWidth = vw;
      logicalHeight = vh;

      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (typeof ball !== 'undefined') {
        ball.x = Math.min(Math.max(ball.x, ball.radius), logicalWidth - ball.radius);
        ball.y = Math.min(Math.max(ball.y, ball.radius), logicalHeight - ball.radius);
      }
    } catch (err) {
      console.error('Resize error:', err);
    }
  }
  window.addEventListener('resize', resize);

  // Listen to visualViewport for iOS Safari
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
    window.visualViewport.addEventListener('scroll', resize);
  }

  // Utility: random bright color
  function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 80%, 60%)`;
  }

  // Initialize dimensions first
  resize();

  // Ball state
  const ball = {
    x: logicalWidth / 2,
    y: logicalHeight / 2,
    vx: Math.random() * 4 - 2,
    vy: Math.random() * 4 - 2,
    radius: 80,
    color: randomColor(),
  };

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
    if (ball.x + ball.radius > logicalWidth) {
      ball.x = logicalWidth - ball.radius;
      ball.vx = -Math.abs(ball.vx) * BOUNCE_DAMPING;
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy) * BOUNCE_DAMPING;
    }
    if (ball.y + ball.radius > logicalHeight) {
      ball.y = logicalHeight - ball.radius;
      ball.vy = -Math.abs(ball.vy) * BOUNCE_DAMPING;
      if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
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
    bottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
    transform: 'translateX(-50%)',
    font: '16px system-ui, -apple-system, sans-serif',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#FFFF00',
    color: 'brown',
    cursor: 'pointer',
    touchAction: 'manipulation',
  });
  button.addEventListener('click', () => {
    ball.color = randomColor();
    ball.vy -= 5;
    console.log('Ball color changed and kicked!');
  });
  document.body.appendChild(button);
} catch (e) {
  console.error('Top-level error caught:', e);
  console.error('Error message:', e?.message);
  console.error('Error stack:', e?.stack);
  console.error('Error type:', e?.constructor?.name);
}
