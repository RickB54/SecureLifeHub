import React, { useState, useRef, useEffect } from "react";
import { 
  Download, Upload, Info, Trash2, HelpCircle, Watch, RefreshCw, 
  Settings as SettingsIcon, CheckCircle, XCircle, WifiOff, Shield, 
  Clock, AlertTriangle, BarChart2, Activity, Maximize2, Minimize2, 
  Volume2, History, Zap, Timer, Trophy, Sparkles, Dumbbell, ArrowLeft,
  MapPin, Cloud, CloudOff, Database, HardDrive, RotateCcw, ClipboardList, Eraser,
  Mail, MousePointerClick, Edit3, ExternalLink,
  Users, Crown, ChevronDown, MessageSquare,
  Archive, Calendar, Filter, Mic, ArrowUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExercise } from "@/components/gdft/contexts/ExerciseContext";
import { slideboardExercises, cardioExercises, weightExercises, noEquipmentExercises } from "@/components/gdft/lib/data";
import { toast } from "sonner";
import { Button } from "@/components/gdft/components/ui/button";
import SettingsHelpPopup from "@/components/gdft/components/ui/SettingsHelpPopup";
import { useSettings } from '@/components/gdft/contexts/SettingsContext';
import { Switch } from "@/components/gdft/components/ui/switch";
import { Input } from "@/components/gdft/components/ui/input";
import { Label } from "@/components/gdft/components/ui/label";
import { BetaTesterDialog } from "@/components/gdft/components/ui/BetaTesterDialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/gdft/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/gdft/components/ui/popover";
import { healthConnectService } from "@/components/gdft/lib/healthConnect";
import { useSmartWatchSync } from "@/components/gdft/hooks/useSmartWatchSync";
import { Alert, AlertDescription } from "@/components/gdft/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/gdft/components/ui/dialog";
import { AccountSection } from "@/components/gdft/components/settings/AccountSection";
import { AchievementsList } from "@/components/gdft/components/ui/AchievementsList";
import { BenchmarkDataView } from "@/components/gdft/components/ui/BenchmarkDataView";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/gdft/components/ui/accordion";

import { useAuth } from "@/components/auth-provider";
import { useWorkout } from "@/components/gdft/contexts/WorkoutContext";


