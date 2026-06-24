
import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Area, Scatter
} from 'recharts';
import { format } from 'date-fns';
import { Activity, Flame, Heart, TrendingUp, Dumbbell, Clock, Gauge, Zap } from 'lucide-react';
import type { Workout } from '@/lib/data';
import { formatCalories } from '@/lib/formatters';

interface AdvancedWorkoutMetricsChartProps {
    isOpen: boolean;
    onClose: () => void;
    workout: Workout | null;
    getExerciseById: (id: string) => any;
}

const AdvancedWorkoutMetricsChart = ({ isOpen, onClose, workout, getExerciseById }: AdvancedWorkoutMetricsChartProps) => {

    const { metrics, radarData, intensityTimeline } = useMemo(() => {
        if (!workout) return { metrics: [], radarData: [], intensityTimeline: [] };

        const totalCalories = workout.caloriesBurned || 0;
        const totalDuration = workout.totalTime || 0;
        const totalSets = workout.sets?.filter(s => s.completed).length || 0;
        const totalReps = workout.sets?.reduce((sum, s) => sum + (s.reps || 0), 0) || 0;
        const totalVolume = workout.sets?.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0) || 0;
        const hrSets = workout.sets?.filter(s => (s.avgHeartRate || 0) > 0) || [];
        const avgHR = hrSets.length > 0 
            ? hrSets.reduce((sum, s) => sum + (s.avgHeartRate || 0), 0) / hrSets.length 
            : workout.avgHeartRate || 0;
        
        const peakHR = workout.sets?.reduce((max, s) => Math.max(max, s.maxHeartRate || 0), 0) || 0;
        
        // Muscle Group Distribution
        const muscleHits: Record<string, number> = {};
        workout.exercises.forEach(exId => {
            const ex = getExerciseById(exId);
            if (ex && ex.muscleGroups) {
                ex.muscleGroups.forEach((mg: string) => {
                    muscleHits[mg] = (muscleHits[mg] || 0) + (workout.sets?.filter(s => s.exerciseId === exId).length || 0);
                });
            }
        });

        // Radar Data (Normalized metrics 0-100)
        // Strength (Volume/Time), Volume, Cardio (Intensity/HR), Variety, Endurance (Duration)
        const radar = [
            { subject: 'Intensity', A: Math.min(100, (totalVolume / Math.max(1, totalDuration)) * 5), fullMark: 100 },
            { subject: 'Volume', A: Math.min(100, (totalVolume / 5000) * 100), fullMark: 100 },
            { subject: 'Endurance', A: Math.min(100, (totalDuration / 3600) * 100), fullMark: 100 },
            { subject: 'Cardio', A: avgHR > 0 ? Math.min(100, (avgHR / 180) * 100) : 0, fullMark: 100 },
            { subject: 'Variety', A: Math.min(100, (workout.exercises.length / 8) * 100), fullMark: 100 },
        ];

        // Intensity Timeline (Volume per exercise instance)
        const timeline = workout.exercises.map((exId, idx) => {
            const ex = getExerciseById(exId);
            const sets = workout.sets?.filter(s => s.exerciseId === exId) || [];
            const volume = sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
            
            const setsWithHR = sets.filter(s => (s.avgHeartRate || 0) > 0);
            const avgHR_ex = setsWithHR.length > 0
                ? setsWithHR.reduce((sum, s) => sum + (s.avgHeartRate || 0), 0) / setsWithHR.length
                : 0;

            return {
                name: ex?.name || `Exercise ${idx + 1}`,
                volume,
                hr: avgHR_ex || avgHR,
                sets: sets.length
            };
        });

        return { 
            metrics: [
                { label: 'Total Volume', value: `${totalVolume.toLocaleString()} lbs`, icon: Dumbbell, color: 'text-blue-400' },
                { label: 'Avg Heart Rate', value: avgHR > 0 ? `${avgHR.toFixed(0)} bpm` : 'N/A', icon: Heart, color: 'text-rose-400' },
                { label: 'Peak Heart Rate', value: peakHR > 0 ? `${peakHR} bpm` : 'N/A', icon: Activity, color: 'text-orange-400' },
                { label: 'Intensity Score', value: (totalVolume / (totalDuration || 1)).toFixed(1), icon: Zap, color: 'text-purple-400' },
            ],
            radarData: radar,
            intensityTimeline: timeline
        };
    }, [workout, getExerciseById]);

    if (!workout) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl bg-gym-dark-card border-white/5 shadow-2xl overflow-hidden p-0 gap-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gym-blue/5 via-transparent to-purple-500/5 pointer-events-none" />
                
                <DialogHeader className="p-6 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gym-blue/20 flex items-center justify-center border border-gym-blue/30 shadow-lg shadow-blue-500/20">
                            <Zap className="h-6 w-6 text-gym-blue" />
                        </div>
                        <div>
                            <DialogTitle className="text-white text-2xl font-black uppercase tracking-tight italic">
                                Advanced Performance Analytics
                            </DialogTitle>
                            <DialogDescription className="text-gray-400 font-medium">
                                {workout.name} — {format(new Date(workout.startTime), 'MMMM d, yyyy')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar relative">
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.map((m, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/10 hover:border-white/10 group">
                                <div className="flex items-center gap-3 mb-2">
                                    <m.icon className={`h-4 w-4 ${m.color} group-hover:scale-110 transition-transform`} />
                                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{m.label}</span>
                                </div>
                                <div className="text-xl font-black text-white">{m.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Radar Analysis */}
                        <div className="bg-black/30 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-1.5 w-6 bg-gym-blue rounded-full" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Muscle & Meta Profile</h3>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Performance"
                                            dataKey="A"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fill="#3b82f6"
                                            fillOpacity={0.4}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#111827', borderColor: '#3b82f6', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Intensity Timeline */}
                        <div className="bg-black/30 rounded-3xl p-6 border border-white/5">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-1.5 w-6 bg-rose-500 rounded-full" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Intensity / Volume Flux</h3>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={intensityTimeline} margin={{ top: 10, right: 10, bottom: 100, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }}
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                        />
                                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={10} fontWeight={900} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={10} fontWeight={900} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-gym-dark border border-white/10 p-3 rounded-xl shadow-2xl">
                                                            <div className="font-black text-xs text-white uppercase mb-2 italic">{payload[0].payload.name}</div>
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-[10px] text-gray-400">VOLUME</span>
                                                                    <span className="text-[10px] font-black text-blue-400">{payload[0].value.toLocaleString()} lbs</span>
                                                                </div>
                                                                {payload[1] && (
                                                                    <div className="flex justify-between gap-4">
                                                                        <span className="text-[10px] text-gray-400">AVG HEART RATE</span>
                                                                        <span className="text-[10px] font-black text-rose-400">{payload[1].value} BPM</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="volume" 
                                            fill="url(#colorVolume)" 
                                            stroke="#3b82f6" 
                                            strokeWidth={3}
                                        />
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="hr" 
                                            stroke="#f43f5e" 
                                            strokeWidth={2} 
                                            dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2 }}
                                        />
                                        <defs>
                                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Exercise List Metrics */}
                    <div className="space-y-3 pb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-1.5 w-6 bg-gym-green rounded-full" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Biometric breakdown by event</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {intensityTimeline.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl transition-all hover:bg-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-black/40 flex items-center justify-center text-[10px] font-black text-gym-blue border border-white/5">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black text-white uppercase truncate max-w-[200px]">{item.name}</div>
                                            <div className="text-[9px] text-gray-500 uppercase font-bold">{item.sets} sets completed</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div>
                                            <div className="text-[11px] font-black text-blue-400">{item.volume.toLocaleString()}</div>
                                            <div className="text-[8px] text-gray-500 uppercase">VOL (LBS)</div>
                                        </div>
                                        {item.hr > 0 && (
                                            <div>
                                                <div className="text-[11px] font-black text-rose-400">{item.hr.toFixed(0)}</div>
                                                <div className="text-[8px] text-gray-500 uppercase">HR (BPM)</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AdvancedWorkoutMetricsChart;
