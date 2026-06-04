import { BOSS, DIFFICULTY, TARGET } from '../utils/constants';

export interface DifficultySnapshot {
  spawnIntervalMs: number;
  targetMinSpeed: number;
  targetMaxSpeed: number;
  targetScaleFactor: number;
  killsUntilBoss: number;
  shouldTriggerBoss: boolean;
}

export class DifficultyManager {
  private kills = 0;
  private scaleFactor = 1;

  public registerKill(): DifficultySnapshot {
    this.kills += 1;

    if (this.kills % DIFFICULTY.sizeReductionEveryKills === 0) {
      this.scaleFactor *= DIFFICULTY.sizeReductionFactor;
    }

    return this.getSnapshot();
  }

  public resetBossCycle(): void {
    this.kills = 0;
  }

  public getKills(): number {
    return this.kills;
  }

  public getSnapshot(): DifficultySnapshot {
    const spawnIntervalMs = Math.max(
      DIFFICULTY.minSpawnMs,
      DIFFICULTY.baseSpawnMs - this.kills * DIFFICULTY.spawnReductionPerKill,
    );

    const targetMinSpeed = TARGET.minSpeed + this.kills * DIFFICULTY.speedIncreasePerKill;
    const targetMaxSpeed = TARGET.maxSpeed + this.kills * DIFFICULTY.speedIncreasePerKill;

    const shouldTriggerBoss = this.kills > 0 && this.kills % BOSS.triggerEveryKills === 0;
    const killsUntilBoss = shouldTriggerBoss ? 0 : BOSS.triggerEveryKills - (this.kills % BOSS.triggerEveryKills);

    return {
      spawnIntervalMs,
      targetMinSpeed,
      targetMaxSpeed,
      targetScaleFactor: this.scaleFactor,
      killsUntilBoss,
      shouldTriggerBoss,
    };
  }
}
