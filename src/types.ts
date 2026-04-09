export interface Maxes {
  squat: number;
  bench: number;
  deadlift: number;
}

export interface MobilityItem {
  name: string;
  sets: string;
  link: string;
}

export interface Exercise {
  name: string;
  setsReps: string;
  percent: string | number;
  weight?: string | number;
  liftType: 'squat' | 'bench' | 'deadlift' | 'accessory';
  link?: string;
  coachNotes?: string;
}

export interface WorkoutDay {
  id: number;
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface AthleteData {
  maxes: Maxes;
  completedSets: Record<string, boolean>;
  exerciseNotes: Record<string, string>;
  numWeeks: number;
  activeWeek: number;
  password?: string;
  mobilityList: MobilityItem[];
  workoutData: WorkoutDay[];
  tabNames: Record<string, string>;
  appTitle: string;
  appSubtitle: string;
  profileImage: string | null;
  expandedDays: Record<string, boolean>;
  chartPeriod: 'week' | 'month' | 'year';
}

export interface Database {
  [athleteName: string]: AthleteData;
}
