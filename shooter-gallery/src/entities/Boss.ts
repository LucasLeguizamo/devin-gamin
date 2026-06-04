import Phaser from 'phaser';
import { BOSS, GAME_COLORS } from '../utils/constants';

interface CriticalPoint {
  node: Phaser.GameObjects.Container;
  hp: number;
  alive: boolean;
}

export class Boss extends Phaser.GameObjects.Container {
  private criticalPoints: CriticalPoint[] = [];

  constructor(scene: Phaser.Scene, width: number, height: number) {
    super(scene, width / 2, height / 2);

    const frame = scene.add.rectangle(0, 0, width * 0.94, height * 0.9, GAME_COLORS.panel, 0.95);
    frame.setStrokeStyle(4, GAME_COLORS.accent, 0.75);

    const face = scene.add.ellipse(0, 0, width * 0.5, height * 0.56, 0x1f3148, 0.95);
    const eyeLeft = scene.add.circle(-130, -60, 30, GAME_COLORS.warning, 0.95);
    const eyeRight = scene.add.circle(130, -60, 30, GAME_COLORS.warning, 0.95);

    this.add([frame, face, eyeLeft, eyeRight]);

    const points = [
      { x: 0, y: -160 },
      { x: -180, y: 30 },
      { x: 180, y: 30 },
      { x: -75, y: 170 },
      { x: 75, y: 170 },
    ];

    points.forEach((position) => {
      const wrapper = scene.add.container(position.x, position.y);
      const outer = scene.add.circle(0, 0, 36, GAME_COLORS.accent, 0.8);
      const core = scene.add.circle(0, 0, 14, GAME_COLORS.success, 1);
      wrapper.add([outer, core]);

      wrapper.setSize(72, 72);
      wrapper.setInteractive(new Phaser.Geom.Circle(0, 0, 36), Phaser.Geom.Circle.Contains);
      this.add(wrapper);

      this.criticalPoints.push({
        node: wrapper,
        hp: BOSS.baseHitPointsPerCritical,
        alive: true,
      });
    });

    scene.add.existing(this);
  }

  public hitCritical(targetNode: Phaser.GameObjects.GameObject): boolean {
    const point = this.criticalPoints.find((entry) => entry.node === targetNode);

    if (!point || !point.alive) {
      return false;
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
      point.node.disableInteractive();
      this.scene.tweens.add({
        targets: point.node,
        alpha: 0.2,
        duration: 160,
      });
    }

    return this.criticalPoints.every((entry) => !entry.alive);
  }

  public getInteractiveNodes(): Phaser.GameObjects.Container[] {
    return this.criticalPoints.filter((entry) => entry.alive).map((entry) => entry.node);
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
