
import { ExerciseCategory } from "./exerciseTypes";
import { WorkoutPlanOverride } from "./data";

export interface PR {
  exerciseId: string;
  type: 'heaviest_weight' | 'most_reps' | 'highest_volume' | 'best_1rm';
  value: number;
  date: number;
  reps?: number;
  weight?: number;
}

export interface HealthMetric {
  id: string;
  date: string; 
  workoutId?: string; 
  timestamp?: number; 
  sleepDurationHours?: number;
  sleepQualityRating?: number; 
  waterIntakeMl?: number;
  stressLevelRating?: number; 
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  glucose?: number; 
  bloodOxygen?: number;
  weight?: number;
  notes?: string;
  caloriesBurned?: number;
  calories?: number; 
  avgHeartRate?: number;
  maxHeartRate?: number;
  steps?: number;
  duration?: number; 
  distance?: number; 
  avgSpeed?: number; 
  fromSmartwatch?: boolean;
  sleepDuration?: number; 
  sleepQuality?: number; 
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  height?: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  lats?: number;
  upperBack?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  triceps?: number;
  forearms?: number;
  thighs?: number;
  calves?: number;
  bodyFatPercentage?: number;
}

export interface PlanExercise {
  id: string;
  exerciseId: string;
  name: string;
  category?: string;
  sets?: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  incline?: string;
}

export interface PlanDay {
  id: string;
  name: string;
  exercises: PlanExercise[];
}

export interface CustomPlan {
  id: string;
  name: string;
  days: PlanDay[];
  createdAt: number;
  aiGenerated?: boolean;
}
