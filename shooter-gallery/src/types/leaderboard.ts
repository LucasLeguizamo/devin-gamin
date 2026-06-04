export const LEADERBOARD_STORAGE_KEY = 'shooter-gallery:leaderboard:v1';
export const LEADERBOARD_MAX_ENTRIES = 10;
export const LEADERBOARD_NAME_MAX_LENGTH = 8;

export interface LeaderboardEntry {
  name: string;
  score: number;
  createdAt: number;
}
