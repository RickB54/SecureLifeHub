
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Moon,
  Heart,
  Zap,
  Activity,
  Wind,
  TrendingUp,
  ChevronRight,
  Watch,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Timer,
  Footprints,
  Flame,
  Brain,
  Scale,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkout } from "@/contexts/WorkoutContext";
import { format, subDays, startOfToday, parseISO, isSameDay } from "date-fns";
import SmartwatchTrendsHelpPopup from "@/components/ui/SmartwatchTrendsHelpPopup";

// Sample Data Constellations
const SAMPLE_SLEEP = [
  { day: 'Mon', duration: 7.2, deep: 1.5, rem: 1.8, light: 3.9 },
  { day: 'Tue', duration: 6.8, deep: 1.2, rem: 1.5, light: 4.1 },
  { day: 'Wed', duration: 7.5, deep: 1.8, rem: 2.0, light: 3.7 },
  { day: 'Thu', duration: 8.1, deep: 2.1, rem: 2.2, light: 3.8 },
  { day: 'Fri', duration: 6.5, deep: 1.1, rem: 1.4, light: 4.0 },
  { day: 'Sat', duration: 8.4, deep: 2.3, rem: 2.4, light: 3.7 },
  { day: 'Sun', duration: 7.8, deep: 1.9, rem: 2.1, light: 3.8 },
];

const SAMPLE_HR = [
  { time: '00:00', bpm: 58 }, { time: '04:00', bpm: 52 }, { time: '08:00', bpm: 72 },
  { time: '12:00', bpm: 85 }, { time: '16:00', bpm: 145 }, { time: '20:00', bpm: 75 },
  { time: '23:59', bpm: 62 },
];

const SAMPLE_SPO2 = [
  { day: 'Mon', level: 98 }, { day: 'Tue', level: 97 }, { day: 'Wed', level: 99 },
  { day: 'Thu', level: 98 }, { day: 'Fri', level: 98 }, { day: 'Sat', level: 97 },
  { day: 'Sun', level: 98 },
];

const SAMPLE_STRESS = [
  { day: 'Mon', level: 45 }, { day: 'Tue', level: 62 }, { day: 'Wed', level: 38 },
  { day: 'Thu', level: 25 }, { day: 'Fri', level: 55 }, { day: 'Sat', level: 20 },
  { day: 'Sun', level: 15 },
];

