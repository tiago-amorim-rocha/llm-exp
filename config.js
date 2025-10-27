// config.js - All game configuration constants

// ========== Physics Constants ==========
export const PHYSICS = {
  GRAVITY: 1.0,
  FRICTION: 0.15,
  BOUNCE: 0.8,          // Restitution
  AIR_FRICTION: 0.02,   // Air resistance
  BASE_DENSITY: 0.001,  // Base density for mass calculation
  SLOP: 0.05,           // Collision tolerance (reduces jitter)
  SLEEP_THRESHOLD: 60   // Speed threshold for sleeping
};

// ========== Ball Properties ==========
export const BALL = {
  MIN_RADIUS: 30,
  MAX_RADIUS: 45,
  BASE_RADIUS: 37.5,  // Midpoint for density scaling
  NUM_BALLS: 40
};

// ========== Spawning ==========
export const SPAWN = {
  DELAY: 50,              // ms between spawn attempts
  RETRY_DELAY: 17,        // ms to wait if collision detected
  ZONE_HEIGHT: 100,       // Height above screen to spawn
  INITIAL_VELOCITY: 3     // Initial downward velocity
};

// ========== Selection ==========
export const SELECTION = {
  MAX_DISTANCE: 187.5,    // Max distance between balls (2.5 × avg diameter)
  HIGHLIGHT_COLOR: '#FFD700', // Gold color for selected balls
  LINE_COLOR: '#FFD700',  // Color for connecting lines
  LINE_WIDTH: 3,          // Width of connecting lines
  STROKE_WIDTH: 4         // Width of highlight stroke
};

// ========== Letter Bag Distribution (Optimized for word formation, 100 total) ==========
export const LETTER_BAG_DISTRIBUTION = {
  // Vowels - 32 total (32%) - reduced from Scrabble's 42% for better word variety
  'A': 7, 'E': 9, 'I': 7, 'O': 6, 'U': 3,
  // Common consonants - 44 total (increased for better word formation)
  'N': 7, 'R': 7, 'T': 7, 'L': 5, 'S': 5, 'D': 5, 'G': 4, 'H': 2, 'Y': 2,
  // Moderate consonants - 21 total
  'B': 3, 'C': 3, 'M': 3, 'P': 3, 'F': 2, 'W': 2, 'V': 2, 'K': 1, 'J': 1, 'X': 1,
  // Rare consonants - 3 total
  'Q': 1, 'Z': 2
};

// ========== Utilities ==========

// Get consistent color for a letter
export function getColorForLetter(letter) {
  return '#888888'; // Gray for all balls
}

// Calculate ball radius based on letter bag count (more in bag = bigger ball)
export function getRadiusForLetter(letter) {
  const bagCount = LETTER_BAG_DISTRIBUTION[letter];
  const minCount = 1;  // Minimum bag count (Q, K, J, X)
  const maxCount = 12; // Maximum bag count (E)
  const normalizedCount = (bagCount - minCount) / (maxCount - minCount);
  return BALL.MIN_RADIUS + (normalizedCount * (BALL.MAX_RADIUS - BALL.MIN_RADIUS));
}
