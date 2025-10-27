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

// ========== Letter Bag Distribution (Scrabble-like, 100 total) ==========
export const LETTER_BAG_DISTRIBUTION = {
  // Vowels - 42 total (42%)
  'A': 9, 'E': 12, 'I': 9, 'O': 8, 'U': 4,
  // Common consonants - 37 total
  'N': 6, 'R': 6, 'T': 6, 'L': 4, 'S': 4, 'D': 4, 'G': 3, 'H': 2, 'Y': 2,
  // Moderate consonants - 18 total
  'B': 2, 'C': 2, 'M': 2, 'P': 2, 'F': 2, 'W': 2, 'V': 2, 'K': 1, 'J': 1, 'X': 1,
  // Rare consonants - 3 total
  'Q': 1, 'Z': 2
};

// ========== Utilities ==========

// Get consistent color for a letter (HSL based on alphabet position)
export function getColorForLetter(letter) {
  const charCode = letter.charCodeAt(0) - 65; // A=0, B=1, ..., Z=25
  const hue = (charCode * 360 / 26) % 360;
  return `hsl(${hue}, 75%, 60%)`;
}

// Calculate ball radius based on letter bag count (more in bag = bigger ball)
export function getRadiusForLetter(letter) {
  const bagCount = LETTER_BAG_DISTRIBUTION[letter];
  const minCount = 1;  // Minimum bag count (Q, K, J, X)
  const maxCount = 12; // Maximum bag count (E)
  const normalizedCount = (bagCount - minCount) / (maxCount - minCount);
  return BALL.MIN_RADIUS + (normalizedCount * (BALL.MAX_RADIUS - BALL.MIN_RADIUS));
}
