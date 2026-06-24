import { Workout, Exercise } from '@/lib/data';

interface UserProfile {
  height?: number; // in cm
  weight?: number; // in kg
}

/**
 * Enhanced cardio steps calculation based on exercise type, distance, and intensity
 */
const calculateCardioSteps = (exercise: Exercise, duration: number, intensity: string = 'Moderate', speed?: number, incline?: number): number => {
  const exerciseType = exercise.name.toLowerCase();
  const durationMinutes = duration / 60;
  
  // Average steps per mile for different activities
  const stepsPerMile = {
    'treadmill': 2000,
    'running': 2000,
    'jogging': 2100,
    'walking': 2400,
    'elliptical': 1800,  // equivalent steps
    'stairclimber': 2200,
    'stair': 2200,
    'step': 2200,
    'hiking': 2300,
    'bike': 1500,
    'cycling': 1500
  };
  
  // Estimate distance based on duration and exercise type
  const estimateDistance = (type: string, minutes: number, intensityLevel: string, avgSpeed?: number): number => {
    if (avgSpeed) {
      return (avgSpeed * minutes) / 60;
    }
    
    const speedMph = {
      'walking': 3.0,     // Semi-brisk walking pace
      'jogging': 5.5,
      'running': 7.0,
      'treadmill': 3.0,   // Matches walking pace
      'elliptical': 4.0,
      'bike': 15.0,
      'cycling': 15.0
    };
    
    const baseSpeed = speedMph[type as keyof typeof speedMph] || 4.0;
    const intensityMultiplier = intensityLevel === 'Very High' ? 1.4 : 
                                intensityLevel === 'High' ? 1.3 : 
                                intensityLevel === 'Moderate' ? 1.0 : 0.8;
    
    return (baseSpeed * intensityMultiplier * minutes) / 60;
  };
  
  // Calculate steps for specific exercise types
  for (const [activityType, stepsPerMileValue] of Object.entries(stepsPerMile)) {
    if (exerciseType.includes(activityType)) {
      const estimatedDistance = estimateDistance(activityType, durationMinutes, intensity, speed);
      let steps = Math.round(estimatedDistance * stepsPerMileValue);
      
      // Apply incline bonus for applicable exercises
      if (incline && incline > 0 && (exerciseType.includes('treadmill') || exerciseType.includes('walking'))) {
        const inclineBonus = 1 + (incline * 0.02); // 2% bonus per incline percent
        steps = Math.round(steps * inclineBonus);
      }
      
      return steps;
    }
  }
  
  return Math.round(durationMinutes * 15); // minimal movement steps
};

/**
 * Special Slide Board intensity calculation
 */
const calculateSlideBoardCalories = (duration: number, inclineLevel: number): number => {
  const durationMinutes = duration / 60;
  const baseCaloriesPerMinute = 8;
  
  const intensityMultipliers = {
    1: 0.8, 2: 0.9,  // Low intensity (levels 1-2)
    3: 1.0, 4: 1.1,  // Average intensity (levels 3-4)
    5: 1.3, 6: 1.5,  // High intensity (levels 5-6)
    7: 1.8, 8: 2.0   // Extremely high intensity (levels 7-8)
  };
  
  const multiplier = intensityMultipliers[inclineLevel as keyof typeof intensityMultipliers] || 1.0;
  return Math.round(durationMinutes * baseCaloriesPerMinute * multiplier);
};

/**
 * Enhanced AI-powered steps calculation with cardio data integration
 */
export const calculateStepsFromWorkout = (workout: Workout, allExercises: Exercise[] = [], cardioData?: any): number => {
  const { exercises: exerciseIds, sets, totalTime } = workout;
  let estimatedSteps = 0;
  
  const duration = totalTime || 0; // in seconds
  const durationMinutes = duration / 60;

  // Get exercise details
  const workoutExercises = exerciseIds.map(id => 
    allExercises.find(ex => ex.id === id)
  ).filter(Boolean) as Exercise[];

  workoutExercises.forEach(exercise => {
    const exerciseName = exercise.name.toLowerCase();
    const exerciseCategory = exercise.category?.toLowerCase() || '';
    const exerciseSets = sets.filter(set => set.exerciseId === exercise.id);
    const exerciseCardioData = cardioData?.[exercise.id];
    
    // Check if this is a cardio exercise
    const isCardioExercise = exerciseCategory.includes('cardio') || 
                           exerciseName.includes('treadmill') || exerciseName.includes('elliptical') ||
                           exerciseName.includes('running') || exerciseName.includes('walking') ||
                           exerciseName.includes('cycling') || exerciseName.includes('bike') ||
                           exerciseName.includes('stair') || exerciseName.includes('step');
    
    if (isCardioExercise && exerciseCardioData) {
      // Use enhanced cardio calculation with collected data
      estimatedSteps += calculateCardioSteps(
        exercise, 
        duration, 
        exerciseCardioData.intensity,
        exerciseCardioData.speed,
        exerciseCardioData.incline
      );
    } else if (isCardioExercise) {
      // Fallback to basic cardio calculation
      if (exerciseName.includes('treadmill')) {
        estimatedSteps += durationMinutes * 120;
      } else if (exerciseName.includes('elliptical')) {
        estimatedSteps += durationMinutes * 100;
      } else if (exerciseName.includes('running') || exerciseName.includes('jog')) {
        estimatedSteps += durationMinutes * 160;
      } else if (exerciseName.includes('walking')) {
        estimatedSteps += durationMinutes * 100;
      } else if (exerciseName.includes('stair') || exerciseName.includes('step')) {
        estimatedSteps += durationMinutes * 140;
      } else if (exerciseName.includes('cycling') || exerciseName.includes('bike')) {
        estimatedSteps += durationMinutes * 80;
      } else {
        estimatedSteps += durationMinutes * 90;
      }
    } else {
      // Weight training and other exercises: minimal step equivalent
      const exerciseSetsCount = exerciseSets.length;
      const stepsPerSet = 15; // movement between exercises/sets
      estimatedSteps += exerciseSetsCount * stepsPerSet;
    }
  });

  return Math.round(estimatedSteps);
};

