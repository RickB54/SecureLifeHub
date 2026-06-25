
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import {
  Workout,
  WorkoutSet,
  generateId,
  SavedWorkoutTemplate,
  WorkoutPlanOverride
} from "@/components/gdft/lib/data";
import { ExerciseCategory } from "@/components/gdft/lib/exerciseTypes";
import { toast } from "sonner";
import { calculateCalories, formatNumber } from "@/components/gdft/lib/formatters";
import { healthConnectService, type HealthConnectWorkout } from "@/components/gdft/lib/healthConnect";
import { useHealthMetricsIntegration } from "@/components/gdft/hooks/useHealthMetricsIntegration";
import { useExercise } from "@/components/gdft/contexts/ExerciseContext";
import { useSettings } from "@/components/gdft/contexts/SettingsContext";
import { ScheduledWorkout } from "@/components/gdft/lib/types";
import { format } from "date-fns";
import { hasCardioExercises } from "@/components/gdft/lib/aiStepsCalculation";
import { CardioDataCollectionModal } from "@/components/gdft/components/ui/CardioDataCollectionModal";
import { api } from "@/components/gdft/lib/api";
import { useAuth } from "@/components/auth-provider";
import confetti from 'canvas-confetti';

import { 
  PR, 
  HealthMetric, 
  BodyMeasurement, 
  PlanExercise, 
  PlanDay, 
  CustomPlan 
} from "@/components/gdft/lib/workoutTypes";

interface WorkoutProviderProps {
  children: ReactNode;
}

// Types migrated to @/lib/workoutTypes.ts

interface WorkoutContextType {
  workouts: Workout[];
  currentWorkout: Workout | null;
  savedWorkoutTemplates: SavedWorkoutTemplate[];

