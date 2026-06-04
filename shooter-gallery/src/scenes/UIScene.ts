import Phaser from 'phaser';
import { GAME_COLORS } from '../utils/constants';

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private cycleText!: Phaser.GameObjects.Text;
  private bossText!: Phaser.GameObjects.Text;

  constructor() {
    super('ui');
  }

  create(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: GAME_COLORS.text,
      stroke: '#000000',
      strokeThickness: 3,
    };

    this.scoreText = this.add.text(18, 14, 'Score: 0', textStyle);
    this.livesText = this.add.text(18, 44, 'Vidas: 3', textStyle);
    this.cycleText = this.add.text(18, 74, 'Boss en: 20', textStyle);
    this.bossText = this.add.text(18, 104, '', { ...textStyle, color: '#ffb454' });

    this.game.events.on('ui:update', this.onUiUpdate, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('ui:update', this.onUiUpdate, this);
    });
  }

  private onUiUpdate(payload: {
    score: number;
    lives: number;
    killsUntilBoss: number;
    inBossFight: boolean;
    remainingCriticals: number;
  }): void {
    this.scoreText.setText(`Score: ${payload.score}`);
    this.livesText.setText(`Vidas: ${payload.lives}`);
    this.cycleText.setText(`Boss en: ${payload.killsUntilBoss}`);

    if (payload.inBossFight) {
      this.bossText.setText(`BOSS ACTIVO - Puntos críticos: ${payload.remainingCriticals}`);
    } else {
      this.bossText.setText('');
    }
  }
}
