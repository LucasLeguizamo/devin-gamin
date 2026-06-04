import Phaser from 'phaser';
import { GAME_COLORS, GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

interface GameOverPayload {
  score: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('game-over');
  }

  create(data: GameOverPayload): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'GAME OVER', {
        fontFamily: 'Arial Black',
        fontSize: '72px',
        color: '#ff4b4b',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, `Puntaje: ${data.score}`, {
        fontFamily: 'Arial',
        fontSize: '36px',
        color: GAME_COLORS.text,
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'Haz click para reiniciar', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#9fc3ff',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.35,
      yoyo: true,
      repeat: -1,
      duration: 700,
    });

    this.input.once('pointerdown', () => {
      this.scene.stop('ui');
      this.scene.stop('game-over');
      this.scene.start('boot');
    });
  }
}
