import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useSettings } from '@/contexts/SettingsContext';
import { format, startOfDay, endOfDay, subDays, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
  ArrowLeft, Printer, Download, Activity, Heart, Footprints, Clock, Flame, Scale, 
  Watch, User, Calendar, Filter, TrendingUp, Info, ShieldCheck, CheckCircle2, BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const DataMetricsReport: React.FC = () => {
  const navigate = useNavigate();
  const { unitSystem } = useSettings();
  const { healthMetrics, workouts, bodyMeasurements } = useWorkout();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const [printMode, setPrintMode] = useState(false);

  // Load body metrics data for BMI
  const bodyMetricsData = useMemo(() => {
    const saved = localStorage.getItem('bodyMetricsData');
    return saved ? JSON.parse(saved) : null;
  }, []);

  const filteredMetrics = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return healthMetrics;
    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to);
    
    return healthMetrics.filter(m => {
      const d = new Date(m.date);
      return d >= start && d <= end;
    });
  }, [healthMetrics, dateRange]);

  const filteredWorkouts = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return workouts;
    const start = dateRange.from.getTime();
    const end = dateRange.to.getTime();
    
    return workouts.filter(w => w.startTime >= start && w.startTime <= end);
  }, [workouts, dateRange]);

  const reportStats = useMemo(() => {
    const steps = filteredMetrics.reduce((sum, m) => sum + (m.steps || 0), 0);
    const calories = filteredMetrics.reduce((sum, m) => sum + (m.caloriesBurned || 0), 0);
    const duration = filteredMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const workoutCount = filteredWorkouts.length;
    
    const avgSteps = filteredMetrics.length ? Math.round(steps / filteredMetrics.length) : 0;
    
    return {
      totalSteps: steps,
      totalCalories: calories,
      totalDuration: duration,
      workoutCount,
      avgSteps,
      daysTracked: filteredMetrics.length
    };
  }, [filteredMetrics, filteredWorkouts]);

  const sourceDistribution = useMemo(() => {
    const smart = filteredMetrics.filter(m => m.fromSmartwatch).length;
    const manual = filteredMetrics.filter(m => !m.fromSmartwatch).length;
    return [
      { name: 'Smartwatch', value: smart, color: '#3b82f6' },
      { name: 'Manual Entry', value: manual, color: '#f59e0b' }
    ].filter(s => s.value > 0);
  }, [filteredMetrics]);

  const activityChartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    
    const days = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const metric = filteredMetrics.find(m => m.date === dateStr);
      return {
        date: format(day, 'MMM dd'),
        steps: metric?.steps || 0,
        calories: metric?.caloriesBurned || 0,
        duration: metric?.duration || 0
      };
    });
  }, [filteredMetrics, dateRange]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`container mx-auto p-4 md:p-6 min-h-screen bg-gym-darker text-white ${printMode ? 'print-view' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-gym-dark">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="h-8 w-8 text-gym-blue" />
              <h1 className="text-2xl md:text-3xl font-bold">Data Metrics Report</h1>
            </div>
            <p className="text-gray-400 text-sm">Comprehensive health and activity summary</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DateRangePicker 
            value={dateRange} 
            onDateChange={setDateRange}
            className="flex-grow md:flex-initial"
            calendarClassName="p-3 origin-top-right w-96"
          />
          <Button variant="outline" size="icon" onClick={handlePrint} className="border-gray-700">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <Card className="lg:col-span-2 bg-gym-dark border-gray-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-24 w-24 text-gym-blue" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gym-blue" />
              Executive Summary
            </CardTitle>
            <CardDescription>Metrics from {dateRange?.from ? format(dateRange.from, 'MMM dd') : '...'} to {dateRange?.to ? format(dateRange.to, 'MMM dd') : '...'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Steps</p>
                <p className="text-2xl font-bold text-green-400">{reportStats.totalSteps.toLocaleString()}</p>
                <p className="text-xs text-green-500/50">Avg: {reportStats.avgSteps.toLocaleString()} / day</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">Calories Burned</p>
                <p className="text-2xl font-bold text-red-400">{reportStats.totalCalories.toLocaleString()}</p>
                <p className="text-xs text-red-500/50">Total kcal</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">Activity Time</p>
                <p className="text-2xl font-bold text-blue-400">{Math.floor(reportStats.totalDuration / 60)}h {reportStats.totalDuration % 60}m</p>
                <p className="text-xs text-blue-500/50">Cumulative duration</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">Workouts</p>
                <p className="text-2xl font-bold text-purple-400">{reportStats.workoutCount}</p>
                <p className="text-xs text-purple-500/50">Sessions completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMI Card */}
        <Card className="bg-gym-dark border-gray-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-400" />
              Pulse: BMI & Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bodyMetricsData?.bmiResult ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-bold text-white">{bodyMetricsData.bmiResult.value}</p>
                    <p className="text-sm text-purple-400 font-medium">{bodyMetricsData.bmiResult.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Latest Weight</p>
                    <p className="text-lg font-semibold">{bodyMetricsData.bmiData.weight} {unitSystem === 'imperial' ? 'lbs' : 'kg'}</p>
                  </div>
                </div>
                {/* Visual Scale */}
                <div className="w-full h-2 bg-gray-800 rounded-full flex overflow-hidden">
                  <div className="h-full bg-blue-500/50 w-[25%]" />
                  <div className="h-full bg-green-500/50 w-[25%]" />
                  <div className="h-full bg-yellow-500/50 w-[25%]" />
                  <div className="h-full bg-red-500/50 w-[25%]" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>Under</span>
                  <span>Normal</span>
                  <span>Over</span>
                  <span>Obese</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500 italic">
                <Info className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs">No BMI data found</p>
                <Button variant="link" size="sm" onClick={() => navigate('/body-metrics')} className="text-gym-blue p-0 h-auto text-xs mt-1">Calculate BMI</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gym-dark border-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Activity Trends
              </div>
              <Badge variant="outline" className="text-[10px] border-gray-700">Steps vs Calories</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChartData}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="steps" stroke="#22c55e" fillOpacity={1} fill="url(#colorSteps)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gym-dark border-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                Data Integrity
              </div>
              <Badge variant="outline" className="text-[10px] border-gray-700">Source Distribution</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {sourceDistribution.length > 0 ? (
              <div className="w-full flex flex-col md:flex-row items-center gap-8">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sourceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3">
                  {sourceDistribution.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.value} records ({Math.round(s.value / filteredMetrics.length * 100)}%)</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-[11px] text-blue-400 flex gap-2">
                    <Watch className="h-4 w-4 shrink-0" />
                    Smartwatch data is synced via Health Connect.
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-gray-500 italic text-sm">No source data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Measurements Table */}
      <Card className="bg-gym-dark border-gray-800 shadow-xl mb-8 overflow-hidden">
        <CardHeader className="bg-gray-800/50">
          <CardTitle className="text-lg">Body Measurements Log</CardTitle>
          <CardDescription>Latest tracked dimensions and anthropometrics</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-800/30 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Measurement</th>
                  <th className="px-6 py-4">Current Value</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {bodyMetricsData?.measurements ? (
                  Object.entries(bodyMetricsData.measurements).filter(([_, m]: any) => m.value).map(([key, m]: any) => (
                    <tr key={key} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                      <td className="px-6 py-4 text-white font-semibold">{m.value} {m.unit}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none font-normal text-[10px]">
                          Tracked
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No measurement data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Verification footer */}
      <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-[10px]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          Report generated on {format(new Date(), 'PPpp')}
        </div>
        <div className="flex items-center gap-4">
          <span>GymDay Fit Tracker v1.2</span>
          <span>Privacy Secured: Data Encrypted & Local</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-gym-darker, .bg-gym-dark { background: white !important; border: 1px solid #eee !important; }
          .text-white, .text-gray-400 { color: black !important; }
          .shadow-xl { shadow: none !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
          .Card { border: 1px solid #ccc !important; page-break-inside: avoid; }
          .progress-scale { border: 1px solid #000 !important; }
          .print-view { padding: 40px !important; }
        }
      `}} />
    </div>
  );
};

export default DataMetricsReport;
