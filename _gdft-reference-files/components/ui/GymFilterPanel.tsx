import React, { useState, useEffect } from "react";
import { MapPin, Layers, ChevronDown, ChevronRight, Settings2, X, Dumbbell } from "lucide-react";
import { api } from "@/lib/api";
import { Gym, GymSection, Exercise } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { useExercise } from "@/contexts/ExerciseContext";
import CustomGymBuilder from "./CustomGymBuilder";

interface GymFilterPanelProps {
  selectedGymId: string | null;
  selectedSectionId: string | null;
  onGymSelect: (gymId: string | null, sectionId: string | null) => void;
}

/**
 * Given a section name like "CF-A — Arms", extract the normalized prefix "CFA"
 * so we can match exercise names that start with "CFA …"
 */
function extractCFPrefix(sectionName: string): string | null {
  // Match "CF-A", "CF-B" … "CF-Z" or "CFA", "CFB" … in the section name
  const m = sectionName.toUpperCase().match(/CF-?([A-Z])/);
  return m ? `CF${m[1]}` : null;
}

/**
 * For a given section, return all exercises that belong to it.
 * Priority:
 *  1. Exercises already tagged with gymSectionId (post-migration)
 *  2. Exercises whose names start with the CF prefix (pre-migration preview)
 */
function getExercisesForSection(
  section: GymSection,
  gymId: string,
  allExercises: Exercise[]
): Exercise[] {
  // Post-migration: exercises properly tagged
  const tagged = allExercises.filter(
    ex => ex.gymId === gymId && ex.gymSectionId === section.id
  );
  if (tagged.length > 0) return tagged;

  // Pre-migration preview: match by name prefix (e.g. "CFA ")
  const prefix = extractCFPrefix(section.name);
  if (!prefix) return [];
  return allExercises.filter(ex =>
    ex.name.toUpperCase().startsWith(prefix)
  );
}

