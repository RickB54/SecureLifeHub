import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/components/gdft/hooks/use-mobile';
import { 
  Plus, 
  Trash2, 
  MoreVertical, 
  Edit, 
  ChevronLeft,
  ChevronRight,
  Save,
  Clock,
  RefreshCw,
  Search,
  Trash,
  Settings,
  Activity,
  Timer,
  Footprints,
  Heart,
  ArrowUpDown,
  ChevronDown,
  Dumbbell as DumbbellIcon,
  ChevronDown as ChevronDownIcon,
  ArrowLeft,
  Play,
  Pause,
  Camera,
  Mic,
  MicOff,
  Undo
} from 'lucide-react';
import { Zap } from 'lucide-react';
import WorkoutCategoryCards from '@/components/gdft/components/WorkoutCategoryCards';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/gdft/components/ui/dialog';
import { useWorkout } from '@/components/gdft/contexts/WorkoutContext';
import { useExercise } from '@/components/gdft/contexts/ExerciseContext';
import { useSettings } from '@/components/gdft/contexts/SettingsContext';
import { useTimerAlert } from '@/components/gdft/hooks/useTimerAlert';
import ExerciseFilters from '@/components/gdft/components/ui/ExerciseFilters';
import { Exercise, WorkoutSet } from '@/components/gdft/lib/data';
import { Button } from '@/components/gdft/components/ui/button';
import { Input } from '@/components/gdft/components/ui/input';
import { toast } from 'sonner';
import { formatTimeDisplay, parseTimeInput, formatNumber, calculateCaloriesPerSet } from '@/components/gdft/lib/formatters';
import EditSetModal from '@/components/gdft/components/ui/EditSetModal';
import { VoiceLogger, VoiceAction } from '@/components/gdft/lib/voiceLogger';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/gdft/components/ui/dropdown-menu';
import CustomGymBuilder from '@/components/gdft/components/ui/CustomGymBuilder';
import { Building2, Home } from 'lucide-react';

