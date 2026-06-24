
import React, { useState } from "react";
import { X, Trash } from "lucide-react";
import { WorkoutSet } from "@/components/gdft/lib/data";
import { formatTimeDisplay, parseTimeInput, formatNumber } from "@/components/gdft/lib/formatters";

interface EditSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  set: WorkoutSet;
  onSave: (updatedSet: WorkoutSet) => void;
  onDelete: () => void;
  onAddSet?: () => void;
  exercise?: any;
  userWeightKg?: number;
}

const EditSetModal = ({ isOpen, onClose, set, onSave, onDelete, onAddSet, exercise, userWeightKg }: EditSetModalProps) => {
  const [updatedSet, setUpdatedSet] = useState<WorkoutSet>({...set});
  const [showAddMetric, setShowAddMetric] = useState(false);
  
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const isTime = name === 'time' || name === 'duration';
    
    if (type === 'checkbox') {
      setUpdatedSet(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (isTime) {
      setUpdatedSet(prev => ({ ...prev, [name]: parseTimeInput(value) }));
    } else {
      setUpdatedSet(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    }
  };

  const addMetric = (metricKey: string) => {
    setUpdatedSet(prev => ({ ...prev, [metricKey]: 0 }));
    setShowAddMetric(false);
  };

  const METRIC_OPTIONS = [
    { key: 'maxHeartRate', label: 'Max Heart Rate', unit: 'bpm' },
    { key: 'caloriesBurned', label: 'Calories', unit: 'cal' },
    { key: 'bloodOxygen', label: 'Blood Oxygen', unit: '%' },
    { key: 'glucose', label: 'Glucose', unit: 'mg/dL' },
    { key: 'notes', label: 'Notes', unit: '', type: 'text' },
  ];

  const availableOptions = METRIC_OPTIONS.filter(opt => 
    (updatedSet as any)[opt.key] === undefined && (set as any)[opt.key] === undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(updatedSet);
  };

  const renderField = (name: string, label: string, type: 'number' | 'text' = 'number', step?: string) => {
    const val = (updatedSet as any)[name];
    if (val === undefined && (set as any)[name] === undefined) return null;

    const isTime = name === 'time' || name === 'duration';

    return (
      <div>
        <label className="block text-sm mb-1">{label}:</label>
        <input
          type={isTime ? 'text' : type}
          name={name}
          value={isTime ? formatTimeDisplay(val || 0) : (val ?? 0)}
          onChange={handleChange}
          className="w-full bg-gym-darker border border-gray-700 rounded-md p-2 font-mono"
          step={step}
          placeholder={isTime ? "0:00:00" : ""}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-gym-dark border border-border rounded-lg w-11/12 max-w-md mx-auto p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Set</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderField('weight', 'Weight', 'number', '0.1')}
          {renderField('reps', 'Reps')}
          {renderField('time', 'Time (H:M:S)')}
          {renderField('duration', 'Duration (H:M:S)')}
          {renderField('distance', 'Distance', 'number', '0.01')}
          {renderField('incline', 'Incline %', 'number', '0.1')}
          {renderField('steps', 'Steps')}
          {renderField('avgHeartRate', 'Avg Heart Rate')}
          {renderField('maxHeartRate', 'Max Heart Rate')}
          {renderField('bloodOxygen', 'Blood Oxygen %')}
          {renderField('glucose', 'Glucose (mg/dL)')}
          {renderField('notes', 'Set Notes', 'text')}
          {renderField('caloriesBurned', 'Manual Calories')}

          {availableOptions.length > 0 && (
            <div className="relative pt-2">
              <button 
                type="button"
                onClick={() => setShowAddMetric(!showAddMetric)}
                className="text-gym-blue text-sm font-medium hover:underline flex items-center"
              >
                + Add More Metrics
              </button>
              {showAddMetric && (
                <div className="absolute left-0 mt-1 w-48 bg-gym-darker border border-gray-700 rounded-md shadow-xl z-[60] py-1">
                  {availableOptions.map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gym-card"
                      onClick={() => addMetric(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {exercise && (
            <div className="bg-gym-darker/50 p-3 rounded-lg border border-gray-800 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Estimated Effort</span>
                <span className="text-gym-green font-mono font-bold">
                  {formatNumber(parseTimeInput(formatTimeDisplay(0)) + 1 === 1 ? 0 : 0)} {/* Mock logic to force re-render if needed, but real calculation below */}
                  {((s: any, ex: any, w: number) => {
                     // We use a small local helper since parseTimeInput is avail
                     const durationMins = (s.duration || s.time || (s.reps ? s.reps * 4 : 30)) / 60;
                     const met = (ex.category === 'Cardio' || ex.name.toLowerCase().includes('run')) ? 7.0 : 5.0;
                     const cals = met * w * (durationMins / 60);
                     return Math.round(cals * 10) / 10;
                  })(updatedSet, exercise, userWeightKg || 70)} cal
                </span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2 items-center py-2">
            <input
              type="checkbox"
              name="completed"
              id="completed-checkbox"
              checked={updatedSet.completed}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-700 bg-gym-darker text-gym-blue focus:ring-gym-blue"
            />
            <label htmlFor="completed-checkbox" className="text-sm font-medium">Mark as Completed</label>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center bg-destructive text-white px-3 py-2 rounded"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </button>
            
            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 text-white px-3 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-3 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
          
          {onAddSet && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onAddSet();
                  onClose();
                }}
                className="w-full bg-gym-dark hover:bg-gym-card-hover text-white py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                Add Set
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditSetModal;
