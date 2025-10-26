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

  // Letter bag with Scrabble-like distribution
  // TOTAL: 100 letters that can be drawn and returned
  const LETTER_BAG_DISTRIBUTION = {
    // Vowels - 42 total (42%)
    'A': 9, 'E': 12, 'I': 9, 'O': 8, 'U': 4,
    // Common consonants - 37 total
    'N': 6, 'R': 6, 'T': 6, 'L': 4, 'S': 4, 'D': 4, 'G': 3, 'H': 2, 'Y': 2,
    // Moderate consonants - 18 total
    'B': 2, 'C': 2, 'M': 2, 'P': 2, 'F': 2, 'W': 2, 'V': 2, 'K': 1, 'J': 1, 'X': 1,
    // Rare consonants - 3 total
    'Q': 1, 'Z': 2
  };

  // Initialize the letter bag (persistent game state)
  const letterBag = {
    available: [], // Letters currently in bag
    inPlay: [],    // Letters currently on board

    // Initialize bag with all letters
    init() {
      this.available = [];
      this.inPlay = [];

      // Build the bag from distribution
      for (const [letter, count] of Object.entries(LETTER_BAG_DISTRIBUTION)) {
        for (let i = 0; i < count; i++) {
          this.available.push(letter);
        }
      }

      // Shuffle the bag
      for (let i = this.available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.available[i], this.available[j]] = [this.available[j], this.available[i]];
      }

      console.log(`Letter bag initialized with ${this.available.length} letters`);
    },

    // Draw a letter from the bag
    draw() {
      if (this.available.length === 0) {
        console.warn('Letter bag is empty!');
        return null;
      }

      const letter = this.available.pop();
      this.inPlay.push(letter);
      return letter;
    },

    // Return a letter to the bag
    return(letter) {
      const index = this.inPlay.indexOf(letter);
      if (index > -1) {
        this.inPlay.splice(index, 1);
        this.available.push(letter);

        // Re-shuffle to maintain randomness
        const randomIndex = Math.floor(Math.random() * this.available.length);
        [this.available[this.available.length - 1], this.available[randomIndex]] =
          [this.available[randomIndex], this.available[this.available.length - 1]];
      } else {
        console.warn(`Letter ${letter} not found in play!`);
      }
    },

    // Get current state
    getState() {
      return {
        available: this.available.length,
        inPlay: this.inPlay.length,
        total: this.available.length + this.inPlay.length
      };
    }
  };

  // Initialize the bag
  letterBag.init();

  // Expose letterBag globally for future use
  // Usage for word removal (future):
  //   1. When removing a ball: letterBag.return(ball.letter)
  //   2. When spawning a ball: const letter = letterBag.draw()
  //   3. Check bag state: letterBag.getState()
  window.letterBag = letterBag;

  // Utility: random letter (weighted towards common letters) - DEPRECATED but kept for compatibility
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
    // Draw a letter from the bag
    const letter = letterBag.draw();
    if (!letter) {
      console.error('Ran out of letters in bag!');
      break;
    }

    const frequency = LETTER_FREQUENCY[letter];
    const radius = getRadiusForFrequency(frequency);

    let attempts = 0;
    let newBall;

    // Try to find a non-overlapping position
    do {
      newBall = {
        x: radius + Math.random() * (logicalWidth - 2 * radius),
        y: radius + Math.random() * (logicalHeight - 2 * radius),
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        radius: radius,
        color: getColorForLetter(letter),
        letter: letter,
      };
      attempts++;
    } while (balls.some(ball => ballsOverlap(newBall, ball)) && attempts < 100);

    // Only add if we found a valid position
    if (attempts < 100) {
      balls.push(newBall);
    } else {
      // Failed to place ball, return letter to bag
      letterBag.return(letter);
      console.warn(`Could not place ball with letter ${letter}`);
    }
  }

  const bagState = letterBag.getState();
  console.log(`Created ${balls.length} balls | Bag: ${bagState.available} available, ${bagState.inPlay} in play, ${bagState.total} total`);

  // Log letter distribution for debugging
  const letterCounts = {};
  balls.forEach(ball => {
    letterCounts[ball.letter] = (letterCounts[ball.letter] || 0) + 1;
  });
  const vowelCount = balls.filter(b => 'AEIOU'.includes(b.letter)).length;
  console.log('Letter distribution:', Object.entries(letterCounts).sort().map(([l, c]) => `${l}:${c}`).join(' '));
  console.log(`Vowels: ${vowelCount}/${balls.length} (${Math.round(vowelCount/balls.length*100)}%)`);

  // Now safe to call resize (after all variables are initialized)
  ctx.setTransform(initialDpr, 0, 0, initialDpr, 0, 0);

  // ========== Advanced Physics Engine (Box2D-style Sequential Impulse Solver) ==========

  // Physics constants (editable via debug console)
  let GRAVITY = 0.3;
  let FRICTION = 0.995;
  let BOUNCE_DAMPING = 0.7; // Restitution coefficient (0=inelastic, 1=elastic)

  const SLEEP_VELOCITY_THRESHOLD = 0.15; // Stop balls moving slower than this
  const SLEEP_TIME_THRESHOLD = 60; // Frames of low velocity before sleeping
  const SLEEP_ANGULAR_VELOCITY = 0.1; // Not used for circles, but kept for API

  // Solver parameters
  const VELOCITY_ITERATIONS = 8; // Sequential impulse solver iterations
  const POSITION_ITERATIONS = 3; // Position correction iterations
  const SUB_STEPS = 2; // Physics sub-steps per frame

  // Contact parameters
  const ALLOWED_PENETRATION = 0.05; // Slop for collision tolerance (larger for stability)
  const BAUMGARTE_FACTOR = 0.2; // Position correction factor (0-1, lower = softer)
  const CONTACT_THRESHOLD = 0.02; // Distance threshold for contact persistence

  // Initialize physics properties on balls
  balls.forEach((ball, index) => {
    ball.id = index; // Unique identifier for contact caching
    ball.invMass = 1.0; // Inverse mass (1/mass, equal mass for all balls)
    ball.sleeping = false;
    ball.sleepCounter = 0;
  });

  // Contact class - represents a collision between two balls
  class Contact {
    constructor(ballA, ballB) {
      this.ballA = ballA;
      this.ballB = ballB;
      this.normalX = 0;
      this.normalY = 0;
      this.penetration = 0;
      this.normalImpulse = 0; // Accumulated impulse for warm starting
      this.tangentImpulse = 0;
      this.bias = 0; // Baumgarte stabilization bias
      this.massNormal = 0; // Effective mass in normal direction
      this.massTangent = 0; // Effective mass in tangent direction
    }

    // Generate unique key for this contact pair
    getKey() {
      const idA = this.ballA.id;
      const idB = this.ballB.id;
      return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
    }

    // Detect collision and calculate manifold
    detect() {
      const dx = this.ballB.x - this.ballA.x;
      const dy = this.ballB.y - this.ballA.y;
      const distanceSquared = dx * dx + dy * dy;
      const radiusSum = this.ballA.radius + this.ballB.radius;

      // Check if colliding
      if (distanceSquared >= radiusSum * radiusSum) {
        return false; // No collision
      }

      const distance = Math.sqrt(distanceSquared);

      // Handle coincident case
      if (distance < 0.0001) {
        this.penetration = this.ballA.radius;
        this.normalX = 1;
        this.normalY = 0;
        return true;
      }

      // Calculate collision normal (from A to B)
      this.normalX = dx / distance;
      this.normalY = dy / distance;
      this.penetration = radiusSum - distance;

      return true;
    }

    // Pre-solve: calculate effective masses and apply warm starting
    preSolve(dt) {
      // Calculate relative velocity
      const dvx = this.ballB.vx - this.ballA.vx;
      const dvy = this.ballB.vy - this.ballA.vy;

      // Relative velocity in normal direction
      const vn = dvx * this.normalX + dvy * this.normalY;

      // Calculate Baumgarte bias for position correction
      this.bias = -(BAUMGARTE_FACTOR / dt) * Math.max(this.penetration - ALLOWED_PENETRATION, 0);

      // Calculate effective mass in normal direction
      // For equal mass circles: effectiveMass = 1 / (invMassA + invMassB) = 1 / (1 + 1) = 0.5
      const invMassSum = this.ballA.invMass + this.ballB.invMass;
      this.massNormal = invMassSum > 0 ? 1.0 / invMassSum : 0;

      // Tangent direction (perpendicular to normal)
      const tangentX = -this.normalY;
      const tangentY = this.normalX;
      this.massTangent = this.massNormal; // Same for circles

      // Warm starting - apply accumulated impulse from previous frame
      // This dramatically improves convergence for stacked objects
      const impulseX = this.normalImpulse * this.normalX + this.tangentImpulse * tangentX;
      const impulseY = this.normalImpulse * this.normalY + this.tangentImpulse * tangentY;

      this.ballA.vx -= impulseX * this.ballA.invMass;
      this.ballA.vy -= impulseY * this.ballA.invMass;
      this.ballB.vx += impulseX * this.ballB.invMass;
      this.ballB.vy += impulseY * this.ballB.invMass;
    }

    // Solve velocity constraints (sequential impulse)
    solveVelocity() {
      // Calculate relative velocity
      const dvx = this.ballB.vx - this.ballA.vx;
      const dvy = this.ballB.vy - this.ballA.vy;

      // === Normal impulse (push balls apart) ===
      const vn = dvx * this.normalX + dvy * this.normalY;

      // Calculate impulse magnitude (with restitution and bias)
      let lambda = this.massNormal * (-(vn - this.bias) - BOUNCE_DAMPING * vn);

      // Clamp accumulated impulse (cannot pull objects together)
      const oldImpulse = this.normalImpulse;
      this.normalImpulse = Math.max(oldImpulse + lambda, 0);
      lambda = this.normalImpulse - oldImpulse;

      // Apply normal impulse
      const impulseX = lambda * this.normalX;
      const impulseY = lambda * this.normalY;

      this.ballA.vx -= impulseX * this.ballA.invMass;
      this.ballA.vy -= impulseY * this.ballA.invMass;
      this.ballB.vx += impulseX * this.ballB.invMass;
      this.ballB.vy += impulseY * this.ballB.invMass;

      // === Tangent impulse (friction - optional, disabled for bouncy feel) ===
      // Uncomment below to add friction damping
      /*
      const tangentX = -this.normalY;
      const tangentY = this.normalX;
      const vt = dvx * tangentX + dvy * tangentY;

      let frictionLambda = -this.massTangent * vt * 0.3; // Friction coefficient

      // Coulomb friction: clamp to friction cone
      const maxFriction = Math.abs(this.normalImpulse * 0.3);
      const oldTangentImpulse = this.tangentImpulse;
      this.tangentImpulse = Math.max(-maxFriction, Math.min(oldTangentImpulse + frictionLambda, maxFriction));
      frictionLambda = this.tangentImpulse - oldTangentImpulse;

      const frictionImpulseX = frictionLambda * tangentX;
      const frictionImpulseY = frictionLambda * tangentY;

      this.ballA.vx -= frictionImpulseX * this.ballA.invMass;
      this.ballA.vy -= frictionImpulseY * this.ballA.invMass;
      this.ballB.vx += frictionImpulseX * this.ballB.invMass;
      this.ballB.vy += frictionImpulseY * this.ballB.invMass;
      */
    }

    // Solve position constraints (Non-linear Gauss-Seidel)
    solvePosition() {
      // Recalculate penetration (positions may have changed)
      const dx = this.ballB.x - this.ballA.x;
      const dy = this.ballB.y - this.ballA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.0001) return; // Degenerate case

      const radiusSum = this.ballA.radius + this.ballB.radius;
      const penetration = radiusSum - distance;

      // Only correct if penetration exceeds slop
      if (penetration <= ALLOWED_PENETRATION) return;

      // Normal direction
      const nx = dx / distance;
      const ny = dy / distance;

      // Calculate position correction
      const correction = (penetration - ALLOWED_PENETRATION) / (this.ballA.invMass + this.ballB.invMass);
      const correctionX = correction * nx;
      const correctionY = correction * ny;

      // Apply position correction
      this.ballA.x -= correctionX * this.ballA.invMass;
      this.ballA.y -= correctionY * this.ballA.invMass;
      this.ballB.x += correctionX * this.ballB.invMass;
      this.ballB.y += correctionY * this.ballB.invMass;
    }
  }

  // Contact manager - handles contact persistence and caching
  const contactManager = {
    contacts: new Map(), // Current frame contacts
    prevContacts: new Map(), // Previous frame contacts (for warm starting)

    // Clear current contacts and prepare for new frame
    beginFrame() {
      this.prevContacts = this.contacts;
      this.contacts = new Map();
    },

    // Generate or retrieve contact
    getContact(ballA, ballB) {
      const contact = new Contact(ballA, ballB);
      const key = contact.getKey();

      // Check if contact exists from previous frame
      const prevContact = this.prevContacts.get(key);
      if (prevContact) {
        // Warm start with previous impulses
        contact.normalImpulse = prevContact.normalImpulse;
        contact.tangentImpulse = prevContact.tangentImpulse;
      }

      this.contacts.set(key, contact);
      return contact;
    },

    // Get all active contacts
    getAllContacts() {
      return Array.from(this.contacts.values());
    }
  };

  // Expose physics constants to debug console
  window.gamePhysics = {
    get gravity() { return GRAVITY; },
    set gravity(val) { GRAVITY = val; },
    get friction() { return FRICTION; },
    set friction(val) { FRICTION = val; },
    get bounce() { return BOUNCE_DAMPING; },
    set bounce(val) { BOUNCE_DAMPING = val; },
  };

  // Main physics step
  function updatePhysics(dt = 1.0) {
    // Integrate forces and velocities
    balls.forEach(ball => {
      // Check sleep state
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

      if (ball.sleeping) return;

      // Apply gravity
      ball.vy += GRAVITY * dt;

      // Apply air resistance
      ball.vx *= Math.pow(FRICTION, dt);
      ball.vy *= Math.pow(FRICTION, dt);

      // Integrate velocity to position
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Wall collisions with restitution
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx) * BOUNCE_DAMPING;
        ball.sleepCounter = 0;
      }
      if (ball.x + ball.radius > logicalWidth) {
        ball.x = logicalWidth - ball.radius;
        ball.vx = -Math.abs(ball.vx) * BOUNCE_DAMPING;
        ball.sleepCounter = 0;
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy) * BOUNCE_DAMPING;
        ball.sleepCounter = 0;
      }
      if (ball.y + ball.radius > logicalHeight) {
        ball.y = logicalHeight - ball.radius;
        ball.vy = -Math.abs(ball.vy) * BOUNCE_DAMPING;
        ball.sleepCounter = 0;
      }
    });

    // === Collision Detection ===
    contactManager.beginFrame();

    // Broad phase - detect all collisions
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const contact = contactManager.getContact(balls[i], balls[j]);

        if (contact.detect()) {
          // Wake up both balls
          balls[i].sleeping = false;
          balls[j].sleeping = false;
          balls[i].sleepCounter = 0;
          balls[j].sleepCounter = 0;
        } else {
          // Remove non-colliding contact
          contactManager.contacts.delete(contact.getKey());
        }
      }
    }

    const contacts = contactManager.getAllContacts();

    // === Pre-solve (calculate effective masses, warm start) ===
    contacts.forEach(contact => contact.preSolve(dt));

    // === Velocity solver (sequential impulse) ===
    for (let i = 0; i < VELOCITY_ITERATIONS; i++) {
      contacts.forEach(contact => contact.solveVelocity());
    }

    // === Position solver (non-linear Gauss-Seidel) ===
    for (let i = 0; i < POSITION_ITERATIONS; i++) {
      contacts.forEach(contact => contact.solvePosition());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // Sub-stepping: run physics multiple times per frame for stability
    const subDt = 1.0 / SUB_STEPS;
    for (let step = 0; step < SUB_STEPS; step++) {
      updatePhysics(subDt);
    }

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

  console.log(`Advanced physics engine initialized (Box2D-style Sequential Impulse with ${VELOCITY_ITERATIONS} velocity iterations, ${POSITION_ITERATIONS} position iterations, ${SUB_STEPS} sub-steps). ${balls.length} balls ready!`);

  console.log('Game initialized successfully!');
} catch (e) {
  console.error('Game initialization error:', e?.message || String(e));
  if (e?.stack) console.error(e.stack);
}
