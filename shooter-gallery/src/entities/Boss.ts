import Phaser from 'phaser';
import { ASSET_KEYS, BOSS, GAME_COLORS } from '../utils/constants';

interface CriticalPoint {
  node: Phaser.GameObjects.Container;
  x: number;
  y: number;
  radius: number;
  hp: number;
  alive: boolean;
}

export class Boss extends Phaser.GameObjects.Container {
  private criticalPoints: CriticalPoint[] = [];

  constructor(scene: Phaser.Scene, width: number, height: number) {
    super(scene, width / 2, height / 2);

    // Fondo oscuro para enfocar la atención en el boss.
    const backdrop = scene.add.rectangle(0, 0, width, height, 0x000000, 0.55);

    // Video del boss en loop, muteado para no pisar la música.
    const maxWidth = width * 0.7;
    const maxHeight = height * 0.82;

    const bossVideo = scene.add.video(0, 0, ASSET_KEYS.bossVideo);
    bossVideo.setMute(true);
    bossVideo.play(true);

    const fitVideo = (): void => {
      const vw = bossVideo.width;
      const vh = bossVideo.height;
      if (!vw || !vh) {
        return;
      }

      bossVideo.setScale(Math.min(maxWidth / vw, maxHeight / vh));
    };

    // Las dimensiones del video recién están disponibles cuando su textura se crea.
    bossVideo.on('created', fitVideo);
    bossVideo.on('textureready', fitVideo);
    bossVideo.on('play', fitVideo);
    fitVideo();

    this.add([backdrop, bossVideo]);

    const points = [
      { x: 0, y: -160 },
      { x: -180, y: 30 },
      { x: 180, y: 30 },
      { x: -75, y: 170 },
      { x: 75, y: 170 },
    ];

    const criticalRadius = 36;

    points.forEach((position) => {
      const wrapper = scene.add.container(position.x, position.y);
      const outer = scene.add.circle(0, 0, criticalRadius, GAME_COLORS.accent, 0.8);
      const core = scene.add.circle(0, 0, 14, GAME_COLORS.success, 1);
      wrapper.add([outer, core]);

      wrapper.setSize(criticalRadius * 2, criticalRadius * 2);
      this.add(wrapper);

      this.criticalPoints.push({
        node: wrapper,
        x: position.x,
        y: position.y,
        radius: criticalRadius,
        hp: BOSS.baseHitPointsPerCritical,
        alive: true,
      });
    });

    scene.add.existing(this);
  }

  public hitCriticalAt(worldX: number, worldY: number): 'none' | 'hit' | 'destroyed' {
    // Los puntos críticos son hijos del boss: convertimos el disparo a coordenadas locales.
    const localX = worldX - this.x;
    const localY = worldY - this.y;

    const point = this.criticalPoints.find(
      (entry) =>
        entry.alive &&
        Phaser.Math.Distance.Between(localX, localY, entry.x, entry.y) <= entry.radius,
    );

    if (!point) {
      return 'none';
    }

    point.hp -= 1;

    this.scene.tweens.add({
      targets: point.node,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 80,
    });

    if (point.hp <= 0) {
      point.alive = false;
      this.scene.tweens.add({
        targets: point.node,
        alpha: 0.2,
        duration: 160,
      });

      return 'destroyed';
    }

    return 'hit';
  }

  public isCleared(): boolean {
    return this.criticalPoints.every((entry) => !entry.alive);
  }

  public getRemainingCriticals(): number {
    return this.criticalPoints.filter((entry) => entry.alive).length;
  }

  public disableCriticalInput(): void {
    this.criticalPoints.forEach((entry) => {
      entry.alive = false;
      entry.node.disableInteractive();
    });
  }
}
