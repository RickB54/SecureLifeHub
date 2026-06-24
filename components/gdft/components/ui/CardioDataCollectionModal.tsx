import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/gdft/components/ui/dialog';
import { Button } from '@/components/gdft/components/ui/button';
import { Input } from '@/components/gdft/components/ui/input';
import { Label } from '@/components/gdft/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/gdft/components/ui/select';
import { Workout, Exercise } from '@/components/gdft/lib/data';
import { Activity, Clock, TrendingUp } from 'lucide-react';

interface CardioDataCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout;
  exercises: Exercise[];
  onSave: (cardioData: Record<string, any>) => void;
}

interface CardioFields {
  speed?: { label: string; type: string; min?: number; max?: number };
  incline?: { label: string; type: string; min?: number; max?: number };
  resistance?: { label: string; type: string; min?: number; max?: number };
  intensity: { label: string; type: string; options: string[] };
}

const getCardioFields = (exerciseType: string): CardioFields => {
  const exerciseName = exerciseType.toLowerCase();
  
  if (exerciseName.includes('treadmill') || exerciseName.includes('walking')) {
    return {
      speed: { label: "Speed (mph)", type: "number", min: 0.5, max: 15 },
      incline: { label: "Incline (%)", type: "number", min: 0, max: 30 },
      intensity: { label: "Intensity", type: "select", options: ["Low", "Moderate", "High", "Very High"] }
    };
  }
  
  if (exerciseName.includes('elliptical')) {
    return {
      resistance: { label: "Resistance Level", type: "number", min: 1, max: 20 },
      incline: { label: "Incline Level", type: "number", min: 1, max: 15 },
      intensity: { label: "Intensity", type: "select", options: ["Low", "Moderate", "High", "Very High"] }
    };
  }
  
  if (exerciseName.includes('bike') || exerciseName.includes('cycling')) {
    return {
      resistance: { label: "Resistance Level", type: "number", min: 1, max: 25 },
      speed: { label: "Average Speed (mph)", type: "number", min: 5, max: 35 },
      intensity: { label: "Intensity", type: "select", options: ["Low", "Moderate", "High", "Very High"] }
    };
  }

  if (exerciseName.includes('slide board')) {
    return {
      incline: { label: "Incline Level (1-8)", type: "number", min: 1, max: 8 },
      intensity: { label: "Intensity", type: "select", options: ["Low", "Moderate", "High", "Very High"] }
    };
  }
  
  return {
    intensity: { label: "Intensity", type: "select", options: ["Low", "Moderate", "High", "Very High"] }
  };
};

const isCardioExercise = (exercise: Exercise): boolean => {
  const exerciseName = exercise.name.toLowerCase();
  const exerciseCategory = exercise.category?.toLowerCase() || '';
  
  return exerciseCategory.includes('cardio') || 
         exerciseName.includes('treadmill') || exerciseName.includes('elliptical') ||
         exerciseName.includes('running') || exerciseName.includes('walking') ||
         exerciseName.includes('cycling') || exerciseName.includes('bike') ||
         exerciseName.includes('stair') || exerciseName.includes('step') ||
         exerciseName.includes('slide board');
};

export const CardioDataCollectionModal: React.FC<CardioDataCollectionModalProps> = ({
  isOpen,
  onClose,
  workout,
  exercises,
  onSave
}) => {
  const [cardioData, setCardioData] = useState<Record<string, any>>({});

  // Get cardio exercises from the workout
  const cardioExercises = workout.exercises
    .map(id => exercises.find(ex => ex.id === id))
    .filter((ex): ex is Exercise => ex !== undefined && isCardioExercise(ex));

  const handleFieldChange = (exerciseId: string, field: string, value: string | number) => {
    setCardioData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Ensure all cardio exercises have at least intensity set
    const completeData = { ...cardioData };
    cardioExercises.forEach(exercise => {
      if (!completeData[exercise.id]?.intensity) {
        completeData[exercise.id] = {
          ...completeData[exercise.id],
          intensity: 'Moderate'
        };
      }
    });

    onSave(completeData);
    onClose();
  };

  if (cardioExercises.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Enhanced Cardio Data Collection
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Provide additional details about your cardio exercises for more accurate calorie and step calculations.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {cardioExercises.map((exercise) => {
            const fields = getCardioFields(exercise.name);
            const exerciseData = cardioData[exercise.id] || {};

            return (
              <div key={exercise.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  {exercise.name}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Speed Field */}
                  {fields.speed && (
                    <div className="space-y-2">
                      <Label htmlFor={`speed-${exercise.id}`}>{fields.speed.label}</Label>
                      <Input
                        id={`speed-${exercise.id}`}
                        type="number"
                        min={fields.speed.min}
                        max={fields.speed.max}
                        step="0.1"
                        value={exerciseData.speed || ''}
                        onChange={(e) => handleFieldChange(exercise.id, 'speed', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 3.5"
                      />
                    </div>
                  )}

                  {/* Incline Field */}
                  {fields.incline && (
                    <div className="space-y-2">
                      <Label htmlFor={`incline-${exercise.id}`}>{fields.incline.label}</Label>
                      <Input
                        id={`incline-${exercise.id}`}
                        type="number"
                        min={fields.incline.min}
                        max={fields.incline.max}
                        step="0.5"
                        value={exerciseData.incline || ''}
                        onChange={(e) => handleFieldChange(exercise.id, 'incline', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 5"
                      />
                    </div>
                  )}

                  {/* Resistance Field */}
                  {fields.resistance && (
                    <div className="space-y-2">
                      <Label htmlFor={`resistance-${exercise.id}`}>{fields.resistance.label}</Label>
                      <Input
                        id={`resistance-${exercise.id}`}
                        type="number"
                        min={fields.resistance.min}
                        max={fields.resistance.max}
                        value={exerciseData.resistance || ''}
                        onChange={(e) => handleFieldChange(exercise.id, 'resistance', parseInt(e.target.value) || 0)}
                        placeholder="e.g., 8"
                      />
                    </div>
                  )}

                  {/* Intensity Field */}
                  <div className="space-y-2">
                    <Label htmlFor={`intensity-${exercise.id}`}>{fields.intensity.label}</Label>
                    <Select
                      value={exerciseData.intensity || 'Moderate'}
                      onValueChange={(value) => handleFieldChange(exercise.id, 'intensity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.intensity.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Skip for Now
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Save & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};