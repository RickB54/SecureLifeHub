
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/gdft/components/ui/dialog';
import { Button } from '@/components/gdft/components/ui/button';
import { Input } from '@/components/gdft/components/ui/input';
import { Label } from '@/components/gdft/components/ui/label';
import { Textarea } from '@/components/gdft/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/gdft/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/gdft/components/ui/tabs';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useWorkout } from '@/components/gdft/contexts/WorkoutContext';
import { useExercise } from '@/components/gdft/contexts/ExerciseContext';
import { toast } from 'sonner';
import type { Exercise } from '@/components/gdft/lib/data';

interface SmartWorkoutEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  onSave: (exerciseData: any[]) => void;
  existingData?: any[];
}

interface ExerciseEntry {
  id: string;
  exerciseId: string;
  exercise?: Exercise;
  sets: Array<{
    id: string;
    reps?: number;
    weight?: number;
    distance?: number;
    duration?: number;
    time?: number;
    incline?: number;
  }>;
  notes?: string;
}

const SmartWorkoutEntryDialog = ({ 
  isOpen, 
  onClose, 
  workoutId, 
  onSave,
  existingData = []
}: SmartWorkoutEntryDialogProps) => {
  const { savedWorkoutTemplates, customPlans } = useWorkout();
  const { exercises, getExerciseById } = useExercise();
  const [activeTab, setActiveTab] = useState<'template' | 'manual'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');

  useEffect(() => {
    if (existingData.length > 0) {
      // Load existing data if editing
      const entries = existingData.map(data => ({
        id: data.id || `entry_${Date.now()}_${Math.random()}`,
        exerciseId: data.exerciseId,
        exercise: getExerciseById(data.exerciseId),
        sets: data.sets || [{ id: `set_${Date.now()}`, reps: 0, weight: 0 }],
        notes: data.notes || ''
      }));
      setExerciseEntries(entries);
    }
  }, [existingData, getExerciseById]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = savedWorkoutTemplates.find(t => t.id === templateId);
    if (template) {
      const entries = template.exercises.map(exerciseId => {
        const exercise = getExerciseById(exerciseId);
        return {
          id: `entry_${Date.now()}_${Math.random()}`,
          exerciseId,
          exercise,
          sets: [{ 
            id: `set_${Date.now()}`,
            reps: 0,
            weight: 0,
            distance: 0,
            duration: 0,
            time: 0,
            incline: 0
          }],
          notes: ''
        };
      });
      setExerciseEntries(entries);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = customPlans.find(p => p.id === planId);
    if (plan && plan.days.length > 0) {
      // Use first day's exercises for now
      const dayExercises = plan.days[0].exercises;
      const entries = dayExercises.map(planExercise => {
        const exercise = getExerciseById(planExercise.exerciseId);
        return {
          id: `entry_${Date.now()}_${Math.random()}`,
          exerciseId: planExercise.exerciseId,
          exercise,
          sets: [{
            id: `set_${Date.now()}`,
            reps: planExercise.reps ? parseInt(planExercise.reps) : 0,
            weight: planExercise.weight ? parseFloat(planExercise.weight) : 0,
            distance: planExercise.distance ? parseFloat(planExercise.distance) : 0,
            time: planExercise.time ? parseInt(planExercise.time) : 0,
            incline: planExercise.incline ? parseFloat(planExercise.incline) : 0
          }],
          notes: ''
        };
      });
      setExerciseEntries(entries);
    }
  };

  const addExercise = () => {
    const newEntry: ExerciseEntry = {
      id: `entry_${Date.now()}_${Math.random()}`,
      exerciseId: '',
      sets: [{ id: `set_${Date.now()}`, reps: 0, weight: 0 }],
      notes: ''
    };
    setExerciseEntries([...exerciseEntries, newEntry]);
  };

  const removeExercise = (entryId: string) => {
    setExerciseEntries(exerciseEntries.filter(entry => entry.id !== entryId));
  };

  const updateExercise = (entryId: string, exerciseId: string) => {
    const exercise = getExerciseById(exerciseId);
    setExerciseEntries(exerciseEntries.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            exerciseId, 
            exercise,
            sets: [{
              id: `set_${Date.now()}`,
              reps: 0,
              weight: 0,
              distance: 0,
              duration: 0,
              time: 0,
              incline: 0
            }]
          }
        : entry
    ));
  };

  const addSet = (entryId: string) => {
    setExerciseEntries(exerciseEntries.map(entry => 
      entry.id === entryId
        ? {
            ...entry,
            sets: [...entry.sets, { id: `set_${Date.now()}`, reps: 0, weight: 0 }]
          }
        : entry
    ));
  };

  const updateSet = (entryId: string, setId: string, field: string, value: number) => {
    setExerciseEntries(exerciseEntries.map(entry => 
      entry.id === entryId
        ? {
            ...entry,
            sets: entry.sets.map(set => 
              set.id === setId
                ? { ...set, [field]: value }
                : set
            )
          }
        : entry
    ));
  };

  const removeSet = (entryId: string, setId: string) => {
    setExerciseEntries(exerciseEntries.map(entry => 
      entry.id === entryId
        ? {
            ...entry,
            sets: entry.sets.filter(set => set.id !== setId)
          }
        : entry
    ));
  };

  const updateExerciseNotes = (entryId: string, notes: string) => {
    setExerciseEntries(exerciseEntries.map(entry => 
      entry.id === entryId ? { ...entry, notes } : entry
    ));
  };

  const handleSave = () => {
    const validEntries = exerciseEntries.filter(entry => entry.exerciseId && entry.exercise);
    if (validEntries.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    onSave(validEntries);
    toast.success('Exercise details saved successfully');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gym-dark-card border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            Add Exercise Details
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'template' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2 bg-gym-darker">
            <TabsTrigger value="template" className="data-[state=active]:bg-gym-blue">Use Existing Plan</TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-gym-blue">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Saved Workouts</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="bg-gym-darker border-gray-600">
                    <SelectValue placeholder="Select a saved workout" />
                  </SelectTrigger>
                  <SelectContent className="bg-gym-darker border-gray-600">
                    {savedWorkoutTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Custom Plans</Label>
                <Select value={selectedPlan} onValueChange={handlePlanSelect}>
                  <SelectTrigger className="bg-gym-darker border-gray-600">
                    <SelectValue placeholder="Select a custom plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-gym-darker border-gray-600">
                    {customPlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Button onClick={addExercise} className="w-full bg-gym-blue hover:bg-gym-blue/80">
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </TabsContent>
        </Tabs>

        {/* Exercise Entries */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {exerciseEntries.map((entry) => (
            <div key={entry.id} className="card-glass p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {activeTab === 'manual' ? (
                    <Select 
                      value={entry.exerciseId} 
                      onValueChange={(value) => updateExercise(entry.id, value)}
                    >
                      <SelectTrigger className="bg-gym-darker border-gray-600">
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent className="bg-gym-darker border-gray-600 max-h-48">
                        {exercises.map(exercise => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <h3 className="font-semibold text-white">{entry.exercise?.name}</h3>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeExercise(entry.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Sets */}
              <div className="space-y-2">
                {entry.sets.map((set, setIndex) => (
                  <div key={set.id} className="flex items-center gap-2 text-sm">
                    <span className="w-12 text-gray-400">Set {setIndex + 1}</span>
                    
                    {entry.exercise?.category !== 'Cardio' && (
                      <>
                        <div className="flex flex-col">
                          <Label className="text-xs text-gray-400">Reps</Label>
                          <Input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) => updateSet(entry.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                            className="w-16 h-8 bg-gym-darker border-gray-600"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label className="text-xs text-gray-400">Weight</Label>
                          <Input
                            type="number"
                            value={set.weight || ''}
                            onChange={(e) => updateSet(entry.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-16 h-8 bg-gym-darker border-gray-600"
                          />
                        </div>
                      </>
                    )}

                    {entry.exercise?.category === 'Cardio' && (
                      <>
                        <div className="flex flex-col">
                          <Label className="text-xs text-gray-400">Time</Label>
                          <Input
                            type="number"
                            value={set.time || ''}
                            onChange={(e) => updateSet(entry.id, set.id, 'time', parseInt(e.target.value) || 0)}
                            className="w-16 h-8 bg-gym-darker border-gray-600"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label className="text-xs text-gray-400">Distance</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={set.distance || ''}
                            onChange={(e) => updateSet(entry.id, set.id, 'distance', parseFloat(e.target.value) || 0)}
                            className="w-20 h-8 bg-gym-darker border-gray-600"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label className="text-xs text-gray-400">Incline</Label>
                          <Input
                            type="number"
                            value={set.incline || ''}
                            onChange={(e) => updateSet(entry.id, set.id, 'incline', parseFloat(e.target.value) || 0)}
                            className="w-16 h-8 bg-gym-darker border-gray-600"
                          />
                        </div>
                      </>
                    )}

                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeSet(entry.id, set.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => addSet(entry.id)}
                  className="w-full border-gray-600 hover:bg-gym-darker"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Set
                </Button>
              </div>

              <Textarea
                placeholder="Exercise notes..."
                value={entry.notes || ''}
                onChange={(e) => updateExerciseNotes(entry.id, e.target.value)}
                className="bg-gym-darker border-gray-600 text-white"
                rows={2}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-white">Workout Notes</Label>
            <Textarea
              placeholder="Add workout notes..."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="bg-gym-darker border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Exercise Details
            </Button>
            <Button variant="outline" onClick={onClose} className="border-gray-600">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartWorkoutEntryDialog;
