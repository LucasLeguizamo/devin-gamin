import Phaser from 'phaser';
import { ASSET_KEYS } from '../utils/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    this.load.image(ASSET_KEYS.background, 'assets/bg/pixel-art.png');
    this.load.image(ASSET_KEYS.weaponArm, 'assets/bg/arm.png');
    this.load.image(ASSET_KEYS.enemies.openai, 'assets/bg/enemies/openai_logo_icon_248315-2.png');
    this.load.image(ASSET_KEYS.enemies.grok, 'assets/bg/enemies/Grok-icon.svg.png');
    this.load.image(ASSET_KEYS.enemies.gemini, 'assets/bg/enemies/gemini-google-icon-symbol-logo-free-png.png.webp');
    this.load.image(ASSET_KEYS.enemies.kimi, 'assets/bg/enemies/kimi-color.png');
  }

  create(): void {
    this.scene.start('game');
    this.scene.launch('ui');
  }
}
