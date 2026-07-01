
import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  Dumbbell, 
  Camera, 
  Upload, 
  Check, 
  Search,
  HelpCircle,
  MoreVertical,
  Layers,
  Save,
  X,
  PlusCircle,
  History,
  Activity,
  Zap,
  Box
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./select";
import { Badge } from "./badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { toast } from "sonner";
import { api } from "@/components/gdft/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Gym, GymSection, GymEquipment } from "@/components/gdft/lib/data";
import { v4 as uuidv4 } from "uuid";
import { useExercise } from "@/components/gdft/contexts/ExerciseContext";
import { useWorkout } from "@/components/gdft/contexts/WorkoutContext";
import { Exercise } from "@/components/gdft/lib/data";

interface CustomGymBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'intro' | 'gym-info' | 'sections' | 'equipment' | 'builder' | 'finish';

const CustomGymBuilder: React.FC<CustomGymBuilderProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { exercises, addExercise } = useExercise();
  const { saveWorkoutTemplate } = useWorkout();
  
  const [step, setStep] = useState<WizardStep>('intro');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [expandedGymId, setExpandedGymId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  // New gym state
  const [gymName, setGymName] = useState("");
  const [gymLocation, setGymLocation] = useState("");
  const [gymDescription, setGymDescription] = useState("");
  const [gymType, setGymType] = useState<'Commercial' | 'Home'>('Commercial');
  const [gymSections, setGymSections] = useState<GymSection[]>([]);
  
  // Workout Builder state
  const [workoutName, setWorkoutName] = useState("");
  const [builderEntries, setBuilderEntries] = useState<Array<{equipmentId: string, sectionId: string, name: string, photoUrl?: string}>>([]);

  // Linking existing exercise state
  const [searchInExistingOpen, setSearchInExistingOpen] = useState(false);
  const [linkingSectionId, setLinkingSectionId] = useState<string | null>(null);
  const [linkingEquipmentId, setLinkingEquipmentId] = useState<string | null>(null);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [searchCategoryFilter, setSearchCategoryFilter] = useState("All");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState<{sectionId: string, equipmentId: string} | null>(null);
  const [uploadingSectionImage, setUploadingSectionImage] = useState<string | null>(null);

  const filteredExistingExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
    const matchesCategory = searchCategoryFilter === "All" || ex.category === searchCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectExistingExercise = (exercise: Exercise) => {
    if (linkingSectionId && linkingEquipmentId) {
      handleUpdateEquipment(linkingSectionId, linkingEquipmentId, {
        name: exercise.name,
        photoUrl: exercise.thumbnailUrl || exercise.pictureUrl,
        description: exercise.description,
        type: exercise.category as any
      });
      setSearchInExistingOpen(false);
      setExerciseSearchQuery("");
      setLinkingSectionId(null);
      setLinkingEquipmentId(null);
      toast.success(`Linked to ${exercise.name}`);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadGyms();
    }
  }, [isOpen, user]);

  const loadGyms = async () => {
    try {
      const data = await api.gyms.list();
      setGyms(data);
    } catch (error) {
      console.error("Failed to load gyms", error);
    }
  };

  const handleCreateNewGym = () => {
    setStep('gym-info');
    setGymName("");
    setGymLocation("");
    setGymDescription("");
    setGymType('Commercial');
    setGymSections([{ id: uuidv4(), name: "Main Area", description: "", equipment: [] }]);
    setSelectedGym(null);
  };

  const handleEditGym = (gym: Gym) => {
    setSelectedGym(gym);
    setGymName(gym.name);
    setGymLocation(gym.location || "");
    setGymDescription(gym.description || "");
    setGymType(gym.type || 'Commercial');
    setGymSections(gym.sections || []);
    setStep('gym-info');
  };

  const handleAddSection = () => {
    setGymSections([...gymSections, { id: uuidv4(), name: "", description: "", photoUrl: "", equipment: [] }]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setGymSections(gymSections.filter(s => s.id !== sectionId));
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<GymSection>) => {
    setGymSections(gymSections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  };

  const handleAddEquipment = (sectionId: string) => {
    setGymSections(gymSections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          equipment: [...s.equipment, { 
            id: uuidv4(), 
            name: "", 
            type: 'Weights', 
            description: "" 
          }]
        };
      }
      return s;
    }));
  };

  const handleRemoveEquipment = (sectionId: string, equipmentId: string) => {
    setGymSections(gymSections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          equipment: s.equipment.filter(e => e.id !== equipmentId)
        };
      }
      return s;
    }));
  };

  const handleUpdateEquipment = (sectionId: string, equipmentId: string, updates: Partial<GymEquipment>) => {
    setGymSections(gymSections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          equipment: s.equipment.map(e => e.id === equipmentId ? { ...e, ...updates } : e)
        };
      }
      return s;
    }));
  };

  const handleImageUpload = async (sectionId: string, equipmentId: string) => {
    setUploadingSectionImage(null);
    setUploadingImage({ sectionId, equipmentId });
    fileInputRef.current?.click();
  };

  const handleSectionImageUpload = async (sectionId: string) => {
    setUploadingImage(null);
    setUploadingSectionImage(sectionId);
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || (!uploadingImage && !uploadingSectionImage) || !user) return;

    try {
      setLoading(true);
      const publicUrl = await api.storage.uploadImage(file, user.id);
      
      if (uploadingImage) {
        handleUpdateEquipment(uploadingImage.sectionId, uploadingImage.equipmentId, { photoUrl: publicUrl });
      } else if (uploadingSectionImage) {
        handleUpdateSection(uploadingSectionImage, { photoUrl: publicUrl });
      }
      
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
      setUploadingImage(null);
      setUploadingSectionImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveGym = async () => {
    if (!gymName.trim()) {
      toast.error("Gym name is required");
      return;
    }

    try {
      setLoading(true);
      const gymData = {
        name: gymName,
        location: gymLocation,
        description: gymDescription,
        type: gymType,
        sections: gymSections
      };

      if (selectedGym) {
        await api.gyms.update(selectedGym.id, gymData);
        toast.success("Gym updated!");
      } else {
        await api.gyms.create(gymData, user!.id);
        toast.success("Gym created!");
      }
      loadGyms();
      setStep('equipment');
    } catch (error: any) {
      console.error("Save failed", error);
      toast.error(`Save failed: ${error.message || 'Unknown error'}. Check if the 'gyms' table exists in Supabase.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWorkout = (sectionId: string, equipment: GymEquipment) => {
    setBuilderEntries([...builderEntries, { 
      equipmentId: equipment.id, 
      sectionId: sectionId,
      name: equipment.name,
      photoUrl: equipment.photoUrl
    }]);
    toast.success(`${equipment.name} added to plan`);
  };

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      toast.error("Workout name is required");
      return;
    }
    if (builderEntries.length === 0) {
      toast.error("Add at least one piece of equipment");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Create custom exercises for each entry if they don't exist
      const templateExerciseIds: string[] = [];
      
      for (const entry of builderEntries) {
        // Search if this equipment already exists as an exercise
        const existing = exercises.find(ex => ex.gymId === (selectedGym?.id || gyms[0]?.id) && ex.name === entry.name);
        
        if (existing) {
          templateExerciseIds.push(existing.id);
        } else {
          // Create new custom exercise
          const newEx: Omit<Exercise, 'id'> = {
            name: entry.name,
            category: "Weights",
            muscleGroups: ["Full Body"],
            equipment: "Machine",
            thumbnailUrl: entry.photoUrl,
            pictureUrl: entry.photoUrl,
            gymId: selectedGym?.id || gyms[0]?.id,
            gymSectionId: entry.sectionId,
            settings: { sets: 3, reps: 10, weight: 0 } as any
          };
          const created = await api.exercises.create(newEx as any, user!.id);
          templateExerciseIds.push(created.id);
        }
      }

      // 2. Save template
      await saveWorkoutTemplate(
        workoutName, 
        templateExerciseIds, 
        "Custom"
      );
      
      toast.success("Workout template saved!");
      setStep('finish');
    } catch (error) {
      console.error("Failed to save workout", error);
      toast.error("Failed to save workout");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gym-darker border-white/10 p-0 rounded-3xl">
        
        {/* Header */}
        <div className="sticky top-0 z-50 p-6 bg-gym-darker/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Dumbbell className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white">Gym Builder</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-white/5">
                  {step.replace('-', ' ')}
                </Badge>
                {loading && <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowHelp(true)}>
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/5">
          <div 
            className="h-full bg-blue-500 transition-all duration-500" 
            style={{ width: `${(['intro', 'gym-info', 'sections', 'equipment', 'builder', 'finish'].indexOf(step) + 1) * (100/6)}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step: Intro */}
          {step === 'intro' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-black text-white">Your Gym, Your Rules.</h2>
                <p className="text-gray-400 max-w-lg mx-auto">
                  Map out your favorite fitness centers, organize them by zones, and build workouts using only the equipment you actually have access to.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="bg-gym-card border-white/5 hover:border-blue-500/50 cursor-pointer transition-all group"
                  onClick={handleCreateNewGym}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                      <Plus className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Add New Gym</h3>
                      <p className="text-sm text-gray-400">Start from scratch and map a new location.</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <History className="h-4 w-4" /> My Gyms
                  </h3>
                  {gyms.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                      <p className="text-sm text-gray-500 italic">No gyms mapped yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {/* Deduplicate gyms by name for the list view */}
                      {Array.from(new Set(gyms.map(g => g.name))).map(uniqueName => {
                        const gym = gyms.find(g => g.name === uniqueName)!;
                        const isExpanded = expandedGymId === gym.id;
                        
                        return (
                          <div key={gym.id} className="space-y-2">
                            <div 
                              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                isExpanded ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                              onClick={() => setExpandedGymId(isExpanded ? null : gym.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isExpanded ? 'bg-blue-500 text-white' : 'bg-gym-darker text-blue-400'}`}>
                                    <MapPin className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white">{gym.name}</p>
                                    <p className="text-xs text-gray-500">{gym.sections?.length || 0} Sections</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="ghost" className="h-8 text-xs text-gray-400" onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditGym(gym);
                                  }}>Edit</Button>
                                  <ChevronRight className={`h-5 w-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-90 text-blue-400' : ''}`} />
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="pl-6 space-y-2 animate-in slide-in-from-top-2">
                                <Button 
                                  variant="ghost" 
                                  className="w-full justify-between h-10 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-blue-600 hover:text-white group"
                                  onClick={() => {
                                    setSelectedGym(gym);
                                    setGymName(gym.name);
                                    setGymSections(gym.sections);
                                    setSelectedSectionId(null);
                                    setStep('builder');
                                  }}
                                >
                                  <span className="font-bold text-sm">Full Gym Workout</span>
                                  <Zap className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                                </Button>
                                
                                {gym.sections?.map(section => (
                                  <Button 
                                    key={section.id}
                                    variant="ghost" 
                                    className="w-full justify-between h-10 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-emerald-600 hover:text-white group"
                                    onClick={() => {
                                      setSelectedGym(gym);
                                      setGymName(gym.name);
                                      setGymSections(gym.sections);
                                      setSelectedSectionId(section.id);
                                      setStep('builder');
                                    }}
                                  >
                                    <div className="flex flex-col items-start">
                                      <span className="font-bold text-sm">{section.name}</span>
                                      <span className="text-[9px] uppercase tracking-widest opacity-60">Zone Focus</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                                  </Button>
                                ))}
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
          )}

          {/* Step: Gym Info */}
          {step === 'gym-info' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 pb-12">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => setStep('intro')} className="bg-white/5">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-black text-white">Gym Basics</h2>
                  <p className="text-sm text-gray-400">Tell us about your {gymType === 'Home' ? 'home setup' : 'training ground'}.</p>
                </div>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex gap-1 w-full max-w-sm">
                  <Button 
                    variant="ghost" 
                    className={`flex-1 h-12 rounded-xl text-sm font-bold gap-2 transition-all ${gymType === 'Commercial' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    onClick={() => setGymType('Commercial')}
                  >
                    Official Gym
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`flex-1 h-12 rounded-xl text-sm font-bold gap-2 transition-all ${gymType === 'Home' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    onClick={() => setGymType('Home')}
                  >
                    Home Setup
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Gym Name</label>
                    <Input 
                      placeholder="e.g., Choice Fitness, Gold's Gym" 
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white text-lg focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Location (Optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                      <Input 
                        placeholder="Street address or city..." 
                        className="h-12 bg-white/5 border-white/10 rounded-xl pl-12"
                        value={gymLocation}
                        onChange={(e) => setGymLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">About this gym</label>
                    <Textarea 
                      placeholder="General notes about the layout, crowd levels, etc."
                      className="min-h-[100px] bg-white/5 border-white/10 rounded-xl"
                      value={gymDescription}
                      onChange={(e) => setGymDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-blue-500/20"
                  onClick={() => setStep('sections')}
                >
                  Map Zones <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Sections */}
          {step === 'sections' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => setStep('gym-info')} className="bg-white/5">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-black text-white">Dynamic Zones</h2>
                  <p className="text-sm text-gray-400">Break your gym into logical areas (e.g., cardio, free weights).</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[55vh] overflow-y-auto px-4 py-2 custom-scrollbar -mx-4">
                {gymSections.map((section, index) => (
                  <div 
                    key={section.id} 
                    className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 relative group animate-in zoom-in-95 duration-300"
                  >
                    <div className="absolute -left-2 top-6 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-sm shadow-xl z-10 border-2 border-gym-darker">
                      {index + 1}
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div 
                        className="h-24 w-24 shrink-0 rounded-2xl bg-gym-darker flex flex-col items-center justify-center border border-dashed border-white/10 cursor-pointer hover:bg-white/5 transition-all overflow-hidden group"
                        onClick={() => handleSectionImageUpload(section.id)}
                      >
                        {section.photoUrl ? (
                          <img src={section.photoUrl} alt={section.name} className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <Camera className="h-5 w-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                            <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Zone Pic</span>
                          </>
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Zone Name</label>
                          <Input 
                            placeholder="e.g., Machine Room, CF-A"
                            className="bg-gym-darker border-white/10 rounded-xl font-bold"
                            value={section.name}
                            onChange={(e) => handleUpdateSection(section.id, { name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Short Description</label>
                          <Input 
                            placeholder="What's special about this area?"
                            className="bg-gym-darker border-white/10 rounded-xl"
                            value={section.description}
                            onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    {gymSections.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute -right-2 -top-2 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all scale-0 group-hover:scale-100 shadow-lg z-10"
                        onClick={() => handleRemoveSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full h-16 rounded-2xl border-dashed border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 gap-2 font-bold"
                  onClick={handleAddSection}
                >
                  <PlusCircle className="h-5 w-5" /> Add Another Zone
                </Button>
              </div>

              <div className="pt-8 flex justify-between">
                <div />
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-blue-500/20"
                  onClick={saveGym}
                  disabled={gymSections.some(s => !s.name)}
                >
                  Next: Add Equipment <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Equipment */}
          {step === 'equipment' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => setStep('sections')} className="bg-white/5">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-black text-white">Equipment Catalog</h2>
                  <p className="text-sm text-gray-400">Snap pics and list machines for each zone.</p>
                </div>
              </div>

              <Tabs defaultValue={gymSections[0]?.id} className="w-full">
                <TabsList className="bg-white/5 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto overflow-y-hidden custom-scrollbar mb-6">
                  {gymSections.map(section => (
                    <TabsTrigger 
                      key={section.id} 
                      value={section.id}
                      className="rounded-xl px-12 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all font-bold"
                    >
                      {section.name || "Unnamed"}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {gymSections.map(section => (
                  <TabsContent key={section.id} value={section.id} className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {section.equipment.map(eq => (
                        <Card key={eq.id} className="bg-white/[0.03] border-white/5 overflow-hidden animate-in zoom-in-95">
                          <CardContent className="p-4 flex gap-4">
                            <div 
                              className="h-28 w-28 rounded-2xl bg-gym-darker flex flex-col items-center justify-center border border-dashed border-white/10 cursor-pointer hover:bg-white/5 transition-all overflow-hidden shrink-0 group"
                              onClick={() => handleImageUpload(section.id, eq.id)}
                            >
                              {eq.photoUrl ? (
                                <img src={eq.photoUrl} alt={eq.name} className="h-full w-full object-cover" />
                              ) : (
                                <>
                                  <Camera className="h-6 w-6 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                  <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Take Pic</span>
                                </>
                              )}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="Machine Name" 
                                  className="h-10 bg-gym-darker border-white/10 font-bold"
                                  value={eq.name}
                                  onChange={(e) => handleUpdateEquipment(section.id, eq.id, { name: e.target.value })}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 shrink-0 text-gray-500 hover:text-rose-400"
                                  onClick={() => handleRemoveEquipment(section.id, eq.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Select 
                                  value={eq.type} 
                                  onValueChange={(val: any) => handleUpdateEquipment(section.id, eq.id, { type: val })}
                                >
                                  <SelectTrigger className="bg-gym-darker border-white/10 h-10 flex-1">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gym-dark border-white/10">
                                    <SelectItem value="Weights">Weights/Machines</SelectItem>
                                    <SelectItem value="Cardio">Cardio Equipment</SelectItem>
                                    <SelectItem value="No Equipment">Bodyweight Zone</SelectItem>
                                    <SelectItem value="Slide Board">Slide Board</SelectItem>
                                    <SelectItem value="Custom">Other Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-10 w-10 bg-white/5 border-white/10 hover:bg-blue-500/20"
                                  onClick={() => {
                                    setLinkingSectionId(section.id);
                                    setLinkingEquipmentId(eq.id);
                                    setSearchInExistingOpen(true);
                                  }}
                                  title="Search from existing exercises"
                                >
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="h-[128px] rounded-2xl border-dashed border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 flex flex-col gap-2 font-bold"
                        onClick={() => handleAddEquipment(section.id)}
                      >
                        <Plus className="h-6 w-6" />
                        Add Machine to {section.name}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="pt-8 flex justify-end">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-blue-500/20"
                  onClick={async () => {
                    await saveGym(); // Ensure everything is synced to DB
                    setStep('builder');
                  }}
                  disabled={gymSections.every(s => s.equipment.length === 0)}
                >
                  Create Custom Plan <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Builder */}
          {step === 'builder' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 pb-20">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => setStep('equipment')} className="bg-white/5">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-black text-white">Workout Architect</h2>
                  <p className="text-sm text-gray-400">Design a routine using your custom mapped equipment.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Sources */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Layers className="h-4 w-4" /> Available Machines
                    </h3>
                    
                    <div className="space-y-6 h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                      {gymSections
                        .filter(section => !selectedSectionId || section.id === selectedSectionId)
                        .map(section => (
                        <div key={section.id} className="space-y-3">
                          <div className="flex items-center justify-between px-2">
                            <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">{section.name}</h4>
                            {selectedSectionId && (
                              <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">Selected Zone</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {section.equipment.map(eq => (
                              <div 
                                key={eq.id}
                                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 cursor-pointer transition-all group relative overflow-hidden"
                                onClick={() => handleAddToWorkout(section.id, eq)}
                              >
                                <div className="flex gap-3">
                                  <div className="h-12 w-12 rounded-xl bg-gym-darker shrink-0 overflow-hidden">
                                    {eq.photoUrl ? (
                                      <img src={eq.photoUrl} alt={eq.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <Box className="h-5 w-5 text-gray-700" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-sm truncate">{eq.name || "Unnamed Machine"}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{eq.type}</p>
                                  </div>
                                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Plan */}
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/20 space-y-6 h-full flex flex-col">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">New Plan</h3>
                      <Input 
                        placeholder="Workout Name..."
                        className="bg-gym-darker border-white/10 h-12 font-black text-lg"
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                      />
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-1 h-[300px] custom-scrollbar">
                      {builderEntries.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                          <Plus className="h-10 w-10 text-gray-500" />
                          <p className="text-xs font-bold text-gray-500 uppercase">Select items to add</p>
                        </div>
                      ) : (
                        builderEntries.map((entry, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group animate-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[10px] font-black text-gray-600 w-4">{idx + 1}</span>
                              <p className="text-sm font-bold text-white truncate">{entry.name}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500 hover:text-rose-400"
                              onClick={() => setBuilderEntries(builderEntries.filter((_, i) => i !== idx))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    <Button 
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 gap-2 mt-4"
                      onClick={handleSaveWorkout}
                      disabled={builderEntries.length === 0 || !workoutName.trim()}
                    >
                      <Save className="h-5 w-5" /> Save Plan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Finish */}
          {step === 'finish' && (
            <div className="text-center py-12 space-y-8 animate-in zoom-in-95">
              <div className="relative mx-auto h-24 w-24">
                <div className="absolute inset-0 rounded-full bg-blue-500 blur-2xl animate-pulse opacity-50" />
                <div className="relative h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl">
                  <Check className="h-12 w-12 text-white stroke-[3px]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white">Masterpiece Created!</h2>
                <p className="text-gray-400 text-lg">Your custom gym routine is ready and saved to your library.</p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Button 
                  className="bg-white/5 hover:bg-white/10 h-14 px-8 rounded-2xl font-black text-lg border border-white/10"
                  onClick={() => setStep('intro')}
                >
                  Build Another
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 h-14 px-12 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
                  onClick={onClose}
                >
                  Close & View Workouts
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          onChange={onFileChange}
          accept="image/*"
          capture="environment" // Hint for mobile to use camera
        />
      </DialogContent>

      {/* Help Modal */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md bg-gym-darker border-white/10 rounded-3xl p-8">
          <DialogHeader>
            <div className="h-16 w-16 rounded-3xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mb-6">
              <HelpCircle className="h-8 w-8 text-blue-400" />
            </div>
            <DialogTitle className="text-3xl font-black text-white leading-tight">Gym Builder Guide</DialogTitle>
            <CardDescription className="text-lg font-medium text-gray-400 pt-2">
              Learn how to map your sanctuary.
            </CardDescription>
          </DialogHeader>

          <div className="space-y-6 mt-8">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-black">1</div>
              <div>
                <p className="font-bold text-white mb-1">Enter Gym Details</p>
                <p className="text-sm text-gray-400">Choose between an Official Gym or a Home Setup. Add names and locations to manage multiple training grounds.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-black">2</div>
              <div>
                <p className="font-bold text-white mb-1">Map Zones & Sections</p>
                <p className="text-sm text-gray-400">Organize by room or floor. Use names like "Level 2" or "Cardio Wing" to filter later.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-black">3</div>
              <div>
                <p className="font-bold text-white mb-1">Catalog Equipment & Pics</p>
                <p className="text-sm text-gray-400">Use the <Search className="inline h-3 w-3 mx-1"/> icon to link to our library, or snap your own pics of the machines. You can even link a machine and then replace its picture with your own!</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-black">4</div>
              <div>
                <p className="font-bold text-white mb-1">Build Your Routine</p>
                <p className="text-sm text-gray-400 italic">Drag and drop mapped equipment into a sequence. We'll auto-create custom exercises for you based on your mapped machines.</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full mt-10 h-14 bg-blue-600 hover:bg-blue-700 font-black text-lg rounded-2xl"
            onClick={() => setShowHelp(false)}
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={searchInExistingOpen} onOpenChange={setSearchInExistingOpen}>
        <DialogContent className="max-w-md bg-gym-darker border-white/10 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white mb-1">Search Your Exercise Library</DialogTitle>
            <p className="text-sm text-gray-400 mb-3">Find an existing exercise to link to this machine slot.</p>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name (e.g. CFA, CFB, bench...)"
                  className="pl-9 bg-white/5 border-white/10 h-11"
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {["All", "Weights", "Cardio", "Slide Board", "No Equipment"].map(cat => (
                  <button
                    key={cat}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      searchCategoryFilter === cat
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white/5 text-gray-400 border-border hover:border-blue-500/50 hover:text-white"
                    }`}
                    onClick={() => setSearchCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredExistingExercises.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Dumbbell className="h-10 w-10 text-gray-700 mx-auto" />
                <p className="text-gray-500 italic text-sm">No exercises found.</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2">
                  {filteredExistingExercises.length} exercise{filteredExistingExercises.length !== 1 ? "s" : ""} found — tap to link
                </p>
                {filteredExistingExercises.map(ex => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 cursor-pointer transition-all flex items-center gap-3 group"
                    onClick={() => handleSelectExistingExercise(ex)}
                  >
                    <div className="h-12 w-12 rounded-lg bg-gym-darker overflow-hidden shrink-0 border border-white/5">
                      {(ex.startPositionUrl || ex.thumbnailUrl || ex.pictureUrl) ? (
                        <img
                          src={ex.startPositionUrl || ex.thumbnailUrl || ex.pictureUrl}
                          alt={ex.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Dumbbell className="h-4 w-4 text-gray-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{ex.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">{ex.category} · {ex.equipment || "—"}</p>
                    </div>
                    <Plus className="h-5 w-5 text-blue-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CustomGymBuilder;
