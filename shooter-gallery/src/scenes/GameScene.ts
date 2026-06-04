import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import { Target } from '../entities/Target';
import { DifficultyManager } from '../managers/DifficultyManager';
import { SpawnManager } from '../managers/SpawnManager';
import { ASSET_KEYS, BOSS, GAME_COLORS, GAME_HEIGHT, GAME_WIDTH, PLAYER } from '../utils/constants';
import { MUSIC, SFX } from '../utils/audioKeys';

export class GameScene extends Phaser.Scene {
  private difficultyManager!: DifficultyManager;
  private spawnManager!: SpawnManager;

  private targets: Target[] = [];
  private boss?: Boss;

  private score = 0;
  private lives = PLAYER.maxLives;
  private inBossFight = false;
  private canShoot = true;
  private isGameOver = false;

  private nextSpawnAt = 0;
  private bossDeadline = 0;

  private crosshair!: Phaser.GameObjects.Container;
  private weaponArm!: Phaser.GameObjects.Image;
  private music?: Phaser.Sound.BaseSound;

  constructor() {
    super('game');
  }

  create(): void {
    this.targets = [];
    this.boss = undefined;
    this.score = 0;
    this.lives = PLAYER.maxLives;
    this.inBossFight = false;
    this.canShoot = true;
    this.isGameOver = false;
    this.nextSpawnAt = 0;
    this.bossDeadline = 0;

    this.createBackground();

    this.difficultyManager = new DifficultyManager();
    this.spawnManager = new SpawnManager(this, GAME_WIDTH, GAME_HEIGHT);

    this.input.setDefaultCursor('none');
    this.createWeaponArm();
    this.createCrosshair();

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) {
        return;
      }

