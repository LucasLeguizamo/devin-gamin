export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const ASSET_KEYS = {
  background: 'bg_pixel_art',
  weaponArm: 'weapon_arm',
  bossVideo: 'boss_video',
  enemies: {
    openai: 'enemy_openai',
    grok: 'enemy_grok',
    gemini: 'enemy_gemini',
    kimi: 'enemy_kimi',
  },
};

export const ENEMY_ASSET_KEYS = [
  ASSET_KEYS.enemies.openai,
  ASSET_KEYS.enemies.grok,
  ASSET_KEYS.enemies.gemini,
  ASSET_KEYS.enemies.kimi,
];

export const GAME_COLORS = {
  background: 0x081018,
  panel: 0x0f1c2a,
  accent: 0x2de2e6,
  warning: 0xff7f50,
  danger: 0xff4b4b,
  success: 0x6ef9a5,
  text: '#d8e8ff',
};

export const PLAYER = {
  maxLives: 3,
  fireCooldownMs: 120,
};

export const TARGET = {
  minRadius: 18,
  maxRadius: 46,
  minSpeed: 70,
  maxSpeed: 220,
  ttlMs: 2800,
};

export const DIFFICULTY = {
  baseSpawnMs: 1200,
  minSpawnMs: 340,
  spawnReductionPerKill: 22,
  speedIncreasePerKill: 1.8,
  sizeReductionEveryKills: 8,
  sizeReductionFactor: 0.96,
};

export const BOSS = {
  triggerEveryKills: 10,
  baseHitPointsPerCritical: 4,
  criticalPointsCount: 5,
  incomingDamageIfTimeout: 1,
  phaseDurationMs: 26000,
};
