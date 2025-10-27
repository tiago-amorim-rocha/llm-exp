// game.js - Main game logic, canvas, spawning, and rendering

import { initDebugConsole } from './debugConsole.js';
import { letterBag } from './letterBag.js';
import { PHYSICS, BALL, SPAWN, SELECTION, SCORE, getColorForLetter, getRadiusForLetter } from './config.js';
import { engine, createWalls, createBallBody, createPhysicsInterface, updatePhysics, addToWorld, removeFromWorld } from './physics.js';
import { initSelection, handleTouchStart, handleTouchMove, handleTouchEnd, getSelection, getTouchPosition, isSelectionActive, getSelectedWord } from './selection.js';
import { wordValidator } from './wordValidator.js';
import { scoring } from './scoring.js';

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

  // Detect safe area insets (for iOS notch/Dynamic Island)
  function getSafeAreaTop() {
    // Try to get CSS env variable for safe-area-inset-top
    const testDiv = document.createElement('div');
    testDiv.style.cssText = 'position:fixed;top:env(safe-area-inset-top);pointer-events:none;';
    document.body.appendChild(testDiv);
    const inset = parseInt(getComputedStyle(testDiv).top) || 0;
    document.body.removeChild(testDiv);

    // If no inset detected, check if this looks like an iPhone with notch
    // (safe area needed but env() not supported/working)
    if (inset === 0 && /iPhone/.test(navigator.userAgent)) {
      // Default safe offset for iPhones with notches (44-59px typical)
      return 60;
    }

    return inset;
  }

  const safeAreaTop = getSafeAreaTop();
  console.log(`Safe area top inset: ${safeAreaTop}px`);

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

  // Process valid word - remove balls, return letters to bag, spawn new balls
  function processValidWord(selectedBalls, word) {
    console.log(`Valid word: "${word}" - removing ${selectedBalls.length} balls`);

    // Calculate score and add points
    const points = scoring.calculateScore(word);

    // Calculate center position of selected balls for animation
    const centerX = selectedBalls.reduce((sum, ball) => sum + ball.x, 0) / selectedBalls.length;
    const centerY = selectedBalls.reduce((sum, ball) => sum + ball.y, 0) / selectedBalls.length;

    scoring.addScore(points, centerX, centerY);
    console.log(`+${points} points! Score: ${scoring.getScore()}`);

    // Remove balls from physics world and from balls array
    selectedBalls.forEach(ball => {
      // Remove from Matter.js world
      if (ball.body) {
        removeFromWorld(ball.body);
      }

      // Return letter to bag
      letterBag.return(ball.letter);

      // Remove from balls array
      const index = balls.indexOf(ball);
      if (index > -1) {
        balls.splice(index, 1);
      }
    });

    // Spawn new balls (same amount as removed)
    const numToSpawn = selectedBalls.length;
    for (let i = 0; i < numToSpawn; i++) {
      const letter = letterBag.draw();
      if (!letter) {
        console.warn('Bag is empty, cannot spawn replacement ball');
        break;
      }

      const radius = getRadiusForLetter(letter);
      const color = getColorForLetter(letter);

      // Spawn position: random x, above screen
      const spawnX = radius + Math.random() * (logicalWidth - 2 * radius);
      const spawnY = -SPAWN.ZONE_HEIGHT + Math.random() * SPAWN.ZONE_HEIGHT;

      const newBall = {
        x: spawnX,
        y: spawnY,
        vx: 0,
        vy: SPAWN.INITIAL_VELOCITY,
        radius: radius,
        color: color,
        letter: letter,
      };

      // Create Matter.js body
      newBall.body = createBallBody(newBall.x, newBall.y, newBall.radius);
      Matter.Body.setVelocity(newBall.body, { x: 0, y: SPAWN.INITIAL_VELOCITY });
      newBall.body.ballData = newBall;
      addToWorld(newBall.body);

      balls.push(newBall);
    }

    console.log(`Spawned ${numToSpawn} replacement balls | Bag: ${letterBag.getState().available} available`);
  }

  // Initialize selection system
  initSelection(balls);

  // Touch event handlers
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleTouchStart(x, y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleTouchMove(x, y);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const result = handleTouchEnd();

    // Validate word and process if valid
    if (result && result.word && result.balls.length >= 2) {
      const isValid = wordValidator.isValid(result.word);

      if (isValid) {
        processValidWord(result.balls, result.word);
      } else {
        console.log(`Invalid word: "${result.word}"`);
      }
    }
  }, { passive: false });

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

    // Draw selection overlay
    const selectedBalls = getSelection();
    if (selectedBalls.length > 0) {
      // Draw connecting lines
      if (selectedBalls.length > 1) {
        ctx.strokeStyle = SELECTION.LINE_COLOR;
        ctx.lineWidth = SELECTION.LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(selectedBalls[0].x, selectedBalls[0].y);
        for (let i = 1; i < selectedBalls.length; i++) {
          ctx.lineTo(selectedBalls[i].x, selectedBalls[i].y);
        }
        ctx.stroke();
      }

      // Draw preview line from last selected ball to current touch position
      if (isSelectionActive()) {
        const touchPos = getTouchPosition();
        if (touchPos) {
          ctx.strokeStyle = SELECTION.LINE_COLOR;
          ctx.lineWidth = SELECTION.LINE_WIDTH;
          ctx.globalAlpha = 0.5;
          ctx.lineCap = 'round';

          ctx.beginPath();
          const lastBall = selectedBalls[selectedBalls.length - 1];
          ctx.moveTo(lastBall.x, lastBall.y);
          ctx.lineTo(touchPos.x, touchPos.y);
          ctx.stroke();

          ctx.globalAlpha = 1.0;
        }
      }

      // Highlight selected balls
      selectedBalls.forEach(ball => {
        ctx.strokeStyle = SELECTION.HIGHLIGHT_COLOR;
        ctx.lineWidth = SELECTION.STROKE_WIDTH;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Display selected word (neutral, no validation during selection)
      const word = getSelectedWord();
      if (word) {
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const textWidth = ctx.measureText(word).width;
        const padding = 12;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = 40;
        const boxX = logicalWidth / 2 - boxWidth / 2;
        const boxY = safeAreaTop + 10; // Safe area top + 10px padding

        // Background box (neutral white)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Border (neutral)
        ctx.strokeStyle = SELECTION.HIGHLIGHT_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Text
        ctx.fillStyle = '#000';
        ctx.fillText(word, logicalWidth / 2, boxY + 8);
      }
    }

    // Update and render score animations
    scoring.updateAnimations();
    const animations = scoring.getAnimations();
    animations.forEach(anim => {
      ctx.save();
      ctx.globalAlpha = anim.opacity;
      ctx.font = `${SCORE.ANIMATION_FONT_WEIGHT} ${SCORE.ANIMATION_FONT_SIZE}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = SCORE.ANIMATION_COLOR;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${anim.points}`, anim.x, anim.y);
      ctx.restore();
    });

    // Render score display (top-right corner)
    const currentScore = scoring.getScore();
    const highScore = scoring.getHighScore();

    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    // Current score
    ctx.font = `bold ${SCORE.FONT_SIZE}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = SCORE.COLOR;
    ctx.fillText(`Score: ${currentScore}`, logicalWidth - SCORE.PADDING, safeAreaTop + SCORE.PADDING);

    // High score (below current score)
    ctx.font = `${SCORE.FONT_SIZE_HIGH}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = SCORE.HIGH_SCORE_COLOR;
    ctx.fillText(`Best: ${highScore}`, logicalWidth - SCORE.PADDING, safeAreaTop + SCORE.PADDING + SCORE.FONT_SIZE + 4);

    requestAnimationFrame(draw);
  }
  draw();

  console.log(`Matter.js physics engine initialized. Spawning ${ballsToSpawn.length} balls...`);
  console.log('Game initialized successfully!');
} catch (e) {
  console.error('Game initialization error:', e?.message || String(e));
  if (e?.stack) console.error(e.stack);
}
