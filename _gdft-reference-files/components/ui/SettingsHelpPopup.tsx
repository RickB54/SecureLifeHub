
import React from 'react';
import { ModernHelpDialog } from './ModernHelpDialog';
import { Sparkles, Mic } from 'lucide-react';

interface SettingsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

const SettingsHelpPopup: React.FC<SettingsHelpPopupProps> = ({ isOpen, onClose, initialPage = 0 }) => {
  const helpPages = [
    {
      title: "Account & Profile",
      content: (
        <div className="space-y-4">
          <div className="bg-gym-blue/10 p-4 rounded-xl border border-gym-blue/20 mb-4">
             <p className="text-sm font-medium leading-relaxed">
               Manage your security credentials and personalization settings in one place.
             </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-1">Passowrd Management</h4>
            <p className="text-sm text-gray-400">
              You can now update your security password directly from the Account section without leaving the app.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Sign-In Methods:</h4>
            <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
              <li><strong>Google Auth:</strong> Secure one-tap login. Linked to your Google identity.</li>
              <li><strong>Email Auth:</strong> Traditional credentials. Always keep your recovery email updated.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Data Privacy:</h4>
            <p className="text-sm text-gray-400">
              Your workouts are isolated via Supabase Row Level Security. No other users can access your performance data.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Achievements & PRs",
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 mb-4">
            <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">Automated Intelligence</p>
            <p className="text-sm font-medium leading-relaxed">
              This system is <strong>100% automatic</strong>. It constantly scans your database for breakthrough performances.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
                Heaviest Weight
              </h4>
              <p className="text-xs text-gray-400">The maximum load ever successfully logged for a specific exercise.</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
                Best Estimated 1RM
              </h4>
              <p className="text-xs text-gray-400">Calculated via Epley formula: <strong>Weight × (1 + Reps/30)</strong>. This predicts your total raw strength capacity.</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
                Highest Volume
              </h4>
              <p className="text-xs text-gray-400">The total work done in a single set <strong>(Weight × Reps)</strong>. Tracks your peak muscular endurance.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Analytics & Benchmarks",
      content: (
        <div className="space-y-4">
          <div className="bg-gym-blue/10 p-4 rounded-xl border border-gym-blue/20 mb-4">
             <p className="text-sm font-medium leading-relaxed">
               Benchmarks are your <strong>Intelligence Layer</strong>. They serve as your personal "Standard of Excellence."
             </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-1">Smart Defaults (The Benchmark Secret)</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              <strong>How it works:</strong> When you input a <em>Target weight</em> or <em>Target reps</em> in the Benchmark chart, you're not just setting a goal — you're setting a starting point. 
              Every time you start this specific exercise in a workout, your sets will <strong>automatically pre-populate</strong> with these values. No more tedious typing; just jump straight into your set and try to beat your own benchmark.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-1">Performance Insight & Personalization</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-2">
              The <strong>Performance Insight</strong> section analyzes your historical data trends (like recovery and volume) to provide metabolic suggestions.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Use the <strong>Personalize Plan</strong> feature to immediately feed these insights into the AI Workout Architect, ensuring your routine evolves as you do.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Performance & Timers",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Customize your rest experience to maintain high intensity during training.
          </p>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1">Rest Timer Presets</h4>
              <p className="text-xs text-gray-400">Tap 10s, 30s, or 60s for instant activation. Set "Custom" timers up to 10 minutes for long recoveries.</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1">Global Controls</h4>
              <p className="text-xs text-gray-400">Switch between Metric (kg) and Imperial (lbs) units globally. Toggle Haptic Feedback (Vibration) and Audio Chimes for a distraction-free environment.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Data & Diagnostics",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1 text-sm">Backup & Exercises Data</h4>
              <p className="text-xs text-gray-400">
                <strong>Safety:</strong> Export your progress to JSON for local backups. 
                <strong>Utility:</strong> Use "Library Utility" to reset factory exercises or prune unused data to keep the app snappy.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1 text-sm">Smartwatch Ecosystem</h4>
              <p className="text-xs text-gray-400">Integrates with Galaxy Watch/Health Connect. Enable 24/7 background sync to keep your Vitals, Sleep, and Stress levels updated in the health Hub.</p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 mt-2">
              <h4 className="font-semibold text-red-400 mb-1 text-sm">Testing Override Mode</h4>
              <p className="text-xs text-gray-400">
                <strong>Diagnostic Use Only:</strong> This mode allows you to simulate data (Steps, Duration, Calories) to see how the app handles edge cases and target goals without muddying your actual training history.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Danger Zone & Data Purge",
      content: (
        <div className="space-y-4 text-xs">
          <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 mb-4">
            <p className="font-black text-red-500 uppercase tracking-widest mb-1">Irreversible Actions</p>
            <p className="text-gray-300 leading-relaxed font-medium">
              These tools manage your cloud and local storage. Most actions here are **permanent** and cannot be undone.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1 uppercase tracking-tighter">1. Wipe Local Storage Only</h4>
              <p className="text-gray-400">Clears the temporary cache on this specific device. Your cloud data and exercises are 100% safe.</p>
            </div>
            
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1 uppercase tracking-tighter">2. Granular Cloud Purge</h4>
              <p className="text-gray-400 leading-relaxed">
                • <strong>History:</strong> Wipes all past logged workouts and sets.<br/>
                • <strong>Analytics:</strong> Clears Body Weight, Measurements, and Health Metrics.<br/>
                • <strong>Stats:</strong> Resets all Personal Records (PRs) back to zero.<br/>
                • <strong>Plans:</strong> Removes all manual and AI workout plans.
              </p>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1 uppercase tracking-tighter text-amber-500">3. Custom Exercises Only</h4>
              <p className="text-gray-400">Identifies and removes only the exercises you added yourself. The default GymDay library stays untouched.</p>
            </div>

            <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 font-medium">
              <h4 className="font-black text-red-500 mb-1 uppercase tracking-tighter">4. Full Cloud Reset</h4>
              <p className="text-gray-300">Resets your entire account activity (History, Stats, Plans, Metrics) but **explicitly keeps your Exercise library** safe.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Beta Tester Program",
      content: (
        <div className="space-y-4">
          <div className="bg-gym-blue/10 p-4 rounded-xl border border-gym-blue/20 mb-4">
            <h4 className="font-black text-gym-blue uppercase tracking-widest text-xs mb-1 italic flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Join The Future
            </h4>
            <p className="text-sm font-medium leading-relaxed">
              Become part of the elite GymDay community by applying for our Early Access Program.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="font-bold text-white mb-2 uppercase tracking-tighter text-xs">The Submission Workflow</h4>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed font-medium">
                To guarantee your application reaches us regardless of device security settings, we use a <strong>Fail-Safe 4-Step Process</strong>:
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xs">1</div>
                  <p className="text-xs text-gray-300 leading-relaxed"><strong className="text-white">Form Submission:</strong> Enter your name, email, and vision for the app.</p>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-gym-blue/20 border border-gym-blue/30 flex items-center justify-center font-black text-gym-blue text-xs animate-pulse">2</div>
                  <p className="text-xs text-gray-300 leading-relaxed"><strong className="text-white">Clipboard Recording:</strong> Hitting <em>Submit</em> instantly saves your application to the local roster and <strong>copies the text to your clipboard</strong>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xs">3</div>
                  <p className="text-xs text-gray-300 leading-relaxed"><strong className="text-white">Manual Paste:</strong> Open your Gmail or favorite mail app. Paste <strong>(CTRL+V)</strong> the application into a new message.</p>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-xs">4</div>
                  <p className="text-xs text-gray-300 leading-relaxed"><strong className="text-white">Dispatch to Rick:</strong> Send the email to <strong>RicksAppServices@gmail.com</strong>. You'll receive a notification once received!</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase italic">
                Thank you for helping us push the boundaries of fitness tracking!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Voice Logging & Commands",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mb-4">
             <h4 className="font-black text-blue-400 uppercase tracking-widest text-xs mb-1 italic flex items-center gap-2">
               <Mic className="h-4 w-4" /> Hands-Free Tracking
             </h4>
             <p className="text-sm font-medium leading-relaxed">
               Log your entire workout without ever touching the screen. Use natural voice commands to track sets and navigate.
             </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1 uppercase tracking-tighter text-xs">Logging Sets</h4>
              <p className="text-xs text-gray-400 font-medium">"one twenty-five for eight" <span className="text-gray-600 ml-1">→</span> <span className="text-blue-400 ml-1">Adds 125 lbs × 8 reps</span></p>
              <p className="text-xs text-gray-400 font-medium mt-1">"sixty-five for ten" <span className="text-gray-600 ml-1">→</span> <span className="text-blue-400 ml-1">Adds 65 lbs × 10 reps</span></p>
            </div>
            
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1 uppercase tracking-tighter text-xs">Navigation & Timers</h4>
              <p className="text-xs text-gray-400 font-medium">"next exercise" <span className="text-gray-600 ml-1">→</span> <span className="text-emerald-400 ml-1">Jump to next movement</span></p>
              <p className="text-xs text-gray-400 font-medium mt-1">"rest forty-five" <span className="text-gray-600 ml-1">→</span> <span className="text-amber-400 ml-1">Starts 45s timer</span></p>
              <p className="text-xs text-gray-400 font-medium mt-1">"finish set" <span className="text-gray-600 ml-1">→</span> <span className="text-gym-green ml-1">Marks current set as done</span></p>
            </div>

            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
              <h4 className="font-bold text-red-400 mb-0.5 uppercase tracking-tighter text-[10px]">Correction Commands</h4>
              <p className="text-[10px] text-gray-500 leading-tight">"cancel input" or "discard set" will clear the current recognition if you make a mistake.</p>
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
      title="Master Settings Guide"
      initialPageIndex={initialPage}
    />
  );
};

export default SettingsHelpPopup;
