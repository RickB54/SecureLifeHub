import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

interface MetricPoint {
  date: string;
  value: number;
}

interface MetricHistoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  metricLabel: string;
  unit: string;
  data: MetricPoint[];
  color?: string;
}

export const MetricHistoryPopup: React.FC<MetricHistoryPopupProps> = ({
  isOpen,
  onClose,
  metricLabel,
  unit,
  data,
  color = '#3b82f6'
}) => {
  const [filter, setFilter] = useState<'week' | 'month' | 'year' | 'all'>('week');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      case 'year':
        startDate = subDays(now, 365);
        break;
      case 'all':
      default:
        return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return data
      .filter(item => {
        const itemDate = new Date(item.date);
        return isWithinInterval(itemDate, { start: startOfDay(startDate), end: endOfDay(now) });
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, filter]);

  const displayData = useMemo(() => {
    return filteredData.map(item => ({
      ...item,
      formattedDate: format(new Date(item.date), filter === 'year' || filter === 'all' ? 'MMM dd, yyyy' : 'MMM dd')
    }));
  }, [filteredData, filter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (displayData.length === 0) return null;
    const values = displayData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;

    return { min, max, first, last, change, changePercent };
  }, [displayData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gym-darker border-gray-800 text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-8 rounded-full" style={{ backgroundColor: color }}></span>
                {metricLabel} Trends
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-1">
                Visualizing your progress over time
              </p>
            </div>
            <div className="flex bg-gym-dark p-1 rounded-lg border border-gray-700">
              {(['week', 'month', 'year', 'all'] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilter(f)}
                  className={`capitalize px-4 h-8 text-xs transition-all ${
                    filter === f 
                      ? 'bg-gym-card text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gym-card/30 p-4 rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Current</p>
                <p className="text-xl font-mono font-bold text-white">
                  {stats.last} <span className="text-sm font-normal text-gray-500">{unit}</span>
                </p>
              </div>
              <div className="bg-gym-card/30 p-4 rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Target Change</p>
                <p className={`text-xl font-mono font-bold ${stats.change >= 0 ? 'text-gym-green' : 'text-gym-red'}`}>
                  {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}
                  <span className="text-sm font-normal ml-1">({stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%)</span>
                </p>
              </div>
              <div className="bg-gym-card/30 p-4 rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Highest</p>
                <p className="text-xl font-mono font-bold text-white">
                  {stats.max} <span className="text-sm font-normal text-gray-500">{unit}</span>
                </p>
              </div>
              <div className="bg-gym-card/30 p-4 rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Lowest</p>
                <p className="text-xl font-mono font-bold text-white">
                  {stats.min} <span className="text-sm font-normal text-gray-500">{unit}</span>
                </p>
              </div>
            </div>
          )}

          <div className="h-[300px] w-full">
            {displayData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => `${value}`}
                    width={40}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ stroke: color, strokeWidth: 2 }}
                    itemStyle={{ color: color, fontWeight: 'bold' }}
                    labelStyle={{ color: '#F3F4F6', marginBottom: '8px', fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value} ${unit}`, metricLabel]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={color} 
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    animationDuration={1500}
                    dot={{ fill: '#111827', stroke: color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                   <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                   </svg>
                </div>
                <p>No measurement data available for this range</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
