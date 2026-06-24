
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExerciseProgressTracker } from '@/components/ui/ExerciseProgressTracker';
import { Exercise } from '@/lib/data';

interface ExerciseProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export const ExerciseProgressModal: React.FC<ExerciseProgressModalProps> = ({ isOpen, onClose, exercise }) => {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-gym-dark border-gray-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{exercise.name} Progress</DialogTitle>
          <DialogDescription className="text-gray-400">
             Track your strength and volume progression over time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
            <ExerciseProgressTracker exerciseId={exercise.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
