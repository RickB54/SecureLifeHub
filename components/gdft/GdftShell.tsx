import { MemoryRouter, Routes, Route } from "react-router-dom"
import NavBar from "./NavBar"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"

// Stub Components for the remaining 17 routes
const Login = () => <div className="p-4">Login (Stub)</div>
const Exercises = () => <div className="p-4">Exercises (Stub)</div>
const CreateExercise = () => <div className="p-4">Create Exercise (Stub)</div>
const CreateWorkout = () => <div className="p-4">Create Workout (Stub)</div>
const Workout = () => <div className="p-4">Workout (Stub)</div>
const Stats = () => <div className="p-4">Stats (Stub)</div>
const Calendar = () => <div className="p-4">Calendar (Stub)</div>
const MyCalendar = () => <div className="p-4">My Calendar (Stub)</div>
const CustomPlans = () => <div className="p-4">Custom Plans (Stub)</div>
const BodyMetricsPage = () => <div className="p-4">Body Metrics (Stub)</div>
const SecondHealthMetricsPage = () => <div className="p-4">2nd Health Metrics (Stub)</div>
const DataMetricsReport = () => <div className="p-4">Data Metrics Report (Stub)</div>
const BenchmarkData = () => <div className="p-4">Benchmark Data (Stub)</div>
const GenerateWorkoutPlan = () => <div className="p-4">Generate Workout Plan (Stub)</div>
const HealthDashboard = () => <div className="p-4">Health Dashboard (Stub)</div>
const SmartwatchTrends = () => <div className="p-4">Smartwatch Trends (Stub)</div>
const SettingsPage = () => <div className="p-4">Settings (Stub)</div>
const ExercisePositionManager = () => <div className="p-4">Exercise Position Manager (Admin Stub)</div>

export default function GdftShell({ setActivePage, theme }: any) {
  return (
    <MemoryRouter>
      <div className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl relative ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#111111] text-white border border-white/10'}`}>
        
        {/* 
          Exit mechanism back to SLH. 
          It sits top-right, out of the way of GDFT's UI.
        */}
        <button 
          onClick={() => setActivePage("dashboard")} 
          className="absolute top-2 right-2 z-50 flex items-center justify-center p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-white backdrop-blur-sm border border-white/10"
          title="Exit to SLH Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Main GDFT App Container mimicking its normal layout */}
        <div className="flex flex-col h-full bg-[#111827] text-white">
          
          {/* Content Area */}
          <main className="flex-grow overflow-y-auto container mx-auto px-4 py-2 md:py-4 pb-20">
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
          
          {/* Real NavBar */}
          <div className="mt-auto relative z-50">
            <NavBar />
          </div>
        </div>
      </div>
    </MemoryRouter>
  )
}
