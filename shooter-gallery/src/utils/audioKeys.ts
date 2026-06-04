export const SFX = {
  shoot:                'sfx_shoot',
  targetHit:            'sfx_target_hit',
  targetMiss:           'sfx_target_miss',
  loseLife:             'sfx_lose_life',
  bossStart:            'sfx_boss_start',
  bossCriticalHit:      'sfx_boss_critical_hit',
  bossCriticalDestroy:  'sfx_boss_critical_destroy',
  bossDefeat:           'sfx_boss_defeat',
  bossTimeout:          'sfx_boss_timeout',
  gameOver:             'sfx_game_over',
} as const;

export const MUSIC = {
  gameplay: 'music_gameplay',
  boss:     'music_boss',
} as const;

export type SfxKey   = (typeof SFX)[keyof typeof SFX];
export type MusicKey = (typeof MUSIC)[keyof typeof MUSIC];

export const AUDIO_MANIFEST = [
  // SFX — expected files: public/assets/audio/sfx/<name>.{mp3,ogg}
  { key: SFX.shoot,               file: 'sfx/shoot',                label: 'Disparo del jugador (click)' },
  { key: SFX.targetHit,           file: 'sfx/target_hit',           label: 'Objetivo destruido (explode)' },
  { key: SFX.targetMiss,          file: 'sfx/target_miss',          label: 'Objetivo expirado sin disparar (expire)' },
  { key: SFX.loseLife,            file: 'sfx/lose_life',            label: 'Jugador pierde una vida' },
  { key: SFX.bossStart,           file: 'sfx/boss_start',           label: 'Inicio de fase boss' },
  { key: SFX.bossCriticalHit,     file: 'sfx/boss_critical_hit',    label: 'Impacto en punto crítico del boss' },
  { key: SFX.bossCriticalDestroy, file: 'sfx/boss_critical_destroy',label: 'Punto crítico del boss destruido' },
  { key: SFX.bossDefeat,          file: 'sfx/boss_defeat',          label: 'Boss derrotado por el jugador' },
  { key: SFX.bossTimeout,         file: 'sfx/boss_timeout',         label: 'Tiempo del boss agotado (jugador recibe daño)' },
  { key: SFX.gameOver,            file: 'sfx/game_over',            label: 'Fin de partida (vidas = 0)' },

  // Música — expected files: public/assets/audio/music/<name>.{mp3,ogg}
  { key: MUSIC.gameplay,          file: 'music/gameplay',            label: 'Música de fondo del juego (loop)' },
  { key: MUSIC.boss,              file: 'music/boss',                label: 'Música tensa durante el boss (loop)' },
] as const;
