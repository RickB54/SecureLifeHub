import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactConfetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useSettings } from '@/contexts/SettingsContext';
import { formatWeight, kgToLbs, lbsToKg } from '@/lib/utils';
import type { HealthMetric, Workout } from '@/lib/types';
import { formatDurationFromMinutes } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Heart, Footprints, Clock, Zap, Flame, Timer, MapPin, HelpCircle, Moon, Pencil, ArrowLeft, Droplets, Brain, Gauge, Candy, Wind, Scale, Plus, Check, Trash2, CheckCircle2, SlidersHorizontal, ChevronRight, Watch, RefreshCcw, Info, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, isWithinInterval, startOfDay, endOfDay, startOfWeek, addDays } from 'date-fns';


import HealthMetricsHelpPopup from '@/components/ui/HealthMetricsHelpPopup';
import { HealthMeterCircle } from '@/components/ui/HealthMeterCircle';
import { TimelinePopup } from '@/components/ui/TimelinePopup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSmartDeviceIntegration } from '@/hooks/useSmartDeviceIntegration';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

// Unit conversion utilities
const convertToImperial = {
  // For display: convert stored metric values to imperial
  weight: (kg: number) => (kg * 2.20462).toFixed(1),
  volume: (ml: number) => (ml * 0.033814).toFixed(1),
  distance: (km: number) => (km * 0.621371).toFixed(2),
  height: (cm: number) => (cm * 0.393701).toFixed(1),
  glucose: (mgdl: number) => mgdl // Already in Imperial (mg/dL)
};

const convertFromImperial = {
  // For input: convert imperial input to metric for storage
  weight: (lbs: number) => lbs / 2.20462,
  volume: (floz: number) => floz / 0.033814,
  distance: (miles: number) => miles / 0.621371,
  height: (inches: number) => inches / 0.393701
};

const displayWeight = (value: number): string => {
  if (!value) return '0 lbs';
  return `${convertToImperial.weight(value)} lbs`;
};

const displayVolume = (value: number): string => {
  if (!value) return '0 fl oz';
  // Convert ml to fl oz for display
  return `${(value * 0.033814).toFixed(1)} fl oz`;
};