  customPlans: CustomPlan[];
  bodyMeasurements: BodyMeasurement[];
  healthMetrics: HealthMetric[];
  scheduledWorkouts: ScheduledWorkout[];
  achievedPrs: PR[];
  startWorkout: (type: string, exerciseIds: string[], planOverrides?: WorkoutPlanOverride[], workoutName?: string) => void;
  startSavedWorkout: (templateId: string) => void;
  endWorkout: () => void;
  cancelWorkout: () => void;
  addSet: (exerciseId: string, previousSet?: WorkoutSet | null, exerciseSettings?: any) => string | null | undefined;
  completeSet: (setId: string) => void;
  skipSet: (setId: string) => void;
  updateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
  updateWorkout: (updatedWorkout: any) => void;
  updateCurrentWorkoutNotes: (notes: string) => void;
  getWorkoutStats: () => {
    totalWorkouts: number;
    totalTime: number;
    totalSets: number;
    totalReps: number;
    totalCalories: number;
  };
  navigateToExercise: (exerciseId: string) => void;
  currentExerciseIndex: number;
  setCurrentExerciseIndex: (index: number) => void;
  navigateToNextExercise: () => void;
  navigateToPreviousExercise: () => void;
  saveCustomWorkout: (name: string) => void;
  saveWorkoutTemplate: (name: string, exerciseIds: string[], type: ExerciseCategory | "Custom") => void;
  deleteSavedWorkout: (templateId: string) => void;
  deleteWorkout: (workoutId: string) => void;
  archiveWorkout: (id: string, isArchived: boolean) => Promise<void>;
  addBodyMeasurement: (measurement: Omit<BodyMeasurement, "id">) => Promise<void>;
  updateBodyMeasurement: (id: string, updates: Partial<BodyMeasurement>) => Promise<void>;
  deleteBodyMeasurement: (id: string) => Promise<void>;
  getBodyMeasurements: () => BodyMeasurement[];
  addHealthMetric: (metric: Omit<HealthMetric, "id">) => Promise<void>;
  updateHealthMetric: (id: string, updates: Partial<HealthMetric>) => Promise<void>;
  deleteHealthMetric: (id: string) => void;
  getHealthMetrics: () => HealthMetric[];
  refreshHealthMetrics: () => void;
  saveCustomPlan: (plan: Omit<CustomPlan, "id" | "createdAt">) => void;
  updateCustomPlan: (planId: string, updates: Partial<CustomPlan>) => void;
  deleteCustomPlan: (planId: string) => void;
  getCustomPlans: () => CustomPlan[];
  purgeWorkoutsOnly: () => Promise<void>;
  purgeAnalyticsOnly: () => Promise<void>;
  purgePersonalStatsOnly: () => Promise<void>;
  purgeCustomPlansOnly: () => Promise<void>;
  deleteStatsData: () => void;
  // New smartwatch sync methods
  initializeHealthConnect: () => Promise<boolean>;
  syncSmartwatchWorkouts: () => Promise<void>;
  createSmartwatchWorkout: (healthData: HealthConnectWorkout) => Promise<string>;
  updateSmartwatchWorkout: (workoutId: string, exerciseData: any[]) => void;
  addExerciseToCurrentWorkout: (exerciseId: string) => void;
  // Scheduled Workouts
  addScheduledWorkout: (workout: Omit<ScheduledWorkout, "id">) => Promise<void>;
  updateScheduledWorkout: (id: string, updates: Partial<ScheduledWorkout>) => Promise<void>;
  deleteScheduledWorkout: (id: string) => Promise<void>;
  migrateLocalData: () => Promise<void>;
  refreshWorkoutData: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { exercises: allExercises } = useExercise();
  const { unitSystem } = useSettings();
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showFinishWorkoutConfirmation, setShowFinishWorkoutConfirmation] = useState(false); // Unused but kept for logic if needed
  const [cardioDataModalOpen, setCardioDataModalOpen] = useState(false);
  const [pendingWorkoutData, setPendingWorkoutData] = useState<{ workout: Workout; exercises: any[] } | null>(null);
  const currentWorkoutRef = useRef(currentWorkout);
  // We keep the hook for calculations, but we might bypass its storage side-effects
  const { integrateWorkoutToHealthMetrics } = useHealthMetricsIntegration();

  useEffect(() => {
    currentWorkoutRef.current = currentWorkout;
    // localStorage support removed as per user request
  }, [currentWorkout]);

  // removed workouts sync to localStorage

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [savedWorkoutTemplates, setSavedWorkoutTemplates] = useState<SavedWorkoutTemplate[]>([]);
  const [workoutPlanOverrides, setWorkoutPlanOverrides] = useState<WorkoutPlanOverride[] | null>(null);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [achievedPrs, setAchievedPrs] = useState<PR[]>([]);
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);
  const [loading, setLoading] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    if (!user) {
        // Load from localStorage if no user (Legacy/Mock)
        // Or just empty
        console.log("No user, loading local data (if any)");
        // ... Logic to load from local storage could go here for backward compatibility
        // But strict Supabase integration requested.
        return;
    }

    try {
        setLoading(true);
        const [wData, tData, pData, mData, hData, sData, profData] = await Promise.all([
            api.workouts.list().catch(e => { console.error("Error loading workouts:", e); return []; }),
            api.savedTemplates.list().catch(e => { console.error("Error loading templates:", e); return []; }),
            api.customPlans.list().catch(e => { console.error("Error loading plans:", e); return []; }),
            api.measurements.list().catch(e => { console.error("Error loading measurements:", e); return []; }),
            api.healthMetrics.list().catch(e => { console.error("Error loading health metrics:", e); return []; }),
            api.scheduledWorkouts.list().catch(e => { console.error("Error loading scheduled workouts:", e); return []; }),
            api.profiles.get().catch(e => { console.error("Error loading profile:", e); return { achievedPrs: [] }; })
        ]);

        setSavedWorkoutTemplates(tData);
        setCustomPlans(pData);
        setBodyMeasurements(mData);
        setHealthMetrics(hData);
        setScheduledWorkouts(sData);
        setAchievedPrs((profData as any).achievedPrs || []);

        // Filter out cancelled workouts from the displayed list so they never appear in stats/history/calendar
        const visibleWorkouts = wData.filter((w: any) => !w.cancelled);
        setWorkouts(visibleWorkouts);

        // Check for uncompleted workout to resume (must not be cancelled)
        if (visibleWorkouts.length > 0) {
            // Find the MOST RECENT uncompleted, non-cancelled workout
            const uncompleted = visibleWorkouts
                .filter((w: any) => !w.completed && !w.cancelled)
                .sort((a: any, b: any) => b.startTime - a.startTime)[0];

            if (uncompleted) {
                const isRecent = (Date.now() - uncompleted.startTime) < 24 * 60 * 60 * 1000;

                if (isRecent) {
                    console.log("Resuming active workout from Cloud:", uncompleted);
                    setCurrentWorkout(uncompleted);
                    if (uncompleted.workoutPlanOverrides) {
                        setWorkoutPlanOverrides(uncompleted.workoutPlanOverrides);
                    }
                } else {
                    console.log("Found uncompleted workout but it is stale (>24h). Ignoring.", uncompleted);
                    // Mark stale uncompleted workouts as cancelled (not completed!) so they never show in stats
                    api.workouts.update(uncompleted.id, { cancelled: true, completed: false }).catch(console.error);
                }
            }
        }
    } catch (e) {
        console.error(e);
        toast.error("Failed to load workout data from cloud");
    } finally {
        setLoading(false);
    }
  }, [user]);

  const migrateLocalData = useCallback(async () => {
      if (!user) return;

      const keys = [
          { key: 'workouts', api: api.workouts.create, label: 'Workouts' },
          { key: 'savedWorkoutTemplates', api: api.savedTemplates.create, label: 'Templates' },
          { key: 'customPlans', api: api.customPlans.create, label: 'Plans' },
          { key: 'bodyMeasurements', api: api.measurements.create, label: 'Measurements' },
          { key: 'healthMetrics', api: api.healthMetrics.create, label: 'Health Metrics' },
          { key: 'scheduledWorkouts', api: api.scheduledWorkouts.create, label: 'Schedule' }
      ];

      let migratedCount = 0;

      for (const { key, api: createFn, label } of keys) {
          const localData = localStorage.getItem(key);
          if (localData) {
              try {
                  const parsed = JSON.parse(localData);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                      console.log(`Migrating ${parsed.length} ${label} from local storage...`);
                      let successCount = 0;
                      for (const item of parsed) {
                           try {
                               // Handle ID: If it's not a valid UUID, remove it to let Supabase generate one
                               if (item.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)) {
                                   console.warn(`[migration] Invalid UUID found in local storage for ${label}: ${item.id}. Omitting.`);
                                   delete item.id;
                               }
                               
                               // Fix dates for ScheduledWorkouts and others if needed
                               if (key === 'scheduledWorkouts' && item.date) {
                                   item.date = new Date(item.date);
                                   if (isNaN(item.date.getTime())) {
                                       console.warn(`[migration] Skipping ${label} item with invalid date:`, item);
                                       continue;
                                   }
                               }
                               
                               await createFn(item, user.id);
                               successCount++;
                           } catch (e) {
                               console.warn(`Failed to migrate a ${label} item`, e);
                           }
                      }
                      if (successCount > 0) {
                          toast.success(`Migrated ${successCount} ${label} to cloud`);
                          migratedCount += successCount;
                          // Clear local storage for this key
                          localStorage.removeItem(key);
                      }
                  }
              } catch (e) {
                  console.error(`Error migrating ${key}`, e);
              }
          }
      }
      
      if (migratedCount > 0) {
        // Refresh data after migration
         const [wData, tData, pData, mData, hData, sData] = await Promise.all([
              api.workouts.list(),
              api.savedTemplates.list(),
              api.customPlans.list(),
              api.measurements.list(),
              api.healthMetrics.list(),
              api.scheduledWorkouts.list()
          ]);
          setWorkouts(wData);
          setSavedWorkoutTemplates(tData);
          setCustomPlans(pData);
          setBodyMeasurements(mData);
          setHealthMetrics(hData);
          setScheduledWorkouts(sData);
    }
  }, [user]);

  useEffect(() => {
    const loadLocalData = () => {
        // No-op as per user request: "always go to Supabase"
        console.log("Local data loading skipped (Supabase only mode)");
    };
    
    if (user) {
        loadData().then(() => {
            migrateLocalData();
        });
        initializeHealthConnect(true).then((available) => {
            if (available) syncSmartwatchWorkouts(true);
        });
    } else {
        loadLocalData();
    }
  }, [user, loadData, migrateLocalData]);

  // Function to update notes for the current workout
  const updateCurrentWorkoutNotes = async (notes: string) => {
    if (currentWorkout) {
      setCurrentWorkout(prevWorkout => {
        if (!prevWorkout) return null;
        return { ...prevWorkout, notes };
      });
      if (user) {
          try {
              await api.workouts.update(currentWorkout.id, { notes });
          } catch(e) {}
      }
    }
  };

  const initializeHealthConnect = async (silent: boolean = false): Promise<boolean> => {
     const isAvailable = await healthConnectService.initialize();
     if (!isAvailable && !silent) {
         console.log("Health Connect not available on this platform/device");
     }
     return isAvailable;
  };

  const syncSmartwatchWorkouts = async (silent: boolean = false): Promise<void> => {
    try {
      const isAvailable = await healthConnectService.initialize();
      if (!isAvailable) return;

      const hasPerms = await healthConnectService.checkPermissions();
      if (!hasPerms) {
          if (!silent) toast.info("Smartwatch sync requires permissions to be granted.");
          return;
      }

      if (!silent) toast.loading("Syncing with smartwatch...", { id: 'smartwatch-sync' });

      // 1. Sync Workouts
      const recentWorkouts = await healthConnectService.getRecentWorkouts(7);
      let newWorkoutsCount = 0;
      
      for (const healthWorkout of recentWorkouts) {
        // Check local duplicate
        const existingWorkout = workouts.find(w => 
          w.fromSmartwatch && 
          w.date === healthWorkout.startTime.toISOString() &&
          Math.abs((w.duration || 0) - healthWorkout.duration) < 2
        );

        if (!existingWorkout) {
          await createSmartwatchWorkout(healthWorkout);
          newWorkoutsCount++;
        }
      }

      // 2. Sync Daily Metrics (Steps, Sleep, etc.)
      const dailyMetrics = await healthConnectService.getHealthMetricsForRange(7);
      
      for (const hMetric of dailyMetrics) {
          const existingMetric = healthMetrics.find(m => m.date === hMetric.date && m.fromSmartwatch);
          
          const metricData: Partial<HealthMetric> = {
              date: hMetric.date,
              steps: hMetric.steps,
              caloriesBurned: hMetric.caloriesBurned,
              sleepDurationHours: hMetric.sleepDurationHours,
              avgHeartRate: hMetric.avgHeartRate,
              maxHeartRate: hMetric.maxHeartRate,
              weight: hMetric.weight,
              fromSmartwatch: true
          };

          if (existingMetric) {
              await api.healthMetrics.update(existingMetric.id, metricData);
          } else {
              if (user) {
                  await api.healthMetrics.create(metricData, user.id);
              }
          }
      }

      // Refresh local state
      if (user) {
          const updatedMetrics = await api.healthMetrics.list();
          setHealthMetrics(updatedMetrics);
      }

      if (!silent) {
          toast.success(`Sync complete! Found ${newWorkoutsCount} new workouts.`, { id: 'smartwatch-sync' });
      } else {
          console.log(`Background sync complete. Found ${newWorkoutsCount} new workouts.`);
      }
    } catch (error) {
      console.error('Failed to sync smartwatch data:', error);
      if (!silent) toast.error('Failed to sync smartwatch data', { id: 'smartwatch-sync' });
    }
  };

  const createSmartwatchWorkout = async (healthData: HealthConnectWorkout): Promise<string> => {
    const smartwatchWorkout: Workout = {
      id: generateId(),
      name: `${healthData.workoutType} (Smartwatch)`,
      exercises: [],
      date: healthData.startTime.toISOString(),
      duration: Math.round(healthData.duration),
      completed: true,
      fromSmartwatch: true,
      caloriesBurned: healthData.caloriesBurned,
      avgHeartRate: healthData.avgHeartRate,
      maxHeartRate: healthData.maxHeartRate,
      steps: healthData.steps,
      startTime: healthData.startTime.getTime(),
      totalTime: Math.round(healthData.duration * 60),
      type: 'Cardio', 
      sets: []
    };

    if (user) {
        const createdWorkout = await api.workouts.create(smartwatchWorkout, user.id);
        
        // Also create health metric for smartwatch workout
        try {
            const today = format(new Date(smartwatchWorkout.startTime), 'yyyy-MM-dd');
            const newMetric = {
                date: today,
                workoutId: smartwatchWorkout.id,
                timestamp: smartwatchWorkout.startTime + (smartwatchWorkout.totalTime || 0) * 1000,
                caloriesBurned: smartwatchWorkout.caloriesBurned,
                steps: smartwatchWorkout.steps,
                distance: smartwatchWorkout.smartwatchDistance, // Ensure this property exists on Workout type or use correct mapping
                duration: Math.round((smartwatchWorkout.totalTime || 0) / 60),
                avgHeartRate: smartwatchWorkout.avgHeartRate,
                maxHeartRate: smartwatchWorkout.maxHeartRate,
                avgSpeed: smartwatchWorkout.avgSpeed,
                fromSmartwatch: true
            };
            const createdMetric = await api.healthMetrics.create(newMetric, user.id);
            setHealthMetrics(prev => [createdMetric, ...prev]);
        } catch (e) {
            console.error("Failed to create health metric for smartwatch workout", e);
        }
    }
    setWorkouts(prev => [smartwatchWorkout, ...prev]);
    return smartwatchWorkout.id;
  };

  const updateSmartwatchWorkout = (workoutId: string, exerciseData: any[]): void => {
     console.warn("Update Smartwatch Workout not fully implemented in API yet");
  };

  const getLatestSetFromHistory = useCallback((exerciseId: string): WorkoutSet | null => {
    const completedWorkouts = [...workouts]
      .filter(w => w.completed)
      .sort((a, b) => b.startTime - a.startTime);
    
    for (const w of completedWorkouts) {
      if (!w.sets) continue;
      const exerciseSets = w.sets.filter(s => s.exerciseId === exerciseId && s.completed);
      if (exerciseSets.length > 0) {
        return exerciseSets[exerciseSets.length - 1];
      }
    }
    return null;
  }, [workouts]);

  const applySetData = (target: WorkoutSet, source: any) => {
    if (source.weight !== undefined) target.weight = source.weight;
    if (source.reps !== undefined) target.reps = source.reps;
    if (source.time !== undefined) target.time = source.time;
    if (source.distance !== undefined) target.distance = source.distance;
    if (source.incline !== undefined) target.incline = source.incline;
    if (source.duration !== undefined) target.duration = source.duration;
    if (source.avgHeartRate !== undefined) target.avgHeartRate = source.avgHeartRate;
    if (source.maxHeartRate !== undefined) target.maxHeartRate = source.maxHeartRate;
    if (source.steps !== undefined) target.steps = source.steps;
  };

  const isSpecified = (s: any) => {
    if (!s) return false;
    return (s.weight && s.weight > 0) || 
           (s.reps && s.reps > 0) || 
           (s.time && s.time > 0) || 
           (s.distance && s.distance > 0) || 
           (s.incline && s.incline > 0) ||
           (s.duration && s.duration > 0);
  };

  const startWorkout = useCallback((type: string, exerciseIds: string[], planOverrides?: WorkoutPlanOverride[], workoutName?: string) => {
    if (currentWorkoutRef.current) {
      const isGhostWorkout = (currentWorkoutRef.current.exercises?.length || 0) === 0;
      
      if (!isGhostWorkout) {
        const confirmation = window.confirm("An active workout is in progress. Start new one? (Ends current)");
        if (!confirmation) return;
      }
      
      const toDeleteId = currentWorkoutRef.current.id;
      
      // Force clear to prevent phantom state
      setCurrentWorkout(null);
      currentWorkoutRef.current = null;
      
      // FIX: Clean up the abandoned workout from DB
      if (user) {
          api.workouts.delete(toDeleteId).then(() => {
              console.log("Cancelled/Deleted ghost or conflicted active workout from DB");
          }).catch(e => console.error("Failed to delete conflicted workout", e));
      }
    }
    
    // ... same logic
    const newWorkout: Workout = {
      id: generateId(),
      name: workoutName || (type === "Custom" ? "Custom Workout" : `${type} Workout`),
      exercises: exerciseIds,
      sets: [],
      startTime: Date.now(),
      type: type as ExerciseCategory | "Custom",
      workoutPlanOverrides: planOverrides,
    };

    // Prefill one set for EVERY exercise suggested by user
    if (exerciseIds.length > 0) {
        const initialSets: WorkoutSet[] = exerciseIds.map(exId => {
            const exercise = allExercises.find(e => e.id === exId);
            const newSet: WorkoutSet = {
                id: generateId(),
                exerciseId: exId,
                completed: false,
                timestamp: Date.now(),
            };
            
            const settings = exercise?.settings as any;
            const historySet = getLatestSetFromHistory(exId);
            const planOverride = planOverrides?.find(p => p.exerciseId === exId);

            if (planOverride) {
                if (planOverride.weight) newSet.weight = Number(planOverride.weight);
                if (planOverride.reps) newSet.reps = Number(planOverride.reps);
                if (planOverride.time) newSet.time = Number(planOverride.time);
                if (planOverride.distance) newSet.distance = Number(planOverride.distance);
                if (planOverride.incline) newSet.incline = Number(planOverride.incline);
            } else if (isSpecified(settings)) {
                applySetData(newSet, settings);
            } else if (historySet) {
                applySetData(newSet, historySet);
            } else if (settings) {
                applySetData(newSet, settings);
            }
            
            return newSet;
        });
        newWorkout.sets = initialSets;
    }

    setCurrentWorkout(newWorkout);
    currentWorkoutRef.current = newWorkout;
    setWorkoutPlanOverrides(planOverrides || null);
    setCurrentExerciseIndex(0);
    
    // Create in Supabase immediately for refresh-protection
    if (user) {
        api.workouts.create(newWorkout, user.id).then(() => {
            console.log("Workout created in Supabase");
        }).catch(e => {
            console.error("Failed to pre-create workout in Supabase", e);
            toast.error("Cloud sync failed. Working offline.");
        });
    }

    toast.success(`Started ${newWorkout.name}`, { duration: 2000, id: 'workout-started' });
  }, [user, allExercises, getLatestSetFromHistory]);

  const startSavedWorkout = (templateId: string) => {
    const template = savedWorkoutTemplates.find(t => t.id === templateId);
    if (template) {
      startWorkout(template.type, template.exercises, template.workoutPlanOverrides, template.name);
    } else {
      toast.error("Saved workout not found");
    }
  };

  const completeWorkoutIntegration = useCallback(async (endedWorkout: Workout, cardioData?: Record<string, any>) => {
    // FIX: Explicitly set completed boolean and destructured correctly to avoid spread overwrites
    const finalWorkout: Workout = {
        ...endedWorkout,
        completed: true 
    };

    // Save to DB
    if (user) {
        try {
            // Use update instead of create because workout was pre-created in startWorkout
            await api.workouts.update(finalWorkout.id, {
                ...finalWorkout,
                endTime: finalWorkout.endTime,
                completed: true // Redundant but safe
            });
            // Sync final sets
            await api.workouts.syncSets(finalWorkout.id, finalWorkout.sets);

            // Also create or update health metric
            const today = format(new Date(), 'yyyy-MM-dd');
            const existingMetric = healthMetrics.find(m => m.date === today);

            const workoutBreakdown = `\n- ${finalWorkout.name}: ${finalWorkout.duration || 0}min, ${finalWorkout.caloriesBurned || 0}cal, ${finalWorkout.steps || 0} steps`;

            if (existingMetric) {
                const combinedDuration = (existingMetric.duration || 0) + (finalWorkout.duration || 0);
                
                // Weighted average for heart rate
                let combinedAvgHeartRate = existingMetric.avgHeartRate;
                if (existingMetric.avgHeartRate && finalWorkout.avgHeartRate) {
                    combinedAvgHeartRate = Math.round(
                        ((existingMetric.avgHeartRate * (existingMetric.duration || 1)) + 
                         (finalWorkout.avgHeartRate * (finalWorkout.duration || 1))) / 
                        (combinedDuration || 1)
                    );
                } else if (finalWorkout.avgHeartRate) {
                    combinedAvgHeartRate = finalWorkout.avgHeartRate;
                }

                const updatedMetric = {
                    ...existingMetric,
                    caloriesBurned: (existingMetric.caloriesBurned || 0) + (finalWorkout.caloriesBurned || 0),
                    steps: (existingMetric.steps || 0) + (finalWorkout.steps || 0),
                    duration: combinedDuration,
                    avgHeartRate: combinedAvgHeartRate,
                    notes: (existingMetric.notes || "Workout Breakdown:") + workoutBreakdown
                };
                
                const savedMetric = await api.healthMetrics.update(existingMetric.id, updatedMetric);
                setHealthMetrics(prev => prev.map(m => m.id === existingMetric.id ? savedMetric : m));
            } else {
                const newMetric = {
                    date: today,
                    workoutId: finalWorkout.id,
                    timestamp: finalWorkout.endTime,
                    caloriesBurned: finalWorkout.caloriesBurned,
                    steps: finalWorkout.steps,
                    duration: finalWorkout.duration, // Workout duration in minutes
                    avgHeartRate: finalWorkout.avgHeartRate,
                    notes: `Workout Breakdown:${workoutBreakdown}`
                };
                const createdMetric = await api.healthMetrics.create(newMetric, user.id);
                setHealthMetrics(prev => [createdMetric, ...prev]);
            }
        } catch (e) {
            console.warn("Failed to update workout or health metric on end, attempting creation fallback", e);
            try {
                // If update failed (likely because record not found), create it as completed
                // Ensure completed is TRUE here
                const hardCompleted = { ...finalWorkout, completed: true };
                await api.workouts.create(hardCompleted, user.id);
            } catch(e2) {
                console.error("Critical failure: Could not save workout even as new record", e2);
                toast.error("Failed to save workout to cloud");
            }
        }
    }

    setWorkouts(prev => [finalWorkout, ...prev.filter(w => w.id !== finalWorkout.id)]);
    setCurrentWorkout(null);
    currentWorkoutRef.current = null;
    setWorkoutPlanOverrides(null);
    
    // Auto-sync after workout
    syncSmartwatchWorkouts(true);
    
    toast.success("Workout completed");
  }, [user, api.workouts, api.healthMetrics, healthMetrics]);

  const endWorkout = useCallback(async () => {
    if (currentWorkoutRef.current) {
      // Prevent ending/saving workouts with zero sets to avoid "ghost" history entries
      const setList = currentWorkoutRef.current.sets || [];
      const completedSets = setList.filter(s => s.completed);
      
      if (setList.length === 0 || (setList.length > 0 && completedSets.length === 0)) {
          const confirmEnd = window.confirm("This workout has no completed sets. End anyway? (It won't be saved to history)");
          if (confirmEnd) {
              cancelWorkout();
              return;
          }
          return;
      }

      const startTime = currentWorkoutRef.current.startTime || Date.now();
      const endTime = Date.now();
      const totalTimeSeconds = Math.floor((endTime - startTime) / 1000);
      const durationMinutes = Math.max(1, Math.floor(totalTimeSeconds / 60));

      // 1. Calculate steps from all sets
      const totalSteps = currentWorkoutRef.current.sets.reduce((sum, set) => sum + (set.steps || 0), 0);

      // 2. Calculate calories
      // Get user's latest weight
      const latestWeightMeasurement = [...bodyMeasurements]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .find(m => m.weight !== undefined);
      
      const weight = latestWeightMeasurement?.weight || (unitSystem === 'imperial' ? 155 : 70);
      const weightKg = unitSystem === 'imperial' ? weight * 0.453592 : weight;
      
      const isCardio = hasCardioExercises(currentWorkoutRef.current, allExercises);
      
      // Calculate calories: prefer sum of sets if they have caloriesBurned, else fallback to total calculation
      const setsWithCalories = currentWorkoutRef.current.sets.filter(s => s.caloriesBurned && s.caloriesBurned > 0);
      let caloriesBurned = 0;
      if (setsWithCalories.length > 0) {
          caloriesBurned = Math.round(currentWorkoutRef.current.sets.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0));
      } else {
          caloriesBurned = calculateCalories(durationMinutes, weightKg, isCardio);
      }

      const endedWorkout: Workout = {
        ...currentWorkoutRef.current,
        endTime,
        totalTime: totalTimeSeconds,
        duration: durationMinutes,
        steps: totalSteps > 0 ? totalSteps : (currentWorkoutRef.current.steps || 0),
        caloriesBurned: caloriesBurned,
      };

      await completeWorkoutIntegration(endedWorkout);
    }
  }, [bodyMeasurements, unitSystem, allExercises, completeWorkoutIntegration]);

  const addSet = useCallback((exerciseId: string, previousSet: WorkoutSet | null = null, exerciseSettings: any = null): string | null | undefined => {
     let newSetId: string | null = null;
    setCurrentWorkout((prev) => {
      if (!prev) {
        console.error("Cannot add set: No current workout");
        return null;
      }

      const newSet: WorkoutSet = {
        id: generateId(),
        exerciseId,
        completed: false,
        timestamp: Date.now(),
      };
      newSetId = newSet.id;

      const planOverride = workoutPlanOverrides?.find(p => p.exerciseId === exerciseId);

      // Task 4 Implementation: Sticky Set Data
      // Find the most recent set of the same exercise in current workout
      const lastSameExerciseSet = [...prev.sets].reverse().find(s => s.exerciseId === exerciseId);
      // Find the most recent set in history
      const historySet = getLatestSetFromHistory(exerciseId);

      if (previousSet) {
        applySetData(newSet, previousSet);
      } else if (lastSameExerciseSet) {
        applySetData(newSet, lastSameExerciseSet);
      } else if (planOverride) {
        if (planOverride.weight) newSet.weight = Number(planOverride.weight);
        if (planOverride.reps) newSet.reps = Number(planOverride.reps);
        if (planOverride.time) newSet.time = Number(planOverride.time);
        if (planOverride.distance) newSet.distance = Number(planOverride.distance);
        if (planOverride.incline) newSet.incline = Number(planOverride.incline);
      } else if (isSpecified(exerciseSettings)) {
        applySetData(newSet, exerciseSettings);
      } else if (historySet) {
        applySetData(newSet, historySet);
      } else if (exerciseSettings) {
        applySetData(newSet, exerciseSettings);
      }

      const updatedWorkout = {
        ...prev,
        sets: [...prev.sets, newSet],
      };
      
      // Cloud sync
      if (user) {
          api.workouts.syncSets(prev.id, updatedWorkout.sets).catch(console.error);
          
          // ALSO Update Benchmark Data (Exercise Settings) immediately on add if values were carried over
          const benchmarkData: any = {};
          if (newSet.weight !== undefined) benchmarkData.weight = newSet.weight;
          if (newSet.reps !== undefined) benchmarkData.reps = newSet.reps;
          if (newSet.time !== undefined) benchmarkData.time = newSet.time;
          if (newSet.distance !== undefined) benchmarkData.distance = newSet.distance;
          if (newSet.incline !== undefined) benchmarkData.incline = newSet.incline;
          if (newSet.duration !== undefined) benchmarkData.duration = newSet.duration;
          
          if (Object.keys(benchmarkData).length > 0) {
              const exercise = allExercises.find(e => e.id === exerciseId);
              if (exercise) {
                  api.exercises.update(exerciseId, { 
                      settings: { ...exercise.settings, ...benchmarkData } 
                  }).catch(console.error);
              }
          }
      }

      return updatedWorkout;
    });
    return newSetId;
  }, [workoutPlanOverrides, user, allExercises, getLatestSetFromHistory]);

  // completeSet, skipSet, updateSet, updateWorkout -> pure local state 
  // (updateWorkout updates history but we should sync to DB? updateWorkout was used for editing history?)
  // If updateWorkout is for history, we need api.workouts.update.
  
  const updateWorkout = useCallback(async (updatedWorkout: any) => {
      if (user) {
          try {
              await api.workouts.update(updatedWorkout.id, updatedWorkout);
              await api.workouts.syncSets(updatedWorkout.id, updatedWorkout.sets);
              toast.success("Workout updated in cloud");
          } catch(e) {
              console.error(e);
              toast.error("Failed to update workout in cloud");
          }
      }
      setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
  }, [user]);

  // ... sets logic ...
  // Helper: Check for PRs
  const checkPR = useCallback((workoutSet: WorkoutSet) => {
    if (!user || !workoutSet.weight || workoutSet.weight === 0 || !workoutSet.completed) return;
    
    setAchievedPrs(prevPrs => {
        const newPrs = [...prevPrs];
        let hasNewPr = false;
        const exerciseId = workoutSet.exerciseId;
        const exerciseName = allExercises.find(e => e.id === exerciseId)?.name || 'Exercise';

        // 1. Heaviest Weight
        const currentPr = newPrs.find(p => p.exerciseId === exerciseId && p.type === 'heaviest_weight');
        if (!currentPr || (workoutSet.weight! > currentPr.value)) {
            const newPr: PR = {
                exerciseId,
                type: 'heaviest_weight',
                value: workoutSet.weight!,
                date: Date.now(),
                weight: workoutSet.weight!,
                reps: workoutSet.reps
            };
            const idx = newPrs.findIndex(p => p.exerciseId === exerciseId && p.type === 'heaviest_weight');
            if (idx >= 0) newPrs[idx] = newPr;
            else newPrs.push(newPr);
            
            hasNewPr = true;
            toast.success(`🎉 New PR! Heaviest Weight: ${formatNumber(workoutSet.weight!)} ${unitSystem === 'metric' ? 'kg' : 'lbs'} for ${exerciseName}!`, {
                 duration: 5000,
                 // icon: '🏆' // sonner toast doesn't take icon prop simply like this, but logic is fine
            });
        }
        
        // 2. Best Estimated 1RM
        if (workoutSet.reps && workoutSet.reps > 0) {
            const est1RM = workoutSet.weight! * (1 + workoutSet.reps / 30);
            const current1RM = newPrs.find(p => p.exerciseId === exerciseId && p.type === 'best_1rm');
            
            if (!current1RM || (est1RM > current1RM.value)) {
                const newPr: PR = {
                    exerciseId,
                    type: 'best_1rm',
                    value: est1RM,
                    date: Date.now(),
                    weight: workoutSet.weight!,
                    reps: workoutSet.reps
                };
                 const idx = newPrs.findIndex(p => p.exerciseId === exerciseId && p.type === 'best_1rm');
                 if (idx >= 0) newPrs[idx] = newPr;
                 else newPrs.push(newPr);
                 
                 hasNewPr = true;
            }
        }
        
        // 3. Highest Volume
        if (workoutSet.reps && workoutSet.reps > 0) {
             const volume = workoutSet.weight! * workoutSet.reps;
             const currentVol = newPrs.find(p => p.exerciseId === exerciseId && p.type === 'highest_volume');
             
             if (!currentVol || (volume > currentVol.value)) {
                 const newPr: PR = {
                    exerciseId,
                    type: 'highest_volume',
                    value: volume,
                    date: Date.now(),
                    weight: workoutSet.weight!,
                    reps: workoutSet.reps
                 };
                 const idx = newPrs.findIndex(p => p.exerciseId === exerciseId && p.type === 'highest_volume');
                 if (idx >= 0) newPrs[idx] = newPr;
                 else newPrs.push(newPr);
                 hasNewPr = true;
             }
        }

        if (hasNewPr) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            // Update DB
            api.profiles.update({ achievedPrs: newPrs }).catch(console.error);
            return newPrs;
        }
        
        return prevPrs;
    });
  }, [user, allExercises, unitSystem]);

  const completeSet = useCallback((setId: string) => {
    const workout = currentWorkoutRef.current;
    if (workout) {
      const targetSet = workout.sets.find(s => s.id === setId);

      setCurrentWorkout((prev) => {
        if (!prev) return null;
        
        const updated = {
          ...prev,
          sets: prev.sets.map((set) =>
            set.id === setId ? { ...set, completed: true } : set
          ),
        };
        
        if (user) {
            api.workouts.syncSets(prev.id, updated.sets).catch(console.error);
        }
        return updated;
      });
      
      if (targetSet) {
           // checkPR handles the toast for PR, otherwise we standard toast
           // But checkPR toast is specific.
           // Let's just toast success always? Or only if no PR?
           // checkPR is async-ish (state update).
           checkPR({ ...targetSet, completed: true });
           toast.success("Set completed");
      }
    }
  }, [user, checkPR]);

  const skipSet = useCallback((setId: string) => {
    if (currentWorkoutRef.current) {
        setCurrentWorkout((prev) => {
            if (!prev) return null;
            const updated = {
                ...prev,
                sets: prev.sets.filter((set) => set.id !== setId),
            };
            if (user) {
                api.workouts.syncSets(prev.id, updated.sets).catch(console.error);
            }
            return updated;
        });
        toast.info("Set skipped");
    }
  }, [user]);

  const updateSet = useCallback((setId: string, updates: Partial<WorkoutSet>) => {
    if (currentWorkoutRef.current) {
        setCurrentWorkout((prev) => {
            if (!prev) return null;
            
            const targetSet = prev.sets.find(s => s.id === setId);
            if (!targetSet) return prev;

            const updated = {
                ...prev,
                sets: prev.sets.map((set) =>
                set.id === setId ? { ...set, ...updates } : set
                ),
            };
            
            if (user) {
                api.workouts.syncSets(prev.id, updated.sets).catch(console.error);
                
                // UPDATE BENCHMARK DATA: If reps, weight, incline etc changed, update exercise settings
                const benchmarkFields = ['weight', 'reps', 'time', 'distance', 'incline', 'duration', 'avgHeartRate', 'steps'];
                const changedFields: any = {};
                benchmarkFields.forEach(f => {
                    if ((updates as any)[f] !== undefined) changedFields[f] = (updates as any)[f];
                });

                if (Object.keys(changedFields).length > 0) {
                    const exerciseId = targetSet.exerciseId;
                    const exercise = allExercises.find(e => e.id === exerciseId);
                    if (exercise) {
                        api.exercises.update(exerciseId, { 
                            settings: { ...exercise.settings, ...changedFields } 
                        }).catch(e => console.error("Failed to update benchmark data via updateSet", e));
                    }
                }
            }
            return updated;
        });
    }
  }, [user, allExercises]);

  // ... navigation ...
  const navigateToExercise = useCallback((exerciseId: string) => {
      if (currentWorkoutRef.current) {
          const index = currentWorkoutRef.current.exercises.findIndex(id => id === exerciseId);
          if (index !== -1) setCurrentExerciseIndex(index);
      }
  }, []);
  const navigateToNextExercise = useCallback(() => {
    if (currentWorkoutRef.current && currentExerciseIndex < currentWorkoutRef.current.exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
    }
  }, [currentExerciseIndex]);
  const navigateToPreviousExercise = useCallback(() => {
    if (currentWorkoutRef.current && currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prevIndex => prevIndex - 1);
    }
  }, [currentExerciseIndex]);
  const addExerciseToCurrentWorkout = useCallback((exerciseId: string) => {
     if (currentWorkoutRef.current) {
         setCurrentWorkout(prev => {
             if (!prev) return null;
             const newSet: WorkoutSet = {
                 id: generateId(),
                 exerciseId,
                 completed: false,
                 timestamp: Date.now(),
             };
             const updated = { 
                 ...prev, 
                 exercises: [...prev.exercises, exerciseId],
                 sets: [...prev.sets, newSet]
             };
             if (user) {
                 api.workouts.syncSets(prev.id, updated.sets).catch(console.error);
                 api.workouts.update(prev.id, { exercises: updated.exercises }).catch(console.error);
             }
             return updated;
         });
         toast.success("Exercise added to current workout");
     }
  }, [user]);

  const saveCustomWorkout = useCallback(async (name: string) => {
     if (!currentWorkoutRef.current || !user) return;
     const template: SavedWorkoutTemplate = {
        id: generateId(),
        name: name.trim(),
        exercises: currentWorkoutRef.current.exercises,
        type: currentWorkoutRef.current.type,
        createdAt: Date.now(),
        workoutPlanOverrides: workoutPlanOverrides || undefined,
        aiGenerated: false // Assuming this is a manually saved workout
     };
     
     try {
         await api.savedTemplates.create(template, user.id);
         setSavedWorkoutTemplates(prev => [template, ...prev]);
         setCurrentWorkout(null);
         toast.success("Workout saved");
     } catch(e) { toast.error("Failed to save"); }
  }, [user, workoutPlanOverrides]);

  const saveWorkoutTemplate = useCallback(async (name: string, exerciseIds: string[], type: ExerciseCategory | "Custom") => {
     if (!user) return;
     const newTemplate: SavedWorkoutTemplate = {
         id: generateId(),
         name,
         exercises: exerciseIds,
         type,
         createdAt: Date.now()
     };
     try {
         await api.savedTemplates.create(newTemplate, user.id);
         setSavedWorkoutTemplates(prev => [newTemplate, ...prev]);
         toast.success("Template saved");
     } catch(e) { toast.error("Failed to save"); }
  }, [user]);

  const deleteSavedWorkout = useCallback(async (templateId: string) => {
     if (!user) return;
     try {
         await api.savedTemplates.delete(templateId);
         setSavedWorkoutTemplates(prev => prev.filter(t => t.id !== templateId));
         toast.success("Template deleted");
     } catch (e) { toast.error("Failed to delete"); }
  }, [user]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
      if (!user) return;
      
      // Remove from local state IMMEDIATELY so the UI clears even if DB fails
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      toast.success("Workout deleted");
      
      // Attempt DB cleanup in the background
      try {
          // Step 1: Delete all sets for this workout first (handles missing cascade)
          await api.workouts.syncSets(workoutId, []);
          // Step 2: Delete the workout record itself
          await api.workouts.delete(workoutId);
          console.log("Workout and sets deleted from DB:", workoutId);
      } catch (e) {
          // DB delete failed but local state is already cleared — log silently
          console.warn("Could not fully remove workout from DB (local state already cleared):", e);
          // It won't reappear because we filter cancelled/deleted workouts on load
      }
  }, [user]);

  const archiveWorkout = useCallback(async (id: string, isArchived: boolean) => {
      if (!user) return;
      try {
          await api.workouts.update(id, { isArchived });
          setWorkouts(prev => prev.map(w => w.id === id ? { ...w, isArchived } : w));
          toast.success(isArchived ? "Workout archived" : "Workout restored");
      } catch (e) {
          console.error("Failed to archive workout", e);
          toast.error("Failed to archive workout");
      }
  }, [user]);

  const getWorkoutStats = useCallback(() => {
     // ... logic (reduced from original) ...
     const stats = workouts.filter(w => !w.isArchived).reduce(
      (stats, workout) => {
        stats.totalWorkouts += 1;
        stats.totalTime += workout.totalTime || 0;
        stats.totalSets += workout.sets ? workout.sets.filter((set) => set.completed).length : 0;
        stats.totalReps += workout.sets
          ? workout.sets.filter((set) => set.completed && set.reps)
            .reduce((sum, set) => sum + (set.reps || 0), 0)
          : 0;
        stats.totalCalories += workout.caloriesBurned || 0; 
        return stats;
      },
      { totalWorkouts: 0, totalTime: 0, totalSets: 0, totalReps: 0, totalCalories: 0 }
    );
    return stats;
  }, [workouts]);

  const addBodyMeasurement = useCallback(async (measurement: Omit<BodyMeasurement, "id">) => {
      if (!user) return;
      try {
          const newM = await api.measurements.create(measurement, user.id);
          setBodyMeasurements(prev => [newM, ...prev]);
          toast.success("Measurement added");
      } catch(e) { toast.error("Failed"); }
  }, [user]);
  
  const updateBodyMeasurement = useCallback(async (id: string, updates: Partial<BodyMeasurement>) => {
      if (!user) return;
      try {
          const updated = await api.measurements.update(id, updates);
          setBodyMeasurements(prev => prev.map(m => m.id === id ? updated : m));
          toast.success("Updated");
      } catch(e) { toast.error("Failed"); }
  }, [user]);

  const deleteBodyMeasurement = useCallback(async (id: string) => {
      if (!user) return;
      try {
          await api.measurements.delete(id);
          setBodyMeasurements(prev => prev.filter(m => m.id !== id));
          toast.success("Deleted");
      } catch(e) { toast.error("Failed"); }
  }, [user]);

  const getBodyMeasurements = useCallback(() => bodyMeasurements, [bodyMeasurements]);

  const addHealthMetric = useCallback(async (metric: Omit<HealthMetric, "id">) => {
      if (!user) return;
      try {
          const newM = await api.healthMetrics.create(metric, user.id);
          setHealthMetrics(prev => [newM, ...prev]);
          toast.success("Metric added");
      } catch(e) { toast.error("Failed"); }
  }, [user]);

  const updateHealthMetric = useCallback(async (id: string, updates: Partial<HealthMetric>) => {
      if (!user) return;
      try {
          const updated = await api.healthMetrics.update(id, updates);
          setHealthMetrics(prev => prev.map(m => m.id === id ? updated : m));
          toast.success("Updated");
      } catch(e) { toast.error("Failed"); }
  }, [user]);

  const deleteHealthMetric = useCallback(async (id: string) => {
      if (!user) return;
      try {
          await api.healthMetrics.delete(id);
          setHealthMetrics(prev => prev.filter(m => m.id !== id));
          toast.success("Deleted");
      } catch(e) { toast.error("Failed"); }
  }, [user]);

  const getHealthMetrics = useCallback(() => healthMetrics, [healthMetrics]);
  const refreshHealthMetrics = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.healthMetrics.list();
      setHealthMetrics(data);
    } catch (error) {
      console.error("Failed to refresh health metrics:", error);
    }
  }, [user]);
  const deleteStatsData = useCallback(() => {}, []);

  const saveCustomPlan = useCallback(async (plan: Omit<CustomPlan, "id" | "createdAt">) => {
      if (!user) {
          console.error("Cannot save custom plan: No user logged in");
          toast.error("Please log in to save plans");
          return;
      }
      
      console.log("🎯 Saving custom plan:", {
          planName: plan.name,
          aiGenerated: (plan as any).aiGenerated,
          daysCount: plan.days.length,
          userId: user.id
      });
      
      try {
          const newP = await api.customPlans.create(plan, user.id);
          console.log("✅ Plan created successfully in database:", newP);
          
          // Update local state immediately
          setCustomPlans(prev => {
              const updated = [newP, ...prev];
              console.log("📋 Updated customPlans state. Total plans:", updated.length);
              return updated;
          });
          
          toast.success(`Plan "${newP.name}" saved successfully!`, { duration: 3000 });
      } catch(e) { 
          console.error("❌ Failed to save custom plan:", e);
          toast.error(`Failed to save plan: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
  }, [user]);
  
  const updateCustomPlan = useCallback(async (planId: string, updates: Partial<CustomPlan>) => {
       if (!user) return;
       try {
           const updated = await api.customPlans.update(planId, updates);
           setCustomPlans(prev => prev.map(p => p.id === planId ? updated : p));
           toast.success("Plan updated");
       } catch(e) { toast.error("Failed"); }
  }, [user]);

  const deleteCustomPlan = useCallback(async (planId: string) => {
       if (!user) return;
       try {
           await api.customPlans.delete(planId);
           setCustomPlans(prev => prev.filter(p => p.id !== planId));
           toast.success("Plan deleted");
       } catch(e) { toast.error("Failed"); }
  }, [user]);
  
  const getCustomPlans = useCallback(() => customPlans, [customPlans]);

  // Scheduled Workout Methods
  const addScheduledWorkout = useCallback(async (workout: Omit<ScheduledWorkout, "id">) => {
    if (!user) {
        // Local fallback if needed, but user wants Supabase.
        // We'll mimic what we did with other methods: toast error if ignored, or update local state optimistically?
        // Let's rely on user being logged in for cloud sync as requested.
        const mock: ScheduledWorkout = { ...workout, id: generateId() };
        setScheduledWorkouts(prev => [...prev, mock]);
        return;
    }
    try {
        const newWorkout = await api.scheduledWorkouts.create(workout, user.id);
        setScheduledWorkouts(prev => [...prev, newWorkout]);
        toast.success("Workout scheduled");
    } catch (e) {
        console.error(e);
        toast.error("Failed to schedule workout");
    }
  }, [user]);

  const updateScheduledWorkout = useCallback(async (id: string, updates: Partial<ScheduledWorkout>) => {
    if (!user) {
        setScheduledWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
        return;
    }
    try {
        const updated = await api.scheduledWorkouts.update(id, updates);
        setScheduledWorkouts(prev => prev.map(w => w.id === id ? updated : w));
        toast.success("Workout updated");
    } catch (e) {
        console.error("[WorkoutContext] Failed to update workout:", e);
        toast.error("Cloud sync failed: Workout was not updated in database.");
    }
  }, [user]);

  const deleteScheduledWorkout = useCallback(async (id: string) => {
    if (!user) {
        setScheduledWorkouts(prev => prev.filter(w => w.id !== id));
        return;
    }
    try {
        await api.scheduledWorkouts.delete(id);
        setScheduledWorkouts(prev => prev.filter(w => w.id !== id));
        toast.success("Scheduled workout deleted");
    } catch (e) {
        console.error(e);
        toast.error("Failed to delete scheduled workout");
    }
  }, [user]);

  // Cancel workout
  const cancelWorkout = useCallback(async () => {
      if (currentWorkoutRef.current) {
          const workoutId = currentWorkoutRef.current.id;
          
          // Clear local state FIRST so the workout NEVER appears in stats/history/calendar
          setCurrentWorkout(null);
          currentWorkoutRef.current = null;
          
          // Also remove it from the workouts list in case it was partially added
          setWorkouts(prev => prev.filter(w => w.id !== workoutId));
          
          // Then attempt to clean up from the database (fire-and-forget)
          if (user) {
              try {
                  console.log("Attempting to delete cancelled workout:", workoutId);
                  // Clear sets first (in case of missing cascade)
                  await api.workouts.syncSets(workoutId, []);
                  // Delete the workout record — do NOT fall back to marking completed
                  await api.workouts.delete(workoutId);
                  console.log("Cancelled workout deleted successfully from DB.");
              } catch (e) {
                  // If delete fails try a second time silently — still do NOT mark as completed
                  console.warn("First delete attempt failed, retrying...", e);
                  try {
                      await api.workouts.delete(workoutId);
                  } catch (e2) {
                      // Last resort: mark it with a special cancelled flag, NOT completed=true
                      console.error("Could not delete cancelled workout, marking as cancelled.", e2);
                      try {
                          await api.workouts.update(workoutId, {
                              completed: false,
                              cancelled: true,
                              notes: "Cancelled via App"
                          });
                      } catch (e3) {
                          console.error("All cancel cleanup attempts failed.", e3);
                      }
                  }
              }
          }
      } else {
          setCurrentWorkout(null);
          currentWorkoutRef.current = null;
      }
      setWorkoutPlanOverrides(null);
      toast.info("Workout cancelled", { duration: 2500 });
  }, [user]);

  const purgeWorkoutsOnly = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      await api.workouts.purgeAll(user.id);
      setWorkouts([]);
      toast.success("Workout history purged");
    } catch (e) {
      toast.error("Failed to purge workouts");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const purgeAnalyticsOnly = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      await Promise.all([
        api.measurements.purgeAll(user.id),
        api.healthMetrics.purgeAll(user.id)
      ]);
      setBodyMeasurements([]);
      setHealthMetrics([]);
      toast.success("Analytics data purged");
    } catch (e) {
      toast.error("Failed to purge analytics");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const purgePersonalStatsOnly = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      await api.profiles.purgePrs();
      setAchievedPrs([]);
      toast.success("Personal records purged");
    } catch (e) {
      toast.error("Failed to purge stats");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const purgeCustomPlansOnly = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      await api.customPlans.purgeAll(user.id);
      setCustomPlans([]);
      toast.success("Custom plans purged");
    } catch (e) {
      toast.error("Failed to purge plans");
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        currentWorkout,
        savedWorkoutTemplates,
        customPlans,
        bodyMeasurements,
        healthMetrics,
        startWorkout,
        startSavedWorkout,
        endWorkout,
        cancelWorkout,
        addSet,
        completeSet,
        skipSet,
        updateSet,
        updateWorkout,
        updateCurrentWorkoutNotes,
        getWorkoutStats,
        navigateToExercise,
        currentExerciseIndex,
        setCurrentExerciseIndex,
        navigateToNextExercise,
        navigateToPreviousExercise,
        saveCustomWorkout,
        saveWorkoutTemplate,
        deleteSavedWorkout,
        deleteWorkout,
        archiveWorkout,
        addBodyMeasurement,
        updateBodyMeasurement,
        deleteBodyMeasurement,
        getBodyMeasurements,
        addHealthMetric,
        updateHealthMetric,
        deleteHealthMetric,
        getHealthMetrics,
        refreshHealthMetrics,
        saveCustomPlan,
        updateCustomPlan,
        deleteCustomPlan,
        getCustomPlans,
        purgeWorkoutsOnly,
        purgeAnalyticsOnly,
        purgePersonalStatsOnly,
        purgeCustomPlansOnly,
        deleteStatsData,
        initializeHealthConnect,
        syncSmartwatchWorkouts,
        createSmartwatchWorkout,
        updateSmartwatchWorkout,
        addExerciseToCurrentWorkout,
        scheduledWorkouts,
        addScheduledWorkout,
        updateScheduledWorkout,
        deleteScheduledWorkout,
        achievedPrs,
        migrateLocalData,
        refreshWorkoutData: loadData,
      }}
    >
        {children}
         {/* We should put the Cardio Modal here if it was used */}
        {cardioDataModalOpen && pendingWorkoutData && (
             <CardioDataCollectionModal 
                 isOpen={cardioDataModalOpen}
                 onClose={() => setCardioDataModalOpen(false)}
                 onSave={(data) => {
                      completeWorkoutIntegration(pendingWorkoutData.workout, data);
                      setCardioDataModalOpen(false);
                 }}
                 workout={pendingWorkoutData.workout}
                 exercises={pendingWorkoutData.exercises}
             />

        )}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};

