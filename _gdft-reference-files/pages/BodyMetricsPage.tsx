import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Upload, Trash2, HelpCircle, TrendingUp, CheckCircle, Scale, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModernHelpDialog } from '@/components/ui/ModernHelpDialog';
import { useSettings, UnitSystem } from '@/contexts/SettingsContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { BodyMeasurement } from '@/lib/workoutTypes';
import { generateId } from '@/lib/data';
import MuscleMap from '@/components/ui/MuscleMap';
import MuscleGroupFocus from '@/components/ui/MuscleGroupFocus';
import { MetricHistoryPopup } from '@/components/ui/MetricHistoryPopup';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, History, Plus, Save, Clock, ChevronDown, List } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BmiData {
  heightFt: string;
  heightIn: string;
  weight: string;
  age: string;
  sex: 'male' | 'female' | '';
}

interface BmiResult {
  value: number;
  category: string;
}

interface BodyMeasurementImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

interface MeasurementValue {
  value: string;
  unit: 'cm' | 'in' | 'kg' | 'lbs' | '%';
}

interface MeasurementsState {
  chest: MeasurementValue;
  waist: MeasurementValue;
  hipsGlutes: MeasurementValue;
  bicepsUnflexed: MeasurementValue;
  bicepsFlexed: MeasurementValue;
  tricepsUnflexed: MeasurementValue;
  tricepsFlexed: MeasurementValue;
  forearms: MeasurementValue;
  calves: MeasurementValue;
  neck: MeasurementValue;
  shoulders: MeasurementValue;
  thighs: MeasurementValue;
  weight: MeasurementValue;
  bodyFatPercentage: MeasurementValue;
  [key: string]: MeasurementValue;
}

const getDefaultUnit = (key: keyof MeasurementsState, globalUnitSystem: UnitSystem): 'cm' | 'in' | 'kg' | 'lbs' | '%' => {
  if (key === 'weight') {
    return globalUnitSystem === 'imperial' ? 'lbs' : 'kg';
  }
  if (key === 'bodyFatPercentage') {
    return '%';
  }
  return globalUnitSystem === 'imperial' ? 'in' : 'cm';
};