const Settings = () => {
  const { 
    unitSystem, 
    setUnitSystem, 
    timerSound,
    setTimerSound,
    timerVibration,
    setTimerVibration,
    notificationSound,
    setNotificationSound,
    notificationVibration,
    setNotificationVibration,
    defaultRestTime,
    setDefaultRestTime,
    testingModeEnabled, 
    setTestingModeEnabled, 
    testOverrides, 
    setTestOverrides, 
    clearAllOverrides,
    voiceLoggingEnabled,
    setVoiceLoggingEnabled,
    showScrollToTopButton,
    setShowScrollToTopButton
  } = useSettings();
  const navigate = useNavigate();
  const { exercises, exportToCSV, importFromCSV, deleteAllExercises, reinstallAllExercises, migrateImagesToSupabase, refreshExercises, purgeCustomExercisesOnly, deduplicateDatabase } = useExercise();
  const { migrateLocalData, refreshWorkoutData, deleteStatsData, purgeWorkoutsOnly, purgeAnalyticsOnly, purgePersonalStatsOnly, purgeCustomPlansOnly } = useWorkout();
  const [isLoading, setIsLoading] = useState(false);
  const [helpPageIndex, setHelpPageIndex] = useState<number | null>(null);
  const [betaTesterDialogOpen, setBetaTesterDialogOpen] = useState(false);
  const [customRestInput, setCustomRestInput] = useState('');
  const [isCustomRest, setIsCustomRest] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);
  const [betaRoster, setBetaRoster] = useState<any[]>([]);
  const [expandedTesterId, setExpandedTesterId] = useState<string | null>(null);
  const [rosterFilter, setRosterFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Load and sync beta roster
  const loadBetaRoster = (e?: any) => {
    const raw = localStorage.getItem('gymday_beta_roster');
    let roster = [];
    if (raw) {
      roster = JSON.parse(raw);
      // Data upgrade: ensure records have timestamps and archive status
      roster = roster.map(t => {
        const upgraded = { ...t };
        if (!upgraded.timestamp) upgraded.timestamp = Date.now();
        if (upgraded.isArchived === undefined) upgraded.isArchived = false;
        
        if (t.email === "RicksAppServices@gmail.com" && (!t.suggestions || t.suggestions.includes('No specific feedback'))) {
          upgraded.suggestions = "Vision: Create the world's most intuitive and powerful fitness tracker. Initial goal: Implement full CrossFit template support and AI-driven periodization.";
          upgraded.status = "Founding Architect";
        }
        return upgraded;
      });
      localStorage.setItem('gymday_beta_roster', JSON.stringify(roster));
      setBetaRoster(roster);
    } else {
      // Create seed
      const initial = [{
        name: "Rick B.",
        email: "RicksAppServices@gmail.com",
        suggestions: "Vision: Create the world's most intuitive and powerful fitness tracker. Initial goal: Implement full CrossFit template support and AI-driven periodization.",
        date: "03/03/2026",
        timestamp: Date.now(),
        status: "Founding Architect",
        id: "STAFF-001",
        isArchived: false
      }];
      localStorage.setItem('gymday_beta_roster', JSON.stringify(initial));
      setBetaRoster(initial);
    }

    if (e && e.detail && e.detail.expandedId) {
      setExpandedTesterId(e.detail.expandedId);
    }
  };

  const archiveTester = (id: string) => {
    const updated = betaRoster.map(t => t.id === id ? { ...t, isArchived: !t.isArchived } : t);
    localStorage.setItem('gymday_beta_roster', JSON.stringify(updated));
    setBetaRoster(updated);
    toast.success(updated.find(t => t.id === id)?.isArchived ? "Candidate Archived" : "Candidate Restored");
  };

  const deleteTester = (id: string, name: string) => {
    if (id === "STAFF-001") {
      toast.error("Founding Architect cannot be deleted!");
      return;
    }
    const updated = betaRoster.filter(t => t.id !== id);
    localStorage.setItem('gymday_beta_roster', JSON.stringify(updated));
    setBetaRoster(updated);
    toast.success(`Entry for ${name} deleted.`);
  };

  useEffect(() => {
    loadBetaRoster();
    window.addEventListener('gymday_beta_roster_update', loadBetaRoster);
    return () => window.removeEventListener('gymday_beta_roster_update', loadBetaRoster);
  }, []);
  
  // Use the smartwatch sync hook
  const { 
    syncStatus, 
    isSyncing, 
    initializeSync, 
    requestPermissions, 
    syncWorkouts,
    clearError
  } = useSmartWatchSync();

  useEffect(() => {
    // Initialize smartwatch sync on component mount
    initializeSync();
  }, [initializeSync]);

  // Fullscreen listener to keep state in sync (e.g. when user presses Esc)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullScreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
      toast.error('Full screen is not supported in this environment.');
    }
  };

  const handleCheckPermissions = async () => {
    try {
      setIsLoading(true);
      clearError();
      await requestPermissions();
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast.error('Failed to request Health Connect permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setIsLoading(true);
      clearError();
      await syncWorkouts(7);
    } catch (error) {
      console.error('Error during manual sync:', error);
      // Error handling is done in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      setIsLoading(true);
      const csv = exportToCSV();

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gymdayfittracker-exercises-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Exercises exported successfully");
    } catch (error) {
      console.error("Error exporting exercises:", error);
      toast.error("Failed to export exercises");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCSVClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        importFromCSV(csvContent);
      } catch (error) {
        console.error("Error reading CSV file:", error);
        toast.error("Failed to read the CSV file");
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDeleteAllExercises = async () => {
    toast("Are you sure you want to delete all exercises? This action cannot be undone.", {
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            await deleteAllExercises();
            toast.success("All exercises deleted successfully");
          } catch (error) {
            console.error("Error deleting all exercises:", error);
            toast.error("Failed to delete all exercises");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleReinstallExercises = () => {
    reinstallAllExercises();
  };

  const handleMigrateCFExercises = async () => {
    if (!user) { toast.error("You must be logged in to run this migration."); return; }
    if (!window.confirm(
      "This will tag all your CF-A through CF-F exercises to a \"Choice Fitness\" gym in your Gym Builder.\n\n" +
      "• Exercises are NOT deleted or modified — only their gym/section labels are updated.\n" +
      "• If the gym doesn't exist, it will be created.\n\n" +
      "Continue?"
    )) return;
    try {
      setIsMigrating(true);
      const result = await migrateCFExercisesToGym(user.id);
      const summary = result.sections
        .filter(s => s.exercisesTagged > 0)
        .map(s => `${s.name}: ${s.exercisesTagged} exercise${s.exercisesTagged !== 1 ? 's' : ''}`)
        .join(', ');
      toast.success(
        `✅ Tagged ${result.totalTagged} exercises to "${result.gym}" ${
          result.created ? '(new gym created)' : '(existing gym updated)'
        }. ${summary}`,
        { duration: 8000 }
      );
    } catch (e: any) {
      toast.error(`Migration failed: ${e.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleMigrateImages = async () => {
    setIsLoading(true);
    try {
      await migrateImagesToSupabase();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupAllData = async () => {
    try {
      setIsLoading(true);
      const allData = { ...localStorage };
      const jsonString = JSON.stringify(allData, null, 2);

      // Enhanced Android SAF implementation
      if (window.Android) {
        // Check if SAF is available
        const safAvailable = await window.Android.isStorageAccessFrameworkAvailable();
        if (!safAvailable) {
          toast.error("Storage Access Framework not available on this device");
          setIsLoading(false);
          return;
        }

        // Check permissions first
        const hasPermissions = await window.Android.checkStoragePermissions();
        if (!hasPermissions) {
          const granted = await window.Android.requestStoragePermissions();
          if (!granted) {
            toast.error("Storage permissions required for backup");
            setIsLoading(false);
            return;
          }
        }

        // Let user select backup directory
        const directoryUri = await window.Android.selectBackupDirectory();
        if (!directoryUri) {
          toast.error("No backup directory selected");
          setIsLoading(false);
          return;
        }

        // Create backup file in selected directory
        const date = new Date().toISOString().split("T")[0];
        const filename = `gymdayfittracker-backup-${date}.json`;
        
        const success = await window.Android.createBackupFileInDirectory(jsonString, filename, directoryUri);
        if (success) {
          toast.success("Backup created successfully in selected directory");
        } else {
          const error = await window.Android.getLastError();
          toast.error(`Backup failed: ${error || "Unknown error"}`);
        }
      } else {
        // Existing web implementation
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split("T")[0];
        const link = document.createElement("a");
        link.href = url;
        link.download = `gymdayfittracker-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Backup successful");
      }
    } catch (error) {
      console.error("Backup failed:", error);
      toast.error("Failed to backup data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAllDataClick = async () => {
    if (window.Android) {
      try {
        // Check SAF availability
        const safAvailable = await window.Android.isStorageAccessFrameworkAvailable();
        if (!safAvailable) {
          toast.error("Storage Access Framework not available");
          return;
        }

        // Check permissions
        const hasPermissions = await window.Android.checkStoragePermissions();
        if (!hasPermissions) {
          const granted = await window.Android.requestStoragePermissions();
          if (!granted) {
            toast.error("Storage permissions required for restore");
            return;
          }
        }

        // Let user select restore file
        const fileUri = await window.Android.selectRestoreFile();
        if (!fileUri) {
          toast.error("No restore file selected");
          return;
        }

        // Read and restore file
        setIsLoading(true);
        const content = await window.Android.readFileFromUri(fileUri);
        await handleRestoreData(content);
      } catch (error) {
        console.error("Error in restore process:", error);
        const androidError = await window.Android?.getLastError();
        toast.error(`Restore failed: ${androidError || error}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      restoreFileInputRef.current?.click();
    }
  };

  // Helper function for restore data processing
  const handleRestoreData = async (content: string) => {
    try {
      const json = JSON.parse(content);
      const expectedKeys = {
        exercises: "[]",
        savedWorkoutTemplates: "[]",
        workouts: "[]",
        customPlans: "[]",
      };
      
      const restoredData = { ...json };
      Object.keys(expectedKeys).forEach((key) => {
        if (!(key in restoredData)) {
          restoredData[key] = expectedKeys[key];
        }
      });
      
      // Preserving auth state
      const authKeys: {key: string, value: string}[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
          authKeys.push({ key: k, value: localStorage.getItem(k) || "" });
        }
      }
      
      localStorage.clear();
      
      // Restore auth
      authKeys.forEach(({key, value}) => localStorage.setItem(key, value));
      
      // Restore data from file
      Object.keys(restoredData).forEach((key) => {
        localStorage.setItem(key, restoredData[key]);
      });
      
      toast.success("Data restored successfully");
      window.location.reload();
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error("Failed to parse restore file. Make sure it's a valid GymDay backup.");
    }
  };

  const handleSupabaseBackup = async () => {
    if (!user) {
      toast.error("Cloud login required", {
        description: "Please sign in to back up your data to the cloud."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await migrateLocalData();
      toast.success("Cloud Backup Successful", {
        description: "Your local data has been merged with your cloud account."
      });
    } catch (error) {
      toast.error("Cloud synchronization failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupabaseRestore = async () => {
    if (!user) {
      toast.error("Cloud login required", {
        description: "Please sign in to restore your cloud data."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await Promise.all([refreshWorkoutData(), refreshExercises()]);
      toast.success("Cloud Data Restored", {
        description: "Your account data has been refreshed from the cloud."
      });
    } catch (error) {
      toast.error("Cloud restoration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDriveBackup = async () => {
    try {
      setIsLoading(true);
      const allData = { ...localStorage };
      const jsonString = JSON.stringify(allData, null, 2);
      
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split("T")[0];
      const filename = `GymDay_CloudBackup_${date}.json`;
      
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Cloud Backup Prepared!", {
        description: "Upload this file to your 'GymDay' folder in Google Drive manually.",
        duration: 6000
      });
    } catch (error) {
      toast.error("Cloud backup failed to initialize");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDriveRestore = async () => {
    // We'll use the same file picker as local restore, just with better instructions
    restoreFileInputRef.current?.click();
  };
   
  // Enhanced Android callbacks
  React.useEffect(() => {
    if (window.Android) {
      // File selection callback
      window.Android.onFileSelected = async (content: string) => {
        await handleRestoreData(content);
      };

      // Directory selection callback
      window.Android.onDirectorySelected = (directoryUri: string) => {
        console.log("Directory selected:", directoryUri);
        // Store selected directory for future use if needed
      };

      // Permission result callback
      window.Android.onPermissionResult = (granted: boolean) => {
        if (!granted) {
          toast.error("Storage permissions denied. Backup/restore features will not work.");
        }
      };

      // Error callback
      window.Android.onError = (error: string) => {
        console.error("Android bridge error:", error);
        toast.error(`Android error: ${error}`);
      };
    }
  }, []);

  const handleRestoreFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Define expected keys and their default values
        const expectedKeys = {
          exercises: "[]",
          savedWorkoutTemplates: "[]",
          workouts: "[]",
          customPlans: "[]",
        };
        // Ensure all expected keys exist, filling in defaults if missing
        const restoredData = { ...json };
        Object.keys(expectedKeys).forEach((key) => {
          if (!(key in restoredData)) {
            restoredData[key] = expectedKeys[key];
          }
        });
        // Preserving auth state
        const authKeys: {key: string, value: string}[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
            authKeys.push({ key: k, value: localStorage.getItem(k) || "" });
          }
        }
        
        localStorage.clear();

        // Restore auth
        authKeys.forEach(({key, value}) => localStorage.setItem(key, value));
        
        toast.success("Data restored successfully");
        window.location.reload();
      } catch (error) {
        console.error("Restore failed:", error);
        toast.error(`Failed to restore data: ${error instanceof Error ? error.message : "Invalid file"}`);
      } finally {
        setIsLoading(false);
        if (restoreFileInputRef.current) {
          restoreFileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    toast("Are you sure you want to delete all data?", {
      description: "This action cannot be undone. All exercises, workouts, and settings will be permanently deleted.",
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            setIsLoading(true);
            
            // Preserving auth state
            const authKeys: {key: string, value: string}[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
                authKeys.push({ key: k, value: localStorage.getItem(k) || "" });
              }
            }
            
            // Step 1: Clear all localStorage data
            localStorage.clear();
            
            // Restore auth
            authKeys.forEach(({key, value}) => localStorage.setItem(key, value));
            
            toast.success("Local data cleared. Cloud account and session preserved.");
            
            // Step 3: Use mobile-safe navigation instead of window.location.reload()
            const safeNavigateHome = () => {
            if (window.Android || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.location.replace('/');
            } else {
            window.location.reload();
            }
            };
            
            // Execute the navigation
            safeNavigateHome();
            
          } catch (error) {
            console.error("Delete all data failed:", error);
            toast.error("Failed to delete all data");
          } finally {
            setIsLoading(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="page-container page-transition">
      <TooltipProvider delayDuration={100}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/5">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="page-heading mb-0">Settings</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setHelpPageIndex(0)}>
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      <AccountSection />

      <div className="space-y-6">
        
        {/* Achievements Section */}
        <div id="achievements-section" className="card-glass p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110">
            <Trophy className="h-40 w-40 text-yellow-500" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight text-white uppercase">Achievements & PRs</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Personal Records & Milestones</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setHelpPageIndex(1)} // Achievements page index
              className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-gray-400 hover:text-white" />
            </Button>
          </div>
          
          <div className="relative z-10">
             <AchievementsList />
          </div>
        </div>

        {/* Data Metrics Section - Moved Up */}
        <div id="data-metrics-section" className="card-glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110">
            <BarChart2 className="h-40 w-40 text-gym-blue" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gym-blue/10 flex items-center justify-center border border-gym-blue/20">
                <BarChart2 className="h-6 w-6 text-gym-blue" />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight text-white uppercase leading-none">Personal Analytics</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Reports & Trend Analysis</p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setHelpPageIndex(2)} // Analytics index
              className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-gray-400 hover:text-white" />
            </Button>
          </div>
          <p className="text-sm text-gray-400 mb-6 relative z-10">
            Generate comprehensive reports of your fitness journey, including workout activity, body measurements, and BMI trends.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <Button 
                className="w-full bg-gym-blue hover:bg-gym-blue/90 text-white font-black h-12 rounded-xl shadow-lg shadow-blue-500/10 uppercase tracking-tighter"
                onClick={() => navigate('/data-metrics-report')}
            >
                <Activity className="mr-2 h-5 w-5" />
                View Full Report
            </Button>
            
            <Dialog>
                <DialogTrigger asChild>
                    <Button 
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-xl uppercase tracking-tighter"
                    >
                    <Timer className="mr-2 h-5 w-5 text-gym-purple" />
                    Manage Benchmarks
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-gym-darker border-white/5 shadow-2xl">
                    <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border-b border-white/5">
                        <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                            <Timer className="h-8 w-8 text-gym-purple" />
                            Exercise Benchmarks
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium">
                            Set your targets and baseline values for personalized workout suggestions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-8 pt-4">
                        <BenchmarkDataView hideHeader={true} />
                    </div>
                </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Full Screen Section */}
        <div id="fullscreen-section" className="card-glass p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isFullScreen ? (
                <Minimize2 className="h-6 w-6 text-gym-blue" />
              ) : (
                <Maximize2 className="h-6 w-6 text-gym-blue" />
              )}
              <div>
                <h2 className="text-lg font-medium">Full Screen</h2>
                <p className="text-sm text-muted-foreground">
                  {isFullScreen ? 'Exit full screen mode' : 'Expand the app to fill your entire screen'}
                </p>
              </div>
            </div>
            <button
              id="fullscreen-toggle-btn"
              onClick={toggleFullScreen}
              aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
              className={`
                relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gym-blue
                ${isFullScreen
                  ? 'bg-gym-blue shadow-[0_0_12px_2px_rgba(59,130,246,0.5)]'
                  : 'bg-gray-700 hover:bg-gray-600'
                }
              `}
            >
              <span
                className={`
                  absolute flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300
                  ${isFullScreen ? 'translate-x-3' : '-translate-x-3'}
                `}
              >
                {isFullScreen ? (
                  <Minimize2 className="h-3 w-3 text-gym-blue" />
                ) : (
                  <Maximize2 className="h-3 w-3 text-gray-500" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Smartwatch Sync Section */}
        <div id="smartwatch-sync-section" className="card-glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110">
            <Watch className="h-40 w-40 text-blue-400" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-blue-400/10 flex items-center justify-center border border-blue-400/20">
              <Watch className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black italic tracking-tight text-white uppercase leading-none">Smartwatch Sync</h2>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Health Connect Integration</p>
            </div>
            <Button 
              size="icon"
              variant="ghost"
              onClick={() => setHelpPageIndex(4)} // Data & Diagnostics (Smartwatch sync is here)
              className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-gray-400 hover:text-white" />
            </Button>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Connection Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    syncStatus.isConnected 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {syncStatus.isConnected ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {syncStatus.lastSyncTime ? (
                  <div>
                    <p className="text-lg font-black text-white italic tracking-tighter">Synced</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">
                      Last: {syncStatus.lastSyncTime.toLocaleDateString()} at {syncStatus.lastSyncTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-gray-500 italic uppercase">Waiting for data...</p>
                )}
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Setup Guide</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-300 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-gym-blue" />
                    Pair watch with Samsung/Google Health
                  </p>
                  <p className="text-xs text-gray-300 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-gym-blue" />
                    Auto-sync enabled for recent data
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleCheckPermissions}
                disabled={isLoading || isSyncing}
                className="bg-blue-600 hover:bg-blue-700 h-10 rounded-xl font-bold flex-1 shadow-lg shadow-blue-500/15"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                {syncStatus.hasPermissions ? 'Update Permissions' : 'Grant Permissions'}
              </Button>
              <Button 
                onClick={handleManualSync}
                disabled={isLoading || isSyncing}
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 h-10 rounded-xl font-bold flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </div>

        {/* Data Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Data Recovery & Cloud Sync Section */}
          <div className="card-glass p-6 rounded-2xl relative overflow-hidden flex flex-col h-full border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gym-blue/10 flex items-center justify-center border border-gym-blue/20">
                <Database className="h-6 w-6 text-gym-blue" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black italic tracking-tight text-white uppercase leading-none">Data Management</h2>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Manual Backup & Cloud Sync</p>
              </div>
              <Button 
                size="icon"
                variant="ghost"
                onClick={() => setHelpPageIndex(4)} // Data & Diagnostics
                className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-white" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Cloud Sync Tool */}
              <div className="bg-black/40 rounded-xl border border-white/5 p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <Cloud className="h-20 w-20 text-gym-blue" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gym-blue" />
                    <span className="text-sm font-black uppercase text-white tracking-widest">Supabase Cloud</span>
                  </div>
                  {!user && (
                    <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Sign-in Required</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-4 font-medium h-8 line-clamp-2">
                  Maintain a persistent account to sync workouts and body metrics across all your devices seamlessly.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="ghost" 
                    className="h-10 text-[10px] font-black uppercase text-gym-blue hover:bg-gym-blue/10 gap-2 border border-gym-blue/10 bg-gym-blue/5" 
                    onClick={handleSupabaseBackup}
                    disabled={!user || isLoading}
                  >
                    <Upload className="h-3 w-3" /> Backup Cloud
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-10 text-[10px] font-black uppercase text-gym-green hover:bg-gym-green/10 gap-2 border border-gym-green/10 bg-gym-green/5" 
                    onClick={handleSupabaseRestore}
                    disabled={!user || isLoading}
                  >
                    <RefreshCw className="h-3 w-3" /> Restore Cloud
                  </Button>
                </div>
              </div>

              {/* Local & Drive Utilities */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between hover:bg-white/10 transition-all cursor-pointer group" onClick={handleBackupAllData}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <Download className="h-4 w-4 text-gym-blue group-hover:animate-bounce" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gym-blue">Full JSON</span>
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-white">Local Backup</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between hover:bg-white/10 transition-all cursor-pointer group" onClick={handleRestoreAllDataClick}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <Upload className="h-4 w-4 text-gym-green group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gym-green">Import File</span>
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-white">Local Restore</span>
                  </div>
                </div>
              </div>

              {/* Google Drive Bar */}
              <div className="bg-gym-darker/60 rounded-xl border border-white/5 p-3 flex items-center justify-between group hover:border-gym-blue/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#4285F4]/10 flex items-center justify-center border border-[#4285F4]/20">
                    <WifiOff className="h-4 w-4 text-[#4285F4]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Google Drive Helper</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Manual Cloud Storage</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    className="h-8 px-2 text-[10px] font-black uppercase text-gym-blue hover:bg-gym-blue/10 gap-1.5" 
                    onClick={handleGoogleDriveBackup}
                  >
                    <Download className="h-3 w-3" /> Save to Drive
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-8 px-2 text-[10px] font-black uppercase text-gym-green hover:bg-gym-green/10 gap-1.5" 
                    onClick={handleGoogleDriveRestore}
                  >
                    <Upload className="h-3 w-3" /> Restore
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Library Utility Section */}
          <div className="card-glass p-6 rounded-2xl relative overflow-hidden flex flex-col h-full border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Dumbbell className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black italic tracking-tight text-white uppercase leading-none">Library Utility</h2>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="h-4 w-4 text-gray-500 hover:text-amber-500 cursor-help outline-none"
                        onClick={() => setHelpPageIndex(4)} // Data & Diagnostics index
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="right" className="max-w-[250px] bg-black/95 border-white/20 text-[11px] p-4 text-white shadow-2xl z-[100]">
                      <div className="space-y-2">
                        <p className="font-black uppercase tracking-widest text-amber-500 border-b border-amber-500/20 pb-1 mb-2">Library Help</p>
                        <p className="leading-relaxed">
                          Use these tools to <strong>backup</strong> your custom library locally (CSV), <strong>migrate</strong> assets like photos to our cloud, or <strong>sync</strong> the entire library across all your devices.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Exercise Database Controls</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between hover:bg-white/10 transition-all cursor-pointer group" onClick={handleExportCSV}>
                    <div className="flex justify-between items-start mb-2">
                       <div className="h-8 w-8 rounded-lg bg-amber-500/5 flex items-center justify-center border border-amber-500/10">
                          <Download className="h-4 w-4 text-amber-500 group-hover:animate-bounce" />
                       </div>
                       <span className="text-[10px] font-black uppercase text-amber-500">CSV Sheet</span>
                    </div>
                    <div>
                       <span className="text-xs font-black uppercase text-white">Port Library</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between hover:bg-white/10 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <div className="flex justify-between items-start mb-2">
                       <div className="h-8 w-8 rounded-lg bg-gym-blue/5 flex items-center justify-center border border-gym-blue/10">
                          <Upload className="h-4 w-4 text-gym-blue group-hover:scale-110 transition-transform" />
                       </div>
                       <span className="text-[10px] font-black uppercase text-gym-blue">Bulk Add</span>
                    </div>
                    <div>
                       <span className="text-xs font-black uppercase text-white">Import Library</span>
                    </div>
                  </div>
               </div>

               <div className="bg-black/40 rounded-xl border border-white/5 p-5 flex flex-col items-center justify-center text-center group hover:bg-black/60 transition-all border-dashed">
                  <SettingsIcon className="h-8 w-8 text-gray-600 mb-3 group-hover:rotate-180 transition-transform duration-700" />
                  <h3 className="text-sm font-black uppercase text-white mb-2">Factory Reinstall</h3>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-4 leading-relaxed max-w-[200px]">
                    Reset all default exercises to their original state and fix broken entries.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl uppercase text-[10px] tracking-[0.2em]"
                    onClick={handleReinstallExercises}
                    disabled={isLoading}
                  >
                    Factory Reinstall Defaults
                  </Button>
               </div>
            </div>
            
            <div className="mt-auto space-y-2 pt-2">
                <Button 
                   variant="ghost" 
                   className="w-full text-xs font-black uppercase italic tracking-tighter text-gym-blue hover:text-white hover:bg-gym-blue/20 gap-2 h-10 rounded-xl border border-gym-blue/10"
                   onClick={handleMigrateImages}
                   disabled={isMigrating || isLoading}
                >
                   {isMigrating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                   {isMigrating ? "Syncing Exercise Assets..." : "Sync Assets to Supabase Cloud"}
                </Button>

                <Button 
                   variant="ghost" 
                   className="w-full text-[10px] font-black uppercase italic tracking-tighter text-amber-500 hover:text-white hover:bg-amber-500/20 gap-2 h-10 rounded-xl border border-amber-500/10"
                   onClick={handleMigrateCFExercises}
                   disabled={isMigrating || isLoading}
                >
                   {isMigrating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                   Tag CF Exercises → Choice Fitness
                </Button>
            </div>
          </div>
        </div>
        
        <div className="card-glass p-6 rounded-2xl group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110">
            <SettingsIcon className="h-40 w-40 text-gray-400" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <SettingsIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tight text-white uppercase leading-none">Global Preferences</h2>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Units & Calibration</p>
            </div>
            <Button 
              size="icon"
              variant="ghost"
              onClick={() => setHelpPageIndex(3)} // Timers / Units index
              className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors ml-auto"
            >
              <HelpCircle className="h-5 w-5 text-gray-400 hover:text-white" />
            </Button>
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 block">Measurement System</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={unitSystem === 'metric' ? 'default' : 'outline'}
                  onClick={() => setUnitSystem('metric')}
                  className={`h-12 rounded-xl font-black uppercase tracking-tighter transition-all ${unitSystem === 'metric' ? 'bg-gym-blue shadow-lg shadow-blue-500/20' : 'border-white/10 opacity-60'}`}
                >
                  Metric (kg/cm)
                </Button>
                <Button
                  variant={unitSystem === 'imperial' ? 'default' : 'outline'}
                  onClick={() => setUnitSystem('imperial')}
                  className={`h-12 rounded-xl font-black uppercase tracking-tighter transition-all ${unitSystem === 'imperial' ? 'bg-gym-blue shadow-lg shadow-blue-500/20' : 'border-white/10 opacity-60'}`}
                >
                  Imperial (lb/in)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sound Settings Section */}
        <div className="card-glass p-6 rounded-2xl group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110">
            <Volume2 className="h-40 w-40 text-gym-blue" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-gym-blue/10 flex items-center justify-center border border-gym-blue/20">
              <Volume2 className="h-6 w-6 text-gym-blue" />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tight text-white uppercase leading-none">Audio & Feedback</h2>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Alerts & Vibrations</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setHelpPageIndex(3)} // Timers / Performance index
              className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors ml-auto"
            >
              <HelpCircle className="h-5 w-5 text-gray-400 hover:text-white" />
            </Button>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Customize sounds and vibrations for timers and notifications.
          </p>
          
          <div className="space-y-8">
            {/* Rest Timer Sound Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gym-blue uppercase tracking-wider">Rest Timer Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="timer-sound" className="text-base text-white">Sound</Label>
                    <p className="text-xs text-muted-foreground">Play a sound when rest timer finishes</p>
                  </div>
                  <Switch 
                    id="timer-sound"
                    checked={timerSound}
                    onCheckedChange={setTimerSound}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="timer-vibration" className="text-base text-white">Vibration</Label>
                    <p className="text-xs text-muted-foreground">Vibrate device when rest timer finishes</p>
                  </div>
                  <Switch 
                    id="timer-vibration"
                    checked={timerVibration}
                    onCheckedChange={setTimerVibration}
                  />
                </div>
              </div>
            </div>

            {/* Notification Sound Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-700/50">
              <h3 className="text-sm font-semibold text-gym-purple uppercase tracking-wider">Notification Sound settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-sound" className="text-base text-white">Sound</Label>
                    <p className="text-xs text-muted-foreground">Hear a chime or bell for workout reminders</p>
                  </div>
                  <Switch 
                    id="notif-sound"
                    checked={notificationSound}
                    onCheckedChange={setNotificationSound}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-vibration" className="text-base text-white">Vibration</Label>
                    <p className="text-xs text-muted-foreground">Vibrate device for workout reminders</p>
                  </div>
                  <Switch 
                    id="notif-vibration"
                    checked={notificationVibration}
                    onCheckedChange={setNotificationVibration}
                  />
                </div>
              </div>
            </div>

            {/* Rest Timer Duration */}
            <div className="pt-6 border-t border-gray-700">
              <Label className="text-base text-white">Default Rest Timer Duration</Label>
              <p className="text-xs text-muted-foreground mb-3">Sets how long the rest timer counts down after each set.</p>
              
              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[10, 15, 30, 45, 50, 60].map(sec => (
                  <Button
                    key={sec}
                    size="sm"
                    variant={defaultRestTime === sec && !isCustomRest ? 'default' : 'outline'}
                    className={defaultRestTime === sec && !isCustomRest ? 'bg-gym-blue border-gym-blue' : 'border-gray-600'}
                    onClick={() => { setDefaultRestTime(sec); setIsCustomRest(false); setCustomRestInput(''); }}
                  >
                    {sec}s
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant={isCustomRest ? 'default' : 'outline'}
                  className={isCustomRest ? 'bg-gym-purple border-gym-purple' : 'border-gray-600'}
                  onClick={() => setIsCustomRest(true)}
                >
                  Custom
                </Button>
              </div>

              {/* Custom input */}
              {isCustomRest && (
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={5}
                    max={600}
                    placeholder="Enter seconds (5–600)"
                    value={customRestInput}
                    onChange={e => setCustomRestInput(e.target.value)}
                    className="w-48 bg-gym-darker border-gray-600"
                  />
                  <Button
                    size="sm"
                    className="bg-gym-green hover:bg-gym-green/80"
                    onClick={() => {
                      const val = Math.min(600, Math.max(5, parseInt(customRestInput, 10) || 60));
                      setDefaultRestTime(val);
                      setCustomRestInput(String(val));
                    }}
                  >
                    Set
                  </Button>
                  <span className="text-xs text-gray-400">max 10 min (600s)</span>
                </div>
              )}

              <p className="text-xs text-gym-blue mt-2">
                Current: <strong>{defaultRestTime}s</strong> ({Math.floor(defaultRestTime / 60)}m {defaultRestTime % 60}s)
              </p>
            </div>

            {/* Voice Logging Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Mic className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <Label htmlFor="voice-logging" className="text-base text-white">Voice Logging</Label>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => setHelpPageIndex(7)} 
                         className="h-5 w-5 rounded-full hover:bg-white/5 flex items-center justify-center"
                       >
                         <HelpCircle className="h-3 w-3 text-gray-500" />
                       </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Log sets hands-free using voice commands</p>
                  </div>
                </div>
                <Switch 
                  id="voice-logging"
                  checked={voiceLoggingEnabled}
                  onCheckedChange={(checked) => {
                    setVoiceLoggingEnabled(checked);
                    if (checked) {
                      toast.success("Voice logging enabled! You can now log sets hands-free during workouts.");
                      if (navigator.vibrate) navigator.vibrate(50);
                    } else {
                      toast.info("Voice logging disabled.");
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gym-card/50 border border-white/5 flex items-center justify-center">
                    <ArrowUp className="h-5 w-5 text-gym-red" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <Label htmlFor="scroll-to-top" className="text-base font-medium">Scroll to Top Button</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Show a floating arrow to easily scroll to the top</p>
                  </div>
                </div>
                <Switch 
                  id="scroll-to-top"
                  checked={showScrollToTopButton}
                  onCheckedChange={(checked) => {
                    setShowScrollToTopButton(checked);
                    if (checked) {
                      toast.success("Scroll to top button enabled!");
                    } else {
                      toast.info("Scroll to top button disabled.");
                    }
                  }}
                />
              </div>

            </div>
          </div>
        </div>

        
        {/* Danger Zone */}
        <div className="card-glass p-6 rounded-2xl relative overflow-hidden group border border-red-500/10 mb-6">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110">
            <AlertTriangle className="h-40 w-40 text-red-500" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black italic tracking-tight text-white uppercase leading-none text-red-500">Danger Zone</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setHelpPageIndex(5)} // Danger Zone index
                  className="h-6 w-6 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-red-500/50 hover:text-red-500" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-4 w-4 text-red-500/50 hover:text-red-500 cursor-help outline-none">
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" className="max-w-[280px] bg-black/95 border-red-500/30 text-[11px] p-4 text-white shadow-2xl z-[100]">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        <p><strong>Warning:</strong> These actions are IRREVERSIBLE. Data deleted from Cloud cannot be recovered.</p>
                      </div>
                      <div className="space-y-1.5 border-t border-white/10 pt-3">
                        <p className="font-black uppercase tracking-tighter text-red-500 pb-1 mb-1">Action Legend:</p>
                        <p>• <strong>Wipe Local:</strong> Clears cache on this device. Cloud data remains safe.</p>
                        <p>• <strong>Purge Library:</strong> Deletes ALL exercises from your account.</p>
                        <p>• <strong>History:</strong> Wipes all past logged workouts and sets.</p>
                        <p>• <strong>Analytics:</strong> Clears Body Weight, Measurements, and Health Metrics.</p>
                        <p>• <strong>Stats:</strong> Resets all Personal Records (PRs) back to zero.</p>
                        <p>• <strong>Plans:</strong> Removes all manual and AI-generated workout plans.</p>
                        <p>• <strong>Custom Exercises:</strong> Removes only your added exercises. Default library stays safe.</p>
                        <p>• <strong>Full Cloud Reset:</strong> Wipes ALL activity (History, Stats, Plans, Metrics) but <strong>KEEPS</strong> your Exercise library.</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Irreversible Actions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-white mb-1">Purge Local Storage</h4>
                <p className="text-[10px] text-gray-500 font-medium uppercase mb-4">Wipes all workouts, sets, and metrics stored locally on this device.</p>
              </div>
              <Button
                variant="destructive"
                className="w-full h-10 bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white font-black rounded-xl uppercase text-[10px] tracking-widest"
                onClick={handleDeleteAllData}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Wipe All Local Data
              </Button>
            </div>

            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-white mb-1">Delete Exercise Library</h4>
                <p className="text-[10px] text-gray-500 font-medium uppercase mb-4">Clears your entire exercise database. Defaults can be reinstalled later.</p>
              </div>
              <Button
                variant="destructive"
                className="w-full h-10 bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white font-bold rounded-xl transition-all uppercase text-[10px] tracking-widest"
                onClick={handleDeleteAllExercises}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Purge Library
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 border-t border-white/5 pt-6">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-10 border-red-500/10 bg-red-500/5 hover:bg-red-500/20 text-red-500 font-black rounded-xl uppercase text-[10px] tracking-widest"
                onClick={() => {
                  if (confirm("Purge ALL workout history? This cannot be undone.")) purgeWorkoutsOnly();
                }}
                disabled={isLoading}
              >
                <History className="mr-2 h-3.5 w-3.5" /> Purge Workout History Only
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-10 border-red-500/10 bg-red-500/5 hover:bg-red-500/20 text-red-500 font-black rounded-xl uppercase text-[10px] tracking-widest"
                onClick={() => {
                  if (confirm("Purge ALL analytics (Measurements & Metrics)? This cannot be undone.")) purgeAnalyticsOnly();
                }}
                disabled={isLoading}
              >
                <Activity className="mr-2 h-3.5 w-3.5" /> Purge Analytics Only
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-10 border-red-500/10 bg-red-500/5 hover:bg-red-500/20 text-red-500 font-black rounded-xl uppercase text-[10px] tracking-widest"
                onClick={() => {
                  if (confirm("Purge ALL personal stats and PRs? This cannot be undone.")) purgePersonalStatsOnly();
                }}
                disabled={isLoading}
              >
                <Trophy className="mr-2 h-3.5 w-3.5" /> Purge Personal Stats
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-10 border-red-500/10 bg-red-500/5 hover:bg-red-500/20 text-red-500 font-black rounded-xl uppercase text-[10px] tracking-widest"
                onClick={() => {
                  if (confirm("Purge ALL custom workout plans? This cannot be undone.")) purgeCustomPlansOnly();
                }}
                disabled={isLoading}
              >
                <ClipboardList className="mr-2 h-3.5 w-3.5" /> Purge Custom Plans
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-10 border-red-500/10 bg-red-500/5 hover:bg-red-500/20 text-red-500 font-black rounded-xl uppercase text-[10px] tracking-widest"
                onClick={() => {
                  if (confirm("Purge ONLY your personally added exercises? The default library remains safe.")) purgeCustomExercisesOnly();
                }}
                disabled={isLoading}
              >
                <Dumbbell className="mr-2 h-3.5 w-3.5" /> Purge Custom Exercises
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-10 border-yellow-500/10 bg-yellow-500/5 hover:bg-yellow-500/20 text-yellow-500 font-black rounded-xl uppercase text-[10px] tracking-widest"
                onClick={() => {
                  if (confirm("Remove all duplicate exercises from your library? (Keeps only one of each)")) deduplicateDatabase();
                }}
                disabled={isLoading}
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Clean Duplicate Exercises
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                className="w-full h-10 bg-red-600/20 text-red-500 border border-red-600/30 hover:bg-red-600 hover:text-white font-black rounded-xl uppercase text-[10px] tracking-widest"
                onClick={async () => {
                  if (confirm("DANGER: This will wipe EVERYTHING (Workouts, Metrics, Plans, Stats) EXCEPT your Exercises. This is permanent. Continue?")) {
                    try {
                      setIsLoading(true);
                      await Promise.all([
                        purgeWorkoutsOnly(),
                        purgeAnalyticsOnly(),
                        purgePersonalStatsOnly(),
                        purgeCustomPlansOnly()
                      ]);
                      toast.success("Full Cloud Reset Complete (Library Preserved)");
                    } catch (e) {
                      toast.error("Total purge failed part-way through.");
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                disabled={isLoading}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Full Cloud Reset (Keeps Exercises)
              </Button>
            </div>
          </div>
        </div>

        {/* Software Intel Section */}
        <div className="card-glass p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110">
             <SettingsIcon className="h-48 w-48 text-gray-400" />
          </div>
          <div className="flex items-center gap-6 relative z-10 mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-white/10 group-hover:rotate-3 transition-transform">
               <Trophy className="h-10 w-10 text-white" />
            </div>
            <div>
               <p className="text-2xl font-black italic tracking-tighter text-white uppercase">GymDay Fit</p>
               <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] font-black text-gray-400 uppercase tracking-tighter border border-white/5">v3.4 Stable</span>
                  <span className="px-2 py-0.5 rounded-lg bg-gym-blue/10 text-[10px] font-black text-gym-blue uppercase tracking-tighter border border-gym-blue/20">Pro</span>
               </div>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-6">
             <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Engineered for maximum performance tracking, GymDay Fit Tracker provides professional-grade biomechanical insights and routine planning to fuel your physical evolution.
             </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0 bg-[#0f172a] border-gray-800 shadow-2xl">
                <DialogHeader className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/5">
                  <DialogTitle className="text-2xl font-black italic flex items-center gap-3 tracking-tighter uppercase text-white">
                    <History className="h-6 w-6 text-gym-blue animate-pulse-slow" />
                    Changelog
                  </DialogTitle>
                  <DialogDescription className="text-gray-400 font-medium">Evolution of GymDay Fit Tracker</DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <Accordion type="single" collapsible defaultValue="v35" className="w-full space-y-3">
                    {/* Version 3.5 */}
                    <AccordionItem value="v35" className="border-none bg-white/5 rounded-2xl px-4 overflow-hidden shadow-inner border border-blue-500/20">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-500/30">
                            <Zap className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-white leading-none">Version 3.5</h3>
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-black uppercase mt-1 inline-block">Live Workout Update</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <ul className="space-y-3 text-sm text-gray-300">
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Neural Voice Logging:</strong> Hands-free set and heart rate acquisition. Say "HR 145" or "Add 30 for 10" to log instantly without touching your phone.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Tactical Workout Header:</strong> The topmost section of your workout (images and title) now remains pinned to the top, perfect for quick reference while filming or moving around.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Advanced Analytics v2:</strong> View high-fidelity performance graphs that correlate your lifting volume with your heart rate fluctuations for deeper session insight.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Precision Alignment:</strong> Adding sets now automatically aligns the entry box with your visual field, streamlining the "Set → Log → Rest" cycle.</span>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    {/* Version 3.4 */}
                    <AccordionItem value="v34" className="border-none bg-white/5 rounded-2xl px-4 overflow-hidden shadow-inner">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-500/30">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-white leading-none">Version 3.4</h3>
                            <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-black uppercase mt-1 inline-block">Pro Animation Update</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <ul className="space-y-3 text-sm text-gray-300">
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Range of Motion Photos:</strong> Add both a <em>Before</em> and <em>After</em> photo to any exercise. A new animation engine cycles between them every 3 seconds during your workout!</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Direct Upload Support:</strong> No more copying URLs! You can now upload photos directly from your phone or PC for every position image.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Live Workout Shortcuts:</strong> Tap the new <em>Pencil</em> icon or <em>Camera</em> placeholders in the workout header to jump straight to the edit screen and add missing photos instantly.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Granular Danger Zone:</strong> Total control over your data! Selectively purge workout history, body analytics, or personal stats without losing your exercises or plans.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Advanced Data Management:</strong> New mobile-perfect Help Legends added to the Danger Zone and Library Utility sections. Everything's now just a tap away.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Gym Privacy & Sync:</strong> Enhanced security ensures your custom gyms are private to your account only. Deduplication logic also keeps your gym list clean and duplicates-free.</span>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Version 3.3 */}
                    <AccordionItem value="v33" className="border-none bg-white/5 rounded-2xl px-4 overflow-hidden shadow-inner">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-500/30">
                            <Sparkles className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-white leading-none">Version 3.3</h3>
                            <span className="text-[10px] bg-blue-500 text-black px-1.5 py-0.5 rounded-full font-black uppercase mt-1 inline-block">Pro Update</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <ul className="space-y-3 text-sm text-gray-300">
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Multi-Zone Selection:</strong> Run workouts across your whole gym! Switching zones now keeps your previous picks visible at the top so you can build a massive multi-area session.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Enhanced Help Center:</strong> A completely rewritten 7-page visual guide in the Exercise Library covering everything from filters to pro-tips.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Gym Migration Tool:</strong> One-tap migration in Settings to automatically tag all your custom exercises to the correct gym zones.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Zone Previews:</strong> See exactly which exercises belong to each area of your gym with real-time thumbnails and counts before you even filter.</span>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Version 3.2 */}
                    <AccordionItem value="v32" className="border-none bg-white/5 rounded-2xl px-4 overflow-hidden shadow-inner">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
                            <Sparkles className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-white leading-none">Version 3.2</h3>
                            <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-full font-black uppercase mt-1 inline-block">Stable Update</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <ul className="space-y-3 text-sm text-gray-300">
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Visual Exercise Filters:</strong> Tap Equipment, Category, or Muscle Group gateway cards to browse sub-filters with vivid imagery in a centered popup modal.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Expanded Exercise Library:</strong> 40+ new common exercises added — dumbbell tricep extensions, kickbacks, skull crushers, cable pushdowns, hammer curls, leg press, Bulgarian split squats, and more.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Sync Library Button:</strong> One-tap sync to add any missing default exercises to your library without affecting existing data.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>My Gym Filter:</strong> Filter the Exercise Library by your Custom Gym Builder gyms and individual zones — quickly find only the machines in your specific section.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Collapsible Dropdown Filters:</strong> Equipment, Category, and Muscle Group dropdowns now collapse into a compact accordion — search bar stays always visible.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Centered Filter Popups:</strong> Visual filter modals now open perfectly centered on screen instead of sliding from the bottom.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Cancelled Workout Fix:</strong> Workouts cancelled mid-session or due to app staleness are no longer recorded as completed in Stats or History.</span>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Version 3.1 */}
                    <AccordionItem value="v31" className="border-none bg-white/5 rounded-2xl px-4 overflow-hidden shadow-inner">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-500/30">
                            <Sparkles className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-white leading-none">Version 3.1</h3>
                            <span className="text-[10px] bg-cyan-500 text-black px-1.5 py-0.5 rounded-full font-black uppercase mt-1 inline-block">Pro Update</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <ul className="space-y-3 text-sm text-gray-300">
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Professional Gym Builder:</strong> Plan your gym into zones for targeted training.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>Visual Intelligence:</strong> 100+ exercise thumbnails integrated across Stats & Plans.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>PWA Refresh:</strong> Native-feel branding and high-res iconography for mobile shortcuts.</span>
                          </li>
                          <li className="flex gap-3">
                            <div className="h-5 w-5 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                            <span><strong>AI Workout Architect:</strong> Equipment-aware Gemini AI routines.</span>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Version 3.0 */}
                    <AccordionItem value="v30" className="border-none bg-white/5 rounded-2xl px-4 overflow-hidden">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <Watch className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-white leading-none">Version 3.0</h3>
                            <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full font-black uppercase mt-1 inline-block">Cloud Sync</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex gap-2"><span>•</span> Smartwatch Sync via Health Connect Integration</li>
                          <li className="flex gap-2"><span>•</span> Health Meter Circle Graph & Timeline Trends</li>
                          <li className="flex gap-2"><span>•</span> Smart Entry Flow for precision workout tracking</li>
                          <li className="flex gap-2"><span>•</span> Dynamic Graffiti Target Achievement effects</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Version 2.0 */}
                    <AccordionItem value="v20" className="border-none bg-white/5 rounded-2xl px-4 overflow-hidden">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 text-left opacity-70">
                          <div className="h-10 w-10 rounded-xl bg-gray-500/20 flex items-center justify-center border border-gray-500/30">
                            <Zap className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">Version 2.0</h3>
                            <span className="text-[10px] text-gray-500 uppercase font-black">AI Core</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 opacity-70">
                        <ul className="space-y-1 text-xs text-gray-500">
                          <li>• Gemini Pro API Integration for Smart Planning</li>
                          <li>• Advanced Favorite & Search algorithms</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                <div className="p-4 bg-gray-900/50 border-t border-white/5 flex justify-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Built for Greatness • {new Date().getFullYear()}</p>
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setBetaTesterDialogOpen(true)}
                  className="h-10 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-gym-blue/10 border-gym-blue/20 text-gym-blue hover:bg-gym-blue hover:text-white transition-all shadow-lg shadow-blue-500/10 gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Become a Beta Tester
                </Button>
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-white"
                  onClick={() => setHelpPageIndex(6)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* Beta Roster Management UI */}
              <div className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gym-blue animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Program Management</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-black/30 p-1 rounded-xl border border-white/5">
                    <Button 
                      onClick={() => setRosterFilter('all')}
                      variant="ghost" 
                      className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg transition-all ${rosterFilter === 'all' ? 'bg-gym-blue text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
                    >All</Button>
                    <Button 
                      onClick={() => setRosterFilter('day')}
                      variant="ghost" 
                      className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg transition-all ${rosterFilter === 'day' ? 'bg-gym-blue text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
                    >24H</Button>
                    <Button 
                      onClick={() => setRosterFilter('week')}
                      variant="ghost" 
                      className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg transition-all ${rosterFilter === 'week' ? 'bg-gym-blue text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
                    >Week</Button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <Button 
                      onClick={() => setShowArchived(!showArchived)}
                      variant="ghost" 
                      className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg transition-all ${showArchived ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white'}`}
                    >
                      {showArchived ? 'Active' : 'Archived'}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {betaRoster
                    .filter(t => {
                      if (!showArchived && t.isArchived) return false;
                      if (showArchived && !t.isArchived) return false;
                      
                      const now = Date.now();
                      const oneDay = 24 * 60 * 60 * 1000;
                      if (rosterFilter === 'day') return (now - t.timestamp) < oneDay;
                      if (rosterFilter === 'week') return (now - t.timestamp) < (oneDay * 7);
                      if (rosterFilter === 'month') return (now - t.timestamp) < (oneDay * 30);
                      return true;
                    })
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((tester, idx) => {
                      const isExpanded = expandedTesterId === tester.id;
                      const isFounder = tester.status.includes('Founder') || tester.status.includes('Architect');
                      return (
                        <div 
                          key={tester.id || idx}
                          className={`group flex flex-col gap-0 rounded-2xl border transition-all ${
                            isExpanded 
                            ? 'bg-white/10 border-white/20 shadow-xl' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4 p-3 w-full">
                            <div 
                              onClick={() => setExpandedTesterId(isExpanded ? null : tester.id)}
                              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform cursor-pointer ${
                                isFounder 
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/5' 
                                : 'bg-gym-blue/10 border-gym-blue/20 text-gym-blue'
                              } ${isExpanded ? 'scale-90' : 'group-hover:scale-110'}`}
                            >
                              {isFounder ? <Crown className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                            </div>
                            
                            <div className="flex-1 min-w-0 pointer-events-none">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-white truncate uppercase tracking-tight">{tester.name}</p>
                                {isFounder && (
                                  <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-sm uppercase border border-amber-500/20">Staff</span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 truncate font-medium">{tester.email}</p>
                            </div>
                            
                            <div className="text-right shrink-0 flex items-center gap-2 sm:gap-4">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={(e) => { e.stopPropagation(); archiveTester(tester.id); }}
                                      className="h-7 w-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                                    >
                                      <Archive className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p className="text-[10px] font-bold uppercase">{tester.isArchived ? 'Restore' : 'Archive'}</p></TooltipContent>
                                </Tooltip>
                                
                                {!isFounder && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={(e) => { e.stopPropagation(); deleteTester(tester.id, tester.name); }}
                                        className="h-7 w-7 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-500"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p className="text-[10px] font-bold uppercase">Delete Permanently</p></TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              <ChevronDown 
                                onClick={() => setExpandedTesterId(isExpanded ? null : tester.id)}
                                className={`h-4 w-4 text-gray-600 transition-transform duration-300 cursor-pointer ${isExpanded ? 'rotate-180 text-white' : ''}`} 
                              />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-3 pb-4 pt-0 animate-in slide-in-from-top-2 duration-300">
                              <div className="mt-1 p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-3 w-3 text-gym-blue" />
                                    <span className="text-[9px] font-black uppercase text-gym-blue tracking-[0.2em]">Candidate Vision</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-600 italic">Received: {tester.date}</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed italic pr-2 font-medium">"{tester.suggestions || 'No specific feedback provided yet.'}"</p>
                                <div className="pt-2 flex items-center justify-between">
                                  <div className="flex gap-2">
                                    <span className="text-[8px] font-black text-gray-600 bg-white/5 px-2 py-1 rounded inline-block uppercase tracking-widest">{tester.id}</span>
                                    <span className="text-[8px] font-black text-gym-blue/60 bg-gym-blue/5 px-2 py-1 rounded inline-block uppercase tracking-widest">{tester.status}</span>
                                  </div>
                                  {tester.mailOpened && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                      <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Clipboard Ready</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  
                  {betaRoster.length === 0 && (
                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-2xl">
                      <Users className="h-10 w-10 text-gray-700 mx-auto mb-3 opacity-20" />
                      <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">No candidates found in this scope.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SettingsHelpPopup
        isOpen={helpPageIndex !== null}
        onClose={() => setHelpPageIndex(null)}
        initialPage={helpPageIndex ?? 0}
      />
      <BetaTesterDialog
        open={betaTesterDialogOpen}
        onOpenChange={setBetaTesterDialogOpen}
      />
      </TooltipProvider>
    </div>
  );
};

export default Settings;
