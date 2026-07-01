
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, BarChart3, Trash, Heart, ListOrdered, Play, Edit, HelpCircle, Printer, FileText, ArrowLeft, RefreshCw } from "lucide-react";
import ExerciseCard from "@/components/gdft/components/ui/ExerciseCard";
import ExerciseFilters from "@/components/gdft/components/ui/ExerciseFilters";
import { useExercise } from "@/components/gdft/contexts/ExerciseContext";
import { useWorkout } from "@/components/gdft/contexts/WorkoutContext";
import { Exercise, RelaxedMuscleGroup, RelaxedExerciseCategory } from "@/components/gdft/lib/data";
import { ReorderFavoritesDialog } from "@/components/gdft/components/ReorderFavoritesDialog";
import { Button } from "@/components/gdft/components/ui/button";
import ExercisesHelpPopup from "@/components/gdft/components/ui/ExercisesHelpPopup";
import { ExerciseProgressModal } from "@/components/gdft/components/ui/ExerciseProgressModal";
import { ExerciseVisualFilter } from "@/components/gdft/components/ui/ExerciseVisualFilter";
import { GymFilterPanel } from "@/components/gdft/components/ui/GymFilterPanel";
import { AnimatedExerciseIcon } from '@/components/gdft/components/ui/AnimatedExerciseIcon';
import { toast } from "sonner";

const FILTER_STORAGE_KEY = "exerciseFilters";

