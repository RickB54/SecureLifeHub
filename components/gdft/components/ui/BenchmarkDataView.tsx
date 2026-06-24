
import React, { useState, useMemo } from 'react';
import { useExercise } from '@/components/gdft/contexts/ExerciseContext';
import { Exercise } from '@/components/gdft/lib/data';
import { Button } from '@/components/gdft/components/ui/button';
import { Input } from '@/components/gdft/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/gdft/components/ui/table';
import { Save, Search, Filter, Dumbbell, Activity, Timer, Footprints, Heart, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/components/gdft/hooks/use-mobile';
import { formatTimeDisplay, parseTimeInput } from '@/components/gdft/lib/formatters';

interface BenchmarkDataViewProps {
    hideHeader?: boolean;
    onSaveSuccess?: () => void;
}

export const BenchmarkDataView = ({ hideHeader = false, onSaveSuccess }: BenchmarkDataViewProps) => {
    const { exercises, updateExercise } = useExercise();
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Local state for edits before saving - storing as strings to allow "HH:MM:SS"
    const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (id: string, field: string, value: string) => {
        setEditedSettings(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || exercises.find(e => e.id === id)?.settings || {}),
                [field]: value
            }
        }));
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const updatePromises = Object.entries(editedSettings).map(([id, settings]) => {
                // Parse strings back to numbers (except time which uses parseTimeInput)
                const parsedSettings: any = {};
                Object.entries(settings).forEach(([key, val]) => {
                    if (key === 'time' || key === 'duration') {
                        parsedSettings[key] = typeof val === 'string' ? parseTimeInput(val) : val;
                    } else {
                        const num = parseFloat(val as string);
                        parsedSettings[key] = isNaN(num) ? 0 : num;
                    }
                });
                return updateExercise(id, { settings: parsedSettings });
            });
            await Promise.all(updatePromises);
            setEditedSettings({});
            toast.success("All benchmark data saved successfully!");
            if (onSaveSuccess) onSaveSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save some benchmarks.");
        } finally {
            setIsSaving(false);
        }
    };

    const sortedAndFilteredExercises = useMemo(() => {
        let result = exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || ex.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        if (sortConfig) {
            result.sort((a: any, b: any) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [exercises, searchQuery, categoryFilter, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderMobileCard = (ex: Exercise) => {
        const current = editedSettings[ex.id] || ex.settings || {};
        const isModified = !!editedSettings[ex.id];
        
        const MetricInput = ({ label, field, icon: Icon, unit }: any) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Icon className="h-3 w-3" />
                    <span>{label} {unit ? `(${unit})` : ''}</span>
                </div>
                <Input 
                    className="h-10 bg-black/40 border-gray-700 text-white"
                    value={field === 'time' || field === 'duration' ? (current[field] !== undefined ? (typeof current[field] === 'number' ? formatTimeDisplay(current[field]) : current[field]) : '') : (current[field] ?? '')}
                    placeholder="--"
                    onChange={(e) => handleInputChange(ex.id, field, e.target.value)}
                />
            </div>
        );

        return (
            <div key={ex.id} className={`p-4 rounded-xl border border-gray-800 mb-4 transition-all ${isModified ? 'bg-gym-blue/10 border-gym-blue/50 ring-1 ring-gym-blue/20' : 'bg-gym-card'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-white">{ex.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold mt-1 inline-block ${
                            ex.category === 'Weights' ? 'bg-amber-600/20 text-amber-500' :
                            ex.category === 'Cardio' ? 'bg-gym-blue/20 text-gym-blue' :
                            ex.category === 'Slide Board' ? 'bg-green-600/20 text-green-500' :
                            'bg-purple-600/20 text-purple-500'
                        }`}>
                            {ex.category}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <MetricInput label="Weight" field="weight" icon={Dumbbell} unit="lbs/kg" />
                    <MetricInput label="Reps" field="reps" icon={Activity} />
                    <MetricInput label="Sets" field="sets" icon={Activity} />
                    <MetricInput label="Time" field="time" icon={Timer} unit="HH:MM:SS" />
                    <MetricInput label="Distance" field="distance" icon={Activity} unit="mi/km" />
                    <MetricInput label="Incline" field="incline" icon={ArrowUpDown} unit="%" />
                    <MetricInput label="Steps" field="steps" icon={Footprints} />
                    <MetricInput label="Avg HR" field="avgHeartRate" icon={Heart} />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gym-darker min-h-0 flex flex-col h-full">
            {!hideHeader && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Benchmark Data</h1>
                        <p className="text-gray-400 text-sm">Set your targets and default values for every exercise</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button 
                            className="flex-1 md:flex-none bg-gym-blue hover:bg-gym-blue-hover text-white" 
                            onClick={handleSaveAll}
                            disabled={Object.keys(editedSettings).length === 0 || isSaving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : `Save Changes (${Object.keys(editedSettings).length})`}
                        </Button>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${hideHeader ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-4 mb-6`}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search exercises..." 
                        className="pl-10 bg-gym-card border-gray-800 text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select 
                        className="w-full bg-gym-card border border-gray-800 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gym-blue"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Weights">Weights</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Slide Board">Slide Board</option>
                        <option value="No Equipment">No Equipment</option>
                    </select>
                </div>
                {hideHeader && (
                    <Button 
                        className="bg-gym-blue hover:bg-gym-blue-hover text-white h-10 col-span-1 md:col-span-2 lg:col-span-1" 
                        onClick={handleSaveAll}
                        disabled={Object.keys(editedSettings).length === 0 || isSaving}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving' : `Save (${Object.keys(editedSettings).length})`}
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                {isMobile ? (
                    <div className="space-y-4">
                        {sortedAndFilteredExercises.map(ex => renderMobileCard(ex))}
                    </div>
                ) : (
                    <div className="bg-gym-card rounded-xl border border-gray-800 overflow-hidden shadow-2xl mb-4">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gym-dark">
                                    <TableRow className="border-gray-800 h-16">
                                        <TableHead className="text-gray-300 w-[200px] cursor-pointer" onClick={() => requestSort('name')}>
                                            <div className="flex items-center">Exercise <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead className="text-gray-300">Category</TableHead>
                                        <TableHead className="text-gray-300 text-center w-[100px]"><div className="flex flex-col items-center"><span>Weight</span><Dumbbell className="h-3 w-3 mt-1 opacity-50" /></div></TableHead>
                                        <TableHead className="text-gray-300 text-center w-[80px]">Reps</TableHead>
                                        <TableHead className="text-gray-300 text-center w-[80px]">Sets</TableHead>
                                        <TableHead className="text-gray-300 text-center w-[120px]"><div className="flex flex-col items-center"><span>Time</span><Timer className="h-3 w-3 mt-1 opacity-50" /></div></TableHead>
                                        <TableHead className="text-gray-300 text-center w-[100px]">Dist</TableHead>
                                        <TableHead className="text-gray-300 text-center w-[100px]">Inc %</TableHead>
                                        <TableHead className="text-gray-300 text-center w-[100px]"><div className="flex flex-col items-center"><span>Steps</span><Footprints className="h-3 w-3 mt-1 opacity-50" /></div></TableHead>
                                        <TableHead className="text-gray-300 text-center w-[100px]"><div className="flex flex-col items-center"><span>Avg HR</span><Heart className="h-3 w-3 mt-1 opacity-50" /></div></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAndFilteredExercises.map((ex) => {
                                        const current = editedSettings[ex.id] || ex.settings || {};
                                        const isModified = !!editedSettings[ex.id];
                                        
                                        const CellInput = ({ field, placeholder }: any) => (
                                            <TableCell className="px-1">
                                                <Input 
                                                    className="h-9 text-center bg-black/30 border-gray-700 text-xs focus:bg-black/50 transition-all font-mono"
                                                    value={field === 'time' || field === 'duration' ? (current[field] !== undefined ? (typeof current[field] === 'number' ? formatTimeDisplay(current[field]) : current[field]) : '') : (current[field] ?? '')}
                                                    placeholder={placeholder || "--"}
                                                    onChange={(e) => handleInputChange(ex.id, field, e.target.value)}
                                                />
                                            </TableCell>
                                        );

                                        return (
                                            <TableRow key={ex.id} className={`border-gray-800 transition-colors hover:bg-white/5 ${isModified ? 'bg-gym-blue/10' : ''}`}>
                                                <TableCell className="font-semibold text-white py-3 min-w-[120px] text-sm">
                                                    {ex.name}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                                        ex.category === 'Weights' ? 'bg-amber-600/20 text-amber-500' :
                                                        ex.category === 'Cardio' ? 'bg-gym-blue/20 text-gym-blue' :
                                                        ex.category === 'Slide Board' ? 'bg-green-600/20 text-green-500' :
                                                        'bg-purple-600/20 text-purple-500'
                                                    }`}>
                                                        {ex.category}
                                                    </span>
                                                </TableCell>
                                                <CellInput field="weight" />
                                                <CellInput field="reps" />
                                                <CellInput field="sets" />
                                                <CellInput field="time" placeholder="0:00" />
                                                <CellInput field="distance" />
                                                <CellInput field="incline" />
                                                <CellInput field="steps" />
                                                <CellInput field="avgHeartRate" />
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
