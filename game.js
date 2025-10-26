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
  const frictionInput = createInput('Friction', '0.01', '0', '0.1', '0.01');
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

  // Ball spawning system - balls drop from above the screen
  const balls = [];
  const NUM_BALLS = 40;
  const MAX_BALL_RADIUS = 45; // Used for boundary calculations

  // Prepare all ball data to spawn
  const ballsToSpawn = [];
  for (let i = 0; i < NUM_BALLS; i++) {
    const letter = letterBag.draw();
    if (!letter) {
      console.error('Ran out of letters in bag!');
      break;
    }

    const frequency = LETTER_FREQUENCY[letter];
    const radius = getRadiusForFrequency(frequency);

    ballsToSpawn.push({
      letter: letter,
      frequency: frequency,
      radius: radius,
      color: getColorForLetter(letter)
    });
  }

  console.log(`Prepared ${ballsToSpawn.length} balls to spawn`);

  // Now safe to call resize (after all variables are initialized)
  ctx.setTransform(initialDpr, 0, 0, initialDpr, 0, 0);

  // ========== Matter.js Physics Engine ==========

  // Create Matter.js module aliases
  const Engine = Matter.Engine;
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  const Body = Matter.Body;

  // Create engine
  const engine = Engine.create({
    gravity: { x: 0, y: 0.3 }
  });

  // Physics constants (editable via debug console)
  let GRAVITY = 0.3;
  let FRICTION = 0.01;
  let BOUNCE = 0.9;

  // Create walls (NO TOP WALL - balls spawn from above)
  const wallOptions = {
    isStatic: true,
    restitution: BOUNCE,
    friction: 0
  };

  const walls = [
    // Top wall removed - balls drop from above!
    Bodies.rectangle(logicalWidth / 2, logicalHeight + 25, logicalWidth, 50, wallOptions), // Bottom
    Bodies.rectangle(-25, logicalHeight / 2, 50, logicalHeight, wallOptions), // Left
    Bodies.rectangle(logicalWidth + 25, logicalHeight / 2, 50, logicalHeight, wallOptions) // Right
  ];

  World.add(engine.world, walls);

  // Ball spawning system - spawn balls one at a time from above
  let spawnIndex = 0;
  let lastSpawnTime = 0;
  const SPAWN_DELAY = 50; // ms between spawn attempts (3x faster)
  const SPAWN_RETRY_DELAY = 17; // ms to wait before retrying if collision detected (3x faster)
  const SPAWN_ZONE_HEIGHT = 200; // Height above screen to spawn balls
  let isRetrying = false;

  // Check if a position would collide with existing balls
  function wouldCollide(x, y, radius) {
    for (const ball of balls) {
      const dx = x - ball.x;
      const dy = y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < radius + ball.radius) {
        return true;
      }
    }
    return false;
  }

  // Spawn the next ball
  function spawnNextBall() {
    if (spawnIndex >= ballsToSpawn.length) {
      // All balls spawned - log final state
      if (spawnIndex === ballsToSpawn.length) {
        const bagState = letterBag.getState();
        console.log(`All ${balls.length} balls spawned! | Bag: ${bagState.available} available, ${bagState.inPlay} in play, ${bagState.total} total`);

        // Log letter distribution
        const letterCounts = {};
        balls.forEach(ball => {
          letterCounts[ball.letter] = (letterCounts[ball.letter] || 0) + 1;
        });
        const vowelCount = balls.filter(b => 'AEIOU'.includes(b.letter)).length;
        console.log('Letter distribution:', Object.entries(letterCounts).sort().map(([l, c]) => `${l}:${c}`).join(' '));
        console.log(`Vowels: ${vowelCount}/${balls.length} (${Math.round(vowelCount/balls.length*100)}%)`);

        spawnIndex++; // Prevent logging multiple times
      }
      return;
    }

    const data = ballsToSpawn[spawnIndex];

    // Spawn position: random x, above screen
    const spawnX = data.radius + Math.random() * (logicalWidth - 2 * data.radius);
    const spawnY = -SPAWN_ZONE_HEIGHT + Math.random() * SPAWN_ZONE_HEIGHT;

    // Check for collision
    if (wouldCollide(spawnX, spawnY, data.radius)) {
      // Collision detected - retry after short delay
      if (!isRetrying) {
        isRetrying = true;
      }
      setTimeout(() => {
        isRetrying = false;
        spawnNextBall();
      }, SPAWN_RETRY_DELAY);
      return;
    }

    // No collision - create and add ball
    const newBall = {
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      radius: data.radius,
      color: data.color,
      letter: data.letter,
    };

    // Create Matter.js body
    newBall.body = Bodies.circle(newBall.x, newBall.y, newBall.radius, {
      restitution: BOUNCE,
      friction: FRICTION,
      density: 0.001,
      frictionAir: 0.005
    });

    newBall.body.ballData = newBall;
    World.add(engine.world, newBall.body);

    balls.push(newBall);
    spawnIndex++;

    // Schedule next spawn
    setTimeout(spawnNextBall, SPAWN_DELAY);
  }

  // Start spawning after a short delay
  setTimeout(spawnNextBall, 500);

  // Expose physics constants to debug console
  window.gamePhysics = {
    get gravity() { return GRAVITY; },
    set gravity(val) {
      GRAVITY = val;
      engine.gravity.y = val;
    },
    get friction() { return FRICTION; },
    set friction(val) {
      FRICTION = val;
      balls.forEach(ball => {
        ball.body.friction = val;
      });
    },
    get bounce() { return BOUNCE; },
    set bounce(val) {
      BOUNCE = val;
      balls.forEach(ball => {
        ball.body.restitution = val;
      });
      walls.forEach(wall => {
        wall.restitution = val;
      });
    },
  };

  function draw() {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // Update Matter.js physics
    Engine.update(engine, 1000 / 60);

    // Sync ball positions from Matter.js bodies
    balls.forEach(ball => {
      ball.x = ball.body.position.x;
      ball.y = ball.body.position.y;
      ball.vx = ball.body.velocity.x;
      ball.vy = ball.body.velocity.y;

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

  console.log(`Matter.js physics engine initialized. Spawning ${ballsToSpawn.length} balls...`);

  console.log('Game initialized successfully!');
} catch (e) {
  console.error('Game initialization error:', e?.message || String(e));
  if (e?.stack) console.error(e.stack);
}
