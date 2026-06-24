import { useNavigate } from "react-router-dom";
import React, { useEffect, useCallback, useState, useRef } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { Reminder, ScheduledWorkout } from "@/lib/types";
import { playWebSound, unlockAudio } from "@/lib/sounds";
import { isSameDay, parseISO, isPast, addMinutes } from "date-fns";

export const WorkoutReminderSystem: React.FC = () => {
  const { 
    scheduledWorkouts, 
    updateScheduledWorkout, 
    workouts, 
    savedWorkoutTemplates, 
    customPlans, 
    startSavedWorkout, 
    startWorkout 
  } = useWorkout();
  const { notificationSound, notificationVibration } = useSettings();
  const navigate = useNavigate();
  const [notifiedKeys, setNotifiedKeys] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('workout_notifications_sent');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  // Synchronous guard to prevent duplicates within the same polling cycle
  // (React state updates are async so notifiedKeys alone is not enough)
  const firedThisCycleRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<number>(0);

  // Persistence for notified keys to avoid repeating notifications on refresh
  useEffect(() => {
    localStorage.setItem('workout_notifications_sent', JSON.stringify(Array.from(notifiedKeys)));
  }, [notifiedKeys]);

  const handlePerformWorkout = useCallback((workout: ScheduledWorkout) => {
    try {
      if (workout.templateId) {
        const template = savedWorkoutTemplates.find(t => t.id === workout.templateId);
        if (template) {
          startSavedWorkout(workout.templateId);
        } else {
          toast.error("Saved workout template not found.");
          return;
        }
      } else if (workout.existingWorkoutId) {
        const existing = workouts.find(w => w.id === workout.existingWorkoutId);
        if (existing) {
          startWorkout(existing.type, existing.exercises);
        } else {
          toast.error("Existing workout not found.");
          return;
        }
      } else if (workout.planId) {
        toast.info("Starting workouts from a plan is not yet supported via notification.");
        return;
      } else {
        startWorkout(workout.workoutType, workout.exercises || []);
      }
      
      // Mark as completed in scheduler so it doesn't notify again or show as missed
      updateScheduledWorkout(workout.id, { completed: true });
      navigate('/workout');
    } catch (err) {
      console.error("[ReminderSystem] Failed to start workout:", err);
      toast.error("Could not start workout automatically.");
    }
  }, [savedWorkoutTemplates, workouts, startSavedWorkout, startWorkout, updateScheduledWorkout, navigate]);

  const triggerNotification = useCallback((workout: ScheduledWorkout, reminder: Reminder, reminderKey: string) => {
    const timeLabel = reminder.timeBefore === 'On time' ? 'now' : `in ${reminder.timeBefore}`;
    
    // Use a stable toast ID so sonner deduplicates if somehow called twice
    const toastId = `reminder-${reminderKey}`;

    // Browser Notification / Toast — short 5s auto-dismiss, no manual close needed
    toast.info(`🔔 Workout Reminder`, {
      id: toastId,
      duration: 5000,
      description: `${workout.workoutType} workout starts ${timeLabel}!`,
      action: {
        label: "Start Now",
        onClick: () => handlePerformWorkout(workout)
      }
    });
    
    // Play Sound if globally enabled AND reminder has a sound
    const soundType = (reminder.sound === 'bell' || reminder.sound === 'chime') ? reminder.sound : 'chime';
    if (notificationSound && reminder.sound !== 'none') {
      playWebSound(soundType).catch(err => {
        console.error("[ReminderSystem] Sound failed:", err);
      });
    }

    // Vibrate if globally enabled
    if (notificationVibration && "vibrate" in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
        console.log("[ReminderSystem] Triggered vibration");
      } catch (e) {
        console.warn("[ReminderSystem] Vibration failed:", e);
      }
    }
    
    console.log(`%c[Notification System] Triggered ${soundType} for ${workout.workoutType}`, "color: #3b82f6; font-weight: bold;");
    
    // Add to BOTH the synchronous ref and the async state
    firedThisCycleRef.current.add(reminderKey);
    setNotifiedKeys(prev => {
      const next = new Set(prev);
      next.add(reminderKey);
      return next;
    });
  }, [handlePerformWorkout, notificationSound, notificationVibration, updateScheduledWorkout]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      scheduledWorkouts.forEach(workout => {
        if (workout.completed || workout.missed || !workout.time || !workout.date) return;

        try {
          // Robust date/time parsing
          const workoutDate = new Date(workout.date);
          const [hours, minutes] = workout.time.split(':').map(Number);
          const workoutDateTime = new Date(workoutDate);
          workoutDateTime.setHours(hours, minutes, 0, 0);

          // Handle automatic "Missed" status if it's past the time by 2 hours
          if (!workout.completed && !workout.missed && isPast(addMinutes(workoutDateTime, 120))) {
             console.log(`[NotificationSystem] Marking workout as missed: ${workout.workoutType}`);
             updateScheduledWorkout(workout.id, { missed: true });
             return;
          }

          // Process reminders
          const activeReminders = (workout.reminders && workout.reminders.length > 0)
            ? workout.reminders
            : [{ timeBefore: 'On time', method: 'notification', sound: 'chime' } as Reminder];

          activeReminders.forEach((reminder, index) => {
            const reminderKey = `${workout.id}-${index}-${reminder.timeBefore}-${workout.date}`;
            
            // Check BOTH the synchronous ref (immediate) and the async state (persisted)
            if (firedThisCycleRef.current.has(reminderKey)) return;
            if (notifiedKeys.has(reminderKey)) return;

            // Calculate trigger time
            let triggerTime = new Date(workoutDateTime);
            const timeBeforeLower = reminder.timeBefore.toLowerCase();

            if (timeBeforeLower.includes('10 minutes')) triggerTime.setMinutes(triggerTime.getMinutes() - 10);
            else if (timeBeforeLower.includes('15 minutes')) triggerTime.setMinutes(triggerTime.getMinutes() - 15);
            else if (timeBeforeLower.includes('30 minutes')) triggerTime.setMinutes(triggerTime.getMinutes() - 30);
            else if (timeBeforeLower.includes('45 minutes')) triggerTime.setMinutes(triggerTime.getMinutes() - 45);
            else if (timeBeforeLower.includes('1 hour')) triggerTime.setHours(triggerTime.getHours() - 1);
            else if (timeBeforeLower.includes('2 hours')) triggerTime.setHours(triggerTime.getHours() - 2);
            else if (timeBeforeLower.includes('morning') || timeBeforeLower.includes('day of')) {
              triggerTime.setHours(8, 0, 0, 0);
            } else if (timeBeforeLower.includes('minute')) {
               const val = parseInt(timeBeforeLower) || 0;
               triggerTime.setMinutes(triggerTime.getMinutes() - val);
            }

            const diffMs = now.getTime() - triggerTime.getTime();
            
            // Trigger if within a 1-minute window (0 to 60 seconds past trigger time)
            if (diffMs >= 0 && diffMs < 60000) {
              triggerNotification(workout, reminder, reminderKey);
            }
          });
        } catch (e) {
          console.error("Error processing reminder for workout:", workout.id, e);
        }
      });
    };

    // Check every 5 seconds (was 1 second — no need to check that often, reduces duplicate risk)
    const interval = setInterval(checkReminders, 5000);
    checkReminders(); // Run once immediately

    return () => clearInterval(interval);
  }, [scheduledWorkouts, notifiedKeys, triggerNotification, updateScheduledWorkout]);

  // Audio Context unlocker - helps with browser policies
  useEffect(() => {
    const handleUnlock = () => {
      unlockAudio().then(() => {
        console.log("[NotificationSystem] Audio Context primed.");
        // We only remove the listeners if we successfully primed
        window.removeEventListener('click', handleUnlock);
        window.removeEventListener('touchstart', handleUnlock);
        window.removeEventListener('mousedown', handleUnlock);
        window.removeEventListener('keydown', handleUnlock);
      }).catch(err => {
        console.warn("[NotificationSystem] Audio Context priming failed, will retry on next interaction:", err);
      });
    };

    window.addEventListener('click', handleUnlock);
    window.addEventListener('touchstart', handleUnlock);
    window.addEventListener('mousedown', handleUnlock);
    window.addEventListener('keydown', handleUnlock);

    return () => {
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
      window.removeEventListener('mousedown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  return null;
};
