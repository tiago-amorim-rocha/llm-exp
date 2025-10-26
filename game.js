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

  const buttonContainer = document.createElement('div');
  Object.assign(buttonContainer.style, {
    display: 'flex',
    gap: '8px',
  });

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy';
  Object.assign(copyBtn.style, {
    padding: '4px 8px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
  });

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

  buttonContainer.appendChild(copyBtn);
  buttonContainer.appendChild(clearBtn);

  header.appendChild(title);
  header.appendChild(buttonContainer);

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

  copyBtn.addEventListener('click', async () => {
    const text = messages.innerText;
    try {
      await navigator.clipboard.writeText(text);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.style.background = '#4caf50';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '#333';
      }, 2000);
    } catch (err) {
      copyBtn.textContent = 'Failed';
      copyBtn.style.background = '#f44336';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.style.background = '#333';
      }, 2000);
      console.error('Copy failed:', err);
    }
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
      const physicalWidth = Math.floor(vw * dpr);
      const physicalHeight = Math.floor(vh * dpr);
      canvas.width = physicalWidth;
      canvas.height = physicalHeight;

      // Check if context is valid before transform
      if (!ctx) {
        console.error('Canvas context is null or undefined');
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (typeof balls !== 'undefined') {
        balls.forEach(ball => {
          ball.x = Math.min(Math.max(ball.x, ball.radius), logicalWidth - ball.radius);
          ball.y = Math.min(Math.max(ball.y, ball.radius), logicalHeight - ball.radius);
        });
      }
    } catch (err) {
      console.error('Resize error:', err?.message || String(err));
      if (err?.stack) console.error(err.stack);
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

  // Check if two balls overlap
  function ballsOverlap(ball1, ball2) {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (ball1.radius + ball2.radius);
  }

  // Initialize canvas dimensions first (without calling resize to avoid TDZ issues)
  const initialDpr = Math.max(1, window.devicePixelRatio || 1);
  const initialVw = Math.round(window.visualViewport?.width || window.innerWidth);
  const initialVh = Math.round(window.visualViewport?.height || window.innerHeight);

  logicalWidth = initialVw;
  logicalHeight = initialVh;

  canvas.style.width = initialVw + 'px';
  canvas.style.height = initialVh + 'px';
  canvas.width = Math.floor(initialVw * initialDpr);
  canvas.height = Math.floor(initialVh * initialDpr);

  // Create multiple balls with non-overlapping positions
  const balls = [];
  const NUM_BALLS = 5;
  const BALL_RADIUS = 50;

  for (let i = 0; i < NUM_BALLS; i++) {
    let attempts = 0;
    let newBall;

    // Try to find a non-overlapping position
    do {
      newBall = {
        x: BALL_RADIUS + Math.random() * (logicalWidth - 2 * BALL_RADIUS),
        y: BALL_RADIUS + Math.random() * (logicalHeight - 2 * BALL_RADIUS),
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        radius: BALL_RADIUS,
        color: randomColor(),
      };
      attempts++;
    } while (balls.some(ball => ballsOverlap(newBall, ball)) && attempts < 100);

    // Only add if we found a valid position
    if (attempts < 100) {
      balls.push(newBall);
    }
  }

  console.log(`Created ${balls.length} balls`);

  // Now safe to call resize (after all variables are initialized)
  ctx.setTransform(initialDpr, 0, 0, initialDpr, 0, 0);

  // Physics constants
  const GRAVITY = 0.3;
  const FRICTION = 0.99;
  const BOUNCE_DAMPING = 0.85;

  function updatePhysics() {
    balls.forEach(ball => {
      ball.vy += GRAVITY;
      ball.vx *= FRICTION;
      ball.vy *= FRICTION;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall collisions
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
    });

    // Ball-to-ball collisions
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const ball1 = balls[i];
        const ball2 = balls[j];

        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = ball1.radius + ball2.radius;

        // Check if balls are colliding
        if (distance < minDistance) {
          // Collision normal (unit vector)
          const nx = dx / distance;
          const ny = dy / distance;

          // Separate balls so they're just touching
          const overlap = minDistance - distance;
          const separateX = (overlap / 2) * nx;
          const separateY = (overlap / 2) * ny;

          ball1.x -= separateX;
          ball1.y -= separateY;
          ball2.x += separateX;
          ball2.y += separateY;

          // Relative velocity
          const dvx = ball2.vx - ball1.vx;
          const dvy = ball2.vy - ball1.vy;

          // Relative velocity along collision normal
          const dvn = dvx * nx + dvy * ny;

          // Don't resolve if balls are moving apart
          if (dvn < 0) {
            // Apply impulse (elastic collision, equal mass)
            const impulse = dvn * BOUNCE_DAMPING;

            ball1.vx += impulse * nx;
            ball1.vy += impulse * ny;
            ball2.vx -= impulse * nx;
            ball2.vy -= impulse * ny;
          }
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    updatePhysics();

    // Draw all balls
    balls.forEach(ball => {
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();

  console.log(`Physics engine initialized. ${balls.length} balls will bounce with gravity!`);

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
    if (balls.length > 0) {
      const randomBall = balls[Math.floor(Math.random() * balls.length)];
      randomBall.color = randomColor();
      randomBall.vy -= 5;
      console.log('Random ball color changed and kicked!');
    }
  });
  document.body.appendChild(button);

  console.log('Game initialized successfully!');
} catch (e) {
  console.error('Game initialization error:', e?.message || String(e));
  if (e?.stack) console.error(e.stack);
}
