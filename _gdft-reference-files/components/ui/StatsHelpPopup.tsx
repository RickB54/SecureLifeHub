
import React from 'react';
import { ModernHelpDialog } from './ModernHelpDialog';

interface StatsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatsHelpPopup: React.FC<StatsHelpPopupProps> = ({ isOpen, onClose }) => {
  const helpPages = [
    {
      title: "Understanding Your Stats",
      content: (
        <div className="space-y-4">
          <p>
            Your comprehensive fitness dashboard showing progress, trends, and achievements.
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Overview Cards:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Total Workouts:</strong> All completed sessions</li>
              <li><strong>Total Time:</strong> Cumulative workout duration</li>
              <li><strong>Total Sets:</strong> Sets logged across all workouts</li>
              <li><strong>Total Reps:</strong> All reps recorded</li>
              <li><strong>Calories:</strong> Automatically calculated from workout type and duration</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Workout History:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Workouts are now <strong>grouped by type</strong> in collapsible sections for easy browsing</li>
              <li>Filter by <strong>date range</strong>, <strong>time period</strong> (day/week/month/all), or <strong>workout type</strong></li>
              <li>Each workout shows date, duration, type, and calories</li>
              <li>Action buttons on every card: ▶ Redo, 📊 Stats, ✏️ Edit, 📦 Archive, 🗑️ Delete</li>
              <li>Use <strong>Expand All / Collapse All</strong> to open or close all workout groups at once</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Mobile Layout:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>The page is fully responsive — no left/right scrolling required</li>
              <li>Action buttons appear on their own row below the workout title for easy tapping</li>
              <li>Filter buttons wrap to multiple lines on small screens</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Workout Actions",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Per-Workout Buttons:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>▶ <strong>Redo Workout:</strong> Restart this workout immediately with the same exercises</li>
              <li>📊 <strong>Stats Graph:</strong> View a performance chart for all sets in this workout</li>
              <li>✏️ <strong>Edit / Notes:</strong> Add or update personal notes for the session</li>
              <li>📦 <strong>Archive:</strong> Hide the workout from the main history (toggle to show archived)</li>
              <li>🗑️ <strong>Delete:</strong> Permanently remove the workout</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Workout Grouping:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Workouts are grouped by their workout type (e.g., Weights, Cardio, No Equipment)</li>
              <li>Click a group header to expand/collapse all workouts in that category</li>
              <li>The count badge shows how many workouts are in the group</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Navigation Links:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Body Metrics:</strong> View weight and body measurement history</li>
              <li><strong>Health Metrics:</strong> View steps, heart rate, sleep data</li>
              <li><strong>Sync:</strong> Manually pull workouts from your smartwatch</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Cardio & Calorie Tracking",
      content: (
        <div className="space-y-4">
          <p>
            Advanced cardio workout tracking with AI-powered step calculation and post-workout data collection.
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">AI Step Calculation:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>🏃 <strong>Treadmill/Walking:</strong> 2000-2400 steps per mile based on pace</li>
              <li>🚴 <strong>Elliptical:</strong> 1800 equivalent steps per mile</li>
              <li>🚵 <strong>Cycling:</strong> 1500 equivalent steps per mile</li>
              <li>🪜 <strong>Stair Climbing:</strong> 2200 steps per mile equivalent</li>
              <li>⚖️ <strong>Weight Training:</strong> 15 steps per set</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Post-Cardio Data Collection:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Popup appears automatically when cardio workout ends</li>
              <li><strong>Speed:</strong> Enter actual treadmill/bike speed for precision</li>
              <li><strong>Incline:</strong> Treadmill incline percentage for bonus calculations</li>
              <li><strong>Intensity:</strong> Low/Moderate/High/Very High workout intensity</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Slide Board:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Incline-level based calorie calculation (1-2: Low, 3-4: Average, 5-6: High, 7-8: Extremely High)</li>
            </ul>
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
      title="Stats Help"
    />
  );
};

export default StatsHelpPopup;