      this.crosshair.setPosition(pointer.x, pointer.y);
      this.updateWeaponAim(pointer.x, pointer.y);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver || !this.canShoot) {
        return;
      }

      this.canShoot = false;
      this.time.delayedCall(PLAYER.fireCooldownMs, () => {
        if (this.isGameOver) {
          return;
        }

        this.canShoot = true;
      });

      this.handleShot(pointer);
    });

    this.playMusic(MUSIC.gameplay);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopMusic());

    this.pushUiUpdate(0);
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) {
      return;
    }

    const deltaS = delta / 1000;

    if (!this.inBossFight && time >= this.nextSpawnAt) {
      this.spawnTarget();
    }

    this.targets = this.targets.filter((target) => {
      if (this.isGameOver || target.isConsumed) {
        return false;
      }

      const alive = target.update(time, deltaS, GAME_WIDTH, GAME_HEIGHT);

      if (!alive) {
        target.expire();
        this.playSfx(SFX.targetMiss, 0.5);
        if (!this.isGameOver) {
          this.loseLife(1);
        }
      }

      return alive;
    });

    if (this.isGameOver) {
      return;
    }

    if (this.inBossFight && time >= this.bossDeadline) {
      this.finishBoss(false);
    }
  }

  private createBackground(): void {
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, GAME_COLORS.background, 1)
      .setDepth(-120);

    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.background)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setDepth(-100);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.18).setDepth(-90);
  }

  private createWeaponArm(): void {
    this.weaponArm = this.add
      .image(GAME_WIDTH * 0.66, GAME_HEIGHT + 110, ASSET_KEYS.weaponArm)
      .setOrigin(0.52, 0.82)
      .setScale(0.34)
      .setDepth(420);
  }

  private createCrosshair(): void {
    const ring = this.add.circle(0, 0, 18, GAME_COLORS.accent, 0).setStrokeStyle(2, GAME_COLORS.accent);
    const hLine = this.add.rectangle(0, 0, 26, 2, GAME_COLORS.accent, 0.9);
    const vLine = this.add.rectangle(0, 0, 2, 26, GAME_COLORS.accent, 0.9);

    this.crosshair = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [ring, hLine, vLine]);
    this.crosshair.setDepth(500);
  }

  private spawnTarget(): void {
    if (this.isGameOver || this.inBossFight) {
      return;
    }

    const snapshot = this.difficultyManager.getSnapshot();

    const target = this.spawnManager.spawnTarget(
      snapshot.targetMinSpeed,
      snapshot.targetMaxSpeed,
      snapshot.targetScaleFactor,
    );

    this.targets.push(target);
    this.nextSpawnAt = this.time.now + snapshot.spawnIntervalMs;
    this.pushUiUpdate();
  }

  private handleShot(pointer: Phaser.Input.Pointer): void {
    if (this.isGameOver) {
      return;
    }

    this.kickWeapon();
    this.makeMuzzleFlash(pointer.x, pointer.y);
    this.playSfx(SFX.shoot, 0.4);

    if (!this.inBossFight) {
      // Detección geométrica: destruimos el blanco más reciente (encima) bajo el disparo.
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const target = this.targets[i];

        if (target.hitTest(pointer.x, pointer.y)) {
          this.onTargetDestroyed(target);
          return;
        }
      }

      return;
    }

    if (!this.boss) {
      return;
    }

    const result = this.boss.hitCriticalAt(pointer.x, pointer.y);

    if (result === 'none') {
      return;
    }

    if (result === 'destroyed') {
      this.playSfx(SFX.bossCriticalDestroy, 0.7);
    } else {
      this.playSfx(SFX.bossCriticalHit, 0.6);
    }

    this.cameras.main.shake(85, 0.0032);
    this.pushUiUpdate(this.boss.getRemainingCriticals());

    if (this.boss.isCleared()) {
      this.finishBoss(true);
    }
  }

  private onTargetDestroyed(target: Target): void {
    if (this.isGameOver || this.inBossFight || target.isConsumed) {
      return;
    }

    target.explode();
    this.playSfx(SFX.targetHit, 0.6);
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
    if (this.isGameOver || this.inBossFight) {
      return;
    }

    this.inBossFight = true;

    this.playSfx(SFX.bossStart, 0.7);
    this.playMusic(MUSIC.boss);

    this.targets.forEach((target) => target.expire());
    this.targets = [];

    this.boss = new Boss(this, GAME_WIDTH, GAME_HEIGHT);
    this.boss.setDepth(200);

    this.bossDeadline = this.time.now + BOSS.phaseDurationMs;
    this.pushUiUpdate(this.boss.getRemainingCriticals());
  }

  private finishBoss(playerWon: boolean): void {
    if (this.isGameOver || !this.boss) {
      return;
    }

    this.boss.disableCriticalInput();
    this.boss.destroy();
    this.boss = undefined;
    this.inBossFight = false;

    if (playerWon) {
      this.playSfx(SFX.bossDefeat, 0.7);
      this.score += 200;
      this.difficultyManager.resetBossCycle();
    } else {
      this.playSfx(SFX.bossTimeout, 0.7);
      this.loseLife(BOSS.incomingDamageIfTimeout);
      if (this.isGameOver) {
        return;
      }

      this.difficultyManager.resetBossCycle();
    }

    this.playMusic(MUSIC.gameplay);
    this.nextSpawnAt = this.time.now + 900;
    this.pushUiUpdate();
  }

  private loseLife(amount: number): void {
    if (this.isGameOver) {
      return;
    }

    this.lives = Math.max(0, this.lives - amount);
    this.playSfx(SFX.loseLife, 0.6);
    this.flashRed();
    this.showLifeLostMessage();
    this.pushUiUpdate();

    if (this.lives <= 0) {
      this.endRun();
    }
  }

  private endRun(): void {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.canShoot = false;
    this.stopMusic();
    this.playSfx(SFX.gameOver, 0.7);
    this.clearTargets();

    if (this.boss) {
      this.boss.disableCriticalInput();
      this.boss.destroy();
      this.boss = undefined;
    }

    this.inBossFight = false;
    this.input.setDefaultCursor('default');
    this.input.removeAllListeners();

    this.scene.pause();
    this.scene.launch('game-over', { score: this.score });
  }

  private makeMuzzleFlash(x: number, y: number): void {
    if (this.isGameOver) {
      return;
    }

    const flash = this.add.circle(x, y, 6, 0xffffff, 0.85).setDepth(450);

    this.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 110,
      onComplete: () => flash.destroy(),
    });
  }

  private updateWeaponAim(pointerX: number, pointerY: number): void {
    const horizontalAim = Phaser.Math.Clamp((pointerX - GAME_WIDTH / 2) / (GAME_WIDTH / 2), -1, 1);
    const verticalAim = Phaser.Math.Clamp((pointerY - GAME_HEIGHT / 2) / (GAME_HEIGHT / 2), -1, 1);

    this.weaponArm.setPosition(GAME_WIDTH * 0.66 + horizontalAim * 18, GAME_HEIGHT + 110 + verticalAim * 8);
    this.weaponArm.setRotation(horizontalAim * 0.08);
  }

  private kickWeapon(): void {
    if (!this.weaponArm) {
      return;
    }

    this.tweens.killTweensOf(this.weaponArm);
    this.tweens.add({
      targets: this.weaponArm,
      y: this.weaponArm.y + 18,
      angle: this.weaponArm.angle + 4,
      yoyo: true,
      duration: 55,
      ease: 'Quad.easeOut',
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

  private showLifeLostMessage(): void {
    // Mensaje temático según las vidas que quedan tras perder una.
    const messages: Record<number, string> = {
      2: 'PERDISTE BENEFICIOS',
      1: 'TE HAN BAJADO EL SUELDO',
    };

    const message = messages[this.lives];
    if (!message) {
      return;
    }

    const banner = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
        fontFamily: 'Arial Black',
        fontSize: '58px',
        color: '#ff4b4b',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(650)
      .setScale(0.6);

    this.tweens.add({
      targets: banner,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: banner,
      alpha: 0,
      delay: 900,
      duration: 450,
      onComplete: () => banner.destroy(),
    });
  }

  private flashRed(): void {
    const overlay = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, GAME_COLORS.danger, 0.45)
      .setDepth(600);

    this.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 120,
      yoyo: true,
      repeat: 1,
      onComplete: () => overlay.destroy(),
    });
  }

  private playSfx(key: string, volume = 0.6): void {
    if (!this.cache.audio.exists(key)) {
      return;
    }

    this.sound.play(key, { volume });
  }

  private playMusic(key: string): void {
    this.stopMusic();

    if (!this.cache.audio.exists(key)) {
      return;
    }

    const start = (): void => {
      if (this.isGameOver) {
        return;
      }

      this.music = this.sound.add(key, { loop: true, volume: 0.3 });
      this.music.play();
    };

    // El navegador bloquea el audio hasta el primer gesto del usuario (primer disparo).
    if (this.sound.locked) {
      this.sound.once(Phaser.Sound.Events.UNLOCKED, start);
    } else {
      start();
    }
  }

  private stopMusic(): void {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = undefined;
    }
  }

  private clearTargets(): void {
    this.targets.forEach((target) => {
      target.disableInteractive();
      target.removeAllListeners('pointerdown');
      target.destroy();
    });
    this.targets = [];
  }
}
