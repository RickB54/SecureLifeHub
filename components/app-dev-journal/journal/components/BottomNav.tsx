// @ts-nocheck
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Lightbulb, Star, Settings, Home, Cloud, X, HelpCircle, ArrowUpDown, EyeOff } from 'lucide-react';


interface BottomNavProps {
  onNavChange: (nav: string) => void;
  currentView: string;
  }

export default function BottomNav({ onNavChange, currentView }: BottomNavProps) {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-journal-cover text-primary-foreground border-t border-border journal-bottom-nav">
        <div className="max-w-6xl mx-auto grid grid-cols-6 items-center">
          <Button variant="ghost"
            aria-current={currentView === 'projects' ? 'page' : undefined} onClick={() => onNavChange('projects')}
            className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Button>
          
          <Button variant="ghost"
            aria-current={currentView === 'todo' ? 'page' : undefined} onClick={() => onNavChange('todo')}
            className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          >
            <Calendar size={20} />
            <span className="text-xs mt-1">To-Do</span>
          </Button>
          
          <Button variant="ghost"
            aria-current={currentView === 'ideas' ? 'page' : undefined} onClick={() => onNavChange('ideas')}
            className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          >
            <Lightbulb size={20} />
            <span className="text-xs mt-1">Ideas</span>
          </Button>
          
          <Button variant="ghost"
            aria-current={currentView === 'favorites' ? 'page' : undefined} onClick={() => onNavChange('favorites')}
            className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          >
            <Star size={20} />
            <span className="text-xs mt-1">Favorites</span>
          </Button>
          
          <Button variant="ghost" aria-current={currentView === 'hidden' ? 'page' : undefined} onClick={() => onNavChange('hidden')} className="flex flex-col items-center h-auto py-1 px-0 min-w-0 text-muted-foreground hover:bg-journal-cover hover:text-journal-label" aria-label="Hidden"><EyeOff size={20} /><span className="text-xs mt-1">Hidden</span></Button>
          <Button variant="ghost"
            aria-current={currentView === 'settings' ? 'page' : undefined} onClick={() => onNavChange('settings')}
            className="flex flex-col items-center h-auto py-1 text-muted-foreground hover:bg-journal-cover hover:text-journal-label focus-visible:bg-journal-cover px-0 min-w-0"
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Settings</span>
          </Button>

        </div>
      </nav>

    </>
  );
}
