
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { 
  Watch, 
  Moon, 
  Heart, 
  Wind, 
  Zap, 
  Brain, 
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';

interface SmartwatchTrendsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmartwatchTrendsHelpPopup: React.FC<SmartwatchTrendsHelpPopupProps> = ({ isOpen, onClose }) => {
  const helpSections = [
    {
      title: "Sync Intelligence",
      icon: RefreshCw,
      color: "text-blue-400",
      content: "Data on this page is primarily pulled from your connected Samsung Galaxy Watch or compatible wearables. Use the 'Sync Watch Now' button in the Health Hub to update these charts with your latest metrics."
    },
    {
      title: "Recovery Analysis",
      icon: Moon,
      color: "text-indigo-400",
      content: "The Sleep Quality loop tracks your total duration, deep sleep, and REM cycles. High deep sleep percentages (20-25%) indicate physical recovery, while REM is crucial for mental processing."
    },
    {
      title: "Cardiac Rhythm",
      icon: Heart,
      color: "text-rose-400",
      content: "View your 24-hour heart rate flux. The graph highlights Resting HR and training peaks. Consistent lowering of Resting HR over weeks is a key indicator of improved cardiovascular fitness."
    },
    {
      title: "Vital SpO2",
      icon: Wind,
      color: "text-cyan-400",
      content: "Monitor your blood oxygen saturation. Most healthy individuals maintain SpO2 levels between 95-100%. If levels stay consistently lower, it might indicate overtraining or high altitude acclimation."
    },
    {
      title: "Stress Mastery",
      icon: Brain,
      color: "text-orange-400",
      content: "Calculated via Heart Rate Variability (HRV), this chart shows how your nervous system is responding to training load and daily life. Low stress levels during rest indicate high 'Readiness' for peak performance."
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gym-darker border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Watch className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                Trend <span className="text-purple-400 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Analysis</span> Help
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-gray-400 font-medium">
            Unlock the secrets of your physiological data for peak fitness performance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Sample Data Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 font-medium">
              <strong className="text-amber-400">Note:</strong> If you haven't synced your watch yet, the dashboard displays 
              <span className="text-white"> Sample Data </span> to show you the analytical depth available once your device is connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpSections.map((section, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                  <h4 className="font-bold text-white text-sm">{section.title}</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10">
            <h4 className="flex items-center gap-2 font-black text-white mb-2 italic">
              <TrendingUp className="h-4 w-4 text-purple-400" /> PRO TIP: PERFORMANCE CORRELATION
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Use the 'Ecosystem Links' on the main page to compare your <strong>Sleep Trends</strong> with your <strong>Strength Stats</strong>. Recovery is where the progress happens—if your sleep quality dips, consider scaling back the intensity of your next workout.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-white text-gym-dark font-black px-8">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartwatchTrendsHelpPopup;
