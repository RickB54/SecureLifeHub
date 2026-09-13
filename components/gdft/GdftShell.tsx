import { MemoryRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import NavBar from "./NavBar"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"

import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Exercises from "./pages/Exercises"
import Workout from "./pages/Workout"
import Stats from "./pages/Stats"
import HealthDashboard from "./pages/HealthDashboard"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/gdft/components/ui/tooltip"
import { SettingsProvider } from "@/components/gdft/contexts/SettingsContext"
import { ExerciseProvider } from "@/components/gdft/contexts/ExerciseContext"
import { WorkoutProvider } from "@/components/gdft/contexts/WorkoutContext"
import { WorkoutReminderSystem } from "@/components/gdft/components/WorkoutReminderSystem"
import ScrollToTop from "@/components/gdft/components/layout/ScrollToTop"
import { Toaster } from "@/components/gdft/components/ui/toaster"
import { Toaster as Sonner } from "@/components/gdft/components/ui/sonner"
import { toast } from "sonner"
import ScrollToTopButton from "@/components/gdft/components/ui/ScrollToTopButton"

import CreateExercise from "./pages/CreateExercise"
import CreateWorkout from "./pages/CreateWorkout"
import Calendar from "./pages/Calendar"
import MyCalendar from "./pages/MyCalendar"
import CustomPlans from "./pages/CustomPlans"
import BodyMetricsPage from "./pages/BodyMetricsPage"
import SecondHealthMetricsPage from "./pages/2ndHealthMetrics"
import DataMetricsReport from "./pages/DataMetricsReport"
import BenchmarkData from "./pages/BenchmarkData"
import GenerateWorkoutPlan from "./pages/GenerateWorkoutPlan"
import SmartwatchTrends from "./pages/SmartwatchTrends"
import SettingsPage from "./pages/Settings"
import ExercisePositionManager from "./pages/ExercisePositionManager"

const queryClient = new QueryClient();

// Back navigation controller for Android hardware back button
function GdftBackInterceptor({ setActivePage }: { setActivePage?: (page: string) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathRef = useRef(location.pathname);
  const lastBackPressRef = useRef<number>(0);

  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    // Push dummy history entry when GDFT is active so popstate triggers on hardware back
    window.history.pushState({ gdft: true }, "");

    const handlePopState = () => {
      const currentPath = currentPathRef.current;
      
      if (currentPath !== "/") {
        // Sub-page: Navigate back 1 step within GDFT's MemoryRouter history
        navigate(-1);
        // Re-push history entry to intercept subsequent back press
        window.history.pushState({ gdft: true }, "");
      } else {
        // Home page (/): Double-press to exit GDFT to SLH
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          // Confirmed exit
          if (setActivePage) {
            setActivePage("dashboard");
          }
        } else {
          lastBackPressRef.current = now;
          toast("Press back again to exit GDFT", {
            id: "gdft-exit-toast",
            duration: 2000,
          });
          // Re-push history entry
          window.history.pushState({ gdft: true }, "");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, setActivePage]);

  return null;
}

export default function GdftShell({ setActivePage, theme }: any) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <ExerciseProvider>
            <WorkoutProvider>
              <MemoryRouter>
                <GdftBackInterceptor setActivePage={setActivePage} />
                <WorkoutReminderSystem />
                <ScrollToTop />
                <div className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl relative ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gym-darker text-white border border-white/10'}`}>
                  
                  {/* Main GDFT App Container */}
                  <div className="flex flex-col h-full bg-gym-darker text-white">
                    {/* Gdft Top Header Bar */}
                    <header className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gym-darker/95 backdrop-blur-md z-30 shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (setActivePage) setActivePage("dashboard");
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                          title="Exit GDFT to SecureLifeHub Dashboard"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>SLH Hub</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleFullscreen}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-medium"
                          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (hides Android nav bar)"}
                          aria-label="Toggle Fullscreen"
                        >
                          {isFullscreen ? (
                            <>
                              <Minimize2 className="h-4 w-4 text-gym-blue" />
                              <span className="hidden sm:inline">Exit Fullscreen</span>
                            </>
                          ) : (
                            <>
                              <Maximize2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Fullscreen</span>
                            </>
                          )}
                        </button>
                      </div>
                    </header>

                    <main id="gdft-main-scroll" className="flex-grow overflow-y-auto container mx-auto px-4 py-2 md:py-4 pb-20">
                      <Routes>
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
                    
                    <div className="mt-auto relative z-50">
                      <NavBar />
                    </div>
                  </div>
                </div>
                <Toaster />
                <Sonner />
                <ScrollToTopButton />
              </MemoryRouter>
            </WorkoutProvider>
          </ExerciseProvider>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
