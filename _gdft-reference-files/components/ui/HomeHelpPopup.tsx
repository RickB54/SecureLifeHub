
import React from 'react';
import { ModernHelpDialog } from './ModernHelpDialog';

interface HomeHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HomeHelpPopup: React.FC<HomeHelpPopupProps> = ({ isOpen, onClose }) => {
  const helpPages = [
    {
      title: "Welcome to GymDayFitTracker",
      content: (
        <div className="space-y-4">
          <p>
            Your complete fitness companion for tracking workouts, monitoring progress, and achieving your fitness goals.
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">New: AI Workout Generator ✨</h4>
             <p className="text-sm text-blue-300 mb-2 font-semibold">
               Generate personalized workout plans using AI - like having a professional trainer in your pocket!
             </p>
             <ul className="space-y-1 list-disc list-inside text-sm text-gray-300">
               <li><strong>How to use:</strong> Go to <strong>Custom Plans</strong> page, click <strong>✨ AI Plan</strong> button</li>
               <li><strong>Step 1:</strong> Choose your goal (muscle gain, strength, fat loss, endurance)</li>
               <li><strong>Step 2:</strong> Select experience level and available equipment</li>
               <li><strong>Step 3:</strong> Set frequency (2-6 days/week) and duration (15-120 min)</li>
               <li><strong>Optional:</strong> Add injuries or restrictions for safe programming</li>
               <li><strong>Generate:</strong> AI creates a complete multi-day program!</li>
             </ul>
             <p className="text-sm text-purple-300 mt-2">
               <strong>After generation:</strong>
             </p>
             <ul className="space-y-1 list-disc list-inside text-sm text-gray-300 ml-4">
               <li><strong className="text-blue-400">🏋️ Start First Day:</strong> Begin working out immediately!</li>
               <li><strong className="text-green-400">💾 Save to My Plans:</strong> Store for later (dialog opens automatically)</li>
               <li><strong>🔄 Start Over:</strong> Generate a different plan</li>
             </ul>
             <p className="text-sm text-yellow-300 mt-2">
               Look for the <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">✨ AI Generated</span> badge on your saved plans!
             </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Quick Start:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Create workouts from templates or build custom ones</li>
              <li>Track exercises with sets, reps, and weights</li>
              <li>Monitor progress in Stats and Calendar</li>
              <li>Sync smartwatch data automatically</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Main Features:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Workout Tracking:</strong> Log exercises with detailed metrics</li>
              <li><strong>Smartwatch Sync:</strong> Auto-import from Google Fit/Samsung Health</li>
              <li><strong>Progress Monitoring:</strong> View stats, trends, and achievements</li>
              <li><strong>Custom Plans:</strong> Create personalized workout routines or use the ✨ AI Workout Generator for professional programming</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Smartwatch Integration",
      content: (
        <div className="space-y-4">
          <p>
            Automatically sync your smartwatch workouts for seamless tracking.
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">What Gets Synced:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Calories burned</li>
              <li>Average & maximum heart rate</li>
              <li>Steps count</li>
              <li>Workout duration</li>
              <li>Distance & speed (for cardio)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Setup Process:</h4>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Pair your smartwatch with Samsung Health or Google Fit</li>
              <li>Go to Settings → Smartwatch Sync</li>
              <li>Enable Health Connect permissions</li>
              <li>Workouts sync automatically!</li>
            </ol>
          </div>
          
          <p className="text-blue-400">
            Look for "From Smartwatch" tags in your Stats to identify synced workouts.
          </p>
        </div>
      )
    },
    {
      title: "🚀 Live Workout Update (v3.5)",
      content: (
        <div className="space-y-6 text-sm">
          <div className="bg-gym-card/40 p-4 rounded-xl border border-gym-blue/30 shadow-lg shadow-blue-500/10">
            <h5 className="font-bold text-white flex items-center gap-2 mb-2">
              🎙️ Voice-Activated Performance Logging
            </h5>
            <p className="text-gray-300 mb-3">
              Go hands-free! Our elite voice engine now supports natural language commands for sets and biometrics.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-gym-blue font-bold">•</span>
                <span><strong>Biometric Acquisition:</strong> Say "HR 145" or "Max heart rate 170" to instantly log set intensity.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gym-blue font-bold">•</span>
                <span><strong>Neural Volume Entry:</strong> Say "Add 225 for 10" or "Three hundred for eight" for instant set creation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gym-blue font-bold">•</span>
                <span><strong>Live Feedback:</strong> Look for the <strong>pulsing Mic icon</strong> in the header and real-time "What I Heard" toasts.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gym-card/40 p-4 rounded-xl border border-rose-500/30 shadow-lg shadow-rose-500/10">
            <h5 className="font-bold text-white flex items-center gap-2 mb-2">
              📈 Advanced Biometric Analytics
            </h5>
            <p className="text-gray-300 mb-3">
              Tap the 📊 icon in your history for a high-fidelity breakdown of your physiological performance.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Intensity Timeline:</strong> Rotated labels and precise markers correlate volume fluxes with heart rate peaks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Peak HR Masking:</strong> Automatically tracks your absolute maximum heart rate across the entire session.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gym-card/40 p-4 rounded-xl border border-emerald-500/30">
            <h5 className="font-bold text-white flex items-center gap-2 mb-2">
              📱 Elite Mobile Architecture
            </h5>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Fixed Tactical Header:</strong> Exercise imagery and navigation always remain in view.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Precision Auto-Align:</strong> Adding sets now automatically scrolls the viewport for perfect entry alignment.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "New Features & Updates",
      content: (
        <div className="space-y-6 text-sm">
          <div>
            <h4 className="font-bold text-lg text-gym-blue mb-2">🚀 What's New?</h4>
            <p className="mb-4">
              We've been busy! Here's a summary of all recent improvements to GymDayFitTracker.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gym-card/40 p-3 rounded-lg border border-blue-500/20 shadow-lg shadow-blue-900/10">
              <h5 className="font-semibold text-blue-400 flex items-center gap-2 mb-1">
                ✨ AI Workout Generator Redesign
              </h5>
              <p className="text-gray-300 mb-2">
                A massive visual and functional overhaul to our flagship AI feature!
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2 space-y-1">
                <li><strong>Beautiful Imagery:</strong> Every goal (Muscle Gain, Fat Loss, etc.) now features cinematic gym backgrounds with vibrant gradients.</li>
                <li><strong>Equipment Accordions:</strong> Equipment is now grouped into smart, collapsible categories to reduce scrolling and save you time.</li>
                <li><strong>Specialty Gear:</strong> Added support for Slide Boards (Total Gym style), Cable Pulleys, TRX, and more.</li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-purple-500/20 shadow-lg shadow-purple-900/10">
              <h5 className="font-semibold text-purple-400 flex items-center gap-2 mb-1">
                🏗️ Interactive Plan Builder
              </h5>
              <p className="text-gray-300 mb-2">
                Manage your routines with more flexibility than ever before.
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2 space-y-1">
                <li><strong>Drag-to-Reorder:</strong> Use the ⠿ handle on any exercise row to shift it up or down instantly.</li>
                <li><strong>Inline Day Preview:</strong> In your saved plans list, tap any day to see its exercises dropdown immediately without leaving the dialog.</li>
                <li><strong>Full Title Visibility:</strong> No more "..." on long names! Exercise titles now wrap fully so you can see every detail.</li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-emerald-500/20 shadow-lg shadow-emerald-900/10">
              <h5 className="font-semibold text-emerald-400 flex items-center gap-2 mb-1">
                🎨 Vibrant Exercise Library
              </h5>
              <p className="text-gray-300 mb-2">
                We've brought more life to the Exercises page with a professional gym feel.
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2 space-y-1">
                <li><strong>Category Backgrounds:</strong> Each exercise type now has a faded, high-quality background photo to make the page pop.</li>
                <li><strong>Sleek Icons:</strong> Updated dozens of icons (like the new Slide Board icon) for better clarity and style.</li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-gray-700">
              <h5 className="font-semibold text-white flex items-center gap-2 mb-1">
                🔔 Timer Sound &amp; Vibration
              </h5>
              <p className="text-gray-300 mb-2">
                The sound and vibration alerts now actually fire when your rest timer ends!
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2">
                <li>Triple-beep sound generated via Web Audio API (no audio file needed)</li>
                <li>Short-short-long vibration pattern on Android devices</li>
                <li>Toggle both independently in <strong>Settings → Timer Notifications</strong></li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-gray-700">
              <h5 className="font-semibold text-white flex items-center gap-2 mb-1">
                ⏱️ Custom Rest Timer Duration
              </h5>
              <p className="text-gray-300 mb-2">
                Set exactly how long your rest timer should run.
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2">
                <li>Presets: 10s, 15s, 30s, 45s, 50s, 60s</li>
                <li>Custom: enter any value from 5s up to 10 minutes</li>
                <li>Found in <strong>Settings → Timer Notifications → Default Rest Timer Duration</strong></li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-gray-700">
              <h5 className="font-semibold text-white flex items-center gap-2 mb-1">
                🔐 Google Sign-In &amp; Password Reset
              </h5>
              <p className="text-gray-300 mb-2">
                Full authentication overhaul with multiple sign-in options.
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2">
                <li>Sign in with your Google account for one-tap login</li>
                <li>Forgot password? Use the link on the Login screen to reset via email</li>
                <li>Settings → Account shows whether you're signed in via Google or Email</li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-gray-700">
              <h5 className="font-semibold text-white flex items-center gap-2 mb-1">
                📱 Mobile Responsiveness Fixes
              </h5>
              <p className="text-gray-300 mb-2">
                Several pages have been updated to display correctly on all screen sizes.
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2">
                <li><strong>Home screen:</strong> All header icons now fit without horizontal scrolling</li>
                <li><strong>Stats page:</strong> Workout card action buttons are on their own row — no overflow</li>
                <li><strong>Stats filter bar:</strong> Wraps naturally on small screens</li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-gray-700">
              <h5 className="font-semibold text-white flex items-center gap-2 mb-1">
                📈 Progressive Overload Tracker
              </h5>
              <p className="text-gray-300 mb-2">
                Visualize your strength journey! Go to the <strong>Exercises</strong> page and click the chart icon 📊 on any exercise card.
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2">
                <li>View your personal bests (Heaviest Weight, Best 1RM)</li>
                <li>See a graph of your performance over time</li>
                <li>Analyze trend indicators to see if you're improving</li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-gray-700">
              <h5 className="font-semibold text-white flex items-center gap-2 mb-1">
                🏆 PR Notifications &amp; Badges
              </h5>
              <p className="text-gray-300 mb-2">
                Every time you hit a new Personal Record, we celebrate with you!
              </p>
              <ul className="list-disc list-inside text-gray-400 pl-2">
                <li><strong>Instant Feedback:</strong> Confetti celebration when you log a PR set</li>
                <li><strong>Achievements Profile:</strong> Check <strong>Settings → Achievements &amp; PRs</strong></li>
                <li><strong>Types:</strong> Heaviest Weight, Best Estimated 1RM, Highest Volume</li>
              </ul>
            </div>

            <div className="bg-gym-card/40 p-3 rounded-lg border border-gray-700">
              <h5 className="font-semibold text-white flex items-center gap-2 mb-1">
                📊 Dashboard Widgets
              </h5>
              <p className="text-gray-300">
                Summary widgets on the <strong>Home</strong> screen give you a quick snapshot of your weekly and monthly performance, including total volume lifted and workout consistency.
              </p>
            </div>
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
      title="Home Help"
    />
  );
};

export default HomeHelpPopup;