/**
 * Enhanced calorie calculation using cardio data
 */
export const calculateEnhancedCalories = (workout: Workout, allExercises: Exercise[] = [], cardioData: Record<string, any>): number => {
  const duration = workout.totalTime || 0; // in seconds
  const durationMinutes = duration / 60;
  
  const workoutExercises = workout.exercises.map(id => 
    allExercises.find(ex => ex.id === id)
  ).filter(Boolean) as Exercise[];

  let totalCalories = 0;

  workoutExercises.forEach(exercise => {
    const exerciseCardioData = cardioData[exercise.id];
    if (exerciseCardioData) {
      let baseCalories = durationMinutes * 8; // Base calories per minute
      
      // Apply intensity multiplier
      const intensityMultipliers = {
        "Low": 0.8, "Moderate": 1.0, "High": 1.3, "Very High": 1.6
      };
      baseCalories *= intensityMultipliers[exerciseCardioData.intensity as keyof typeof intensityMultipliers] || 1.0;
      
      // Apply incline bonus
      if (exerciseCardioData.incline) {
        baseCalories *= (1 + parseFloat(exerciseCardioData.incline) * 0.03);
      }
      
      // Apply resistance bonus  
      if (exerciseCardioData.resistance) {
        baseCalories *= (1 + parseFloat(exerciseCardioData.resistance) * 0.02);
      }
      
      totalCalories += baseCalories;
    }
  });

  return Math.round(totalCalories || (durationMinutes * 5)); // Fallback to basic calculation
};

/**
 * Check if workout contains cardio exercises
 */
export const hasCardioExercises = (workout: Workout, allExercises: Exercise[] = []): boolean => {
  const workoutExercises = workout.exercises.map(id => 
    allExercises.find(ex => ex.id === id)
  ).filter(Boolean) as Exercise[];

  return workoutExercises.some(exercise => {
    const exerciseName = exercise.name.toLowerCase();
    const exerciseCategory = exercise.category?.toLowerCase() || '';
    
    return exerciseCategory.includes('cardio') || 
           exerciseName.includes('treadmill') || exerciseName.includes('elliptical') ||
           exerciseName.includes('running') || exerciseName.includes('walking') ||
           exerciseName.includes('cycling') || exerciseName.includes('bike') ||
           exerciseName.includes('stair') || exerciseName.includes('step') ||
           exerciseName.includes('slide board');
  });
};

/**
 * Advanced step calculation considering user profile and workout intensity
 */
export const calculateAdvancedSteps = (
  workout: Workout, 
  allExercises: Exercise[] = [], 
  userProfile?: UserProfile
): number => {
  const baseSteps = calculateStepsFromWorkout(workout, allExercises);
  
  // Adjust for user height/stride length
  let strideAdjustment = 1;
  if (userProfile?.height) {
    // Average height is ~170cm, adjust based on user's height
    strideAdjustment = userProfile.height / 170;
  }
  
  // Adjust for workout intensity (heart rate, weight used, etc.)
  const intensityMultiplier = calculateIntensityMultiplier(workout);
  
  return Math.round(baseSteps * strideAdjustment * intensityMultiplier);
};

/**
 * Calculate intensity multiplier based on workout data
 */
const calculateIntensityMultiplier = (workout: Workout): number => {
  let intensityScore = 1;
  
  // Heart rate intensity
  if (workout.avgHeartRate) {
    // Assuming max HR around 220 - age (estimate 180 as average max)
    const hrIntensity = workout.avgHeartRate / 180;
    intensityScore *= (1 + hrIntensity * 0.2); // Up to 20% bonus for high HR
  }
  
  // Workout duration intensity
  if (workout.totalTime) {
    const durationMinutes = workout.totalTime / 60;
    if (durationMinutes > 60) {
      intensityScore *= 1.1; // 10% bonus for longer workouts
    } else if (durationMinutes < 15) {
      intensityScore *= 0.9; // 10% reduction for very short workouts
    }
  }
  
  // Sets intensity (more sets = more movement)
  const totalSets = workout.sets?.length || 0;
  if (totalSets > 20) {
    intensityScore *= 1.15; // 15% bonus for high-volume workouts
  } else if (totalSets < 5) {
    intensityScore *= 0.85; // 15% reduction for low-volume workouts
  }
  
  return Math.min(intensityScore, 1.5); // Cap at 50% bonus
};

/**
 * Get estimated steps for specific exercise types (for UI display)
 */
export const getExerciseStepsRate = (exerciseName: string, exerciseCategory?: string): number => {
  const name = exerciseName.toLowerCase();
  const category = exerciseCategory?.toLowerCase() || '';
  
  if (name.includes('treadmill') || category.includes('cardio')) return 120;
  if (name.includes('running') || name.includes('jog') || category.includes('cardio')) return 160;
  if (name.includes('walking') || category.includes('cardio')) return 100;
  if (name.includes('elliptical') || category.includes('cardio')) return 100;
  if (name.includes('stair') || name.includes('step') || category.includes('cardio')) return 140;
  if (name.includes('cycling') || category.includes('cardio') || name.includes('bike')) return 80;
  if (category.includes('cardio') || name.includes('cardio')) return 90;
  
  return 15; // Default for weight training (steps per set)
};