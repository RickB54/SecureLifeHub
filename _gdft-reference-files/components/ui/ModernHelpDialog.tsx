
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface HelpPage {
  title: string;
  content: React.ReactNode;
}

interface ModernHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pages: HelpPage[];
  title: string;
  initialPageIndex?: number;
}

export const ModernHelpDialog: React.FC<ModernHelpDialogProps> = ({
  isOpen,
  onClose,
  pages,
  title,
  initialPageIndex = 0
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex);
  
  // Sync page when dialog opens with a specific index
  useEffect(() => {
    if (isOpen) {
      setCurrentPageIndex(initialPageIndex);
    }
  }, [isOpen, initialPageIndex]);

  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Reset scroll to top when page changes to minimize mouse movement
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [currentPageIndex]);

  const goToPrevious = () => {
    setCurrentPageIndex(prev => Math.max(0, prev - 1));
  };
  
  const goToNext = () => {
    setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1));
  };
  
  const currentPage = pages[currentPageIndex];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="mx-auto bg-[#0f172a] text-white border-0 sm:border border-white/10 p-0 overflow-hidden flex flex-col shadow-2xl w-full h-[calc(100dvh-64px)] top-0 translate-y-0 sm:top-[50%] sm:translate-y-[-50%] sm:h-[620px] sm:max-w-md sm:rounded-2xl"
      >
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between bg-[#0f172a] z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
              <span className="text-sm font-black italic">?</span>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500/80 mb-0.5">Help Center</div>
              <DialogTitle className="text-lg font-black tracking-tight text-white leading-none">
                {currentPage.title}
              </DialogTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Scrollable Content Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
        >
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed animate-fadeIn">
            {currentPage.content}
          </div>
        </div>
        
        {/* Fixed Footer Navigation */}
        {pages.length > 1 && (
          <div className="p-4 px-6 border-t border-white/5 flex justify-between items-center bg-[#0f172a]/80 backdrop-blur-sm z-10 h-20 shrink-0 pb-safe-offset-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              disabled={currentPageIndex === 0}
              className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-20 transition-all font-bold text-xs uppercase tracking-widest h-11 px-4 rounded-xl hover:bg-white/5"
            >
              <ChevronLeft className="h-5 w-5" />
              Prev
            </Button>
            
            <div className="flex items-center gap-2">
              {pages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentPageIndex ? 'w-6 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'w-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              disabled={currentPageIndex === pages.length - 1}
              className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-20 transition-all font-bold text-xs uppercase tracking-widest h-11 px-4 rounded-xl hover:bg-white/5"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
