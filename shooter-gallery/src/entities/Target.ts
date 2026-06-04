import Phaser from 'phaser';
import { GAME_COLORS } from '../utils/constants';

export class Target extends Phaser.GameObjects.Container {
  private readonly radius: number;
  private velocityX: number;
  private velocityY: number;
  private bornAtMs: number;
  private ttlMs: number;
  private destroyed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, speed: number, ttlMs: number) {
    super(scene, x, y);

    this.radius = radius;
    this.ttlMs = ttlMs;
    this.velocityX = Phaser.Math.FloatBetween(-1, 1) * speed;
    this.velocityY = Phaser.Math.FloatBetween(-1, 1) * speed;

    const bodyCircle = scene.add.circle(0, 0, radius, GAME_COLORS.warning, 0.85);
    const innerCircle = scene.add.circle(0, 0, radius * 0.42, GAME_COLORS.danger, 0.95);

    this.add([bodyCircle, innerCircle]);
    this.setSize(radius * 2, radius * 2);

    this.bornAtMs = scene.time.now;

    this.setInteractive(
      new Phaser.Geom.Circle(0, 0, radius),
      Phaser.Geom.Circle.Contains,
    );

    scene.add.existing(this);
  }

  public update(now: number, deltaS: number, width: number, height: number): boolean {
    if (this.destroyed) {
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

  public explode(): void {
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
    this.destroyed = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 120,
      onComplete: () => this.destroy(),
    });
  }
}
