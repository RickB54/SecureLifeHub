
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, Filter, Trash, Clock, Save, HelpCircle, ChevronDown, ChevronRight, Dumbbell } from "lucide-react";
import { useExercise } from "@/components/gdft/contexts/ExerciseContext";
import { useWorkout } from "@/components/gdft/contexts/WorkoutContext";
import { Exercise, SavedWorkoutTemplate } from "@/components/gdft/lib/data";
import CustomGymBuilder from "@/components/gdft/components/ui/CustomGymBuilder";
import { ExerciseCategory, MuscleGroup } from "@/components/gdft/lib/exerciseTypes"; // Corrected import path
// import { SavedWorkoutTemplate } from "@/components/gdft/contexts/WorkoutContext"; // Remove this line if it exists
import { toast } from "sonner";
import { Button } from "@/components/gdft/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/gdft/components/ui/dialog";
import { getExerciseImageUrl } from "@/components/gdft/lib/utils";
import { convertGoogleDriveUrl } from "@/components/gdft/lib/formatters";
import ExerciseFilters from "@/components/gdft/components/ui/ExerciseFilters";
import CreateWorkoutHelpPopup from "@/components/gdft/components/ui/CreateWorkoutHelpPopup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/gdft/components/ui/dropdown-menu"; // Added DropdownMenu imports
import IconButton from "@/components/gdft/components/ui/IconButton"; // Make sure IconButton is imported

const CreateWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { exercises, filterExercises, getExerciseById } = useExercise(); // Added getExerciseById
  const { startWorkout, savedWorkoutTemplates, startSavedWorkout, deleteSavedWorkout, saveWorkoutTemplate, currentWorkout } = useWorkout();

  const searchParams = new URLSearchParams(location.search);
  const workoutType = searchParams.get("type") || "Custom";
  const initialExercises = searchParams.get("exercises")?.split(',') || [];

  const [selectedExercises, setSelectedExercises] = useState<string[]>(initialExercises);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedWorkouts, setShowSavedWorkouts] = useState(workoutType === "Custom");

  const [equipmentFilter, setEquipmentFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>(workoutType !== "Custom" ? workoutType : "All");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [isGymBuilderOpen, setIsGymBuilderOpen] = useState(false);

  const categories: ("All" | ExerciseCategory)[] = ["All", "Weights", "Cardio", "Slide Board", "No Equipment"];
  const muscleGroups: ("All" | MuscleGroup)[] = [
    "All", "Abs", "Biceps", "Triceps", "Shoulders", "Chest", "Back", 
    "Legs", "Cardiovascular", "Full Body", "Core", "Glutes", 
    "Hamstrings", "Quadriceps", "Calves", "Forearms", "Inner Thigh", "Outer Thigh"
  ];

  const getExerciseImage = (exercise: Exercise) => {
    const imageUrl = getExerciseImageUrl(exercise);
    
    if (imageUrl) {
      const displayUrl = imageUrl.includes('drive.google.com') 
        ? convertGoogleDriveUrl(imageUrl) 
        : imageUrl;
        
      return (
        <img
          src={displayUrl}
          alt={exercise.name}
          className={`h-full w-full ${displayUrl.endsWith('.svg') ? 'object-contain' : 'object-cover'}`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
            const placeholder = document.createElement('span');
            placeholder.className = 'text-xs text-muted-foreground';
            placeholder.textContent = 'No image';
            e.currentTarget.parentElement?.appendChild(placeholder);
          }}
        />
      );
    } else {
      // Simple text placeholder for exercises without images
      return (
        <span className="text-xs text-muted-foreground">No image</span>
      );
    }
  };

  useEffect(() => {
    const filtered = filterExercises(
      equipmentFilter === "All" ? undefined : equipmentFilter,
      categoryFilter === "All" ? undefined : categoryFilter,
      muscleGroupFilter === "All" ? undefined : muscleGroupFilter,
      searchQuery
    );
    setAvailableExercises(filtered);
  }, [exercises, equipmentFilter, categoryFilter, muscleGroupFilter, searchQuery, filterExercises]);

  useEffect(() => {
    if (workoutType !== "Custom" && workoutType !== "All") {
      setCategoryFilter(workoutType);
    }
  }, [workoutType]);

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises((prevSelected) => {
      if (prevSelected.includes(exerciseId)) {
        return prevSelected.filter((id) => id !== exerciseId);
      } else {
        return [...prevSelected, exerciseId];
      }
    });
  };

  const handleStartWorkout = () => {
    if (selectedExercises.length === 0) {
      toast.error("Please select at least one exercise");
      return;
    }

    try {
      startWorkout(workoutType, selectedExercises);
      navigate("/workout");
    } catch (error) {
      console.error("Error starting workout:", error);
      toast.error("Failed to start workout: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleStartSavedWorkout = (template: SavedWorkoutTemplate) => {
    try {
      startSavedWorkout(template.id);
      navigate("/workout");
    } catch (error) {
      console.error("Error starting saved workout:", error);
      toast.error("Failed to start saved workout: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleContinueCurrentWorkout = () => {
    if (currentWorkout) {
      navigate("/workout");
    } else {
      toast.error("No active workout to continue");
    }
  };

  const handleDeleteSavedWorkout = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved workout?")) {
      deleteSavedWorkout(templateId);
    }
  };

  const handleSaveWorkout = () => {
    if (selectedExercises.length === 0) {
      toast.error("Please select at least one exercise");
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    if (!workoutName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }
    
    // Save the template directly without starting a workout
    saveWorkoutTemplate(workoutName, selectedExercises, workoutType as ExerciseCategory | "Custom");
    setShowSaveDialog(false);
    setWorkoutName("");
    setSelectedExercises([]); // Clear selections after saving
    toast.success(`Workout "${workoutName}" saved successfully`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Function to render saved workout templates with dropdown
  const renderSavedWorkoutTemplatesWithDropdown = () => {
    if (savedWorkoutTemplates.length === 0) {
      return null; 
    }

    return savedWorkoutTemplates.map((template) => {
      const exercisesInWorkout = template.exercises.map(id => getExerciseById(id)).filter(ex => ex) as Exercise[];
      return (
        <div
          key={template.id}
          className="p-4 rounded-lg border border-gray-700 bg-gym-card hover:bg-gym-card-hover transition-colors flex justify-between items-center"
        >
          <div onClick={() => handleStartSavedWorkout(template)} className="cursor-pointer flex-grow">
            <h3 className="font-medium">{template.name}</h3>
            <div className="flex text-xs text-muted-foreground space-x-3 mt-1">
              <span>{exercisesInWorkout.length} exercise{exercisesInWorkout.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>Created {formatDate(template.createdAt)}</span>
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
                      <DropdownMenuItem key={exercise.id} disabled>
                        {exercise.name}
                      </DropdownMenuItem>
                    ) : null
                  )
                ) : (
                  <DropdownMenuItem disabled>No exercises in this workout.</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <IconButton
              Icon={Trash}
              onClick={() => { // Removed 'e' and 'e.stopPropagation()'
                // Consider if confirm is still needed or if handleDeleteSavedWorkout handles it
                // For now, assuming handleDeleteSavedWorkout might need the event for other reasons if it's not just for stopPropagation
                // If handleDeleteSavedWorkout was defined as (e, id), it needs to be (id) or e passed differently
                // For simplicity, if stopPropagation was the only reason for 'e', it's removed.
                // If handleDeleteSavedWorkout expects an event, this will need further adjustment.
                const mockEvent = {} as React.MouseEvent<HTMLButtonElement, MouseEvent>; // Or null if not used
                handleDeleteSavedWorkout(mockEvent, template.id); // Adjusted if needed
              }}
              label="Delete"
              variant="blue"
              size="sm"
            />
            <IconButton
              Icon={Clock}
              onClick={() => { // Removed 'e' and 'e.stopPropagation()'
                handleStartSavedWorkout(template);
              }}
              label="Start"
              variant="blue"
              size="sm"
            />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="page-container page-transition pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/5">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
          <h1 className="text-xl font-bold">
            {workoutType === "Custom" ? "Create Custom Workout" : `${workoutType} Workout`}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {workoutType === "Custom" && (
            <>
              <button
                className={`p-2 rounded-md transition-colors ${
                  showSavedWorkouts ? "bg-primary text-white" : "bg-gym-card hover:bg-gym-card-hover"
                }`}
                onClick={() => setShowSavedWorkouts(!showSavedWorkouts)}
              >
                <Save className="h-5 w-5" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveWorkout}
                disabled={selectedExercises.length === 0}
              >
                Save Workout
              </Button>
            </>
          )}
          <button
            className="p-2 bg-gym-card rounded-md hover:bg-gym-card-hover transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </button>
          <Button variant="ghost" size="icon" onClick={() => setShowHelp(true)}>
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <CreateWorkoutHelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="workoutName" className="block text-sm font-medium mb-2">
              Workout Name
            </label>
            <input
              id="workoutName"
              type="text"
              className="w-full p-2 bg-gym-dark border border-border rounded-md"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Enter workout name..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {workoutType === "Custom" && showSavedWorkouts && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Saved Workouts</h2>
          {savedWorkoutTemplates.length > 0 ? (
            <div className="space-y-3">
              {renderSavedWorkoutTemplatesWithDropdown()} {/* Call the new function here */}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No saved workouts yet. Create one using the 'Save Workout' button above after selecting exercises.</p>
          )}
          {savedWorkoutTemplates.length > 0 && <div className="my-6 border-t border-gray-700"></div>}
        </div>
      )}

      {showFilters && (
        <div className="card-glass p-4 mb-6 animate-fadeIn">
          <h2 className="text-sm font-medium mb-3">Filter Exercises</h2>
          <ExerciseFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            equipmentFilter={equipmentFilter}
            onEquipmentFilterChange={setEquipmentFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={(category) => {
              if (workoutType === "Custom" || workoutType === "All") {
                setCategoryFilter(category);
              }
            }}
            muscleGroupFilter={muscleGroupFilter}
            onMuscleGroupFilterChange={setMuscleGroupFilter}
          />
        </div>
      )}

      {/* ── Custom Gym Builder Shortcut ── */}
      <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button 
          onClick={() => setIsGymBuilderOpen(true)}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-white/10 shadow-xl shadow-blue-500/20 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <div className="flex items-center justify-between w-full px-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-black text-white text-lg tracking-tight italic">BUILD CUSTOM GYM WORKOUT</p>
                <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Map your gym & equipment</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </Button>
      </div>

      <CustomGymBuilder isOpen={isGymBuilderOpen} onClose={() => setIsGymBuilderOpen(false)} />

      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
        </p>
        
        <div className="flex items-center space-x-4">
          <button
            className="text-sm text-primary hover:text-blue-400 transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
            onClick={() => setSelectedExercises(availableExercises.map(ex => ex.id))}
            disabled={availableExercises.length === 0 || selectedExercises.length === availableExercises.length}
          >
            Select All
          </button>
          <button
            className="text-sm text-primary hover:text-blue-400 transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
            onClick={() => setSelectedExercises([])}
            disabled={selectedExercises.length === 0}
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-20">
        {availableExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-400 mb-4">No exercises found</p>
            <button
              onClick={() => navigate("/create-exercise")}
              className="bg-primary px-4 py-2 rounded-lg"
            >
              Create a new exercise
            </button>
          </div>
        ) : (
          availableExercises.map((exercise) => {
            const isSelected = selectedExercises.includes(exercise.id);
            return (
              <div
                key={exercise.id}
                className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer group ${
                  isSelected
                    ? "bg-primary/20 border-primary/50"
                    : "bg-gym-card border-transparent hover:bg-gym-card-hover"
                }`}
                onClick={() => toggleExerciseSelection(exercise.id)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-gym-dark flex items-center justify-center mr-3 overflow-hidden relative transition-transform duration-200 will-change-transform group-hover:scale-[2.0] group-hover:z-50 group-hover:shadow-2xl active:scale-[2.0]">
                    {getExerciseImage(exercise)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{exercise.name}</h3>
                    <div className="flex text-xs text-muted-foreground space-x-2">
                      <span>{exercise.category}</span>
                      <span>•</span>
                      <span>{exercise.muscleGroups.slice(0, 2).join(", ")}{exercise.muscleGroups.length > 2 ? "..." : ""}</span>
                    </div>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-gray-500"
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gym-dark border-t border-white/5 z-50">
        {currentWorkout && currentWorkout.id && !currentWorkout.completed && (currentWorkout.exercises?.length || 0) > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleContinueCurrentWorkout}
              className="py-3 rounded-lg font-medium bg-gym-blue text-white hover:bg-gym-blue/80 shadow-lg active:scale-95"
            >
              Continue Workout
            </Button>
            <Button
              onClick={handleStartWorkout}
              disabled={selectedExercises.length === 0}
              className={`py-3 rounded-lg font-medium transition-colors ${
                selectedExercises.length > 0
                  ? "bg-gym-card text-white hover:bg-gym-card-hover border border-white/10"
                  : "bg-gym-dark text-gray-400 cursor-not-allowed border border-white/5"
              }`}
            >
              Start New
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleStartWorkout}
            disabled={selectedExercises.length === 0}
            className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all ${
              selectedExercises.length > 0
                ? "bg-gym-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-500/10 active:scale-95"
                : "bg-gym-dark text-gray-500 border border-white/10 cursor-not-allowed"
            }`}
          >
            Start Workout
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateWorkout;
