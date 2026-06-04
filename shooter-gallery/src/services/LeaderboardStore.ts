import {
  LEADERBOARD_MAX_ENTRIES,
  LEADERBOARD_NAME_MAX_LENGTH,
  LEADERBOARD_STORAGE_KEY,
  type LeaderboardEntry,
} from '../types/leaderboard';

export class LeaderboardStore {
  private memoryEntries: LeaderboardEntry[] = [];

  getTopScores(): LeaderboardEntry[] {
    return this.readEntries();
  }

  submitScore(name: string, score: number): LeaderboardEntry {
    const entry: LeaderboardEntry = {
      name: this.normalizeName(name),
      score: this.normalizeScore(score),
      createdAt: Date.now(),
    };

    const entries = this.sortEntries([...this.readEntries(), entry]).slice(0, LEADERBOARD_MAX_ENTRIES);
    this.writeEntries(entries);

    return entry;
  }

  isHighScore(score: number): boolean {
    const normalizedScore = this.normalizeScore(score);
    const entries = this.readEntries();

    if (entries.length < LEADERBOARD_MAX_ENTRIES) {
      return true;
    }

    const lowestEntry = entries[entries.length - 1];
    return lowestEntry ? normalizedScore > lowestEntry.score : true;
  }

  clear(): void {
    this.memoryEntries = [];

    try {
      this.getStorage()?.removeItem(LEADERBOARD_STORAGE_KEY);
    } catch {
      // Storage is best-effort; gameplay should continue even when persistence is unavailable.
    }
  }

  private readEntries(): LeaderboardEntry[] {
    const storage = this.getStorage();

    if (!storage) {
      return this.memoryEntries;
    }

    try {
      const rawValue = storage.getItem(LEADERBOARD_STORAGE_KEY);

      if (!rawValue) {
        return this.memoryEntries;
      }

      const parsedValue: unknown = JSON.parse(rawValue);

      if (!Array.isArray(parsedValue)) {
        return this.memoryEntries;
      }

      const entries = parsedValue.map((entry) => this.parseEntry(entry)).filter((entry) => entry !== null);
      this.memoryEntries = this.sortEntries(entries).slice(0, LEADERBOARD_MAX_ENTRIES);

      return this.memoryEntries;
    } catch {
      return this.memoryEntries;
    }
  }

  private writeEntries(entries: LeaderboardEntry[]): void {
    this.memoryEntries = entries;

    try {
      this.getStorage()?.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Saving can fail in private browsing or quota-limited contexts; callers still get a usable entry.
    }
  }

  private parseEntry(entry: unknown): LeaderboardEntry | null {
    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const candidate = entry as Partial<LeaderboardEntry>;

    if (
      typeof candidate.name !== 'string' ||
      typeof candidate.score !== 'number' ||
      typeof candidate.createdAt !== 'number'
    ) {
      return null;
    }

    if (!Number.isFinite(candidate.score) || !Number.isFinite(candidate.createdAt)) {
      return null;
    }

    return {
      name: this.normalizeName(candidate.name),
      score: this.normalizeScore(candidate.score),
      createdAt: candidate.createdAt,
    };
  }

  private sortEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    return [...entries].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.createdAt - b.createdAt;
    });
  }

  private normalizeName(name: string): string {
    const normalizedName = name.trim().replace(/\s+/g, ' ').slice(0, LEADERBOARD_NAME_MAX_LENGTH).toUpperCase();
    return normalizedName || 'PLAYER';
  }

  private normalizeScore(score: number): number {
    if (!Number.isFinite(score)) {
      return 0;
    }

    return Math.max(0, Math.floor(score));
  }

  private getStorage(): Storage | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }

      return window.localStorage;
    } catch {
      return null;
    }
  }
}
