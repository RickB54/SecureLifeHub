
import React from 'react';
import { ModernHelpDialog } from './ModernHelpDialog';

interface CalendarHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarHelpPopup: React.FC<CalendarHelpPopupProps> = ({ isOpen, onClose }) => {
  const helpPages = [
    {
      title: "Workout Calendar",
      content: (
        <div className="space-y-4">
          <p>
            Track your fitness consistency and plan future workouts with the visual calendar.
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Calendar Indicators:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Green Dots:</strong> Days with completed workouts</li>
              <li><strong>Blue Highlights:</strong> Scheduled workout days</li>
              <li><strong>Today:</strong> Current date with special styling</li>
              <li><strong>Empty Days:</strong> No workout activity</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Workout Types:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Manual workouts logged in the app</li>
              <li>Smartwatch workouts synced automatically</li>
              <li>Scheduled workouts from your plans</li>
              <li>All types contribute to your activity dots</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Planning & Scheduling",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Viewing Workout Details:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Tap any day with a green dot to see workout details</li>
              <li>View exercise list, duration, and calories burned</li>
              <li>Check if workout was manual or smartwatch-synced</li>
              <li>Access workout notes and performance data</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Consistency Tracking:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Visual representation of your workout frequency</li>
              <li>Identify patterns in your training schedule</li>
              <li>Spot gaps and maintain consistency</li>
              <li>Track monthly and weekly progress</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Integration Benefits:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Smartwatch workouts appear automatically</li>
              <li>Manual workouts update calendar in real-time</li>
              <li>No duplicate entries - one dot per day</li>
              <li>Comprehensive view of all fitness activity</li>
            </ul>
          </div>
          
          <p className="text-green-400">
            🎯 Goal: Aim for consistent green dots to build lasting fitness habits!
          </p>
        </div>
      )
    }
  ];

  return (
    <ModernHelpDialog
      isOpen={isOpen}
      onClose={onClose}
      pages={helpPages}
      title="Calendar Help"
    />
  );
};

export default CalendarHelpPopup;
