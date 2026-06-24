
import React from 'react';
import { ModernHelpDialog } from './ModernHelpDialog';

interface HealthMetricsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HealthMetricsHelpPopup: React.FC<HealthMetricsHelpPopupProps> = ({ isOpen, onClose }) => {
  const helpPages = [
    {
      title: "Health Metrics Dashboard",
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Primary Performance Tracking:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>🟢 <strong>Emerald Hero:</strong> Your main progress view combines watch data and manual refinement.</li>
              <li>⚡ <strong>Manual Priority:</strong> Hand-entered data (Manage & Refine) always takes precedence over watch sync for pinpoint accuracy.</li>
              <li>👟 <strong>Live Syncing:</strong> Graphs update instantly as you refine your records.</li>
              <li>🏆 <strong>Goal Targets:</strong> Circle rings reflect your progress toward personal daily goals.</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Manage & Refine Records:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Click the <strong>Manage & Refine Record</strong> button on any primary metric card.</li>
              <li>View your 1-to-1 sync comparison between Live Watch Data and Manual Overrides.</li>
              <li>Set personal goal targets directly within the refinement view.</li>
              <li>Easily copy watch values to use as a starting point for manual edits.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Smart Markers & Markers:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Add custom biological markers at the bottom of the page.</li>
              <li>Manage your data using the pencil (edit) and trash (delete) icons.</li>
              <li><strong>Deletion Safety:</strong> A warning dialog now appears before any custom marker is permanently removed.</li>
              <li>Log markers like Blood Pressure, Glucose, and Sleep quality for a full health snapshot.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Goal Celebration & Timeline:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>When your primary targets are met, the dashboard celebrates your success across the rings.</li>
              <li>Click the Health Meter or the sparkline graphs to view detailed pattern history.</li>
              <li>Switch between Day, Week, and Month views to analyze long-term patterns.</li>
            </ul>
          </div>
          
          <p className="text-cyan-400 font-bold bg-cyan-400/5 p-3 rounded-xl border border-cyan-400/10 text-sm">
            💡 Pro-Tip: Manual refinements ensure your daily history is 100% accurate, even if you weren't wearing your watch during a specific activity!
          </p>
        </div>
      )
    },
    {
      title: "Manual Health Tracking",
      content: (
        <div className="space-y-4">
          <p>
            Track additional health metrics that your smartwatch doesn't capture.
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Manual Entry Fields:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Hydration:</strong> Water intake in ml or fl oz</li>
              <li><strong>Stress:</strong> Daily stress level (1-5 scale)</li>
              <li><strong>Blood Pressure:</strong> Systolic and diastolic readings</li>
              <li><strong>Glucose:</strong> Blood sugar in mg/dL or mmol/L</li>
              <li><strong>Notes:</strong> Any additional health observations</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Data Integration:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Smartwatch data syncs automatically when available</li>
              <li>Manual entries supplement your health picture</li>
              <li>All data contributes to your overall health trends</li>
              <li>Export or backup all health data from Settings</li>
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
      title="Health Metrics Help"
    />
  );
};

export default HealthMetricsHelpPopup;
