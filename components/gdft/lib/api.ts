
import { supabase } from "@/lib/supabase";
import { Exercise, Workout, WorkoutSet, SavedWorkoutTemplate, ExerciseCategory, MuscleGroup, Equipment } from "./data";
import { v4 as uuidv4 } from 'uuid';

// Type Mappers

const mapExerciseFromDB = (db: any): Exercise => ({
  id: db.id,
  name: db.name,
  category: db.category as any,
  muscleGroups: db.muscle_groups as any[],
  equipment: db.equipment as any,
  settings: db.settings,
  notes: db.notes,
  description: db.description,
  thumbnailUrl: db.thumbnail_url,
  pictureUrl: db.picture_url,
  isFavorite: db.is_favorite ?? db.settings?.isFavorite,
  startPositionUrl: db.start_position_url,
  endPositionUrl: db.end_position_url,
  gymId: db.gym_id,
  gymSectionId: db.gym_section_id,
});

const mapExerciseToDB = (ex: Partial<Exercise>, userId?: string) => ({
  user_id: userId,
  name: ex.name || "Unnamed Exercise",
  category: ex.category || "General",
  muscle_groups: ex.muscleGroups || [],
  equipment: ex.equipment || "None",
  settings: { ...(ex.settings || {}), isFavorite: ex.isFavorite || false },
  notes: ex.notes || "",
  description: ex.description || "",
  thumbnail_url: ex.thumbnailUrl || null,
  picture_url: ex.pictureUrl || null,
  start_position_url: ex.startPositionUrl ?? null,
  end_position_url: ex.endPositionUrl ?? null,
  gym_id: ex.gymId ?? null,
  gym_section_id: ex.gymSectionId ?? null,
});

const mapWorkoutFromDB = (db: any, rawSets: any[] | null = []): Workout => {
  const sets = rawSets || [];
  return {
    id: db.id,
    name: db.name,
    exercises: sets.map(s => s.exercise_id).filter(Boolean),
    sets: sets.map(mapSetFromDB),
    startTime: db.start_time ? new Date(db.start_time).getTime() : Date.now(),
    endTime: db.end_time ? new Date(db.end_time).getTime() : undefined,
    totalTime: db.end_time ? Math.round((new Date(db.end_time).getTime() - (db.start_time ? new Date(db.start_time).getTime() : 0)) / 1000) : undefined,
    type: db.type as any,
    notes: db.notes,
    completed: db.completed,
    isArchived: db.smartwatch_data?.isArchived || false,
    ...db.smartwatch_data
  };
};

const mapSetFromDB = (db: any): WorkoutSet => ({
  id: db.id,
  exerciseId: db.exercise_id,
  weight: db.weight,
  reps: db.reps,
  time: db.time,
  distance: db.distance,
  incline: db.incline,
  completed: db.completed,
  timestamp: new Date(db.timestamp).getTime(),
});

// API Service