const Exercises = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const addToWorkout = searchParams.get("addToWorkout") === "true";
  const { exercises, filterExercises, deleteExercise, favoriteExercises, toggleFavorite, reinstallAllExercises } = useExercise();
  const { startWorkout, currentWorkout, addExerciseToCurrentWorkout } = useWorkout();
  
  // Load saved filters from localStorage or use defaults
  const loadSavedFilters = () => {
    try {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading saved filters:", error);
    }
    return {
      searchQuery: "",
      equipmentFilter: "All",
      categoryFilter: "All",
      muscleGroupFilter: "All"
    };
  };

  const savedFilters = loadSavedFilters();
  
  const [searchQuery, setSearchQuery] = useState(savedFilters.searchQuery);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState<string>(savedFilters.equipmentFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>(savedFilters.categoryFilter);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>(savedFilters.muscleGroupFilter);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [viewProgressExercise, setViewProgressExercise] = useState<Exercise | null>(null);
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [selectedGymSectionId, setSelectedGymSectionId] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const categories: ("All" | "Favorites" | RelaxedExerciseCategory)[] = ["All", "Favorites", "Weights", "Cardio", "Slide Board", "No Equipment"];
  
  useEffect(() => {
    const filtersToSave = {
      searchQuery,
      equipmentFilter,
      categoryFilter,
      muscleGroupFilter
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filtersToSave));
  }, [searchQuery, equipmentFilter, categoryFilter, muscleGroupFilter]);
  
  useEffect(() => {
    try {
      let exercisesToShow = exercises;

      if (categoryFilter === "Favorites") {
        exercisesToShow = exercises.filter(ex => favoriteExercises.includes(ex.id));
      }
      
      const filtered = filterExercises(
        equipmentFilter === "All" ? undefined : equipmentFilter,
        categoryFilter === "All" || categoryFilter === "Favorites" ? undefined : categoryFilter,
        muscleGroupFilter === "All" ? undefined : muscleGroupFilter,
        searchQuery
      ).filter(ex => {
        // Must be in the exercisesToShow set
        if (!exercisesToShow.some(e => e.id === ex.id)) return false;
        // Gym section filter:
        // Always keep already-selected exercises visible so switching zones
        // doesn't erase the user's picks from a previous zone.
        if (selectedGymId) {
          const isAlreadySelected = selectedExerciseIds.includes(ex.id);
          if (isAlreadySelected) return true;           // ← keep it visible
          if (ex.gymId !== selectedGymId) return false;
          if (selectedGymSectionId && ex.gymSectionId !== selectedGymSectionId) return false;
        }
        return true;
      });

      const categoryOrder: Record<string, number> = {
        "Weights": 1,
        "Cardio": 2,
        "Slide Board": 3,
        "No Equipment": 4,
        "Custom": 5
      };

      const sorted = (filtered || []).sort((a, b) => {
        // First sort by category rank (case-insensitive and trimmed)
        const catAName = (a.category || "").trim();
        const catBName = (b.category || "").trim();
        
        // Find best match in categoryOrder
        const getRank = (name: string) => {
          const entry = Object.entries(categoryOrder).find(([key]) => key.toLowerCase() === name.toLowerCase());
          return entry ? entry[1] : 99;
        };

        const catA = getRank(catAName);
        const catB = getRank(catBName);
        
        if (catA !== catB) {
          return catA - catB;
        }
        
        // If same category, sort by name
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });
      
      setFilteredExercises(sorted);
      
      const counts: Record<string, number> = {};
      categories.forEach(category => {
        if (category === "All") {
          counts[category] = exercises.length;
        } else if (category === "Favorites") {
          counts[category] = favoriteExercises.length;
        } else {
          counts[category] = exercises.filter(ex => ex.category === category).length;
        }
      });
      setCategoryCounts(counts);
      setTotalExercises(exercises.length);
    } catch (error) {
      console.error("Error filtering exercises:", error);
      setFilteredExercises([]);
    }
  }, [exercises, equipmentFilter, categoryFilter, muscleGroupFilter, searchQuery, filterExercises, favoriteExercises, selectedGymId, selectedGymSectionId, selectedExerciseIds]);

  const handleStartExercise = (exerciseId: string) => {
    if (addToWorkout && currentWorkout) {
      // Use the new method to properly add exercise to current workout
      addExerciseToCurrentWorkout(exerciseId);
      // Navigate back to workout page - the navigation will be handled in the workout context
      navigate('/workout');
    } else {
      startWorkout("Custom", [exerciseId]);
      navigate("/workout");
    }
  };

  const handleDeleteExercise = async (id: string) => {
    const deleted = await deleteExercise(id);
    if (deleted) {
      // Exercise was successfully deleted
    }
  };

  const handleCategoryClick = (category: string) => {
    if (category === "All") {
      setSearchQuery("");
      setEquipmentFilter("All");
      setMuscleGroupFilter("All");
    }
    setCategoryFilter(category);
  };

  return (
    <div className="page-container page-transition">
      <ReorderFavoritesDialog open={showReorderDialog} onOpenChange={setShowReorderDialog} />
      <ExercisesHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/5">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
          <h1 className="page-heading mb-0">Exercises</h1>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Button 
            variant={selectionMode ? "secondary" : "outline"}
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedExerciseIds([]);
            }}
            className="flex items-center px-3"
          >
            <ListOrdered className="h-5 w-5 md:mr-1" />
            <span className="hidden md:inline">{selectionMode ? "Cancel Select" : "Select"}</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/benchmark-data")}
            className="flex items-center px-3"
          >
            <BarChart3 className="h-5 w-5 md:mr-1" />
            <span className="hidden md:inline">Benchmarks</span>
          </Button>
          <Button 
            onClick={() => navigate("/create-exercise")}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-3"
          >
            <Plus className="h-5 w-5 md:mr-1" />
            <span className="hidden md:inline">New Exercise</span>
          </Button>
          <Button
            variant="outline"
            onClick={reinstallAllExercises}
            className="flex items-center px-3 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            title="Sync any missing default exercises to your library"
          >
            <RefreshCw className="h-5 w-5 md:mr-1" />
            <span className="hidden md:inline">Sync Library</span>
          </Button>
          
          <div className="flex items-center border-l border-gray-800 ml-1 pl-1 space-x-1">
            <Button 
                variant="ghost" 
                size="icon" 
                title="Print Exercise List"
                onClick={() => window.print()}
                className="text-gray-400 hover:text-white"
            >
                <Printer className="h-5 w-5" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                title="Save as PDF"
                onClick={async () => {
                  try {
                    setIsGeneratingPDF(true);
                    
                    // Small delay to let the UI show the loading state
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const element = document.querySelector('.print-section') as HTMLElement;
                    if (!element) {
                      setIsGeneratingPDF(false);
                      return;
                    }

                    element.classList.remove('hidden');
                    const opt = {
                      margin: 0,
                      filename: 'GymDay_Exercise_Catalog.pdf',
                      image: { type: 'jpeg' as const, quality: 0.98 },
                      html2canvas: { scale: 2, useCORS: true, logging: false },
                      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
                    };
                    
                    // Dynamically import to avoid SSR issues
                    const html2pdfModule = (await import('html2pdf.js')).default;
                    await html2pdfModule().set(opt).from(element).save();
                    
                    element.classList.add('hidden');
                    toast.success("PDF Library Created!");
                  } catch (error) {
                    console.error("PDF Error:", error);
                    toast.error("Failed to generate PDF. Try again later.");
                  } finally {
                    setIsGeneratingPDF(false);
                  }
                }}
                className="text-gray-400 hover:text-white"
            >
                <FileText className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)} className="text-gray-400 hover:text-white">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* ── PDF Generation Overlay ── */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-b-2 border-t-2 border-gym-blue animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gym-blue animate-pulse" />
            </div>
          </div>
          <div className="mt-8 text-center px-6">
            <h3 className="text-xl font-black italic tracking-tighter text-white uppercase animate-pulse">Building PDF Catalog</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium max-w-[250px] leading-relaxed">
              Synthesizing exercise data and generating visual previews. <br/>
              <span className="text-gym-blue opacity-80 uppercase tracking-widest text-[10px] block mt-1">Please do not close the app</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Exercise Summary ── */}
      <div className="rounded-xl border border-white/10 p-4 mb-6 overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold tracking-wide text-white">Exercise Summary</h2>
          </div>
          <div className="flex items-center space-x-2">
            {categoryFilter === 'Favorites' && favoriteExercises.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowReorderDialog(true)}>
                <ListOrdered className="h-4 w-4 mr-2" />
                Reorder
              </Button>
            )}
            <div
              className="text-sm text-gray-400 cursor-pointer hover:text-cyan-400 transition-colors font-medium"
              onClick={() => handleCategoryClick("All")}
            >
              Total Exercises: {totalExercises}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {categories.map((category) => {
            const isActive = category === categoryFilter;

            const categoryMeta: Record<string, {
              gradient: string;
              glow: string;
              border: string;
              activeBorder: string;
              icon: string;
              iconSvg?: React.ReactNode;
              bgImage: string;
              countColor: string;
            }> = {
              'All': {
                gradient: 'linear-gradient(135deg, rgba(6,182,212,0.20) 0%, rgba(14,116,144,0.15) 100%)',
                glow: 'rgba(6,182,212,0.5)',
                border: 'rgba(6,182,212,0.25)',
                activeBorder: '#06b6d4',
                icon: '🏋️',
                bgImage: '/images/exercise_bg_all.png',
                countColor: '#67e8f9',
              },
              'Favorites': {
                gradient: 'linear-gradient(135deg, rgba(234,179,8,0.20) 0%, rgba(161,98,7,0.15) 100%)',
                glow: 'rgba(234,179,8,0.5)',
                border: 'rgba(234,179,8,0.25)',
                activeBorder: '#eab308',
                icon: '⭐',
                bgImage: '/images/exercise_bg_favorites.png',
                countColor: '#fde047',
              },
              'Weights': {
                gradient: 'linear-gradient(135deg, rgba(59,130,246,0.20) 0%, rgba(29,78,216,0.15) 100%)',
                glow: 'rgba(59,130,246,0.5)',
                border: 'rgba(59,130,246,0.25)',
                activeBorder: '#3b82f6',
                icon: '🏋️',
                bgImage: '/images/exercise_bg_weights.png',
                countColor: '#93c5fd',
              },
              'Cardio': {
                gradient: 'linear-gradient(135deg, rgba(239,68,68,0.20) 0%, rgba(153,27,27,0.15) 100%)',
                glow: 'rgba(239,68,68,0.5)',
                border: 'rgba(239,68,68,0.25)',
                activeBorder: '#ef4444',
                icon: '🏃',
                bgImage: '/images/exercise_bg_cardio.png',
                countColor: '#fca5a5',
              },
              'Slide Board': {
                gradient: 'linear-gradient(135deg, rgba(168,85,247,0.20) 0%, rgba(109,40,217,0.15) 100%)',
                glow: 'rgba(168,85,247,0.5)',
                border: 'rgba(168,85,247,0.25)',
                activeBorder: '#a855f7',
                icon: '',
                iconSvg: (
                  <svg viewBox="0 0 64 40" width="28" height="18" fill="white" xmlns="http://www.w3.org/2000/svg" style={{filter:'drop-shadow(0 0 3px rgba(216,180,254,0.7))'}}>
                    {/* Inclined rail */}
                    <rect x="4" y="28" width="46" height="3" rx="1.5" transform="rotate(-18 4 28)" />
                    {/* Seat carriage */}
                    <rect x="22" y="16" width="10" height="5" rx="2" />
                    {/* Vertical tower */}
                    <rect x="48" y="6" width="3" height="28" rx="1.5" />
                    {/* Tower top crossbar */}
                    <rect x="44" y="6" width="11" height="3" rx="1.5" />
                    {/* Pulley circle */}
                    <circle cx="50" cy="8" r="3" fill="none" stroke="white" strokeWidth="2" />
                    {/* Cable line */}
                    <line x1="27" y1="18" x2="50" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Base feet */}
                    <rect x="2" y="33" width="6" height="3" rx="1.5" />
                    <rect x="47" y="33" width="6" height="3" rx="1.5" />
                  </svg>
                ),
                bgImage: '/images/exercise_bg_slideboard.png',
                countColor: '#d8b4fe',
              },
              'No Equipment': {
                gradient: 'linear-gradient(135deg, rgba(34,197,94,0.20) 0%, rgba(21,128,61,0.15) 100%)',
                glow: 'rgba(34,197,94,0.5)',
                border: 'rgba(34,197,94,0.25)',
                activeBorder: '#22c55e',
                icon: '🤸',
                bgImage: '/images/exercise_bg_bodyweight.png',
                countColor: '#86efac',
              },
            };

            const meta = categoryMeta[category] || categoryMeta['All'];
            const label = category === 'All' ? 'Total' : category;

            return (
              <div
                key={category}
                onClick={() => handleCategoryClick(category)}
                style={{
                  background: meta.gradient,
                  border: `2px solid ${isActive ? meta.activeBorder : meta.border}`,
                  boxShadow: isActive ? `0 0 18px 2px ${meta.glow}, inset 0 0 20px rgba(0,0,0,0.3)` : `inset 0 0 20px rgba(0,0,0,0.3)`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
                className="rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer group min-h-[90px]"
              >
                {/* Background image */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${meta.bgImage})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  opacity: 0.45,
                  filter: 'grayscale(20%)',
                }} />

                {/* Hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(255,255,255,0)',
                  transition: 'background 0.2s',
                }}
                  className="group-hover:bg-white/5"
                />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <div className="mb-0.5" style={{ lineHeight: 1, height: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {meta.iconSvg
                      ? meta.iconSvg
                      : <span className="text-lg">{meta.icon}</span>
                    }
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-1 leading-tight">
                    {label}
                  </div>
                  <div className="font-black text-2xl leading-none" style={{ color: meta.countColor, textShadow: `0 0 12px ${meta.glow}` }}>
                    {categoryCounts[category] || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <GymFilterPanel
        selectedGymId={selectedGymId}
        selectedSectionId={selectedGymSectionId}
        onGymSelect={(gymId, sectionId) => {
          setSelectedGymId(gymId);
          setSelectedGymSectionId(sectionId);
        }}
      />

      <ExerciseVisualFilter
        equipmentFilter={equipmentFilter}
        categoryFilter={categoryFilter}
        muscleGroupFilter={muscleGroupFilter}
        onEquipmentChange={setEquipmentFilter}
        onCategoryChange={(cat) => {
          setCategoryFilter(cat);
          setSelectionMode(false);
          setSelectedExerciseIds([]);
        }}
        onMuscleGroupChange={setMuscleGroupFilter}
      />

      <ExerciseFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        equipmentFilter={equipmentFilter}
        onEquipmentFilterChange={setEquipmentFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(cat) => {
          setCategoryFilter(cat);
          setSelectionMode(false);
          setSelectedExerciseIds([]);
        }}
        muscleGroupFilter={muscleGroupFilter}
        onMuscleGroupFilterChange={setMuscleGroupFilter}
        categoryCounts={categoryCounts}
        className="mb-4"
      />

      {selectionMode && (
        <div className="mb-6 animate-fadeIn">
          <Button 
            onClick={() => {
              if (selectedExerciseIds.length > 0) {
                startWorkout("Custom", selectedExerciseIds);
                navigate("/workout");
              }
            }}
            disabled={selectedExerciseIds.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 shadow-lg shadow-green-900/20 flex items-center justify-center space-x-2"
          >
            <Play className="h-6 w-6" />
            <span className="text-lg">Start Workout with {selectedExerciseIds.length} Exercises</span>
          </Button>
        </div>
      )}
      
      {/* ── Exercise grid ── */}
      {(() => {
        // When filtering by a specific gym section, split the list:
        //   - carryover: exercises that are selected but from a DIFFERENT section
        //   - current:   exercises that belong to the active section (+ untagged previews)
        const carryover = selectedGymSectionId
          ? filteredExercises.filter(ex =>
              selectedExerciseIds.includes(ex.id) && ex.gymSectionId !== selectedGymSectionId
            )
          : [];
        const currentZone = selectedGymSectionId
          ? filteredExercises.filter(ex =>
              !(selectedExerciseIds.includes(ex.id) && ex.gymSectionId !== selectedGymSectionId)
            )
          : filteredExercises;

        const renderCard = (exercise: Exercise) => (
          <ExerciseCard
            key={exercise.id}
            name={exercise.name}
            category={exercise.category}
            thumbnailUrl={exercise.thumbnailUrl}
            pictureUrl={exercise.pictureUrl}
            startPositionUrl={exercise.startPositionUrl}
            endPositionUrl={exercise.endPositionUrl}
            onStart={() => handleStartExercise(exercise.id)}
            onEdit={() => navigate(`/create-exercise?id=${exercise.id}`)}
            onToggleFavorite={() => toggleFavorite(exercise.id)}
            onDelete={() => handleDeleteExercise(exercise.id)}
            isFavorite={favoriteExercises.includes(exercise.id)}
            addToWorkout={addToWorkout}
            selectionMode={selectionMode}
            isSelected={selectedExerciseIds.includes(exercise.id)}
            onToggleSelection={() => {
              setSelectedExerciseIds(prev =>
                prev.includes(exercise.id)
                  ? prev.filter(id => id !== exercise.id)
                  : [...prev, exercise.id]
              );
            }}
            onViewProgress={() => setViewProgressExercise(exercise)}
          />
        );

        return (
          <>
            {/* Carryover picks from other zones */}
            {carryover.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="h-px flex-1 bg-amber-500/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/70 flex items-center gap-1">
                    ✓ {carryover.length} pick{carryover.length !== 1 ? 's' : ''} from other zones
                  </span>
                  <div className="h-px flex-1 bg-amber-500/20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carryover.map(renderCard)}
                </div>
              </div>
            )}

            {/* Current zone exercises */}
            {currentZone.length > 0 && (
              <>
                {carryover.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                      Current zone
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentZone.map(renderCard)}
                </div>
              </>
            )}

            {filteredExercises.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No exercises found for this zone.
              </div>
            )}
          </>
        );
      })()}
      
      <ExerciseProgressModal 
        isOpen={!!viewProgressExercise} 
        onClose={() => setViewProgressExercise(null)} 
        exercise={viewProgressExercise} 
      />

      {/* PRINT-ONLY SECTION: Neat and colorful exercise catalog */}
      <div className="hidden print:block print-section">
        <style>{`
          @media print {
            /* Hide the main app content robustly to fix pagination */
            .page-container > *:not(.print-section) {
              display: none !important;
            }
            nav, header, aside, .sidebar { 
              display: none !important; 
            }
            
            /* Universal override to break all scroll-locks and fixed heights in NextJS layouts */
            * {
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
            }
            
            html, body {
              background: white !important;
            }
            
            .print-section, .print-section * {
              visibility: visible;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
            }
            
            .print-section {
              position: static !important;
              width: 100%;
              padding: 0;
              margin: 0;
              background: white !important;
              color: black !important;
              display: block !important;
            }
            
            /* Clean up table formatting for print */
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #eee; padding: 10px; text-align: left; color: black !important; }
            th { background-color: #f9fafb !important; color: #111 !important; font-weight: 800; }
            
            @page { margin: 0; size: portrait; }
            .avoid-break { break-inside: avoid; page-break-inside: avoid; }
            .no-print { display: none !important; }
          }
        `}</style>
        
        <div className="text-center mb-10 border-b-2 border-gym-blue pb-6">
          <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter">GymDay Fit Catalog</h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">Comprehensive Training Library • {new Date().getFullYear()}</p>
        </div>

        {["Weights", "Cardio", "Slide Board", "No Equipment"].map((category) => {
          const catEx = exercises.filter(e => e.category === category)
                             .sort((a, b) => a.name.localeCompare(b.name));
          
          if (catEx.length === 0) return null;

          const colorClass = category === "Weights" ? "bg-blue-600" : 
                            category === "Cardio" ? "bg-red-600" : 
                            category === "Slide Board" ? "bg-purple-600" : "bg-green-600";

          return (
            <div key={category} className="mb-12 avoid-break">
              <div className={`${colorClass} text-white px-6 py-4 rounded-t-2xl flex justify-between items-center shadow-lg`}>
                <h2 className="text-2xl font-black uppercase tracking-tight">{category}</h2>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{catEx.length} Exercises</div>
              </div>
              <div className="border-2 border-t-0 border-gray-100 rounded-b-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="w-16">Preview</th>
                      <th>Exercise Name</th>
                      <th>Equipment</th>
                      <th>Focus Areas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {catEx.map((ex) => (
                      <tr key={ex.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-2">
                           {ex.startPositionUrl ? (
                              <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white">
                                <AnimatedExerciseIcon 
                                  startPositionUrl={ex.startPositionUrl}
                                  endPositionUrl={ex.endPositionUrl}
                                  alt={ex.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                           ) : ex.thumbnailUrl || ex.pictureUrl ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50 flex-shrink-0">
                                 <img src={ex.thumbnailUrl || ex.pictureUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                           ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold text-center">NO PIC</div>
                           )}
                        </td>
                        <td className="px-6 py-4">
                           <div className="font-extrabold text-gray-900 text-sm">{ex.name}</div>
                           {ex.description && <div className="text-[10px] text-gray-400 mt-1 italic leading-relaxed">{ex.description}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                             {ex.equipment || 'Standard'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {ex.muscleGroups?.map(m => (
                              <span key={m} className="text-[9px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 uppercase">{m}</span>
                            )) || <span className="text-gray-300">--</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        
        <div className="mt-20 text-center text-gray-300 text-[9px] border-t pt-6 font-bold uppercase tracking-widest">
          <p>© GYMDAY FIT TRACKER • GENERATED ON {new Date().toLocaleDateString()} • PROFESSIONAL EXERCISE GUIDE</p>
        </div>
      </div>
    </div>
  );
};

export default Exercises;
