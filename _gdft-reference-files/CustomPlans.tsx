
import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X, 
  Save,
  ClipboardList,
  HelpCircle,
  Eye,
  Trash,
  Edit,
  Dumbbell,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  PlayCircle,
  ChevronRight,
  GripVertical,
  Building2,
  ArrowLeft
} from "lucide-react";
import CustomGymBuilder from "@/components/ui/CustomGymBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useExercise } from "@/contexts/ExerciseContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomPlansHelpPopup from "@/components/ui/CustomPlansHelpPopup";

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  category?: string;
  thumbnailUrl?: string;
  sets?: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  incline?: string;
}

interface Day {
  id: string;
  name: string;
  expanded: boolean;
  exercises: Exercise[];
  workouts?: { id: string; name: string }[];
}

interface Plan {
  id: string;
  name: string;
  days: Day[];
}

// Per-day color themes
const DAY_THEMES = [
  { label: 'cyan',   gradient: 'linear-gradient(135deg,#0e7490,#06b6d4)', border: '#06b6d4', glow: 'rgba(6,182,212,0.35)',   badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'   },
  { label: 'violet', gradient: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', border: '#8b5cf6', glow: 'rgba(139,92,246,0.35)',   badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  { label: 'rose',   gradient: 'linear-gradient(135deg,#9f1239,#f43f5e)', border: '#f43f5e', glow: 'rgba(244,63,94,0.35)',    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'   },
  { label: 'amber',  gradient: 'linear-gradient(135deg,#b45309,#f59e0b)', border: '#f59e0b', glow: 'rgba(245,158,11,0.35)',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { label: 'emerald',gradient: 'linear-gradient(135deg,#065f46,#10b981)', border: '#10b981', glow: 'rgba(16,185,129,0.35)',   badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { label: 'orange', gradient: 'linear-gradient(135deg,#c2410c,#f97316)', border: '#f97316', glow: 'rgba(249,115,22,0.35)',   badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { label: 'sky',    gradient: 'linear-gradient(135deg,#075985,#38bdf8)', border: '#38bdf8', glow: 'rgba(56,189,248,0.35)',   badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40'       },
];

// Inline exercise picker component
const ExercisePicker: React.FC<{
  allExercises: any[];
  onSelect: (ex: any) => void;
  onCancel: () => void;
}> = ({ allExercises, onSelect, onCancel }) => {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = allExercises
    .filter(ex => ex.name?.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 30);

  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} className="p-3 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search exercises..."
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
        />
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }} className="space-y-1 pr-1">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-4">No exercises match "{q}"</p>
        ) : filtered.map(ex => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left group"
          >
            {ex.thumbnailUrl || ex.pictureUrl
              ? <img src={ex.thumbnailUrl || ex.pictureUrl} alt="" className="w-9 h-9 rounded-md object-cover flex-shrink-0 opacity-90" />
              : <div className="w-9 h-9 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="h-4 w-4 text-gray-500" />
                </div>
            }
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{ex.name}</div>
              <div className="text-[10px] text-gray-500 truncate">{ex.category}{ex.muscleGroups?.length ? ` · ${ex.muscleGroups.slice(0,2).join(', ')}` : ''}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

const CustomPlans = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { saveCustomPlan, customPlans, deleteCustomPlan, updateCustomPlan, startWorkout, savedWorkoutTemplates } = useWorkout();
  const { exercises, filterExercises } = useExercise();
  const [planName, setPlanName] = useState("");
  const [days, setDays] = useState<Day[]>([{
    id: "day1", name: "Day 1", expanded: true, exercises: [], workouts: []
  }]);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);
  const [viewDayPlanOpen, setViewDayPlanOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [addWorkoutDialogOpen, setAddWorkoutDialogOpen] = useState(false);
  const [currentDayForWorkout, setCurrentDayForWorkout] = useState<string | null>(null);
  // Track which exercise row is showing the picker
  const [activePicker, setActivePicker] = useState<string | null>(null); // "dayId:exerciseId"
  // Drag-to-reorder state
  const dragSrcRef = useRef<{ dayId: string; exId: string } | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null); // "dayId:exId"
  // My Plans dialog: which day row is expanded ("planId:dayId")
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);
  const toggleDayPreview = (key: string) =>
    setExpandedDayKey(prev => prev === key ? null : key);
  const [gymBuilderOpen, setGymBuilderOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("showPlans") === "true") {
      setPlansDialogOpen(true);
      const p = new URLSearchParams(searchParams);
      p.delete("showPlans");
      setSearchParams(p, { replace: true });
    }
    
    if (searchParams.get("builder") === "true") {
      setGymBuilderOpen(true);
      const p = new URLSearchParams(searchParams);
      p.delete("builder");
      setSearchParams(p, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const getInputFields = (category: string | undefined) => {
    if (category === 'Cardio') return [
      { key: 'time', label: 'Min', placeholder: '30' },
      { key: 'distance', label: 'Dist', placeholder: '5km' },
      { key: 'incline', label: 'Incl', placeholder: '2%' },
    ];
    if (category === 'Slide Board') return [
      { key: 'sets', label: 'Sets', placeholder: '3' },
      { key: 'reps', label: 'Reps', placeholder: '10' },
      { key: 'time', label: 'Sec', placeholder: '60' },
    ];
    if (category === 'Weights') return [
      { key: 'sets', label: 'Sets', placeholder: '3' },
      { key: 'reps', label: 'Reps', placeholder: '10' },
      { key: 'weight', label: 'lbs', placeholder: '50' },
    ];
    return [
      { key: 'sets', label: 'Sets', placeholder: '3' },
      { key: 'reps', label: 'Reps', placeholder: '10' },
    ];
  };

  const handleAddDay = () => {
    setDays([...days, { id: generateId(), name: `Day ${days.length + 1}`, expanded: true, exercises: [], workouts: [] }]);
  };

  const handleRemoveDay = (dayId: string) => {
    if (days.length <= 1) { toast.error("You need at least one day in your plan."); return; }
    setDays(days.filter(d => d.id !== dayId));
  };

  const handleDayNameChange = (dayId: string, name: string) =>
    setDays(days.map(d => d.id === dayId ? { ...d, name } : d));

  const handleToggleDay = (dayId: string) =>
    setDays(days.map(d => d.id === dayId ? { ...d, expanded: !d.expanded } : d));

  const handleAddExercise = (dayId: string) => {
    const newId = generateId();
    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      return { ...d, exercises: [...d.exercises, { id: newId, exerciseId: '', name: '', sets: '', reps: '', weight: '', distance: '', time: '', incline: '' }] };
    }));
    setActivePicker(`${dayId}:${newId}`);
  };

  const handleSelectExercise = (dayId: string, exerciseId: string, ex: any) => {
    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        exercises: d.exercises.map(e => {
          if (e.id !== exerciseId) return e;
          return {
            ...e,
            exerciseId: ex.id,
            name: ex.name,
            category: ex.category,
            thumbnailUrl: ex.thumbnailUrl || ex.pictureUrl,
            sets: ex.defaultSets?.toString() ?? '',
            reps: ex.defaultReps?.toString() ?? '',
            weight: ex.defaultWeight?.toString() ?? '',
            distance: ex.defaultDistance?.toString() ?? '',
            time: ex.defaultTime?.toString() ?? '',
            incline: ex.defaultIncline?.toString() ?? '',
          };
        })
      };
    }));
    setActivePicker(null);
  };

  const handleExerciseFieldChange = (dayId: string, exerciseId: string, field: keyof Exercise, value: string) => {
    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      return { ...d, exercises: d.exercises.map(e => e.id === exerciseId ? { ...e, [field]: value } : e) };
    }));
  };

  const handleRemoveExercise = (dayId: string, exerciseId: string) => {
    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      return { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) };
    }));
    if (activePicker === `${dayId}:${exerciseId}`) setActivePicker(null);
  };

  const handleReorderExercises = (dayId: string, fromId: string, toId: string) => {
    if (fromId === toId) return;
    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      const exs = [...d.exercises];
      const fromIdx = exs.findIndex(e => e.id === fromId);
      const toIdx   = exs.findIndex(e => e.id === toId);
      if (fromIdx === -1 || toIdx === -1) return d;
      const [moved] = exs.splice(fromIdx, 1);
      exs.splice(toIdx, 0, moved);
      return { ...d, exercises: exs };
    }));
  };

  const handleAddWorkout = (dayId: string) => { setCurrentDayForWorkout(dayId); setAddWorkoutDialogOpen(true); };

  const handleSelectWorkoutTemplate = (templateId: string) => {
    if (!currentDayForWorkout) return;
    const template = savedWorkoutTemplates.find(t => t.id === templateId);
    if (!template) { toast.error("Workout template not found"); return; }
    const workoutExercises: Exercise[] = template.exercises.map(exId => {
      const ex = exercises.find(e => e.id === exId);
      return { id: generateId(), exerciseId: ex?.id || '', name: ex?.name || 'Unknown', sets: '3', reps: '10', weight: '' };
    });
    setDays(days.map(d => d.id === currentDayForWorkout
      ? { ...d, exercises: [...d.exercises, ...workoutExercises], workouts: [...(d.workouts || []), { id: generateId(), name: template.name }] }
      : d
    ));
    setAddWorkoutDialogOpen(false);
    setCurrentDayForWorkout(null);
    toast.success(`Added workout "${template.name}"`);
  };

  const handleViewDayPlan = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (day) { setSelectedDay(day); setViewDayPlanOpen(true); }
  };

  const handleSavePlan = () => {
    if (!planName.trim()) { toast.error("Please enter a plan name"); return; }
    if (!days.some(d => d.exercises.length > 0)) { toast.error("Please add at least one exercise"); return; }
    try {
      const cleanedDays = days.map(d => ({ id: d.id, name: d.name, exercises: d.exercises, workouts: d.workouts || [] }));
      if (editingPlan) {
        updateCustomPlan(editingPlan, { name: planName, days: cleanedDays, createdAt: Date.now() });
        setEditingPlan(null);
      } else {
        saveCustomPlan({ name: planName, days: cleanedDays });
      }
      toast.success(`Plan ${editingPlan ? 'updated' : 'saved'} successfully!`);
      setPlanName('');
      setDays([{ id: generateId(), name: 'Day 1', expanded: true, exercises: [], workouts: [] }]);
    } catch (err) {
      toast.error(`Failed to save plan: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    deleteCustomPlan(planId);
    toast.success('Plan deleted');
    if (editingPlan === planId) {
      setEditingPlan(null); setPlanName('');
      setDays([{ id: generateId(), name: 'Day 1', expanded: true, exercises: [], workouts: [] }]);
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan.id);
    setPlanName(plan.name);
    setDays(plan.days.map((d: any) => ({ ...d, expanded: true })));
    setPlansDialogOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('Plan loaded for editing');
  };

  const handlePerformWorkout = (day: Day) => {
    if (!day.exercises.length) { toast.error('No exercises in this day plan'); return; }
    const planOverrides = day.exercises.filter(e => e.exerciseId).map(e => ({
      exerciseId: e.exerciseId, sets: e.sets, reps: e.reps, weight: e.weight,
      distance: e.distance, time: e.time, incline: e.incline,
    }));
    const ids = planOverrides.map(p => p.exerciseId);
    if (!ids.length) { toast.error('No valid exercises found'); return; }
    startWorkout(`${day.name} Workout`, ids, planOverrides);
    setPlansDialogOpen(false); setViewDayPlanOpen(false);
    toast.success(`Started ${day.name}`);
    navigate('/workout');
  };

  return (
    <div className="page-container page-transition pb-24">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/5">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Custom Plans</h1>
            <p className="text-gray-400 text-sm mt-0.5">Build & manage your personalized workout programs</p>
          </div>
        </div>
        <div className="flex items-center flex-wrap justify-end gap-2">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-900/30"
            onClick={() => navigate('/generate-plan')}>
            <Sparkles className="mr-2 h-4 w-4" /> AI Plan
          </Button>
          <Button variant="outline" onClick={() => setPlansDialogOpen(true)}>
            <ClipboardList className="mr-2 h-4 w-4" /> My Plans
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30" onClick={handleSavePlan}>
            <Save className="mr-2 h-4 w-4" /> {editingPlan ? 'Update Plan' : 'Save Plan'}
          </Button>
          {editingPlan && (
            <Button variant="destructive" onClick={() => {
              setEditingPlan(null); setPlanName('');
              setDays([{ id: generateId(), name: 'Day 1', expanded: true, exercises: [], workouts: [] }]);
            }}>
              Cancel
            </Button>
          )}
          <Button 
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
            onClick={() => setGymBuilderOpen(true)}
          >
            <Building2 className="mr-2 h-4 w-4" /> Gym Setup
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setHelpDialogOpen(true)}>
            <HelpCircle className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </div>

      <CustomPlansHelpPopup isOpen={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} />

      {/* ── Hero Banner ── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-36 md:h-44"
           style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/plans_hero_banner.png)',
          backgroundSize: 'cover', backgroundPosition: 'center 30%',
          filter: 'brightness(0.55)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(6,182,212,0.35) 0%, rgba(139,92,246,0.25) 50%, rgba(244,63,94,0.25) 100%)',
        }} />
        <div className="relative z-10 h-full flex flex-col justify-center px-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Workout Program Builder</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mb-1">
            {editingPlan ? `Editing: ${planName || 'Your Plan'}` : 'Design Your Perfect Program'}
          </h2>
          <p className="text-gray-300 text-sm">Add days, pick exercises, set your targets — then hit it!</p>
        </div>
      </div>

      {/* ── Plan Name ── */}
      <div className="rounded-xl border border-white/10 p-4 mb-6"
           style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Plan Name</label>
        <Input
          value={planName}
          onChange={e => setPlanName(e.target.value)}
          placeholder="e.g., My Awesome 5-Day Split"
          className="bg-white/5 border-white/10 text-white text-lg font-semibold placeholder:text-gray-600 focus:border-cyan-500/50"
        />
      </div>

      {/* ── Day Cards ── */}
      <div className="space-y-4">
        {days.map((day, index) => {
          const theme = DAY_THEMES[index % DAY_THEMES.length];
          return (
            <div key={day.id}
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1a2540 100%)',
                border: `1.5px solid ${day.expanded ? theme.border : 'rgba(255,255,255,0.08)'}`,
                boxShadow: day.expanded ? `0 0 24px ${theme.glow}` : 'none',
                borderRadius: 16,
                transition: 'all 0.25s ease',
              }}
            >
              {/* Day Header */}
              <div
                style={{
                  background: day.expanded ? theme.gradient : 'transparent',
                  borderRadius: day.expanded ? '14px 14px 0 0' : 14,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onClick={() => handleToggleDay(day.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <div className="text-white/50 text-xs font-bold uppercase tracking-widest w-14 flex-shrink-0">
                      Day {index + 1}
                    </div>
                    <input
                      value={day.name}
                      onChange={e => handleDayNameChange(day.id, e.target.value)}
                      className="bg-transparent text-white font-bold text-lg outline-none border-b border-white/20 focus:border-white/60 transition-colors w-40"
                      onClick={e => e.stopPropagation()}
                    />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                      {day.exercises.length} {day.exercises.length === 1 ? 'exercise' : 'exercises'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {day.exercises.length > 0 && !day.expanded && (
                      <Button variant="ghost" size="sm" className="text-white/70 hover:text-white h-8 px-2"
                        onClick={e => { e.stopPropagation(); handleViewDayPlan(day.id); }}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    )}
                    <Button variant="ghost" size="icon"
                      className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
                      onClick={e => { e.stopPropagation(); handleRemoveDay(day.id); }}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                    <div className="text-white/60">
                      {day.expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Collapsed preview */}
                {!day.expanded && day.exercises.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {day.exercises.slice(0, 5).map(ex => (
                      <span key={ex.id} className="text-[11px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                        {ex.name || 'Unnamed'}
                      </span>
                    ))}
                    {day.exercises.length > 5 && (
                      <span className="text-[11px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                        +{day.exercises.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded Body */}
              {day.expanded && (
                <div className="p-4 space-y-3">
                  {day.exercises.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No exercises yet — add one below!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {day.exercises.map((exercise, exIndex) => {
                        const fields = getInputFields(exercise.category);
                        const pickerKey = `${day.id}:${exercise.id}`;
                        const pickerOpen = activePicker === pickerKey;
                        const isDragOver = dragOverKey === pickerKey;
                        return (
                          <div key={exercise.id}
                            draggable
                            onDragStart={e => {
                              dragSrcRef.current = { dayId: day.id, exId: exercise.id };
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={e => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              setDragOverKey(pickerKey);
                            }}
                            onDragLeave={() => setDragOverKey(null)}
                            onDrop={e => {
                              e.preventDefault();
                              setDragOverKey(null);
                              if (dragSrcRef.current && dragSrcRef.current.dayId === day.id) {
                                handleReorderExercises(day.id, dragSrcRef.current.exId, exercise.id);
                              }
                              dragSrcRef.current = null;
                            }}
                            onDragEnd={() => { setDragOverKey(null); dragSrcRef.current = null; }}
                            style={{
                              background: isDragOver ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                              borderRadius: 12,
                              border: isDragOver
                                ? `1.5px dashed ${theme.border}`
                                : '1px solid rgba(255,255,255,0.07)',
                              transition: 'background 0.15s, border-color 0.15s',
                              transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
                            }}
                            className="p-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Drag handle */}
                              <div
                                className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors touch-none"
                                title="Drag to reorder"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>

                              {/* Number badge */}
                              <span className="text-[11px] font-black text-white/40 w-5 flex-shrink-0">
                                {String(exIndex + 1).padStart(2, '0')}
                              </span>

                              {/* Thumbnail if selected */}
                              {exercise.thumbnailUrl && (
                                <img src={exercise.thumbnailUrl} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                              )}

                              {/* Exercise name button */}
                              <button
                                onClick={() => setActivePicker(pickerOpen ? null : pickerKey)}
                                className="flex-1 text-left flex items-center gap-2 min-w-0"
                                style={{ minWidth: 120 }}
                              >
                                <span 
                                  className={`text-sm font-semibold whitespace-normal break-words ${exercise.name ? 'text-white' : 'text-gray-500'}`}
                                  title={exercise.name}
                                >
                                  {exercise.name || 'Tap to select exercise…'}
                                </span>
                                {exercise.category && (
                                  <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0">
                                    {exercise.category}
                                  </span>
                                )}
                              </button>

                              {/* Small metric inputs */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {fields.map(f => (
                                  <div key={f.key} className="flex flex-col items-center" style={{ minWidth: 44 }}>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">{f.label}</span>
                                    <input
                                      value={(exercise[f.key as keyof Exercise] as string) || ''}
                                      onChange={e => handleExerciseFieldChange(day.id, exercise.id, f.key as keyof Exercise, e.target.value)}
                                      placeholder={f.placeholder}
                                      style={{
                                        width: 44, textAlign: 'center', fontSize: 13, fontWeight: 700,
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 6, color: '#fff', outline: 'none', padding: '3px 4px',
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Remove button */}
                              <button
                                onClick={() => handleRemoveExercise(day.id, exercise.id)}
                                className="text-red-400/50 hover:text-red-400 transition-colors flex-shrink-0 ml-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Inline exercise picker */}
                            {pickerOpen && (
                              <ExercisePicker
                                allExercises={exercises}
                                onSelect={ex => handleSelectExercise(day.id, exercise.id, ex)}
                                onCancel={() => setActivePicker(null)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Workouts added */}
                  {day.workouts && day.workouts.length > 0 && (
                    <div className="space-y-1">
                      {day.workouts.map(w => (
                        <div key={w.id} className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-2 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium">{w.name}</span>
                          <span className="text-gray-600 text-xs">(imported workout)</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action bar */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    <Button
                      size="sm"
                      style={{ background: theme.gradient, color: '#fff', border: 'none' }}
                      className="shadow-md hover:opacity-90 transition-opacity"
                      onClick={() => handleAddExercise(day.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Exercise
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white"
                      onClick={() => handleAddWorkout(day.id)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Workout Template
                    </Button>
                    {day.exercises.length > 0 && (
                      <>
                        <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white"
                          onClick={() => handleViewDayPlan(day.id)}>
                          <Eye className="h-4 w-4 mr-1" /> Preview
                        </Button>
                        <Button size="sm" className="ml-auto bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                          onClick={() => handlePerformWorkout(day)}>
                          <PlayCircle className="h-4 w-4 mr-1" /> Start Day
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add Day ── */}
      <button
        onClick={handleAddDay}
        className="w-full mt-5 rounded-xl border-2 border-dashed border-white/15 text-gray-400 hover:text-white hover:border-white/30 transition-all py-4 flex items-center justify-center gap-2 font-semibold text-sm"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <Plus className="h-5 w-5" /> Add Day
      </button>

      {/* ── My Plans Dialog ── */}
      <Dialog open={plansDialogOpen} onOpenChange={setPlansDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto bg-[#0f172a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-cyan-400" /> Your Custom Plans
            </DialogTitle>
            <DialogDescription className="text-gray-400">All your saved workout programs.</DialogDescription>
          </DialogHeader>
          {customPlans?.length > 0 ? (
            <div className="grid gap-3 py-3">
              {customPlans.map((plan: any, pi: number) => {
                const theme = DAY_THEMES[pi % DAY_THEMES.length];
                return (
                  <div key={plan.id}
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}30`, borderRadius: 14 }}
                    className="overflow-hidden">
                    {/* Plan header */}
                    <div style={{ background: theme.gradient, padding: '10px 16px' }} className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {plan.name}
                          {(plan as any).aiGenerated && (
                            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5" /> AI
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/60">{plan.days?.length} days · Created {new Date(plan.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 h-8"
                          onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-300/80 hover:text-red-300 hover:bg-red-900/20 h-8"
                          onClick={() => handleDeletePlan(plan.id)}>
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Days */}
                    <div className="p-3 space-y-2">
                      {plan.days?.map((day: any) => {
                        const dayKey = `${plan.id}:${day.id}`;
                        const isExpanded = expandedDayKey === dayKey;
                        const hasExercises = (day.exercises?.length || 0) > 0;
                        return (
                          <div key={day.id}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              borderRadius: 12,
                              border: isExpanded ? `1px solid ${theme.border}50` : '1px solid transparent',
                              overflow: 'hidden',
                              transition: 'border-color 0.2s',
                            }}
                          >
                            {/* Clickable header row */}
                            <div
                              className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors select-none"
                              onClick={() => hasExercises && toggleDayPreview(dayKey)}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {hasExercises && (
                                  <ChevronDown
                                    className="h-3.5 w-3.5 text-gray-500 flex-shrink-0 transition-transform duration-200"
                                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
                                  />
                                )}
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-white">{day.name}</div>
                                  <div className="text-[11px] text-gray-500">
                                    {hasExercises
                                      ? `${day.exercises.length} exercise${day.exercises.length !== 1 ? 's' : ''} — tap to preview`
                                      : 'No exercises'}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-emerald-700 hover:bg-emerald-600 text-white h-8 flex-shrink-0 ml-2"
                                onClick={e => { e.stopPropagation(); handlePerformWorkout({ ...day, expanded: false }); }}
                                disabled={!hasExercises}
                              >
                                <PlayCircle className="h-3.5 w-3.5 mr-1" /> Start
                              </Button>
                            </div>

                            {/* Expandable exercise list */}
                            {isExpanded && hasExercises && (
                              <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }} className="px-3 pb-3 pt-2 space-y-2">
                                {day.exercises.map((ex: any, i: number) => (
                                  <div key={ex.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                                    {/* Position badge */}
                                    <span className="text-[10px] font-black text-white/30 w-4 flex-shrink-0">
                                      {String(i + 1).padStart(2, '0')}
                                    </span>
                                    {/* Thumbnail */}
                                    {ex.thumbnailUrl
                                      ? <img src={ex.thumbnailUrl} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                                      : <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                          <Dumbbell className="h-3.5 w-3.5 text-gray-600" />
                                        </div>
                                    }
                                    {/* Name + metrics */}
                                    <div className="flex-1 min-w-0">
                                      <div 
                                        className="text-sm font-semibold text-white whitespace-normal break-words"
                                        title={ex.name}
                                      >
                                        {ex.name || 'Unnamed'}
                                      </div>
                                      <div className="text-[11px] text-gray-500 mt-0.5">
                                        {[ex.sets && `${ex.sets} sets`, ex.reps && `${ex.reps} reps`, ex.weight && `${ex.weight} lbs`, ex.time && `${ex.time} min`].filter(Boolean).join(' · ')}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {/* Start button at bottom of preview */}
                                <button
                                  onClick={() => handlePerformWorkout({ ...day, expanded: false })}
                                  className="w-full mt-1 rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                                  style={{ background: theme.gradient }}
                                >
                                  <PlayCircle className="h-4 w-4" /> Start {day.name}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-700 mb-3" />
              <p className="text-gray-400 font-medium">No plans yet</p>
              <p className="text-gray-600 text-sm mt-1">Build your first program above!</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlansDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Day Plan Dialog ── */}
      <Dialog open={viewDayPlanOpen} onOpenChange={setViewDayPlanOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[80vh] overflow-y-auto bg-[#0f172a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedDay?.name} — Preview</DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="space-y-3 py-3">
              {selectedDay.exercises.length > 0 ? selectedDay.exercises.map((ex, i) => (
                <div key={ex.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                  {ex.thumbnailUrl
                    ? <img src={ex.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="h-4 w-4 text-gray-500" />
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <div 
                      className="font-semibold text-white text-sm whitespace-normal break-words"
                      title={ex.name}
                    >
                      {ex.name || 'Unnamed'}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {ex.sets && ex.reps ? `${ex.sets} sets × ${ex.reps} reps` : ''}
                      {ex.weight ? ` @ ${ex.weight} lbs` : ''}
                      {ex.time ? ` · ${ex.time} min` : ''}
                    </div>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-sm text-center py-6">No exercises added</p>}
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-2"
                onClick={() => handlePerformWorkout(selectedDay)}>
                <PlayCircle className="h-4 w-4 mr-2" /> Start This Day's Workout
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDayPlanOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Workout Template Dialog ── */}
      <Dialog open={addWorkoutDialogOpen} onOpenChange={setAddWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#0f172a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Add Saved Workout</DialogTitle>
            <DialogDescription className="text-gray-400">Pick a saved template — all its exercises will be added.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            {savedWorkoutTemplates?.length > 0 ? savedWorkoutTemplates.map(t => (
              <button key={t.id}
                onClick={() => handleSelectWorkoutTemplate(t.id)}
                className="w-full flex items-center gap-3 text-left bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.exercises.length} exercises · {t.type}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
              </button>
            )) : (
              <div className="text-center py-10">
                <Dumbbell className="h-10 w-10 mx-auto text-gray-700 mb-2" />
                <p className="text-gray-400">No saved workouts yet</p>
                <p className="text-gray-600 text-xs mt-1">Save a workout from the Workout page first.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddWorkoutDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CustomGymBuilder 
        isOpen={gymBuilderOpen} 
        onClose={() => setGymBuilderOpen(false)} 
      />
    </div>
  );
};

export default CustomPlans;
