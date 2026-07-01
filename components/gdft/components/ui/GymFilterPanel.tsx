import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Layers, ChevronDown, ChevronRight, Settings2, X, Dumbbell, Check } from "lucide-react";
import { api } from "@/components/gdft/lib/api";
import { Gym, GymSection, Exercise } from "@/components/gdft/lib/data";
import { useAuth } from "@/components/auth-provider";
import { useExercise } from "@/components/gdft/contexts/ExerciseContext";
import CustomGymBuilder from "./CustomGymBuilder";

export interface GymFilterState {
  gymId: string | null;
  /** empty array = all sections of the gym; non-empty = only those sections */
  sectionIds: string[];
  sectionPrefixes?: string[];
}

interface GymFilterPanelProps {
  filterState: GymFilterState;
  onFilterChange: (state: GymFilterState) => void;
}

/**
 * Extract the CF prefix from a section name, e.g. "CF-A" → "CFA"
 */
function extractCFPrefix(sectionName: string): string | null {
  const m = sectionName.toUpperCase().match(/CF-?([A-Z])/);
  return m ? `CF${m[1]}` : null;
}

function getExercisesForSection(
  section: GymSection,
  gymId: string,
  allExercises: Exercise[]
): Exercise[] {
  const tagged = allExercises.filter(
    (ex) => ex.gymId === gymId && ex.gymSectionId === section.id
  );
  if (tagged.length > 0) return tagged;

  const prefix = extractCFPrefix(section.name);
  if (!prefix) return [];
  return allExercises.filter((ex) =>
    ex.name.toUpperCase().startsWith(prefix)
  );
}

function getTotalExercisesForGym(gym: Gym, allExercises: Exercise[]): number {
  const uniqueExerciseIds = new Set<string>();
  let equipmentCount = 0;
  
  // 1. Add all exercises explicitly mapped to this gym
  allExercises.forEach(ex => {
    if (ex.gymId === gym.id) uniqueExerciseIds.add(ex.id);
  });
  
  // 2. Add all exercises matching section prefixes (for legacy/bulk mapped)
  if (gym.sections) {
    gym.sections.forEach(section => {
      if (section.equipment) {
        equipmentCount += section.equipment.length;
      }
      const sectionExercises = getExercisesForSection(section, gym.id, allExercises);
      sectionExercises.forEach(ex => uniqueExerciseIds.add(ex.id));
    });
  }
  
  return Math.max(uniqueExerciseIds.size, equipmentCount);
}