const SmartwatchTrends = () => {
  const navigate = useNavigate();
  const { healthMetrics, syncSmartwatchWorkouts } = useWorkout();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Filter for real smartwatch data in the last 7 days
  const smartwatchData = useMemo(() => {
    return healthMetrics.filter(m => m.fromSmartwatch);
  }, [healthMetrics]);

  const hasRealData = smartwatchData.length > 0;

  // Process data for charts
  const chartData = useMemo(() => {
    if (!hasRealData) {
      return { sleep: SAMPLE_SLEEP, hr: SAMPLE_HR, spo2: SAMPLE_SPO2, stress: SAMPLE_STRESS };
    }

    const today = startOfToday();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

    const sleep = last7Days.map(date => {
      const metric = smartwatchData.find(m => isSameDay(parseISO(m.date), date));
      return {
        day: format(date, 'EEE'),
        duration: metric?.sleepDurationHours || metric?.sleepDuration || 0,
        // Mock sub-components if only total duration is available
        deep: (metric?.sleepDurationHours || metric?.sleepDuration || 0) * 0.2,
        rem: (metric?.sleepDurationHours || metric?.sleepDuration || 0) * 0.15
      };
    }).filter(d => d.duration > 0);

    const hr = smartwatchData.slice(-10).map((m, i) => ({
      time: i.toString(),
      bpm: m.avgHeartRate || 70
    }));

    const spo2 = last7Days.map(date => {
      const metric = smartwatchData.find(m => isSameDay(parseISO(m.date), date));
      return {
        day: format(date, 'EEE'),
        level: metric?.bloodOxygen || 98
      };
    });

    const stress = last7Days.map(date => {
      const metric = smartwatchData.find(m => isSameDay(parseISO(m.date), date));
      return {
        day: format(date, 'EEE'),
        level: metric?.stressLevelRating || metric?.sleepQualityRating || 0
      };
    });

    return { 
      sleep: sleep.length > 0 ? sleep : SAMPLE_SLEEP, 
      hr: hr.length > 0 ? hr : SAMPLE_HR, 
      spo2, 
      stress 
    };
  }, [smartwatchData, hasRealData]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncSmartwatchWorkouts();
    } finally {
      setIsSyncing(false);
    }
  };

  const getLatestMetric = (key: keyof typeof smartwatchData[0]) => {
    if (!hasRealData) return null;
    const last = smartwatchData[smartwatchData.length - 1];
    return last ? last[key] : null;
  };

  return (
    <div className="page-container page-transition pb-28">
      {/* ── Page Header ── */}
      <div className="relative rounded-3xl overflow-hidden mb-8 h-48 md:h-64 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=2070&auto=format&fit=crop)',
            filter: 'brightness(0.3)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gym-darker via-gym-darker/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-blue-600/20 to-transparent" />
        
        <div className="relative z-10 h-full flex flex-col justify-between p-8">
            <div className="flex items-center gap-3">
              <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(-1)} 
                  className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10 backdrop-blur-md transition-all group"
              >
                  <ArrowLeft className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
              </Button>
              <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsHelpOpen(true)}
                  className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10 backdrop-blur-md transition-all group"
              >
                  <HelpCircle className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              </Button>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-500/20 backdrop-blur-md border border-purple-500/30 shadow-xl animate-pulse">
                  <Watch className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Live Ecosystem</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                    Smartwatch <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Trends</span>
                  </h1>
                </div>
              </div>
              <p className="text-gray-300 text-sm md:text-lg max-w-2xl font-medium leading-relaxed">
                Deep-dive into your physiological patterns. Syncing every second to give you the ultimate performance edge.
              </p>
            </div>
        </div>
      </div>

      {/* ── Sample Data Warning Banner ── */}
      {!hasRealData && (
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-600/20 to-orange-600/10 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Info className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Viewing Sample Insights</h3>
              <p className="text-gray-400 text-sm font-medium">To see your actual physiological trends, sync your smartwatch in the Health Hub.</p>
            </div>
          </div>
          <Button 
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-amber-500 hover:bg-amber-600 text-gym-dark font-black px-8 h-12 rounded-2xl shadow-lg shadow-amber-500/20 whitespace-nowrap group"
          >
            {isSyncing ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Sync Watch Now
              </>
            )}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Sleep Analysis Card ── */}
        <Card className="lg:col-span-2 overflow-hidden border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl group">
          <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Moon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">Sleep Quality Score</CardTitle>
                  <CardDescription className="text-blue-400 font-semibold tracking-wider uppercase text-[10px]">Rest & Recovery Loop</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400 px-3 py-1 font-bold">
                84 / 100
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.sleep}>
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="day" stroke="#ffffff40" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis stroke="#ffffff40" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff1a', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Area type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDuration)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Avg Duration', value: hasRealData ? `${(smartwatchData.reduce((acc, curr) => acc + (curr.sleepDurationHours || 0), 0) / smartwatchData.length).toFixed(1)}h` : '7.4h', color: 'text-blue-400' },
                { label: 'Deep Sleep', value: '26%', color: 'text-indigo-400' },
                { label: 'REM Sleep', value: '22%', color: 'text-purple-400' },
                { label: 'Efficiency', value: '91%', color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Heart Rate Trends Card ── */}
        <Card className="overflow-hidden border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30">
                <Heart className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Live Heart Rate</CardTitle>
                <CardDescription className="text-rose-400 font-semibold tracking-wider uppercase text-[10px]">24H Circadian Rhythm</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
                <div className="relative flex flex-col items-center justify-center h-32 w-32 rounded-full border-2 border-rose-500/30 bg-rose-500/5">
                  <p className="text-4xl font-black text-white">{getLatestMetric('avgHeartRate') || 72}</p>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">BPM Now</p>
                </div>
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.hr}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff1a', borderRadius: '12px' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Line 
                    type="step" 
                    dataKey="bpm" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    dot={false}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-6">
              {[
                { label: 'Resting HR', value: `${getLatestMetric('avgHeartRate') || 54} BPM`, icon: Zap, color: 'text-rose-400' },
                { label: 'Max Training', value: `${getLatestMetric('maxHeartRate') || 182} BPM`, icon: Activity, color: 'text-orange-400' },
                { label: 'HR Variability', value: '68 ms', icon: Wind, color: 'text-cyan-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-bold text-gray-300">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── SpO2 & Stress Trends ── */}
        <Card className="lg:col-span-1 overflow-hidden border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                <Wind className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Blood Oxygen (SpO2)</CardTitle>
                <CardDescription className="text-cyan-400 font-semibold tracking-wider uppercase text-[10px]">Vital Saturation Efficiency</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.spo2}>
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={[90, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="level" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <div>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Weekly Avg</p>
                <p className="text-3xl font-black text-white">{getLatestMetric('bloodOxygen') ? `${getLatestMetric('bloodOxygen')}%` : '98.2%'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 overflow-hidden border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                <Brain className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Stress Resistance</CardTitle>
                <CardDescription className="text-orange-400 font-semibold tracking-wider uppercase text-[10px]">Cortisol Flux Management</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.stress}>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="level" stroke="#fb923c" strokeWidth={4} dot={{r: 4, fill: '#fb923c', strokeWidth: 0}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <div>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Current State</p>
                <p className="text-3xl font-black text-white">{hasRealData ? (getLatestMetric('stressLevelRating') ? 'Stable' : 'Unknown') : 'Relaxed'}</p>
              </div>
              <Badge className="bg-orange-500 text-white font-black px-4 py-1">LEVEL 2</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 overflow-hidden border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/[0.05] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Layers className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Ecosystem Links</CardTitle>
                <CardDescription className="text-emerald-400 font-semibold tracking-wider uppercase text-[10px]">Connect your loops</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {[
              { label: 'Health Hub Main', route: '/health-dashboard', icon: Sparkles, color: 'text-emerald-400' },
              { label: 'Daily Vitals & Vitals', route: '/2nd-health-metrics', icon: Activity, color: 'text-blue-400' },
              { label: 'Body Measurements', route: '/body-metrics', icon: Scale, color: 'text-cyan-400' },
            ].map((link, i) => (
              <button 
                key={i} 
                onClick={() => navigate(link.route)}
                className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                  <span className="font-bold text-gray-200">{link.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* ── Summary Tip ── */}
      <div className="mt-12 flex flex-col md:flex-row items-center gap-6 p-8 rounded-[2rem] bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/10 blur-[80px]" />
        <div className="relative flex flex-shrink-0 items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Info className="h-8 w-8 text-purple-400" />
        </div>
        <div className="relative">
            <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tight italic">Performance Insight</h4>
            <p className="text-gray-300 text-sm leading-relaxed max-w-2xl font-medium">
                Your trends show a high recovery correlation with early exercise sessions. To optimize your <span className="text-purple-400 font-bold">Smartwatch Score</span>, prioritize hydration during your afternoon peaks and aim for 8 hours of sleep following heavy lifting days.
            </p>
        </div>
        <Button className="md:ml-auto bg-white text-gym-dark font-black px-8 h-12 rounded-2xl hover:bg-gray-200 shadow-xl shadow-white/5 whitespace-nowrap">
            Personalize Plan
        </Button>
      </div>

      <SmartwatchTrendsHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default SmartwatchTrends;
