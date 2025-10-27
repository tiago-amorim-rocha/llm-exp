// config.js - All game configuration constants

// ========== Physics Constants ==========
export const PHYSICS = {
  GRAVITY: 0.5,
  FRICTION: 0.15,
  BOUNCE: 0.5,          // Restitution
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

// ========== Letter Frequency (English) ==========
export const LETTER_FREQUENCY = {
  'E': 12.70, 'T': 9.06, 'A': 8.17, 'O': 7.51, 'I': 6.97, 'N': 6.75,
  'S': 6.33, 'H': 6.09, 'R': 5.99, 'D': 4.25, 'L': 4.03, 'C': 2.78,
  'U': 2.76, 'M': 2.41, 'W': 2.36, 'F': 2.23, 'G': 2.02, 'Y': 1.97,
  'P': 1.93, 'B': 1.29, 'V': 0.98, 'K': 0.77, 'J': 0.15, 'X': 0.15,
  'Q': 0.10, 'Z': 0.07
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

// Calculate ball radius based on letter frequency
export function getRadiusForFrequency(frequency) {
  const normalizedFrequency = (frequency - 0.07) / (12.70 - 0.07);
  return BALL.MIN_RADIUS + (normalizedFrequency * (BALL.MAX_RADIUS - BALL.MIN_RADIUS));
}
