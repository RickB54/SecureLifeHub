import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useWorkout } from '@/components/gdft/contexts/WorkoutContext';
import { useExercise } from '@/components/gdft/contexts/ExerciseContext';
import { useSettings } from '@/components/gdft/contexts/SettingsContext';
import { Workout, WorkoutSet } from '@/components/gdft/lib/data';
import { Button } from '@/components/gdft/components/ui/button';
import { Card, CardContent } from '@/components/gdft/components/ui/card';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { 
    Calendar as CalendarIcon, 
    ChevronDown, 
    ChevronRight, 
    Activity, 
    Clock, 
    Flame, 
    Dumbbell, 
    RotateCcw, 
    Trash2, 
    TrendingUp, 
    HelpCircle,
    Play,
    Edit,
    Save,
    Archive, 
    ArchiveRestore,
    BarChart2,
    Zap,
    Watch,
    User,
    CalendarCheck,
    ListChecks,
    Repeat,
    ChevronsRight,
    ChevronsLeft,
    Heart,
    Footprints,
    ArrowLeft
} from 'lucide-react';
import { formatCalories, calculateCalories, formatTimeDisplay, formatNumber as fmtNum, formatWorkoutDuration } from '@/components/gdft/lib/formatters';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Textarea } from '@/components/gdft/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/gdft/components/ui/collapsible';
import StatsHelpPopup from '@/components/gdft/components/ui/StatsHelpPopup';
import SmartWorkoutEntryDialog from '@/components/gdft/components/ui/SmartWorkoutEntryDialog';
import StatsCard from '@/components/gdft/components/ui/StatsCard';
import WorkoutStatsGraphPopup from '@/components/gdft/components/ui/WorkoutStatsGraphPopup';
import AdvancedWorkoutMetricsChart from '@/components/gdft/components/ui/AdvancedWorkoutMetricsChart';
import { WorkoutHistoryFilter } from '@/components/gdft/components/ui/WorkoutHistoryFilter';
import { DateRange } from 'react-day-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/gdft/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/gdft/components/ui/alert-dialog";

type WorkoutWithNotes = Workout & { notes?: string };

interface TotalWorkouts {
    number: number;
    totalCalories: number;
    totalTime: number;
    totalSets: number;
    totalReps: number;
}

