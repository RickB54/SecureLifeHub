
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Exercise, generateId, parseCSVData as csvToExercises, exercisesToCSV, slideboardExercises, cardioExercises, weightExercises, noEquipmentExercises } from "@/components/gdft/lib/data";
import { api } from "@/components/gdft/lib/api";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

// Local storage key removed


interface ExerciseContextType {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, "id">) => Promise<Exercise>;
  updateExercise: (id: string, exercise: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<boolean>;
  deleteAllExercises: () => Promise<boolean>;
  getExerciseById: (id: string) => Exercise | undefined;
  filterExercises: (equipment?: string, category?: string, muscleGroup?: string, searchQuery?: string) => Exercise[];
  uploadExerciseImage: (file: File) => Promise<string>;
  importFromCSV: (csvString: string) => Promise<void>;
  exportToCSV: () => string;
  reinstallAllExercises: () => Promise<void>;
  favoriteExercises: string[];
  toggleFavorite: (exerciseId: string) => void;
  reorderFavorites: (reorderedIds: string[]) => void;
  migrateImagesToSupabase: () => Promise<void>;
  refreshExercises: () => Promise<void>;
  purgeCustomExercisesOnly: () => Promise<void>;
}


const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  // Use derived favorites
  const favoriteExercises = exercises.filter(e => e.isFavorite).map(e => e.id);
  const [loading, setLoading] = useState(false);

  // Load exercises from Supabase
  const refreshExercises = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) {
         console.log("No user, loading local defaults");
         const localDefaults = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
         setExercises(localDefaults);
      } else {
         console.log("Loading user exercises from Supabase");
         const data = await api.exercises.list();
         
         // Auto-deduplicate
         const unique: Exercise[] = [];
         const seen = new Set();
         for (const ex of data) {
           const nameKey = ex.name.toLowerCase().trim();
           if (!seen.has(nameKey)) {
             seen.add(nameKey);
             unique.push(ex);
           }
         }

          if (unique.length === 0) {
            console.log("DB empty, seeding defaults...");
            seedDefaults();
          } else {
            // Hot-swap image URLs for default exercises so new assets show up instantly
            const allDefaults = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
            const defaultMap = new Map(allDefaults.map(d => [d.name.toLowerCase().trim(), d]));
            
            const upToDate = unique.map(ex => {
              const defaultEx = defaultMap.get(ex.name.toLowerCase().trim());
              if (defaultEx) {
                return { 
                  ...ex, 
                  startPositionUrl: defaultEx.startPositionUrl, 
                  endPositionUrl: defaultEx.endPositionUrl,
                  thumbnailUrl: defaultEx.thumbnailUrl,
                  pictureUrl: defaultEx.pictureUrl
                };
              }
              return ex;
            });
            
            setExercises(upToDate);
            // Automatic deduplication removed to avoid breaking past workout history links
          }
      }
    } catch (error) {
      console.error("Failed to load exercises:", error);
      toast.error("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshExercises();
  }, [refreshExercises]);

   const seedDefaults = async () => {
    if (!user) return;
    
    try {
        // Double check to prevent concurrent seeding if called twice
        const existing = await api.exercises.list();
        if (existing.length > 5) { // Assuming if there's more than 5, it's already seeded or user has data
            setExercises(existing);
            return;
        }

        toast.info("Setting up your account...");
        let count = 0;
        
        // Combine all and unique by name before bulk insert
        const allDefaults = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
        const uniqueDefaults: any[] = [];
        const seenNames = new Set();
        
        for (const ex of allDefaults) {
           const nameKey = ex.name.toLowerCase().trim();
           if (!seenNames.has(nameKey)) {
             seenNames.add(nameKey);
             uniqueDefaults.push(ex);
           }
        }

        for (const ex of uniqueDefaults) {
           const { id, ...rest } = ex; 
           await api.exercises.create(rest as any, user.id);
           count++;
        }

        // 2. Migrate Local Custom Exercises
        const localExercises = localStorage.getItem('exercises');
        if (localExercises) {
            try {
                const parsed = JSON.parse(localExercises);
                const customExercises = parsed.filter((e: any) => e.userCreated);
                const existingNames = new Set(uniqueDefaults.map(d => d.name.toLowerCase().trim()));

                if (customExercises.length > 0) {
                    console.log(`Migrating ${customExercises.length} custom exercises...`);
                    for (const ex of customExercises) {
                        if (existingNames.has(ex.name.toLowerCase().trim())) continue;
                        const { id, ...rest } = ex;
                        await api.exercises.create(rest as any, user.id);
                        count++;
                    }
                    localStorage.removeItem('exercises');
                }
            } catch (e) {
                console.error("Failed to migrate local exercises", e);
            }
        }
        
        const data = await api.exercises.list();
        setExercises(data);
        toast.success(`Account setup complete! ${count} exercises available.`);
    } catch (e) {
        console.error("Setup failed", e);
        toast.error("Failed to setup account");
    }
  };

  const deduplicateDatabase = async (allData: Exercise[]) => {
    if (!user) return;
    
    const seen = new Map<string, string>(); // name -> firstIdFound
    const toDeleteIds: string[] = [];
    
    for (const ex of allData) {
      const nameKey = ex.name.toLowerCase().trim();
      if (seen.has(nameKey)) {
        toDeleteIds.push(ex.id);
      } else {
        seen.set(nameKey, ex.id);
      }
    }
    
    if (toDeleteIds.length > 0) {
      console.log(`Cleaning up ${toDeleteIds.length} duplicates from database...`);
      // Delete in parallel
      await Promise.all(toDeleteIds.map(id => api.exercises.delete(id)));
      // Refresh local state to match DB
      const freshData = await api.exercises.list();
      setExercises(freshData);
    }
  };

  const toggleFavorite = useCallback(async (exerciseId: string) => {
    const ex = exercises.find(e => e.id === exerciseId);
    if (!ex) return;
    
    // Optimistic update
    const newVal = !ex.isFavorite;
    setExercises(prev => prev.map(e => e.id === exerciseId ? { ...e, isFavorite: newVal } : e));
    
    if (user) {
        try {
            await api.exercises.update(exerciseId, { isFavorite: newVal });
            toast.success(newVal ? "Added to favorites" : "Removed from favorites");
        } catch (e) {
            console.error(e);
            toast.error("Failed to update favorite");
            // Revert
            setExercises(prev => prev.map(e => e.id === exerciseId ? { ...e, isFavorite: !newVal } : e));
        }
    }
  }, [exercises, user]);

  const reorderFavorites = useCallback((reorderedIds: string[]) => {
    // Reorder not fully supported on backend yet (would need 'order' column)
    // For now, no-op or maybe just local sort if we added order field?
    // User asked for "No local storage".
    console.log("Reordering favorites not persisted to DB yet");
  }, []);

  const addExercise = async (exercise: Omit<Exercise, "id">): Promise<Exercise> => {
    if (!user) {
        toast.error("Please login to add exercises");
        const mockEx = { ...exercise, id: generateId() } as Exercise;
        setExercises(prev => [...prev, mockEx]); // Optimistic/Local
        return mockEx;
    }

    try {
        const newEx = await api.exercises.create(exercise, user.id);
        setExercises(prev => [...prev, newEx]);
        toast.success("Exercise added successfully");
        return newEx;
    } catch (e) {
        console.error(e);
        toast.error("Failed to add exercise");
        throw e;
    }
  };

  const updateExercise = async (id: string, exerciseUpdates: Partial<Exercise>) => {
    if (!user) {
        toast.error("Please login to update exercises");
        setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...exerciseUpdates } : ex));
        return;
    }

    try {
        const updatedEx = await api.exercises.update(id, exerciseUpdates);
        setExercises(prev => prev.map(ex => ex.id === id ? updatedEx : ex));
        toast.success("Exercise updated successfully");
    } catch (e) {
        console.error(e);
        toast.error("Failed to update exercise");
    }
  };

  const deleteExercise = async (id: string): Promise<boolean> => {
     if (!window.confirm("Are you sure?")) return false;

     if (!user) {
         toast.error("Please login to delete exercises");
         setExercises(prev => prev.filter(ex => ex.id !== id));
         return true;
     }

     try {
         await api.exercises.delete(id);
         setExercises(prev => prev.filter(ex => ex.id !== id));
         toast.success("Exercise deleted");
         return true;
     } catch (e) {
         console.error(e);
         toast.error("Failed to delete exercise");
         return false;
     }
  };

  const deleteAllExercises = async (): Promise<boolean> => {
     if (!window.confirm("Delete ALL exercises?")) return false;
     
     if (!user) {
         setExercises([]);
         return true;
     }
     
     // API doesn't have bulk delete yet, iterating (inefficient but safe)
     // Or create bulk delete endpoint
     try {
         // This assumes we only delete USER exercises, not system ones? 
         // But the UI implies "Clear All".
         // For now, let's just toast "Not implemented deeply" or try to delete loop.
         // Actually, RLS prevents deleting system exercises.
         const userExercises = exercises.filter(ex => true); // We don't distinguish easily yet without checking owner.
         // Let's assume we can delete what we stick in the list.
         // But iterating in FE is bad.
         toast.error("Bulk delete not fully supported in this version via API safety.");
         return false;
     } catch (e) {
         return false;
     }
  };

  const reinstallAllExercises = async () => {
    if (!user) {
        const defaultExercises = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
        setExercises(defaultExercises);
        toast.success("Reset to defaults (Local)");
        return;
    }
    
    if (!window.confirm("This will add any missing default exercises to your library (your existing exercises will not be touched). Continue?")) return;

    try {
        const existing = await api.exercises.list();
        const existingNames = new Set(existing.map((e: Exercise) => e.name.toLowerCase().trim()));

        const allDefaults = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
        const toAdd = allDefaults.filter(ex => !existingNames.has(ex.name.toLowerCase().trim()));
        
        if (toAdd.length === 0) {
            toast.info("Your library is already up to date — no exercises are missing!");
            return;
        }

        toast.info(`Adding ${toAdd.length} missing exercise${toAdd.length > 1 ? 's' : ''}…`);
        for (const ex of toAdd) {
            const { id, ...rest } = ex;
            await api.exercises.create(rest as any, user.id);
        }
        
        const data = await api.exercises.list();
        setExercises(data);
        toast.success(`✅ Added ${toAdd.length} missing exercise${toAdd.length > 1 ? 's' : ''} to your library!`);
    } catch (e) {
        console.error(e);
        toast.error("Failed to sync exercises");
    }
  };

  const getExerciseById = useCallback((id: string) => {
    // 1. Primary lookup by ID
    const byId = exercises.find((ex) => ex.id === id);
    if (byId) return byId;

    // 2. Fallback: Lookup by Name if ID fails (heals broken history links caused by deduplication)
    // This is useful if an exercise was deleted/re-seeded but its name is the same.
    // Use the ID to try to find metadata if we had it, but mostly we just want the current version of that name.
    // Note: This relies on the workout history having the name, but usually it only has the ID.
    // However, if we are mapping from a list of 'unique' exercises, we should check if the ID
    // matches any of the ones we filtered out by name? No, we don't have them in state.
    
    // Actually, if we don't have the ID, we can't easily find the name unless we store a map.
    // But we can check if any exercise in the current list has an ID that starts with the same characters? No.
    
    // For now, return undefined if ID not found, but we've stopped the DELETION from DB,
    // so new breakages won't happen.
    return undefined;
  }, [exercises]);

  const filterExercises = (equipment?: string, category?: string, muscleGroup?: string, searchQuery?: string) => {
    return exercises.filter((ex) => {
      // Special handling for Favorites category
      if (category === "Favorites" && !ex.isFavorite) {
        return false;
      }

      const equipmentMatch = !equipment || equipment === "All" || 
        (ex.equipment && ex.equipment === equipment);
      
      const categoryMatch = !category || category === "All" || category === "Favorites" || 
        (ex.category && ex.category.trim().toLowerCase() === category.trim().toLowerCase());
      
      const muscleGroupMatch = !muscleGroup || muscleGroup === "All" || 
        (ex.muscleGroups && Array.isArray(ex.muscleGroups) && ex.muscleGroups.includes(muscleGroup as any));
      const searchMatch = !searchQuery || ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return equipmentMatch && categoryMatch && muscleGroupMatch && searchMatch;
    });
  };

  const uploadExerciseImage = async (file: File): Promise<string> => {
    if (!user) {
        throw new Error("You must be logged in to upload images to the cloud.");
    }
    return await api.storage.uploadImage(file, user.id);
  };
  
  const importFromCSV = async (csvString: string) => {
    const importedExercises = csvToExercises(csvString);
    if (importedExercises.length === 0) {
        toast.error("No valid exercises found");
        return;
    }
    
    if (!user) {
        setExercises(prev => [...prev, ...importedExercises]);
        toast.success(`Imported ${importedExercises.length} locally`);
        return;
    }

    try {
        for (const ex of importedExercises) {
            await api.exercises.create(ex, user.id);
        }
        const data = await api.exercises.list();
        setExercises(data);
        toast.success(`Imported ${importedExercises.length} to cloud`);
    } catch (e) {
        console.error(e);
        toast.error("Import failed");
    }
  };
  
  const exportToCSV = () => {
    return exercisesToCSV(exercises);
  };


    const migrateImagesToSupabase = async () => {
    if (!user) {
      toast.error("Please login to migrate images");
      return;
    }

    let count = 0;
    const updates = [];

    for (const ex of exercises) {
      // Check for Base64 images in pictureUrl or thumbnailUrl
      if (ex.pictureUrl?.startsWith('data:image') || ex.thumbnailUrl?.startsWith('data:image')) {
        try {
          let newPictureUrl = ex.pictureUrl;
          let newThumbnailUrl = ex.thumbnailUrl;

          if (ex.pictureUrl?.startsWith('data:image')) {
            const blob = await (await fetch(ex.pictureUrl)).blob();
            const file = new File([blob], `exercise-${ex.id}-full.jpg`, { type: blob.type });
            newPictureUrl = await api.storage.uploadImage(file, user.id);
          }

          if (ex.thumbnailUrl?.startsWith('data:image')) {
            const blob = await (await fetch(ex.thumbnailUrl)).blob();
            const file = new File([blob], `exercise-${ex.id}-thumb.jpg`, { type: blob.type });
            newThumbnailUrl = await api.storage.uploadImage(file, user.id);
          }

          if (newPictureUrl !== ex.pictureUrl || newThumbnailUrl !== ex.thumbnailUrl) {
            await api.exercises.update(ex.id, {
              pictureUrl: newPictureUrl,
              thumbnailUrl: newThumbnailUrl
            });
            count++;
          }
        } catch (e) {
          console.error(`Failed to migrate image for ${ex.name}`, e);
        }
      }
    }

    if (count > 0) {
      toast.success(`Migrated ${count} exercises to Supabase storage`);
      // Refresh list
      const data = await api.exercises.list();
      setExercises(data);
    } else {
      toast.info("No local images found to migrate");
    }
  };

  const purgeCustomExercisesOnly = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const allDefaults = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
      const defaultNames = new Set(allDefaults.map(ex => ex.name.toLowerCase().trim()));
      
      const customExercises = exercises.filter(ex => !defaultNames.has(ex.name.toLowerCase().trim()));
      
      if (customExercises.length === 0) {
        toast.info("No custom exercises found to purge");
        return;
      }

      await Promise.all(customExercises.map(ex => api.exercises.delete(ex.id)));
      
      setExercises(prev => prev.filter(ex => defaultNames.has(ex.name.toLowerCase().trim())));
      toast.success(`Purged ${customExercises.length} custom exercises`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to purge custom exercises");
    } finally {
      setLoading(false);
    }
  }, [user, exercises]);

  return (
    <ExerciseContext.Provider
      value={{
        exercises,
        addExercise,
        updateExercise,
        deleteExercise,
        deleteAllExercises,
        getExerciseById,
        filterExercises,
        uploadExerciseImage,
        importFromCSV,
        exportToCSV,
        reinstallAllExercises,
        favoriteExercises,
        toggleFavorite,
        reorderFavorites,
        migrateImagesToSupabase,
        refreshExercises,
        purgeCustomExercisesOnly,
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );

};

export const useExercise = () => {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error("useExercise must be used within an ExerciseProvider");
  }
  return context;
};
