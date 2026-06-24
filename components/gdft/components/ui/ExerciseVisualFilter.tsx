import React, { useState } from "react";
import { X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterGroup = "equipment" | "category" | "muscle";

interface SubItem {
  label: string;
  value: string;
  image: string;
  accent: string;        // e.g. "#3b82f6"
  glow: string;          // rgba glow
  emoji?: string;
}

interface GroupDef {
  id: FilterGroup;
  label: string;
  subtitle: string;
  heroGradient: string;
  accentColor: string;
  glowColor: string;
  heroImage: string;
  emoji: string;
  items: SubItem[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const GROUPS: GroupDef[] = [
  {
    id: "equipment",
    label: "Equipment",
    subtitle: "Filter by what you have",
    heroGradient: "linear-gradient(135deg, #1e3a5f 0%, #0f2d4a 100%)",
    accentColor: "#38bdf8",
    glowColor: "rgba(56,189,248,0.45)",
    heroImage: "/images/filters/equip_barbell.png",
    emoji: "🔧",
    items: [
      { label: "Barbell",         value: "Barbell",          image: "/images/filters/equip_barbell.png",     accent: "#3b82f6", glow: "rgba(59,130,246,0.5)",   emoji: "🏋️" },
      { label: "Dumbbells",       value: "Dumbbells",        image: "/images/filters/equip_dumbbell.png",    accent: "#06b6d4", glow: "rgba(6,182,212,0.5)",    emoji: "💪" },
      { label: "Machine",         value: "Machine",          image: "/images/filters/equip_machine.png",     accent: "#a855f7", glow: "rgba(168,85,247,0.5)",   emoji: "⚙️" },
      { label: "Bodyweight",      value: "Bodyweight",       image: "/images/filters/equip_bodyweight.png",  accent: "#22c55e", glow: "rgba(34,197,94,0.5)",    emoji: "🤸" },
      { label: "Kettlebells",     value: "Kettlebells",      image: "/images/filters/equip_kettlebell.png",  accent: "#f97316", glow: "rgba(249,115,22,0.5)",   emoji: "🫙" },
      { label: "Resistance Bands",value: "Resistance Bands", image: "/images/filters/equip_bands.png",       accent: "#ec4899", glow: "rgba(236,72,153,0.5)",   emoji: "🎽" },
      { label: "Cable",           value: "Cable",            image: "/images/filters/equip_cable.png",       accent: "#64748b", glow: "rgba(100,116,139,0.5)",  emoji: "🔗" },
      { label: "Treadmill",       value: "Treadmill",        image: "/images/filters/equip_treadmill.png",   accent: "#ef4444", glow: "rgba(239,68,68,0.5)",    emoji: "🏃" },
      { label: "Bike / Stationary Bike", value: "Stationary Bike", image: "/images/filters/equip_bike.png", accent: "#0ea5e9", glow: "rgba(14,165,233,0.5)",   emoji: "🚴" },
      { label: "Rower",           value: "Rower",            image: "/images/filters/equip_rower.png",       accent: "#f59e0b", glow: "rgba(245,158,11,0.5)",   emoji: "🚣" },
      { label: "Elliptical",      value: "Elliptical",       image: "/images/filters/equip_elliptical.png",  accent: "#8b5cf6", glow: "rgba(139,92,246,0.5)",   emoji: "🔄" },
      { label: "Stair Climber",   value: "Stair Climber",    image: "/images/filters/equip_stairclimber.png",accent: "#eab308", glow: "rgba(234,179,8,0.5)",    emoji: "🪜" },
      { label: "Slide Board",     value: "Slide Board",      image: "/images/cat_slideboard.png",            accent: "#d946ef", glow: "rgba(217,70,239,0.5)",   emoji: "🛹" },
      { label: "No Equipment",    value: "None",             image: "/images/filters/cat_noequip.png",       accent: "#10b981", glow: "rgba(16,185,129,0.5)",   emoji: "✅" },
    ],
  },
  {
    id: "category",
    label: "Category",
    subtitle: "Filter by workout type",
    heroGradient: "linear-gradient(135deg, #1a1f3c 0%, #0d1226 100%)",
    accentColor: "#818cf8",
    glowColor: "rgba(129,140,248,0.45)",
    heroImage: "/images/filters/cat_weights.png",
    emoji: "📂",
    items: [
      { label: "Weights",       value: "Weights",       image: "/images/filters/cat_weights.png",    accent: "#3b82f6", glow: "rgba(59,130,246,0.5)",  emoji: "🏋️" },
      { label: "Cardio",        value: "Cardio",        image: "/images/filters/cat_cardio.png",     accent: "#ef4444", glow: "rgba(239,68,68,0.5)",   emoji: "🏃" },
      { label: "Slide Board",   value: "Slide Board",   image: "/images/filters/cat_slideboard.png", accent: "#a855f7", glow: "rgba(168,85,247,0.5)",  emoji: "🛹" },
      { label: "No Equipment",  value: "No Equipment",  image: "/images/filters/cat_noequip.png",    accent: "#22c55e", glow: "rgba(34,197,94,0.5)",   emoji: "🤸" },
    ],
  },
  {
    id: "muscle",
    label: "Muscle Group",
    subtitle: "Filter by target muscle",
    heroGradient: "linear-gradient(135deg, #1f1a3c 0%, #110d26 100%)",
    accentColor: "#f472b6",
    glowColor: "rgba(244,114,182,0.45)",
    heroImage: "/images/filters/muscle_chest.png",
    emoji: "💪",
    items: [
      { label: "Chest",          value: "Chest",          image: "/images/filters/muscle_chest.png",     accent: "#3b82f6",  glow: "rgba(59,130,246,0.5)",  emoji: "💙" },
      { label: "Back",           value: "Back",           image: "/images/filters/muscle_back.png",      accent: "#06b6d4",  glow: "rgba(6,182,212,0.5)",   emoji: "🔵" },
      { label: "Shoulders",      value: "Shoulders",      image: "/images/filters/muscle_shoulders.png", accent: "#a855f7",  glow: "rgba(168,85,247,0.5)",  emoji: "💜" },
      { label: "Biceps",         value: "Biceps",         image: "/images/filters/muscle_biceps.png",    accent: "#0ea5e9",  glow: "rgba(14,165,233,0.5)",  emoji: "💪" },
      { label: "Triceps",        value: "Triceps",        image: "/images/filters/muscle_triceps.png",   accent: "#f97316",  glow: "rgba(249,115,22,0.5)",  emoji: "🦾" },
      { label: "Legs / Quads",   value: "Quadriceps",     image: "/images/filters/muscle_legs.png",      accent: "#eab308",  glow: "rgba(234,179,8,0.5)",   emoji: "🦵" },
      { label: "Glutes",         value: "Glutes",         image: "/images/filters/muscle_glutes.png",    accent: "#ec4899",  glow: "rgba(236,72,153,0.5)",  emoji: "🍑" },
      { label: "Abs / Core",     value: "Abs",            image: "/images/filters/muscle_abs.png",       accent: "#22c55e",  glow: "rgba(34,197,94,0.5)",   emoji: "⚡" },
      { label: "Cardiovascular", value: "Cardiovascular", image: "/images/filters/muscle_cardio.png",    accent: "#ef4444",  glow: "rgba(239,68,68,0.5)",   emoji: "❤️" },
      { label: "Full Body",      value: "Full Body",      image: "/images/filters/muscle_fullbody.png",  accent: "#f59e0b",  glow: "rgba(245,158,11,0.5)",  emoji: "🌟" },
      { label: "Lats",           value: "Lats",           image: "/images/filters/muscle_back.png",      accent: "#38bdf8",  glow: "rgba(56,189,248,0.5)",  emoji: "🔷" },
      { label: "Hamstrings",     value: "Hamstrings",     image: "/images/filters/muscle_legs.png",      accent: "#84cc16",  glow: "rgba(132,204,22,0.5)",  emoji: "🟢" },
      { label: "Calves",         value: "Calves",         image: "/images/filters/muscle_legs.png",      accent: "#14b8a6",  glow: "rgba(20,184,166,0.5)",  emoji: "🦶" },
      { label: "Traps",          value: "Traps",          image: "/images/filters/muscle_shoulders.png", accent: "#8b5cf6",  glow: "rgba(139,92,246,0.5)",  emoji: "🔺" },
      { label: "Forearms",       value: "Forearms",       image: "/images/filters/muscle_biceps.png",    accent: "#d97706",  glow: "rgba(217,119,6,0.5)",   emoji: "💪" },
      { label: "Obliques",       value: "Obliques",       image: "/images/filters/muscle_abs.png",       accent: "#10b981",  glow: "rgba(16,185,129,0.5)",  emoji: "↔️" },
    ],
  },
];

// ─── Sub-item Card ────────────────────────────────────────────────────────────

const SubCard: React.FC<{
  item: SubItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 focus:outline-none"
    style={{
      border: `2px solid ${isActive ? item.accent : "rgba(255,255,255,0.08)"}`,
      boxShadow: isActive ? `0 0 22px 4px ${item.glow}, 0 4px 20px rgba(0,0,0,0.5)` : "0 4px 12px rgba(0,0,0,0.4)",
      transform: isActive ? "scale(1.04)" : "scale(1)",
      minHeight: 130,
    }}
  >
    {/* Background image */}
    <div
      style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${item.image})`,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: isActive ? 0.55 : 0.38,
        transition: "opacity 0.2s",
      }}
    />
    {/* Dark overlay */}
    <div
      style={{
        position: "absolute", inset: 0,
        background: isActive
          ? `linear-gradient(180deg, ${item.accent}22 0%, rgba(0,0,0,0.65) 100%)`
          : "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)",
        transition: "background 0.2s",
      }}
      className="group-hover:bg-white/5"
    />
    {/* Active badge */}
    {isActive && (
      <div
        className="absolute top-2 right-2 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
        style={{ background: item.accent, color: "#000" }}
      >
        Active
      </div>
    )}
    {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-end h-full p-3 pb-4" style={{ minHeight: 130 }}>
      <div className="absolute top-2 left-2">
        <span className="text-lg drop-shadow">{item.emoji}</span>
      </div>
      <span
        className="text-xs font-black uppercase tracking-wider text-center leading-tight drop-shadow-lg"
        style={{ color: isActive ? item.accent : "rgba(255,255,255,0.88)", textShadow: isActive ? `0 0 10px ${item.glow}` : "0 1px 4px rgba(0,0,0,0.8)" }}
      >
        {item.label}
      </span>
    </div>
  </button>
);

// ─── Gateway Card (top-level 3 boxes) ────────────────────────────────────────

const GatewayCard: React.FC<{
  group: GroupDef;
  isActive: boolean;
  onClick: () => void;
}> = ({ group, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 focus:outline-none flex-1"
    style={{
      border: `2px solid ${isActive ? group.accentColor : "rgba(255,255,255,0.10)"}`,
      boxShadow: isActive ? `0 0 24px 4px ${group.glowColor}` : "0 4px 14px rgba(0,0,0,0.35)",
      minHeight: 110,
      background: group.heroGradient,
    }}
  >
    {/* Hero image */}
    <div
      style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${group.heroImage})`,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.35,
        transition: "opacity 0.2s",
      }}
      className="group-hover:opacity-50"
    />
    {/* Gradient overlay */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 100%)" }} />
    
    {/* Absolute Icon - Top Left */}
    <div className="absolute top-2.5 left-2.5 z-20">
      <span className="text-xl drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">{group.emoji}</span>
    </div>

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-center h-full pt-10 pb-5 px-3" style={{ minHeight: 110 }}>
      <span
        className="text-sm font-black uppercase tracking-widest drop-shadow"
        style={{ color: isActive ? group.accentColor : "white", textShadow: isActive ? `0 0 14px ${group.glowColor}` : "0 1px 6px rgba(0,0,0,0.8)" }}
      >
        {group.label}
      </span>
      <span className="text-[10px] text-white/50 mt-1 tracking-wider">{group.subtitle}</span>
    </div>
  </button>
);