const Stats = () => {
    const { unitSystem } = useSettings();
    const { workouts, getWorkoutStats, deleteWorkout, updateWorkout, startWorkout, bodyMeasurements, syncSmartwatchWorkouts, updateSmartwatchWorkout } = useWorkout();
    const { getExerciseById } = useExercise();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');
    const dateParam = searchParams.get('date');
    const workoutRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [showHelp, setShowHelp] = useState(false);
    const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
    const [editedNotes, setEditedNotes] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [openWorkouts, setOpenWorkouts] = useState<Record<string, boolean>>({});
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [selectedAdvancedWorkout, setSelectedAdvancedWorkout] = useState<Workout | null>(null);
    const [smartEntryDialog, setSmartEntryDialog] = useState<{
        isOpen: boolean;
        workoutId: string;
        existingData?: any[];
    }>({ isOpen: false, workoutId: '' });
    const [isManualSyncing, setIsManualSyncing] = useState(false);
    const [showArchived, setShowArchived] = useState<'live' | 'archived' | 'both'>('live');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const { archiveWorkout } = useWorkout();

    useEffect(() => {
        if (dateParam) {
            const parts = dateParam.split('-');
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            if (!isNaN(date.getTime())) {
                setFilterType('all');
                setDateRange({ from: startOfDay(date), to: endOfDay(date) });
            }
        }
    }, [dateParam]);

    const latestWeight = useMemo(() => {
        const latestMeasurement = bodyMeasurements
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .find(m => m.weight);
        return latestMeasurement?.weight || 70;
    }, [bodyMeasurements]);

    const filteredAndSortedWorkouts = useMemo(() => {
        let sorted = [...(workouts as WorkoutWithNotes[])].sort((a, b) => b.startTime - a.startTime);
        if (showArchived === 'archived') {
            sorted = sorted.filter(w => w.isArchived);
        } else if (showArchived === 'live') {
            sorted = sorted.filter(w => !w.isArchived && !(w as any).cancelled);
        } else {
            sorted = sorted.filter(w => !(w as any).cancelled);
        }

        if (filterType !== 'all') {
            const now = new Date();
            let fromDate = new Date();
            let toDate = new Date();
            
            if (filterType === 'day') {
                fromDate.setHours(0, 0, 0, 0);
            } else if (filterType === 'week') {
                const dayOfWeek = now.getDay();
                fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
                fromDate.setHours(0, 0, 0, 0);
            } else if (filterType === 'last_week') {
                const dayOfWeek = now.getDay();
                fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 7);
                fromDate.setHours(0, 0, 0, 0);
                toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 1);
                toDate.setHours(23, 59, 59, 999);
            } else if (filterType === 'month') {
                fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
                fromDate.setHours(0, 0, 0, 0);
            } else if (filterType === 'last_month') {
                fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                fromDate.setHours(0, 0, 0, 0);
                toDate = new Date(now.getFullYear(), now.getMonth(), 0);
                toDate.setHours(23, 59, 59, 999);
            } else if (filterType === 'year') {
                fromDate = new Date(now.getFullYear(), 0, 1);
                fromDate.setHours(0, 0, 0, 0);
            } else if (filterType === 'last_year') {
                fromDate = new Date(now.getFullYear() - 1, 0, 1);
                fromDate.setHours(0, 0, 0, 0);
                toDate = new Date(now.getFullYear() - 1, 11, 31);
                toDate.setHours(23, 59, 59, 999);
            }
            
            sorted = sorted.filter(workout => {
                const wDate = new Date(workout.startTime);
                if (filterType.startsWith('last_')) {
                    return wDate >= fromDate && wDate <= toDate;
                }
                return wDate >= fromDate;
            });
        }

        if (dateRange && dateRange.from) {
            const from = startOfDay(new Date(dateRange.from));
            const to = endOfDay(dateRange.to ? new Date(dateRange.to) : new Date(from));
            sorted = sorted.filter(workout => {
                const workoutDate = new Date(workout.startTime);
                return workoutDate >= from && workoutDate <= to;
            });
        }

        if (categoryFilter !== 'All') {
            sorted = sorted.filter(w => getWorkoutType(w as Workout) === categoryFilter);
        }

        return sorted;
    }, [workouts, dateRange, filterType, showArchived, categoryFilter, getExerciseById]);

    const getWorkoutType = (workout: Workout) => {
        if (!workout.exercises || workout.exercises.length === 0) return 'General';
        const categories = (workout.exercises || []).map(id => getExerciseById(id)).filter(ex => ex).map(ex => ex!.category.trim());
        if (categories.length === 0) return 'General';
        const uniqueCategories = [...new Set(categories)];
        if (uniqueCategories.length === 1) return uniqueCategories[0];
        const hasStrength = uniqueCategories.some(c => c === 'Weights' || c === 'Bodyweight');
        const hasCardio = uniqueCategories.some(c => c === 'Cardio' || c === 'Slide Board');
        if (hasStrength && hasCardio) return 'Hybrid';
        if (hasStrength) return 'Strength';
        if (hasCardio) return 'Cardio';
        return 'Mixed';
    };

    const groupedWorkouts = useMemo(() => {
        const groups: Record<string, WorkoutWithNotes[]> = {};
        filteredAndSortedWorkouts.forEach(workout => {
            const dateStr = format(new Date(workout.startTime), 'EEEE, MMM d, yyyy');
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(workout);
        });
        
        // Sort workouts within each date group by time (latest first)
        Object.keys(groups).forEach(date => {
            groups[date].sort((a, b) => b.startTime - a.startTime);
        });
        
        return groups;
    }, [filteredAndSortedWorkouts]);

    const [hasInitiallyExpanded, setHasInitiallyExpanded] = useState(false);

    useEffect(() => {
        if (filteredAndSortedWorkouts.length > 0) {
            // If there's a highlightId, we always want to expand it
            // Otherwise, we only auto-expand the first one on the very first load
            if (!highlightId && hasInitiallyExpanded) return;

            const workout = highlightId 
                ? filteredAndSortedWorkouts.find(w => w.id === highlightId)
                : filteredAndSortedWorkouts[0];

            if (workout) {
                const isManualHighlight = !!highlightId;
                if (!isManualHighlight) setHasInitiallyExpanded(true);
                const groupName = format(new Date(workout.startTime), 'EEEE, MMM d, yyyy');
                // Exclusively open the highlighted workout and its group, collapse others
                const workoutUpdates: Record<string, boolean> = { [workout.id]: true };
                const groupUpdates: Record<string, boolean> = { [groupName]: true };
                
                setOpenWorkouts(workoutUpdates);
                setOpenGroups(groupUpdates);

                // Scroll only if manually highlighted
                if (isManualHighlight) {
                    // Clear the highlight param from URL so it doesn't break filters later
                    const url = new URL(window.location.href);
                    url.searchParams.delete('highlight');
                    window.history.replaceState({}, '', url.toString());

                    setTimeout(() => {
                        const element = workoutRefs.current[workout.id];
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('ring-2', 'ring-gym-blue', 'ring-offset-2', 'ring-offset-gym-darker');
                            setTimeout(() => element.classList.remove('ring-2', 'ring-gym-blue', 'ring-offset-2', 'ring-offset-gym-darker'), 3000);
                        }
                    }, 1000);
                }
            }
        }
    }, [highlightId, filteredAndSortedWorkouts, filterType]);

    const handleToggleAll = (expand: boolean) => {
        const workoutUpdates: Record<string, boolean> = {};
        const groupUpdates: Record<string, boolean> = {};
        filteredAndSortedWorkouts.forEach(w => workoutUpdates[w.id] = expand);
        Object.keys(groupedWorkouts).forEach(g => groupUpdates[g] = expand);
        setOpenWorkouts(workoutUpdates);
        setOpenGroups(groupUpdates);
        toast.info(expand ? "All sections expanded." : "All sections collapsed.");
    };

    const handleEdit = (e: React.MouseEvent, workoutId: string, notes: string | undefined) => {
        e.stopPropagation();
        setOpenWorkouts(prev => ({ ...prev, [workoutId]: true }));
        setEditingWorkoutId(workoutId);
        setEditedNotes(notes || '');
    };

    const handleSave = (e: React.MouseEvent, workoutId: string) => {
        e.stopPropagation();
        const workout = (workouts as WorkoutWithNotes[]).find(w => w.id === workoutId);
        if (workout) {
            updateWorkout({ ...workout, notes: editedNotes });
            setEditingWorkoutId(null);
            toast.success("Workout notes updated!");
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingWorkoutId(null);
    };

    const handleDelete = (e: React.MouseEvent, workoutId: string) => {
        e.stopPropagation();
        setWorkoutToDelete(workoutId);
    };

    const handleConfirmDelete = () => {
        if (workoutToDelete) {
            deleteWorkout(workoutToDelete);
            setWorkoutToDelete(null);
        }
    };

    const handleManualSync = async () => {
        setIsManualSyncing(true);
        try {
            await syncSmartwatchWorkouts();
            toast.success('Smartwatch sync complete');
        } catch {
            toast.error('Sync failed');
        } finally {
            setIsManualSyncing(false);
        }
    };

    const handleEditSmartwatchWorkout = (e: React.MouseEvent, workout: Workout) => {
        e.stopPropagation();
        const existingExerciseData = workout.exercises.map(exerciseId => {
            const exercise = getExerciseById(exerciseId);
            const exerciseSets = workout.sets?.filter(s => s.exerciseId === exerciseId) || [];
            return {
                id: `entry_${exerciseId}`,
                exerciseId,
                exercise,
                sets: exerciseSets.map((set, index) => ({
                    id: `set_${index}`,
                    reps: set.reps,
                    weight: set.weight,
                    distance: set.distance,
                    duration: set.duration,
                    time: set.duration
                })),
                notes: ''
            };
        });
        setSmartEntryDialog({ isOpen: true, workoutId: workout.id, existingData: existingExerciseData });
    };

    const handleFilterChange = (type: string) => {
        setFilterType(type);
        setDateRange(undefined);
    };

    const formatDuration = (seconds: number) => {
        return formatTimeDisplay(seconds);
    };

    const filteredCalories = useMemo(() => {
        return filteredAndSortedWorkouts.reduce((total, workout) => {
            const durationMinutes = (workout.totalTime || 0) / 60;
            const type = getWorkoutType(workout as Workout);
            const isCardio = type === 'Cardio' || type === 'Slide Board';
            return total + calculateCalories(durationMinutes, latestWeight, isCardio);
        }, 0);
    }, [filteredAndSortedWorkouts, latestWeight]);

    const totals = useMemo(() => {
        return filteredAndSortedWorkouts.reduce((acc, workout) => {
            acc.totalWorkouts += 1;
            acc.totalTime += workout.totalTime || 0;
            acc.totalSets += workout.sets ? workout.sets.filter(s => s.completed).length : 0;
            acc.totalReps += workout.sets ? workout.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.reps || 0), 0) : 0;
            return acc;
        }, { totalWorkouts: 0, totalTime: 0, totalSets: 0, totalReps: 0 });
    }, [filteredAndSortedWorkouts]);

    const isAllExpanded = useMemo(() => {
        if (filteredAndSortedWorkouts.length === 0) return false;
        // Check if all filtered workouts are in the open state
        return filteredAndSortedWorkouts.every(w => openWorkouts[w.id]);
    }, [filteredAndSortedWorkouts, openWorkouts]);

    return (
        <div className="container py-6 space-y-6 overflow-x-hidden">
            {/* ── Page Header & Hero ── */}
            <div className="relative rounded-2xl overflow-hidden mb-6 h-40 md:h-48"
                 style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'url(/images/exercise_bg_all.png)',
                    backgroundSize: 'cover', backgroundPosition: 'center 40%',
                    filter: 'brightness(0.5)',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.2) 50%, rgba(16,185,129,0.2) 100%)',
                }} />
                
        <div className="relative z-10 h-full flex flex-col justify-center px-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1 w-8 bg-gym-blue rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gym-blue">Evolutionary Analytics</span>
                </div>
                <h1 className="text-2xl md:text-5xl font-black text-white leading-tight uppercase italic flex items-center gap-3">
                  Intelligence Dashboard
                </h1>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowHelp(true)} className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10">
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

            {/* ── Action Buttons ── */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => navigate('/body-metrics')} className="bg-gym-card border-none hover:bg-white/5 h-10 rounded-xl">
                        <User className="mr-2 h-4 w-4 text-cyan-400" /> Body Metrics
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/2nd-health-metrics')} className="bg-gym-card border-none hover:bg-white/5 h-10 rounded-xl">
                        <Activity className="mr-2 h-4 w-4 text-rose-400" /> Health Metrics
                    </Button>
                </div>
                <Button variant="outline" size="sm" onClick={handleManualSync} disabled={isManualSyncing} className="bg-gym-card border-none hover:bg-white/5 h-10 rounded-xl">
                    <Watch className={`h-4 w-4 mr-2 text-amber-400 ${isManualSyncing ? 'animate-spin' : ''}`} />
                    {isManualSyncing ? 'Syncing...' : 'Sync Smartwatch'}
                </Button>
            </div>

            <StatsHelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
            <SmartWorkoutEntryDialog
                isOpen={smartEntryDialog.isOpen}
                onClose={() => setSmartEntryDialog({ isOpen: false, workoutId: '' })}
                workoutId={smartEntryDialog.workoutId}
                onSave={(data) => { updateSmartwatchWorkout(smartEntryDialog.workoutId, data); setSmartEntryDialog({ isOpen: false, workoutId: '' }); }}
                existingData={smartEntryDialog.existingData}
            />

            <div className="bg-gym-card/50 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                        <Flame className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                        <span className="text-xs font-black uppercase tracking-wider text-gray-500">Filtered Energy Burned</span>
                        <div className="text-xl font-black text-white leading-none mt-0.5">
                            {formatCalories(filteredCalories)}
                        </div>
                    </div>
                </div>
                
                <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 gap-1">
                    {['day', 'week', 'month', 'year', 'all'].map((t) => (
                        <button
                            key={t}
                            onClick={() => handleFilterChange(t as any)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                filterType === t 
                                ? 'bg-gym-blue text-white shadow-lg shadow-blue-500/20' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard title={`${filterType === 'all' ? 'Total' : filterType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Workouts`} value={totals.totalWorkouts} icon={Dumbbell} />
                <StatsCard title="Active Duration" value={formatWorkoutDuration(totals.totalTime)} icon={Clock} />
                <StatsCard title="Volume Sets" value={totals.totalSets} icon={ListChecks} />
                <StatsCard title="Total Reps" value={totals.totalReps} icon={Repeat} />
            </div>


            <div className="card-glass p-4">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-semibold">Workout History</h2>
                    <div className="flex items-center gap-2 flex-wrap text-sm w-full sm:w-auto">
                        <WorkoutHistoryFilter 
                            filterType={filterType}
                            onFilterChange={setFilterType}
                            showArchived={showArchived}
                            onShowArchivedChange={setShowArchived}
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-gym-card border-none hover:bg-white/5 h-10 rounded-xl font-bold">Type ({categoryFilter}) <ChevronDown className="h-4 w-4 ml-1" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                                {['All', 'Strength', 'Cardio', 'Hybrid', 'Weights', 'Single Exercise', 'Bodyweight', 'General', 'Mixed'].map(type => (
                                    <DropdownMenuItem key={type} onClick={() => setCategoryFilter(type)}>{type}</DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleAll(!isAllExpanded)}
                            className="w-10 h-10 p-0 rounded-xl bg-gym-card border-none hover:bg-white/5"
                            title={isAllExpanded ? "Collapse All" : "Expand All"}
                        >
                            {isAllExpanded ? <ChevronDown className="h-5 w-5 text-gym-blue rotate-180" /> : <ChevronDown className="h-5 w-5 text-gym-blue" />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {Object.entries(groupedWorkouts).map(([groupName, groupWorkouts]) => (
                        <Collapsible
                            key={groupName}
                            open={openGroups[groupName]}
                            onOpenChange={(isOpen) => setOpenGroups(prev => ({ ...prev, [groupName]: isOpen }))}
                            className="space-y-3"
                        >
                            <CollapsibleTrigger className="w-full">
                                <div className="flex items-center gap-3 p-3 bg-gym-card rounded-lg hover:bg-gym-card-hover border border-gray-800">
                                    <h2 className="text-lg font-bold ml-2">{groupName}</h2>
                                    <span className="bg-gym-blue/20 text-gym-blue text-xs px-2 py-0.5 rounded-full font-semibold">{groupWorkouts.length}</span>
                                    <div className="flex-1 flex justify-end mr-2">
                                        <ChevronDown className={`h-5 w-5 transition-transform ${openGroups[groupName] ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-4 pt-1 ml-2 border-l-2 border-gym-blue/20 pl-4 animate-in fade-in slide-in-from-top-2">
                                {groupWorkouts.map(workout => {
                                    const type = getWorkoutType(workout as Workout);
                                    const isSmartwatch = workout.fromSmartwatch;
                                    return (
                                        <Collapsible 
                                            key={workout.id} 
                                            ref={el => { workoutRefs.current[workout.id] = el; }}
                                            className="group bg-gym-darker rounded-lg border border-gray-700 hover:border-gym-blue"
                                            open={openWorkouts[workout.id]}
                                            onOpenChange={(isOpen) => setOpenWorkouts(prev => ({ ...prev, [workout.id]: isOpen }))}
                                        >
                                            <div className="flex flex-col w-full">
                                                <CollapsibleTrigger className="w-full p-4 pb-2 text-left">
                                                    {/* Title row */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <h3 className="font-semibold text-base leading-tight">{workout.name}</h3>
                                                                {isSmartwatch ? (
                                                                    <div className="flex items-center gap-1 bg-blue-600/20 px-2 py-0.5 rounded-md text-blue-400 text-xs shrink-0">
                                                                        <Watch className="h-3 w-3" /> Smartwatch
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1 bg-amber-600/20 px-2 py-0.5 rounded-md text-amber-400 text-xs shrink-0">
                                                                        <User className="h-3 w-3" /> Manual
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                                                                <span>{format(new Date(workout.startTime), 'MMM d, yyyy - h:mm a')}</span>
                                                                {workout.totalTime && <span>| {formatDuration(workout.totalTime)}</span>}
                                                                {type !== 'General' && <span className="text-gym-blue font-medium">| {type}</span>}
                                                                <span>| {formatCalories(calculateCalories((workout.totalTime || 0)/60, latestWeight, type==='Cardio'||type==='Slide Board'))}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180 shrink-0 mt-1" />
                                                    </div>
                                                </CollapsibleTrigger>

                                                {/* Action buttons row — always visible, never overflows */}
                                                <div className="flex items-center gap-1 border-t border-gray-800/50 px-4 py-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Redo Workout" onClick={(e) => { e.stopPropagation(); startWorkout(workout.type, workout.exercises); navigate('/workout'); }}>
                                                        <Play className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedWorkout(workout as Workout); }} title="Basic Stats Chart">
                                                        <BarChart2 className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedAdvancedWorkout(workout as Workout); }} title="Advanced Biometric Analytics">
                                                        <Zap className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => isSmartwatch ? handleEditSmartwatchWorkout(e, workout as Workout) : handleEdit(e, workout.id, workout.notes)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); archiveWorkout(workout.id, !workout.isArchived); }} title={workout.isArchived ? "Restore Workout" : "Archive Workout"}>
                                                        {workout.isArchived ? <ArchiveRestore className="h-4 w-4 text-green-500" /> : <Archive className="h-4 w-4 text-white" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => handleDelete(e, workout.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CollapsibleContent className="px-4 pb-4 border-t border-gray-800 animate-in fade-in slide-in-from-top-1">
                                                {editingWorkoutId === workout.id ? (
                                                    <div className="pt-4 space-y-2">
                                                        <Textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} className="bg-gym-dark border-gray-600" />
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                                                            <Button size="sm" className="bg-gym-blue" onClick={(e) => handleSave(e, workout.id)}>Save</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="pt-4 space-y-4">
                                                        {workout.notes && <p className="text-gray-300 italic text-sm bg-black/20 p-2 rounded">{workout.notes}</p>}
                                                        <div className="grid gap-3">
                                                            {(workout.sets || []).reduce((groups: any[], set) => {
                                                                const exName = getExerciseById(set.exerciseId)?.name || 'Exercise';
                                                                const existing = groups.find(g => g.exerciseId === set.exerciseId);
                                                                if (existing) existing.sets.push(set);
                                                                else groups.push({ exerciseId: set.exerciseId, name: exName, sets: [set] });
                                                                return groups;
                                                            }, []).map((ex, idx) => (
                                                                <div key={idx} className="bg-gym-card/30 p-3 rounded-lg border border-gray-800/50">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        {(() => {
                                                                            const exercise = getExerciseById(ex.exerciseId);
                                                                            if (exercise?.startPositionUrl) {
                                                                                return <img src={exercise.startPositionUrl} alt="" className="w-10 h-10 rounded-lg object-contain bg-gym-dark flex-shrink-0" />;
                                                                            }
                                                                            const thumb = exercise?.thumbnailUrl || exercise?.pictureUrl;
                                                                            if (thumb) {
                                                                                return <img src={thumb} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />;
                                                                            }
                                                                            return (
                                                                                <div className="w-10 h-10 rounded-lg bg-gym-dark flex items-center justify-center flex-shrink-0">
                                                                                    <Dumbbell className="h-5 w-5 text-gym-blue opacity-50" />
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                        <div>
                                                                            <span className="font-semibold text-sm block">{ex.name}</span>
                                                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{getExerciseById(ex.exerciseId)?.category || ''}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                        {ex.sets.filter((s:any) => s.completed).map((s:any, sIdx:number) => (
                                                                            <div key={sIdx} className="text-xs bg-black/20 px-2 py-1 rounded flex justify-between text-gray-400">
                                                                                 <span className="text-gym-blue">Set {sIdx+1}</span>
                                                                                 <span>
                                                                                    {[
                                                                                        s.weight ? `${fmtNum(s.weight)}lbs` : null,
                                                                                        s.reps ? `${s.reps}r` : null,
                                                                                        s.time ? formatTimeDisplay(s.time) : null,
                                                                                        s.duration ? formatTimeDisplay(s.duration) : null,
                                                                                        s.distance ? `${fmtNum(s.distance)}mi` : null,
                                                                                        s.incline ? `${fmtNum(s.incline)}%` : null,
                                                                                        s.steps ? `${s.steps} st` : null,
                                                                                        s.avgHeartRate ? `${s.avgHeartRate} bpm` : null,
                                                                                        s.maxHeartRate ? `Max: ${s.maxHeartRate}` : null,
                                                                                        s.caloriesBurned ? `${s.caloriesBurned} cal` : null,
                                                                                        s.bloodOxygen ? `${s.bloodOxygen} %O2` : null,
                                                                                        s.glucose ? `${s.glucose} gl` : null,
                                                                                    ].filter(Boolean).join(' • ')}
                                                                                 </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                })}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                    {filteredAndSortedWorkouts.length === 0 && (
                        <div className="text-center py-20 bg-gym-darker rounded-xl border border-dashed border-gray-800">
                            <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No workouts found</h3>
                            <p className="text-gray-500 mb-6">Start your first workout to see your history here.</p>
                            <Button onClick={() => navigate('/create-workout')} className="bg-gym-blue">Start Workout</Button>
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={!!workoutToDelete} onOpenChange={(open) => !open && setWorkoutToDelete(null)}>
                <AlertDialogContent className="bg-gym-dark-card border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <WorkoutStatsGraphPopup isOpen={!!selectedWorkout} onClose={() => setSelectedWorkout(null)} workout={selectedWorkout} getExerciseById={getExerciseById} />
            <AdvancedWorkoutMetricsChart isOpen={!!selectedAdvancedWorkout} onClose={() => setSelectedAdvancedWorkout(null)} workout={selectedAdvancedWorkout} getExerciseById={getExerciseById} />
        </div>
    );
};

export default Stats;
