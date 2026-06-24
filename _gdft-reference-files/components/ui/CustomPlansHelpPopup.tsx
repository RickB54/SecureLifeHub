
import React from 'react';
import { ModernHelpDialog } from './ModernHelpDialog';

interface CustomPlansHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomPlansHelpPopup: React.FC<CustomPlansHelpPopupProps> = ({ isOpen, onClose }) => {
  const helpPages = [
    {
      title: "🏢 Custom Gym Setup (NEW!)",
      content: (
        <div className="space-y-4">
          <p className="text-emerald-400 font-bold">
            Map your training environment to generate plans that fit your EXACT equipment!
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">1. Choose Gym Type:</h4>
            <ul className="space-y-1 list-disc list-inside text-sm">
              <li><strong className="text-blue-400">Official Gym:</strong> For commercial clubs or professional centers. Includes fields for location/address.</li>
              <li><strong className="text-emerald-400">Home Setup:</strong> For your personal garage, basement, or living room. A simplified layout for private training.</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">2. Map Your Zones:</h4>
            <p className="text-sm mb-2">Divide your gym into "Sections" (e.g., Free Weights, Cardio Zone, Rack Area). You can even add photos of each zone!</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">3. Add Equipment:</h4>
            <ul className="space-y-1 list-disc list-inside text-sm">
              <li>Add the machines and weights you actually have.</li>
              <li>Upload photos of your equipment for easy recognition.</li>
              <li><strong>Link to Library:</strong> Assign existing exercise patterns or create custom movements based on your unique gear.</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">4. Build Workouts:</h4>
            <p className="text-sm">Once mapped, use the <strong>"Build Mode"</strong> to select from your gym's catalog and automatically create routines that use only the equipment available in that specific gym!</p>
          </div>

          <p className="text-cyan-400 text-xs italic">
            💡 Tap the "Gym Setup" button on the Plans page to start mapping!
          </p>
        </div>
      )
    },
    {
      title: "✨ AI Workout Generator",
      content: (
        <div className="space-y-4">
          <p className="text-blue-300 font-semibold">
            Generate personalized workout plans using AI - like having a professional trainer in your pocket!
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">How to Generate:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Click the <strong className="text-blue-400">✨ AI Plan</strong> button</li>
              <li><strong>Step 1:</strong> Choose your goal with our new <strong>high-end visual cards</strong></li>
              <li><strong>Step 2:</strong> Select equipment using our new <strong>collapsible accordions</strong> (grouped by gym, cardio, specialty, etc.)</li>
              <li><strong>Step 3:</strong> Set frequency (2-6 days/week) and duration (15-120 min)</li>
              <li>Optionally add injuries/restrictions for safe programming</li>
              <li>Click "Generate Plan" for a professional program instantly!</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">After Generation:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong className="text-blue-400">🏋️ Start First Day:</strong> Begin working out immediately!</li>
              <li><strong className="text-green-400">💾 Save to My Plans:</strong> Store for later use</li>
              <li><strong>🔄 Start Over:</strong> Generate a different plan</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">AI Badge:</h4>
            <p className="text-sm">
              Look for the <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">✨ AI Generated</span> badge 
              on plans created by AI to easily distinguish them from manual plans.
            </p>
          </div>
          
          <p className="text-purple-400 text-sm">
            💡 Pro Tip: The AI uses your profile data (age, weight, history) for more accurate recommendations!
          </p>
        </div>
      )
    },
    {
      title: "Custom Workout Plans",
      content: (
        <div className="space-y-4">
          <p>
            Create, save, and reuse personalized workout routines tailored to your fitness goals.
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Plan Types:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong className="text-purple-400">✨ AI-Generated Plans:</strong> Professionally programmed by AI</li>
              <li><strong>Custom Plans:</strong> Your personally created workout routines</li>
              <li><strong>Saved Templates:</strong> Pre-built plans for common goals</li>
              <li><strong>Workout History:</strong> Convert past workouts into reusable plans</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Finding Your Plans:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Tap the <strong>Plans icon (📋)</strong> in the bottom navigation</li>
              <li>Click <strong>"My Plans"</strong> button in the top right</li>
              <li>After saving an AI plan, the dialog opens automatically</li>
              <li>AI plans are marked with the ✨ badge</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Creating Manual Plans:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Choose a plan name and category</li>
              <li>Add exercises from your exercise database</li>
              <li>Set default sets, reps, and weights</li>
              <li>Include rest periods and notes</li>
              <li>Save for future use</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Using & Managing Plans",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Starting a Plan:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Select any saved plan from your library</li>
              <li>Choose a specific workout day</li>
              <li>Click <strong className="text-blue-400">"Perform"</strong> to start the workout</li>
              <li>All exercises are pre-filled with sets, reps, and weights</li>
              <li>Track progress in real-time during your workout</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Advanced Plan Management:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Drag-to-Reorder:</strong> Use the ⠿ handle on the left of any exercise to move it. Reordering updates exercise numbers automatically!</li>
              <li><strong>Inline Day Preview:</strong> In "My Plans", tap any day row (e.g., "Day 1") to instantly expand a list of its exercises without leaving the dialog.</li>
              <li><strong>Edit:</strong> Modify exercises, sets, or weights (works for both AI and manual plans)</li>
              <li><strong>Full Wrapping:</strong> Long exercise titles now wrap onto multiple lines so they are always readable.</li>
              <li><strong>Delete:</strong> Remove unused plans permanently</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Full App Integration:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Workout Tracking:</strong> Track sets, reps, weights, and PRs</li>
              <li><strong>Progress Photos:</strong> Take pics during workouts</li>
              <li><strong>Health Metrics:</strong> Automatic calorie and step tracking</li>
              <li><strong>Smartwatch Sync:</strong> Heart rate and activity data</li>
              <li><strong>Statistics:</strong> View progress graphs and charts</li>
              <li><strong>Cloud Sync:</strong> All plans available on all devices</li>
            </ul>
          </div>
          
          <p className="text-purple-400">
            💡 Pro Tip: AI plans work with ALL app features - tracking, PRs, health metrics, and more!
          </p>
        </div>
      )
    },
    {
      title: "AI Plan Features",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">What AI Plans Include:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Descriptive Name:</strong> E.g., "Intermediate Hypertrophy Split"</li>
              <li><strong>Program Summary:</strong> Overview of training methodology</li>
              <li><strong>Training Tips:</strong> Professional coaching advice</li>
              <li><strong>Complete Schedule:</strong> Multiple workout days per week</li>
              <li><strong>Exercise Details:</strong> Sets, reps, rest periods, form cues</li>
              <li><strong>Smart Exercise Selection:</strong> Based on your equipment and goals</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Professional Programming:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Evidence-based progressive overload principles</li>
              <li>Appropriate training volume for your level</li>
              <li>Optimized rest periods</li>
              <li>Exercise selection based on goals and equipment</li>
              <li>Injury accommodation when specified</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Customization Options:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Goal:</strong> Muscle gain, strength, fat loss, endurance, general health</li>
              <li><strong>Level:</strong> Beginner (0-1 years), Intermediate (1-3 years), Advanced (3+ years)</li>
              <li><strong>Equipment:</strong> Full gym, home gym, dumbbells, bodyweight, bands, kettlebells</li>
              <li><strong>Frequency:</strong> 2-6 days per week</li>
              <li><strong>Duration:</strong> 15-120 minutes per session</li>
              <li><strong>Injuries:</strong> Optional restriction input</li>
            </ul>
          </div>
          
          <p className="text-green-400 text-sm">
            ✅ Your AI plans are saved to the cloud and sync across all devices!
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
      title="Custom Plans Help"
    />
  );
};

export default CustomPlansHelpPopup;
