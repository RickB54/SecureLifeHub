
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Exercise } from "./data"
import { BmiData, WorkoutExercise, Workout } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidImageUrl(exercise: Exercise): string | undefined {
  // Return the pictureUrl or thumbnailUrl if either exists
  return exercise.pictureUrl || exercise.thumbnailUrl;
}

/**
 * Gets the appropriate image URL for an exercise
 * Returns the exercise image if available, or empty string if no image
 */
export function getExerciseImageUrl(exercise: Exercise): string {
  // If the exercise has a valid image URL, use it
  if (exercise.pictureUrl || exercise.thumbnailUrl) {
    return exercise.pictureUrl || exercise.thumbnailUrl || "";
  }
  
  // Return empty string if no image available
  return "";
}

// Helper to convert weight to kg
export function convertWeightToKg(weight: number, unit: 'lbs' | 'kg'): number {
  if (unit === 'lbs') {
    return weight * 0.453592;
  }
  return weight;
}

// Simple MET values (Metabolic Equivalent of Task)
// These are approximate values and can vary based on intensity and individual factors.
const MET_VALUES: { [key: string]: number } = {
  'Weights': 3.5, // General weightlifting
  'Cardio': 6.0,  // General cardio, e.g., running, cycling
  'Bodyweight': 4.0, // General bodyweight exercises
  'Slide Board': 5.0, // Specific for slide board
  // Add more specific MET values as needed for other categories
  'General': 3.0, // Default for unknown or general exercises
  'Mixed': 4.5, // For mixed workouts
  'Hybrid': 5.0, // For hybrid workouts
  'Strength': 4.0, // For strength-focused workouts
};

/**
 * Calculates estimated calories burned for a workout.
 * Formula: Calories = METs × weight(kg) × duration(hours)
 * @param workout The workout object.
 * @param exercises All available exercises to get category.
 * @param bmiData User's BMI data (for weight).
 * @param unitSystem User's unit system ('imperial' or 'metric').
 * @returns Estimated calories burned, or null if data is incomplete.
 */
export function calculateCaloriesBurned(
  workout: Workout,
  allExercises: Exercise[],
  bmiData: BmiData | null,
  unitSystem: 'imperial' | 'metric'
): number | null {
  if (!bmiData || !bmiData.weight) {
    return null; // Cannot calculate if BMI data is incomplete
  }

  const userWeightKg = convertWeightToKg(parseFloat(bmiData.weight), unitSystem === 'imperial' ? 'lbs' : 'kg');
  if (isNaN(userWeightKg) || userWeightKg <= 0) {
    return null; // Invalid weight
  }

  const startTime = typeof workout.date === 'string' ? new Date(workout.date).getTime() : workout.startTime;
  const endTime = startTime + (workout.duration || 0) * 60 * 1000;
  const durationMs = endTime - startTime;
  const durationHours = durationMs / (1000 * 60 * 60);

  if (durationHours <= 0) {
    return null; // Invalid duration
  }

  let totalCalories = 0;

  // Determine overall workout MET based on exercise categories
  const workoutCategories = new Set<string>();
  workout.exercises?.forEach(exerciseId => {
    const exercise = allExercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      workoutCategories.add(exercise.category || '');
    }
  });

  let effectiveMet = MET_VALUES['General']; // Default MET

  if (workoutCategories.has('Weights') || workoutCategories.has('Bodyweight')) {
    effectiveMet = MET_VALUES['Weights'];
  }
  if (workoutCategories.has('Cardio') || workoutCategories.has('Slide Board')) {
    effectiveMet = MET_VALUES['Cardio'];
  }
  // Prioritize more intense or specific METs if multiple categories are present
  if (workoutCategories.has('Cardio') && workoutCategories.has('Weights')) {
    effectiveMet = MET_VALUES['Hybrid'];
  }

  totalCalories = effectiveMet * userWeightKg * durationHours;

  return Math.round(totalCalories);
}

// Weight conversion functions
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

// Height conversion functions
export function cmToInches(cm: number): number {
  return cm * 0.393701;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

// Display formatters
export function formatWeight(weight: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'imperial') {
    return `${Math.round(kgToLbs(weight) * 10) / 10} lbs`;
  }
  return `${Math.round(weight * 10) / 10} kg`;
}

export function formatHeight(height: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'imperial') {
    return `${Math.round(cmToInches(height) * 10) / 10} in`;
  }
  return `${Math.round(height * 10) / 10} cm`;
}
