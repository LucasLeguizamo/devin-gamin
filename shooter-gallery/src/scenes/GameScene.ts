import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import { Target } from '../entities/Target';
import { DifficultyManager } from '../managers/DifficultyManager';
import { SpawnManager } from '../managers/SpawnManager';
import { BOSS, GAME_COLORS, GAME_HEIGHT, GAME_WIDTH, PLAYER } from '../utils/constants';

export class GameScene extends Phaser.Scene {
  private difficultyManager!: DifficultyManager;
  private spawnManager!: SpawnManager;

  private targets: Target[] = [];
  private boss?: Boss;

  private score = 0;
  private lives = PLAYER.maxLives;
  private inBossFight = false;
  private canShoot = true;

  private nextSpawnAt = 0;
  private bossDeadline = 0;

  private crosshair!: Phaser.GameObjects.Container;

  constructor() {
    super('game');
  }

  create(): void {
    this.createBackground();

    this.difficultyManager = new DifficultyManager();
    this.spawnManager = new SpawnManager(this, GAME_WIDTH, GAME_HEIGHT);

    this.input.setDefaultCursor('none');
    this.createCrosshair();

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.crosshair.setPosition(pointer.x, pointer.y);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.canShoot) {
        return;
      }

      this.canShoot = false;
      this.time.delayedCall(PLAYER.fireCooldownMs, () => {
        this.canShoot = true;
      });

      this.handleShot(pointer);
    });

    this.pushUiUpdate(0);
  }

  update(time: number, delta: number): void {
    const deltaS = delta / 1000;

    if (!this.inBossFight && time >= this.nextSpawnAt) {
      this.spawnTarget();
    }

    this.targets = this.targets.filter((target) => {
      const alive = target.update(time, deltaS, GAME_WIDTH, GAME_HEIGHT);

      if (!alive) {
        target.expire();
        this.loseLife(1);
      }

      return alive;
    });

    if (this.inBossFight && time >= this.bossDeadline) {
      this.finishBoss(false);
    }
  }

  private createBackground(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, GAME_COLORS.background, 1);

    for (let i = 0; i < 50; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.8),
      );

      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.15, 0.95),
        yoyo: true,
        repeat: -1,
        duration: Phaser.Math.Between(800, 2300),
      });
    }
  }

  private createCrosshair(): void {
    const ring = this.add.circle(0, 0, 18, GAME_COLORS.accent, 0).setStrokeStyle(2, GAME_COLORS.accent);
    const hLine = this.add.rectangle(0, 0, 26, 2, GAME_COLORS.accent, 0.9);
    const vLine = this.add.rectangle(0, 0, 2, 26, GAME_COLORS.accent, 0.9);

    this.crosshair = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [ring, hLine, vLine]);
    this.crosshair.setDepth(500);
  }

  private spawnTarget(): void {
    const snapshot = this.difficultyManager.getSnapshot();

    const target = this.spawnManager.spawnTarget(
      snapshot.targetMinSpeed,
      snapshot.targetMaxSpeed,
      snapshot.targetScaleFactor,
    );

    target.on('pointerdown', () => {
      this.onTargetDestroyed(target);
    });

    this.targets.push(target);
    this.nextSpawnAt = this.time.now + snapshot.spawnIntervalMs;
    this.pushUiUpdate();
  }

  private handleShot(pointer: Phaser.Input.Pointer): void {
    this.makeMuzzleFlash(pointer.x, pointer.y);

    if (!this.inBossFight || !this.boss) {
      return;
    }

    const hit = this.input.hitTestPointer(pointer);
    for (const gameObject of hit) {
      const isCriticalNode = this.boss.getInteractiveNodes().includes(gameObject as Phaser.GameObjects.Container);

      if (isCriticalNode) {
        const cleared = this.boss.hitCritical(gameObject);
        this.cameras.main.shake(85, 0.0032);
        this.pushUiUpdate(this.boss.getRemainingCriticals());

        if (cleared) {
          this.finishBoss(true);
        }

        return;
      }
    }
  }

  private onTargetDestroyed(target: Target): void {
    if (this.inBossFight) {
      return;
    }

    target.explode();
    this.targets = this.targets.filter((entry) => entry !== target);

    this.score += 10;

    const snapshot = this.difficultyManager.registerKill();

    this.cameras.main.shake(70, 0.0014);

    if (snapshot.shouldTriggerBoss) {
      this.startBossFight();
      return;
    }

    this.pushUiUpdate();
  }

  private startBossFight(): void {
    this.inBossFight = true;

    this.targets.forEach((target) => target.expire());
    this.targets = [];

    this.boss = new Boss(this, GAME_WIDTH, GAME_HEIGHT);
    this.boss.setDepth(200);

    this.bossDeadline = this.time.now + BOSS.phaseDurationMs;
    this.pushUiUpdate(this.boss.getRemainingCriticals());
  }

  private finishBoss(playerWon: boolean): void {
    if (!this.boss) {
      return;
    }

    this.boss.destroy();
    this.boss = undefined;
    this.inBossFight = false;

    if (playerWon) {
      this.score += 200;
      this.difficultyManager.resetBossCycle();
    } else {
      this.loseLife(BOSS.incomingDamageIfTimeout);
      this.difficultyManager.resetBossCycle();
    }

    this.nextSpawnAt = this.time.now + 900;
    this.pushUiUpdate();
  }

  private loseLife(amount: number): void {
    this.lives = Math.max(0, this.lives - amount);
    this.pushUiUpdate();

    if (this.lives <= 0) {
      this.endRun();
    }
  }

  private endRun(): void {
    this.input.setDefaultCursor('default');
    this.input.removeAllListeners();

    this.scene.pause();
    this.scene.launch('game-over', { score: this.score });
  }

  private makeMuzzleFlash(x: number, y: number): void {
    const flash = this.add.circle(x, y, 6, 0xffffff, 0.85).setDepth(450);

    this.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 110,
      onComplete: () => flash.destroy(),
    });
  }

  private pushUiUpdate(remainingCriticals = 0): void {
    const snapshot = this.difficultyManager.getSnapshot();

    this.game.events.emit('ui:update', {
      score: this.score,
      lives: this.lives,
      killsUntilBoss: this.inBossFight ? 0 : snapshot.killsUntilBoss,
      inBossFight: this.inBossFight,
      remainingCriticals,
    });
  }
}
