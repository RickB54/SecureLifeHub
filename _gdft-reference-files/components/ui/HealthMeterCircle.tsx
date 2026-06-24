import React from 'react';

interface HealthMeterProps {
  steps: number;
  maxSteps?: number;
  duration: number; // in minutes
  maxDuration?: number; // in minutes
  calories: number;
  maxCalories?: number;
  size?: 'small' | 'large';
  onClick?: () => void;
}

export const HealthMeterCircle: React.FC<HealthMeterProps> = ({
  steps,
  maxSteps = 10000,
  duration,
  maxDuration = 60,
  calories,
  maxCalories = 500,
  size = 'large',
  onClick
}) => {
  const ringSize = size === 'small' ? 60 : 120;
  const strokeWidth = size === 'small' ? 3 : 6;
  // Center is half the total size
  const centerX = ringSize / 2;
  const centerY = ringSize / 2;
  
  // Calculate radii for each ring
  const radiusSteps = size === 'small' ? 24 : 48;
  const radiusDuration = radiusSteps - strokeWidth - 2;
  const radiusCalories = radiusSteps - (strokeWidth + 2) * 2;

  // Calculate circumferences for each ring
  const circumferenceSteps = 2 * Math.PI * radiusSteps;
  const circumferenceDuration = 2 * Math.PI * radiusDuration;
  const circumferenceCalories = 2 * Math.PI * radiusCalories;

  // Calculate progress percentages with proper bounds checking
  const calculateRingProgress = (currentValue: number, targetValue: number): number => {
    if (!targetValue || targetValue === 0) return 0;
    // Cap at 100% for the visual ring
    const percent = (currentValue / targetValue) * 100;
    return Math.min(percent, 100);
  };

  const stepsProgress = calculateRingProgress(steps, maxSteps);
  const durationProgress = calculateRingProgress(duration, maxDuration);
  const caloriesProgress = calculateRingProgress(calories, maxCalories);

  const getStrokeDasharray = (progress: number, circumference: number) => {
    // If full, return simplified array to ensure closure
    if (progress >= 100) {
      return `${circumference} 0`;
    }
    const filledLength = (progress / 100) * circumference;
    // Ensure we don't have negative gap
    const gap = Math.max(0, circumference - filledLength);
    return `${filledLength} ${gap}`;
  };

  return (
    <div 
      className={`relative ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick}
      style={{ width: ringSize, height: ringSize }}
    >
      <svg
        width={ringSize}
        height={ringSize}
        className="transform -rotate-90"
      >
        {/* Background circles */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusSteps}
          fill="none"
          stroke="rgba(34, 197, 94, 0.2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusDuration}
          fill="none"
          stroke="rgba(59, 130, 246, 0.2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusCalories}
          fill="none"
          stroke="rgba(239, 68, 68, 0.2)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circles */}
        {/* Steps - Green (outer) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusSteps}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeDasharray={getStrokeDasharray(stepsProgress, circumferenceSteps)}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        
        {/* Duration - Blue (middle) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusDuration}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={getStrokeDasharray(durationProgress, circumferenceDuration)}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        
        {/* Calories - Red (inner) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusCalories}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeDasharray={getStrokeDasharray(caloriesProgress, circumferenceCalories)}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      
      {size === 'large' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xs font-medium">
              {steps}
            </div>
            <div className="text-gray-400 text-xs">steps</div>
          </div>
        </div>
      )}
    </div>
  );
};