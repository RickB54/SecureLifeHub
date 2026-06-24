
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "Welcome to GymDayFitTracker!",
        content: "This guide will walk you through the main features of the app. Use the arrows at the bottom to navigate through the topics."
    },
    {
        title: "✨ NEW: AI Workout Generator",
        content: "Our flagship AI feature just got a massive visual overhaul!\n\n• High-End Redesign: Cinematic gym backgrounds for goals.\n• Equipment Accordions: Collapsible categories for faster selection.\n• Specialty Gear: Support for slide boards, pulleys, and more.\n\nHow to use:\n1. Tap '✨ AI Plan' on Home or Custom Plans\n2. Experience our new visual step-by-step flow\n3. Generate your professional program instantly!\n\nLook for the ✨ AI Generated badge on your saved plans!"
    },
    {
        title: "🏗️ Enhanced Plan Builder",
        content: "Managing your routines is now faster and more intuitive.\n\n• Drag-to-Reorder: Use the ⠿ handle to shift exercises.\n• Inline Day Preview: Tap any day in your plans list to see exercises immediately.\n• Full Wrapping: Long exercise titles are now fully visible—no more '...' truncation!"
    },
    {
        title: "🎨 Vibrant Exercise Library",
        content: "The exercise page now feels alive with professional gym imagery!\n\n• Category Backgrounds: Weights, Cardio, and Bodyweight sections now feature HD faded backgrounds.\n• Updated Icons: Modern, realistic icons for specialized equipment like Slide Boards.\n• Advanced Filtering: Mix muscle groups and gear seamlessly."
    },
    {
        title: "Starting a Quick Workout",
        content: "The colored cards on the home page let you quickly start a workout based on an equipment category:\n\n- Standard Weights, Slide Board, Cardio, No Equipment: Tapping one of these will take you to a list of exercises filtered by that category. You can then select exercises to build a workout for the day.\n\nThis is great for when you know exactly what type of workout you want to do."
    },
    {
        title: "Monitoring Progress",
        content: "Track your journey with professional tools:\n\n• Stats Dashboard: View volume, consistency, and workout history.\n• Body Metrics: Log measurements and view progress graphs.\n• PR Notifications: Get celebrated when you hit new Personal Records!"
    },
    {
        title: "Cloud Sync & Setup",
        content: "To get started:\n1. Sync your smartwatch in Settings for automatic calorie/heart rate tracking.\n2. Enable 'Cloud Sync' to keep your plans safe and available on all devices.\n3. Log your first workout and watch your stats grow!\n\nEnjoy your fitness journey!"
    }
];

const HelpPopup = ({ isOpen, onClose }: HelpPopupProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const page = helpPages[currentPage];

  // Reset scroll to top when page changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < helpPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleClose = () => {
    setCurrentPage(0);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="mx-auto bg-[#0f172a] text-white border-0 sm:border border-white/10 p-0 overflow-hidden flex flex-col shadow-2xl w-full h-[100dvh] sm:h-[580px] sm:max-w-md sm:rounded-2xl"
      >
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between bg-[#0f172a] z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
              <span className="text-sm font-black italic">?</span>
            </div>
            <DialogTitle className="text-lg font-black tracking-tight text-white leading-tight">
              {page.title}
            </DialogTitle>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
        >
          <div className="space-y-4 animate-fadeIn">
            <p className="whitespace-pre-wrap text-sm text-gray-300 font-medium leading-relaxed">
              {page.content}
            </p>
          </div>
        </div>
        
        {/* Fixed Footer Navigation */}
        <div className="p-4 px-6 border-t border-white/5 flex justify-between items-center bg-[#0f172a]/80 backdrop-blur-sm shrink-0 h-20 pb-safe-offset-4">
          <Button 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={currentPage === 0}
            className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-20 transition-all font-bold text-xs uppercase tracking-widest h-11 px-4 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
            Prev
          </Button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5">
            {helpPages.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentPage ? 'w-5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'w-1.5 bg-white/10'
                }`}
              />
            ))}
          </div>

          {currentPage < helpPages.length - 1 ? (
              <Button 
                variant="ghost" 
                onClick={handleNext}
                className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-20 transition-all font-bold text-xs uppercase tracking-widest h-11 px-4 rounded-xl hover:bg-white/5"
              >
                  Next
                  <ArrowRight className="h-5 w-5" />
              </Button>
          ) : (
              <Button 
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-5 h-11 rounded-xl shadow-lg shadow-blue-900/40"
              >
                  Close
              </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpPopup;
