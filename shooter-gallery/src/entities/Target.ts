import Phaser from 'phaser';
import { GAME_COLORS } from '../utils/constants';

export class Target extends Phaser.GameObjects.Container {
  private readonly radius: number;
  private velocityX: number;
  private velocityY: number;
  private bornAtMs: number;
  private ttlMs: number;
  private destroyed = false;
  private transitioning = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    radius: number,
    speed: number,
    ttlMs: number,
    textureKey: string,
  ) {
    super(scene, x, y);

    this.radius = radius;
    this.ttlMs = ttlMs;
    this.velocityX = Phaser.Math.FloatBetween(-1, 1) * speed;
    this.velocityY = Phaser.Math.FloatBetween(-1, 1) * speed;

    const glow = scene.add.circle(0, 0, radius, GAME_COLORS.accent, 0.22).setStrokeStyle(2, GAME_COLORS.accent, 0.7);
    const enemyIcon = scene.add.image(0, 0, textureKey);
    enemyIcon.setDisplaySize(radius * 1.65, radius * 1.65);

    this.add([glow, enemyIcon]);
    this.setSize(radius * 2, radius * 2);

    this.bornAtMs = scene.time.now;

    this.setInteractive(
      new Phaser.Geom.Circle(0, 0, radius),
      Phaser.Geom.Circle.Contains,
    );

    scene.add.existing(this);
  }

  public update(now: number, deltaS: number, width: number, height: number): boolean {
    if (this.isConsumed) {
      return false;
    }

    this.x += this.velocityX * deltaS;
    this.y += this.velocityY * deltaS;

    if (this.x < this.radius || this.x > width - this.radius) {
      this.velocityX *= -1;
    }

    if (this.y < this.radius || this.y > height - this.radius) {
      this.velocityY *= -1;
    }

    const timedOut = now - this.bornAtMs >= this.ttlMs;
    return !timedOut;
  }

  public get isConsumed(): boolean {
    return this.destroyed || this.transitioning || !this.active;
  }

  public explode(): void {
    if (!this.beginTransition()) {
      return;
    }

    if (!this.canCreateTween()) {
      this.destroy();
      return;
    }

    this.destroyed = true;
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 140,
      onComplete: () => this.destroy(),
    });
  }

  public expire(): void {
    if (!this.beginTransition()) {
      return;
    }

    if (!this.canCreateTween()) {
      this.destroy();
      return;
    }

    this.destroyed = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 120,
      onComplete: () => this.destroy(),
    });
  }

  private beginTransition(): boolean {
    if (this.isConsumed) {
      return false;
    }

    this.transitioning = true;
    this.disableInteractive();
    this.removeAllListeners('pointerdown');

    return true;
  }

  private canCreateTween(): boolean {
    return Boolean(this.scene?.sys?.isActive() && this.scene.tweens);
  }
}
