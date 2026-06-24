import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  RefreshCw,
  Heart,
  Scale,
  TrendingUp,
  ChevronRight,
  Watch,
  Bluetooth,
  Gauge,
  ArrowLeft
} from 'lucide-react';
import { useWorkout } from '@/components/gdft/contexts/WorkoutContext';
import { Button } from '@/components/gdft/components/ui/button';
import { toast } from 'sonner';

const HealthHub = () => {
  const navigate = useNavigate();
  const { syncSmartwatchWorkouts } = useWorkout();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncSmartwatchWorkouts();
      toast.success('Smartwatch data synced successfully!');
    } catch {
      toast.error('Sync failed. Make sure your watch is connected.');
    } finally {
      setIsSyncing(false);
    }
  };

  const shortcutCards = [
    {
      id: 'daily-vitals',
      title: 'Daily Vitals & Health Metrics',
      subtitle: 'Steps, sleep, heart rate, stress, blood pressure, glucose & more',
      icon: Gauge,
      gradient: 'from-blue-600/20 to-cyan-600/10',
      borderColor: 'border-blue-500/30',
      hoverBorder: 'hover:border-blue-400/60',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      accentColor: 'text-blue-400',
      badgeText: 'Manual Entry',
      badgeBg: 'bg-blue-500/10 text-blue-400',
      route: '/2nd-health-metrics'
    },
    {
      id: 'body-composition',
      title: 'Body Composition & Measurements',
      subtitle: 'Weight, body fat %, BMI calculator, chest, waist, arms & legs',
      icon: Scale,
      gradient: 'from-emerald-600/20 to-teal-600/10',
      borderColor: 'border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-400/60',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      accentColor: 'text-emerald-400',
      badgeText: 'BMI & Metrics',
      badgeBg: 'bg-emerald-500/10 text-emerald-400',
      route: '/body-metrics'
    },
    {
      id: 'health-metrics',
      title: 'Health Metrics',
      subtitle: 'Log blood pressure, glucose, SpO2, heart rate, stress, sleep & daily steps',
      icon: Activity,
      gradient: 'from-rose-600/20 to-pink-600/10',
      borderColor: 'border-rose-500/30',
      hoverBorder: 'hover:border-rose-400/60',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      accentColor: 'text-rose-400',
      badgeText: 'Vitals',
      badgeBg: 'bg-rose-500/10 text-rose-400',
      route: '/2nd-health-metrics'
    },
    {
      id: 'smart-trends',
      title: 'Smartwatch Health Trends',
      subtitle: 'Sleep patterns, heart rate trends, SpO2 & activity charts from Galaxy Watch',
      icon: TrendingUp,
      gradient: 'from-purple-600/20 to-violet-600/10',
      borderColor: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-400/60',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      accentColor: 'text-purple-400',
      badgeText: 'Smartwatch Only',
      badgeBg: 'bg-purple-500/10 text-purple-400',
      route: '/health-trends'
    }
  ];

  return (
    <div className="page-container page-transition pb-28">

      {/* ── Page Header & Hero ── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-56"
           style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/goal_bg_health.png)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
          filter: 'brightness(0.5)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(16,185,129,0.3) 0%, rgba(14,165,233,0.2) 50%, rgba(59,130,246,0.2) 100%)',
        }} />
        
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 rounded-full h-10 w-10 border border-white/10 mr-1 flex-shrink-0">
               <ArrowLeft className="h-6 w-6 text-white" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <Heart className="h-6 w-6 text-emerald-400 fill-emerald-400/20" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Smart Fitness Ecosystem</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Health Hub
                </h1>
              </div>
            </div>
          </div>
          <p className="text-gray-200 text-sm md:text-base max-w-lg leading-relaxed font-medium">
            Your high-performance command center. Monitor vitals, track body composition, and sync with your high-tech devices.
          </p>
        </div>
      </div>

      {/* ── Smartwatch Sync Card ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-700/60 bg-gradient-to-br from-gym-dark via-gym-dark to-gym-blue/5 p-5 mb-8 shadow-lg">
        {/* Decorative glow */}
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gym-blue/10 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gym-blue/20 border border-gym-blue/30">
            <Watch className="h-5 w-5 text-gym-blue" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Samsung Galaxy Watch</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Bluetooth className="h-3 w-3 text-gym-blue" />
              <span className="text-xs text-gym-blue font-medium">Health Connect Ready</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-5">
          Sync your Galaxy Watch to pull latest health data — steps, sleep, heart rate, blood oxygen, stress levels and calories into your dashboard.
        </p>

        <div className="flex gap-3">
          <Button
            id="sync-watch-btn"
            onClick={handleSync}
            disabled={isSyncing}
            className="flex-grow h-11 bg-gym-blue hover:bg-gym-blue/90 text-white font-bold rounded-xl shadow-lg shadow-gym-blue/20 transition-all duration-200"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Watch Now
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/settings')}
            className="h-11 px-4 border-gray-700 bg-gym-darker hover:bg-gym-dark text-gray-300 font-medium rounded-xl"
          >
            Settings
          </Button>
        </div>
      </div>

      {/* ── Shortcut Cards Section ──────────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Health Sections</span>
        </div>

        <div className="flex flex-col gap-4">
          {shortcutCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                id={`health-hub-${card.id}`}
                onClick={() => {
                  navigate(card.route);
                }}
                className={`
                  relative overflow-hidden w-full text-left rounded-2xl border
                  bg-gradient-to-br ${card.gradient}
                  ${card.borderColor} ${card.hoverBorder}
                  p-5 transition-all duration-200
                  hover:scale-[1.015] hover:shadow-xl active:scale-[0.98]
                  focus:outline-none focus:ring-2 focus:ring-gym-blue/40
                  group
                `}
              >
                {/* Subtle shine overlay on hover */}
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none" />

                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl ${card.iconBg} border border-white/10`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-white text-sm leading-snug">{card.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeBg} flex-shrink-0`}>
                        {card.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{card.subtitle}</p>
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0">
                    <ChevronRight className={`h-5 w-5 ${card.accentColor} opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer tip */}
      <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-gym-dark/60 border border-gray-800/60">
        <Activity className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-400">Tip:</strong> Use the smartwatch sync above to auto-populate your daily vitals. You can also log metrics manually via Daily Vitals, or enter body measurements via Body Composition.
        </p>
      </div>
    </div>
  );
};

export default HealthHub;
