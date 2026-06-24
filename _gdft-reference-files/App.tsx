
import { useState, useCallback, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { ExerciseProvider } from "@/contexts/ExerciseContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { SettingsProvider } from './contexts/SettingsContext'; 
import { AuthProvider } from './contexts/AuthContext';
import { Maximize2, Minimize2 } from "lucide-react";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Exercises from "./pages/Exercises";
import CreateExercise from "./pages/CreateExercise";
import CreateWorkout from "./pages/CreateWorkout";
import Workout from "./pages/Workout";
import Stats from "./pages/Stats";
import Calendar from "./pages/Calendar";
import MyCalendar from "./pages/MyCalendar";
import SettingsPage from "./pages/Settings";
import CustomPlans from "./pages/CustomPlans";
import BodyMetricsPage from "./pages/BodyMetricsPage";
import SecondHealthMetricsPage from "./pages/2ndHealthMetrics";
import DataMetricsReport from "./pages/DataMetricsReport";
import BenchmarkData from "./pages/BenchmarkData";
import GenerateWorkoutPlan from "./pages/GenerateWorkoutPlan";
import HealthDashboard from "./pages/HealthDashboard";
import SmartwatchTrends from "./pages/SmartwatchTrends";
import ExercisePositionManager from "./pages/ExercisePositionManager";
import NotFound from "./pages/NotFound";
import { WorkoutReminderSystem } from "./components/WorkoutReminderSystem";

const queryClient = new QueryClient();

const isWebView = () => {
  return window.Android || 
         /Android.*wv|iPhone.*Mobile.*Safari|iPad.*Mobile.*Safari/.test(navigator.userAgent);
};

// ── Fullscreen Toggle Button ────────────────────────────────────────────────
function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep state in sync if user presses Escape or browser changes state
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggle = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen not supported or blocked
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <button
      id="fullscreen-toggle-btn"
      onClick={toggle}
      title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
      className={`
        fixed top-3 right-3 z-[9999]
        flex items-center justify-center
        h-9 w-9 rounded-full
        border border-gray-700/80 bg-gym-dark/90 backdrop-blur-sm
        text-gray-400 hover:text-white hover:border-gym-blue/60 hover:bg-gym-blue/10
        transition-all duration-200 shadow-lg
        active:scale-90
      `}
      aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </button>
  );
}

function App() {
  const basename = isWebView() ? '' : undefined;
  
  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <SettingsProvider>
              <ExerciseProvider>
                <WorkoutProvider>
                  <WorkoutReminderSystem />
                  <div className="bg-gym-darker min-h-screen text-white flex flex-col">
                    {/* Global Fullscreen Button */}
                    <FullscreenButton />

                    <main className="flex-grow container mx-auto px-4 py-2 md:py-4 pb-20">
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Index />} />
                        <Route path="/exercises" element={<Exercises />} />
                        <Route path="/create-exercise" element={<CreateExercise />} />
                        <Route path="/create-workout" element={<CreateWorkout />} />
                        <Route path="/workout" element={<Workout />} />
                        <Route path="/stats" element={<Stats />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/my-calendar" element={<MyCalendar />} />
                        <Route path="/custom-plans" element={<CustomPlans />} />
                        <Route path="/body-metrics" element={<BodyMetricsPage />} />
                        <Route path="/2nd-health-metrics" element={<SecondHealthMetricsPage />} />
                        <Route path="/data-metrics-report" element={<DataMetricsReport />} />
                        <Route path="/benchmark-data" element={<BenchmarkData />} />
                        <Route path="/generate-plan" element={<GenerateWorkoutPlan />} />
                        <Route path="/health-dashboard" element={<HealthDashboard />} />
                        <Route path="/health-trends" element={<SmartwatchTrends />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/admin/exercise-images" element={<ExercisePositionManager />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <NavBar />
                  </div>
                  <Toaster />
                  <Sonner />
                </WorkoutProvider>
              </ExerciseProvider>
            </SettingsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
