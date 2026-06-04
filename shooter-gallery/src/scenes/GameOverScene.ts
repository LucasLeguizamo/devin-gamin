import Phaser from 'phaser';
import { LeaderboardStore } from '../services/LeaderboardStore';
import { LEADERBOARD_NAME_MAX_LENGTH, type LeaderboardEntry } from '../types/leaderboard';
import { GAME_COLORS, GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

interface GameOverPayload {
  score: number;
}

export class GameOverScene extends Phaser.Scene {
  private readonly leaderboardStore = new LeaderboardStore();
  private nameInput = '';
  private savedScore = false;
  private canRestart = false;
  private highScore = false;
  private nameText?: Phaser.GameObjects.Text;
  private hintText?: Phaser.GameObjects.Text;
  private tableRows: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('game-over');
  }

  create(data: GameOverPayload): void {
    const score = Number.isFinite(data.score) ? Math.max(0, Math.floor(data.score)) : 0;
    const scores = this.leaderboardStore.getTopScores();

    this.nameInput = (this.registry.get('playerName') as string | undefined) ?? '';
    this.savedScore = false;
    this.highScore = this.leaderboardStore.isHighScore(score);
    this.canRestart = !this.highScore;
    this.tableRows = [];

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);

    this.add
      .text(GAME_WIDTH / 2, 80, 'GAME OVER', {
        fontFamily: 'Arial Black',
        fontSize: '60px',
        color: '#ff4b4b',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 132, 'TE QUEDASTE SIN CHAMBA!!!', {
        fontFamily: 'Arial Black',
        fontSize: '30px',
        color: '#ffb454',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 178, `Puntaje final: ${score}`, {
        fontFamily: 'Arial',
        fontSize: '34px',
        color: GAME_COLORS.text,
      })
      .setOrigin(0.5);

    if (this.highScore) {
      this.add
        .text(GAME_WIDTH / 2, 218, 'Nuevo top 10 - escribe tus iniciales', {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#6ef9a5',
        })
        .setOrigin(0.5);

      this.nameText = this.add
        .text(GAME_WIDTH / 2, 264, this.getNameInputLabel(), {
          fontFamily: 'Arial Black',
          fontSize: '34px',
          color: '#ffffff',
          backgroundColor: '#0f1c2a',
          padding: { x: 16, y: 8 },
        })
        .setOrigin(0.5);
    }

    this.renderLeaderboard(scores);

    this.hintText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 56, this.getHintText(), {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#9fc3ff',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.hintText,
      alpha: 0.35,
      yoyo: true,
      repeat: -1,
      duration: 700,
    });

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event, score);
    });

    this.input.on('pointerdown', () => {
      if (this.highScore && !this.savedScore) {
        this.saveScore(score);
        return;
      }

      this.restartGame();
    });
  }

  private handleKeyDown(event: KeyboardEvent, score: number): void {
    if (this.highScore && !this.savedScore) {
      if (event.key === 'Enter') {
        this.saveScore(score);
        return;
      }

      if (event.key === 'Backspace') {
        this.nameInput = this.nameInput.slice(0, -1);
        this.updateNameInput();
        return;
      }

      if (
        event.key.length === 1 &&
        /^[a-z0-9 ]$/i.test(event.key) &&
        this.nameInput.length < LEADERBOARD_NAME_MAX_LENGTH
      ) {
        this.nameInput += event.key;
        this.updateNameInput();
      }

      return;
    }

    if (event.key === 'Enter' && this.canRestart) {
      this.restartGame();
    }
  }

  private saveScore(score: number): void {
    this.leaderboardStore.submitScore(this.nameInput, score);
    this.savedScore = true;
    this.canRestart = true;

    this.nameText?.setText(`Guardado: ${this.getDisplayName()}`);
    this.renderLeaderboard(this.leaderboardStore.getTopScores());
    this.updateHintText();
  }

  private renderLeaderboard(scores: LeaderboardEntry[]): void {
    this.tableRows.forEach((row) => row.destroy());
    this.tableRows = [];

    this.tableRows.push(
      this.add
        .text(GAME_WIDTH / 2, 334, 'TOP 10', {
          fontFamily: 'Arial Black',
          fontSize: '28px',
          color: '#ffb454',
        })
        .setOrigin(0.5),
    );

    const visibleScores = scores.slice(0, 10);

    if (visibleScores.length === 0) {
      this.tableRows.push(
        this.add
          .text(GAME_WIDTH / 2, 386, 'Sin puntajes guardados', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: GAME_COLORS.text,
          })
          .setOrigin(0.5),
      );
      return;
    }

    visibleScores.forEach((entry, index) => {
      const rank = `${index + 1}.`.padEnd(3, ' ');
      const name = entry.name.padEnd(8, ' ');
      const score = entry.score.toString().padStart(6, ' ');

      this.tableRows.push(
        this.add
          .text(GAME_WIDTH / 2, 378 + index * 26, `${rank} ${name} ${score}`, {
            fontFamily: 'Courier New',
            fontSize: '22px',
            color: index === 0 ? '#6ef9a5' : GAME_COLORS.text,
          })
          .setOrigin(0.5),
      );
    });
  }

  private updateNameInput(): void {
    this.nameText?.setText(this.getNameInputLabel());
  }

  private updateHintText(): void {
    this.hintText?.setText(this.getHintText());
  }

  private getNameInputLabel(): string {
    return `[ ${this.getDisplayName().padEnd(LEADERBOARD_NAME_MAX_LENGTH, ' ')} ]`;
  }

  private getDisplayName(): string {
    return this.nameInput.trim().toUpperCase() || 'PLAYER';
  }

  private getHintText(): string {
    if (this.highScore && !this.savedScore) {
      return 'Enter o click para guardar';
    }

    return 'Haz click o Enter para reiniciar';
  }

  private restartGame(): void {
    if (!this.canRestart) {
      return;
    }

    this.scene.stop('ui');
    this.scene.stop('game-over');
    this.scene.start('boot');
  }
}
