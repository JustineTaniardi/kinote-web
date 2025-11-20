export interface ProgressStep {
  id: string;
  title: string;
  image: string; // Base64 or URL
  description: string;
  createdAt: string;
}

export interface StreakEntry {
  id: number;
  title: string;
  category?: string;
  categoryId?: number;
  subcategory?: string;
  subCategoryId?: number;
  dayId?: number;
  dayIds?: number[] | string; // JSON string or array of day IDs
  totalMinutes: number; // total duration in minutes
  lastUpdated?: string; // ISO string
  description?: string;
  date?: string; // ISO date when completed
  status?: string;
  days?: string[];
  breakTime?: string | number;
  breakCount?: number;
  streakCount?: number;
  progressSteps?: ProgressStep[]; // Array of progress/documentation steps
}

export interface WeeklyStreakEntry {
  day: string; // e.g., 'Senin'
  totalMinutes: number;
}

export type TimerState = {
  running: boolean;
  seconds: number;
};
