
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Dumbbell, 
  Clock, 
  Calendar, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  ChevronDown,
  Info,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useExercise } from '@/contexts/ExerciseContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateWorkoutPlan, type AIWorkoutPlan } from '@/app/actions/gdft-gemini';
import { api } from '@/lib/api';

const GenerateWorkoutPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exercises } = useExercise();
  const { saveCustomPlan, customPlans, startWorkout } = useWorkout();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<AIWorkoutPlan | null>(null);

  // Form State
  const [goal, setGoal] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [duration, setDuration] = useState<number>(45);
  const [injuries, setInjuries] = useState<string>('');
  const [useProfileData, setUseProfileData] = useState(true);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);

  const goals = [
    {
      value: 'muscle_gain',
      label: 'Muscle Gain',
      sub: 'Hypertrophy & size',
      icon: '💪',
      bgImage: '/images/goal_bg_muscle_gain.png',
      gradient: 'linear-gradient(135deg, rgba(6,182,212,0.55) 0%, rgba(14,116,144,0.45) 100%)',
      accent: '#06b6d4',
      glow: 'rgba(6,182,212,0.45)',
    },
    {
      value: 'strength',
      label: 'Maximum Strength',
      sub: 'Power & heavy lifts',
      icon: '🏋️',
      bgImage: '/images/goal_bg_strength.png',
      gradient: 'linear-gradient(135deg, rgba(239,68,68,0.55) 0%, rgba(159,18,57,0.45) 100%)',
      accent: '#ef4444',
      glow: 'rgba(239,68,68,0.45)',
    },
    {
      value: 'fat_loss',
      label: 'Fat Loss & Toning',
      sub: 'Burn calories & define',
      icon: '🔥',
      bgImage: '/images/goal_bg_fat_loss.png',
      gradient: 'linear-gradient(135deg, rgba(249,115,22,0.55) 0%, rgba(194,65,12,0.45) 100%)',
      accent: '#f97316',
      glow: 'rgba(249,115,22,0.45)',
    },
    {
      value: 'endurance',
      label: 'Endurance',
      sub: 'Cardio & conditioning',
      icon: '🏃',
      bgImage: '/images/goal_bg_endurance.png',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.55) 0%, rgba(6,95,70,0.45) 100%)',
      accent: '#10b981',
      glow: 'rgba(16,185,129,0.45)',
    },
    {
      value: 'general_health',
      label: 'General Health',
      sub: 'Wellness & active recovery',
      icon: '🧘',
      bgImage: '/images/goal_bg_health.png',
      gradient: 'linear-gradient(135deg, rgba(168,85,247,0.55) 0%, rgba(109,40,217,0.45) 100%)',
      accent: '#a855f7',
      glow: 'rgba(168,85,247,0.45)',
    },
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner (0-1 years)' },
    { value: 'intermediate', label: 'Intermediate (1-3 years)' },
    { value: 'advanced', label: 'Advanced (3+ years)' }
  ];

  const equipmentGroups = [
    {
      label: '🏢 Full Gym Access',
      options: [
        { id: 'full_gym',      label: 'Commercial Gym',          desc: 'Full access to all machines & free weights' },
        { id: 'home_gym_full', label: 'Home Gym (Full Setup)',    desc: 'Barbell, rack, cables & machines' },
      ]
    },
    {
      label: '🏋️ Free Weights',
      options: [
        { id: 'barbell_rack',  label: 'Barbell & Squat Rack',    desc: 'Olympic bar, plates, squat rack' },
        { id: 'dumbbells',     label: 'Dumbbells Only',          desc: 'Full dumbbell set or adjustable' },
        { id: 'kettlebells',   label: 'Kettlebells',             desc: 'One or more kettlebells' },
        { id: 'bands',         label: 'Resistance Bands',        desc: 'Loop bands or tube bands' },
        { id: 'bodyweight',    label: 'Bodyweight Only',         desc: 'No equipment — body only' },
      ]
    },
    {
      label: '🏃 Cardio Machines',
      options: [
        { id: 'treadmill',     label: 'Treadmill',               desc: 'Running / walking machine' },
        { id: 'elliptical',    label: 'Elliptical Trainer',      desc: 'Low-impact full-body cardio' },
        { id: 'stationary_bike', label: 'Stationary Bike',       desc: 'Upright or recumbent cycle' },
        { id: 'rowing_machine',label: 'Rowing Machine',          desc: 'Full-body ergometer row' },
        { id: 'stair_climber', label: 'Stair Climber / Stepper', desc: 'Stair mill or step machine' },
      ]
    },
    {
      label: '⚙️ Specialty & Machines',
      options: [
        { id: 'slide_board',   label: 'Slide Board (Total Gym)', desc: 'Inclined sliding rail machine with cable pulley' },
        { id: 'cable_machine', label: 'Cable / Pulley Machine',  desc: 'Functional trainer or cable stack' },
        { id: 'smith_machine', label: 'Smith Machine',           desc: 'Fixed-rail barbell machine' },
        { id: 'trx_suspension',label: 'TRX / Suspension Straps', desc: 'Suspension trainer system' },
        { id: 'pull_up_bar',   label: 'Pull-Up Bar',             desc: 'Doorway or wall-mounted bar' },
      ]
    },
  ];

  // Flat list for compatibility with existing toggle/generate logic
  const equipmentOptions = equipmentGroups.flatMap(g => g.options);

  const handleGenerate = async () => {
    if (!goal || !level || equipment.length === 0) {
      toast.error("Please fill in all required fields (Goal, Level, Equipment)");
      return;
    }

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      toast.error("Gemini API Key is missing! Please configure it in .env");
      return;
    }

    setLoading(true);
    try {
      // 1. Gather User Context
      let userProfile = {};
      if (useProfileData && user) {
        try {
          // Fetch additional profile data if needed, or rely on what we have
          // For now, let's assume basics or mock. 
          // In a real scenario, we'd fetch body measurements here.
          const measurements = await api.measurements.list();
          const latestWeight = measurements.length > 0 ? measurements[0].weight : undefined;
          userProfile = {
            id: user.id,
            weight: latestWeight
            // Add more if available
          };
        } catch (e) {
          console.warn("Could not fetch user profile details", e);
        }
      }

      // 2. Prepare Exercise List for Context (Names only to save tokens)
      const availableExerciseNames = exercises.map(e => e.name);

      // 3. Call AI Service
      const plan = await generateWorkoutPlan(userProfile, {
        goal,
        level,
        equipment,
        daysPerWeek,
        durationMinutes: duration,
        injuries,
        availableExercises: availableExerciseNames
      });

      setGeneratedPlan(plan);
      setStep(3); // Result Step
      toast.success("Workout plan generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    try {
      console.log("💾 Starting to save AI-generated plan:", generatedPlan.planName);
      
      // Convert AI Plan to App's CustomPlan format (PlanDay[])
      const days = generatedPlan.days.map((aiDay, index) => {
        return {
          id: crypto.randomUUID(),
          name: aiDay.dayName,
          exercises: aiDay.exercises.map(aiEx => {
            // Try to match with existing exercise
            const matchedEx = exercises.find(e => e.name.toLowerCase() === aiEx.name.toLowerCase());
            
            // Generate parsable numeric values from strings like "3-4" or "12-15"
            // Simple parsing: take the first number found
            const parseFirstNum = (str: string) => {
              const match = str.match(/\d+/);
              return match ? match[0] : "";
            };

            return {
              id: crypto.randomUUID(),
              exerciseId: matchedEx ? matchedEx.id : "", // Empty if not found (custom/unknown)
              name: aiEx.name, // Use AI name if custom
              sets: aiEx.sets.toString(), // Keep as string for display
              reps: aiEx.reps.toString(),
              weight: "", // User to fill
              notes: aiEx.notes
            };
          })
        };
      });

      console.log("📝 Converted AI plan to custom plan format:", {
        name: generatedPlan.planName,
        daysCount: days.length,
        totalExercises: days.reduce((sum, day) => sum + day.exercises.length, 0)
      });

      // Save the plan with aiGenerated flag
      await saveCustomPlan({
        name: generatedPlan.planName,
        days: days,
        aiGenerated: true
      });

      console.log("✅ Plan saved successfully! Navigating to custom plans...");
      toast.success(`"${generatedPlan.planName}" saved to Custom Plans!`, { duration: 4000 });
      
      // Navigate and auto-open the plans dialog
      navigate('/custom-plans?showPlans=true');
    } catch (error) {
       console.error("❌ Error saving plan:", error);
       toast.error(`Failed to save plan: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleStartFirstDay = async () => {
    if (!generatedPlan || generatedPlan.days.length === 0) return;

    try {
      const firstDay = generatedPlan.days[0];
      const planOverrides = firstDay.exercises
        .filter(ex => {
          // Only include exercises that exist in our library
          const matchedEx = exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
          return !!matchedEx;
        })
        .map(ex => {
          const matchedEx = exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase())!;
          return {
            exerciseId: matchedEx.id,
            sets: ex.sets.toString(),
            reps: ex.reps.toString(),
            weight: "",
            time: "",
            distance: "",
            incline: ""
          };
        });

      const exerciseIds = planOverrides.map(p => p.exerciseId);

      if (exerciseIds.length === 0) {
        toast.error("No matching exercises found in your library for this workout.");
        return;
      }

      startWorkout(`${firstDay.dayName}`, exerciseIds, planOverrides);
      toast.success(`Started ${firstDay.dayName}!`);
      navigate('/workout');
    } catch (error) {
      console.error("❌ Error starting workout:", error);
      toast.error("Failed to start workout");
    }
  };

  const toggleEquipment = (id: string) => {
    setEquipment(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="page-container pb-24 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/5">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-400" />
          AI Workout Generator
        </h1>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-400">Step {step} of 3</span>
          <span className="text-xs text-gray-500">{step === 1 ? 'Goals & Level' : step === 2 ? 'Details' : 'Your Plan'}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="animate-fadeIn space-y-5">
          {/* Section header */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '20px 20px 16px',
          }}>
            <h2 className="text-xl font-black text-white tracking-tight">Let's define your path</h2>
            <p className="text-gray-400 text-sm mt-0.5">Pick your primary goal — each card shows a tailored program focus.</p>
          </div>

          {/* Goal cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((g) => {
              const isSelected = goal === g.value;
              return (
                <div
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${g.accent}` : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? `0 0 22px ${g.glow}` : 'none',
                    transition: 'all 0.22s ease',
                    minHeight: 100,
                  }}
                >
                  {/* Background photo */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${g.bgImage})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    opacity: isSelected ? 0.45 : 0.28,
                    transition: 'opacity 0.25s ease',
                  }} />
                  {/* Color gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: g.gradient,
                    opacity: isSelected ? 0.75 : 0.55,
                    transition: 'opacity 0.25s ease',
                  }} />
                  {/* Content */}
                  <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 14px' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-2xl mb-1" style={{ lineHeight: 1 }}>{g.icon}</div>
                        <div className="font-black text-white text-[15px] leading-tight">{g.label}</div>
                        <div className="text-[11px] text-white/65 mt-0.5">{g.sub}</div>
                      </div>
                      {isSelected && (
                        <div className="mt-0.5 flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5" style={{ color: g.accent, filter: `drop-shadow(0 0 4px ${g.glow})` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Level selector */}
          <div className="rounded-2xl" style={{
            background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 20px',
          }}>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Experience Level</label>
            <div className="grid grid-cols-3 gap-2">
              {levels.map(l => {
                const isActive = level === l.value;
                return (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 12,
                      border: isActive ? '1.5px solid #8b5cf6' : '1.5px solid rgba(255,255,255,0.1)',
                      background: isActive ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                      color: isActive ? '#c4b5fd' : '#9ca3af',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isActive ? '0 0 14px rgba(139,92,246,0.3)' : 'none',
                      lineHeight: 1.3,
                      textAlign: 'center' as const,
                    }}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next button */}
          <Button
            onClick={() => setStep(2)}
            disabled={!goal || !level}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 text-base shadow-lg shadow-purple-900/30"
          >
            Next Step <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <Card className="card-glass border-gray-700 animate-fadeIn">
          <CardHeader>
            <CardTitle>Logistics & Details</CardTitle>
            <CardDescription>Tell us about your equipment and schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-white font-semibold">Available Equipment</Label>
                <span className="text-[11px] text-gray-500">{equipment.length} selected · tap a group to expand</span>
              </div>
              {equipmentGroups.map(group => {
                const isOpen = openGroups.includes(group.label);
                const selectedCount = group.options.filter(o => equipment.includes(o.id)).length;
                return (
                  <div key={group.label} style={{
                    borderRadius: 14,
                    border: selectedCount > 0 ? '1.5px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'border-color 0.2s ease',
                  }}>
                    {/* Accordion header */}
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">{group.label}</span>
                        {selectedCount > 0 && (
                          <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full">
                            {selectedCount} selected
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className="h-4 w-4 text-gray-500 flex-shrink-0 transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </button>
                    {/* Accordion body */}
                    {isOpen && (
                      <div className="px-3 pb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.options.map((eq) => (
                            <div
                              key={eq.id}
                              onClick={() => toggleEquipment(eq.id)}
                              className={`cursor-pointer border rounded-xl p-3 text-sm transition-all ${
                                equipment.includes(eq.id)
                                  ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                                  : 'border-gray-700 hover:border-gray-600 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  equipment.includes(eq.id) ? 'bg-purple-500 border-purple-500' : 'border-gray-500'
                                }`}>
                                  {equipment.includes(eq.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                                </div>
                                <div className="min-w-0">
                                  <div className={`font-semibold leading-tight text-sm ${
                                    equipment.includes(eq.id) ? 'text-purple-300' : 'text-white'
                                  }`}>{eq.label}</div>
                                  <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">{eq.desc}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Frequency (Days per Week)</Label>
                  <span className="text-sm font-bold text-purple-400">{daysPerWeek} Days</span>
                </div>
                <Slider 
                  value={[daysPerWeek]} 
                  onValueChange={(val) => setDaysPerWeek(val[0])} 
                  min={2} 
                  max={6} 
                  step={1}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Session Duration</Label>
                  <span className="text-sm font-bold text-blue-400">{duration} Minutes</span>
                </div>
                <Slider 
                  value={[duration]} 
                  onValueChange={(val) => setDuration(val[0])} 
                  min={15} 
                  max={120} 
                  step={5}
                  className="py-4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Injuries or Restrictions (Optional)</Label>
              <Textarea 
                placeholder="e.g., Lower back pain, bad left knee..." 
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                className="bg-gym-darker border-gray-700 min-h-[80px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="use-profile" 
                checked={useProfileData}
                onCheckedChange={(checked) => setUseProfileData(checked === true)}
              />
              <label
                htmlFor="use-profile"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
              >
                Use my profile data (age, weight, history) for better results
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
             <Button variant="ghost" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={loading || equipment.length === 0} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-900/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Plan
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && generatedPlan && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="card-glass border-green-500/50 bg-green-500/5">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                   <CardTitle className="text-2xl text-white">{generatedPlan.planName}</CardTitle>
                   <CardDescription className="text-gray-300 mt-1">{generatedPlan.summary}</CardDescription>
                </div>
                <div className="bg-green-500/20 p-2 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                 {generatedPlan.tips.map((tip, idx) => (
                    <div key={idx} className="bg-gym-dark/50 text-xs px-2 py-1 rounded border border-gray-600 flex items-center">
                       <Info className="h-3 w-3 mr-1 text-blue-400" /> {tip}
                    </div>
                 ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {generatedPlan.days.map((day, index) => (
              <Card key={index} className="bg-gym-card border-gray-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg font-medium text-purple-300">{day.dayName}</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                   <ul className="space-y-3">
                      {day.exercises.map((ex, exIdx) => (
                        <li key={exIdx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                           <div>
                              <span className="font-semibold text-white">{ex.name}</span>
                              {ex.notes && <p className="text-xs text-gray-400 italic mt-0.5">{ex.notes}</p>}
                           </div>
                           <div className="flex items-center gap-3 mt-2 sm:mt-0 text-sm text-gray-300 bg-black/20 px-2 py-1 rounded">
                              <span>{ex.sets} Sets</span>
                              <span className="text-gray-600">•</span>
                              <span>{ex.reps} Reps</span>
                              {ex.rest && (
                                <>
                                  <span className="text-gray-600">•</span>
                                  <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {ex.rest}</span>
                                </>
                              )}
                           </div>
                        </li>
                      ))}
                   </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
             <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setStep(1)}
              >
                Start Over
             </Button>
             <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleStartFirstDay}
             >
                <Dumbbell className="mr-2 h-4 w-4" /> Start First Day
             </Button>
             <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSavePlan}
             >
                <Save className="mr-2 h-4 w-4" /> Save to My Plans
             </Button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-6">
            Disclaimer: AI-generated plans are suggestions only. Consult with a healthcare professional before starting any new exercise program.
          </p>
        </div>
      )}
    </div>
  );
};

export default GenerateWorkoutPlan;
