
import React, { useMemo, useState } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { startOfWeek, startOfMonth, isSameWeek, isSameMonth, endOfWeek, endOfMonth } from 'date-fns';
import { Dumbbell, Clock, CalendarCheck, Activity, Award } from 'lucide-react'; // Replaced Biceps with Activity or Award as Biceps might not exist
import { formatNumber, formatDuration } from '@/lib/formatters';

export const DashboardWidgets = () => {
    const { workouts, getWorkoutStats } = useWorkout();
    const { unitSystem } = useSettings();
    const [period, setPeriod] = useState<'week' | 'month'>('week');

    const stats = useMemo(() => {
        const now = new Date();
        const start = period === 'week' ? startOfWeek(now, { weekStartsOn: 1 }) : startOfMonth(now);
        const end = period === 'week' ? endOfWeek(now, { weekStartsOn: 1 }) : endOfMonth(now);

        const relevantWorkouts = workouts.filter(w => {
            const d = new Date(w.startTime);
            return d >= start && d <= end && w.completed;
        });

        const totalVolume = relevantWorkouts.reduce((sum, w) => {
            return sum + w.sets.reduce((sSum, s) => sSum + ((s.weight || 0) * (s.reps || 0) * (s.completed ? 1 : 0)), 0);
        }, 0);

        const totalDuration = relevantWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const avgDuration = relevantWorkouts.length > 0 ? Math.round(totalDuration / relevantWorkouts.length) : 0;
        
        // Find most trained muscle group
        const muscleCounts: Record<string, number> = {};
        // We'd need to look up exercises for each workout efficiently. 
        // Since we don't have exercises easily mapped here without context lookup (which might be heavy if done per workout in loop),
        // we'll approximation or skip if too complex.
        // Actually, we can use `w.type` which is available.
        const typeCounts: Record<string, number> = {};
        relevantWorkouts.forEach(w => {
            typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
        });

        let mostFrequentType = 'None';
        let maxCount = 0;
        Object.entries(typeCounts).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentType = type;
            }
        });

        return {
            totalWorkouts: relevantWorkouts.length,
            totalVolume,
            avgDuration,
            mostFrequentType
        };
    }, [workouts, period]);

    return (
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-lg font-semibold text-gray-200">
                    {period === 'week' ? 'Weekly' : 'Monthly'} Summary
                </h2>
                <div className="flex bg-gym-darker p-1 rounded-lg border border-gray-700">
                    <button 
                        onClick={() => setPeriod('week')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${period === 'week' ? 'bg-gym-blue text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Week
                    </button>
                    <button 
                        onClick={() => setPeriod('month')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${period === 'month' ? 'bg-gym-blue text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Month
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gym-card/40 border-l-4 border-l-gym-blue border-y-0 border-r-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-gym-blue">
                            <Dumbbell className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Volume</span>
                        </div>
                        <div className="text-2xl font-bold">{formatNumber(stats.totalVolume)}</div>
                        <div className="text-xs text-muted-foreground">{unitSystem === 'metric' ? 'kg' : 'lbs'} lifted</div>
                    </CardContent>
                </Card>

                <Card className="bg-gym-card/40 border-l-4 border-l-green-500 border-y-0 border-r-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-green-500">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Avg Duration</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.avgDuration}</div>
                        <div className="text-xs text-muted-foreground">minutes/session</div>
                    </CardContent>
                </Card>

                <Card className="bg-gym-card/40 border-l-4 border-l-purple-500 border-y-0 border-r-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-purple-500">
                            <CalendarCheck className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Workouts</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                        <div className="text-xs text-muted-foreground">completed</div>
                    </CardContent>
                </Card>

                <Card className="bg-gym-card/40 border-l-4 border-l-orange-500 border-y-0 border-r-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-orange-500">
                            <Award className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Focus</span>
                        </div>
                        <div className="text-lg font-bold truncate">{stats.mostFrequentType}</div>
                        <div className="text-xs text-muted-foreground">most trained</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
