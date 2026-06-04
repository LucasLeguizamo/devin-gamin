import Phaser from 'phaser';
import { ASSET_KEYS, GAME_COLORS, GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';
import { LEADERBOARD_NAME_MAX_LENGTH } from '../types/leaderboard';

export class StartScene extends Phaser.Scene {
  private nameInput = '';
  private nameText?: Phaser.GameObjects.Text;

  constructor() {
    super('start');
  }

  create(): void {
    // Reutiliza el nombre previo (p. ej. tras reiniciar) si existe.
    this.nameInput = (this.registry.get('playerName') as string | undefined) ?? '';

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, GAME_COLORS.background, 1);
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.background)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.35);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5);

    this.add
      .text(GAME_WIDTH / 2, 150, 'SALVA TU CHAMBA DE LA IA', {
        fontFamily: 'Arial Black',
        fontSize: '58px',
        color: '#2de2e6',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 226, 'Defiende tu trabajo de las IAs... a los tiros', {
        fontFamily: 'Arial',
        fontSize: '26px',
        color: GAME_COLORS.text,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 332, 'Escribí tu nombre:', {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#9fc3ff',
      })
      .setOrigin(0.5);

    this.nameText = this.add
      .text(GAME_WIDTH / 2, 390, this.getNameLabel(), {
        fontFamily: 'Arial Black',
        fontSize: '40px',
        color: '#ffffff',
        backgroundColor: '#0f1c2a',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 96, 'Escribí tu nombre y presioná ENTER o CLICK para jugar', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#6ef9a5',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.35,
      yoyo: true,
      repeat: -1,
      duration: 700,
    });

    this.input.keyboard?.on('keydown', this.handleKeyDown, this);
    this.input.on('pointerdown', () => this.startGame());
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.startGame();
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
  }

  private startGame(): void {
    const name = this.nameInput.trim().toUpperCase() || 'PLAYER';
    this.registry.set('playerName', name);

    this.scene.start('game');
    this.scene.launch('ui');
  }

  private updateNameInput(): void {
    this.nameText?.setText(this.getNameLabel());
  }

  private getNameLabel(): string {
    const display = this.nameInput.toUpperCase().padEnd(LEADERBOARD_NAME_MAX_LENGTH, ' ');
    return `[ ${display} ]`;
  }
}
