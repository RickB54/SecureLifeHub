import React, { useState } from 'react';
import { Button } from '@/components/gdft/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/gdft/components/ui/popover';
import { Calendar } from '@/components/gdft/components/ui/calendar';
import { Switch } from '@/components/gdft/components/ui/switch';
import { Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface WorkoutHistoryFilterProps {
  filterType: string;
  onFilterChange: (type: string) => void;
  showArchived: 'live' | 'archived' | 'both';
  onShowArchivedChange: (val: 'live' | 'archived' | 'both') => void;
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

  const setQuickFilter = (type: string) => {
    setTempFilterType(type);
    setTempDateRange(undefined);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFilterChange('all');
    onShowArchivedChange('live');
    onDateRangeChange(undefined);
    setTempFilterType('all');
    setTempShowArchived('live');
    setTempDateRange(undefined);
  };

  const hasActiveFilters = filterType !== 'all' || dateRange?.from || showArchived !== 'live';

  const getFilterSummary = () => {
    let summary = "";
    if (filterType === 'all') summary = "All Time";
    else if (filterType === 'week') summary = "Past Week";
    else if (filterType === 'month') summary = "Past Month";
    else if (filterType === 'year') summary = "Past Year";
    else if (filterType === 'custom' && dateRange?.from) {
      summary = format(dateRange.from, 'MMM d');
      if (dateRange.to) summary += ` - ${format(dateRange.to, 'MMM d')}`;
    } else summary = "Filter Data";
    
    const visibility = showArchived === 'both' ? 'All' : showArchived === 'archived' ? 'Archived' : 'Live';
    return `${summary} (${visibility})`;
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`bg-gym-card border-none hover:bg-white/5 h-10 rounded-xl text-xs font-bold uppercase tracking-wider ${className || ''}`}>
            <Filter className="h-4 w-4 mr-2 text-gym-blue flex-shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-[200px]">{getFilterSummary()}</span>
            {hasActiveFilters && (
              <span className="ml-2 flex-shrink-0 bg-gym-blue text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-black">!</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-4 bg-[#141416] border-white/10 rounded-2xl shadow-2xl z-50 text-white max-h-[85vh] overflow-y-auto" align="end">
        <div className="space-y-4">
          
          {/* Visibility Toggle */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Visibility</span>
            <div className="flex bg-[#18181c] rounded-xl p-1 border border-white/5">
              {(['live', 'archived', 'both'] as const).map(type => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempShowArchived(type)}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold capitalize transition-colors ${tempShowArchived === type ? 'bg-gym-card shadow-md text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Quick Filters</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'day', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'last_week', label: 'Last Week' },
                { id: 'month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'year', label: 'This Year' },
                { id: 'last_year', label: 'Last Year' }
              ].map((qf) => (
                <Button 
                  key={qf.id}
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuickFilter(qf.id as any)}
                  className={`h-9 text-xs rounded-xl font-bold ${tempFilterType === qf.id && !tempDateRange ? 'bg-gym-card border-gym-blue text-white shadow-lg shadow-blue-900/20' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {qf.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Range */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Custom Range</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold uppercase">From</span>
                <input
                  type="date"
                  value={tempDateRange?.from ? format(tempDateRange.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const newFrom = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                    setTempDateRange(prev => ({ from: newFrom, to: prev?.to }));
                    setTempFilterType('all');
                  }}
                  className="w-full bg-[#18181c] border border-white/10 rounded-xl h-9 pl-10 pr-2 text-xs text-white focus:outline-none focus:border-purple-500 css-date-input"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold uppercase">To</span>
                <input
                  type="date"
                  value={tempDateRange?.to ? format(tempDateRange.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const newTo = e.target.value ? new Date(e.target.value + 'T23:59:59') : undefined;
                    setTempDateRange(prev => ({ from: prev?.from, to: newTo }));
                    setTempFilterType('all');
                  }}
                  className="w-full bg-[#18181c] border border-white/10 rounded-xl h-9 pl-7 pr-2 text-xs text-white focus:outline-none focus:border-purple-500 css-date-input"
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-10 text-sm mt-1 transition-colors shadow-lg shadow-purple-900/20"
            onClick={handleApply}
          >
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
    {hasActiveFilters && (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleClearAll}
        className="h-10 w-10 p-0 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 ml-1"
        title="Clear all filters"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
          <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </Button>
    )}
    </div>
  );
}
