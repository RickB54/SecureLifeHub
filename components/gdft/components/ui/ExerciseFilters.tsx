
import React, { useState } from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ExerciseCategory, MuscleGroup } from "@/components/gdft/lib/data";
import { EQUIPMENT_OPTIONS } from "@/components/gdft/lib/exerciseTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/gdft/components/ui/select";

interface ExerciseFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  equipmentFilter: string;
  onEquipmentFilterChange: (equipment: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  muscleGroupFilter: string;
  onMuscleGroupFilterChange: (muscleGroup: string) => void;
  showMuscleGroup?: boolean;
  categoryCounts?: Record<string, number>;
  className?: string;
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  searchQuery,
  onSearchQueryChange,
  equipmentFilter,
  onEquipmentFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  muscleGroupFilter,
  onMuscleGroupFilterChange,
  categoryCounts,
  className = ""
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories: ("All" | "Favorites" | ExerciseCategory)[] = ["All", "Favorites", "Weights", "Cardio", "Slide Board", "No Equipment"];
  const muscleGroups: ("All" | MuscleGroup)[] = [
    "All", "Abs", "Biceps", "Triceps", "Shoulders", "Chest", "Back",
    "Legs", "Cardiovascular", "Full Body", "Core", "Glutes",
    "Hamstrings", "Quadriceps", "Calves", "Forearms", "Inner Thigh", "Outer Thigh"
  ];

  const handleClearFilters = () => {
    onSearchQueryChange("");
    onEquipmentFilterChange("All");
    onCategoryFilterChange("All");
    onMuscleGroupFilterChange("All");
  };

  // Count how many dropdown filters are active
  const activeFilterCount = [
    equipmentFilter !== "All",
    categoryFilter !== "All" && categoryFilter !== "Favorites",
    muscleGroupFilter !== "All",
  ].filter(Boolean).length;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── Quick Category Buttons ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["Weights", "Cardio", "Slide Board", "No Equipment"].map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryFilterChange(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              categoryFilter === cat 
                ? "bg-gym-blue text-white border-gym-blue shadow-lg shadow-blue-500/20" 
                : "bg-gym-dark text-gray-400 border-border hover:border-gray-500 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Search bar — always visible ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gym-dark border border-border text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-3"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Accordion toggle button */}
        <button
          onClick={() => setFiltersOpen(prev => !prev)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-3 border transition-all text-sm font-semibold ${
            filtersOpen || activeFilterCount > 0
              ? "bg-gym-blue/20 border-gym-blue text-gym-blue"
              : "bg-gym-dark border-border text-gray-400 hover:text-white hover:bg-gym-card-hover"
          }`}
          title={filtersOpen ? "Hide dropdown filters" : "Show dropdown filters"}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-gym-blue text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Clear all button — only when something is active */}
        {(searchQuery || activeFilterCount > 0) && (
          <button
            onClick={handleClearFilters}
            className="bg-gym-dark border border-border text-gray-400 hover:text-white hover:bg-gym-card-hover rounded-lg p-3 transition-colors"
            title="Clear all filters"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Collapsible dropdown filters ── */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: filtersOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.25s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div className="flex flex-col md:flex-row gap-2 pt-2">
            <Select value={equipmentFilter} onValueChange={onEquipmentFilterChange}>
              <SelectTrigger className="w-full bg-gym-dark border-border">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <SelectItem key={equipment} value={equipment}>
                    {`Equipment (${equipment})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="w-full bg-gym-dark border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {`Category (${category}${categoryCounts && categoryCounts[category] !== undefined ? `: ${categoryCounts[category]}` : ""})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={muscleGroupFilter} onValueChange={onMuscleGroupFilterChange}>
              <SelectTrigger className="w-full bg-gym-dark border-border">
                <SelectValue placeholder="Muscle Group" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {`Muscle Group (${group})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseFilters;
