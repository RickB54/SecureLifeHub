import { MemoryRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import NavBar from "./NavBar"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"

import { ArrowLeft } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
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

export default function GdftShell({ setActivePage, theme }: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <ExerciseProvider>
            <WorkoutProvider>
              <MemoryRouter>
                <WorkoutReminderSystem />
                <ScrollToTop />
                <div className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl relative ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#111111] text-white border border-white/10'}`}>
                  
                  {/* Main GDFT App Container */}
                  <div className="flex flex-col h-full bg-[#111827] text-white">
                    <main className="flex-grow overflow-y-auto container mx-auto px-4 py-2 md:py-4 pb-20">
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
              </MemoryRouter>
            </WorkoutProvider>
          </ExerciseProvider>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