// ─── Main Popup ───────────────────────────────────────────────────────────────

interface ExerciseVisualFilterProps {
  equipmentFilter: string;
  categoryFilter: string;
  muscleGroupFilter: string;
  onEquipmentChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onMuscleGroupChange: (v: string) => void;
}

export const ExerciseVisualFilter: React.FC<ExerciseVisualFilterProps> = ({
  equipmentFilter,
  categoryFilter,
  muscleGroupFilter,
  onEquipmentChange,
  onCategoryChange,
  onMuscleGroupChange,
}) => {
  const [activeGroup, setActiveGroup] = useState<FilterGroup | null>(null);

  const handleGatewayClick = (groupId: FilterGroup) => {
    setActiveGroup(prev => (prev === groupId ? null : groupId));
  };

  const closePopup = () => setActiveGroup(null);

  const handleSubItemClick = (groupId: FilterGroup, value: string) => {
    // Toggle off if already selected, otherwise apply
    if (groupId === "equipment") {
      onEquipmentChange(equipmentFilter === value ? "All" : value);
    } else if (groupId === "category") {
      onCategoryChange(categoryFilter === value ? "All" : value);
    } else {
      onMuscleGroupChange(muscleGroupFilter === value ? "All" : value);
    }
    closePopup();
  };

  const activeGroup_ = GROUPS.find(g => g.id === activeGroup);

  const getActiveValue = (groupId: FilterGroup) => {
    if (groupId === "equipment") return equipmentFilter;
    if (groupId === "category") return categoryFilter;
    return muscleGroupFilter;
  };

  const hasActiveFilter = (groupId: FilterGroup) => getActiveValue(groupId) !== "All";

  return (
    <div className="mb-5">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-0.5 w-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Visual Filters</span>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full" />
        {(hasActiveFilter("equipment") || hasActiveFilter("category") || hasActiveFilter("muscle")) && (
          <button
            onClick={() => { onEquipmentChange("All"); onCategoryChange("All"); onMuscleGroupChange("All"); }}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-500/30 rounded-full px-2 py-0.5 hover:border-red-400/60 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 3 gateway cards */}
      <div className="flex gap-3">
        {GROUPS.map(group => (
          <GatewayCard
            key={group.id}
            group={group}
            isActive={activeGroup === group.id || hasActiveFilter(group.id)}
            onClick={() => handleGatewayClick(group.id)}
          />
        ))}
      </div>

      {/* Active filter pills */}
      {(hasActiveFilter("equipment") || hasActiveFilter("category") || hasActiveFilter("muscle")) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {hasActiveFilter("equipment") && (
            <div className="flex items-center gap-1 bg-sky-500/15 border border-sky-500/30 rounded-full px-3 py-1">
              <span className="text-[11px] font-bold text-sky-400">🔧 {equipmentFilter}</span>
              <button onClick={() => onEquipmentChange("All")} className="ml-1 text-sky-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {hasActiveFilter("category") && (
            <div className="flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-3 py-1">
              <span className="text-[11px] font-bold text-indigo-400">📂 {categoryFilter}</span>
              <button onClick={() => onCategoryChange("All")} className="ml-1 text-indigo-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {hasActiveFilter("muscle") && (
            <div className="flex items-center gap-1 bg-pink-500/15 border border-pink-500/30 rounded-full px-3 py-1">
              <span className="text-[11px] font-bold text-pink-400">💪 {muscleGroupFilter}</span>
              <button onClick={() => onMuscleGroupChange("All")} className="ml-1 text-pink-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Popup Modal ── */}
      {activeGroup && activeGroup_ && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
            onClick={closePopup}
            style={{ animation: "fadeIn 0.15s ease" }}
          />

          {/* Panel — centered dialog */}
          <div
            className="fixed inset-x-4 z-50 rounded-3xl overflow-hidden flex flex-col mx-auto"
            style={{
              background: "linear-gradient(180deg, #0f172a 0%, #080d1a 100%)",
              border: `1px solid ${activeGroup_.accentColor}33`,
              boxShadow: `0 8px 60px ${activeGroup_.glowColor}, 0 0 0 1px ${activeGroup_.accentColor}22`,
              top: "50%",
              transform: "translateY(-50%)",
              maxWidth: 680,
              maxHeight: "82vh",
              animation: "popIn 0.22s cubic-bezier(.22,1,.36,1)",
            }}
          >
            {/* Hero header */}
            <div className="relative overflow-hidden shrink-0" style={{ minHeight: 90 }}>
              <div
                style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${activeGroup_.heroImage})`,
                  backgroundSize: "cover", backgroundPosition: "center 30%",
                  opacity: 0.3,
                  filter: "blur(2px)",
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: activeGroup_.heroGradient, opacity: 0.85 }} />
              <div className="relative z-10 flex items-center justify-between px-6 py-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: activeGroup_.accentColor }}>
                    Select a filter
                  </p>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {activeGroup_.emoji} {activeGroup_.label}
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">{activeGroup_.subtitle}</p>
                </div>
                <button
                  onClick={closePopup}
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>
            </div>

            {/* Grid of sub-items */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {/* "All" reset option first */}
                <button
                  onClick={() => { handleSubItemClick(activeGroup, "All"); }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 focus:outline-none"
                  style={{
                    border: `2px solid ${getActiveValue(activeGroup) === "All" ? activeGroup_.accentColor : "rgba(255,255,255,0.08)"}`,
                    boxShadow: getActiveValue(activeGroup) === "All" ? `0 0 20px 3px ${activeGroup_.glowColor}` : "0 3px 10px rgba(0,0,0,0.4)",
                    minHeight: 130,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="relative z-10 flex flex-col items-center justify-center h-full py-5 px-3" style={{ minHeight: 130 }}>
                    <span className="text-3xl mb-2">🔄</span>
                    <span className="text-xs font-black uppercase tracking-wider text-center" style={{ color: getActiveValue(activeGroup) === "All" ? activeGroup_.accentColor : "rgba(255,255,255,0.65)" }}>
                      All
                    </span>
                  </div>
                </button>

                {activeGroup_.items.map(item => (
                  <SubCard
                    key={item.value}
                    item={item}
                    isActive={getActiveValue(activeGroup) === item.value}
                    onClick={() => handleSubItemClick(activeGroup, item.value)}
                  />
                ))}
              </div>
            </div>

            {/* Bottom safe area */}
            <div className="shrink-0 h-4 sm:h-6" />
          </div>

          <style>{`
            @keyframes popIn {
              from { opacity: 0; transform: translateY(calc(-50% + 24px)) scale(0.96); }
              to   { opacity: 1; transform: translateY(-50%)             scale(1);    }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>
        </>
      )}
    </div>
  );
};
