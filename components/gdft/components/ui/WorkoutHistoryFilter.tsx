import React, { useState } from 'react';
import { Button } from '@/components/gdft/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/gdft/components/ui/popover';
import { Calendar } from '@/components/gdft/components/ui/calendar';
import { Switch } from '@/components/gdft/components/ui/switch';
import { Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface WorkoutHistoryFilterProps {
  filterType: 'day' | 'week' | 'month' | 'year' | 'all';
  onFilterChange: (type: 'day' | 'week' | 'month' | 'year' | 'all') => void;
  showArchived: boolean;
  onShowArchivedChange: (val: boolean) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function WorkoutHistoryFilter({
  filterType,
  onFilterChange,
  showArchived,
  onShowArchivedChange,
  dateRange,
  onDateRangeChange,
  className
}: WorkoutHistoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilterType, setTempFilterType] = useState(filterType);
  const [tempShowArchived, setTempShowArchived] = useState(showArchived);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempFilterType(filterType);
      setTempShowArchived(showArchived);
      setTempDateRange(dateRange);
    }
    setIsOpen(open);
  };

  const handleApply = () => {
    onFilterChange(tempFilterType);
    onShowArchivedChange(tempShowArchived);
    onDateRangeChange(tempDateRange);
    setIsOpen(false);
  };

  const setQuickFilter = (type: 'all' | 'day' | 'week' | 'month') => {
    setTempFilterType(type);
    setTempDateRange(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`bg-gym-card border-none hover:bg-white/5 h-10 rounded-xl text-xs font-bold uppercase tracking-wider ${className || ''}`}>
          <Filter className="h-4 w-4 mr-2 text-gym-blue" />
          Filter Data
          {(filterType !== 'all' || dateRange?.from || showArchived) && (
            <span className="ml-2 bg-gym-blue text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-black">!</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-5 bg-[#141416] border-white/10 rounded-2xl shadow-2xl z-50 text-white" align="end">
        <div className="space-y-6">
          
          {/* Show Archived Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">Show Archived</span>
            <Switch 
              checked={tempShowArchived} 
              onCheckedChange={setTempShowArchived} 
            />
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Quick Filters</span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'day', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' }
              ].map((qf) => (
                <Button 
                  key={qf.id}
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickFilter(qf.id as any)}
                  className={`h-11 rounded-xl font-bold ${tempFilterType === qf.id && !tempDateRange ? 'bg-gym-card border-gym-blue text-white shadow-lg shadow-blue-900/20' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {qf.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Range */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Custom Range</span>
            <div className="bg-[#18181c] rounded-xl border border-white/5 overflow-hidden">
              <Calendar
                mode="range"
                selected={tempDateRange}
                onSelect={(range) => {
                  setTempDateRange(range);
                  if (range?.from) setTempFilterType('all');
                }}
                className="bg-transparent text-white flex justify-center p-3"
              />
            </div>
          </div>

          {/* Apply Button */}
          <Button 
            className="w-full bg-[#d9463e] hover:bg-[#b93830] text-white font-bold rounded-xl h-11 text-base mt-2 transition-colors"
            onClick={handleApply}
          >
            <Filter className="h-5 w-5 mr-2" /> Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