const SecondHealthMetricsPage: React.FC = () => {
  const navigate = useNavigate();
  const { unitSystem, testingModeEnabled, testOverrides } = useSettings();
  const { healthMetrics, workouts, addHealthMetric, updateHealthMetric, refreshHealthMetrics } = useWorkout();
  const { initializeSmartDeviceSync } = useSmartDeviceIntegration();
  
  // Confirmation state for deleting custom metrics
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<string | null>(null);
  
  // Force data refresh when page loads and initialize smart devices
  useEffect(() => {
    const refreshData = () => {
      console.log("🔄 Manual refresh triggered on Health Metrics page");
      const stored = localStorage.getItem('healthMetrics');
      console.log("🔄 Manual refresh - stored data:", stored);
      // Force WorkoutContext to reload
      refreshHealthMetrics();
    };
    
    // Initialize smart device integration
    const smartDeviceStatus = initializeSmartDeviceSync();
    console.log("🔗 Smart device integration status:", smartDeviceStatus);
    
    // Refresh data when page loads
    refreshData();
  }, [refreshHealthMetrics, initializeSmartDeviceSync]);

  const { toast } = useToast();
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Manual refresh function for the button
  const handleManualRefresh = async () => {
    console.log("🔄 Manual refresh button clicked");
    setIsManualSyncing(true);
    try {
      await refreshHealthMetrics();
      toast({ title: "Data Refreshed", description: "Health metrics data has been updated." });
    } finally {
      setIsManualSyncing(false);
    }
  };
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single'); // Add date mode selection
  const [currentMetricId, setCurrentMetricId] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'steps' | 'duration' | 'calories'>('steps');
  const [timelineInterval, setTimelineInterval] = useState<'day' | 'week' | 'month'>('week');
  
  // Manual override states for smartwatch metrics
  const [manualOverrides, setManualOverrides] = useState<{
    calories?: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    steps?: number;
    duration?: number;
    distance?: number;
    avgSpeed?: number;
    sleepDuration?: number;
    sleepQuality?: number;
    bodyWeight?: number;
    skeletalMuscle?: number;
    bodyFat?: number;
  }>({});
  
  // Target goals states
  const [targetGoals, setTargetGoals] = useState<{
    calories?: number;
    steps?: number;
    duration?: number;
    bodyWeight?: number;
    skeletalMuscle?: number;
    bodyFat?: number;
  }>({});
  
  // Edit dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string>('');
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [targetValues, setTargetValues] = useState<{[key: string]: string}>({});
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Manual entry fields
  const [waterIntakeMl, setWaterIntakeMl] = useState<string>('');
  const [waterIntakeUnit, setWaterIntakeUnit] = useState<'ml' | 'fl oz'>('ml');
  const [stressLevelRating, setStressLevelRating] = useState<string>('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<string>('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<string>('');
  const [glucose, setGlucose] = useState<string>('');
  const [glucoseUnit, setGlucoseUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');
  const [bloodOxygen, setBloodOxygen] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Custom health data
  const [customMetrics, setCustomMetrics] = useState<Array<{id: string, name: string, value: string, unit: string, timestamp?: number}>>([]);
  const [editingCustomMetric, setEditingCustomMetric] = useState<string | null>(null);

  const handleEditCustomMetric = (id: string) => {
    setEditingCustomMetric(id);
  };

  const handleSaveCustomMetric = (id: string, newValues: { name: string; value: string; unit: string }) => {
    setCustomMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, ...newValues } : metric
    ));
    setEditingCustomMetric(null);
    
    // Save to localStorage
    localStorage.setItem('customHealthMetrics', JSON.stringify(customMetrics));
  };

  const handleDeleteCustomMetric = (id: string) => {
    setMetricToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCustomMetric = () => {
    if (!metricToDelete) return;
    
    const id = metricToDelete;
    setCustomMetrics(prev => prev.filter(metric => metric.id !== id));
    
    // Save to localStorage
    const remaining = customMetrics.filter(metric => metric.id !== id);
    localStorage.setItem('customHealthMetrics', JSON.stringify(remaining));
    
    setIsDeleteDialogOpen(false);
    setMetricToDelete(null);
    toast({ title: "Deleted", description: "Metric removed successfully." });
  };
  const [newCustomMetricName, setNewCustomMetricName] = useState<string>('');

  const resetForm = useCallback(() => {
    setWaterIntakeMl('');
    setStressLevelRating('');
    setBloodPressureSystolic('');
    setBloodPressureDiastolic('');
    setGlucose('');
    setBloodOxygen('');
    setWeight('');
    setNotes('');
    setCurrentMetricId(null);
  }, []);

  // Load/Sync logic is now partially handled by WorkoutContext's healthMetrics
  // We should still sync local form state to the existing metric when healthMetrics or selectedDate changes
  useEffect(() => {
    const targetDate = format(selectedDate, 'yyyy-MM-dd');
    const existingMetric = healthMetrics.find(m => m.date === targetDate);
    
    if (existingMetric) {
      setCurrentMetricId(existingMetric.id);
      setWaterIntakeMl(existingMetric.waterIntakeMl?.toString() || '');
      setStressLevelRating(existingMetric.stressLevelRating?.toString() || '');
      setBloodPressureSystolic(existingMetric.bloodPressureSystolic?.toString() || '');
      setBloodPressureDiastolic(existingMetric.bloodPressureDiastolic?.toString() || '');
      setGlucose(existingMetric.glucose?.toString() || '');
      setBloodOxygen(existingMetric.bloodOxygen?.toString() || '');
      setWeight(existingMetric.weight?.toString() || '');
      setNotes(existingMetric.notes || '');
      
      setManualOverrides({
        calories: existingMetric.caloriesBurned,
        avgHeartRate: existingMetric.avgHeartRate,
        maxHeartRate: existingMetric.maxHeartRate,
        steps: existingMetric.steps,
        duration: existingMetric.duration,
        distance: existingMetric.distance,
        avgSpeed: existingMetric.avgSpeed,
        sleepDuration: (existingMetric as any).sleepDurationHours,
        sleepQuality: (existingMetric as any).sleepQualityRating
      });
    } else {
        // Reset form for new day
        setWaterIntakeMl('');
        setStressLevelRating('');
        setBloodPressureSystolic('');
        setBloodPressureDiastolic('');
        setGlucose('');
        setBloodOxygen('');
        setWeight('');
        setNotes('');
        setManualOverrides({});
        setCurrentMetricId(null);
    }
  }, [selectedDate, healthMetrics]);

  // localStorage effects removed as per user request (Supabase only)

  // Manual edit handlers
  const openEditDialog = (metric: string) => {
    console.log("Opening edit dialog for:", metric);
    setEditingMetric(metric);
    
    const currentValues: {[key: string]: string} = {};
    const currentTargets: {[key: string]: string} = {};
    
    switch(metric) {
      case 'calories':
      case 'steps':
      case 'duration':
        currentValues[metric] = manualOverrides[metric]?.toString() || '';
        currentTargets[metric] = targetGoals[metric]?.toString() || '';
        break;
      case 'bodyComposition':
        currentValues.bodyWeight = manualOverrides.bodyWeight ? convertToImperial.weight(manualOverrides.bodyWeight) : '';
        currentValues.skeletalMuscle = manualOverrides.skeletalMuscle ? convertToImperial.weight(manualOverrides.skeletalMuscle) : '';
        currentValues.bodyFat = manualOverrides.bodyFat?.toString() || '';
        currentTargets.bodyWeight = targetGoals.bodyWeight ? convertToImperial.weight(targetGoals.bodyWeight) : '';
        currentTargets.skeletalMuscle = targetGoals.skeletalMuscle ? convertToImperial.weight(targetGoals.skeletalMuscle) : '';
        currentTargets.bodyFat = targetGoals.bodyFat?.toString() || '';
        break;
      case 'waterIntake':
        currentValues.waterIntake = waterIntakeMl ? convertToImperial.volume(parseFloat(waterIntakeMl)) : '';
        break;
      case 'stressLevel':
        currentValues.stressLevel = stressLevelRating;
        break;
      case 'bloodPressure':
        currentValues.systolic = bloodPressureSystolic;
        currentValues.diastolic = bloodPressureDiastolic;
        break;
      case 'glucose':
        currentValues.glucose = glucose;
        break;
      case 'bloodOxygen':
        currentValues.bloodOxygen = bloodOxygen;
        break;
      case 'weight':
        currentValues.weight = weight ? convertToImperial.weight(parseFloat(weight)) : '';
        break;
      case 'heartRate':
        currentValues.avgHeartRate = manualOverrides.avgHeartRate?.toString() || '';
        currentValues.maxHeartRate = manualOverrides.maxHeartRate?.toString() || '';
        break;
      case 'sleep':
        currentValues.sleepDuration = manualOverrides.sleepDuration?.toString() || '';
        currentValues.sleepQuality = manualOverrides.sleepQuality?.toString() || '';
        break;
    }
    
    setEditValues(currentValues);
    setTargetValues(currentTargets);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    const newOverrides = { ...manualOverrides };
    const newTargets = { ...targetGoals };
    
    if (editingMetric === 'bodyComposition') {
      // Convert pounds input to kg for storage
      const bodyWeight = parseFloat(editValues.bodyWeight);
      const skeletalMuscle = parseFloat(editValues.skeletalMuscle);
      const bodyFat = parseFloat(editValues.bodyFat);
      
      if (!isNaN(bodyWeight)) {
        newOverrides.bodyWeight = convertFromImperial.weight(bodyWeight);
      }
      if (!isNaN(skeletalMuscle)) {
        newOverrides.skeletalMuscle = convertFromImperial.weight(skeletalMuscle);
      }
      if (!isNaN(bodyFat)) {
        newOverrides.bodyFat = bodyFat; // Body fat is always percentage
      }
      
      const targetWeight = parseFloat(targetValues.bodyWeight);
      const targetMuscle = parseFloat(targetValues.skeletalMuscle);
      const targetBodyFat = parseFloat(targetValues.bodyFat);
      
      if (!isNaN(targetWeight)) {
        newTargets.bodyWeight = convertFromImperial.weight(targetWeight);
      }
      if (!isNaN(targetMuscle)) {
        newTargets.skeletalMuscle = convertFromImperial.weight(targetMuscle);
      }
      if (!isNaN(targetBodyFat)) {
        newTargets.bodyFat = targetBodyFat;
      }
    }
    // Handle main metrics (calories, steps, duration)
    else if (editingMetric === 'calories' || editingMetric === 'steps' || editingMetric === 'duration') {
      const value = parseFloat(editValues[editingMetric]);
      if (!isNaN(value)) {
        newOverrides[editingMetric] = value;
      }
      
      const targetValue = parseFloat(targetValues[editingMetric]);
      if (!isNaN(targetValue)) {
        newTargets[editingMetric] = targetValue;
      }
    } else if (editingMetric === 'weight') {
      // Convert pounds to kg for storage
      const weightInPounds = parseFloat(editValues.weight);
      if (!isNaN(weightInPounds)) {
        setWeight(convertFromImperial.weight(weightInPounds).toString());
      }
    } else if (editingMetric === 'waterIntake') {
      // Convert fl oz to ml for storage
      const waterInFlOz = parseFloat(editValues.waterIntake);
      if (!isNaN(waterInFlOz)) {
        setWaterIntakeMl(convertFromImperial.volume(waterInFlOz).toString());
      }
    } else {
      // Handle other health metrics
      switch(editingMetric) {
        case 'waterIntake':
          setWaterIntakeMl(editValues.waterIntake || '');
          break;
        case 'stressLevel':
          setStressLevelRating(editValues.stressLevel || '');
          break;
        case 'bloodPressure':
          setBloodPressureSystolic(editValues.systolic || '');
          setBloodPressureDiastolic(editValues.diastolic || '');
          break;
        case 'glucose':
          setGlucose(editValues.glucose || '');
          break;
        case 'bloodOxygen':
          setBloodOxygen(editValues.bloodOxygen || '');
          break;
        case 'weight':
          setWeight(editValues.weight || '');
          break;
        case 'heartRate':
          const avgHR = parseFloat(editValues.avgHeartRate);
          const maxHR = parseFloat(editValues.maxHeartRate);
          if (!isNaN(avgHR)) newOverrides.avgHeartRate = avgHR;
          if (!isNaN(maxHR)) newOverrides.maxHeartRate = maxHR;
          break;
        case 'sleep':
          const sleepDur = parseFloat(editValues.sleepDuration);
          const sleepQual = parseFloat(editValues.sleepQuality);
          if (!isNaN(sleepDur)) newOverrides.sleepDuration = sleepDur;
          if (!isNaN(sleepQual)) newOverrides.sleepQuality = sleepQual;
          break;
      }
    }
    
    setManualOverrides(newOverrides);
    setTargetGoals(newTargets);
    
    // Cloud sync logic
    const targetDate = format(selectedDate, 'yyyy-MM-dd');
    const packedData: any = {
        date: targetDate,
        caloriesBurned: newOverrides.calories,
        avgHeartRate: newOverrides.avgHeartRate,
        maxHeartRate: newOverrides.maxHeartRate,
        steps: newOverrides.steps,
        duration: newOverrides.duration,
        distance: newOverrides.distance,
        avgSpeed: newOverrides.avgSpeed,
        sleepDurationHours: newOverrides.sleepDuration,
        sleepQualityRating: newOverrides.sleepQuality,
        waterIntakeMl: parseFloat(waterIntakeMl),
        stressLevelRating: parseFloat(stressLevelRating),
        bloodPressureSystolic: parseFloat(bloodPressureSystolic),
        bloodPressureDiastolic: parseFloat(bloodPressureDiastolic),
        glucose: parseFloat(glucose),
        bloodOxygen: parseFloat(bloodOxygen),
        weight: parseFloat(weight),
        notes: notes
    };

    // Clean up NaN values
    Object.keys(packedData).forEach(key => {
        if (key !== 'date' && key !== 'notes' && isNaN(packedData[key])) delete packedData[key];
    });

    if (currentMetricId) {
        updateHealthMetric(currentMetricId, packedData).catch(console.error);
    } else {
        addHealthMetric(packedData).catch(console.error);
    }
    
    setIsEditDialogOpen(false);
    toast({ title: "Success", description: "Values synced to cloud successfully." });
  };

  const handleTargetSave = () => {
    const newTargets = { ...targetGoals };
    
    Object.keys(targetValues).forEach(key => {
      const value = parseFloat(targetValues[key]);
      if (!isNaN(value)) {
        newTargets[key as keyof typeof targetGoals] = value;
      }
    });
    
    setTargetGoals(newTargets);
    setIsEditDialogOpen(false);
    toast({ title: "Success", description: "Target goal set successfully." });
  };

  // Enhanced smartwatch data calculation using selected date/range - FIXED FILTERING
  const smartwatchData = useMemo(() => {
    console.log("🔍 SMARTWATCH DATA - FILTERING DEBUG:", {
      healthMetricsCount: healthMetrics.length,
      dateMode,
      selectedDate: dateMode === 'single' ? format(selectedDate, 'yyyy-MM-dd') : null,
      dateRange: dateMode === 'range' ? { 
        from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
        to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null
      } : null
    });

    // Filter health metrics based on date selection
    let filteredMetrics: typeof healthMetrics = [];

    if (dateMode === 'single') {
      // Single day mode - filter by selected date
      const targetDate = format(selectedDate, 'yyyy-MM-dd');
      filteredMetrics = healthMetrics.filter(metric => {
        const metricDate = metric.date.split('T')[0]; // Handle both formats
        const matches = metricDate === targetDate;
        console.log('📅 Single date filter:', { metricDate, targetDate, matches });
        return matches;
      });
      console.log('✅ Single day filtered result:', filteredMetrics.length, 'metrics for', targetDate);
    } else if (dateMode === 'range' && dateRange?.from && dateRange?.to) {
      // Range mode - filter by date range
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      filteredMetrics = healthMetrics.filter(metric => {
        const metricDate = metric.date.split('T')[0];
        const isInRange = metricDate >= startDate && metricDate <= endDate;
        console.log('📅 Range filter:', { metricDate, startDate, endDate, isInRange });
        return isInRange;
      });
      console.log('✅ Range filtered result:', filteredMetrics.length, 'metrics from', startDate, 'to', endDate);
    } else {
      // Default to current day if no valid selection
      const today = format(new Date(), 'yyyy-MM-dd');
      filteredMetrics = healthMetrics.filter(metric => {
        const metricDate = metric.date.split('T')[0];
        return metricDate === today;
      });
      console.log('✅ Default (today) filtered result:', filteredMetrics.length, 'metrics for', today);
    }

    // Group by date and aggregate values
    const dataByDate: Record<string, any> = {};
    
    filteredMetrics.forEach(metric => {
      const dateKey = format(new Date(metric.date), 'MM/dd');
      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = {
          date: dateKey,
          caloriesBurned: 0,
          avgHeartRate: 0,
          maxHeartRate: 0,
          steps: 0,
          duration: 0,
          distance: 0,
          avgSpeed: 0,
          heartRateCount: 0
        };
      }
      
      dataByDate[dateKey].caloriesBurned += metric.caloriesBurned || 0;
      dataByDate[dateKey].steps += metric.steps || 0;
      dataByDate[dateKey].duration += metric.duration || 0;
      dataByDate[dateKey].distance += metric.distance || 0;
      
      if (metric.avgHeartRate) {
        dataByDate[dateKey].avgHeartRate += metric.avgHeartRate;
        dataByDate[dateKey].heartRateCount++;
      }
      
      if (metric.maxHeartRate) {
        dataByDate[dateKey].maxHeartRate = Math.max(dataByDate[dateKey].maxHeartRate, metric.maxHeartRate);
      }
      
      if (metric.avgSpeed) {
        dataByDate[dateKey].avgSpeed += metric.avgSpeed;
      }
    });

    // Calculate averages and return array
    const result = Object.values(dataByDate).map((day: any) => ({
      ...day,
      avgHeartRate: day.heartRateCount > 0 ? Math.round(day.avgHeartRate / day.heartRateCount) : 0,
      avgSpeed: day.heartRateCount > 0 ? Math.round((day.avgSpeed / day.heartRateCount) * 10) / 10 : 0
    }));

    console.log('📊 SmartWatch Data Final Result:', result);
    return result;
  }, [healthMetrics, dateRange, selectedDate, dateMode]);

  // Function to format actual workout completion time for graphs
  const formatHealthMetricsGraphTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Show actual hour:minute with correct AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Timeline data: Weekly view for 'Single Day', Exact Range for 'Date Range'
  const timelineData = useMemo(() => {
    let startDate: Date;
    let daysCount: number;

    if (dateMode === 'range' && dateRange?.from && dateRange?.to) {
        startDate = dateRange.from;
        const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
        daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    } else {
        // Single day mode: Show the week (Sun-Sat) containing the selected date for context
        startDate = startOfWeek(selectedDate);
        daysCount = 7;
    }
    
    console.log('🔍 TIMELINE GENERATION:', {
      mode: dateMode,
      startDate: format(startDate, 'yyyy-MM-dd'),
      days: daysCount
    });

    const graphData = [];

    const targetDateStr = format(selectedDate, 'yyyy-MM-dd');

    for (let i = 0; i < daysCount; i++) {
        const currentDay = addDays(startDate, i);
        const dateStr = format(currentDay, 'yyyy-MM-dd');
        const dayLabel = dateMode === 'range' && daysCount > 7 ? format(currentDay, 'MM/dd') : format(currentDay, 'EEE');

        // Find metrics for this day
        const dayMetrics = healthMetrics.filter(m => {
            const mDate = m.date.includes('T') ? m.date.split('T')[0] : m.date; 
            return mDate === dateStr;
        });

        // Aggregate values for the day
        let steps = dayMetrics.reduce((sum, m) => sum + (m.steps || 0), 0);
        let calories = dayMetrics.reduce((sum, m) => sum + (m.caloriesBurned || 0), 0);
        let duration = dayMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);

        // Inject Manual Overrides if this is the selected date
        if (dateStr === targetDateStr) {
            if (manualOverrides.steps !== undefined) steps = manualOverrides.steps;
            if (manualOverrides.calories !== undefined) calories = manualOverrides.calories;
            if (manualOverrides.duration !== undefined) duration = manualOverrides.duration;
        }

        graphData.push({
            time: dayLabel, 
            fullDate: dateStr,
            steps,
            calories,
            duration,
            timestamp: currentDay.getTime()
        });
    }

    console.log('📈 Timeline Data:', graphData);
    return graphData;
  }, [healthMetrics, selectedDate, dateRange, dateMode]);



  // Filter metrics strictly for the totals/cards display (Single Day or Date Range)
  const filteredMetricsForDisplay = useMemo(() => {
    if (dateMode === 'single') {
        const targetDate = format(selectedDate, 'yyyy-MM-dd');
        return healthMetrics.filter(m => {
             const mDate = m.date.includes('T') ? m.date.split('T')[0] : m.date;
             return mDate === targetDate;
        });
    } else if (dateRange?.from && dateRange?.to) {
        const start = format(dateRange.from, 'yyyy-MM-dd');
        const end = format(dateRange.to, 'yyyy-MM-dd');
        return healthMetrics.filter(m => {
             const mDate = m.date.includes('T') ? m.date.split('T')[0] : m.date;
             return mDate >= start && mDate <= end;
        });
    }
    return [];
  }, [healthMetrics, dateMode, selectedDate, dateRange]);

  // Calculate cumulative totals for the selected period using the STRICTLY filtered data
  const cumulativeTotals = useMemo(() => {
    return filteredMetricsForDisplay.reduce((totals, workout) => ({
      totalCalories: totals.totalCalories + (workout.caloriesBurned || 0),
      totalSteps: totals.totalSteps + (workout.steps || 0),
      totalDuration: totals.totalDuration + (workout.duration || 0)
    }), { totalCalories: 0, totalSteps: 0, totalDuration: 0 });
  }, [filteredMetricsForDisplay]);

  const handleSave = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    
    let waterIntakeFinal = waterIntakeMl ? parseInt(waterIntakeMl) : undefined;
    if (waterIntakeUnit === 'fl oz' && waterIntakeFinal) {
      waterIntakeFinal = Math.round(waterIntakeFinal * 29.5735);
    }

    let glucoseFinal = glucose ? parseFloat(glucose) : undefined;
    if (glucoseUnit === 'mmol/L' && glucoseFinal) {
      glucoseFinal = Math.round(glucoseFinal * 18.0182);
    }

    const metricData: Omit<HealthMetric, 'id' | 'workoutId'> = {
      date: dateString,
      waterIntakeMl: waterIntakeFinal,
      stressLevelRating: stressLevelRating ? parseInt(stressLevelRating) : undefined,
      bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : undefined,
      glucose: glucoseFinal,
      bloodOxygen: bloodOxygen ? parseInt(bloodOxygen) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      notes: notes,
      // Persist these as part of the health metric for this date
      steps: manualOverrides.steps,
      caloriesBurned: manualOverrides.calories,
      duration: manualOverrides.duration,
      avgHeartRate: manualOverrides.avgHeartRate,
      maxHeartRate: manualOverrides.maxHeartRate,
      sleepDuration: manualOverrides.sleepDuration,
      sleepQuality: manualOverrides.sleepQuality
    };

    if (currentMetricId) {
      updateHealthMetric(currentMetricId, metricData);
    } else {
      addHealthMetric(metricData);
    }

    // Save to localStorage
    localStorage.setItem('healthMetricsData', JSON.stringify({
      manualOverrides,
      targetGoals,
      customMetrics,
      currentMetrics: metricData
    }));

    toast({ title: "Success", description: "Health metrics have been saved for " + dateString });
  };

  const handleHealthMeterClick = () => {
    if (allTargetsMet) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        openTimeline('steps');
      }, 5000);
    } else {
      openTimeline('steps');
    }
  };

  const openTimeline = (metric: 'steps' | 'duration' | 'calories') => {
    setSelectedMetric(metric);
    setIsTimelineOpen(true);
  };

  // Check if all targets are met for celebration
  const allTargetsMet = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = smartwatchData.find(d => d.date === format(new Date(), 'MMM dd'));
    
    if (!targetGoals.calories || !targetGoals.steps || !targetGoals.duration) {
      return false;
    }
    
    const currentCalories = manualOverrides.calories ?? (todayData?.caloriesBurned || 0);
    const currentSteps = manualOverrides.steps ?? (todayData?.steps || 0);
    const currentDuration = manualOverrides.duration ?? (todayData?.duration || 0);
    
    return currentCalories >= targetGoals.calories && 
           currentSteps >= targetGoals.steps && 
           currentDuration >= targetGoals.duration;
  }, [smartwatchData, manualOverrides, targetGoals]);

  // Count how many targets are met
  const targetsMet = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = smartwatchData.find(d => d.date === format(new Date(), 'MMM dd'));
    
    if (!targetGoals.calories || !targetGoals.steps || !targetGoals.duration) {
      return 0;
    }
    
    const currentCalories = manualOverrides.calories ?? (todayData?.caloriesBurned || 0);
    const currentSteps = manualOverrides.steps ?? (todayData?.steps || 0);
    const currentDuration = manualOverrides.duration ?? (todayData?.duration || 0);
    
    let count = 0;
    if (currentCalories >= targetGoals.calories) count++;
    if (currentSteps >= targetGoals.steps) count++;
    if (currentDuration >= targetGoals.duration) count++;
    
    return count;
  }, [smartwatchData, manualOverrides, targetGoals]);

  // COMPREHENSIVE DATE FILTERING DEBUG + SIMPLE DATA DISPLAY
  console.log("🐛 COMPLETE DATE DEBUG:");
  console.log("📅 Current Date:", new Date());
  console.log("📅 Today Formatted:", format(new Date(), 'yyyy-MM-dd'));
  console.log("📦 All Health Metrics:", healthMetrics);

  healthMetrics.forEach((metric, index) => {
    console.log(`📊 Metric ${index}:`, {
      storedDate: metric.date,
      calories: metric.caloriesBurned,
      duration: metric.duration,
      steps: metric.steps
    });
  });

  // Calculate totals from filtered smartwatchData
  const aggregatedData = useMemo(() => {
    return smartwatchData.reduce((acc, day) => ({
      caloriesBurned: acc.caloriesBurned + (day.caloriesBurned || 0),
      steps: acc.steps + (day.steps || 0),
      duration: acc.duration + (day.duration || 0),
      distance: acc.distance + (day.distance || 0),
      maxHeartRate: Math.max(acc.maxHeartRate, day.maxHeartRate || 0),
      avgHeartRateSum: acc.avgHeartRateSum + (day.avgHeartRate || 0),
      heartRateCount: acc.heartRateCount + (day.avgHeartRate ? 1 : 0),
      avgSpeedSum: acc.avgSpeedSum + (day.avgSpeed || 0),
      speedCount: acc.speedCount + (day.avgSpeed ? 1 : 0),
    }), { 
        caloriesBurned: 0, steps: 0, duration: 0, distance: 0, 
        maxHeartRate: 0, avgHeartRateSum: 0, heartRateCount: 0, 
        avgSpeedSum: 0, speedCount: 0 
    });
  }, [smartwatchData]);

  // Calculate averages
  const calculatedAvgHeartRate = aggregatedData.heartRateCount > 0 
    ? Math.round(aggregatedData.avgHeartRateSum / aggregatedData.heartRateCount) 
    : 0;
  
  const calculatedAvgSpeed = aggregatedData.speedCount > 0 
    ? Number((aggregatedData.avgSpeedSum / aggregatedData.speedCount).toFixed(1)) 
    : 0;

  // Calculate totals from strictly filtered display metrics? No, we should sum them up.
  const displayTotals = useMemo(() => {
    return filteredMetricsForDisplay.reduce((acc, metric) => ({
      calories: acc.calories + (metric.caloriesBurned || 0),
      steps: acc.steps + (metric.steps || 0),
      duration: acc.duration + (metric.duration || 0)
    }), { calories: 0, steps: 0, duration: 0 });
  }, [filteredMetricsForDisplay]);

  // Calculate totals for Health Meter (with testing override support)
  const totalCalories = testingModeEnabled && testOverrides.caloriesBurned !== null 
    ? testOverrides.caloriesBurned 
    : (manualOverrides.calories ?? displayTotals.calories);
    
  // Use calculated average/max or override
  const avgHeartRate = manualOverrides.avgHeartRate ?? calculatedAvgHeartRate;
  const maxHeartRate = manualOverrides.maxHeartRate ?? aggregatedData.maxHeartRate;
  
  const totalSteps = testingModeEnabled && testOverrides.steps !== null 
    ? testOverrides.steps 
    : (manualOverrides.steps ?? displayTotals.steps);
    
  const totalDuration = testingModeEnabled && testOverrides.duration !== null 
    ? testOverrides.duration 
    : (manualOverrides.duration ?? displayTotals.duration);
    
  const totalDistance = manualOverrides.distance ?? aggregatedData.distance;
  const avgSpeed = manualOverrides.avgSpeed ?? calculatedAvgSpeed;
  const avgSleepDuration = manualOverrides.sleepDuration ?? 0;
  const avgSleepQuality = manualOverrides.sleepQuality ?? 0;

  // Log testing overrides when active
  if (testingModeEnabled) {
    console.log("🧪 Testing Mode Active - Applied Overrides:", {
      originalCalories: manualOverrides.calories ?? aggregatedData.caloriesBurned,
      overrideCalories: testOverrides.caloriesBurned,
      finalCalories: totalCalories,
      originalSteps: manualOverrides.steps ?? aggregatedData.steps,
      overrideSteps: testOverrides.steps,
      finalSteps: totalSteps,
      originalDuration: manualOverrides.duration ?? aggregatedData.duration,
      overrideDuration: testOverrides.duration,
      finalDuration: totalDuration
    });
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-4 relative">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={500}
          recycle={false}
          gravity={0.2}
          initialVelocityX={{ min: -20, max: 20 }}
          initialVelocityY={{ min: -10, max: 10 }}
          confettiSource={{ x: window.innerWidth / 2, y: window.innerHeight / 2, w: 0, h: 0 }}
        />
      )}
      <div className="flex flex-col space-y-4">
        {/* ── Page Header & Hero ── */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-40 md:h-48"
             style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/images/goal_bg_health.png)',
            backgroundSize: 'cover', backgroundPosition: 'center 30%',
            filter: 'brightness(0.5)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(244,63,94,0.3) 0%, rgba(14,165,233,0.2) 50%, rgba(139,92,246,0.2) 100%)',
          }} />
          
          <div className="relative z-10 h-full flex flex-col justify-center px-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/5 hover:bg-white/10 rounded-full h-8 w-8 border border-white/10 mr-1">
                    <ArrowLeft className="h-4 w-4 text-white" />
                  </Button>
                  <Activity className="h-5 w-5 text-rose-400 font-bold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Vital Health Sync</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                  Health & Vitals
                </h1>
                <p className="text-gray-300 text-sm max-w-md hidden sm:block">
                  Sync your devices, track your biology, and stay on top of your well-being.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleManualRefresh} className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10" title="Refresh Data">
                  <Activity className={`h-5 w-5 text-white ${isManualSyncing ? 'animate-pulse' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10" onClick={() => setIsHelpOpen(true)}>
                  <HelpCircle className="h-6 w-6 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Date Picker with Single Day and Range Options */}
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="flex gap-2">
            <Button 
              variant={dateMode === 'single' ? 'default' : 'outline'}
              onClick={() => setDateMode('single')}
              size="sm"
            >
              Single Day
            </Button>
            <Button 
              variant={dateMode === 'range' ? 'default' : 'outline'}
              onClick={() => setDateMode('range')}
              size="sm"
            >
              Date Range
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const today = new Date();
                if (dateMode === 'single') {
                  setSelectedDate(today);
                } else {
                  setDateRange({
                    from: startOfDay(today),
                    to: endOfDay(today)
                  });
                }
              }}
              size="sm"
            >
              Today
            </Button>
          </div>
          
          {dateMode === 'single' ? (
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                Viewing: {format(selectedDate, 'MMMM dd, yyyy')}
              </div>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                className="px-3 py-2 border rounded-md bg-background"
              />
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <DateRangePicker value={dateRange} onDateChange={setDateRange} />
            </div>
          )}
        </div>
      </div>
      
      <HealthMetricsHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <TimelinePopup 
        isOpen={isTimelineOpen} 
        onClose={() => setIsTimelineOpen(false)}
        selectedMetric={selectedMetric}
        data={timelineData}
        healthMetrics={healthMetrics}
        selectedDate={selectedDate}
        manualOverrides={manualOverrides}
        interval={timelineInterval}
        onIntervalChange={setTimelineInterval}
        onMetricChange={setSelectedMetric}
      />

      <div className="flex justify-center w-full mb-8">
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="relative p-6 rounded-full bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
            <HealthMeterCircle
              steps={totalSteps}
              maxSteps={targetGoals.steps || 10000}
              duration={totalDuration}
              maxDuration={targetGoals.duration || 60}
              calories={totalCalories}
              maxCalories={targetGoals.calories || 500}
              size="large"
              onClick={handleHealthMeterClick}
            />
          </div>
          <div className="text-center mt-6">
            <h2 className="text-lg font-bold text-white mb-1">Daily Progress</h2>
            <p className="text-gray-400 text-sm">
              {allTargetsMet ? (
                <span className="text-green-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> All health goals achieved! 🎉
                </span>
              ) : targetsMet > 0 ? (
                <span className="flex flex-col items-center">
                  <span className="text-rose-400 font-bold">{targetsMet} of 3 goals reached</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Keep going to unlock your full potential
                  </span>
                </span>
              ) : (
                <span className="text-gray-500 italic">Target your goals and start moving!</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 1: Primary Performance (Main 3) ── */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 px-2 border-l-4 border-rose-500 py-1">
          <Activity className="h-5 w-5 text-rose-500" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Primary Performance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Calories Burned Card */}
          <Card className="bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-500/20 shadow-lg hover:shadow-red-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Flame className="h-16 w-16 text-red-500" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Calories</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{totalCalories}</span>
                  <span className="text-sm font-bold text-red-500/80 uppercase">kcal</span>
                </div>
                
                <div className="flex items-center gap-2 mt-3 mb-4">
                  {manualOverrides.calories ? (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">Manual Sync</Badge>
                  ) : smartwatchData.length > 0 ? (
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">Active Device</Badge>
                  ) : null}
                  {targetGoals.calories && (
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Goal: {targetGoals.calories}</span>
                  )}
                </div>

                {/* Performance Graph */}
                <div className="h-16 w-full opacity-80 group-hover:opacity-100 transition-opacity mb-4 cursor-pointer" onClick={() => openTimeline('calories')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#ef4444" 
                        strokeWidth={3} 
                        dot={false}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Button 
                  onClick={() => openEditDialog('calories')}
                  className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Pencil className="h-4 w-4 text-red-400" />
                  <span className="uppercase tracking-tighter text-xs">Manage & Refine Record</span>
                </Button>

                {targetGoals.calories && totalCalories >= targetGoals.calories && (
                  <div className="absolute top-12 right-4 text-3xl animate-pulse">🏆</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steps Card */}
          <Card className="bg-gradient-to-br from-green-950/40 to-green-900/20 border-green-500/20 shadow-lg hover:shadow-green-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Footprints className="h-16 w-16 text-green-500" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Footprints className="h-5 w-5 text-green-500" />
                <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Step Count</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{totalSteps.toLocaleString()}</span>
                  <span className="text-sm font-bold text-green-500/80 uppercase">steps</span>
                </div>
                
                <div className="flex items-center gap-2 mt-3 mb-4">
                  {manualOverrides.steps ? (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">Manual Sync</Badge>
                  ) : smartwatchData.length > 0 ? (
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">Active Device</Badge>
                  ) : null}
                  {targetGoals.steps && (
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Goal: {targetGoals.steps.toLocaleString()}</span>
                  )}
                </div>

                <div className="h-16 w-full opacity-80 group-hover:opacity-100 transition-opacity mb-4 cursor-pointer" onClick={() => openTimeline('steps')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <Line 
                        type="monotone" 
                        dataKey="steps" 
                        stroke="#22c55e" 
                        strokeWidth={3} 
                        dot={false}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Button 
                  onClick={() => openEditDialog('steps')}
                  className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Pencil className="h-4 w-4 text-green-400" />
                  <span className="uppercase tracking-tighter text-xs">Manage & Refine Record</span>
                </Button>

                {targetGoals.steps && totalSteps >= targetGoals.steps && (
                  <div className="absolute top-12 right-4 text-3xl animate-pulse">🏆</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Workout Duration Card */}
          <Card className="bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-blue-500/20 shadow-lg hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Timer className="h-16 w-16 text-blue-500" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Active Time</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{formatDurationFromMinutes(totalDuration)}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-3 mb-4">
                  {manualOverrides.duration ? (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">Manual Sync</Badge>
                  ) : smartwatchData.length > 0 ? (
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">Active Device</Badge>
                  ) : null}
                  {targetGoals.duration && (
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Goal: {targetGoals.duration}m</span>
                  )}
                </div>

                <div className="h-16 w-full opacity-80 group-hover:opacity-100 transition-opacity mb-4 cursor-pointer" onClick={() => openTimeline('duration')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={false}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Button 
                  onClick={() => openEditDialog('duration')}
                  className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Pencil className="h-4 w-4 text-blue-400" />
                  <span className="uppercase tracking-tighter text-xs">Manage & Refine Record</span>
                </Button>

                {targetGoals.duration && totalDuration >= targetGoals.duration && (
                  <div className="absolute top-12 right-4 text-3xl animate-pulse">🏆</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Section 2: Bio-Metrics & Vitals (Categorized) ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2 border-l-4 border-cyan-500 py-1">
          <Activity className="h-5 w-5 text-cyan-500" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Vital Statistics</h2>
        </div>

        {/* Sub-group: Biometrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Weight Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => openEditDialog('weight')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight</span>
              </div>
              <div className="text-xl font-black text-white tracking-tight">
                {displayWeight(Number(weight) || 0)}
              </div>
            </CardContent>
          </Card>

          {/* Blood Pressure Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => openEditDialog('bloodPressure')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-rose-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blood Pressure</span>
              </div>
              <div className="text-xl font-black text-white tracking-tight">
                {bloodPressureSystolic || '--'}<span className="text-gray-600">/</span>{bloodPressureDiastolic || '--'}
              </div>
            </CardContent>
          </Card>

          {/* Body Comp Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer col-span-2" onClick={() => openEditDialog('bodyComposition')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <SlidersHorizontal className="h-4 w-4 text-purple-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Composition</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Mass</div>
                  <div className="text-sm font-bold text-white">{displayWeight(manualOverrides.bodyWeight || 0)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Muscle</div>
                  <div className="text-sm font-bold text-white">{displayWeight(manualOverrides.skeletalMuscle || 0)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Fat</div>
                  <div className="text-sm font-bold text-white">{manualOverrides.bodyFat || 0}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => openEditDialog('heartRate')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Heart Rate</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{avgHeartRate}</span>
                <span className="text-[10px] text-gray-500 uppercase">bpm</span>
              </div>
            </CardContent>
          </Card>

          {/* Blood Oxygen Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => openEditDialog('bloodOxygen')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="h-4 w-4 text-teal-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SpO2</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{bloodOxygen || '--'}</span>
                <span className="text-[10px] text-gray-500 uppercase">%</span>
              </div>
            </CardContent>
          </Card>


          {/* Glucose Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => openEditDialog('glucose')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Candy className="h-4 w-4 text-yellow-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Glucose</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{glucose || '--'}</span>
                <span className="text-[10px] text-gray-500 uppercase">mg/dL</span>
              </div>
            </CardContent>
          </Card>

          {/* Sleep Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => openEditDialog('sleep')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sleep</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{avgSleepDuration || '--'}</span>
                <span className="text-[10px] text-gray-500 uppercase">hrs</span>
                <span className="text-sm text-gray-400 ml-2">Qual: {avgSleepQuality}/5</span>
              </div>
            </CardContent>
          </Card>

          {/* Water Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => openEditDialog('waterIntake')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hydration</span>
              </div>
              <div className="text-xl font-black text-white tracking-tight">
                {displayVolume(Number(waterIntakeMl) || 0)}
              </div>
            </CardContent>
          </Card>

          {/* Stress Card */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => openEditDialog('stressLevel')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-orange-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stress</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{stressLevelRating || '--'}</span>
                <span className="text-[10px] text-gray-500 uppercase">/5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Section 3: Advanced Data Entry ── */}
      <Card className="mt-8 border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md overflow-hidden shadow-xl">
        <CardHeader className="bg-white/5 border-b border-white/10">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-rose-500/20">
              <Activity className="h-5 w-5 text-rose-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black uppercase tracking-tight">Advanced Data Entry</span>
              <span className="text-xs text-gray-500 font-medium">Log specific biological markers and personal notes</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Notes Subsection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <Pencil className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Biological Notes</span>
            </div>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Track symptoms, mood, or specific health events..."
              className="min-h-[120px] bg-white/5 border-white/10 focus:border-rose-500/50 focus:ring-rose-500/20 text-white placeholder:text-gray-600 rounded-xl transition-all"
            />
          </div>

          {/* Custom Metrics Subsection */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Plus className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Custom biological Markers</span>
              </div>
              <div className="flex gap-2 group">
                <Input
                  placeholder="New marker name..."
                  value={newCustomMetricName}
                  onChange={(e) => setNewCustomMetricName(e.target.value)}
                  className="w-40 bg-white/5 border-white/10 text-xs rounded-lg"
                />
                <Button
                  onClick={() => {
                    if (newCustomMetricName.trim()) {
                      const newMetric = {
                        id: Date.now().toString(),
                        name: newCustomMetricName.trim(),
                        value: '',
                        unit: '',
                        timestamp: Date.now()
                      };
                      setCustomMetrics([...customMetrics, newMetric]);
                      setNewCustomMetricName('');
                    }
                  }}
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20"
                >
                  Action
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {customMetrics.length === 0 && (
                <div className="text-center py-8 rounded-xl border border-dashed border-white/10 bg-white/5">
                  <p className="text-sm text-gray-500 italic">No custom markers added yet.</p>
                </div>
              )}
              
              {customMetrics.map((metric, index) => (
                <div key={metric.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                  {editingCustomMetric === metric.id ? (
                    <>
                      <Input
                        value={metric.name}
                        onChange={(e) => {
                          const updated = [...customMetrics];
                          updated[index].name = e.target.value;
                          setCustomMetrics(updated);
                        }}
                        className="bg-gym-dark border-white/10 text-sm h-9"
                        placeholder="Metric name"
                      />
                      <Input
                        value={metric.value}
                        onChange={(e) => {
                          const updated = [...customMetrics];
                          updated[index].value = e.target.value;
                          setCustomMetrics(updated);
                        }}
                        className="bg-gym-dark border-white/10 text-sm h-9"
                        placeholder="Value"
                      />
                      <Input
                        value={metric.unit}
                        onChange={(e) => {
                          const updated = [...customMetrics];
                          updated[index].unit = e.target.value;
                          setCustomMetrics(updated);
                        }}
                        className="bg-gym-dark border-white/10 text-sm h-9"
                        placeholder="Unit"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSaveCustomMetric(metric.id, metric)}
                          className="h-9 w-9 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCustomMetric(metric.id)}
                          className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center px-2 py-1 bg-white/5 rounded-lg">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-2">Marker:</span>
                        <span className="text-sm font-bold text-white truncate">{metric.name}</span>
                      </div>
                      <div className="flex items-center px-2 py-1 bg-white/5 rounded-lg">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-2">Level:</span>
                        <span className="text-sm font-bold text-rose-400">{metric.value || '--'}</span>
                      </div>
                      <div className="flex items-center px-2 py-1 bg-white/5 rounded-lg">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-2">Unit:</span>
                        <span className="text-xs font-medium text-gray-300">{metric.unit || '--'}</span>
                      </div>
                      <div className="flex gap-2 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCustomMetric(metric.id)}
                          className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCustomMetric(metric.id)}
                          className="h-9 w-9 text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <Button 
                onClick={handleSave} 
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black py-7 text-lg uppercase tracking-wider shadow-xl shadow-rose-900/20 rounded-2xl group transition-all"
            >
              <div className="flex items-center justify-center gap-3">
                <Check className="h-6 w-6 group-hover:scale-110 transition-transform" />
                Commit Health Data to Cloud
              </div>
            </Button>
            <p className="text-center text-[10px] text-gray-600 mt-4 uppercase font-bold tracking-widest">
              Last Synced: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Enhanced Edit Dialog ── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0c] border-white/10 p-0 overflow-hidden shadow-2xl rounded-3xl">
          <DialogHeader className="p-6 pb-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/20">
                <Pencil className="h-5 w-5 text-rose-400" />
              </div>
              <div className="flex flex-col text-left">
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-white italic">
                  Refine {editingMetric.replace(/([A-Z])/g, ' $1').trim()}
                </DialogTitle>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Manual vs Automated Precision</span>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Status Info Box */}
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
              <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                Manual overrides take <span className="text-blue-400 font-bold">Priority</span> for the daily total. Leave a field empty to revert to automated smartwatch data.
              </p>
            </div>

            {/* Metric Specific Controls */}
            <div className="space-y-5">
              {(editingMetric === 'calories' || editingMetric === 'steps' || editingMetric === 'duration') && (
                <>
                  {/* Visual Separation of Auto vs Manual */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Auto Sync Display */}
                    <div className="relative group">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block ml-1">Automated Watch Sync</Label>
                      <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                         <div className="flex items-center gap-3">
                            <Watch className="h-5 w-5 text-blue-400/50" />
                            <span className="text-2xl font-black text-white/40">
                              {editingMetric === 'duration' ? formatDurationFromMinutes(displayTotals.duration) : displayTotals[editingMetric as keyof typeof displayTotals]}
                            </span>
                         </div>
                         <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0 h-5 text-[9px]">Live Data</Badge>
                      </div>
                    </div>

                    {/* Manual Input */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] uppercase tracking-widest text-rose-400 font-black italic">Manual Sync Override</Label>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-[10px] text-gray-500 hover:text-white"
                          onClick={() => setEditValues({...editValues, [editingMetric]: displayTotals[editingMetric as keyof typeof displayTotals].toString()})}
                        >
                          Copy Watch Value
                        </Button>
                      </div>
                      <div className="relative group">
                         <Input
                          type="number"
                          value={editValues[editingMetric] || ''}
                          onChange={(e) => setEditValues({...editValues, [editingMetric]: e.target.value})}
                          className="bg-gym-dark border-white/10 h-14 rounded-2xl text-xl font-black text-rose-400 pl-6 focus:border-rose-500/50 focus:ring-0 shadow-inner"
                          placeholder="Override value..."
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-600 uppercase italic">
                           {editingMetric === 'calories' ? 'kcal' : editingMetric === 'steps' ? 'steps' : 'mins'}
                        </div>
                      </div>
                    </div>

                    {/* Target Setting */}
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        <Label className="text-[10px] uppercase tracking-widest text-cyan-400 font-black italic">Personal Goal Target</Label>
                      </div>
                      <Input
                        type="number"
                        value={targetValues[editingMetric] || ''}
                        onChange={(e) => setTargetValues({...targetValues, [editingMetric]: e.target.value})}
                        className="bg-cyan-500/5 border-cyan-500/20 h-14 rounded-2xl text-xl font-black text-cyan-400 pl-6 focus:border-cyan-500/50 focus:ring-0 shadow-inner"
                        placeholder="Set new daily goal..."
                      />
                    </div>
                  </div>
                </>
              )}

              {editingMetric === 'heartRate' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-gray-500">Average bpm</Label>
                    <Input
                      type="number"
                      value={editValues.avgHeartRate || ''}
                      onChange={(e) => setEditValues({...editValues, avgHeartRate: e.target.value})}
                      className="bg-gym-dark border-white/10 rounded-xl h-12 font-bold text-rose-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-gray-500">Maximum bpm</Label>
                    <Input
                      type="number"
                      value={editValues.maxHeartRate || ''}
                      onChange={(e) => setEditValues({...editValues, maxHeartRate: e.target.value})}
                      className="bg-gym-dark border-white/10 rounded-xl h-12 font-bold text-rose-500"
                    />
                  </div>
                </div>
              )}

              {editingMetric === 'sleep' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-gray-500">Hours Rest</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editValues.sleepDuration || ''}
                      onChange={(e) => setEditValues({...editValues, sleepDuration: e.target.value})}
                      className="bg-gym-dark border-white/10 rounded-xl h-12 font-bold text-indigo-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-gray-500">Quality (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={editValues.sleepQuality || ''}
                      onChange={(e) => setEditValues({...editValues, sleepQuality: e.target.value})}
                      className="bg-gym-dark border-white/10 rounded-xl h-12 font-bold text-indigo-400"
                    />
                  </div>
                </div>
              )}

              {editingMetric === 'bodyComposition' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500">Weight (lbs)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editValues.bodyWeight || ''}
                        onChange={(e) => setEditValues({...editValues, bodyWeight: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-cyan-500">Goal (lbs)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={targetValues.bodyWeight || ''}
                        onChange={(e) => setTargetValues({...targetValues, bodyWeight: e.target.value})}
                        className="bg-cyan-500/5 border-cyan-500/10 rounded-xl h-12"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500">Muscle (lbs)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editValues.skeletalMuscle || ''}
                        onChange={(e) => setEditValues({...editValues, skeletalMuscle: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500">Body Fat (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={editValues.bodyFat || ''}
                        onChange={(e) => setEditValues({...editValues, bodyFat: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-xl h-12"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Simplified layouts for single-field metrics */}
              {['waterIntake', 'weight', 'glucose', 'bloodOxygen', 'stressLevel'].includes(editingMetric) && (
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-500 ml-1">Current Manual Log</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={editValues[editingMetric === 'waterIntake' ? 'waterIntake' : editingMetric] || ''}
                      onChange={(e) => setEditValues({...editValues, [editingMetric === 'waterIntake' ? 'waterIntake' : editingMetric]: e.target.value})}
                      className="bg-gym-dark border-white/10 h-14 rounded-2xl text-xl font-bold pl-6"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 uppercase">
                      {editingMetric === 'waterIntake' ? 'fl oz' : editingMetric === 'weight' ? 'lbs' : editingMetric === 'glucose' ? 'mg/dL' : editingMetric === 'bloodOxygen' ? '%' : 'rating'}
                    </div>
                  </div>
                </div>
              )}

              {editingMetric === 'bloodPressure' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-gray-500">Systolic</Label>
                    <Input
                      type="number"
                      value={editValues.systolic || ''}
                      onChange={(e) => setEditValues({...editValues, systolic: e.target.value})}
                      className="bg-gym-dark border-white/10 rounded-xl h-12 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-gray-500">Diastolic</Label>
                    <Input
                      type="number"
                      value={editValues.diastolic || ''}
                      onChange={(e) => setEditValues({...editValues, diastolic: e.target.value})}
                      className="bg-gym-dark border-white/10 rounded-xl h-12 font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button 
                onClick={handleEditSave} 
                className="h-14 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-rose-900/40 transition-all active:scale-95"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Update Daily Records
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsEditDialogOpen(false)} 
                className="text-gray-500 hover:text-white uppercase text-[10px] font-black tracking-widest"
              >
                Keep Current Values
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* ── Section 5: Global Confirmation Dialog ── */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a0a0c] border-white/10 rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase text-white italic tracking-tight">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 font-medium leading-relaxed">
              Are you sure you want to permanently delete this biological marker? This action cannot be undone and will remove all associated data for current tracking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 border-t border-white/5 gap-3 sm:gap-0">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl h-12 uppercase text-[10px] font-black tracking-widest">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCustomMetric}
              className="bg-rose-600 hover:bg-rose-500 text-white rounded-2xl h-12 uppercase text-[10px] font-black tracking-widest shadow-lg shadow-rose-900/40 transition-all"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SecondHealthMetricsPage;