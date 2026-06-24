import React from 'react';
import { ModernHelpDialog } from './ModernHelpDialog';

interface MetricHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: string;
}

export const MetricHelpDialog: React.FC<MetricHelpDialogProps> = ({ isOpen, onClose, metricType }) => {
  const getHelpPages = () => {
    switch (metricType) {
      case 'bloodPressure':
        return [
          {
            title: "Blood Pressure",
            content: (
              <div className="space-y-4">
                <p>Blood pressure is a vital sign that measures the force of blood against your artery walls.</p>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Understanding the Numbers:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>Systolic (Top Number):</strong> Pressure when heart beats</li>
                    <li><strong>Diastolic (Bottom Number):</strong> Pressure between beats</li>
                  </ul>
                </div>
              </div>
            )
          },
          {
            title: "How to Use",
            content: (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Entering Measurements:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Enter Systolic pressure in the top field (e.g., 120)</li>
                    <li>Enter Diastolic pressure in the bottom field (e.g., 80)</li>
                    <li>Units are in mmHg (millimeters of mercury)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Data Source:</h4>
                  <p>❌ Cannot be synced via smartwatch</p>
                  <p>✅ Manual entry required</p>
                </div>
              </div>
            )
          }
        ];
      
      case 'heartRate':
        return [
          {
            title: "Heart Rate",
            content: (
              <div className="space-y-4">
                <p>Heart rate measures how many times your heart beats per minute (BPM).</p>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Types of Measurements:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>Average Heart Rate:</strong> Your typical BPM during activity</li>
                    <li><strong>Maximum Heart Rate:</strong> Highest BPM reached</li>
                  </ul>
                </div>
              </div>
            )
          },
          {
            title: "How to Use",
            content: (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Recording Heart Rate:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Enter Average Heart Rate in BPM</li>
                    <li>Enter Maximum Heart Rate in BPM</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Data Source:</h4>
                  <p>✅ Can be synced via smartwatch</p>
                  <p>✅ Manual entry available</p>
                </div>
              </div>
            )
          }
        ];
      
      // Add cases for other metrics
      
      default:
        // Return a default help page to prevent undefined error
        return [
          {
            title: "Health Metric Information",
            content: (
              <div className="space-y-4">
                <p>Information about this health metric is coming soon.</p>
              </div>
            )
          }
        ];
    }
  };

  return (
    <ModernHelpDialog
      isOpen={isOpen}
      onClose={onClose}
      pages={getHelpPages()}
      title={`${metricType} Help`}
    />
  );
};