import Phaser from 'phaser';
import { ASSET_KEYS } from '../utils/constants';
import { AUDIO_MANIFEST } from '../utils/audioKeys';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    this.load.image(ASSET_KEYS.background, 'assets/bg/pixel-art.png');
    this.load.image(ASSET_KEYS.weaponArm, 'assets/bg/arm.png');
    this.load.video(ASSET_KEYS.bossVideo, 'assets/bg/boss/boss.mp4', true);
    this.load.image(ASSET_KEYS.enemies.openai, 'assets/bg/enemies/openai_logo_icon_248315-2.png');
    this.load.image(ASSET_KEYS.enemies.grok, 'assets/bg/enemies/Grok-icon.svg.png');
    this.load.image(ASSET_KEYS.enemies.gemini, 'assets/bg/enemies/gemini-google-icon-symbol-logo-free-png.png.webp');
    this.load.image(ASSET_KEYS.enemies.kimi, 'assets/bg/enemies/kimi-color.png');

    // Audio: el navegador elige el primer formato soportado (ogg, luego mp3).
    AUDIO_MANIFEST.forEach(({ key, file }) => {
      this.load.audio(key, [`assets/audio/${file}.ogg`, `assets/audio/${file}.mp3`]);
    });
  }

  create(): void {
    this.scene.start('start');
  }
}
