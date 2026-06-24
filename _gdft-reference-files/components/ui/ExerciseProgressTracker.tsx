
import React, { useMemo } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useSettings } from '@/contexts/SettingsContext';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, TrendingUp, Calendar, Dumbbell } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';

interface ExerciseProgressTrackerProps {
  exerciseId: string;
}

export const ExerciseProgressTracker: React.FC<ExerciseProgressTrackerProps> = ({ exerciseId }) => {
  const { workouts } = useWorkout();
  const { unitSystem } = useSettings();

  const history = useMemo(() => {
    const data: { date: number; weight: number; reps: number; volume: number; oneRM: number }[] = [];

    // Flatten all sets for this exercise from all workouts
    workouts.forEach(workout => {
      if (!workout.completed) return; // Only completed workouts
      
      const relevantSets = workout.sets.filter(s => s.exerciseId === exerciseId && s.completed);
      
      if (relevantSets.length > 0) {
        // Find the "best" set for this session (highest 1RM or highest volume?)
        // Let's take the max weight lifted for graphing progress
        const bestSet = relevantSets.reduce((best, current) => {
            const currentWeight = current.weight || 0;
            const bestWeight = best.weight || 0;
            return currentWeight > bestWeight ? current : best;
        }, relevantSets[0]);

        const weight = bestSet.weight || 0;
        const reps = bestSet.reps || 0;
        const volume = relevantSets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
        const oneRM = weight * (1 + reps / 30);

        data.push({
          date: workout.startTime,
          weight,
          reps,
          volume,
          oneRM
        });
      }
    });

    return data.sort((a, b) => a.date - b.date);
  }, [workouts, exerciseId]);

  const stats = useMemo(() => {
    if (history.length === 0) return null;

    let maxWeight = 0;
    let maxVolume = 0;
    let best1RM = 0;

    history.forEach(d => {
      if (d.weight > maxWeight) maxWeight = d.weight;
      if (d.volume > maxVolume) maxVolume = d.volume;
      if (d.oneRM > best1RM) best1RM = d.oneRM;
    });

    const lastSession = history[history.length - 1];
    const prevSession = history.length > 1 ? history[history.length - 2] : null;

    const improvement = prevSession 
        ? lastSession.volume > prevSession.volume || lastSession.weight > prevSession.weight 
        : true;

    return {
      maxWeight,
      maxVolume,
      best1RM,
      lastSession,
      improvement
    };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No history found for this exercise. Start logging sets to see progress!
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gym-card/50 border-gym-blue/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">{formatNumber(stats?.maxWeight || 0)} <span className="text-sm font-normal text-muted-foreground">{unitSystem === 'metric' ? 'kg' : 'lbs'}</span></div>
            <div className="text-xs text-muted-foreground">Heaviest Lift</div>
          </CardContent>
        </Card>
        <Card className="bg-gym-card/50 border-gym-blue/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Dumbbell className="h-8 w-8 text-gym-blue mb-2" />
            <div className="text-2xl font-bold">{formatNumber(stats?.best1RM || 0)} <span className="text-sm font-normal text-muted-foreground">{unitSystem === 'metric' ? 'kg' : 'lbs'}</span></div>
            <div className="text-xs text-muted-foreground">Est. 1RM</div>
          </CardContent>
        </Card>
      </div>

      {/* Graph */}
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Progress Trend
          </CardTitle>
        </CardHeader>
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => format(new Date(tick), 'MMM d')} 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    width={35}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                    itemStyle={{ color: '#E5E7EB' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: '#60A5FA' }}
                    name="Max Weight"
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent History Table */}
      <Card className="bg-gym-card/30 border-gray-800">
        <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Recent History
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs text-right">Weight</TableHead>
                        <TableHead className="text-xs text-right">Reps</TableHead>
                        <TableHead className="text-xs text-right">Vol</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...history].reverse().slice(0, 5).map((session, idx) => (
                        <TableRow key={idx} className="border-gray-800 hover:bg-white/5">
                            <TableCell className="text-xs font-medium py-3">
                                {format(new Date(session.date), 'MM/dd/yy')}
                            </TableCell>
                            <TableCell className="text-xs text-right py-3">{formatNumber(session.weight)}</TableCell>
                            <TableCell className="text-xs text-right py-3">{session.reps}</TableCell>
                            <TableCell className="text-xs text-right py-3 text-muted-foreground">{formatNumber(session.volume)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};
