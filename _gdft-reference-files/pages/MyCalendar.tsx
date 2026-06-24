import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Calendar as CalendarUI, 
  CalendarProps 
} from "@/components/ui/calendar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format, isBefore, isAfter, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, startOfToday, isFuture } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Play, HelpCircle, ChevronDown, Dumbbell, Flame, SlidersHorizontal, PersonStanding, Sparkles, ClipboardList, History, Edit, Trash2, Info, X, Copy, ExternalLink, Bell, Volume2, Music, Mail, Check, CheckCircle2, Timer, ListTodo, ArrowLeft } from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useExercise } from "@/contexts/ExerciseContext";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { playWebSound } from "@/lib/sounds";

const WORKOUT_TYPES_CONFIG = [
  { id: 'Weights', title: 'Weights', icon: Dumbbell, color: 'blue', accent: '#3b82f6', bgImage: '/images/exercise_bg_weights.png', gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.4) 100%)', glow: 'rgba(59, 130, 246, 0.3)' },
  { id: 'Cardio', title: 'Cardio', icon: Flame, color: 'green', accent: '#10b981', bgImage: '/images/exercise_bg_cardio.png', gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.5) 0%, rgba(5, 150, 105, 0.4) 100%)', glow: 'rgba(16, 185, 129, 0.3)' },
  { id: 'Slide Board', title: 'Slide Board', icon: SlidersHorizontal, color: 'red', accent: '#ef4444', bgImage: '/images/exercise_bg_slideboard_v2.png', gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.5) 0%, rgba(220, 38, 38, 0.4) 100%)', glow: 'rgba(239, 68, 68, 0.3)' },
  { id: 'No Equipment', title: 'No Equipment', icon: PersonStanding, color: 'orange', accent: '#f59e0b', bgImage: '/images/exercise_bg_bodyweight.png', gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.5) 0%, rgba(217, 119, 6, 0.4) 100%)', glow: 'rgba(245, 158, 11, 0.3)' },
  { id: 'Custom', title: 'Template', icon: Sparkles, color: 'purple', accent: '#8b5cf6', bgImage: '/images/exercise_bg_favorites.png', gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(124, 58, 237, 0.4) 100%)', glow: 'rgba(139, 92, 246, 0.3)' },
  { id: 'Plan', title: 'From Plan', icon: ClipboardList, color: 'blue', accent: '#0ea5e9', bgImage: '/images/plans_hero_banner.png', gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.5) 0%, rgba(2, 132, 199, 0.4) 100%)', glow: 'rgba(14, 165, 233, 0.3)' },
  { id: 'Existing', title: 'From History', icon: History, color: 'green', accent: '#059669', bgImage: '/images/exercise_bg_all.png', gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.5) 0%, rgba(4, 120, 87, 0.4) 100%)', glow: 'rgba(5, 150, 105, 0.3)' },
];
import CalendarHelpPopup from "@/components/ui/CalendarHelpPopup";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Exercise } from "@/lib/data";
import ExerciseFilters from "@/components/ui/ExerciseFilters";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import WorkoutTypeCard from "@/components/ui/WorkoutTypeCard";
import { cn } from "@/lib/utils";
import { formatTimeString } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ScheduledWorkout, Reminder } from "@/lib/types";

type PendingWorkout = Omit<ScheduledWorkout, "id"> & { id?: string };

// type PendingWorkout removed (duplicate)

