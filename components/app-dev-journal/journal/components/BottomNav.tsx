// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Lightbulb, Star, Settings, Home, EyeOff, ClipboardList } from 'lucide-react';

interface BottomNavProps {
  onNavChange: (nav: string) => void;
  currentView: string;
}

export default function BottomNav({ onNavChange, currentView }: BottomNavProps) {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  useEffect(() => {
    const handleTrackerState = (e: any) => {
      setIsTrackerOpen(Boolean(e?.detail?.isOpen));
    };
    const handleTrackerOpen = () => setIsTrackerOpen(true);
    const handleTrackerClose = () => setIsTrackerOpen(false);

    window.addEventListener('slh_tracker_state_changed', handleTrackerState);
    window.addEventListener('slh_open_ag_tracker', handleTrackerOpen);
    window.addEventListener('slh_close_ag_tracker', handleTrackerClose);

    return () => {
      window.removeEventListener('slh_tracker_state_changed', handleTrackerState);
      window.removeEventListener('slh_open_ag_tracker', handleTrackerOpen);
      window.removeEventListener('slh_close_ag_tracker', handleTrackerClose);
    };
  }, []);

  const handleAgTrackerClick = () => {
    if (isTrackerOpen) return;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('slh_open_ag_tracker'));
    }
  };

  const handleViewClick = (view: string) => {
    if (isTrackerOpen && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('slh_close_ag_tracker'));
    }
    onNavChange(view);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-journal-cover text-primary-foreground border-t border-border journal-bottom-nav">
      <div className="max-w-6xl mx-auto grid grid-cols-7 items-center">
        {/* 1. Home */}
        <Button
          variant="ghost"
          aria-current={!isTrackerOpen && currentView === 'projects' ? 'page' : undefined}
          onClick={() => handleViewClick('projects')}
          className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          title="Home"
          aria-label="Home"
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Button>

        {/* 2. AG Account Tracker */}
        <Button
          variant="ghost"
          aria-current={isTrackerOpen ? 'page' : undefined}
          onClick={handleAgTrackerClick}
          className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          title="AG Account Tracker"
          aria-label="AG Account Tracker"
        >
          <ClipboardList size={20} />
          <span className="text-xs mt-1">AG Tracker</span>
        </Button>

        {/* 3. Favorites */}
        <Button
          variant="ghost"
          aria-current={!isTrackerOpen && currentView === 'favorites' ? 'page' : undefined}
          onClick={() => handleViewClick('favorites')}
          className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          title="Favorites"
          aria-label="Favorites"
        >
          <Star size={20} />
          <span className="text-xs mt-1">Favorites</span>
        </Button>

        {/* 4. Hidden */}
        <Button
          variant="ghost"
          aria-current={!isTrackerOpen && currentView === 'hidden' ? 'page' : undefined}
          onClick={() => handleViewClick('hidden')}
          className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          title="Hidden"
          aria-label="Hidden"
        >
          <EyeOff size={20} />
          <span className="text-xs mt-1">Hidden</span>
        </Button>

        {/* 5. To-Do */}
        <Button
          variant="ghost"
          aria-current={!isTrackerOpen && currentView === 'todo' ? 'page' : undefined}
          onClick={() => handleViewClick('todo')}
          className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          title="To-Do"
          aria-label="To-Do"
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">To-Do</span>
        </Button>

        {/* 6. Ideas */}
        <Button
          variant="ghost"
          aria-current={!isTrackerOpen && currentView === 'ideas' ? 'page' : undefined}
          onClick={() => handleViewClick('ideas')}
          className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          title="Ideas"
          aria-label="Ideas"
        >
          <Lightbulb size={20} />
          <span className="text-xs mt-1">Ideas</span>
        </Button>

        {/* 7. Settings */}
        <Button
          variant="ghost"
          aria-current={!isTrackerOpen && currentView === 'settings' ? 'page' : undefined}
          onClick={() => handleViewClick('settings')}
          className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={20} />
          <span className="text-xs mt-1">Settings</span>
        </Button>
      </div>
    </nav>
  );
}
