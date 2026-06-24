// Mocked out to prevent Next.js build errors since this is a web environment.
// Runtime execution is already prevented by the Android platform check.
type HealthDataType = 'steps' | 'calories' | 'heartRate' | 'distance' | 'sleep' | 'weight' | 'oxygenSaturation';
const Health: any = {};
import { HealthMetric } from '@/components/gdft/lib/workoutTypes';

export interface HealthConnectWorkout {
  sourceId: string;
  sourceName: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  caloriesBurned: number;
  distance: number;
  steps: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  workoutType: string;
  avgSpeed?: number;
  smartwatchDistance?: number;
}

export interface HealthConnectMetric {
  date: string;
  steps?: number;
  caloriesBurned?: number;
  distance?: number;
  sleepDurationHours?: number;
  sleepQualityRating?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  bloodOxygen?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  weight?: number;
  stressLevelRating?: number;
}

export interface SyncError {
  type: 'PERMISSION_ERROR' | 'SERVICE_UNAVAILABLE' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
}

const READ_PERMISSIONS: HealthDataType[] = [
  'steps', 
  'calories', 
  'heartRate', 
  'distance', 
  'sleep', 
  'weight',
  'oxygenSaturation'
];

class HealthConnectService {
  private hasPermissions: boolean = false;
  private lastError: SyncError | null = null;

  async initialize(): Promise<boolean> {
    try {
      const platform = (window as any).Capacitor?.getPlatform();
      if (platform !== 'android') {
          return false;
      }

      const available = await Health.isAvailable();
      if (!available.available) {
        this.lastError = { type: 'SERVICE_UNAVAILABLE', message: available.reason || 'Health Connect not available' };
        return false;
      }
      return true;
    } catch (error: any) {
      this.lastError = { type: 'UNKNOWN_ERROR', message: error.message || 'Initialization failed' };
      return false;
    }
  }

  async isHealthConnectAvailable(): Promise<boolean> {
    return await this.initialize();
  }
  
  getLastError(): SyncError | null {
      return this.lastError;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const result = await Health.requestAuthorization({
        read: READ_PERMISSIONS, 
        write: [] 
      });

      this.hasPermissions = result.readAuthorized.length > 0;
      if (!this.hasPermissions) {
          this.lastError = { type: 'PERMISSION_ERROR', message: 'Permissions denied' };
      } else {
          this.lastError = null;
      }
      return this.hasPermissions;
    } catch (error: any) {
      console.error('Error requesting permissions:', error);
      this.lastError = { type: 'PERMISSION_ERROR', message: error.message || 'Permission request failed' };
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const result = await Health.checkAuthorization({
         read: READ_PERMISSIONS 
      });
      this.hasPermissions = result.readAuthorized.length > 0;
      return this.hasPermissions;
    } catch (error: any) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }
  
  async getRecentWorkouts(days: number = 7): Promise<HealthConnectWorkout[]> {
    if (!this.hasPermissions) {
        const permitted = await this.checkPermissions();
        if (!permitted) return [];
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const result = await Health.queryWorkouts({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 50,
        ascending: false
      });

      return result.workouts.map(w => ({
        sourceId: w.sourceId || 'health_connect',
        sourceName: w.sourceName || 'Health Connect',
        duration: w.duration / 60,
        startTime: new Date(w.startDate),
        endTime: new Date(w.endDate),
        caloriesBurned: w.totalEnergyBurned || 0,
        distance: w.totalDistance || 0, 
        smartwatchDistance: w.totalDistance || 0,
        steps: 0, 
        workoutType: w.workoutType,
        avgHeartRate: 0, 
        maxHeartRate: 0,
        avgSpeed: 0
      }));

    } catch (error: any) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  }

  async getHealthMetricsForRange(days: number = 1): Promise<HealthConnectMetric[]> {
    if (!this.hasPermissions) {
        const permitted = await this.checkPermissions();
        if (!permitted) return [];
    }

    const metrics: HealthConnectMetric[] = [];
    const today = new Date();
    
    // We only sync the last few days to avoid heavy load
    for (let i = 0; i < days; i++) {
        const targetDate = new Date();
        targetDate.setDate(today.getDate() - i);
        const dateStr = targetDate.toISOString().split('T')[0];
        
        const dayMetrics: HealthConnectMetric = { date: dateStr };
        
        try {
            const [steps, calories, sleep, heartRate, weight, oxygen] = await Promise.all([
                this.getDailySteps(targetDate),
                this.getDailyCalories(targetDate),
                this.getDailySleep(targetDate),
                this.getHeartRateStats(targetDate),
                this.getLatestWeight(targetDate),
                this.getLatestOxygen(targetDate)
            ]);
            
            dayMetrics.steps = steps;
            dayMetrics.caloriesBurned = calories;
            dayMetrics.sleepDurationHours = sleep;
            dayMetrics.avgHeartRate = heartRate.avg;
            dayMetrics.maxHeartRate = heartRate.max;
            dayMetrics.weight = weight;
            dayMetrics.bloodOxygen = oxygen;
            
            metrics.push(dayMetrics);
        } catch (e) {
            console.error(`Failed to fetch metrics for ${dateStr}:`, e);
        }
    }
    
    return metrics;
  }

  async getDailySteps(date: Date): Promise<number> {
      try {
          const { startDate, endDate } = this.getDayBounds(date);
          const result = await Health.queryAggregated({
              dataType: 'steps',
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              bucket: 'day'
          });
          return result.samples.length > 0 ? result.samples[0].value : 0;
      } catch (e) { return 0; }
  }

  async getDailyCalories(date: Date): Promise<number> {
    try {
        const { startDate, endDate } = this.getDayBounds(date);
        const result = await Health.queryAggregated({
            dataType: 'calories',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            bucket: 'day'
        });
        return result.samples.length > 0 ? result.samples[0].value : 0;
    } catch (e) { return 0; }
  }

  async getDailySleep(date: Date): Promise<number> {
    try {
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(18, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(12, 0, 0, 0);

        const result = await Health.queryAggregated({
            dataType: 'sleep',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            bucket: 'day'
        });
        return result.samples.length > 0 ? result.samples[0].value / 60 : 0; // Usually in minutes
    } catch (e) { return 0; }
  }

  async getHeartRateStats(date: Date): Promise<{ avg: number; max: number }> {
    try {
        const { startDate, endDate } = this.getDayBounds(date);
        const result = await Health.queryAggregated({
            dataType: 'heartRate',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            bucket: 'day',
            aggregation: 'average'
        });
        return { 
            avg: result.samples.length > 0 ? Math.round(result.samples[0].value) : 0,
            max: 0 
        };
    } catch (e) { return { avg: 0, max: 0 }; }
  }

  async getLatestWeight(date: Date): Promise<number | undefined> {
    try {
        const { startDate, endDate } = this.getDayBounds(date);
        const result = await Health.readSamples({
            dataType: 'weight',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 1
        });
        return result.samples.length > 0 ? result.samples[0].value : undefined;
    } catch (e) { return undefined; }
  }

  async getLatestOxygen(date: Date): Promise<number | undefined> {
    try {
        const { startDate, endDate } = this.getDayBounds(date);
        const result = await Health.readSamples({
            dataType: 'oxygenSaturation',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 1
        });
        return result.samples.length > 0 ? result.samples[0].value : undefined;
    } catch (e) { return undefined; }
  }

  private getDayBounds(date: Date) {
      const startDate = new Date(date);
      startDate.setHours(0,0,0,0);
      const endDate = new Date(date);
      endDate.setHours(23,59,59,999);
      return { startDate, endDate };
  }
}

export const healthConnectService = new HealthConnectService();
