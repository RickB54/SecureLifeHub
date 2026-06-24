import { useCallback } from 'react';
import { Workout } from '@/lib/data';
import { HealthMetric } from '@/lib/workoutTypes';
import { calculateStepsFromWorkout, calculateEnhancedCalories } from '@/lib/aiStepsCalculation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { format } from 'date-fns';

/**
 * Hook for integrating workout data into health metrics
 */
export const useHealthMetricsIntegration = () => {
    const { user } = useAuth();

    const integrateWorkoutToHealthMetrics = useCallback(async (workout: Workout, cardioData?: Record<string, any>) => {
    console.log('🔄 Starting workout integration:', workout);
    
    if (!user) {
        console.warn("User not logged in, skipping cloud sync for health metrics");
        return { error: true, message: "User not logged in" };
    }

    try {
      // Check if metric already exists for this workout
      const existingMetrics = await api.healthMetrics.list();
      const alreadySynced = existingMetrics.some(m => m.workoutId === workout.id);

      if (alreadySynced) {
        console.log(`⏭️ Workout ${workout.id} already synced, skipping`);
        return { alreadySynced: true, enhancedWorkout: workout };
      }
      
      // Calculate enhanced calories
      let caloriesBurned = workout.caloriesBurned || 0;
      if (cardioData) {
        const allExercises = await api.exercises.list(); 
        caloriesBurned = calculateEnhancedCalories(workout, allExercises, cardioData);
      } else if (!caloriesBurned && workout.totalTime) {
        const minutes = workout.totalTime / 60;
        const workoutType = workout.type?.toLowerCase() || '';
        const isCardio = workoutType.includes('cardio') || workoutType.includes('running') || workoutType.includes('cycling');
        caloriesBurned = Math.round(minutes * (isCardio ? 10 : 5));
      }
      
      // Calculate steps
      let calculatedSteps = workout.steps || 0;
      if (!calculatedSteps) {
        try {
           const allExercises = await api.exercises.list();
           calculatedSteps = calculateStepsFromWorkout(workout, allExercises, cardioData);
        } catch (error) {
          console.warn('Failed to calculate steps:', error);
          calculatedSteps = 0;
        }
      }
      
      // Create enhanced workout object
      const enhancedWorkout = {
        ...workout,
        caloriesBurned: caloriesBurned,
        steps: calculatedSteps,
        cardioData: cardioData || undefined,
        enhancedCalculations: !!cardioData
      };
      
      const today = new Date();
      const todayDateString = format(today, 'yyyy-MM-dd'); // Store as local date string
      const workoutDurationMinutes = workout.totalTime ? Math.round(workout.totalTime / 60) : 0;
      
      // Create new Health Metric entry
      const completionTimestamp = workout.startTime + (workout.totalTime || 0) * 1000;
      
      // We create a NEW entry for this specific workout. 
      // The backend or UI can aggregate them by date.
      const newMetric = {
          date: todayDateString,
          workoutId: workout.id,
          timestamp: completionTimestamp,
          caloriesBurned: caloriesBurned,
          duration: workoutDurationMinutes,
          avgHeartRate: workout.avgHeartRate,
          maxHeartRate: workout.maxHeartRate,
          steps: calculatedSteps,
          distance: workout.smartwatchDistance || 0,
          avgSpeed: workout.avgSpeed,
          fromSmartwatch: workout.fromSmartwatch || false
      };

      await api.healthMetrics.create(newMetric, user.id);
      
      console.log('✅ Workout data integrated into cloud health metrics');
      
      return { success: true, enhancedWorkout };
    } catch (error) {
      console.error('Failed to integrate workout into health metrics:', error);
      return { error: true, enhancedWorkout: workout };
    }
  }, [user]);

  return {
    integrateWorkoutToHealthMetrics
  };
};