
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/gdft/components/ui/dialog';
import { Button } from '@/components/gdft/components/ui/button';
import { X, Watch } from 'lucide-react';

interface SmartwatchSyncHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSettings: () => void;
}

const SmartwatchSyncHelpPopup = ({ isOpen, onClose, onGoToSettings }: SmartwatchSyncHelpPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gym-dark-card border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Watch className="h-5 w-5 text-blue-400" />
              About Smartwatch Sync
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-gray-300">
          <p>
            This app syncs your workouts from your smartwatch using Google Fit or Samsung Health via Health Connect.
          </p>
          
          <p>
            Automatically pull in calories, heart rate, steps, duration, distance & more — right into your Stats.
          </p>

          <div className="bg-gym-darker p-3 rounded-lg">
            <h4 className="font-semibold text-white mb-2">What Gets Synced:</h4>
            <ul className="text-sm space-y-1">
              <li>• Calories burned</li>
              <li>• Average & maximum heart rate</li>
              <li>• Steps count</li>
              <li>• Workout duration</li>
              <li>• Distance & speed (for cardio)</li>
            </ul>
          </div>

          <Button 
            onClick={onGoToSettings}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Go to Smartwatch Sync Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartwatchSyncHelpPopup;
