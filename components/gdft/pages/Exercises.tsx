
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, BarChart3, Trash, Heart, ListOrdered, Play, Edit, HelpCircle, Printer, FileText, ArrowLeft, RefreshCw } from "lucide-react";
import ExerciseCard from "@/components/gdft/components/ui/ExerciseCard";
import ExerciseFilters from "@/components/gdft/components/ui/ExerciseFilters";
import { useExercise } from "@/components/gdft/contexts/ExerciseContext";
import { useWorkout } from "@/components/gdft/contexts/WorkoutContext";
import { useSettings } from "@/components/gdft/contexts/SettingsContext";
import { Exercise, RelaxedMuscleGroup, RelaxedExerciseCategory, slideboardExercises, cardioExercises, weightExercises, noEquipmentExercises } from "@/components/gdft/lib/data";
import { ReorderFavoritesDialog } from "@/components/gdft/components/ReorderFavoritesDialog";
import { Button } from "@/components/gdft/components/ui/button";
import ExercisesHelpPopup from "@/components/gdft/components/ui/ExercisesHelpPopup";
import { ExerciseProgressModal } from "@/components/gdft/components/ui/ExerciseProgressModal";
import { ExerciseVisualFilter } from "@/components/gdft/components/ui/ExerciseVisualFilter";
import { GymFilterPanel, GymFilterState } from "@/components/gdft/components/ui/GymFilterPanel";
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
  const { stickyExerciseSummary } = useSettings();
  
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
  const [gymFilter, setGymFilter] = useState<GymFilterState>({ gymId: null, sectionIds: [] });
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
        if (gymFilter.gymId) {
          const isAlreadySelected = selectedExerciseIds.includes(ex.id);
          if (isAlreadySelected) return true;
          
          // If a gym is selected, we ONLY show exercises belonging to that gym.
          // This ensures global defaults are NEVER mixed in.
          let isGymMatch = false;
          
          // 1. Explicit Gym mapping match
          if (ex.gymId === gymFilter.gymId) {
             if (gymFilter.sectionIds.length === 0 && gymFilter.sectionPrefixes?.length === 0) {
                 // If the gym is selected but ALL zones are cleared, show NOTHING
                 isGymMatch = false;
             } else if (gymFilter.sectionIds.length === 0) {
                 // Fallback for legacy behavior just in case
                 isGymMatch = !ex.gymSectionId;
             } else {
                 isGymMatch = gymFilter.sectionIds.includes(ex.gymSectionId ?? "");
             }
          }
          
          // 2. Legacy Prefix match (for untagged CF exercises)
          if (!isGymMatch && !ex.gymId && gymFilter.sectionPrefixes && gymFilter.sectionPrefixes.length > 0) {
             const exNameRaw = ex.name.toUpperCase().replace(/-/g, '');
             const hasPrefixMatch = gymFilter.sectionPrefixes.some(prefix => exNameRaw.startsWith(prefix.replace(/-/g, '')));
             if (hasPrefixMatch) {
                 isGymMatch = true;
             }
          }
          
          return isGymMatch;
        }
        
        // If NO gym is selected (Main Library View):
        // Build a set of all known standard library exercise names
        const allDefaults = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
        const defaultNames = new Set(allDefaults.map(d => d.name.toLowerCase().trim()));
        
        // 1. Hide any exercise assigned to a specific gym that is NOT a standard library exercise
        //    (i.e. it's a custom gym machine - only visible when that gym is selected)
        if (ex.gymId && !defaultNames.has(ex.name.toLowerCase().trim())) return false;
        
        // 2. Hide any legacy untagged Choice Fitness (CF) exercises
        if (ex.name.toUpperCase().startsWith("CF")) return false;
        
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
  }, [exercises, equipmentFilter, categoryFilter, muscleGroupFilter, searchQuery, filterExercises, favoriteExercises, gymFilter, selectedExerciseIds]);

  const handleStartExercise = (exerciseId: string) => {
    if (addToWorkout && currentWorkout) {
      // Use the new method to properly add exercise to current workout
      addExerciseToCurrentWorkout(exerciseId);
      // Navigate back to workout page - the navigation will be handled in the workout context
      navigate('/workout');
    } else {
      startWorkout("Custom", [exerciseId], undefined, undefined, gymFilter.gymId || undefined);
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
                    
                    const element = document.getElementById('print-catalog');
                    if (!element) {
                      setIsGeneratingPDF(false);
                      return;
                    }

                    // Temporarily bring the catalog on-screen for html2pdf to capture
                    element.style.position = 'static';
                    element.style.left = '0';
                    element.style.width = '100%';
                    element.style.background = 'white';
                    element.style.padding = '20px';
                    
                    const opt = {
                      margin: [10, 5, 10, 5],
                      filename: 'GymDay_Exercise_Catalog.pdf',
                      image: { type: 'jpeg' as const, quality: 0.98 },
                      html2canvas: { scale: 2, useCORS: true, logging: false },
                      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
                      pagebreak: { mode: ['avoid-all', 'css'] }
                    };
                    
                    // Dynamically import to avoid SSR issues
                    const html2pdfModule = (await import('html2pdf.js')).default;
                    await html2pdfModule().set(opt).from(element).save();
                    
                    // Move it back off-screen
                    element.style.position = 'absolute';
                    element.style.left = '-9999px';
                    element.style.width = '190mm';
                    element.style.background = '';
                    element.style.padding = '';
                    
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
      <div className={`rounded-xl border border-white/10 p-4 mb-6 overflow-hidden ${stickyExerciseSummary ? 'sticky top-4 z-40 shadow-2xl backdrop-blur-md' : ''}`}
           style={{ 
             background: stickyExerciseSummary ? 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
             boxShadow: stickyExerciseSummary ? '0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' : undefined
           }}>
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
        filterState={gymFilter}
        onFilterChange={setGymFilter}
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
                startWorkout("Custom", selectedExerciseIds, undefined, undefined, gymFilter.gymId || undefined);
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
        const activeSectionIds = gymFilter.sectionIds;
        const carryover = activeSectionIds.length > 0
          ? filteredExercises.filter(ex =>
              selectedExerciseIds.includes(ex.id) && !activeSectionIds.includes(ex.gymSectionId ?? "")
            )
          : [];
        const currentZone = activeSectionIds.length > 0
          ? filteredExercises.filter(ex =>
              !(selectedExerciseIds.includes(ex.id) && !activeSectionIds.includes(ex.gymSectionId ?? ""))
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

      {/* PRINT-ONLY SECTION — rendered off-screen so visibility trick works */}
      <div
        id="print-catalog"
        style={{ position: 'absolute', left: '-9999px', top: 0, width: '190mm', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <style>{`
          @media print {
            /* Visibility trick: hides entire page, then reveals only this catalog */
            body { visibility: hidden !important; }
            #print-catalog {
              visibility: visible !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              background: white !important;
            }
            #print-catalog * { visibility: visible !important; }

            @page {
              margin: 15mm 10mm;
              size: portrait;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Prevent exercise rows from splitting across pages */
            .ex-row {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            /* Category header stays with its first row */
            .cat-header {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
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
            <div key={category} style={{ marginBottom: '48px' }}>
              <div className={`cat-header ${colorClass} text-white px-6 py-4 rounded-t-2xl flex justify-between items-center shadow-lg`}>
                <h2 className="text-2xl font-black uppercase tracking-tight">{category}</h2>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{catEx.length} Exercises</div>
              </div>
              <div className="border-2 border-t-0 border-gray-100 rounded-b-2xl overflow-visible">
                {/* Column headers */}
                <div className="cat-header bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest px-2 py-2" style={{ display: 'grid', gridTemplateColumns: '64px 1fr 140px 160px' }}>
                  <span>Preview</span>
                  <span>Exercise Name</span>
                  <span>Equipment</span>
                  <span>Focus Areas</span>
                </div>
                {catEx.map((ex, idx) => {
                  const useStartPos = category !== "Slide Board" && !!ex.startPositionUrl;
                  const imgSrc = useStartPos ? ex.startPositionUrl! : (ex.thumbnailUrl || ex.pictureUrl || null);

                  return (
                    <div
                      key={ex.id}
                      className={`ex-row ${idx !== catEx.length - 1 ? 'border-b border-gray-100' : ''}`}
                      style={{ display: 'grid', gridTemplateColumns: '64px 1fr 140px 160px', padding: '10px 8px' }}
                    >
                      {/* Image */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {imgSrc ? (
                          <div style={{ width: '48px', height: '48px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #f0f0f0', background: 'white', flexShrink: 0 }}>
                            <img
                              src={imgSrc}
                              alt={ex.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        ) : (
                          <div style={{ width: '48px', height: '48px' }} />
                        )}
                      </div>
                      {/* Name + description */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '16px' }}>
                        <div style={{ fontWeight: 800, color: '#111', fontSize: '13px' }}>{ex.name}</div>
                        {ex.description && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', fontStyle: 'italic', lineHeight: '1.5' }}>{ex.description}</div>}
                      </div>
                      {/* Equipment */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>{ex.equipment || 'Standard'}</span>
                      </div>
                      {/* Muscle groups */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                        {ex.muscleGroups?.map(m => (
                          <span key={m} style={{ fontSize: '9px', fontWeight: 700, background: 'white', border: '1px solid #e5e7eb', padding: '2px 6px', borderRadius: '9999px', color: '#6b7280', textTransform: 'uppercase' }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