const MyCalendar = () => {
  const [view, setView] = useState<"week" | "month" | "year">("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [schedulingDate, setSchedulingDate] = useState<Date | null>(null);
  const [workoutType, setWorkoutType] = useState("Weights");
  const [workoutTime, setWorkoutTime] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedExistingWorkoutId, setSelectedExistingWorkoutId] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [dayDetailData, setDayDetailData] = useState<{ date: Date; scheduled: ScheduledWorkout[]; completed: ReturnType<typeof useWorkout>['workouts'] } | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<ScheduledWorkout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<ScheduledWorkout | null>(null);
  const [showEditComingSoon, setShowEditComingSoon] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseSelectionCompleted, setExerciseSelectionCompleted] = useState(false); // New state
  const [isScheduleHelpOpen, setIsScheduleHelpOpen] = useState(false); // New state for the new help popup
  const [duplicatingWorkout, setDuplicatingWorkout] = useState<ScheduledWorkout | null>(null);
  const [duplicationDate, setDuplicationDate] = useState<Date | undefined>(undefined);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [activeScheduleAccordion, setActiveScheduleAccordion] = useState<string>("focus");

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("schedule") === "true") {
      setSchedulingDate(new Date());
      setIsDialogOpen(true);
      setActiveScheduleAccordion("focus");
      // Clear the param after opening to avoid re-opening on refresh if not desired, 
      // but usually searchParams update triggers re-render, so let's be careful.
    }
  }, [searchParams]);

  const { workouts, savedWorkoutTemplates, customPlans, startWorkout, startSavedWorkout, scheduledWorkouts, addScheduledWorkout, updateScheduledWorkout, deleteScheduledWorkout } = useWorkout();
  const { exercises: allExercises } = useExercise();
  const navigate = useNavigate();

  // State for filters must be declared before useMemo that uses them
  const [searchQuery, setSearchQuery] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("All");

  // Filtered exercises for the new dialog
  const filteredExercises = useMemo(() => {
    return allExercises.filter(exercise => {
      const searchLower = searchQuery.toLowerCase();
      if (searchQuery && !exercise.name.toLowerCase().includes(searchLower)) {
        return false;
      }

      if (equipmentFilter !== "All") {
        const equipment = exercise.equipment as string;
        // Exact match or handle plural variants
        if (equipment !== equipmentFilter &&
            !(equipmentFilter === 'Dumbbell' && (equipment === 'Dumbbells' || equipment === 'Dumbbell')) &&
            !(equipmentFilter === 'Kettlebell' && (equipment === 'Kettlebells' || equipment === 'Kettlebell')) &&
            !(equipmentFilter === 'Resistance Band' && (equipment === 'Resistance Bands' || equipment === 'Resistance Band'))) {
          return false;
        }
      }
      
      if (categoryFilter !== "All" && categoryFilter !== "Favorites" && exercise.category !== categoryFilter) {
        return false;
      }
      if (muscleGroupFilter !== "All" && (!exercise.muscleGroups || !exercise.muscleGroups.includes(muscleGroupFilter as any))) {
        return false;
      }
      return true;
    });
  }, [allExercises, searchQuery, equipmentFilter, categoryFilter, muscleGroupFilter]);

  // State for new exercise selector
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState<PendingWorkout | null>(null);
  
  // Removed localStorage effect as we use Context/API now

  useEffect(() => {
    if (editingWorkout) {
        setSchedulingDate(editingWorkout.date);
        let type = editingWorkout.workoutType;
        if (editingWorkout.templateId) {
            type = "Custom";
        } else if (editingWorkout.planId) {
            type = "Plan";
        } else if (editingWorkout.existingWorkoutId) {
            type = "Existing";
        }
        setWorkoutType(type);
        setWorkoutTime(editingWorkout.time || "");
        setSelectedTemplateId(editingWorkout.templateId || "");
        setSelectedPlanId(editingWorkout.planId || "");
        setSelectedExistingWorkoutId(editingWorkout.existingWorkoutId || "");
        setSelectedExercises(editingWorkout.exercises || []);
        const currentReminders = (editingWorkout.reminders || []).map(r => ({
            ...r,
            method: r.method || 'notification',
            sound: r.sound || 'chime'
        }));
        
        setReminders(currentReminders);
        setPendingWorkout({
            ...editingWorkout,
            reminders: currentReminders
        });
        
        // Very important: Mark exercises as completed since this is an existing workout
        setExerciseSelectionCompleted(true);
        setIsExerciseSelectorOpen(false);
    }
  }, [editingWorkout]);

  // Chime logic moved to global WorkoutReminderSystem

  // Notification logic moved to global WorkoutReminderSystem

  // Update missed workouts
  useEffect(() => {
    const today = startOfToday();
    scheduledWorkouts.forEach(w => {
        if (!w.completed && !w.missed && isBefore(new Date(w.date), today)) {
             updateScheduledWorkout(w.id, { missed: true });
        }
    });
  }, [scheduledWorkouts, updateScheduledWorkout]);

  // Function to navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
    setCurrentMonth(new Date());
  };

  // Function to go to previous period
  const goToPrevious = () => {
    if (view === "week") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      });
    } else if (view === "month") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      });
    } else if (view === "year") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
      });
    }
  };

  // Function to go to next period
  const goToNext = () => {
    if (view === "week") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
      });
    } else if (view === "month") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
      });
    } else if (view === "year") {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(newDate.getFullYear() + 1);
        return newDate;
      });
    }
  };

  // Helper function to check workout statuses for a given day
  const getWorkoutStatusesForDay = (date: Date): ("completed" | "scheduled" | "missed")[] => {
    const statuses = new Set<"completed" | "scheduled" | "missed">();
    
    // Check completed workouts from history
    workouts.forEach(workout => {
      // workout.startTime is a timestamp or string
      const startTime = typeof workout.startTime === 'number' ? workout.startTime : new Date(workout.startTime).getTime();
      if (workout.endTime && isSameDay(new Date(startTime), date)) {
        statuses.add("completed");
      }
    });

    // Check scheduled workouts
    scheduledWorkouts.forEach(workout => {
      // Ensure we have a valid Date object for comparison
      const workoutDate = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;
      
      if (isSameDay(workoutDate, date)) {
        if (workout.completed) {
          statuses.add("completed");
        } else if (workout.missed) {
          statuses.add("missed");
        } else {
          statuses.add("scheduled");
        }
      }
    });

    return Array.from(statuses);
  };

  // Function to get workouts for a given day
  const getWorkoutsForDay = (date: Date) => {
    const scheduled = scheduledWorkouts.filter(w => {
        const d = typeof w.date === 'string' ? new Date(w.date) : w.date;
        return isSameDay(d, date);
    });
    // Also include completed workouts from history
    const completed = workouts.filter(w => w.endTime && isSameDay(new Date(w.startTime), date));
    return { scheduled, completed };
  };

  // Function to open scheduling dialog
  const openScheduleDialog = (date: Date) => {
    setSchedulingDate(date);
    setIsDialogOpen(true);
    setExerciseSelectionCompleted(false); // Reset on new dialog open
    setWorkoutType("Weights"); // Default or reset
    setSelectedExercises([]);
    setPendingWorkout(null);
  };

  const handlePerformWorkout = (workout: ScheduledWorkout) => {
    // Future check removed to allow performing workouts anytime

    if (workout.templateId && savedWorkoutTemplates) {
      const template = savedWorkoutTemplates.find(t => t.id === workout.templateId);
      if (template) {
        startSavedWorkout(workout.templateId);
        navigate('/workout');
      } else {
        toast.error("Saved workout template not found.");
      }
    } else if (workout.existingWorkoutId && workouts) {
      const existing = workouts.find(w => w.id === workout.existingWorkoutId);
      if (existing) {
        startWorkout(existing.type, existing.exercises);
        navigate('/workout');
      } else {
        toast.error("Existing workout not found.");
      }
    } else if (workout.planId && customPlans) {
      toast.info("Starting workouts from a plan is not yet supported from the calendar.");
    } else {
      startWorkout(workout.workoutType, workout.exercises || []);
      navigate('/workout');
    }
  };

  // Custom day rendering function for the Calendar in Month view
  const renderDay = (day: Date) => {
    const statuses = getWorkoutStatusesForDay(day);
    const isToday = isSameDay(day, new Date());
    
    return (
      <div 
        className={`relative h-full w-full p-1 flex flex-col items-center justify-between cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          const { scheduled, completed } = getWorkoutsForDay(day);

          if (scheduled.length > 0 || completed.length > 0) {
            // Always open a detail view if there are any workouts
            setDayDetailData({ date: day, scheduled, completed });
            setIsDayDetailOpen(true);
          } else {
            // If no workouts, open scheduling dialog
            if (isBefore(day, startOfToday()) && !isSameDay(day, startOfToday())) {
              toast.error("You cannot schedule workouts for a past date.");
              return;
            }
            setSchedulingDate(day);
            setIsDialogOpen(true);
          }
        }}
      >
        <span className={`flex items-center justify-center rounded-full h-6 w-6 ${
          isToday ? 'border-2 border-gym-blue' : ''
        }`}>{format(day, 'd')}</span>
        
        {statuses.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-auto pb-1">
            {statuses.includes('completed') && (
              <div className="w-2 h-2 rounded-full bg-gym-green shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Completed" />
            )}
            {statuses.includes('scheduled') && (
              <div className="w-2 h-2 rounded-full bg-gym-blue shadow-[0_0_8px_rgba(59,130,246,0.6)]" title="Scheduled" />
            )}
            {statuses.includes('missed') && (
              <div className="w-2 h-2 rounded-full bg-gym-red shadow-[0_0_8px_rgba(239,68,68,0.6)]" title="Missed" />
            )}
          </div>
        )}
      </div>
    );
  };

  // Function to render the week view with today highlighted
  const renderWeekView = () => {
    const start = startOfWeek(currentMonth, { weekStartsOn: 0 });
    const end = endOfWeek(currentMonth, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });
    
    return (
      <div className="space-y-2">
        {days.map((day) => {
          const dayWorkouts = scheduledWorkouts.filter(w => isSameDay(new Date(w.date), day));
          const completedHistWorkouts = workouts.filter(w => w.endTime && isSameDay(new Date(w.startTime), day));
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toString()} className={`p-2 rounded-lg card-glass ${isToday ? 'border-2 border-gym-blue' : 'border border-transparent'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{format(day, 'EEEE')}</h3>
                  <div className="flex items-center gap-1.5">
                    {getWorkoutStatusesForDay(day).includes('completed') && (
                      <div className="w-2 h-2 rounded-full bg-gym-green shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    )}
                    {getWorkoutStatusesForDay(day).includes('scheduled') && (
                      <div className="w-2 h-2 rounded-full bg-gym-blue shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    )}
                    {getWorkoutStatusesForDay(day).includes('missed') && (
                      <div className="w-2 h-2 rounded-full bg-gym-red shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    )}
                  </div>
                </div>
                <span className="text-gray-400">{format(day, 'MMMM d')}</span>
              </div>
              
              <div className="space-y-2">
                {dayWorkouts.length === 0 && completedHistWorkouts.length === 0 && (
                  <p className="text-gray-500">No workouts for this day.</p>
                )}
                {dayWorkouts.map(workout => {
                  let exerciseList: Exercise[] = [];
                  if (workout.templateId) {
                    const template = savedWorkoutTemplates.find(t => t.id === workout.templateId);
                    if (template) {
                      exerciseList = template.exercises
                        .map(id => allExercises.find(e => e.id === id))
                        .filter((e): e is Exercise => !!e);
                    }
                  } else if (workout.existingWorkoutId) {
                    const existing = workouts.find(w => w.id === workout.existingWorkoutId);
                    if (existing) {
                      exerciseList = existing.exercises
                        .map(id => allExercises.find(e => e.id === id))
                        .filter((e): e is Exercise => !!e);
                    }
                  } else if (workout.exercises && workout.exercises.length > 0) {
                    exerciseList = workout.exercises
                      .map(id => allExercises.find(e => e.id === id))
                      .filter((e): e is Exercise => !!e);
                  }
                  
                  return (
                    <Collapsible key={workout.id} className="space-y-1">
                      <div className="flex items-center justify-between p-2 rounded-md bg-background/50 w-full">
                          <div className="flex flex-col items-start">
                              <p className="font-semibold">{workout.workoutType}</p>
                              {workout.time && <p className="text-sm text-muted-foreground">{formatTimeString(workout.time)}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                              {workout.missed && <span className="text-xs text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Missed</span>}
                              {workout.completed && <span className="text-xs text-green-400 bg-green-900/50 px-2 py-1 rounded-full">Completed</span>}
                              {!workout.completed && !workout.missed && (
                                  <Button onClick={() => handlePerformWorkout(workout)} variant="ghost" size="icon" className="h-8 w-8" title="Perform workout">
                                      <Play className="h-5 w-5 text-gym-green" />
                                  </Button>
                              )}
                              <Button onClick={() => {
                                  setEditingWorkout(workout);
                                  setIsDialogOpen(true);
                              }} variant="ghost" size="icon" className="h-8 w-8" title="Edit workout">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => setDeletingWorkout(workout)} variant="ghost" size="icon" className="h-8 w-8" title="Delete workout">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                              <Button onClick={() => {
                                  setDuplicatingWorkout(workout);
                                  setDuplicationDate(undefined);
                              }} variant="ghost" size="icon" className="h-8 w-8" title="Duplicate workout">
                                <Copy className="h-4 w-4" />
                              </Button>
                              {exerciseList.length > 0 && (
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                          </div>
                      </div>
                      <CollapsibleContent className="pl-4 pr-2 pb-2">
                          {exerciseList.length > 0 ? (
                              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 text-left">
                                  {exerciseList.map(ex => <li key={ex.id}>{ex.name}</li>)}
                              </ul>
                          ) : (
                              <p className="text-xs text-gray-500 text-left">No specific exercises for this scheduled workout.</p>
                          )}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
                {completedHistWorkouts.map(workout => {
                    const exerciseList: Exercise[] = workout.exercises
                        .map(id => allExercises.find(ex => ex.id === id))
                        .filter((ex): ex is Exercise => !!ex);
                    
                    return (
                        <Collapsible key={workout.id} className="space-y-1">
                            <div className="flex items-center justify-between p-2 rounded-md bg-background/50 w-full">
                                <div className="flex flex-col items-start">
                                    <p className="font-semibold">{workout.name}</p>
                                    <p className="text-sm text-gray-400">Completed at {format(new Date(workout.startTime), 'p')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button onClick={() => {
                                        startWorkout(workout.type, workout.exercises);
                                        navigate('/workout');
                                    }} variant="ghost" size="icon" className="h-8 w-8">
                                       <Play className="h-5 w-5 text-gym-green" />
                                    </Button>
                                    {exerciseList.length > 0 && (
                                      <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                        </Button>
                                      </CollapsibleTrigger>
                                    )}
                                </div>
                            </div>
                            <CollapsibleContent className="pl-4 pr-2 pb-2">
                                {exerciseList.length > 0 && (
                                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 text-left">
                                        {exerciseList.map(ex => <li key={ex.id}>{ex.name}</li>)}
                                    </ul>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    )
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Function to render the year view with today highlighted
  const renderYearView = () => {
    const months = [];
    const year = currentMonth.getFullYear();
    const today = new Date();
    
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const date = new Date(year, monthIndex, 1);
      months.push(date);
    }
    
    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map((date) => (
          <div 
            key={date.toString()} 
            className="border p-2 cursor-pointer"
            onClick={() => {
              setView("month");
              setCurrentMonth(date);
            }}
          >
            <div className="text-lg font-medium mb-2">{format(date, 'MMMM')}</div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center font-medium">{day}</div>
              ))}
              {Array(new Date(year, date.getMonth() + 1, 0).getDate()).fill(null).map((_, i) => {
                const day = new Date(year, date.getMonth(), i + 1);
                const dayOfWeek = day.getDay();
                const statuses = getWorkoutStatusesForDay(day);
                const isToday = isSameDay(day, today);
                
                // Add empty cells for proper alignment
                if (i === 0) {
                  const emptyBeforeCells = [];
                  for (let j = 0; j < dayOfWeek; j++) {
                    emptyBeforeCells.push(<div key={`empty-before-${j}`} />);
                  }
                  return [
                    ...emptyBeforeCells,
                    <div 
                      key={day.toString()} 
                      className={`text-center relative ${
                        isToday ? 'border border-gym-blue rounded-full' : ''
                      }`}
                    >
                      {i + 1}
                      {statuses.length > 0 && (
                        <div 
                          className={`w-1 h-1 rounded-full inline-block ml-1 ${
                            statuses.includes('completed') ? 'bg-gym-green' : 
                            statuses.includes('missed') ? 'bg-gym-red' : 
                            'bg-gym-blue'
                          }`} 
                        />
                      )}
                    </div>
                  ];
                }
                
                return (
                  <div 
                    key={day.toString()} 
                    className={`text-center relative ${
                      isToday ? 'border border-gym-blue rounded-full' : ''
                    }`}
                  >
                    {i + 1}
                    {statuses.length > 0 && (
                       <div 
                          className={`w-1 h-1 rounded-full inline-block ml-1 ${
                            statuses.includes('completed') ? 'bg-gym-green' : 
                            statuses.includes('missed') ? 'bg-gym-red' : 
                            'bg-gym-blue'
                          }`} 
                        />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to schedule a workout
  const handleScheduleDialogSubmit = async () => {
    if (!schedulingDate) {
        toast.error("Missing date for workout");
        return;
    }
    if (!pendingWorkout) {
        toast.error("Please select a workout type first");
        return;
    }

    try {
        const workoutData: Omit<ScheduledWorkout, 'id'> = {
          date: schedulingDate,
          workoutType: pendingWorkout.workoutType,
          time: workoutTime,
          templateId: pendingWorkout.workoutType === "Custom" ? selectedTemplateId : undefined,
          planId: pendingWorkout.workoutType === "Plan" ? selectedPlanId : undefined,
          existingWorkoutId: pendingWorkout.workoutType === "Existing" ? selectedExistingWorkoutId : undefined,
          exercises: pendingWorkout.exercises || selectedExercises,
          reminders: reminders,
        };

        if (pendingWorkout.workoutType === "Existing" && selectedExistingWorkoutId) {
          const selected = workouts.find(w => w.id === selectedExistingWorkoutId);
          if (selected) {
            (workoutData as ScheduledWorkout).workoutType = `Existing: ${selected.name}`;
          }
        }

        if (editingWorkout) {
           // Update logic
          const updates = { 
            ...workoutData, 
            date: schedulingDate, 
            time: workoutTime, 
            workoutType: workoutData.workoutType,
            exercises: selectedExercises.length > 0 ? selectedExercises : (editingWorkout.exercises || [])
          };
          await updateScheduledWorkout(editingWorkout.id, updates);
        } else {
          // Create logic
          const newWorkout = { 
            ...workoutData, 
            date: schedulingDate, 
            exercises: selectedExercises 
          };
          await addScheduledWorkout(newWorkout);
        }

        // Play confirmation sound on success
        try {
          const audio = new Audio('/sounds/confirmation-chime.mp3');
          audio.volume = 0.4;
          audio.play().catch(e => console.error("Audio playback failed", e));
        } catch (e) {
          console.error("Failed to play sound", e);
        }

        setIsDialogOpen(false);
        setEditingWorkout(null);
        setPendingWorkout(null);
        setExerciseSelectionCompleted(false);
        toast.success(editingWorkout ? "Changes saved successfully" : "Workout scheduled successfully");
    } catch (error) {
        console.error("Failed to save workout:", error);
        toast.error("Failed to save changes. Please try again.");
    }
  };

  const handleWorkoutTypeSelect = (type: string) => {
    setWorkoutType(type);
    const typesRequiringExerciseSelection = ["Weights", "Cardio", "Slide Board", "No Equipment"];

    if (editingWorkout) { // If editing, prepare pending workout immediately
        setPendingWorkout({
            id: editingWorkout.id,
            date: editingWorkout.date,
            workoutType: type, // Use the new type
            time: editingWorkout.time,
            exercises: editingWorkout.exercises
        });
        setSelectedExercises(editingWorkout.exercises || []);
    } else {
        setPendingWorkout({
            date: schedulingDate!,
            workoutType: type,
            time: "", // Time will be set later
            exercises: []
        });
        setSelectedExercises([]);
    }

    setActiveScheduleAccordion("details");

    if (typesRequiringExerciseSelection.includes(type)) {
      // Set filters based on workout type before opening exercise selector
      if (type === "No Equipment") {
        setEquipmentFilter("None");
        setCategoryFilter("No Equipment");
      } else if (type === "Slide Board") {
        setEquipmentFilter("Slide Board");
        setCategoryFilter("Slide Board");
      } else if (type === "Weights") {
        setEquipmentFilter("All");
        setCategoryFilter("Weights");
      } else if (type === "Cardio") {
        setEquipmentFilter("All");
        setCategoryFilter("Cardio");
      } else {
        setEquipmentFilter("All");
        setCategoryFilter("All");
      }
      setMuscleGroupFilter("All");
      setSearchQuery("");
      setIsExerciseSelectorOpen(true);
      // Dialog will remain open, but content will change after exercise selection
    } else {
      // For types like Custom, Plan, Existing, no immediate exercise selection needed here.
      // The main dialog's conditional inputs will show.
      setExerciseSelectionCompleted(true); // Mark as completed to show time/schedule button
    }
  };

  const handleAddExercisesToScheduledWorkout = () => {
    if (!pendingWorkout) return;

    // Update the pending workout with selected exercises
    setPendingWorkout(prev => prev ? { ...prev, exercises: selectedExercises } : null);
    
    setIsExerciseSelectorOpen(false);
    setExerciseSelectionCompleted(true); // Mark exercise selection as complete
    // Now the main dialog (isDialogOpen) should show time and schedule button
    // setIsDialogOpen(true) should already be true or re-assert if needed.
  }

  const handleDeleteWorkout = () => {
    if (!deletingWorkout) return;
    deleteScheduledWorkout(deletingWorkout.id);
    setDeletingWorkout(null);
    setIsDayDetailOpen(false); // Close day detail dialog after delete
  };

  const handleDuplicateWorkout = () => {
    if (!duplicatingWorkout || !duplicationDate) return;
    
    const newWorkout = {
        date: duplicationDate,
        workoutType: duplicatingWorkout.workoutType,
        templateId: duplicatingWorkout.templateId,
        planId: duplicatingWorkout.planId,
        existingWorkoutId: duplicatingWorkout.existingWorkoutId,
        time: duplicatingWorkout.time,
        exercises: duplicatingWorkout.exercises,
        completed: false, 
        missed: false
    };
    
    addScheduledWorkout(newWorkout);
    // toast handled in context
    setDuplicatingWorkout(null);
    setDuplicationDate(undefined);
  };

  return (
    <div className="page-container page-transition pb-24">
      <CalendarHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      {/* ── Page Header & Hero ── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-56"
           style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/goal_bg_health.png)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
          filter: 'brightness(0.55)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(16,185,129,0.3) 0%, rgba(14,116,144,0.2) 50%, rgba(139,92,246,0.2) 100%)',
        }} />
        
        <div className="relative z-10 h-full flex flex-col justify-center px-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10 flex-shrink-0">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Workout Schedule</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  My Calendar
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10" onClick={() => setIsHelpOpen(true)}>
                <HelpCircle className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-auto pb-4">
            <div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-xl">
              <button onClick={goToPrevious} className="p-2 text-emerald-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 font-black text-sm md:text-base tracking-tight text-white min-w-[140px] text-center uppercase">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button onClick={goToNext} className="p-2 text-emerald-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={goToToday} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 h-11 rounded-xl text-white font-bold">
                Today
              </Button>
              <Button 
                onClick={() => {
                  setSchedulingDate(new Date());
                  setIsDialogOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 h-11 rounded-xl shadow-lg shadow-emerald-900/40 font-bold"
              >
                <Plus className="mr-2 h-4 w-4" /> Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>
        

      
      <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month" | "year")} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        
        <TabsContent value="week" className="mt-4">
          {renderWeekView()}
        </TabsContent>
        
        <TabsContent value="month" className="mt-4">
          <CalendarUI
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border w-full"
            classNames={{
              months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4 w-full",
              table: "w-full border-collapse border-spacing-0",
              head_row: "flex",
              row: "flex w-full mt-2",
            }}
            components={{
              Day: ({ date }: { date: Date }) => renderDay(date)
            }}
          />
        </TabsContent>
        
        <TabsContent value="year" className="mt-4 overflow-x-auto">
          {renderYearView()}
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 flex items-center flex-wrap gap-3 sm:gap-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <span className="text-sm">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
          <span className="text-sm">Scheduled</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <span className="text-sm">Missed</span>
        </div>
      </div>
      
      {/* Scheduling Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
              setEditingWorkout(null);
              setWorkoutType("Weights");
              setWorkoutTime("");
              setSelectedTemplateId("");
              setSelectedPlanId("");
              setSelectedExistingWorkoutId("");
              setPendingWorkout(null);
              setExerciseSelectionCompleted(false);
              setSelectedExercises([]);
              setIsScheduleHelpOpen(false); // Close help if dialog closes
              setReminders([]);
              setActiveScheduleAccordion("focus");
          }
      }}>
        <DialogContent className="sm:max-w-2xl w-full h-[calc(100dvh-64px)] top-0 translate-y-0 sm:top-[50%] sm:translate-y-[-50%] sm:h-[90dvh] md:h-auto md:max-h-[90vh] flex flex-col p-0 overflow-hidden border-white/10 bg-[#0a0a0c]">
          <DialogHeader className="p-6 pb-2 border-b border-white/5 relative bg-gradient-to-b from-[#111114] to-[#0a0a0c]">
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-gym-blue" />
                  {editingWorkout ? 'Edit Workout' : 'Schedule Workout'}
                </DialogTitle>
                <DialogDescription className="text-gray-500 font-medium">
                  {schedulingDate && format(schedulingDate, 'EEEE, MMMM do, yyyy')}
                </DialogDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5" onClick={() => setIsScheduleHelpOpen(!isScheduleHelpOpen)}>
                <HelpCircle className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-grow p-0">
            <div className="p-6 pt-4 pb-12 space-y-6">
              {isScheduleHelpOpen && (
                <Alert className="bg-gym-blue/10 border-gym-blue/20 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Info className="h-4 w-4 text-gym-blue" />
                  <AlertDescription className="text-sm text-gray-300">
                    <p className="font-bold text-white mb-2">Quick Guide:</p>
                    <ol className="list-decimal list-inside space-y-1 opacity-80">
                      <li>Pick a <span className="text-gym-blue font-bold text-xs uppercase tracking-tight">Focus</span> below</li>
                      <li>Configure your <span className="text-gym-blue font-bold text-xs uppercase tracking-tight">Program</span> details</li>
                      <li>Set <span className="text-gym-blue font-bold text-xs uppercase tracking-tight">Time & Alerts</span></li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              <Accordion 
                type="single" 
                collapsible 
                value={activeScheduleAccordion} 
                onValueChange={setActiveScheduleAccordion}
                className="space-y-4"
              >
                {/* STEP 1: FOCUS */}
                <AccordionItem value="focus" className="border border-white/5 rounded-2xl bg-white/[0.02] overflow-hidden px-4 py-1">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gym-blue/20 flex items-center justify-center text-gym-blue font-black text-sm border border-gym-blue/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">1</div>
                      <span className="text-lg font-black tracking-tight text-white uppercase italic">Workout Focus</span>
                      {workoutType && (
                        <div className="ml-2 px-3 py-0.5 rounded-full bg-gym-blue text-white font-bold text-[10px] uppercase tracking-widest shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                          {workoutType}
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {WORKOUT_TYPES_CONFIG.map((type) => {
                        const isSelected = workoutType === type.id;
                        return (
                          <div
                            key={type.id}
                            onClick={() => handleWorkoutTypeSelect(type.id)}
                            className={cn(
                              "relative group cursor-pointer h-24 rounded-xl overflow-hidden transition-all duration-300 border-2 active:scale-95",
                              isSelected ? "border-white" : "border-white/5 hover:border-white/20"
                            )}
                            style={{
                              boxShadow: isSelected ? `0 0 20px ${type.glow}` : 'none'
                            }}
                          >
                            {/* Bg Image */}
                            <div className="absolute inset-0 z-0 scale-105 group-hover:scale-110 transition-transform duration-700 opacity-40 group-hover:opacity-60" style={{
                              backgroundImage: `url(${type.bgImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }} />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 z-10" style={{ background: type.gradient, opacity: isSelected ? 0.8 : 0.6 }} />
                            {/* Glass border inside */}
                            <div className="absolute inset-[2px] z-20 rounded-[10px] border border-white/5 bg-black/10 backdrop-blur-[1px]" />
                            {/* Content */}
                            <div className="relative z-30 h-full w-full flex flex-col items-center justify-center p-2">
                              <type.icon className={cn("h-6 w-6 mb-1 drop-shadow-lg", isSelected ? "text-white" : "text-white/80")} style={{ filter: `drop-shadow(0 0 4px ${type.glow})` }} />
                              <span className="text-[11px] font-black uppercase tracking-widest text-shadow-sm leading-none text-center">{type.title}</span>
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-white flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                  <Check className="h-2.5 w-2.5 text-black" strokeWidth={4} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* STEP 2: DETAILS */}
                <AccordionItem value="details" className="border border-white/5 rounded-2xl bg-white/[0.02] overflow-hidden px-4 py-1" disabled={!workoutType}>
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-black text-sm border border-purple-500/30">2</div>
                      <span className="text-lg font-black tracking-tight text-white uppercase italic">Program Selection</span>
                      {((workoutType === "Custom" && selectedTemplateId) || 
                        (workoutType === "Plan" && selectedPlanId) || 
                        (workoutType === "Existing" && selectedExistingWorkoutId) ||
                        (exerciseSelectionCompleted)) && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6 space-y-5">
                    {workoutType === "Custom" && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 px-1">Select Workout Template</Label>
                        <Select value={selectedTemplateId} onValueChange={(val) => {
                          setSelectedTemplateId(val);
                          setActiveScheduleAccordion("logistics");
                        }}>
                          <SelectTrigger className="w-full bg-black/40 border-white/10 rounded-xl h-12 shadow-inner">
                            <SelectValue placeholder="Pick a tailored template..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111114] border-white/10">
                            {savedWorkoutTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id} className="focus:bg-white/10">{template.name}</SelectItem>
                            ))}
                            {savedWorkoutTemplates.length === 0 && (
                              <div className="p-4 text-center text-xs text-gray-500 italic">No templates created yet.</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {workoutType === "Plan" && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 px-1">Select Custom Plan</Label>
                        <Select value={selectedPlanId} onValueChange={(val) => {
                          setSelectedPlanId(val);
                          setActiveScheduleAccordion("logistics");
                        }}>
                          <SelectTrigger className="w-full bg-black/40 border-white/10 rounded-xl h-12 shadow-inner">
                            <SelectValue placeholder="Pick a long-term plan..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111114] border-white/10">
                            {customPlans.map(plan => (
                              <SelectItem key={plan.id} value={plan.id} className="focus:bg-white/10">{plan.name}</SelectItem>
                            ))}
                            {customPlans.length === 0 && (
                              <div className="p-4 text-center text-xs text-gray-500 italic">No custom plans found.</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {workoutType === "Existing" && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 px-1">Select Past Workout</Label>
                        <Select value={selectedExistingWorkoutId} onValueChange={(val) => {
                          setSelectedExistingWorkoutId(val);
                          setActiveScheduleAccordion("logistics");
                        }}>
                          <SelectTrigger className="w-full bg-black/40 border-white/10 rounded-xl h-12 shadow-inner">
                            <SelectValue placeholder="Repeat a previous success..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111114] border-white/10">
                            {workouts.filter(w => w.endTime).map(workout => (
                              <SelectItem key={workout.id} value={workout.id} className="focus:bg-white/10">
                                {workout.name} — {format(new Date(workout.startTime), 'MMM d, yyyy')}
                              </SelectItem>
                            ))}
                            {workouts.filter(w => w.endTime).length === 0 && (
                              <div className="p-4 text-center text-xs text-gray-500 italic">No workout history available yet.</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {["Weights", "Cardio", "Slide Board", "No Equipment"].includes(workoutType) && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-black text-white italic uppercase tracking-tight">Hand-picked Exercises</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Build your session from scratch</span>
                          </div>
                          {!exerciseSelectionCompleted ? (
                             <Button size="sm" onClick={() => handleWorkoutTypeSelect(workoutType)} className="bg-gym-blue hover:bg-gym-blue/80 h-8 rounded-lg text-[11px] font-black uppercase italic tracking-widest shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                                Select Now <ChevronRight className="h-3 w-3 ml-1" />
                             </Button>
                          ) : (
                            <div className="flex items-center gap-3">
                               <span className="text-[11px] font-black text-green-500 italic">{selectedExercises.length} Exercises Picked</span>
                               <Button variant="ghost" size="sm" onClick={() => handleWorkoutTypeSelect(workoutType)} className="h-7 text-[10px] font-black uppercase text-gray-400 hover:text-white hover:bg-white/5 underline underline-offset-4">
                                Edit
                               </Button>
                            </div>
                          )}
                        </div>
                        {exerciseSelectionCompleted && (
                          <div className="flex justify-center pt-2">
                             <Button variant="outline" size="sm" onClick={() => setActiveScheduleAccordion("logistics")} className="border-white/10 h-8 text-[11px] font-black uppercase italic tracking-widest hover:bg-white/5">
                               Move to Logistics <ChevronDown className="h-3 w-3 ml-1" />
                             </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* STEP 3: LOGISTICS */}
                <AccordionItem value="logistics" className="border border-white/5 rounded-2xl bg-white/[0.02] overflow-hidden px-4 py-1" disabled={!workoutType}>
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-black text-sm border border-pink-500/30">3</div>
                      <span className="text-lg font-black tracking-tight text-white uppercase italic">Time & Alerts</span>
                      {(workoutTime || reminders.length > 0) && (
                        <div className="flex items-center gap-1.5 ml-2">
                           {workoutTime && <Timer className="h-3.5 w-3.5 text-blue-400" />}
                           {reminders.length > 0 && <Bell className="h-3.5 w-3.5 text-orange-400" />}
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6 space-y-6">
                    {/* Time Input */}
                    <div className="space-y-3 bg-[#111114]/80 p-5 rounded-2xl border border-white/5 shadow-inner">
                      <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Pick Start Time</Label>
                        <span className="text-[10px] font-black text-blue-400 italic">Optional but recommended</span>
                      </div>
                      <div className="relative group">
                        <Input 
                          id="workoutTime" 
                          type="time" 
                          value={workoutTime} 
                          onChange={(e) => setWorkoutTime(e.target.value)} 
                          className="bg-black/40 border-white/10 h-14 rounded-2xl text-lg font-black tracking-widest text-[#90cdf4] pr-12 focus:border-gym-blue/50 focus:ring-0 placeholder:text-gray-800 transition-all shadow-inner" 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                          {workoutTime && (
                             <button onClick={() => setWorkoutTime("")} className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                               <X className="h-4 w-4" />
                             </button>
                          )}
                          <button onClick={() => setWorkoutTime(format(new Date(), 'HH:mm'))} className="h-8 w-8 rounded-full bg-gym-blue/10 flex items-center justify-center border border-gym-blue/20 text-gym-blue hover:bg-gym-blue hover:text-white transition-all shadow-lg active:scale-95">
                            <Clock className="h-4 w-4" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Reminders section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Bell className="h-3.5 w-3.5 text-orange-400" />
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Smart Notifications</Label>
                        </div>
                        {reminders.length > 0 && <span className="bg-orange-500 text-black font-black text-[9px] px-2 rounded-full py-0.5">{reminders.length} Active</span>}
                      </div>

                      <div className="space-y-3">
                        {reminders.map((reminder, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative group animate-in slide-in-from-right-4 duration-400 hover:border-orange-500/30 transition-colors">
                            <div className="flex flex-col gap-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-gray-600 uppercase italic">Alarm Sequence — 0{index + 1}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 rounded-full text-red-500/50 hover:text-red-500 hover:bg-red-500/10" 
                                    onClick={() => setReminders(reminders.filter((_, i) => i !== index))}
                                  >
                                    <X className="h-4 w-4" strokeWidth={3} />
                                  </Button>
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                     <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Alert Timing</span>
                                     <Select 
                                      value={['On time', '10 minutes before', '30 minutes before', '1 hour before', '2 hours before', 'On the day of (morning)'].includes(reminder.timeBefore) ? reminder.timeBefore : 'custom'} 
                                      onValueChange={(val) => {
                                        const newReminders = [...reminders];
                                        if (val === 'custom') {
                                          newReminders[index].timeBefore = '15 minutes before';
                                        } else {
                                          newReminders[index].timeBefore = val;
                                        }
                                        setReminders(newReminders);
                                      }}
                                    >
                                      <SelectTrigger className="h-10 bg-black/40 border-white/10 rounded-xl text-xs font-bold text-white shadow-inner">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-[#111114] border-white/10">
                                        <SelectItem value="On time">Immediately</SelectItem>
                                        <SelectItem value="10 minutes before">10m Ahead</SelectItem>
                                        <SelectItem value="30 minutes before">30m Ahead</SelectItem>
                                        <SelectItem value="1 hour before">1h Ahead</SelectItem>
                                        <SelectItem value="On the day of (morning)">Day Of (8AM)</SelectItem>
                                        <SelectItem value="custom">Manual...</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                     <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Sound FX</span>
                                     <div className="flex gap-1.5">
                                        <Select 
                                          value={reminder.sound} 
                                          onValueChange={(val) => {
                                            const newReminders = [...reminders];
                                            newReminders[index].sound = val;
                                            setReminders(newReminders);
                                            if (val !== 'none') playWebSound(val as any);
                                          }}
                                        >
                                          <SelectTrigger className="grow h-10 bg-black/40 border-white/10 rounded-xl text-xs font-bold text-white shadow-inner">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-[#111114] border-white/10">
                                            <SelectItem value="chime">Chime</SelectItem>
                                            <SelectItem value="bell">Sharp Bell</SelectItem>
                                            <SelectItem value="none">Muted</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        {reminder.sound !== 'none' && (
                                          <Button variant="ghost" size="icon" className="h-10 w-10 b-black/40 border border-white/10 rounded-xl text-gym-blue" onClick={() => playWebSound(reminder.sound as any)}>
                                            <Volume2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            </div>
                          </div>
                        ))}

                        <Button 
                          onClick={() => setReminders([...reminders, { timeBefore: "30 minutes before", sound: "chime", method: 'notification' }])}
                          className="w-full h-14 bg-white/[0.03] hover:bg-white/[0.06] border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 group transition-all"
                        >
                          <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                             <Plus className="h-4 w-4" strokeWidth={4} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">Add Alert Sequence</span>
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
           
          <DialogFooter className="p-6 pt-4 border-t border-white/5 bg-gradient-to-t from-[#0d0d0f] to-[#0a0a0c] flex items-center justify-between sm:justify-between w-full">
            <Button 
              variant="ghost" 
              className="text-gray-500 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingWorkout(null);
                setPendingWorkout(null);
                setExerciseSelectionCompleted(false);
                setActiveScheduleAccordion("focus");
            }}>
              Discard
            </Button>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleScheduleDialogSubmit} 
                disabled={!workoutType || (["Custom", "Plan", "Existing"].includes(workoutType) && !selectedTemplateId && !selectedPlanId && !selectedExistingWorkoutId) || (["Weights", "Cardio", "Slide Board", "No Equipment"].includes(workoutType) && !exerciseSelectionCompleted)}
                className="bg-white hover:bg-gray-100 text-black h-12 px-8 rounded-2xl font-black uppercase italic tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
              >
                {editingWorkout ? 'Update Schedule' : 'Launch Schedule'}
                <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
        <DialogContent className="sm:max-w-4xl w-full h-[calc(100dvh-64px)] top-0 translate-y-0 sm:top-[50%] sm:translate-y-[-50%] sm:h-[90vh] flex flex-col p-0 overflow-hidden">
          {showEditComingSoon && (
            <Alert variant="default" className="flex items-center justify-between">
                <div className="flex items-center">
                    <Info className="h-5 w-5 mr-3 text-blue-500" />
                    <AlertDescription>
                        Editing scheduled workouts is coming soon!
                    </AlertDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowEditComingSoon(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </Alert>
          )}
          <DialogHeader>
            <DialogTitle>
              Workouts for {dayDetailData && format(dayDetailData.date, 'EEEE, MMMM do')}
            </DialogTitle>
            <DialogDescription>
              Perform a scheduled workout or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {dayDetailData && dayDetailData.scheduled.length === 0 && dayDetailData.completed.length === 0 && (
              <p className="text-muted-foreground text-center">No workouts for this day.</p>
            )}
            {dayDetailData?.scheduled.map(workout => {
              let exerciseList: Exercise[] = [];
              if (workout.templateId) {
                const template = savedWorkoutTemplates.find(t => t.id === workout.templateId);
                if (template) {
                  exerciseList = template.exercises
                    .map(id => allExercises.find(e => e.id === id))
                    .filter((e): e is Exercise => !!e);
                }
              } else if (workout.existingWorkoutId) {
                const existing = workouts.find(w => w.id === workout.existingWorkoutId);
                if (existing) {
                  exerciseList = existing.exercises
                    .map(id => allExercises.find(e => e.id === id))
                    .filter((e): e is Exercise => !!e);
                }
              } else if (workout.exercises && workout.exercises.length > 0) {
                exerciseList = workout.exercises
                  .map(id => allExercises.find(e => e.id === id))
                  .filter((e): e is Exercise => !!e);
              }

              return (
                <Collapsible key={workout.id} className="space-y-1">
                  <div className="flex items-center justify-between p-2 rounded-md bg-background/50 w-full">
                    <div className="flex flex-col items-start">
                      <p className="font-semibold">{workout.workoutType}</p>
                      {workout.time && <p className="text-sm text-muted-foreground">{formatTimeString(workout.time)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {workout.missed && <span className="text-xs text-red-400 bg-red-900/50 px-2 py-1 rounded-full">Missed</span>}
                      {workout.completed && <span className="text-xs text-green-400 bg-green-900/50 px-2 py-1 rounded-full">Completed</span>}
                      {!workout.completed && !workout.missed && (
                        <Button onClick={() => { handlePerformWorkout(workout); setIsDayDetailOpen(false); }} variant="ghost" size="icon" className="h-8 w-8" title="Perform workout">
                          <Play className="h-5 w-5 text-gym-green" />
                        </Button>
                      )}
                      <Button onClick={() => {
                          setEditingWorkout(workout);
                          setIsDayDetailOpen(false);
                          setIsDialogOpen(true);
                      }} variant="ghost" size="icon" className="h-8 w-8" title="Edit workout">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => setDeletingWorkout(workout)} variant="ghost" size="icon" className="h-8 w-8" title="Delete workout">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button onClick={() => {
                          setDuplicatingWorkout(workout);
                          setDuplicationDate(undefined);
                      }} variant="ghost" size="icon" className="h-8 w-8" title="Duplicate workout">
                        <Copy className="h-4 w-4" />
                      </Button>
                      {exerciseList.length > 0 && (
                        <CollapsibleTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                  </div>
                   <CollapsibleContent className="pl-4 pr-2 pb-2 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                             <Dumbbell className="h-3 w-3" /> Exercises
                          </div>
                          {exerciseList.length > 0 ? (
                              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 text-left bg-white/5 p-2 rounded border border-white/5">
                                  {exerciseList.map(ex => <li key={ex.id}>{ex.name}</li>)}
                              </ul>
                          ) : (
                              <p className="text-xs text-gray-500 text-left italic">No specific exercises listed.</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                             <Bell className="h-3 w-3" /> Reminders {workout.reminders && workout.reminders.length > 0 && `(${workout.reminders.length})`}
                          </div>
                          {workout.reminders && workout.reminders.length > 0 ? (
                            <div className="space-y-1.5">
                              {workout.reminders.map((rem, i) => (
                                <div key={i} className="flex items-center justify-between text-sm bg-gym-blue/10 p-2 rounded border border-gym-blue/20">
                                  <div className="flex items-center gap-2">
                                    <Bell className="h-3.5 w-3.5 text-gym-blue" />
                                    <span className="text-gray-200">{rem.timeBefore}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 opacity-60 italic text-xs">
                                     {rem.sound !== 'none' && (
                                       <>
                                         <Volume2 className="h-3 w-3" />
                                         <span>{rem.sound}</span>
                                       </>
                                     )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 text-left italic">No reminders set for this workout.</p>
                          )}
                        </div>
                      </div>
                   </CollapsibleContent>
                </Collapsible>
              )
            })}
            {dayDetailData?.completed.map(workout => {
              const exerciseList = workout.exercises
                .map(id => allExercises.find(e => e.id === id))
                .filter((e): e is Exercise => !!e);

              return (
                <Collapsible key={workout.id} className="space-y-1">
                  <div className="flex items-center justify-between p-2 rounded-md bg-background/50 w-full">
                    <div className="flex flex-col items-start">
                      <p className="font-semibold">{workout.name}</p>
                      <p className="text-sm text-muted-foreground">Completed at {format(new Date(workout.startTime), 'p')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => {
                        startWorkout(workout.type, workout.exercises);
                        navigate('/workout');
                        setIsDayDetailOpen(false);
                      }} variant="ghost" size="icon" className="h-8 w-8" title="Perform again">
                        <Play className="h-5 w-5 text-gym-green" />
                      </Button>
                      <Button 
                        onClick={() => {
                          const dateStr = format(new Date(workout.startTime), 'yyyy-MM-dd');
                          navigate(`/stats?highlight=${workout.id}&date=${dateStr}`);
                          setIsDayDetailOpen(false);
                        }} 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        title="View in Stats"
                      >
                        <ExternalLink className="h-4 w-4 text-gym-blue" />
                      </Button>
                      {exerciseList.length > 0 && (
                        <CollapsibleTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                  </div>
                  <CollapsibleContent className="pl-4 pr-2 pb-2">
                    {exerciseList.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 text-left">
                        {exerciseList.map(ex => <li key={ex.id} className="break-words leading-snug">{ex.name}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 text-left">No exercise details found.</p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDayDetailOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDayDetailOpen(false);
              const date = dayDetailData!.date;
              if (isBefore(date, startOfToday()) && !isSameDay(date, startOfToday())) {
                  toast.error("You cannot schedule workouts for a past date.");
                  return;
              }
              setSchedulingDate(date);
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Schedule New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: Exercise Selector Dialog */}
      <Dialog open={isExerciseSelectorOpen} onOpenChange={setIsExerciseSelectorOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Exercises</DialogTitle>
            <DialogDescription>
              Choose exercises for your '{pendingWorkout?.workoutType}' workout on {pendingWorkout && format(pendingWorkout.date, 'MMMM do')}
              {pendingWorkout?.time && ` at ${formatTimeString(pendingWorkout.time)}`}.
            </DialogDescription>
          </DialogHeader>
          <ExerciseFilters
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              equipmentFilter={equipmentFilter}
              onEquipmentFilterChange={setEquipmentFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              muscleGroupFilter={muscleGroupFilter}
              onMuscleGroupFilterChange={setMuscleGroupFilter}
          />
          <ScrollArea className="flex-grow my-4 border rounded-md">
              <div className="space-y-1 p-2">
                  {filteredExercises.map(exercise => (
                      <div key={exercise.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <Checkbox
                              id={`ex-${exercise.id}`}
                              checked={selectedExercises.includes(exercise.id)}
                              onCheckedChange={(checked) => {
                                  setSelectedExercises(prev => 
                                    checked 
                                      ? [...prev, exercise.id] 
                                      : prev.filter(id => id !== exercise.id)
                                  );
                              }}
                          />
                          <div className="flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                            {exercise.pictureUrl || exercise.thumbnailUrl ? (
                              <img 
                                src={exercise.pictureUrl || exercise.thumbnailUrl} 
                                alt={exercise.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Dumbbell className="h-6 w-6 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <label htmlFor={`ex-${exercise.id}`} className="flex-1 cursor-pointer text-sm">
                              <p className="font-bold text-white break-words leading-tight">{exercise.name}</p>
                              <p className="text-xs text-muted-foreground">{Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups.join(', ') : exercise.muscleGroups} • {exercise.equipment}</p>
                          </label>
                      </div>
                  ))}
                  {filteredExercises.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                      No exercises match your filters.
                    </div>
                  )}
              </div>
          </ScrollArea>
          <DialogFooter>
              <Button variant="outline" onClick={() => setIsExerciseSelectorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExercisesToScheduledWorkout}>
                  Add {selectedExercises.length > 0 ? `${selectedExercises.length} ` : ''}Exercises To Scheduled Workout
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingWorkout} onOpenChange={(open) => !open && setDeletingWorkout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the scheduled workout. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingWorkout(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkout} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={!!duplicatingWorkout} onOpenChange={(open) => !open && setDuplicatingWorkout(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate Workout</DialogTitle>
            <DialogDescription>Select a date to copy this workout to.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
              <CalendarUI
                  mode="single"
                  selected={duplicationDate}
                  onSelect={setDuplicationDate}
                  initialFocus
                  className="rounded-md border shadow w-full md:w-auto"
              />
          </div>
          <DialogFooter>
              <Button variant="outline" onClick={() => setDuplicatingWorkout(null)}>Cancel</Button>
              <Button onClick={handleDuplicateWorkout} disabled={!duplicationDate}>Duplicate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CalendarHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default MyCalendar;