const BodyMetricsPage = () => {
  const navigate = useNavigate();
  const { unitSystem } = useSettings();
  const { bodyMeasurements, addBodyMeasurement, updateBodyMeasurement } = useWorkout();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [bmiData, setBmiData] = useState<BmiData>({ heightFt: '', heightIn: '', weight: '', age: '', sex: '' });
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);

  const [measurements, setMeasurements] = useState<MeasurementsState>(() => {
    const initial: MeasurementsState = {
        chest: { value: '', unit: getDefaultUnit('chest', unitSystem) },
        waist: { value: '', unit: getDefaultUnit('waist', unitSystem) },
        hipsGlutes: { value: '', unit: getDefaultUnit('hipsGlutes', unitSystem) },
        bicepsUnflexed: { value: '', unit: getDefaultUnit('bicepsUnflexed', unitSystem) },
        bicepsFlexed: { value: '', unit: getDefaultUnit('bicepsFlexed', unitSystem) },
        tricepsUnflexed: { value: '', unit: getDefaultUnit('tricepsUnflexed', unitSystem) },
        tricepsFlexed: { value: '', unit: getDefaultUnit('tricepsFlexed', unitSystem) },
        forearms: { value: '', unit: getDefaultUnit('forearms', unitSystem) },
        calves: { value: '', unit: getDefaultUnit('calves', unitSystem) },
        neck: { value: '', unit: getDefaultUnit('neck', unitSystem) },
        shoulders: { value: '', unit: getDefaultUnit('shoulders', unitSystem) },
        thighs: { value: '', unit: getDefaultUnit('thighs', unitSystem) },
        weight: { value: '', unit: getDefaultUnit('weight', unitSystem) },
        bodyFatPercentage: { value: '', unit: getDefaultUnit('bodyFatPercentage', unitSystem) },
    };
    return initial;
  });

  const [userImages, setUserImages] = useState<BodyMeasurementImage[]>([]);
  const [diagramImages, setDiagramImages] = useState<BodyMeasurementImage[]>([]);
  const [currentUserImageIndex, setCurrentUserImageIndex] = useState<number>(0);
  const [currentDiagramImageIndex, setCurrentDiagramImageIndex] = useState<number>(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'diagram'; index: number } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [activeGraphMetric, setActiveGraphMetric] = useState<{
    label: string;
    key: string;
    unit: string;
    data: { date: string; value: number }[];
    color: string;
  } | null>(null);

  const colors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899',
  ];

  // ── Load saved aux data (images, BMI) from localStorage on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bodyMetricsData_aux');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userImages)    setUserImages(parsed.userImages);
        if (parsed.diagramImages) setDiagramImages(parsed.diagramImages);
        if (parsed.bmiData)       setBmiData(parsed.bmiData);
        if (parsed.bmiResult)     setBmiResult(parsed.bmiResult);
      }
    } catch (e) {
      console.error('Failed to load local body metrics data:', e);
    }
  }, []);

  // ── Multi-step canvas downsampler — safe for large mobile camera photos ──
  // Instead of decoding a 12MP image fully then scaling (crashes mobile),
  // we halve the image size in steps until we reach the target width.
  const compressImage = (file: File): Promise<string> => {
    const TARGET_WIDTH = 600;
    const QUALITY = 0.65;
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);
          let srcW = img.naturalWidth  || img.width;
          let srcH = img.naturalHeight || img.height;
          // Determine number of halving steps needed
          let w = srcW, h = srcH;
          const steps: [number, number][] = [];
          while (w > TARGET_WIDTH * 1.5) {
            w = Math.ceil(w / 2);
            h = Math.ceil(h / 2);
            steps.push([w, h]);
          }
          // Final target size
          const finalW = Math.min(srcW, TARGET_WIDTH);
          const finalH = Math.round(srcH * (finalW / srcW));
          if (!steps.length) steps.push([finalW, finalH]);
          else steps[steps.length - 1] = [finalW, finalH];

          // Draw through each step
          let currentCanvas = document.createElement('canvas');
          currentCanvas.width = srcW;
          currentCanvas.height = srcH;
          const initCtx = currentCanvas.getContext('2d')!;
          initCtx.drawImage(img, 0, 0);

          for (const [sw, sh] of steps) {
            const next = document.createElement('canvas');
            next.width = sw;
            next.height = sh;
            const ctx = next.getContext('2d')!;
            ctx.drawImage(currentCanvas, 0, 0, sw, sh);
            // Release previous canvas memory
            currentCanvas.width = 0;
            currentCanvas.height = 0;
            currentCanvas = next;
          }

          const result = currentCanvas.toDataURL('image/jpeg', QUALITY);
          currentCanvas.width = 0;
          currentCanvas.height = 0;
          resolve(result);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image failed to load')); };
      img.src = objectUrl;
    });
  };

  useEffect(() => {
    // Load data from WorkoutContext (Supabase) if available
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingMetric = bodyMeasurements.find(m => m.date === dateStr);
    
    if (existingMetric) {
        setMeasurements(prev => ({
            chest: { value: existingMetric.chest?.toString() || '', unit: prev.chest.unit },
            waist: { value: existingMetric.waist?.toString() || '', unit: prev.waist.unit },
            hipsGlutes: { value: existingMetric.hips?.toString() || '', unit: prev.hipsGlutes.unit },
            bicepsUnflexed: { value: existingMetric.biceps?.toString() || '', unit: prev.bicepsUnflexed.unit },
            bicepsFlexed: { value: existingMetric.biceps?.toString() || '', unit: prev.bicepsFlexed.unit },
            tricepsUnflexed: { value: existingMetric.triceps?.toString() || '', unit: prev.tricepsUnflexed.unit },
            tricepsFlexed: { value: existingMetric.triceps?.toString() || '', unit: prev.tricepsFlexed.unit },
            forearms: { value: existingMetric.forearms?.toString() || '', unit: prev.forearms.unit },
            calves: { value: existingMetric.calves?.toString() || '', unit: prev.calves.unit },
            neck: { value: existingMetric.neck?.toString() || '', unit: prev.neck.unit },
            shoulders: { value: existingMetric.shoulders?.toString() || '', unit: prev.shoulders.unit },
            thighs: { value: existingMetric.thighs?.toString() || '', unit: prev.thighs.unit },
            weight: { value: existingMetric.weight?.toString() || '', unit: prev.weight.unit },
            bodyFatPercentage: { value: (existingMetric as any).bodyFatPercentage?.toString() || '', unit: '%' },
        }));
    } else {
        // Reset to empty for new date selection if no data exists
        setMeasurements(prev => {
          const reset: any = ({});
          Object.keys(prev).forEach(key => {
            reset[key] = { value: '', unit: prev[key as keyof MeasurementsState].unit };
          });
          return reset as MeasurementsState;
        });
    }
  }, [bodyMeasurements, selectedDate, unitSystem]);

  const calculateBmi = () => {
    const weightNum = parseFloat(bmiData.weight);
    const heightFtNum = parseFloat(bmiData.heightFt);
    const heightInNum = parseFloat(bmiData.heightIn);

    const weightKg = unitSystem === 'imperial' ? weightNum * 0.453592 : weightNum;
    const totalInches = (heightFtNum * 12) + heightInNum;
    const heightM = unitSystem === 'imperial' ? totalInches * 0.0254 : (totalInches / 39.37); // Assuming cm if not imperial

    if (weightKg > 0 && heightM > 0 && bmiData.age && bmiData.sex) {
      const bmi = weightKg / (heightM * heightM);
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi >= 18.5 && bmi < 25) category = 'Normal weight';
      else if (bmi >= 25 && bmi < 30) category = 'Overweight';
      else category = 'Obesity';
      setBmiResult({ value: parseFloat(bmi.toFixed(1)), category });
    } else {
      toast({ title: 'Error', description: 'Please fill in all BMI fields: height, weight, age, and sex.', variant: 'destructive' });
    }
  };

  const getBmiResultColor = () => {
    if (!bmiResult) return 'text-white';
    switch (bmiResult.category) {
      case 'Underweight':
        return 'text-blue-400';
      case 'Normal weight':
        return 'text-green-400';
      case 'Overweight':
        return 'text-yellow-400';
      case 'Obesity':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const BmiScaleGraph = ({ bmiValue }: { bmiValue: number | null }) => {
    const getIndicatorPosition = () => {
      if (bmiValue === null) return '0%';
      if (bmiValue < 18.5) return `${(bmiValue / 18.5) * 25}%`;
      if (bmiValue < 25) return `${25 + ((bmiValue - 18.5) / 6.5) * 25}%`;
      if (bmiValue < 30) return `${50 + ((bmiValue - 25) / 5) * 25}%`;
      const obesityPercentage = Math.min(((bmiValue - 30) / 10) * 25, 25);
      return `${75 + obesityPercentage}%`;
    };

    return (
      <div className="w-full mt-4">
        <div className="relative w-full h-4 rounded-full overflow-hidden flex">
          <div className="w-1/4 bg-blue-400"></div>
          <div className="w-1/4 bg-green-400"></div>
          <div className="w-1/4 bg-yellow-400"></div>
          <div className="w-1/4 bg-red-400"></div>
          {bmiValue !== null && (
            <div 
              className="absolute top-0 h-full w-1 bg-white transform -translate-x-1/2 shadow-lg"
              style={{ left: getIndicatorPosition() }}
            >
              <div className="absolute -top-6 -left-1/2 transform -translate-x-1/4 w-max px-1 text-xs bg-gray-600 text-white rounded">{bmiValue}</div>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          <div className="w-1/4 text-center">Underweight</div>
          <div className="w-1/4 text-center">Normal</div>
          <div className="w-1/4 text-center">Overweight</div>
          <div className="w-1/4 text-center">Obese</div>
        </div>
      </div>
    );
  };

  const saveMeasurements = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingMetric = bodyMeasurements.find(m => m.date === dateStr);

    const packedData: any = {
        date: dateStr,
        weight: parseFloat(measurements.weight.value),
        chest: parseFloat(measurements.chest.value),
        waist: parseFloat(measurements.waist.value),
        hips: parseFloat(measurements.hipsGlutes.value),
        neck: parseFloat(measurements.neck.value),
        shoulders: parseFloat(measurements.shoulders.value),
        biceps: parseFloat(measurements.bicepsFlexed.value || measurements.bicepsUnflexed.value),
        triceps: parseFloat(measurements.tricepsFlexed.value || measurements.tricepsUnflexed.value),
        forearms: parseFloat(measurements.forearms.value),
        thighs: parseFloat(measurements.thighs.value),
        calves: parseFloat(measurements.calves.value),
        bodyFatPercentage: parseFloat(measurements.bodyFatPercentage.value)
    };

    // Clean up NaN values
    Object.keys(packedData).forEach(key => {
        if (key !== 'date' && isNaN(packedData[key])) delete packedData[key];
    });

    try {
        if (existingMetric) {
            await updateBodyMeasurement(existingMetric.id, packedData);
            toast({ title: 'Success', description: 'Measurements updated in cloud!' });
        } else {
            await addBodyMeasurement(packedData);
            toast({ title: 'Success', description: 'Measurements saved to cloud!' });
        }
        
        // Also keep local fallback for non-structured data (images/BMI form)
        try {
          const localData = { userImages, diagramImages, bmiData, bmiResult };
          localStorage.setItem('bodyMetricsData_aux', JSON.stringify(localData));
        } catch (storageErr) {
          console.warn('localStorage quota exceeded — images may not persist across sessions:', storageErr);
          toast({ title: 'Warning', description: 'Images saved for this session but storage limit reached. Try removing old photos to free space.', variant: 'destructive' });
        }
    } catch(e) {
        console.error(e);
        toast({ title: 'Error', description: 'Failed to save to cloud.', variant: 'destructive' });
    }
  };

  const handleMeasurementChange = (key: keyof MeasurementsState, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const handleUnitChange = (key: keyof MeasurementsState, unit: 'cm' | 'in' | 'kg' | 'lbs' | '%') => {
    setMeasurements(prev => ({
        ...prev,
        [key]: { ...prev[key], unit: unit },
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'user' | 'diagram') => {
    if (!event.target.files || event.target.files.length === 0) return;
    const filesArray = Array.from(event.target.files);
    event.target.value = '';
    setIsUploadingImage(true);
    try {
      for (const file of filesArray) {
        const compressedUrl = await compressImage(file);
        const newImageObject: BodyMeasurementImage = {
          id: generateId(),
          url: compressedUrl,
          title: '',
          description: '',
        };
        if (imageType === 'user') {
          setUserImages(prev => [...prev, newImageObject]);
        } else {
          setDiagramImages(prev => [...prev, newImageObject]);
        }
      }
      toast({ title: 'Photo added!', description: 'Tap Save to keep it.' });
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast({ title: 'Photo Error', description: err?.message || 'Could not process image. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const confirmDeleteImage = (imageType: 'user' | 'diagram', index: number) => {
    setDeleteConfirm({ type: imageType, index });
  };

  const handleDeleteImage = () => {
    if (!deleteConfirm) return;
    const { type: imageType, index } = deleteConfirm;
    let newImages: BodyMeasurementImage[];
    if (imageType === 'user') {
      newImages = userImages.filter((_, i) => i !== index);
      setUserImages(newImages);
      setCurrentUserImageIndex(prevIdx => Math.max(0, Math.min(prevIdx, newImages.length - 1)));
    } else {
      newImages = diagramImages.filter((_, i) => i !== index);
      setDiagramImages(newImages);
      setCurrentDiagramImageIndex(prevIdx => Math.max(0, Math.min(prevIdx, newImages.length - 1)));
    }
    setDeleteConfirm(null);
  };

  const handleImageDetailChange = (
    imageType: 'user' | 'diagram',
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const updater = (prevImages: BodyMeasurementImage[]) =>
      prevImages.map((img, i) => (i === index ? { ...img, [field]: value } : img));

    if (imageType === 'user') {
      setUserImages(updater);
    } else {
      setDiagramImages(updater);
    }
  };
  
  const navigateCarousel = (imageType: 'user' | 'diagram', direction: 'prev' | 'next') => {
    if (imageType === 'user') {
      setCurrentUserImageIndex(prevIndex => {
        const newIndex = direction === 'prev' ? prevIndex - 1 : prevIndex + 1;
        if (newIndex < 0) return userImages.length - 1;
        if (newIndex >= userImages.length) return 0;
        return newIndex;
      });
    } else {
      setCurrentDiagramImageIndex(prevIndex => {
        const newIndex = direction === 'prev' ? prevIndex - 1 : prevIndex + 1;
        if (newIndex < 0) return diagramImages.length - 1;
        if (newIndex >= diagramImages.length) return 0;
        return newIndex;
      });
    }
  };

  const openMetricGraph = (key: string, label: string) => {
    // Map UI key to data key
    const dataKeyMap: { [key: string]: string } = {
      hipsGlutes: 'hips',
      bicepsFlexed: 'biceps',
      bicepsUnflexed: 'biceps',
      tricepsFlexed: 'triceps',
      tricepsUnflexed: 'triceps',
    };

    const actualKey = dataKeyMap[key] || key;
    const unit = measurements[key]?.unit || (key === 'weight' ? (unitSystem === 'imperial' ? 'lbs' : 'kg') : (key === 'bodyFatPercentage' ? '%' : (unitSystem === 'imperial' ? 'in' : 'cm')));
    
    // Extract history and sort by date
    const history = bodyMeasurements
      .filter(m => (m as any)[actualKey] !== undefined && (m as any)[actualKey] !== null && !isNaN(parseFloat((m as any)[actualKey])))
      .map(m => ({
        date: m.date,
        value: parseFloat((m as any)[actualKey])
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const colorIndex = Object.keys(measurements).indexOf(key) % colors.length;

    setActiveGraphMetric({
      label,
      key,
      unit,
      data: history,
      color: colors[colorIndex % colors.length]
    });
    setGraphModalOpen(true);
  };

  const renderImageCarousel = (
    imageType: 'user' | 'diagram',
    images: BodyMeasurementImage[],
    currentIndex: number,
    placeholderText: string
  ) => {
    if (!images || images.length === 0) {
      return <p className="text-center text-gray-400 py-10">{placeholderText}</p>;
    }

    const currentImage = images[currentIndex];
    if (!currentImage) {
      return <p className="text-center text-gray-400 py-10">Error displaying image.</p>;
    }

    return (
      <div className="w-full flex flex-col items-center">
        {/* Image frame */}
        <div className="relative w-full mb-2 rounded-xl overflow-hidden bg-black/40" style={{ minHeight: 180 }}>
          {/* Tap image to fullscreen */}
          <img
            src={currentImage.url}
            alt={currentImage.title || `Photo ${currentIndex + 1}`}
            className="w-full object-contain rounded-xl cursor-pointer shadow-xl"
            style={{ maxHeight: 280 }}
            onClick={() => setFullscreenImage(currentImage.url)}
          />

          {/* Expand hint badge */}
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
            Tap to expand
          </div>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => navigateCarousel(imageType, 'prev')}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-10 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateCarousel(imageType, 'next')}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-10 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Delete — now asks for confirmation */}
          <button
            onClick={() => confirmDeleteImage(imageType, currentIndex)}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md z-20 transition-all"
            title="Delete photo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Counter */}
        <p className="text-center text-xs text-gray-500 mb-2">{currentIndex + 1} / {images.length}</p>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="flex gap-1.5 mb-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => imageType === 'user' ? setCurrentUserImageIndex(i) : setCurrentDiagramImageIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-5 bg-purple-400' : 'w-2 bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}

        <Input
          type="text"
          placeholder="Photo title (optional)"
          value={currentImage.title || ''}
          onChange={(e) => handleImageDetailChange(imageType, currentIndex, 'title', e.target.value)}
          className="mb-2 w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-md"
        />
        <Textarea
          placeholder="Notes / description (optional)"
          value={currentImage.description || ''}
          onChange={(e) => handleImageDetailChange(imageType, currentIndex, 'description', e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-md h-20"
        />
      </div>
    );
  };

  const measurementCategories: { title: string; keys: (keyof MeasurementsState)[] }[] = [
    { title: 'Key Measurements', keys: ['chest', 'waist', 'hipsGlutes', 'weight'] },
    { title: 'Arm Measurements', keys: ['bicepsUnflexed', 'bicepsFlexed', 'tricepsUnflexed', 'tricepsFlexed', 'forearms'] },
    { title: 'Leg Measurements', keys: ['thighs', 'calves'] },
    { title: 'Other Measurements', keys: ['neck', 'shoulders', 'bodyFatPercentage'] }, 
  ];

  const helpPages = [
    {
      title: "Body Metrics Help",
      content: (
        <div className="space-y-4">
          <p>
            On this page, you can track your body measurements, and upload progress photos. All data is stored locally on your device.
          </p>
          
          <div>
            <h4 className="font-semibold text-white mb-2">BMI Calculator:</h4>
            <p>
              The BMI Calculator helps you determine your Body Mass Index based on height, weight, age, and sex. Your BMI is a key indicator of your health, and the result is displayed on a color-coded scale to help you understand your current status.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Measurements:</h4>
            <p>
              Track various body measurements including chest, waist, arms, legs, and other key metrics. All measurements can be recorded in your preferred units.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Progress Photos:</h4>
            <p>
              Upload and organize your progress photos with titles and descriptions to visually track your fitness journey.
            </p>
          </div>
          
          <p className="text-green-400">
            💡 You can save all your data, including your BMI results, using the 'Save All Data' button at the bottom.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen pb-24">
      {/* ── Page Header & Hero ── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-48 md:h-56"
           style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/goal_bg_health.png)',
          backgroundSize: 'cover', backgroundPosition: 'center 30%',
          filter: 'brightness(0.5)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(139,92,246,0.3) 0%, rgba(14,165,233,0.2) 50%, rgba(34,197,94,0.1) 100%)',
        }} />
        
        <div className="relative z-10 h-full flex flex-col justify-center px-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10">
                  <ArrowLeft className="h-6 w-6 text-white" />
                </Button>
                <Scale className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Composition & Measurements</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
                Body Metrics
              </h1>
            </div>
            <Button variant="ghost" size="icon" className="bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10" onClick={() => setIsHelpOpen(true)}>
              <HelpCircle className="h-6 w-6 text-white" />
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-auto pb-4">
            <div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-xl self-start">
              <button 
                onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}
                className="p-2 text-purple-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button className="px-4 font-black text-xs md:text-sm tracking-tight text-white uppercase flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3 text-purple-400" />
                    {format(selectedDate, 'MMM dd, yyyy')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gym-dark border-gray-700 shadow-2xl z-[100]" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="bg-transparent text-white"
                  />
                  <div className="p-2 border-t border-gray-800 flex justify-between">
                    <Button variant="ghost" size="sm" className="text-xs text-purple-400 hover:bg-purple-400/10" onClick={() => setSelectedDate(new Date())}>
                       Today
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <button 
                onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}
                className="p-2 text-purple-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
        
        <ModernHelpDialog
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          pages={helpPages}
          title="Body Metrics Help"
        />
      

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gym-dark border border-gray-800 p-1 h-12 rounded-xl">
          <TabsTrigger value="log" className="data-[state=active]:bg-gym-blue data-[state=active]:text-white rounded-lg transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" /> Log Entry
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gym-purple data-[state=active]:text-white rounded-lg transition-all flex items-center gap-2">
            <History className="h-4 w-4" /> Entry History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-6 focus-visible:ring-0">
          <div className="flex items-center justify-between p-4 bg-gym-blue/10 border border-gym-blue/20 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gym-blue/20 rounded-lg">
                <Clock className="h-5 w-5 text-gym-blue" />
              </div>
              <div>
                <p className="text-xs text-gym-blue font-bold uppercase tracking-wider">Logging for</p>
                <p className="text-lg font-bold text-white">{format(selectedDate, 'EEEE, MMM dd')}</p>
              </div>
            </div>
            {bodyMeasurements.some(m => format(new Date(m.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) && (
               <Badge className="bg-gym-green/20 text-gym-green border-gym-green/30 px-3 py-1">
                 <CheckCircle className="h-3 w-3 mr-1" /> Logged
               </Badge>
            )}
          </div>

      <div className="mb-6 p-4 border border-purple-500 rounded-lg bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-purple-300">BMI Calculator</h3>
          <Button
            onClick={saveMeasurements}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold"
            title="Save entry"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <Label className="text-gray-400">Height</Label>
            <div className="flex gap-2">
              <Input id="heightFt" type="number" placeholder="ft" value={bmiData.heightFt} onChange={(e) => setBmiData({...bmiData, heightFt: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white" />
              <Input id="heightIn" type="number" placeholder="in" value={bmiData.heightIn} onChange={(e) => setBmiData({...bmiData, heightIn: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white" />
            </div>
          </div>
          <div>
            <Label htmlFor="weight-bmi" className="text-gray-400">Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
            <Input id="weight-bmi" type="number" placeholder="Enter weight" value={bmiData.weight} onChange={(e) => setBmiData({...bmiData, weight: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white" />
          </div>
          <div>
            <Label htmlFor="age" className="text-gray-400">Age</Label>
            <Input id="age" type="number" placeholder="Enter age" value={bmiData.age} onChange={(e) => setBmiData({...bmiData, age: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="sex" className="text-gray-400">Sex</Label>
            <select id="sex" value={bmiData.sex} onChange={(e) => setBmiData({...bmiData, sex: e.target.value as BmiData['sex']})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2">
              <option value="">Select Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <Button onClick={calculateBmi} className="w-full bg-purple-600 hover:bg-purple-700 mb-4">Calculate BMI</Button>
        {bmiResult && (
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <p className="text-lg">Your BMI is: <span className={`font-bold text-2xl ${getBmiResultColor()}`}>{bmiResult.value}</span></p>
            <p className={`text-lg font-semibold ${getBmiResultColor()}`}>{bmiResult.category}</p>
          </div>
        )}
        <BmiScaleGraph bmiValue={bmiResult ? bmiResult.value : null} />
      </div>

      {/* Muscle Reference Map */}
      <div className="mb-6 p-4 border border-sky-700 rounded-lg bg-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-1 text-center text-sky-300">Muscle Group Reference</h3>
        <p className="text-center text-xs text-gray-400 mb-4">Tap a muscle label to see exercises that target it</p>
        <MuscleMap />
      </div>

      {/* Muscle Focus Areas Grid */}
      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
        <MuscleGroupFocus />
      </div>

      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-white">Your Picture</h3>
          <Button
            onClick={saveMeasurements}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold"
            title="Save entry"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
        {renderImageCarousel('user', userImages, currentUserImageIndex, 'No picture uploaded yet.')}
        <label htmlFor="user-image-upload" className="block w-full mt-4">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700" disabled={isUploadingImage}>
            <span>
              {isUploadingImage ? (
                <><span className="mr-2 h-4 w-4 inline-block animate-spin rounded-full border-2 border-white border-t-transparent" />Processing...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4 inline" />Upload / Take Picture</>
              )}
            </span>
          </Button>
        </label>
        <Input
          id="user-image-upload"
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={(e) => handleImageUpload(e, 'user')}
          className="hidden"
          disabled={isUploadingImage}
        />
        <p className="text-xs text-gray-500 mt-2 text-center">Tap image to view fullscreen · Images saved locally.</p>
      </div>

      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-center text-white">Measurements</h3>
        {measurementCategories.map(category => (
          <div key={category.title} className="mb-4">
            <h4 className="text-lg font-medium mb-2 text-gray-300 border-b border-gray-700 pb-1">{category.title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {category.keys.map((key) => {
                const keyString = String(key);
                const currentUnit = measurements[key]?.unit || getDefaultUnit(key, unitSystem);
                return (
                  <div key={keyString}>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor={keyString} className="block text-sm font-medium text-gray-400 capitalize">
                        {keyString.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-gym-blue"
                        onClick={() => openMetricGraph(keyString, keyString.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center">
                      <Input
                        id={keyString}
                        type="number" 
                        placeholder={`Enter ${keyString.toLowerCase()}`}
                        value={measurements[key]?.value || ''} 
                        onChange={(e) => handleMeasurementChange(key, e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500 mr-2"
                      />
                      <select 
                          value={currentUnit}
                          onChange={(e) => handleUnitChange(key, e.target.value as 'cm' | 'in' | 'kg' | 'lbs' | '%')}
                          className="bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {key === 'weight' ? (
                          <>
                            <option value="lbs">lbs</option>
                            <option value="kg">kg</option>
                          </>
                        ) : key === 'bodyFatPercentage' ? (
                          <option value="%">%</option>
                        ) : (
                          <>
                            <option value="in">in</option>
                            <option value="cm">cm</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4">
        <Button onClick={saveMeasurements} className="w-full bg-green-600 hover:bg-green-700 text-lg py-4 shadow-lg shadow-green-900/20 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
          <Save className="h-5 w-5" /> Save {format(selectedDate, 'MMM dd')} Entry
        </Button>
      </div>
      </TabsContent>

      <TabsContent value="history" className="focus-visible:ring-0">
        <div className="space-y-4">
          <div className="p-6 bg-gym-dark border border-gray-800 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-gym-purple/20 rounded-lg">
                 <History className="h-6 w-6 text-gym-purple" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white">Your Measurement History</h3>
                  <p className="text-sm text-gray-400">Manage and edit your past logs</p>
               </div>
            </div>

            <div className="space-y-3">
              {[...bodyMeasurements]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((log) => (
                  <div 
                    key={log.id} 
                    className="group bg-gym-card/40 border border-gray-700/50 hover:border-gym-purple/50 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between"
                    onClick={() => {
                        setSelectedDate(new Date(log.date));
                        setActiveTab('log');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gym-darker border border-gray-700 flex flex-col items-center justify-center text-center">
                         <span className="text-[10px] text-gray-500 font-bold uppercase">{format(new Date(log.date), 'MMM')}</span>
                         <span className="text-lg font-bold text-white leading-tight">{format(new Date(log.date), 'dd')}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{format(new Date(log.date), 'EEEE')}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {log.weight && <Badge variant="outline" className="text-[10px] border-gray-700 bg-gray-800/50">{log.weight} {unitSystem === 'imperial' ? 'lbs' : 'kg'}</Badge>}
                          {log.bodyFatPercentage && <Badge variant="outline" className="text-[10px] border-gym-purple/30 bg-gym-purple/10 text-gym-purple">{log.bodyFatPercentage}% BF</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block text-right mr-2">
                        <p className="text-xs text-gray-500">Captured Metrics</p>
                        <p className="text-sm font-medium text-gym-purple">
                          {Object.keys(log).filter(k => k !== 'id' && k !== 'date' && log[k as keyof BodyMeasurement]).length} items
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-500 group-hover:text-white group-hover:bg-gym-purple/20 transition-all">
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
              ))}
              
              {bodyMeasurements.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-2xl">
                   <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <List className="h-8 w-8 text-gray-600" />
                   </div>
                   <p className="text-gray-400">No history found. Start logging your metrics!</p>
                   <Button variant="link" className="text-gym-blue mt-2" onClick={() => setActiveTab('log')}>
                      Go to Log Entry
                   </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>

      {activeGraphMetric && (
        <MetricHistoryPopup
          isOpen={graphModalOpen}
          onClose={() => setGraphModalOpen(false)}
          metricLabel={activeGraphMetric.label}
          unit={activeGraphMetric.unit}
          data={activeGraphMetric.data}
          color={activeGraphMetric.color}
        />
      )}

      {/* ── Fullscreen image overlay ── */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-2"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Full screen"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{ maxHeight: '95dvh' }}
          />
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
            onClick={() => setFullscreenImage(null)}
          >
            <span className="text-xl leading-none font-bold">✕</span>
          </button>
          <p className="absolute bottom-4 text-gray-400 text-sm">Tap anywhere to close</p>
        </div>
      )}

      {/* ── Delete photo confirmation ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-6">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-500/20 rounded-full p-2">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Photo?</h3>
            </div>
            <p className="text-gray-400 text-sm mb-5">This photo will be permanently removed. This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteImage}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMetricsPage;