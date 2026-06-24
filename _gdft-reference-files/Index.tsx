import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, ClipboardList, Plus, HelpCircle, LucideProps, Activity, Scale, Watch, Settings, Building2, LayoutDashboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import WorkoutCategoryCards from '@/components/WorkoutCategoryCards';
import HomeHelpPopup from '@/components/ui/HomeHelpPopup';
import SmartwatchSyncHelpPopup from '@/components/ui/SmartwatchSyncHelpPopup';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HealthMeterCircle } from '@/components/ui/HealthMeterCircle';
import { TimelinePopup } from '@/components/ui/TimelinePopup';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';

interface HomeCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  onClick: () => void;
  color: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'teal' | 'pink';
  className?: string;
}

const HomeCard = ({ icon: Icon, title, description, onClick, color, className }: HomeCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    orange: 'bg-orange-500/20 text-orange-400',
    teal: 'bg-teal-500/20 text-teal-400',
    pink: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <div
      className={`bg-gym-card p-4 rounded-lg flex items-center cursor-pointer transition-colors hover:bg-gym-dark-card h-full ${className}`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-lg mr-4 ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-md md:text-lg">{title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [isSmartwatchHelpOpen, setIsSmartwatchHelpOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'steps' | 'duration' | 'calories'>('steps');

  // Mock data for Health Meter
  const healthMeterData = {
    steps: 7458,
    duration: 45, // minutes
    calories: 320
  };

  // Generate timeline data
  const timelineData = [
    { time: '12am', steps: 120, duration: 5, calories: 15 },
    { time: '6am', steps: 1850, duration: 20, calories: 85 },
    { time: '12pm', steps: 3200, duration: 35, calories: 180 },
    { time: '6pm', steps: 5400, duration: 40, calories: 250 },
    { time: '11:59pm', steps: 7458, duration: 45, calories: 320 }
  ];

  const openTimeline = (metric: 'steps' | 'duration' | 'calories') => {
    setSelectedMetric(metric);
    setIsTimelineOpen(true);
  };



  const handleSmartwatchSettingsClick = () => {
    setIsSmartwatchHelpOpen(false);
    navigate('/settings');
    // Scroll to smartwatch sync section after navigation
    setTimeout(() => {
      const element = document.getElementById('smartwatch-sync-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="page-container page-transition pb-20">
      <HomeHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <SmartwatchSyncHelpPopup 
        isOpen={isSmartwatchHelpOpen} 
        onClose={() => setIsSmartwatchHelpOpen(false)}
        onGoToSettings={handleSmartwatchSettingsClick}
      />
      <TimelinePopup 
        isOpen={isTimelineOpen} 
        onClose={() => setIsTimelineOpen(false)}
        selectedMetric={selectedMetric}
        data={timelineData}
        onMetricChange={setSelectedMetric}
      />
      
      <div className="flex justify-between items-center mb-6 gap-2 overflow-x-hidden">
        <h1 className="text-xl font-bold truncate">GymDayFitTracker</h1>
        <div className="flex gap-1 items-center shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div onClick={() => navigate('/2nd-health-metrics')}>
                <HealthMeterCircle
                  steps={healthMeterData.steps}
                  duration={healthMeterData.duration}
                  calories={healthMeterData.calories}
                  size="small"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>View health metrics</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-blue-400 hover:text-blue-300"
                onClick={() => setIsSmartwatchHelpOpen(true)}
              >
                <Watch className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sync your smartwatch workouts automatically!</p>
            </TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5 text-gray-400 hover:text-white" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Smartwatch Sync Card */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Watch className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Smartwatch Sync</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSmartwatchHelpOpen(true)}
              className="border-blue-500/50 hover:bg-blue-500/10"
            >
              Learn More
            </Button>
          </div>
          <p className="text-sm text-gray-300 ml-11">Auto-sync from Google Fit & Samsung Health</p>
        </div>
      </div>
      
      {/* Dashboard Widgets */}
      <DashboardWidgets />
      <div className="mb-6" />

      <div className="space-y-4 mb-8">
        {/* Row 1: Monitor Progress & Health Dashboard */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <HomeCard
            icon={BarChart}
            title="Stats"
            description="Monitor progress"
            onClick={() => navigate('/stats')}
            color="blue"
          />
          <HomeCard
            icon={Activity}
            title="Watch"
            description="Health trends"
            onClick={() => navigate('/health-dashboard')}
            color="red"
          />
        </div>

        {/* Row 2: Custom Plans & Your Custom Plans */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <HomeCard
            icon={ClipboardList}
            title="Build"
            description="Custom plans"
            onClick={() => navigate('/custom-plans')}
            color="purple"
          />
          <HomeCard
            icon={ClipboardList}
            title="Saved"
            description="Your plans"
            onClick={() => navigate('/custom-plans?showPlans=true')}
            color="green"
          />
        </div>

        {/* Body Metrics & Health Metrics - Two per row */}
        <div className="grid grid-cols-2 gap-4">
          <HomeCard
            icon={Scale}
            title="Body Metrics"
            description="Track body measurements"
            onClick={() => navigate('/body-metrics')}
            color="orange"
            className="w-full"
          />
          <HomeCard
            icon={Activity}
            title="Health Metrics"
            description="Log your health data"
            onClick={() => navigate('/2nd-health-metrics')}
            color="red"
            className="w-full"
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Select Workout Type</h2>
      <WorkoutCategoryCards
        onSelect={(type) => navigate(`/create-workout?type=${type}`)}
        className="mb-6"
      />

      {/* ── Primary Action Shortcuts ── */}
      <div className="space-y-4 mt-8">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="w-full h-20 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-md hover:from-emerald-600/30 hover:to-teal-500/30 text-emerald-100 font-bold transition-all shadow-lg group p-2" 
            onClick={() => navigate('/create-workout?type=Custom')}
          >
            <div className="flex flex-col items-center justify-center gap-1">
               <div className="p-1.5 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4 text-emerald-400" />
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-xs uppercase tracking-wider font-extrabold">Manual Build</span>
                  <span className="text-[8px] text-emerald-400/70 font-bold uppercase tracking-widest text-center">Add Routine</span>
               </div>
            </div>
          </Button>

          <Button 
            className="w-full h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-500/20 border border-blue-500/30 backdrop-blur-md hover:from-blue-600/30 hover:to-indigo-500/30 text-blue-100 font-bold transition-all shadow-lg group p-2" 
            onClick={() => navigate('/custom-plans?builder=true')}
          >
            <div className="flex flex-col items-center justify-center gap-1">
               <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Building2 className="h-4 w-4 text-blue-400" />
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-xs uppercase tracking-wider font-extrabold">Gym Builder</span>
                  <span className="text-[8px] text-blue-400/70 font-bold uppercase tracking-widest text-center">Map Your Gym</span>
               </div>
            </div>
          </Button>
        </div>

        <Button 
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-500/20 border border-violet-500/30 backdrop-blur-md hover:from-violet-600/30 hover:to-purple-500/30 text-violet-100 font-bold transition-all shadow-lg group" 
          onClick={() => navigate('/workout')}
        >
          <div className="flex items-center justify-center gap-3">
             <div className="p-2 bg-violet-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <ClipboardList className="h-5 w-5 text-violet-400" />
             </div>
             <div className="flex flex-col items-start translate-y-[1px]">
                <span className="text-sm uppercase tracking-wider font-black">Workout Library</span>
                <span className="text-[10px] text-violet-400/70 font-bold uppercase tracking-widest">Show Saved Routines</span>
             </div>
          </div>
        </Button>

        <Button 
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-blue-500/20 border border-cyan-500/30 backdrop-blur-md hover:from-cyan-600/30 hover:to-blue-500/30 text-cyan-100 font-bold transition-all shadow-lg group" 
          onClick={() => navigate('/my-calendar?schedule=true')}
        >
          <div className="flex items-center justify-center gap-3">
             <div className="p-2 bg-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Watch className="h-5 w-5 text-cyan-400" />
             </div>
             <div className="flex flex-col items-start translate-y-[1px]">
                <span className="text-sm uppercase tracking-wider font-black">Training Schedule</span>
                <span className="text-[10px] text-cyan-400/70 font-bold uppercase tracking-widest">Manage Calendar Events</span>
             </div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Index;