export const GymFilterPanel: React.FC<GymFilterPanelProps> = ({
  selectedGymId,
  selectedSectionId,
  onGymSelect,
}) => {
  const { user } = useAuth();
  const { exercises } = useExercise();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [expandedGymId, setExpandedGymId] = useState<string | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    if (user) loadGyms();
  }, [user]);

  useEffect(() => {
    if (selectedGymId) setExpandedGymId(selectedGymId);
  }, [selectedGymId]);

  const loadGyms = async () => {
    try {
      setLoading(true);
      const data = await api.gyms.list();
      // Deduplicate by name to match CustomGymBuilder logic
      const uniqueNames = Array.from(new Set(data.map((g: Gym) => g.name)));
      const unique = uniqueNames.map(name => data.find((g: Gym) => g.name === name)) as Gym[];
      setGyms(unique);
    } catch (e) {
      console.error("Failed to load gyms", e);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onGymSelect(null, null);
    setPanelOpen(false);
  };

  const isActive = !!selectedGymId;
  const activeGym = gyms.find(g => g.id === selectedGymId);
  const activeSection = activeGym?.sections?.find(s => s.id === selectedSectionId);

  if (!user) return null;

  return (
    <div className="mb-4">
      {/* ── Toggle row ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPanelOpen(p => !p)}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-sm font-bold transition-all ${
            isActive
              ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
              : "bg-gym-dark border-border text-gray-400 hover:text-white hover:bg-gym-card-hover"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">My Gym</span>
          {isActive && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
              {activeSection ? activeSection.name : activeGym?.name}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${panelOpen ? "rotate-180" : ""}`}
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

        <button
          onClick={() => setBuilderOpen(true)}
          className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20"
          title="Open Custom Gym Builder"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Manage Gyms</span>
        </button>
      </div>

      {/* ── Collapsible gym grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: panelOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.25s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div className="pt-3 pb-1">
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
                {gyms.map(gym => {
                  const isExpanded = expandedGymId === gym.id;
                  const isGymSelected = selectedGymId === gym.id && !selectedSectionId;

                  return (
                    <div
                      key={gym.id}
                      className="rounded-2xl overflow-hidden border border-white/8"
                      style={{ background: "rgba(255,255,255,0.025)" }}
                    >
                      {/* ── Gym header row ── */}
                      <div
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all ${
                          isGymSelected ? "bg-amber-500/10" : "hover:bg-white/5"
                        }`}
                        onClick={() => {
                          if (isGymSelected) {
                            onGymSelect(null, null);
                          } else {
                            onGymSelect(gym.id, null);
                          }
                          setExpandedGymId(isExpanded ? null : gym.id);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {gym.sections?.[0]?.photoUrl ? (
                            <img
                              src={gym.sections[0].photoUrl}
                              alt=""
                              className="h-8 w-8 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isGymSelected ? "bg-amber-500 text-white" : "bg-white/5 text-amber-400"
                              }`}
                            >
                              <MapPin className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className={`font-bold text-sm leading-tight ${isGymSelected ? "text-amber-400" : "text-white"}`}>
                              {gym.name}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                              {gym.type} · {gym.sections?.length || 0} zones
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isGymSelected && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                          <ChevronRight
                            className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? "rotate-90 text-amber-400" : ""}`}
                          />
                        </div>
                      </div>

                      {/* ── Sections (expanded) ── */}
                      {isExpanded && gym.sections && gym.sections.length > 0 && (
                        <div className="border-t border-white/5 divide-y divide-white/5">
                          {gym.sections.map((section: GymSection) => {
                            const isSectionSelected = selectedGymId === gym.id && selectedSectionId === section.id;
                            const sectionExercises = getExercisesForSection(section, gym.id, exercises);
                            const count = sectionExercises.length;
                            const isOpenPreview = expandedSectionId === section.id;

                            return (
                              <div key={section.id}>
                                {/* Section header */}
                                <div
                                  className={`flex items-center gap-3 px-5 py-2.5 transition-all ${
                                    isSectionSelected
                                      ? "bg-amber-500/15"
                                      : "hover:bg-white/5"
                                  }`}
                                >
                                  {/* Click left side to filter */}
                                  <button
                                    className="flex items-center gap-3 flex-1 text-left"
                                    onClick={() => {
                                      onGymSelect(
                                        isSectionSelected ? null : gym.id,
                                        isSectionSelected ? null : section.id
                                      );
                                      if (isSectionSelected) setPanelOpen(false);
                                    }}
                                  >
                                    {section.photoUrl ? (
                                      <img
                                        src={section.photoUrl}
                                        alt=""
                                        className="h-6 w-6 rounded object-cover shrink-0"
                                      />
                                    ) : (
                                      <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${
                                        isSectionSelected ? "bg-amber-500/30" : "bg-white/5"
                                      }`}>
                                        <Layers className={`h-3 w-3 ${isSectionSelected ? "text-amber-300" : "text-gray-500"}`} />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-sm font-semibold block truncate ${isSectionSelected ? "text-amber-300" : "text-gray-300"}`}>
                                        {section.name}
                                      </span>
                                      {section.description && (
                                        <span className="text-[10px] text-gray-600 truncate block">{section.description}</span>
                                      )}
                                    </div>
                                  </button>

                                  {/* Exercise count + expand toggle */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    {isSectionSelected && (
                                      <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                                        ✓
                                      </span>
                                    )}
                                    {count > 0 && (
                                      <button
                                        onClick={() => setExpandedSectionId(isOpenPreview ? null : section.id)}
                                        className={`flex items-center gap-1 text-[10px] font-bold rounded-lg px-2 py-0.5 transition-colors ${
                                          isOpenPreview
                                            ? "bg-amber-500/20 text-amber-400"
                                            : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                                        }`}
                                        title={isOpenPreview ? "Hide exercises" : "Preview exercises"}
                                      >
                                        <Dumbbell className="h-3 w-3" />
                                        {count}
                                        <ChevronDown className={`h-3 w-3 transition-transform ${isOpenPreview ? "rotate-180" : ""}`} />
                                      </button>
                                    )}
                                    {count === 0 && (
                                      <span className="text-[10px] text-gray-700">0 exercises</span>
                                    )}
                                  </div>
                                </div>

                                {/* Exercise preview list */}
                                {isOpenPreview && count > 0 && (
                                  <div className="bg-black/20 border-t border-white/5 px-5 py-2 space-y-1">
                                    {sectionExercises.map(ex => (
                                      <div key={ex.id} className="flex items-center gap-2 py-1">
                                        {ex.thumbnailUrl || ex.pictureUrl ? (
                                          <img
                                            src={ex.thumbnailUrl || ex.pictureUrl}
                                            alt=""
                                            className="h-7 w-7 rounded object-cover shrink-0 border border-white/10"
                                          />
                                        ) : (
                                          <div className="h-7 w-7 rounded bg-white/5 flex items-center justify-center shrink-0">
                                            <Dumbbell className="h-3.5 w-3.5 text-gray-600" />
                                          </div>
                                        )}
                                        <span className="text-xs text-gray-400 truncate">{ex.name}</span>
                                        <span className="ml-auto text-[10px] text-gray-700 shrink-0 capitalize">
                                          {Array.isArray(ex.muscleGroups) ? ex.muscleGroups[0] : ""}
                                        </span>
                                      </div>
                                    ))}
                                    <p className="text-[10px] text-amber-500/60 pt-1 italic">
                                      {sectionExercises.some(e => e.gymSectionId === section.id)
                                        ? "✓ Tagged to this zone"
                                        : "⚠ Preview — run 'Tag CF Exercises' in Settings to link these"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter pill */}
      {isActive && !panelOpen && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 rounded-full px-3 py-1">
            <MapPin className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-400">
              {activeSection ? `${activeGym?.name} › ${activeSection.name}` : activeGym?.name}
            </span>
            <button onClick={handleClear} className="ml-1 text-amber-500/70 hover:text-amber-300">
              <X className="h-3 w-3" />
            </button>
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
