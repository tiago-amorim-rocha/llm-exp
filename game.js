// game.js - Main game logic, canvas, spawning, and rendering

import { initDebugConsole } from './debugConsole.js';
import { letterBag } from './letterBag.js';
import { PHYSICS, BALL, SPAWN, getColorForLetter, getRadiusForLetter } from './config.js';
import { engine, createWalls, createBallBody, createPhysicsInterface, updatePhysics, addToWorld } from './physics.js';

// Initialize debug console first
initDebugConsole();

// Game logic (protected by try/catch)
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

  // Initialize canvas dimensions first (without calling resize to avoid TDZ issues)
  const initialDpr = Math.max(1, window.devicePixelRatio || 1);
  const initialVw = Math.round(window.visualViewport?.width || window.innerWidth);
  const initialVh = Math.round(window.visualViewport?.height || window.innerHeight);

  canvas.style.width = initialVw + 'px';
  canvas.style.height = initialVh + 'px';
  canvas.width = Math.floor(initialVw * initialDpr);
  canvas.height = Math.floor(initialVh * initialDpr);
  ctx.setTransform(initialDpr, 0, 0, initialDpr, 0, 0);

  // Create physics walls
  const balls = [];
  const walls = createWalls(logicalWidth, logicalHeight);

  // Expose physics interface to debug console
  createPhysicsInterface(balls, walls);

  // Prepare all ball data to spawn
  const ballsToSpawn = [];
  for (let i = 0; i < BALL.NUM_BALLS; i++) {
    const letter = letterBag.draw();
    if (!letter) {
      console.error('Ran out of letters in bag!');
      break;
    }

    const radius = getRadiusForLetter(letter);

    ballsToSpawn.push({
      letter: letter,
      radius: radius,
      color: getColorForLetter(letter)
    });
  }

  console.log(`Prepared ${ballsToSpawn.length} balls to spawn`);

  // Ball spawning system - spawn balls one at a time from above
  let spawnIndex = 0;
  let lastSpawnTime = 0;
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
    const spawnY = -SPAWN.ZONE_HEIGHT + Math.random() * SPAWN.ZONE_HEIGHT;

    // Check for collision
    if (wouldCollide(spawnX, spawnY, data.radius)) {
      // Collision detected - retry after short delay
      if (!isRetrying) {
        isRetrying = true;
      }
      setTimeout(() => {
        isRetrying = false;
        spawnNextBall();
      }, SPAWN.RETRY_DELAY);
      return;
    }

    // No collision - create and add ball
    const newBall = {
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: SPAWN.INITIAL_VELOCITY,
      radius: data.radius,
      color: data.color,
      letter: data.letter,
    };

    // Create Matter.js body
    newBall.body = createBallBody(newBall.x, newBall.y, newBall.radius);

    // Set initial downward velocity
    Matter.Body.setVelocity(newBall.body, { x: 0, y: SPAWN.INITIAL_VELOCITY });

    newBall.body.ballData = newBall;
    addToWorld(newBall.body);

    balls.push(newBall);
    spawnIndex++;

    // Schedule next spawn
    setTimeout(spawnNextBall, SPAWN.DELAY);
  }

  // Start spawning after a short delay
  setTimeout(spawnNextBall, 500);

  // Main draw loop
  function draw() {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // Update Matter.js physics
    updatePhysics();

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