export const api = {
  scheduledWorkouts: {
    list: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      let query = supabase.from('scheduled_workouts').select('*');
      if (userId) {
          query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.map((d: any) => ({
        id: d.id,
        date: new Date(d.date),
        workoutType: d.workout_type,
        time: d.time,
        completed: d.completed,
        missed: d.missed,
        templateId: d.template_id,
        planId: d.plan_id,
        existingWorkoutId: d.existing_workout_id,
        exercises: d.exercises,
        reminders: d.reminders,
      }));
    },
    create: async (workout: any, userId: string) => {
      const dbData = {
        user_id: userId,
        date: workout.date ? (workout.date instanceof Date ? workout.date.toISOString() : new Date(workout.date).toISOString()) : new Date().toISOString(),
        workout_type: workout.workoutType || "General",
        time: workout.time || "",
        completed: !!workout.completed,
        missed: !!workout.missed,
        template_id: workout.templateId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workout.templateId) ? workout.templateId : null,
        plan_id: workout.planId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workout.planId) ? workout.planId : null,
        existing_workout_id: workout.existingWorkoutId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workout.existingWorkoutId) ? workout.existingWorkoutId : null,
        exercises: workout.exercises || [],
        reminders: workout.reminders || [],
      };
      
      
      // Validation: Ensure ID is a valid UUID if provided, otherwise let Supabase generate it
      if (workout.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workout.id)) {
        console.warn(`[scheduledWorkouts.create] Invalid UUID provided: ${workout.id}. Omitting to let DB generate one.`);
      } else if (workout.id) {
        (dbData as any).id = workout.id;
      }

      console.log('[api] scheduledWorkouts.create payload:', JSON.stringify(dbData, null, 2));
      const { data, error } = await supabase.from('scheduled_workouts').upsert(dbData).select().maybeSingle();
      if (error) {
        console.error('[api] scheduledWorkouts.create error:', JSON.stringify(error));
        throw error;
      }
      if (!data) throw new Error("No data returned from scheduledWorkouts.create");
      return {
        id: data.id,
        date: new Date(data.date),
        workoutType: data.workout_type,
        time: data.time,
        completed: data.completed,
        missed: data.missed,
        templateId: data.template_id,
        planId: data.plan_id,
        existingWorkoutId: data.existing_workout_id,
        exercises: data.exercises,
        reminders: data.reminders,
      };
    },
    update: async (id: string, updates: any) => {
      const dbUpdates: any = {};
      if (updates.date) dbUpdates.date = new Date(updates.date).toISOString();
      if (updates.workoutType) dbUpdates.workout_type = updates.workoutType;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.missed !== undefined) dbUpdates.missed = updates.missed;
      if (updates.templateId !== undefined) dbUpdates.template_id = updates.templateId || null;
      if (updates.planId !== undefined) dbUpdates.plan_id = updates.planId || null;
      if (updates.existingWorkoutId !== undefined) dbUpdates.existing_workout_id = updates.existingWorkoutId || null;
      if (updates.exercises) dbUpdates.exercises = updates.exercises;
      if (updates.reminders) dbUpdates.reminders = updates.reminders;
      
      console.log(`[api] scheduledWorkouts.update ID: ${id} payload:`, JSON.stringify(dbUpdates, null, 2));
      
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        console.error(`[api] scheduledWorkouts.update: Invalid UUID format: ${id}`);
        throw new Error(`Invalid UUID: ${id}`);
      }

      const { data, error } = await supabase.from('scheduled_workouts').update(dbUpdates).eq('id', id).select().maybeSingle();
      if (error) {
          console.error('[api] scheduledWorkouts.update error:', JSON.stringify(error));
          throw error;
      }
      if (!data) {
          console.warn(`[api] scheduledWorkouts.update: No record found with ID ${id}`);
          throw new Error("Record not found");
      }
      return {
        id: data.id,
        date: new Date(data.date),
        workoutType: data.workout_type,
        time: data.time,
        completed: data.completed,
        missed: data.missed,
        templateId: data.template_id,
        planId: data.plan_id,
        existingWorkoutId: data.existing_workout_id,
        exercises: data.exercises,
        reminders: data.reminders,
      };
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('scheduled_workouts').delete().eq('id', id);
      if (error) throw error;
    }
  },
  exercises: {
    list: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      let query = supabase.from('exercises').select('*');
      if (userId) {
          query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data.map(mapExerciseFromDB);
    },
    
    create: async (exercise: Omit<Exercise, 'id'>, userId: string) => {
      const dbData = mapExerciseToDB({ ...exercise, id: undefined }, userId);
      console.log('[api] exercises.create payload:', JSON.stringify(dbData, null, 2));
      const { data, error } = await supabase
        .from('exercises')
        .insert(dbData)
        .select()
        .maybeSingle();
        
      if (error) {
          console.error('[api] exercises.create error:', JSON.stringify(error));
          throw error;
      }
      if (!data) throw new Error("No data returned from exercises.create");
      return mapExerciseFromDB(data);
    },
    
    createMany: async (exercises: Omit<Exercise, 'id'>[], userId: string) => {
      const dbData = exercises.map(ex => mapExerciseToDB({ ...ex, id: undefined }, userId));
      console.log(`[api] exercises.createMany inserting ${dbData.length} items...`);
      const { data, error } = await supabase
        .from('exercises')
        .insert(dbData)
        .select();
        
      if (error) {
          console.error('[api] exercises.createMany error:', JSON.stringify(error));
          throw error;
      }
      if (!data) throw new Error("No data returned from exercises.createMany");
      return data.map(mapExerciseFromDB);
    },
    
    update: async (id: string, updates: Partial<Exercise>) => {
      const dbData = mapExerciseToDB(updates, undefined); // user_id is immutable via update usually, or handled by RLS
      // Remove undefined fields to avoid overwriting with null if that's not intended, or rely on update behavior
      console.log(`[api] exercises.update ID: ${id} payload:`, JSON.stringify(dbData, null, 2));
      
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          console.error(`[api] exercises.update: Invalid UUID format: ${id}`);
          throw new Error(`Invalid UUID: ${id}`);
      }

      const { data, error } = await supabase
        .from('exercises')
        .update(dbData)
        .eq('id', id)
        .select()
        .maybeSingle();
        
      if (error) {
          console.error('[api] exercises.update error:', JSON.stringify(error));
          throw error;
      }
      if (!data) {
          console.warn(`[api] exercises.update: No record found with ID ${id}`);
          throw new Error("Record not found");
      }
      return mapExerciseFromDB(data);
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    
    deleteMany: async (ids: string[]) => {
      if (ids.length === 0) return;
      console.log(`[api] exercises.deleteMany deleting ${ids.length} items...`);
      const { error } = await supabase
        .from('exercises')
        .delete()
        .in('id', ids);
      if (error) {
          console.error('[api] exercises.deleteMany error:', JSON.stringify(error));
          throw error;
      }
    }
  },

  workouts: {
    list: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_sets (*)
        `)
        .order('start_time', { ascending: false });
        
      if (userId) {
          query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      return data.map(w => mapWorkoutFromDB(w, w.workout_sets));
    },

    create: async (workout: Workout, userId: string) => {
      const workoutData: any = {
        user_id: userId,
        name: workout.name,
        type: workout.type,
        start_time: new Date(workout.startTime).toISOString(),
        end_time: workout.endTime ? new Date(workout.endTime).toISOString() : null,
        notes: workout.notes,
        completed: workout.completed,
        smartwatch_data: {
            avgHeartRate: workout.avgHeartRate,
            maxHeartRate: workout.maxHeartRate,
            steps: workout.steps,
            avgSpeed: workout.avgSpeed,
            smartwatchDistance: workout.smartwatchDistance,
            caloriesBurned: workout.caloriesBurned,
            isArchived: workout.isArchived
        }
      };

      if (workout.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workout.id)) {
          workoutData.id = workout.id;
      } else if (workout.id) {
          console.warn(`[workouts.create] Omitting invalid UUID: ${workout.id}`);
      }

      console.log('[api] workouts.create payload:', JSON.stringify(workoutData, null, 2));

      const { data: wData, error: wError } = await supabase
        .from('workouts')
        .insert(workoutData)
        .select()
        .maybeSingle();

      if (wError) {
          console.error('[api] workouts.create error:', JSON.stringify(wError));
          throw wError;
      }
      if (!wData) throw new Error("No data returned from workouts.create");

      // 2. Insert Sets
      if (workout.sets && workout.sets.length > 0) {
        const setsData = workout.sets.map(s => ({
          workout_id: wData.id,
          user_id: userId,
          exercise_id: s.exerciseId,
          weight: s.weight,
          reps: s.reps,
          time: s.time,
          distance: s.distance,
          incline: s.incline,
          completed: s.completed,
          timestamp: new Date(s.timestamp).toISOString()
        }));

        const { error: sError } = await supabase
          .from('workout_sets')
          .insert(setsData);
        
        if (sError) console.error('Error creating sets:', JSON.stringify(sError));
      }

      return mapWorkoutFromDB(wData, workout.sets);
    },

    update: async (id: string, updates: Partial<Workout>) => {
      const { data: existingWorkout } = await supabase.from('workouts').select('smartwatch_data').eq('id', id).single();
      
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.endTime) dbUpdates.end_time = new Date(updates.endTime).toISOString();
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.type) dbUpdates.type = updates.type;
      
      // Handle smartwatch data if updated
      const smartwatchKeys = ['avgHeartRate', 'maxHeartRate', 'steps', 'avgSpeed', 'smartwatchDistance', 'caloriesBurned', 'isArchived'];
      const hasSmartwatchUpdates = smartwatchKeys.some(k => (updates as any)[k] !== undefined);
      
      if (hasSmartwatchUpdates) {
          dbUpdates.smartwatch_data = { ...(existingWorkout?.smartwatch_data || {}) }; // Start with existing data to avoid wipe
          smartwatchKeys.forEach(k => {
              if ((updates as any)[k] !== undefined) dbUpdates.smartwatch_data[k] = (updates as any)[k];
          });
      }

      console.log(`[api] workouts.update ID: ${id} payload:`, JSON.stringify(dbUpdates, null, 2));

      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          console.error(`[api] workouts.update: Invalid UUID format: ${id}`);
          throw new Error(`Invalid UUID: ${id}`);
      }
      
      // Prevent Supabase crash on empty update object
      if (Object.keys(dbUpdates).length === 0) {
          console.log(`[api] workouts.update: No valid db columns to update for ID ${id}. Returning existing.`);
          const { data } = await supabase.from('workouts').select(`*, workout_sets (*)`).eq('id', id).maybeSingle();
          if (data) return mapWorkoutFromDB(data, data.workout_sets);
          throw new Error("Record not found");
      }

      const { data, error } = await supabase
        .from('workouts')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          workout_sets (*)
        `)
        .maybeSingle();
        
      if (error) {
          console.error('[api] workouts.update error:', JSON.stringify(error));
          throw error;
      }
      if (!data) {
          console.warn(`[api] workouts.update: No record found with ID ${id}`);
          throw new Error("Record not found");
      }

      // Note: We don't update sets here as they have their own lifecycle?
      // Or we should provide a way to sync sets.
      return mapWorkoutFromDB(data, data.workout_sets);
    },

    syncSets: async (workoutId: string, sets: WorkoutSet[]) => {
        // Simple strategy: delete and re-insert for the active workout
        await supabase.from('workout_sets').delete().eq('workout_id', workoutId);
        
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        const setsData = sets.map(s => ({
            workout_id: workoutId,
            user_id: userId,
            exercise_id: s.exerciseId,
            weight: s.weight,
            reps: s.reps,
            time: s.time,
            distance: s.distance,
            incline: s.incline,
            completed: s.completed,
            timestamp: new Date(s.timestamp).toISOString()
        }));

        if (setsData.length > 0) {
            const { error } = await supabase.from('workout_sets').insert(setsData);
            if (error) throw error;
        }
    },
    
    delete: async (id: string) => {
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      if (error) throw error;
    },
    
    purgeAll: async (userId: string) => {
      // workout_sets will be deleted by cascade if setup, or we manually delete them
      // In this app, cascade is usually preferred, but for safety:
      await supabase.from('workout_sets').delete().eq('user_id', userId);
      const { error } = await supabase.from('workouts').delete().eq('user_id', userId);
      if (error) throw error;
    }
  },

  savedTemplates: {
    list: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      let query = supabase.from('saved_workout_templates').select('*');
      if (userId) {
          query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type as any,
        exercises: d.exercises,
        createdAt: new Date(d.created_at).getTime(),
        workoutPlanOverrides: d.workout_plan_overrides,
        gymId: d.gym_id,
        isCustomGymWorkout: d.is_custom_gym_workout
      }));
    },
    create: async (template: SavedWorkoutTemplate, userId: string) => {
      const dbData = {
        user_id: userId,
        name: template.name,
        type: template.type,
        exercises: template.exercises,
        workout_plan_overrides: template.workoutPlanOverrides,
        gym_id: template.gymId,
        is_custom_gym_workout: template.isCustomGymWorkout
      };

      console.log('[api] savedTemplates.create payload:', JSON.stringify(dbData, null, 2));
      const { data, error } = await supabase.from('saved_workout_templates').insert(dbData).select().maybeSingle();
      if (error) {
          console.error('[api] savedTemplates.create error:', JSON.stringify(error));
          throw error;
      }
      if (!data) throw new Error("No data returned from savedTemplates.create");
      return {
        id: data.id,
        name: data.name,
        type: data.type as any,
        exercises: data.exercises,
        createdAt: new Date(data.created_at).getTime(),
        workoutPlanOverrides: data.workout_plan_overrides,
        aiGenerated: data.ai_generated,
        gymId: data.gym_id,
        isCustomGymWorkout: data.is_custom_gym_workout
      };
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('saved_workout_templates').delete().eq('id', id);
        if (error) throw error;
    }
  },

  customPlans: {
    list: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        let query = supabase.from('custom_plans').select('*');
        if (userId) {
            query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data.map(d => ({
            id: d.id,
            name: d.name,
            days: d.days,
            createdAt: new Date(d.created_at).getTime(),
            aiGenerated: d.ai_generated
        }));
    },
    create: async (plan: any, userId: string) => {
        const payload = {
            user_id: userId,
            name: plan.name,
            days: plan.days,
            ai_generated: plan.aiGenerated
        };
        console.log('[api] customPlans.create payload:', JSON.stringify(payload, null, 2));
        const { data, error } = await supabase.from('custom_plans').insert(payload).select().maybeSingle();
        if (error) {
            console.error('[api] customPlans.create error:', JSON.stringify(error));
            throw error;
        }
        if (!data) throw new Error("No data returned from customPlans.create");
        return {
            id: data.id,
            name: data.name,
            days: data.days,
            createdAt: new Date(data.created_at).getTime(),
            aiGenerated: data.ai_generated
        };
    },
    update: async (id: string, updates: any) => {
        console.log(`[api] customPlans.update ID: ${id} payload:`, JSON.stringify(updates, null, 2));
        
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            console.error(`[api] customPlans.update: Invalid UUID format: ${id}`);
            throw new Error(`Invalid UUID: ${id}`);
        }

        const { data, error } = await supabase.from('custom_plans').update(updates).eq('id', id).select().maybeSingle();
        if (error) {
            console.error('[api] customPlans.update error:', JSON.stringify(error));
            throw error;
        }
        if (!data) {
            console.warn(`[api] customPlans.update: No record found with ID ${id}`);
            throw new Error("Record not found");
        }
        return {
            id: data.id,
            name: data.name,
            days: data.days,
            createdAt: new Date(data.created_at).getTime(),
            aiGenerated: data.ai_generated
        };
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('custom_plans').delete().eq('id', id);
        if (error) throw error;
    },
    
    purgeAll: async (userId: string) => {
        const { error } = await supabase.from('custom_plans').delete().eq('user_id', userId);
        if (error) throw error;
    }
  },
  
  measurements: {
    list: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        let query = supabase.from('body_measurements').select('*').order('date', { ascending: false });
        if (userId) {
            query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data.map((d: any) => ({
             id: d.id,
             date: d.date,
             weight: d.weight,
             height: d.height,
             neck: d.neck,
             shoulders: d.shoulders,
             chest: d.chest,
             lats: d.lats,
             upperBack: d.upper_back,
             waist: d.waist,
             hips: d.hips,
             biceps: d.biceps,
             triceps: d.triceps,
             forearms: d.forearms,
             thighs: d.thighs,
             calves: d.calves
        }));
    },
    create: async (m: any, userId: string) => {
        const dbData = {
             user_id: userId,
             date: m.date,
             weight: m.weight,
             height: m.height,
             neck: m.neck,
             shoulders: m.shoulders,
             chest: m.chest,
             lats: m.lats,
             upper_back: m.upperBack,
             waist: m.waist,
             hips: m.hips,
             biceps: m.biceps,
             triceps: m.triceps,
             forearms: m.forearms,
             thighs: m.thighs,
             calves: m.calves
        };
        console.log('[api] measurements.create payload:', JSON.stringify(dbData, null, 2));
        const { data, error } = await supabase.from('body_measurements').insert(dbData).select().maybeSingle();
        if (error) {
            console.error('[api] measurements.create error:', JSON.stringify(error));
            throw error;
        }
        if (!data) throw new Error("No data returned from measurements.create");
        return {
             id: data.id,
             date: data.date,
             weight: data.weight,
             height: data.height,
             neck: data.neck,
             shoulders: data.shoulders,
             chest: data.chest,
             lats: data.lats,
             upperBack: data.upper_back,
             waist: data.waist,
             hips: data.hips,
             biceps: data.biceps,
             triceps: data.triceps,
             forearms: data.forearms,
             thighs: data.thighs,
             calves: data.calves
        };
    },
    update: async (id: string, updates: any) => {
         // Map updates to snake_case
         const dbUpdates: any = {};
         if (updates.date) dbUpdates.date = updates.date;
         if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
         if (updates.upperBack !== undefined) dbUpdates.upper_back = updates.upperBack;
         // ... map others ... 
         // For simplicity, let's just spread and map known keys
         const keys = Object.keys(updates);
         keys.forEach(k => {
             if (k === 'upperBack') dbUpdates.upper_back = updates[k];
             else dbUpdates[k] = updates[k];
         });

         console.log(`[api] measurements.update ID: ${id} payload:`, JSON.stringify(dbUpdates, null, 2));
         
         if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
             console.error(`[api] measurements.update: Invalid UUID format: ${id}`);
             throw new Error(`Invalid UUID: ${id}`);
         }

         const { data, error } = await supabase.from('body_measurements').update(dbUpdates).eq('id', id).select().maybeSingle();
         if (error) {
             console.error('[api] measurements.update error:', JSON.stringify(error));
             throw error;
         }
         if (!data) {
             console.warn(`[api] measurements.update: No record found with ID ${id}`);
             throw new Error("Record not found");
         }
         return {
             id: data.id,
             date: data.date,
             weight: data.weight,
             height: data.height,
             neck: data.neck,
             shoulders: data.shoulders,
             chest: data.chest,
             lats: data.lats,
             upperBack: data.upper_back,
             waist: data.waist,
             hips: data.hips,
             biceps: data.biceps,
             triceps: data.triceps,
             forearms: data.forearms,
             thighs: data.thighs,
             calves: data.calves
        };
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('body_measurements').delete().eq('id', id);
        if (error) throw error;
    },
    
    purgeAll: async (userId: string) => {
        const { error } = await supabase.from('body_measurements').delete().eq('user_id', userId);
        if (error) throw error;
    }
  },

  healthMetrics: {
     list: async () => {
         const { data: { session } } = await supabase.auth.getSession();
         const userId = session?.user?.id;
         let query = supabase.from('health_metrics').select('*').order('date', { ascending: false });
         if (userId) {
             query = query.eq('user_id', userId);
         }
         const { data, error } = await query;
         if (error) throw error;
         return data.map((d: any) => ({
             id: d.id,
             date: d.date,
             workoutId: d.workout_id,
             timestamp: d.timestamp ? new Date(d.timestamp).getTime() : undefined,
             sleepDurationHours: d.sleep_duration_hours,
             sleepQualityRating: d.sleep_quality_rating,
             waterIntakeMl: d.water_intake_ml,
             stressLevelRating: d.stress_level_rating,
             bloodPressureSystolic: d.blood_pressure_systolic,
             bloodPressureDiastolic: d.blood_pressure_diastolic,
             glucose: d.glucose,
             bloodOxygen: d.blood_oxygen,
             weight: d.weight,
             notes: d.notes,
             caloriesBurned: d.calories_burned,
             avgHeartRate: d.avg_heart_rate,
             maxHeartRate: d.max_heart_rate,
             steps: d.steps,
             duration: d.duration,
             distance: d.distance,
             avgSpeed: d.avg_speed,
             fromSmartwatch: d.from_smartwatch
         }));
     },
     create: async (m: any, userId: string) => {
         const dbData = {
             user_id: userId,
             date: m.date,
             workout_id: m.workoutId,
             timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : null,
             sleep_duration_hours: m.sleepDurationHours,
             sleep_quality_rating: m.sleepQualityRating,
             water_intake_ml: m.waterIntakeMl,
             stress_level_rating: m.stressLevelRating,
             blood_pressure_systolic: m.bloodPressureSystolic,
             blood_pressure_diastolic: m.bloodPressureDiastolic,
             glucose: m.glucose,
             blood_oxygen: m.bloodOxygen,
             weight: m.weight,
             notes: m.notes,
             calories_burned: m.caloriesBurned,
             avg_heart_rate: m.avgHeartRate,
             max_heart_rate: m.maxHeartRate,
             steps: m.steps,
             duration: m.duration,
             distance: m.distance,
             avg_speed: m.avgSpeed,
             from_smartwatch: m.fromSmartwatch
         };
         console.log('[api] healthMetrics.create payload:', JSON.stringify(dbData, null, 2));
         const { data, error } = await supabase.from('health_metrics').insert(dbData).select().maybeSingle();
         if (error) {
             console.error('[api] healthMetrics.create error:', JSON.stringify(error));
             throw error;
         }
         if (!data) throw new Error("No data returned from healthMetrics.create");
         return {
             id: data.id,
             date: data.date,
             // ... map back ...
             fromSmartwatch: data.from_smartwatch
         };
     },
    update: async (id: string, updates: any) => {
        const dbUpdates: any = {};
        const keys = Object.keys(updates);
        keys.forEach(k => {
             if (k === 'sleepDurationHours') dbUpdates.sleep_duration_hours = updates[k];
             else if (k === 'sleepQualityRating') dbUpdates.sleep_quality_rating = updates[k];
             else if (k === 'waterIntakeMl') dbUpdates.water_intake_ml = updates[k];
             else if (k === 'stressLevelRating') dbUpdates.stress_level_rating = updates[k];
             else if (k === 'bloodPressureSystolic') dbUpdates.blood_pressure_systolic = updates[k];
             else if (k === 'bloodPressureDiastolic') dbUpdates.blood_pressure_diastolic = updates[k];
             else if (k === 'caloriesBurned') dbUpdates.calories_burned = updates[k];
             else if (k === 'avgHeartRate') dbUpdates.avg_heart_rate = updates[k];
             else if (k === 'maxHeartRate') dbUpdates.max_heart_rate = updates[k];
             else if (k === 'avgSpeed') dbUpdates.avg_speed = updates[k];
             else if (k === 'fromSmartwatch') dbUpdates.from_smartwatch = updates[k];
             else if (k === 'workoutId') dbUpdates.workout_id = updates[k];
             else if (k === 'bloodOxygen') dbUpdates.blood_oxygen = updates[k];
             else if (k === 'timestamp' && updates[k]) dbUpdates.timestamp = new Date(updates[k]).toISOString();
             else dbUpdates[k] = updates[k];
        });
        console.log(`[api] healthMetrics.update ID: ${id} payload:`, JSON.stringify(dbUpdates, null, 2));
        
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            console.error(`[api] healthMetrics.update: Invalid UUID format: ${id}`);
            throw new Error(`Invalid UUID: ${id}`);
        }

        const { data: d, error } = await supabase.from('health_metrics').update(dbUpdates).eq('id', id).select().maybeSingle();
        if (error) {
            console.error('[api] healthMetrics.update error:', JSON.stringify(error));
            throw error;
        }
        if (!d) {
            console.warn(`[api] healthMetrics.update: No record found with ID ${id}`);
            throw new Error("Record not found");
        }
        
        return {
            id: d.id,
            date: d.date,
            workoutId: d.workout_id,
            timestamp: d.timestamp ? new Date(d.timestamp).getTime() : undefined,
            sleepDurationHours: d.sleep_duration_hours,
            sleepQualityRating: d.sleep_quality_rating,
            waterIntakeMl: d.water_intake_ml,
            stressLevelRating: d.stress_level_rating,
            bloodPressureSystolic: d.blood_pressure_systolic,
            bloodPressureDiastolic: d.blood_pressure_diastolic,
            glucose: d.glucose,
            bloodOxygen: d.blood_oxygen,
            weight: d.weight,
            notes: d.notes,
            caloriesBurned: d.calories_burned,
            avgHeartRate: d.avg_heart_rate,
            maxHeartRate: d.max_heart_rate,
            steps: d.steps,
            duration: d.duration,
            distance: d.distance,
            avgSpeed: d.avg_speed,
            fromSmartwatch: d.from_smartwatch
        };
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('health_metrics').delete().eq('id', id);
        if (error) throw error;
    },
    
    purgeAll: async (userId: string) => {
        const { error } = await supabase.from('health_metrics').delete().eq('user_id', userId);
        if (error) throw error;
    }
  },
  
  storage: {

    uploadImage: async (file: File, userId: string): Promise<string> => {
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;

      console.log('[uploadImage] Uploading:', fileName, 'type:', file.type, 'size:', file.size);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exercise-images')
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('[uploadImage] Supabase upload error:', JSON.stringify(uploadError));
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('[uploadImage] Upload success, path:', uploadData.path);

      const { data: urlData } = supabase.storage
        .from('exercise-images')
        .getPublicUrl(uploadData.path);

      console.log('[uploadImage] Public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    }
  },
  
  gyms: {
    list: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (gym: any, userId: string) => {
      const { data, error } = await supabase.from('gyms').insert({
        user_id: userId,
        name: gym.name,
        location: gym.location,
        description: gym.description,
        type: gym.type || 'Commercial',
        sections: gym.sections || []
      }).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabase.from('gyms').update(updates).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('gyms').delete().eq('id', id);
      if (error) throw error;
    }
  },
  
  profiles: {
    get: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) {
          // Profile warning silenced to reduce console clutter
          return { id: user.id, achievedPrs: [], lastChangelogViewed: null };
      }
      return {
        id: data.id,
        achievedPrs: data.achieved_prs || [],
        lastChangelogViewed: data.last_changelog_viewed
      };
    },
    update: async (updates: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const dbUpdates: any = {};
        if (updates.achievedPrs) dbUpdates.achieved_prs = updates.achievedPrs;
        if (updates.lastChangelogViewed) dbUpdates.last_changelog_viewed = updates.lastChangelogViewed;

        console.log('[api] profiles.update/upsert payload:', JSON.stringify(dbUpdates, null, 2));

        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...dbUpdates })
            .select()
            .maybeSingle();
            
        if (error) {
            console.error('[api] profiles.update error:', JSON.stringify(error));
            throw error;
        }
        if (!data) throw new Error("Failed to create/update profile");
        return {
            id: data.id,
            achievedPrs: data.achieved_prs || [],
            lastChangelogViewed: data.last_changelog_viewed
        };
    },
    
    purgePrs: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        const { error } = await supabase
            .from('profiles')
            .update({ achieved_prs: [] })
            .eq('id', user.id);
            
        if (error) throw error;
    }
  }
};
