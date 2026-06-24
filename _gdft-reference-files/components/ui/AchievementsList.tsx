
import React from 'react';
import { useWorkout, PR } from '@/contexts/WorkoutContext';
import { useExercise } from '@/contexts/ExerciseContext';
import { useSettings } from '@/contexts/SettingsContext';
import { formatNumber } from '@/lib/formatters';
import { Trophy, Medal, Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const AchievementsList = () => {
  const { achievedPrs } = useWorkout();
  const { exercises } = useExercise();
  const { unitSystem } = useSettings();

  if (!achievedPrs || achievedPrs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gym-card/20 rounded-lg border border-dashed border-gray-700">
        <Trophy className="h-10 w-10 mx-auto mb-2 text-gray-600" />
        <p>No achievements yet. Lift heavy and log your progress!</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedPrs = [...achievedPrs].sort((a, b) => b.date - a.date);

  const getTypeLabel = (type: PR['type']) => {
    switch (type) {
      case 'heaviest_weight': return 'Heaviest Lift';
      case 'best_1rm': return 'Best Estimated 1RM';
      case 'highest_volume': return 'Highest Volume';
      case 'most_reps': return 'Most Reps';
      default: return 'PR';
    }
  };

  const getIcon = (type: PR['type']) => {
    switch (type) {
      case 'heaviest_weight': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'best_1rm': return <Medal className="h-5 w-5 text-orange-500" />;
      case 'highest_volume': return <Award className="h-5 w-5 text-blue-500" />;
      default: return <Award className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2">
      {sortedPrs.map((pr, idx) => {
        const exercise = exercises.find(e => e.id === pr.exerciseId);
        const name = exercise ? exercise.name : 'Unknown Exercise';

        return (
          <div key={`${pr.exerciseId}-${pr.type}-${idx}`} className="bg-gym-card p-4 rounded-lg border border-gray-800 flex items-start gap-4 hover:border-gym-blue/50 transition-colors">
            <div className="bg-gray-800/50 p-2 rounded-full mt-1">
              {getIcon(pr.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm line-clamp-1">{name}</h4>
              <p className="text-xs text-gym-blue font-medium mb-1">{getTypeLabel(pr.type)}</p>
              <div className="text-xl font-bold text-gray-200">
                {formatNumber(pr.value)} 
                <span className="text-sm font-normal text-muted-foreground ml-1">
                    {pr.type === 'highest_volume' ? (unitSystem === 'metric' ? 'kg' : 'lbs') : (
                        pr.type === 'most_reps' ? 'reps' : (unitSystem === 'metric' ? 'kg' : 'lbs')
                    )}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {format(new Date(pr.date), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
