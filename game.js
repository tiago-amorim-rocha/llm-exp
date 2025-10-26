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

  // Settings section
  const settings = document.createElement('div');
  Object.assign(settings.style, {
    padding: '10px',
    background: '#1a1a1a',
    borderBottom: '1px solid #333',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    fontSize: '11px',
  });

  const settingsTitle = document.createElement('div');
  settingsTitle.textContent = 'Physics Settings';
  settingsTitle.style.gridColumn = '1 / -1';
  settingsTitle.style.fontWeight = 'bold';
  settingsTitle.style.marginBottom = '4px';
  settings.appendChild(settingsTitle);

  // Helper to create labeled input
  function createInput(label, value, min, max, step) {
    const wrapper = document.createElement('div');
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.display = 'block';
    labelEl.style.marginBottom = '2px';
    labelEl.style.color = '#aaa';

    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    input.min = min;
    input.max = max;
    input.step = step;
    Object.assign(input.style, {
      width: '100%',
      padding: '4px',
      background: '#222',
      color: '#fff',
      border: '1px solid #444',
      borderRadius: '3px',
      fontSize: '11px',
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    return { wrapper, input };
  }

  const gravityInput = createInput('Gravity', '0.3', '0', '2', '0.1');
  const frictionInput = createInput('Friction', '0.995', '0.8', '1', '0.01');
  const bounceInput = createInput('Bounce', '0.9', '0', '1', '0.05');

  settings.appendChild(gravityInput.wrapper);
  settings.appendChild(frictionInput.wrapper);
  settings.appendChild(bounceInput.wrapper);

  // Apply button
  const applyBtn = document.createElement('button');
  applyBtn.textContent = 'Apply Settings';
  Object.assign(applyBtn.style, {
    gridColumn: '1 / -1',
    padding: '6px',
    background: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
    marginTop: '4px',
  });
  settings.appendChild(applyBtn);

  const messages = document.createElement('div');
  Object.assign(messages.style, {
    padding: '10px',
    maxHeight: 'calc(40vh - 40px)',
    overflowY: 'auto',
  });

  container.appendChild(header);
  container.appendChild(settings);
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

  applyBtn.addEventListener('click', () => {
    if (window.gamePhysics) {
      window.gamePhysics.gravity = parseFloat(gravityInput.input.value);
      window.gamePhysics.friction = parseFloat(frictionInput.input.value);
      window.gamePhysics.bounce = parseFloat(bounceInput.input.value);

      const originalText = applyBtn.textContent;
      const originalBg = applyBtn.style.background;
      applyBtn.textContent = 'Applied!';
      applyBtn.style.background = '#4caf50';

      console.log('Physics settings updated:', {
        gravity: window.gamePhysics.gravity,
        friction: window.gamePhysics.friction,
        bounce: window.gamePhysics.bounce,
      });

      setTimeout(() => {
        applyBtn.textContent = originalText;
        applyBtn.style.background = originalBg;
      }, 1500);
    }
  });

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

  // Logical dimensions (fixed at startup - portrait only game)
  const logicalWidth = Math.round(window.visualViewport?.width || window.innerWidth);
  const logicalHeight = Math.round(window.visualViewport?.height || window.innerHeight);

  // Resize canvas (visual only - game world dimensions never change)
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

      // Never reposition balls - game world is fixed
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

  // Utility: get consistent color for a letter
  function getColorForLetter(letter) {
    // Each letter gets a consistent hue based on its position in alphabet
    const charCode = letter.charCodeAt(0) - 65; // A=0, B=1, ..., Z=25
    const hue = (charCode * 360 / 26) % 360; // Distribute evenly across color wheel
    return `hsl(${hue}, 75%, 60%)`;
  }

  // Letter frequency in English (approximate percentages)
  const LETTER_FREQUENCY = {
    'E': 12.70, 'T': 9.06, 'A': 8.17, 'O': 7.51, 'I': 6.97, 'N': 6.75,
    'S': 6.33, 'H': 6.09, 'R': 5.99, 'D': 4.25, 'L': 4.03, 'C': 2.78,
    'U': 2.76, 'M': 2.41, 'W': 2.36, 'F': 2.23, 'G': 2.02, 'Y': 1.97,
    'P': 1.93, 'B': 1.29, 'V': 0.98, 'K': 0.77, 'J': 0.15, 'X': 0.15,
    'Q': 0.10, 'Z': 0.07
  };

  // Utility: random letter (weighted towards common letters)
  function randomLetter() {
    // Common English letter distribution for better word formation
    const letters = 'AAAAAABBCCCDDDDEEEEEEEEEEFFFGGGHHHIIIIIIIIIJKLLLLMMMNNNNNNOOOOOOOOPPQRRRRRRSSSSSSTTTTTTUUUUVVWWXYYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    return { letter, frequency: LETTER_FREQUENCY[letter] };
  }

  // Calculate ball radius based on letter frequency (more frequent = bigger)
  function getRadiusForFrequency(frequency) {
    // Min radius for least frequent letters (Z: 0.07%), Max for most frequent (E: 12.70%)
    const MIN_RADIUS = 30;
    const MAX_RADIUS = 45; // 1.5x larger for frequent letters
    // Direct relationship: higher frequency = larger radius
    const normalizedFrequency = (frequency - 0.07) / (12.70 - 0.07);
    return MIN_RADIUS + (normalizedFrequency * (MAX_RADIUS - MIN_RADIUS));
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

  canvas.style.width = initialVw + 'px';
  canvas.style.height = initialVh + 'px';
  canvas.width = Math.floor(initialVw * initialDpr);
  canvas.height = Math.floor(initialVh * initialDpr);

  // Create multiple balls with non-overlapping positions
  const balls = [];
  const NUM_BALLS = 40;
  const MAX_BALL_RADIUS = 45; // Used for boundary calculations

  for (let i = 0; i < NUM_BALLS; i++) {
    let attempts = 0;
    let newBall;

    // Try to find a non-overlapping position
    do {
      const letterData = randomLetter();
      const radius = getRadiusForFrequency(letterData.frequency);

      newBall = {
        x: radius + Math.random() * (logicalWidth - 2 * radius),
        y: radius + Math.random() * (logicalHeight - 2 * radius),
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        radius: radius,
        color: getColorForLetter(letterData.letter),
        letter: letterData.letter,
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

  // Physics constants (editable via debug console)
  let GRAVITY = 0.3;
  let FRICTION = 0.995;
  let BOUNCE_DAMPING = 0.9;
  const SLEEP_VELOCITY_THRESHOLD = 0.2; // Stop balls moving slower than this
  const SLEEP_TIME_THRESHOLD = 30; // Frames of low velocity before sleeping
  const SEPARATION_SLOP = 0.001; // Tiny buffer to prevent jitter (reduced from 0.01)
  const SEPARATION_PERCENT = 1.0; // Full overlap correction per frame
  const COLLISION_ITERATIONS = 3; // Multiple passes to resolve stacking

  // Initialize sleep properties on balls
  balls.forEach(ball => {
    ball.sleeping = false;
    ball.sleepCounter = 0;
  });

  // Expose physics constants to debug console
  window.gamePhysics = {
    get gravity() { return GRAVITY; },
    set gravity(val) { GRAVITY = val; },
    get friction() { return FRICTION; },
    set friction(val) { FRICTION = val; },
    get bounce() { return BOUNCE_DAMPING; },
    set bounce(val) { BOUNCE_DAMPING = val; },
  };

  function updatePhysics() {
    balls.forEach(ball => {
      // Check if ball should be sleeping
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

      if (speed < SLEEP_VELOCITY_THRESHOLD) {
        ball.sleepCounter++;
        if (ball.sleepCounter > SLEEP_TIME_THRESHOLD) {
          ball.sleeping = true;
          ball.vx = 0;
          ball.vy = 0;
        }
      } else {
        ball.sleepCounter = 0;
        ball.sleeping = false;
      }

      // Skip physics for sleeping balls
      if (ball.sleeping) return;

      // Apply gravity
      ball.vy += GRAVITY;

      // Apply friction
      ball.vx *= FRICTION;
      ball.vy *= FRICTION;

      // Stop very slow movement to prevent jitter
      if (Math.abs(ball.vx) < SLEEP_VELOCITY_THRESHOLD) ball.vx = 0;
      if (Math.abs(ball.vy) < SLEEP_VELOCITY_THRESHOLD) ball.vy = 0;

      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall collisions
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx) * BOUNCE_DAMPING;
        if (Math.abs(ball.vx) < SLEEP_VELOCITY_THRESHOLD) ball.vx = 0;
      }
      if (ball.x + ball.radius > logicalWidth) {
        ball.x = logicalWidth - ball.radius;
        ball.vx = -Math.abs(ball.vx) * BOUNCE_DAMPING;
        if (Math.abs(ball.vx) < SLEEP_VELOCITY_THRESHOLD) ball.vx = 0;
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy) * BOUNCE_DAMPING;
        if (Math.abs(ball.vy) < SLEEP_VELOCITY_THRESHOLD) ball.vy = 0;
      }
      if (ball.y + ball.radius > logicalHeight) {
        ball.y = logicalHeight - ball.radius;
        ball.vy = -Math.abs(ball.vy) * BOUNCE_DAMPING;
        if (Math.abs(ball.vy) < SLEEP_VELOCITY_THRESHOLD) ball.vy = 0;
      }
    });

    // Ball-to-ball collisions - multiple iterations to resolve stacking
    for (let iteration = 0; iteration < COLLISION_ITERATIONS; iteration++) {
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const ball1 = balls[i];
          const ball2 = balls[j];

          const dx = ball2.x - ball1.x;
          const dy = ball2.y - ball1.y;
          const distanceSquared = dx * dx + dy * dy;
          const minDistance = ball1.radius + ball2.radius;
          const minDistanceSquared = minDistance * minDistance;

          // Check if balls are colliding
          if (distanceSquared < minDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);

            // Handle case where balls are exactly on top of each other
            let nx, ny;
            if (distance < 0.001) {
              // Use a random direction to separate
              const angle = Math.random() * Math.PI * 2;
              nx = Math.cos(angle);
              ny = Math.sin(angle);
            } else {
              // Collision normal (unit vector)
              nx = dx / distance;
              ny = dy / distance;
            }

            // Wake up both balls if either is involved in collision
            ball1.sleeping = false;
            ball2.sleeping = false;
            ball1.sleepCounter = 0;
            ball2.sleepCounter = 0;

            // Separate balls using positional correction to prevent overlap
            const overlap = minDistance - distance;

            // Apply slop to reduce jitter on resting contact
            const correctionAmount = Math.max(overlap - SEPARATION_SLOP, 0) * SEPARATION_PERCENT;
            const separateX = correctionAmount * nx / 2;
            const separateY = correctionAmount * ny / 2;

            ball1.x -= separateX;
            ball1.y -= separateY;
            ball2.x += separateX;
            ball2.y += separateY;

            // Only apply velocity impulse on first iteration
            if (iteration === 0) {
              // Relative velocity
              const dvx = ball2.vx - ball1.vx;
              const dvy = ball2.vy - ball1.vy;

              // Relative velocity along collision normal
              const dvn = dvx * nx + dvy * ny;

              // Only resolve if balls are moving towards each other
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
    }
  }

  function draw() {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    updatePhysics();

    // Draw all balls
    balls.forEach(ball => {
      // Draw ball circle
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw letter on ball (font size scales with radius)
      ctx.fillStyle = '#000';
      const fontSize = Math.round(ball.radius * 0.65); // Font size proportional to ball size
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ball.letter, ball.x, ball.y);
    });

    requestAnimationFrame(draw);
  }
  draw();

  console.log(`Physics engine initialized. ${balls.length} balls will bounce with gravity!`);

  console.log('Game initialized successfully!');
} catch (e) {
  console.error('Game initialization error:', e?.message || String(e));
  if (e?.stack) console.error(e.stack);
}