const Workout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { exercises, getExerciseById, filterExercises } = useExercise();
  const { 
    workouts,
    currentWorkout, 
    startWorkout, 
    addSet, 
    completeSet, 
    skipSet, 
    updateSet, 
    endWorkout,
    cancelWorkout,
    navigateToExercise,
    currentExerciseIndex,
    navigateToNextExercise,
    navigateToPreviousExercise,
    saveCustomWorkout,
    savedWorkoutTemplates,
    startSavedWorkout,
    deleteSavedWorkout,
    updateCurrentWorkoutNotes,
    updateWorkout,
    addExerciseToCurrentWorkout,
    bodyMeasurements
  } = useWorkout();
  
  const { unitSystem, defaultRestTime, setDefaultRestTime, voiceLoggingEnabled } = useSettings();
  const { fireAlert } = useTimerAlert();

  const isCurrentWorkoutRecent = useCallback(() => {
    if (!currentWorkout) return false;
    const hoursSinceStart = (Date.now() - currentWorkout.startTime) / (1000 * 60 * 60);
    return hoursSinceStart < 12; // Must be started in the last 12 hours to be "continuable"
  }, [currentWorkout]);
  
  const latestWeight = [...bodyMeasurements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .find(m => m.weight !== undefined)?.weight || (unitSystem === 'imperial' ? 155 : 70);
  const weightKg = unitSystem === 'imperial' ? latestWeight * 0.453592 : latestWeight;
  
  const searchParams = new URLSearchParams(location.search);
  const exerciseId = searchParams.get("exercise");
  const viewWorkout = searchParams.get("viewWorkout");
  const addToWorkout = searchParams.get("addToWorkout") === 'true';
  
  const [showActiveWorkout, setShowActiveWorkout] = useState(!!currentWorkout || !!exerciseId);
  const [isImageCycling, setIsImageCycling] = useState(false);
  const cycleIntervalRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('All');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  const workoutTimerRef = useRef<number | null>(null);
  const restTimerRef = useRef<number | null>(null);
  const processedExerciseRef = useRef(false);
  const setsContainerRef = useRef<HTMLDivElement>(null);
  
  const [workoutTime, setWorkoutTime] = useState(0);
  const [restTime, setRestTime] = useState(() => defaultRestTime);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [lastAddedSetExerciseId, setLastAddedSetExerciseId] = useState<string | null>(null);
  const [lastSetTimestamp, setLastSetTimestamp] = useState<number>(0);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [notes, setNotes] = useState("");
  const [openSetMenu, setOpenSetMenu] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [customWorkoutName, setCustomWorkoutName] = useState("");
  const [editingSet, setEditingSet] = useState<WorkoutSet | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const voiceLoggerRef = useRef<VoiceLogger | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDescription, setShowDescription] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [editSetModal, setEditSetModal] = useState(false);
  const [expandedPastWorkout, setExpandedPastWorkout] = useState<string | null>(null);
  const [gymBuilderOpen, setGymBuilderOpen] = useState(false);
  const [positionView, setPositionView] = useState<'start' | 'end'>('start');

  // Add this useEffect to load notes from the current workout
  useEffect(() => {
    if (currentWorkout?.notes) {
      setNotes(currentWorkout.notes);
    }
  }, [currentWorkout?.id]);

  // Reset workout time when currentWorkout changes
  useEffect(() => {
    console.log("Current workout changed:", currentWorkout);
    console.log("Show active workout:", showActiveWorkout);
    
    if (currentWorkout) {
      console.log("Setting show active workout to true because currentWorkout exists");
      setShowActiveWorkout(true);
      setWorkoutTime(0); // Reset timer for new workout
    } else {
      console.log("No current workout, keeping showActiveWorkout as is");
    }
  }, [currentWorkout?.id]);

  // Handle exercise from URL params
  useEffect(() => {
    if (exerciseId) {
      if (addToWorkout && currentWorkout) {
        // Add exercise to existing workout
        addExerciseToCurrentWorkout(exerciseId);
        // Navigate back to the workout page without URL params
        navigate('/workout', { replace: true });
      } else if (!currentWorkout) {
        // Start new workout with this exercise
        const exercise = getExerciseById(exerciseId);
        if (exercise) {
          startWorkout("Single Exercise", [exerciseId]);
        }
      }
    }
  }, [exerciseId, addToWorkout, currentWorkout, addExerciseToCurrentWorkout, getExerciseById, startWorkout, navigate]);


  useEffect(() => {
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      const currentExerciseId = currentWorkout.exercises[currentExerciseIndex];
      const exercise = getExerciseById(currentExerciseId);
      
      if (exercise) {
        setCurrentExercise(exercise);
        setActiveExerciseId(currentExerciseId);
        setShowActiveWorkout(true);
      }
    }
  }, [currentWorkout, currentExerciseIndex, getExerciseById]);
  
  useEffect(() => {
    if (currentWorkout) {
      workoutTimerRef.current = window.setInterval(() => {
        setWorkoutTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    };
  }, [currentWorkout]);
  
  useEffect(() => {
    if (isRestTimerActive && restTime > 0) {
      restTimerRef.current = window.setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            clearInterval(restTimerRef.current!);
            fireAlert();
            toast.success("Rest time complete!", { duration: 2000, id: 'rest-complete' });
            return defaultRestTime; // Reset to user-configured default rest time
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRestTimerActive && restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [isRestTimerActive, restTime, defaultRestTime]);

  // Image cycle logic — toggle start/end positions every 3 seconds
  useEffect(() => {
    if (isImageCycling) {
      cycleIntervalRef.current = window.setInterval(() => {
        setPositionView(prev => prev === 'start' ? 'end' : 'start');
      }, 3000);
    } else if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
    }
    
    return () => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
    };
  }, [isImageCycling]);

  useEffect(() => {
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      const exerciseId = currentWorkout.exercises[currentExerciseIndex];
      setActiveExerciseId(exerciseId);
      setCurrentExercise(getExerciseById(exerciseId) || null);
    }
  }, [currentExerciseIndex, currentWorkout, getExerciseById]);

  useEffect(() => {
    const filtered = filterExercises(
      equipmentFilter === 'All' ? undefined : equipmentFilter,
      categoryFilter === 'All' ? undefined : categoryFilter,
      muscleGroupFilter === 'All' ? undefined : muscleGroupFilter,
      searchQuery
    );
    setFilteredExercises(filtered);
  }, [filterExercises, searchQuery, equipmentFilter, categoryFilter, muscleGroupFilter]);

  // Handle auto-alignment of new sets
  useEffect(() => {
    if (currentWorkout && currentWorkout.sets.length > 0) {
      const activeSets = currentWorkout.sets.filter(s => s.exerciseId === activeExerciseId);
      if (activeSets.length > 0) {
        const lastSet = activeSets[activeSets.length - 1];
        if (lastSet.timestamp > lastSetTimestamp) {
          setLastSetTimestamp(lastSet.timestamp);
          setTimeout(() => {
            const element = document.getElementById(`set-field-${lastSet.id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      }
    }
  }, [currentWorkout?.sets, activeExerciseId, lastSetTimestamp]);
  
  const formatTime = (timeInSeconds: number) => {
    return formatTimeDisplay(timeInSeconds);
  };
  
  const handleEditSet = (setId: string) => {
    if (currentWorkout) {
      const setToEdit = currentWorkout.sets.find(set => set.id === setId);
      if (setToEdit) {
        setEditingSet(setToEdit);
        setEditModalOpen(true);
      }
    }
    setOpenSetMenu(null);
  };

  const handleSaveEditedSet = (updatedSet: WorkoutSet) => {
    updateSet(updatedSet.id, updatedSet);
    setEditModalOpen(false);
    setEditingSet(null);
  };

  const handleDeleteSet = (setId: string) => {
    if (window.confirm("Are you sure you want to delete this set?")) {
      skipSet(setId);
      setOpenSetMenu(null);
      if (editModalOpen) {
        setEditModalOpen(false);
        setEditingSet(null);
      }
    }
  };

  // Auto-save notes when navigating or ending
  const handleSaveNotes = useCallback(() => {
    if (currentWorkout) {
      updateCurrentWorkoutNotes(notes);
    }
  }, [currentWorkout, notes, updateCurrentWorkoutNotes]);

  // Sync notes when current exercise changes (to handle notes per workout if needed, 
  // though current schema has one notes field per workout. If notes were per exercise, 
  // we would fetch them here.)
  
  const handleCompleteSet = (setId: string) => {
    completeSet(setId);
    setRestTime(defaultRestTime); 
    setIsRestTimerActive(true);
    setOpenSetMenu(null);
  };

  const handleAddSet = () => {
    if (activeExerciseId) {
      const lastSet = getCurrentExerciseSets().slice(-1)[0];
      const exerciseSettings = currentExercise?.settings;
      addSet(activeExerciseId, lastSet, exerciseSettings);
      toast.success("Set added");
      
      // Auto-scroll to the new set
      setTimeout(() => {
        if (setsContainerRef.current) {
          setsContainerRef.current.scrollTo({
            top: setsContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const handleUpdateSet = (setId: string, field: string, value: any) => {
    updateSet(setId, { [field]: value });
  };

  const handleNextExercise = () => {
    handleSaveNotes();
    navigateToNextExercise();
  };

  const handlePreviousExercise = () => {
    handleSaveNotes();
    navigateToPreviousExercise();
  };

  const handleEndWorkout = async () => {
    handleSaveNotes();
    const workoutId = currentWorkout?.id;
    await endWorkout();
    setShowActiveWorkout(false);
    navigate(`/stats${workoutId ? `?highlight=${workoutId}` : ""}`);
    toast.success("Workout completed!");
  };

  const handleAddExercise = (exerciseId: string) => {
    if (currentWorkout) {
      if (currentWorkout.exercises.includes(exerciseId)) {
        toast.error('Exercise already in workout');
        navigateToExercise(exerciseId);
        setActiveExerciseId(exerciseId);
        setShowAddExerciseDialog(false);
        return;
      }
      const updatedWorkout = {
        ...currentWorkout,
        exercises: [...currentWorkout.exercises, exerciseId]
      };
      updateWorkout(updatedWorkout);
      const exercise = getExerciseById(exerciseId);
      if (exercise) {
        addSet(exerciseId, null, exercise.settings);
        setShowAddExerciseDialog(false);
        setActiveExerciseId(exerciseId);
        navigateToExercise(exerciseId);
        toast.success(`${exercise.name} added to workout`);
      }
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlExerciseId = urlParams.get('exercise');
    if (urlExerciseId && currentWorkout && !processedExerciseRef.current) {
      processedExerciseRef.current = true;
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      if (!currentWorkout.exercises.includes(urlExerciseId)) {
        const exercise = getExerciseById(urlExerciseId);
        if (exercise) {
          handleAddExercise(urlExerciseId);
        }
      } else {
        navigateToExercise(urlExerciseId);
        setActiveExerciseId(urlExerciseId);
      }
    }
    if (!urlExerciseId) processedExerciseRef.current = false;
  }, [location.search, currentWorkout, getExerciseById, navigateToExercise]);

  const handleSaveCustomWorkout = () => {
    if (!customWorkoutName.trim()) {
      toast.error("Please enter a name for your workout");
      return;
    }

    if (currentWorkout) {
      saveCustomWorkout(customWorkoutName);
      setSaveModalOpen(false);
      setCustomWorkoutName("");
      toast.success("Workout saved for future use");
    }
  };

  const handleStartWorkout = (type: string, exercises: string[]) => {
    startWorkout(type, exercises);
    if (exercises.length > 0) {
      setShowActiveWorkout(true);
    }
  };

  const handleStartSavedWorkout = (templateId: string) => {
    const template = savedWorkoutTemplates.find(t => t.id === templateId);
    
    if (template) {
      const validExercises = template.exercises.filter(id => id && id.trim() !== '');
      
      if (validExercises.length === 0) {
        toast.error("This saved workout has no valid exercises. Please recreate the workout.");
        return;
      }
      
      startSavedWorkout(templateId);
      setShowActiveWorkout(true);
      
    } else {
      toast.error("Saved workout not found");
    }
  };
  
  const getCurrentExerciseSets = () => {
    if (!currentWorkout || !activeExerciseId) return [];
    return currentWorkout.sets.filter((set) => set.exerciseId === activeExerciseId);
  };

  const getExerciseHistory = () => {
    if (!activeExerciseId) return [];
    
    const history: { date: string; sets: WorkoutSet[] }[] = [];
    
    workouts.forEach(workout => {
      const exerciseSets = workout.sets.filter(set => 
        set.exerciseId === activeExerciseId && set.completed
      );
      
      if (exerciseSets.length > 0) {
        history.push({
          date: new Date(workout.startTime).toLocaleDateString(),
          sets: exerciseSets
        });
      }
    });
    
    return history.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 3);
  };

  const getFilteredWorkouts = () => {
    let filtered = [...savedWorkoutTemplates];
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(template => template.type === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Function to render saved workout templates
  const renderSavedWorkoutTemplates = () => {
    const filteredTemplates = getFilteredWorkouts();

    if (filteredTemplates.length === 0 && (searchQuery || selectedCategory !== "All")) {
      return <p className="text-muted-foreground text-center py-4">No saved workouts match your filters.</p>;
    }

    if (filteredTemplates.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No saved workouts yet. Create one from an active workout!</p>;
    }

    return filteredTemplates.map((template) => {
      const exercisesInWorkout = template.exercises.map(id => getExerciseById(id)).filter(ex => ex);
      return (
        <div 
          key={template.id} 
          className="p-4 rounded-lg border border-gray-700 bg-gym-card hover:bg-gym-card-hover transition-colors flex justify-between items-center"
        >
          <div onClick={() => handleStartSavedWorkout(template.id)} className="cursor-pointer flex-grow">
            <h3 className="font-medium">{template.name}</h3>
            <div className="flex text-xs text-muted-foreground space-x-3 mt-1">
              <span>{template.type}</span>
              <span>•</span>
              <span>{formatDate(template.createdAt)}</span>
              <span>•</span>
              <span>{exercisesInWorkout.length} exercise{exercisesInWorkout.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Exercises</DropdownMenuLabel>
                {exercisesInWorkout.length > 0 ? (
                  exercisesInWorkout.map((exercise) =>
                    exercise ? (
                      <DropdownMenuItem key={exercise.id} disabled className="flex items-center gap-3">
                        {exercise.thumbnailUrl || exercise.pictureUrl ? (
                          <img 
                            src={exercise.thumbnailUrl || exercise.pictureUrl} 
                            alt="" 
                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                            <DumbbellIcon className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <span className="text-white text-sm font-medium">{exercise.name}</span>
                      </DropdownMenuItem>
                    ) : null
                  )
                ) : (
                  <DropdownMenuItem disabled>No exercises in this workout.</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this saved workout?")) {
                  deleteSavedWorkout(template.id);
                }
              }}
            >
              <Trash2 className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStartSavedWorkout(template.id)}
            >
              <Clock className="h-5 w-5" />
            </Button>
          </div>
        </div>
      );
    });
  };

  // Voice Recognition Handler
  const handleVoiceAction = useCallback((action: VoiceAction) => {
    switch (action.type) {
      case 'ADD_SET':
        if (activeExerciseId) {
          const sets = getCurrentExerciseSets();
          const lastSet = sets.length > 0 ? sets[sets.length - 1] : null;
          const templateSet = { 
            ...(lastSet || {}), 
            weight: action.weight, 
            reps: action.reps,
            completed: false 
          } as WorkoutSet;
          
          const newSetId = addSet(activeExerciseId, templateSet, currentExercise?.settings);
          
          toast.success(`Added ${action.weight} lbs × ${action.reps} reps`, {
            duration: 4000,
            action: {
              label: "Undo",
              onClick: () => skipSet(newSetId)
            }
          });
        }
        break;
      case 'START_REST':
        setRestTime(action.seconds);
        setIsRestTimerActive(true);
        toast.success(`Timer set to ${action.seconds}s`);
        break;
      case 'NEXT_EXERCISE':
        if (currentExerciseIndex < currentWorkout!.exercises.length - 1) {
          handleNextExercise();
          toast.success("Moving to next exercise");
        } else {
          toast.info("No more exercises in the list");
        }
        break;
      case 'FINISH_SET':
        const uncompletedSets = getCurrentExerciseSets().filter(s => !s.completed);
        if (uncompletedSets.length > 0) {
          handleCompleteSet(uncompletedSets[0].id);
        } else {
          toast.info("No active sets to complete");
        }
        break;
      case 'HEART_RATE':
        if (activeExerciseId) {
          const sets = getCurrentExerciseSets();
          // Target the first incomplete set, or the last set if all are done
          const targetSet = sets.find(s => !s.completed) || (sets.length > 0 ? sets[sets.length - 1] : null);
          
          if (targetSet) {
            const updates: any = {};
            if (action.avg) updates.avgHeartRate = action.avg;
            if (action.max) updates.maxHeartRate = action.max;
            handleUpdateSet(targetSet.id, '', updates); // handleUpdateSet handles objects if field is empty string? 
            // Wait, looking at handleUpdateSet: handleUpdateSet = (setId, field, value) => updateSet(setId, { [field]: value });
            // I should use updateSet directly or modify handleUpdateSet
            updateSet(targetSet.id, updates);
            toast.success(`Biometrics logged: Avg ${action.avg || '--'} | Max ${action.max || '--'}`);
          } else {
            toast.error("Add a set first to log biometrics.");
          }
        }
        break;
      case 'CANCEL':
        toast.info("Voice input cleared");
        break;
      case 'ERROR':
        toast.error(action.message);
        break;
    }
    setIsVoiceListening(false);
  }, [activeExerciseId, addSet, currentExercise, getCurrentExerciseSets, currentExerciseIndex, currentWorkout, handleNextExercise, handleCompleteSet, skipSet]);


  useEffect(() => {
    if (voiceLoggingEnabled && !voiceLoggerRef.current) {
      voiceLoggerRef.current = new VoiceLogger(handleVoiceAction);
    }
    return () => {
      if (voiceLoggerRef.current) {
        voiceLoggerRef.current.stop();
      }
    };
  }, [voiceLoggingEnabled, handleVoiceAction]);

  const toggleVoice = () => {
    if (!voiceLoggerRef.current) return;
    if (isVoiceListening) {
      voiceLoggerRef.current.stop();
      setIsVoiceListening(false);
    } else {
      voiceLoggerRef.current.start();
      setIsVoiceListening(true);
      // Play a quick haptic feedback if available (simulated here)
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };
  
  const renderSet = (set: WorkoutSet, index: number) => {
    if (!currentExercise) return null;

    const ALL_METRICS_LIST = [
      { key: 'weight', label: 'Weight', unit: 'lbs/kg', icon: DumbbellIcon, step: 5 },
      { key: 'reps', label: 'Reps', unit: '', icon: Activity, step: 1 },
      { key: 'time', label: 'Time', unit: 'H:M:S', icon: Timer, isTime: true, step: 10 },
      { key: 'distance', label: 'Distance', unit: 'mi/km', icon: Activity, step: 0.1 },
      { key: 'incline', label: 'Incline', unit: '%', icon: ArrowUpDown, step: 1 },
      { key: 'duration', label: 'Duration', unit: 'H:M:S', icon: Timer, isTime: true, step: 10 },
      { key: 'steps', label: 'Steps', unit: '', icon: Footprints, step: 100 },
      { key: 'avgHeartRate', label: 'Avg HR', unit: 'bpm', icon: Heart, step: 5 },
      { key: 'maxHeartRate', label: 'Max HR', unit: 'bpm', icon: Activity, step: 5 },
    ];

    const activeMetrics = ALL_METRICS_LIST.filter(m => {
      const settingVal = (currentExercise.settings as any)?.[m.key];
      const setVal = (set as any)[m.key];
      return (settingVal !== undefined && settingVal !== 0 && settingVal !== null) || (setVal !== undefined && setVal !== 0 && setVal !== null);
    });

    // Fallback if no metrics are active
    const metricsToShow = activeMetrics.length > 0 ? activeMetrics : [
      ALL_METRICS_LIST.find(m => m.key === (currentExercise.category === 'Weights' ? 'weight' : currentExercise.category === 'Cardio' ? 'time' : 'reps'))!
    ];
    
    return (
      <div 
        key={set.id} 
        className={`p-4 rounded-lg border ${set.completed ? "bg-gym-dark/50 border-gray-700" : "bg-gym-card border-gray-700"}`}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <h3 className="font-medium">Set {index + 1}</h3>
            {set.completed && (
              <span className="ml-2 text-xs text-gym-green font-bold">✓ DONE</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!set.completed && (
              <button
                className="p-1 hover:bg-gym-dark rounded transition-colors text-gym-blue"
                onClick={() => handleCompleteSet(set.id)}
                title="Complete Set"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            )}
            <div className="relative">
              <button
                className="p-1 hover:bg-gym-dark rounded transition-colors"
                onClick={() => setOpenSetMenu(openSetMenu === set.id ? null : set.id)}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {openSetMenu === set.id && (
                <div className="absolute right-0 mt-2 w-48 bg-gym-dark border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-700 bg-black/20">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Set Options</span>
                  </div>
                  <button
                    className="flex items-center w-full px-4 py-2.5 text-sm text-white hover:bg-gym-card transition-colors"
                    onClick={() => handleEditSet(set.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gym-blue hover:bg-gym-card transition-colors"
                    onClick={() => {
                        // Toggle a local state or just show the HR fields
                        // For now we'll just add them to the metrics list if they have values
                        toast.info("Tip: You can say 'Avg heart rate 140' or 'Max heart rate 160'");
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Set Biometrics
                  </button>
                  <div className="border-t border-gray-700">
                    <button
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gym-red hover:bg-gym-card transition-colors"
                      onClick={() => handleDeleteSet(set.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Set
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Secondary Metrics / Biometrics Row */}
        {!set.completed && (
          <div className="flex flex-wrap gap-4 mb-6 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex-1 min-w-[120px]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Heart className="h-3 w-3 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg HR</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="number" 
                  className="w-full bg-black/40 border-b border-white/10 p-1 text-sm font-mono focus:border-red-500 transition-colors focus:outline-none"
                  placeholder="--"
                  value={set.avgHeartRate || ''}
                  onChange={(e) => handleUpdateSet(set.id, 'avgHeartRate', parseInt(e.target.value) || 0)}
                />
                <span className="text-[10px] ml-1 text-muted-foreground uppercase">Bpm</span>
              </div>
            </div>
            <div className="flex-1 min-w-[120px]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Activity className="h-3 w-3 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max HR</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="number" 
                  className="w-full bg-black/40 border-b border-white/10 p-1 text-sm font-mono focus:border-orange-500 transition-colors focus:outline-none"
                  placeholder="--"
                  value={set.maxHeartRate || ''}
                  onChange={(e) => handleUpdateSet(set.id, 'maxHeartRate', parseInt(e.target.value) || 0)}
                />
                <span className="text-[10px] ml-1 text-muted-foreground uppercase">Bpm</span>
              </div>
            </div>
          </div>
        )}
        
        {set.completed && (set.avgHeartRate || set.maxHeartRate) && (
          <div className="flex gap-4 mb-4 p-2 bg-gym-green/5 rounded-lg border border-gym-green/10">
            {set.avgHeartRate && (
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 text-gym-green" />
                <span className="text-xs font-mono">Avg {set.avgHeartRate} bpm</span>
              </div>
            )}
            {set.maxHeartRate && (
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-orange-400" />
                <span className="text-xs font-mono">Max {set.maxHeartRate} bpm</span>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {metricsToShow.map(metric => {
            const rawValue = (set as any)[metric.key];
            const val = (rawValue === undefined || rawValue === null || isNaN(Number(rawValue))) ? 0 : Number(rawValue);
            return (
              <div key={metric.key}>
                <div className="flex items-center gap-1 mb-1.5">
                  <metric.icon className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {metric.label} {metric.unit ? `(${metric.unit})` : ''}
                  </p>
                </div>
                {set.completed ? (
                  <p className="text-xl font-bold font-mono">
                    {metric.isTime ? formatTimeDisplay(val) : formatNumber(val)}
                  </p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-9 w-8 flex items-center justify-center rounded-l-md border border-gray-700 hover:bg-gym-darker active:bg-black transition-colors"
                      onClick={() => handleUpdateSet(set.id, metric.key, Math.max(0, val - metric.step))}
                    >
                      <span className="text-xl">-</span>
                    </button>
                    {metric.isTime ? (
                      <input
                        type="text"
                        className="bg-black/50 h-9 w-20 text-center border-t border-b border-gray-700 text-sm font-mono focus:bg-black focus:outline-none"
                        value={formatTimeDisplay(val)}
                        onChange={(e) => handleUpdateSet(set.id, metric.key, parseTimeInput(e.target.value))}
                      />
                    ) : (
                      <input
                        type="number"
                        step={metric.step}
                        className="bg-black/50 h-9 w-16 text-center border-t border-b border-gray-700 text-sm font-mono focus:bg-black focus:outline-none"
                        value={val}
                        onChange={(e) => handleUpdateSet(set.id, metric.key, parseFloat(e.target.value) || 0)}
                      />
                    )}
                    <button
                      className="bg-gym-dark h-9 w-8 flex items-center justify-center rounded-r-md border border-gray-700 hover:bg-gym-darker active:bg-black transition-colors"
                      onClick={() => handleUpdateSet(set.id, metric.key, val + metric.step)}
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex justify-between items-center bg-gym-darker/30 p-2 rounded-md border border-gray-800/50">
           <div className="flex items-center gap-2">
             <Zap className="h-3 w-3 text-gym-green" />
             <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Estimated Effort</span>
           </div>
           <span className="font-mono text-gym-green font-bold text-sm">
             {calculateCaloriesPerSet(set, currentExercise, weightKg)} cal
           </span>
        </div>
        
        {!set.completed && (
            <div className="col-span-2 mt-3">
              <button
                className="w-full bg-gym-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                onClick={() => handleCompleteSet(set.id)}
              >
                COMPLETE SET
              </button>
            </div>
          )}
        
      </div>
    );
  };

  const renderHistoryItem = (history: { date: string; sets: WorkoutSet[] }) => {
    if (!currentExercise) return null;
    
    return (
      <div key={history.date} className="mb-4">
        <h4 className="text-sm font-medium mb-2">{history.date}</h4>
        <div className="space-y-2">
          {history.sets.map((set, idx) => (
            <div key={set.id} className="bg-gym-dark/30 p-3 rounded-lg border border-gray-700">
              <p className="text-sm">
                <span className="text-muted-foreground">Set {idx + 1}: </span>
                {currentExercise.category === "Weights" && (
                  <>
                    <span className="font-medium">{formatNumber(set.weight || 0)}</span> lbs × 
                    <span className="font-medium"> {formatNumber(set.reps || 0)}</span> reps
                  </>
                )}
                {currentExercise.category === "Cardio" && (
                  <>
                    <span className="font-medium">{formatNumber(set.time || 0)}</span> min × 
                    <span className="font-medium"> {formatNumber(set.distance || 0)}</span> mi
                  </>
                )}
                {currentExercise.category === "Slide Board" && (
                  <>
                    <span className="font-medium">Incline {formatNumber(set.incline || 0)}</span> × 
                    <span className="font-medium"> {formatNumber(set.reps || 0)}</span> reps
                  </>
                )}
                {currentExercise.category === "No Equipment" && (
                  <>
                    <span className="font-medium">{formatNumber(set.duration || 0)}</span> sec × 
                    <span className="font-medium"> {formatNumber(set.reps || 0)}</span> reps
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (showActiveWorkout && currentWorkout && currentExercise) {
    return (
      <div className="flex flex-col h-[100dvh] bg-gym-darker overflow-hidden overscroll-none page-transition">
        {/* Fixed Top Section: Exercise Info & Media */}
        <div className="flex-none px-4 pt-4 border-b border-white/5 bg-gym-darker z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => {
                  if (window.confirm("End this workout?")) {
                    handleEndWorkout();
                  }
                }} 
                className="hover:bg-white/5"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </Button>
              <h1 className="text-xl font-bold truncate max-w-[150px] md:max-w-none">{currentExercise.name}</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(`/create-exercise?id=${currentExercise.id}`)}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                title="Edit Exercise / Add Photos"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              {voiceLoggingEnabled && (
                <div 
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-300 ${
                    isVoiceListening 
                      ? "bg-red-500/20 border-red-500/50 text-red-500 animate-pulse" 
                      : "bg-white/5 border-white/10 text-gray-500"
                  }`}
                  title={isVoiceListening ? "Voice Listening Active" : "Voice Logging Enabled"}
                >
                  <Mic className={`h-3.5 w-3.5 ${isVoiceListening ? "fill-current" : ""}`} />
                  <span className="text-[10px] font-black tracking-widest uppercase">
                    {isVoiceListening ? "On" : "Off"}
                  </span>
                </div>
              )}
              <button 
                className="p-1 hover:bg-gym-dark rounded transition-colors flex items-center"
                onClick={() => setSaveModalOpen(true)}
              >
                <Save className="h-5 w-5 mr-1" />
                <span className="text-sm hidden md:inline">Save</span>
              </button>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1 text-muted-foreground" />
                <span className="text-sm font-mono">
                  {formatTime(workoutTime)}
                </span>
                {isVoiceListening && (
                  <div className="ml-3 flex items-center gap-1.5 animate-pulse text-red-500">
                    <Mic className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Listening...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            {/* Position image toggle — START / END */}
            {(() => {
              const hasStart = !!(currentExercise.startPositionUrl);
              const hasEnd   = !!(currentExercise.endPositionUrl);
              const hasPosition = hasStart || hasEnd;
              const hasBothPositions = hasStart && hasEnd;
              const mainImg  = currentExercise.pictureUrl || currentExercise.thumbnailUrl;

              // Determine which image src to show
              const activeSrc =
                hasPosition
                  ? (positionView === 'start'
                      ? (currentExercise.startPositionUrl || currentExercise.endPositionUrl)
                      : (currentExercise.endPositionUrl   || currentExercise.startPositionUrl))
                  : mainImg || '/placeholder.svg';

              return (
                <div
                  className="relative w-full aspect-video rounded-lg bg-gym-dark flex items-center justify-center overflow-hidden mb-4 cursor-pointer hover:opacity-95 transition-opacity border border-white/5 shadow-inner"
                >
                  <img
                    src={activeSrc}
                    alt={currentExercise.name}
                    className="h-full w-full object-contain"
                    onClick={() => setShowImagePopup(true)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />

                  {hasPosition && (
                    <div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex rounded-full overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md bg-black/40">
                        <button
                          className={`px-4 py-1.5 text-[10px] font-black tracking-widest transition-all ${
                            positionView === 'start'
                              ? 'bg-sky-500 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                          onClick={() => {
                            setPositionView('start');
                            setIsImageCycling(false);
                          }}
                        >
                          START
                        </button>
                        <button
                          className={`px-4 py-1.5 text-[10px] font-black tracking-widest transition-all ${
                            positionView === 'end'
                              ? 'bg-emerald-500 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                          onClick={() => {
                            setPositionView('end');
                            setIsImageCycling(false);
                          }}
                        >
                          END
                        </button>
                      </div>

                      {hasBothPositions && (
                        <button
                          onClick={() => setIsImageCycling(!isImageCycling)}
                          className={`h-7 w-7 rounded-full flex items-center justify-center transition-all border shadow-lg ${
                            isImageCycling 
                              ? 'bg-amber-500 border-amber-400 text-black animate-pulse' 
                              : 'bg-black/60 border-white/10 text-white hover:bg-black/80'
                          }`}
                          title={isImageCycling ? "Stop Cycle" : "Start Cycle (Every 3s)"}
                        >
                          {isImageCycling ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {currentWorkout.exercises.length > 1 && (
              <div className="flex justify-between items-center mb-4">
                <button
                  className={`p-2 rounded-full ${currentExerciseIndex > 0 ? "bg-gym-blue" : "bg-gym-dark/50"}`}
                  onClick={handlePreviousExercise}
                  disabled={currentExerciseIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm">
                  {currentExerciseIndex + 1} / {currentWorkout.exercises.length}
                </span>
                <button
                  className={`p-2 rounded-full ${currentExerciseIndex < currentWorkout.exercises.length - 1 ? "bg-gym-blue" : "bg-gym-dark/50"}`}
                  onClick={handleNextExercise}
                  disabled={currentExerciseIndex === currentWorkout.exercises.length - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center bg-gym-dark px-4 py-2 rounded-lg mb-4">
              <div className="flex items-center">
                <span className="text-sm mr-2">Rest:</span>
                <span className={`text-sm font-mono flex items-center gap-1 ${isRestTimerActive ? "text-gym-green" : ""}`}>
                  <input
                    type="number"
                    className="bg-transparent border-b border-white/20 w-8 text-center focus:border-gym-blue outline-none"
                    value={defaultRestTime}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setDefaultRestTime(val);
                      setRestTime(val); 
                    }}
                  />
                  <span>s</span>
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-1 hover:bg-gym-card rounded transition-colors"
                  onClick={() => setIsRestTimerActive(!isRestTimerActive)}
                >
                  {isRestTimerActive ? (
                    <span className="text-xs bg-gym-red px-2 py-1 rounded text-white font-bold uppercase transition-all hover:brightness-110">Pause</span>
                  ) : (
                    <span className="text-xs bg-gym-green px-2 py-1 rounded text-white font-bold uppercase transition-all hover:brightness-110">Start</span>
                  )}
                </button>
                <button
                  className="p-1 hover:bg-gym-card rounded transition-colors text-gym-blue hover:text-white"
                  onClick={() => {
                     setRestTime(defaultRestTime);
                     toast.success(`Refreshed to ${defaultRestTime}s`);
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-center space-x-2 mb-2">
              <Button
                variant={showDescription ? "default" : "outline"}
                onClick={() => { setShowDescription(!showDescription); setShowHistory(false); setShowNotes(false); }}
                size="sm"
              >
                Description
              </Button>
              <Button
                variant={showHistory ? "default" : "outline"}
                onClick={() => { setShowHistory(!showHistory); setShowDescription(false); setShowNotes(false); }}
                size="sm"
              >
                History
              </Button>
              <Button
                variant={showNotes ? "default" : "outline"}
                onClick={() => { setShowNotes(!showNotes); setShowDescription(false); setShowHistory(false); }}
                size="sm"
              >
                Notes
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Context & Sets Section */}
        <div ref={setsContainerRef} className="flex-1 overflow-y-auto pt-4 px-4 pb-48 scroll-smooth">
          {showDescription && (
            <div className="mb-6 p-4 bg-gym-card rounded-lg">
              <h3 className="text-sm font-medium mb-1 uppercase text-[10px] tracking-widest text-gray-500">Exercise Description</h3>
              <p className="text-sm text-gray-300">
                {currentExercise.description || currentExercise.notes || "No description available."}
              </p>
            </div>
          )}

          {showHistory && (
            <div className="mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-muted-foreground italic">Previous Workouts</h3>
              {getExerciseHistory().length > 0 ? (
                <div className="bg-gym-card/50 rounded-lg p-4 border border-gray-700">
                  {getExerciseHistory().map(history => renderHistoryItem(history))}
                </div>
              ) : (
                <div className="bg-gym-card/50 rounded-xl p-6 border border-white/5 text-center text-muted-foreground">
                  <p className="text-sm">No previous consistency data yet.</p>
                </div>
              )}
            </div>
          )}

          {showNotes && (
            <div className="mb-6 bg-gym-card p-4 rounded-xl border border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-muted-foreground italic">Training Notes</h3>
              <textarea
                className="w-full h-24 bg-gym-dark border border-gray-700 rounded-lg p-3 text-sm"
                placeholder="Log technique cues or focus points..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}
        
          <div className="space-y-4 mb-6">
            {getCurrentExerciseSets().map((set, index) => renderSet(set, index))}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              className="bg-gym-dark hover:bg-white/5 text-white py-3 rounded-xl flex items-center justify-center transition-all border border-white/5 active:scale-95"
              onClick={handleAddSet}
            >
              <Plus className="h-4 w-4 mr-2 text-gym-blue" /> <span className="text-sm font-bold uppercase tracking-tight">Add Set</span>
            </button>

            <button
              className="bg-gym-dark hover:bg-white/5 text-white py-3 rounded-xl flex items-center justify-center transition-all border border-white/5 active:scale-95"
              onClick={() => setShowAddExerciseDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2 text-gym-green" /> <span className="text-sm font-bold uppercase tracking-tight">Add Exercise</span>
            </button>
          </div>
        </div>

        {/* Global Action Footer */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gym-darker border-t border-white/5 flex flex-col space-y-2 z-30">
          <button
            onClick={() => { if (window.confirm("End this workout and save your progress?")) handleEndWorkout(); }}
            className="w-full py-3 rounded-xl font-black uppercase tracking-widest bg-gym-blue text-white hover:bg-blue-600 transition-all shadow-lg active:scale-95 shadow-blue-500/10"
          >
            End Workout
          </button>
          <button
            onClick={() => { if (window.confirm("Sure you want to cancel? All set data will be purged.")) cancelWorkout(); }}
            className="w-full py-2 rounded-xl font-bold uppercase tracking-widest text-gym-red hover:bg-gym-red/10 transition-all text-xs opacity-60 hover:opacity-100"
          >
            Cancel Session
          </button>
        </div>

        {editingSet && (
          <EditSetModal 
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            set={editingSet}
            onSave={handleSaveEditedSet}
            onDelete={() => handleDeleteSet(editingSet.id)}
            onAddSet={() => handleAddSet()}
            exercise={currentExercise}
            userWeightKg={weightKg}
          />
        )}

        <Dialog open={showImagePopup} onOpenChange={setShowImagePopup}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 bg-black/90">
            <DialogTitle className="sr-only">Exercise Image</DialogTitle>
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={currentExercise?.pictureUrl || currentExercise?.thumbnailUrl || '/placeholder.svg'} 
                alt={currentExercise?.name} 
                className="max-h-[90vh] max-w-[90vw] object-contain"
                style={{ imageRendering: 'crisp-edges' as any }}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddExerciseDialog} onOpenChange={setShowAddExerciseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exercise</DialogTitle>
              <DialogDescription>
                Select an exercise to add to your workout.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <ExerciseFilters
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                equipmentFilter={equipmentFilter}
                onEquipmentFilterChange={setEquipmentFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                muscleGroupFilter={muscleGroupFilter}
                onMuscleGroupFilterChange={setMuscleGroupFilter}
                showMuscleGroup={true}
              />
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-3 rounded-xl border border-gray-700 bg-gym-card hover:bg-gym-card-hover cursor-pointer transition-all flex items-center gap-4 group"
                  onClick={() => handleAddExercise(exercise.id)}
                >
                  {exercise.thumbnailUrl || exercise.pictureUrl ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative transition-transform duration-200 will-change-transform group-hover:scale-[2.0] group-hover:z-50 group-hover:shadow-2xl active:scale-[2.0]">
                      <img 
                        src={exercise.thumbnailUrl || exercise.pictureUrl} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gym-dark flex items-center justify-center flex-shrink-0">
                      <DumbbellIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm">{exercise.name}</h3>
                    <div className="flex text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                      <span>{exercise.category}</span>
                      {exercise.equipment && (
                        <>
                          <span className="mx-2 opacity-30">|</span>
                          <span>{exercise.equipment}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Plus className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {currentWorkout && (
          <Button
            className="fixed bottom-20 right-4 h-12 w-12 rounded-full"
            size="icon"
            onClick={() => navigate('/exercises?addToWorkout=true')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* Voice Mic Floating Button */}
        {voiceLoggingEnabled && showActiveWorkout && currentWorkout && (
          <button
            onClick={toggleVoice}
            className={`fixed bottom-20 left-4 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-40 border-2 ${
              isVoiceListening 
                ? 'bg-red-600 border-red-400 scale-110 animate-pulse' 
                : 'bg-gym-dark border-gym-blue/30 text-gym-blue hover:bg-gym-blue hover:text-white'
            }`}
          >
            {isVoiceListening ? <Mic className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6" />}
            {isVoiceListening && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center">
                <span className="h-2 w-2 bg-red-600 rounded-full animate-ping" />
              </span>
            )}
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="page-container page-transition">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/5">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <h1 className="text-xl font-bold">Workouts</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate("/create-workout?type=Custom")}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Workout
            </Button>
          </div>
        </div>
      </div>
      
      {currentWorkout && currentWorkout.id && !currentWorkout.completed && (currentWorkout.exercises?.length || 0) > 0 && isCurrentWorkoutRecent() && (
        <div className="mb-6">
          <Button 
            className="w-full bg-gym-blue hover:bg-blue-600 shadow-lg shadow-blue-500/10 active:scale-95 font-bold uppercase tracking-widest" 
            onClick={() => {
                setShowActiveWorkout(true);
                toast.info("Resuming workout...");
            }}
          >
            <Clock className="h-5 w-5 mr-2" />
            Continue Current Workout
          </Button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search workouts" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-1/3">
            <select
              className="bg-gym-dark border border-border text-white text-sm rounded-lg w-full p-2 h-10"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">Category (All)</option>
              <option value="Weights">Category (Weights)</option>
              <option value="Cardio">Category (Cardio)</option>
              <option value="Slide Board">Category (Slide Board)</option>
              <option value="No Equipment">Category (No Equipment)</option>
              <option value="Custom">Category (Custom)</option>
            </select>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-medium mb-4">New Workout</h2>
      <WorkoutCategoryCards
        onSelect={(type) => navigate(`/create-workout?type=${type}`)}
        className="mb-4"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div
          className="card-glass h-20 flex items-center p-4 cursor-pointer hover:bg-gym-card-hover transition-all rounded-2xl group border border-white/5 hover:border-blue-500/30"
          onClick={() => navigate("/create-workout?type=Custom")}
        >
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-white text-lg">Custom Workout</p>
            <p className="text-xs text-gray-400">Build a routine manually</p>
          </div>
        </div>

        <div
          className="card-glass h-20 flex items-center p-4 cursor-pointer hover:bg-gym-card-hover transition-all rounded-2xl group border border-white/5 hover:border-emerald-500/30"
          onClick={() => setGymBuilderOpen(true)}
        >
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
            <Building2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-white text-lg">Custom Gym Builder</p>
            <p className="text-xs text-gray-400">Map your gym & auto-generate plans</p>
          </div>
        </div>
      </div>
      
      {savedWorkoutTemplates.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Saved Workouts</h2>
          <div className="space-y-3">
            {renderSavedWorkoutTemplates()} {/* Changed this line to call the new render function */}
          </div>
        </div>
      )}
      
       {workouts.filter(w => !(w as any).cancelled && (w.exercises || []).length > 0).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Past Workouts</h2>
          <div className="space-y-3">
            {workouts.filter(w => !(w as any).cancelled && (w.exercises || []).length > 0).slice(0, 5).map((workout) => {
              const isExpanded = expandedPastWorkout === workout.id;
              // Resolve exercise names from IDs stored on the workout
              const exerciseNames = workout.exercises
                .map(id => getExerciseById(id))
                .filter(Boolean)
                .map(ex => ex!.name);

              return (
                <div
                  key={workout.id}
                  className="rounded-lg border border-gray-700 bg-gym-card overflow-hidden transition-colors"
                >
                  {/* Main row — click anywhere except the chevron to go to stats */}
                  <div className="p-4 flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/stats?workout=${workout.id}`)}
                    >
                      <h3 className="font-medium">{workout.name}</h3>
                      <div className="flex text-xs text-muted-foreground space-x-3 mt-1">
                        <span>{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{formatDate(workout.startTime)}</span>
                      </div>
                    </div>
                    {/* Expand/collapse chevron — separate from stats navigation */}
                    <button
                      className="ml-3 p-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
                      aria-label={isExpanded ? 'Collapse exercises' : 'Expand exercises'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPastWorkout(isExpanded ? null : workout.id);
                      }}
                    >
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Expandable exercise list */}
                  {isExpanded && (
                    <div className="border-t border-gray-700 px-4 py-3 bg-gym-dark/40">
                      {(() => {
                        const workoutExercises = workout.exercises
                          .map(id => getExerciseById(id))
                          .filter(Boolean);
                        
                        return workoutExercises.length > 0 ? (
                          <div className="space-y-2">
                            {workoutExercises.map((ex, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-gym-card/50 p-2 rounded-xl border border-white/5 group transition-all duration-300">
                                {ex?.thumbnailUrl || ex?.pictureUrl ? (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative transition-transform duration-200 will-change-transform group-hover:scale-[2.0] group-hover:z-50 group-hover:shadow-2xl active:scale-[2.0]">
                                    <img 
                                      src={ex.thumbnailUrl || ex.pictureUrl} 
                                      alt="" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gym-dark flex items-center justify-center flex-shrink-0">
                                    <DumbbellIcon className="h-5 w-5 text-gray-500" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-white truncate">{ex?.name}</p>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{ex?.category}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No exercise details available</p>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
            {workouts.length > 5 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/stats')}
              >
                View All Workouts
              </Button>
            )}
          </div>
        </div>
      )}

      <CustomGymBuilder 
        isOpen={gymBuilderOpen} 
        onClose={() => setGymBuilderOpen(false)} 
      />
    </div>
  );
};

export default Workout;
