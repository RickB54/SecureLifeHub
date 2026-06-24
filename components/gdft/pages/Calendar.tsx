
import React, { useState, useEffect } from "react";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, HelpCircle, CalendarCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkout } from "@/components/gdft/contexts/WorkoutContext";
import { getSavedWorkoutTemplates } from "@/components/gdft/lib/data";
import { Workout } from "@/components/gdft/lib/data";
import { EventType } from "@/components/gdft/lib/types";
import { Button } from "@/components/gdft/components/ui/button";
import CalendarHelpPopup from "@/components/gdft/components/ui/CalendarHelpPopup";

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<EventType[]>([]);
  const { workouts } = useWorkout();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Get days for current week
  const getWeekDays = () => {
    const days = [];
    // Start with 3 days before current date
    let startDay = subDays(currentDate, 3);

    // Create array of 7 days (current day in the middle)
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDay, i);
      days.push({
        date: day,
        dayOfMonth: format(day, "d"),
        dayOfWeek: format(day, "E"),
        isToday: isSameDay(day, new Date()),
        isSelected: isSameDay(day, selectedDate),
      });
    }
    return days;
  };

  useEffect(() => {
    // Transform workouts into calendar events
    const workoutEvents = workouts.map((workout: Workout) => ({
      id: workout.id,
      title: workout.name || "Workout",
      date: new Date(workout.startTime),
      type: "workout",
      completed: !!workout.endTime,
    }));

    // Get saved templates
    const templates = getSavedWorkoutTemplates();
    const templateEvents = templates.map((template) => ({
      id: template.id,
      title: template.name,
      date: new Date(template.createdAt),
      type: "template",
    }));

    setEvents([...workoutEvents, ...templateEvents]);
  }, [workouts]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handlePrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  // Filter events for selected date
  const selectedDateEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate)
  );

  const weekDays = getWeekDays();

  return (
    <div className="page-container page-transition">
      <CalendarHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      {/* ── Page Header & Hero ── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-44 md:h-52"
           style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/goal_bg_health.png)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
          filter: 'brightness(0.55)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(16,185,129,0.3) 0%, rgba(14,116,144,0.2) 50%, rgba(139,92,246,0.2) 100%)',
        }} />
        
        <div className="relative z-10 h-full flex flex-col justify-center px-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarCheck className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Workout Schedule</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white leading-tight uppercase italic">
                  Training Calendar
                </h1>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10" onClick={() => setIsHelpOpen(true)}>
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </Button>
          </div>

          <div className="flex items-center gap-6 mt-auto pb-4">
            <div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1.5 border border-white/10 shadow-xl self-start">
              <button
                onClick={handlePrevWeek}
                className="p-2 text-emerald-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 font-black text-sm md:text-base tracking-tight text-white min-w-[140px] text-center uppercase">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button
                onClick={handleNextWeek}
                className="p-2 text-emerald-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Week view */}
      <div className="flex justify-between my-4 overflow-x-auto">
        {weekDays.map((day) => (
          <div
            key={day.date.toString()}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer 
              ${day.isSelected ? "bg-primary text-white" : ""}
              ${
                day.isToday && !day.isSelected
                  ? "bg-gray-700 text-white"
                  : ""
              }
              ${
                !day.isToday && !day.isSelected
                  ? "hover:bg-gray-800 text-gray-300"
                  : ""
              }
            `}
            onClick={() => handleDateClick(day.date)}
          >
            <span className="text-xs">{day.dayOfWeek}</span>
            <span className="font-medium">{day.dayOfMonth}</span>
            {events.some(event => isSameDay(event.date, day.date)) && (
              <div className="w-1 h-1 bg-blue-400 rounded-full mt-1"></div>
            )}
          </div>
        ))}
      </div>

      {/* Selected date */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          {format(selectedDate, "EEEE, MMMM d")}
        </h2>

        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map((event) => (
              <div
                key={event.id}
                className={`card-glass p-4 rounded-md flex items-center justify-between
                  ${event.type === "workout" ? "border-l-4 border-primary" : "border-l-4 border-secondary"}
                  ${event.completed ? "opacity-70" : ""}
                `}
              >
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-400">
                    {event.type === "workout" ? "Workout" : "Workout Plan"}
                  </p>
                </div>
                <div className="text-sm">
                  {event.completed && (
                    <span className="text-green-400">Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No workouts scheduled for this day
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
