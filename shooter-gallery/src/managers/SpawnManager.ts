import Phaser from 'phaser';
import { ENEMY_ASSET_KEYS, TARGET } from '../utils/constants';
import { Target } from '../entities/Target';

export class SpawnManager {
  private readonly scene: Phaser.Scene;
  private readonly width: number;
  private readonly height: number;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
  }

  public spawnTarget(minSpeed: number, maxSpeed: number, scaleFactor: number): Target {
    const radius = Phaser.Math.Between(TARGET.minRadius, TARGET.maxRadius) * scaleFactor;
    const x = Phaser.Math.Between(Math.floor(radius), Math.floor(this.width - radius));
    const y = Phaser.Math.Between(Math.floor(radius), Math.floor(this.height - radius));
    const speed = Phaser.Math.FloatBetween(minSpeed, maxSpeed);
    const textureKey = Phaser.Utils.Array.GetRandom(ENEMY_ASSET_KEYS);

    return new Target(this.scene, x, y, radius, speed, TARGET.ttlMs, textureKey);
  }
}
