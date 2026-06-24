
import React from 'react';
import { ModernHelpDialog } from "./ModernHelpDialog";

interface CreateWorkoutHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkoutHelpPopup: React.FC<CreateWorkoutHelpPopupProps> = ({ isOpen, onClose }) => {
  const helpPages = [
    {
      title: "Building Your Workout",
      content: (
        <div className="space-y-4">
          <p>This page is your workbench for building the perfect session.</p>
          
          <div className="bg-gym-card/40 p-3 rounded-lg border border-white/5 shadow-inner">
            <h4 className="font-semibold text-white mb-1">Selecting Exercises</h4>
            <p className="text-xs text-gray-400">Tap on any exercise card to add it to your workout stack. Tap it again if you want to remove it.</p>
          </div>
          
          <div className="bg-gym-card/40 p-3 rounded-lg border border-white/5 shadow-inner">
            <h4 className="font-semibold text-white mb-1">Filters & Search</h4>
            <p className="text-xs text-gray-400">Use the filter icon to narrow down the list by equipment, category, or muscle group. You can even mix categories like Weights and Cardio!</p>
          </div>
        </div>
      )
    },
    {
      title: "Saving & Starting",
      content: (
        <div className="space-y-4">
          <div className="bg-gym-card/40 p-3 rounded-lg border border-white/5 shadow-inner">
            <h4 className="font-semibold text-white mb-1">Saved Templates</h4>
            <p className="text-xs text-gray-400">Reuse your favorite combinations by viewing and starting previously saved workout templates.</p>
          </div>
          
          <div className="bg-gym-card/40 p-3 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <h4 className="font-semibold text-blue-400 mb-1">Save for Later</h4>
            <p className="text-xs text-gray-300">Once you've selected your exercises, save the combination as a template. It will then appear in your My Plans or Templates list.</p>
          </div>

          <div className="bg-gym-card/40 p-3 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <h4 className="font-semibold text-emerald-400 mb-1">Start Workout</h4>
            <p className="text-xs text-gray-300">When you're ready, hit "Start Workout" to begin your live session with tracking enabled.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <ModernHelpDialog 
      isOpen={isOpen} 
      onClose={onClose} 
      pages={helpPages} 
      title="Create Workout Help" 
    />
  );
};

export default CreateWorkoutHelpPopup;