export const GymFilterPanel: React.FC<GymFilterPanelProps> = ({
  filterState,
  onFilterChange,
}) => {
  const { user } = useAuth();
  const { exercises } = useExercise();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    if (user) loadGyms();
  }, [user]);

  const loadGyms = async () => {
    try {
      setLoading(true);
      const data = await api.gyms.list();
      const uniqueNames = Array.from(new Set(data.map((g: Gym) => g.name)));
      const unique = uniqueNames.map((name) =>
        data.find((g: Gym) => g.name === name)
      ) as Gym[];
      setGyms(unique);
    } catch (e) {
      console.error("Failed to load gyms", e);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onFilterChange({ gymId: null, sectionIds: [] });
    setPanelOpen(false);
  };

  const handleSelectGym = (gym: Gym) => {
    if (filterState.gymId === gym.id) {
      // Clicking the active gym clears it
      onFilterChange({ gymId: null, sectionIds: [], sectionPrefixes: [] });
    } else {
      const prefixes = gym.sections?.map(s => extractCFPrefix(s.name)).filter(Boolean) as string[] || [];
      onFilterChange({ gymId: gym.id, sectionIds: [], sectionPrefixes: prefixes });
    }
  };

  const handleToggleSection = (sectionId: string) => {
    if (!filterState.gymId) return;
    const current = filterState.sectionIds;
    const next = current.includes(sectionId)
      ? current.filter((id) => id !== sectionId)
      : [...current, sectionId];
      
    const gym = gyms.find(g => g.id === filterState.gymId);
    let prefixes: string[] = [];
    if (gym) {
       const activeSections = next.length > 0 ? gym.sections?.filter(s => next.includes(s.id)) : gym.sections;
       prefixes = activeSections?.map(s => extractCFPrefix(s.name)).filter(Boolean) as string[] || [];
    }
    
    onFilterChange({ gymId: filterState.gymId, sectionIds: next, sectionPrefixes: prefixes });
  };

  const isActive = !!filterState.gymId;
  const activeGym = gyms.find((g) => g.id === filterState.gymId);
  const activeSectionNames = activeGym?.sections
    ?.filter((s) => filterState.sectionIds.includes(s.id))
    .map((s) => s.name);

  // Summary label shown in the pill button
  const pillLabel =
    !isActive
      ? null
      : activeSectionNames && activeSectionNames.length > 0
      ? `${activeGym!.name} › ${activeSectionNames.join(", ")}`
      : activeGym?.name;

  if (!user) return null;

  return (
    <div className="mb-3">
      {/* ── Toggle row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setPanelOpen((p) => !p)}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-sm font-bold transition-all ${
            isActive
              ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
              : "bg-gym-dark border-border text-gray-400 hover:text-white hover:bg-gym-card-hover"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">My Gym</span>
          {isActive && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full text-amber-300">
              {pillLabel}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              panelOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isActive && (
          <button
            onClick={handleClear}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-gym-dark border border-border text-gray-500 hover:text-white hover:bg-gym-card-hover transition-colors"
            title="Clear gym filter"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Section quick-chips (shown when a gym is selected, panel closed) */}
        {isActive && !panelOpen && activeGym?.sections && activeGym.sections.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeGym.sections.map((section) => {
              const isOn = filterState.sectionIds.includes(section.id);
              return (
                <button
                  key={section.id}
                  onClick={() => handleToggleSection(section.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all ${
                    isOn
                      ? "bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/30"
                      : "bg-gym-dark border-border text-gray-400 hover:border-amber-500/50 hover:text-amber-300"
                  }`}
                >
                  {section.name}
                  {isOn && <Check className="inline h-3 w-3 ml-1" />}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setBuilderOpen(true)}
          className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20"
          title="Open Custom Gym Builder"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Manage Gyms</span>
        </button>
      </div>

      {/* ── Collapsible gym picker panel ── */}
      {panelOpen && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-gray-500 text-sm gap-2">
                <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                Loading gyms...
              </div>
            ) : gyms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <MapPin className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">No gyms set up yet.</p>
                <button
                  onClick={() => { setBuilderOpen(true); setPanelOpen(false); }}
                  className="text-sm font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Open Gym Builder →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {gyms.map((gym) => {
                  const isGymActive = filterState.gymId === gym.id;
                  return (
                    <div key={gym.id} className="rounded-xl overflow-hidden border border-white/8">
                      {/* Gym header */}
                      <div
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all ${
                          isGymActive ? "bg-amber-500/10" : "hover:bg-white/5"
                        }`}
                        onClick={() => handleSelectGym(gym)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isGymActive ? "bg-amber-500 text-white" : "bg-white/5 text-amber-400"
                            }`}
                          >
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isGymActive ? "text-amber-400" : "text-white"}`}>
                              {gym.name}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                              {gym.type} · {gym.sections?.length || 0} zones · {getTotalExercisesForGym(gym, exercises)} exercises
                            </p>
                          </div>
                        </div>
                        {isGymActive && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Section chips (shown when gym is selected) */}
                      {isGymActive && gym.sections && gym.sections.length > 0 && (
                        <div className="border-t border-white/5 px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">
                            Filter by Zone — tap to toggle
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {gym.sections.map((section) => {
                              const isOn = filterState.sectionIds.includes(section.id);
                              const sectionExercises = getExercisesForSection(section, gym.id, exercises);
                              return (
                                <button
                                  key={section.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSection(section.id);
                                  }}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all ${
                                    isOn
                                      ? "bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/30"
                                      : "bg-gym-darker border-border text-gray-400 hover:border-amber-500/50 hover:text-amber-300"
                                  }`}
                                >
                                  {isOn && <Check className="h-3 w-3" />}
                                  {section.name}
                                  {sectionExercises.length > 0 && (
                                    <span className={`ml-1 rounded-full px-1.5 py-px text-[9px] font-bold ${
                                      isOn ? "bg-black/20 text-black" : "bg-white/10 text-gray-500"
                                    }`}>
                                      {sectionExercises.length}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {filterState.sectionIds.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const prefixes = gym.sections?.map(s => extractCFPrefix(s.name)).filter(Boolean) as string[] || [];
                                onFilterChange({ gymId: filterState.gymId, sectionIds: [], sectionPrefixes: prefixes });
                              }}
                              className="mt-2 text-[10px] text-amber-500/60 hover:text-amber-300 underline underline-offset-2"
                            >
                              Show all zones
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => setBuilderOpen(true)}
                  className="w-full mt-2 py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Settings2 className="h-4 w-4" /> Add / Manage Gyms
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gym Builder Dialog */}
      <CustomGymBuilder
        isOpen={builderOpen}
        onClose={() => { setBuilderOpen(false); loadGyms(); }}
      />
    </div>
  );
};
