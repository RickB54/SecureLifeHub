import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachHourOfInterval, addHours, isWithinInterval, subDays, addDays } from 'date-fns';
import { HealthMetric } from '@/lib/types';

interface TimelineData {
  time: string;
  steps: number;
  duration: number;
  calories: number;
}

interface TimelinePopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMetric: 'steps' | 'duration' | 'calories';
  data: TimelineData[];
  healthMetrics?: HealthMetric[];
  selectedDate?: Date;
  manualOverrides?: any;
  interval?: 'day' | 'week' | 'month';
  onIntervalChange?: (interval: 'day' | 'week' | 'month') => void;
  onMetricChange: (metric: 'steps' | 'duration' | 'calories') => void;
}

export const TimelinePopup: React.FC<TimelinePopupProps> = ({
  isOpen,
  onClose,
  selectedMetric,
  data: originalData,
  healthMetrics = [],
  selectedDate = new Date(),
  manualOverrides = {},
  interval = 'week',
  onIntervalChange,
  onMetricChange
}) => {
  const processedData = useMemo(() => {
    // For now, let's recalculate accurately to ensure overrides are properly merged
    let startDate: Date;
    let endDate: Date;
    let formatStr: string;
    let points: Date[];

    const activeDateStr = format(selectedDate, 'yyyy-MM-dd');

    switch (interval) {
      case 'day':
        startDate = startOfDay(selectedDate);
        endDate = endOfDay(selectedDate);
        formatStr = 'HH:mm';
        points = eachHourOfInterval({ start: startDate, end: endDate });
        break;
      case 'week':
        startDate = startOfWeek(selectedDate);
        endDate = endOfWeek(selectedDate);
        formatStr = 'EEE';
        points = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'month':
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
        formatStr = 'dd';
        points = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      default:
        return originalData;
    }

    return points.map(point => {
      const pointStr = format(point, 'yyyy-MM-dd');
      
      let steps = 0;
      let duration = 0;
      let calories = 0;

      // Handle daily view (Hourly distribution)
      if (interval === 'day') {
        const pointStart = point;
        const pointEnd = addHours(point, 1);
        
        const metricsInPoint = healthMetrics.filter(m => {
          const d = new Date(m.date);
          return d >= pointStart && d < pointEnd;
        });
        
        steps = metricsInPoint.reduce((acc, curr) => acc + (curr.steps || 0), 0);
        duration = metricsInPoint.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        calories = metricsInPoint.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);
        
        // If this is the active day and we have overrides, but we are in hourly view, 
        // we usually distribute overrides across the day if we don't have hourly session data? 
        // For simplicity, if we have overrides but total sum is 0, we can put it in one place or just skip overrides for hourly if sessions exist.
        // Actually, if we have an override for today, it should at least SHOW UP in the Day view.
        // Let's place it at midnight or a specific time if no other data exists for that hour?
        // Better: if it's the active day, and we're in 'day' view, we only show hourly if it's workout sessions. 
      } else {
        // Week/Month view (Daily aggregates)
        // CHECK FOR OVERRIDE FIRST
        if (pointStr === activeDateStr) {
          steps = manualOverrides.steps !== undefined ? manualOverrides.steps : 0;
          duration = manualOverrides.duration !== undefined ? manualOverrides.duration : 0;
          calories = manualOverrides.calories !== undefined ? manualOverrides.calories : 0;
          
          // If no override, try to sum healthMetrics for this day
          if (manualOverrides.steps === undefined && manualOverrides.duration === undefined && manualOverrides.calories === undefined) {
             const metricsInPoint = healthMetrics.filter(m => {
                const mDate = m.date.includes('T') ? m.date.split('T')[0] : m.date; 
                return mDate === pointStr;
             });
             steps = metricsInPoint.reduce((acc, curr) => acc + (curr.steps || 0), 0);
             duration = metricsInPoint.reduce((acc, curr) => acc + (curr.duration || 0), 0);
             calories = metricsInPoint.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);
          }
        } else {
           // Historical data (not active day)
           const metricsInPoint = healthMetrics.filter(m => {
              const mDate = m.date.includes('T') ? m.date.split('T')[0] : m.date; 
              return mDate === pointStr;
           });
           steps = metricsInPoint.reduce((acc, curr) => acc + (curr.steps || 0), 0);
           duration = metricsInPoint.reduce((acc, curr) => acc + (curr.duration || 0), 0);
           calories = metricsInPoint.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);
        }
      }

      return {
        time: format(point, formatStr),
        steps,
        duration,
        calories
      };
    });
  }, [healthMetrics, selectedDate, interval, originalData, manualOverrides]);

  const getMetricConfig = () => {
    switch (selectedMetric) {
      case 'steps':
        return { color: '#22c55e', dataKey: 'steps', unit: '', title: 'Steps Timeline', minMax: 10000 };
      case 'duration':
        return { color: '#3b82f6', dataKey: 'duration', unit: ' mins', title: 'Active Time Timeline', minMax: 60 };
      case 'calories':
        return { color: '#ef4444', dataKey: 'calories', unit: ' kcal', title: 'Calories Timeline', minMax: 500 };
      default:
        return { color: '#22c55e', dataKey: 'steps', unit: '', title: 'Steps Timeline', minMax: 10000 };
    }
  };

  const config = getMetricConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex justify-between items-center pr-8">
            <DialogTitle className="text-white">{config.title}</DialogTitle>
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((int) => (
                <Button
                  key={int}
                  size="sm"
                  variant={interval === int ? 'default' : 'outline'}
                  onClick={() => onIntervalChange?.(int)}
                  className="capitalize h-8 px-3 text-xs"
                >
                  {int}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>
        <div className="h-64 w-full mt-4" key={isOpen ? `timeline-${interval}-${selectedMetric}` : 'timeline-closed'}>
          {processedData && processedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${value}${config.unit}`}
                  width={60}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, (dataMax: number) => Math.max(dataMax, config.minMax)]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: config.color }}
                  labelStyle={{ color: '#F3F4F6', marginBottom: '4px' }}
                  formatter={(value: number) => [`${value}${config.unit}`, 'Value']}
                />
                <Line 
                  type="monotone" 
                  dataKey={config.dataKey} 
                  stroke={config.color} 
                  strokeWidth={3}
                  dot={{ fill: config.color, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available for this {interval}
            </div>
          )}
        </div>
        
        {/* Metric Selection Buttons */}
        <div className="flex justify-center gap-2 mt-4">
          <Button
            onClick={() => onMetricChange('steps')}
            variant={selectedMetric === 'steps' ? 'default' : 'outline'}
            className={selectedMetric === 'steps' ? 'bg-green-600 hover:bg-green-700' : 'border-green-500 text-green-400 hover:bg-green-500/10'}
          >
            Steps
          </Button>
          <Button
            onClick={() => onMetricChange('duration')}
            variant={selectedMetric === 'duration' ? 'default' : 'outline'}
            className={selectedMetric === 'duration' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-500 text-blue-400 hover:bg-blue-500/10'}
          >
            Duration
          </Button>
          <Button
            onClick={() => onMetricChange('calories')}
            variant={selectedMetric === 'calories' ? 'default' : 'outline'}
            className={selectedMetric === 'calories' ? 'bg-red-600 hover:bg-red-700' : 'border-red-500 text-red-400 hover:bg-red-500/10'}
          >
            Calories
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};