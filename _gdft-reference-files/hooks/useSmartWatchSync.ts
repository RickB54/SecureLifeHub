import { useState, useCallback } from 'react';
import { healthConnectService, type HealthConnectWorkout, type SyncError } from '@/lib/healthConnect';
import { useWorkout } from '@/contexts/WorkoutContext';
import { toast } from 'sonner';

export interface SmartWatchSyncStatus {
  isConnected: boolean;
  lastSyncTime: Date | null;
  isAvailable: boolean;
  hasPermissions: boolean;
  error: SyncError | null;
}

/**
 * Hook for managing smartwatch sync functionality
 * Handles Health Connect integration, permissions, and data synchronization
 */
export const useSmartWatchSync = () => {
  const [syncStatus, setSyncStatus] = useState<SmartWatchSyncStatus>({
    isConnected: false,
    lastSyncTime: null,
    isAvailable: false,
    hasPermissions: false,
    error: null
  });
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { syncSmartwatchWorkouts } = useWorkout();

  /**
   * Initialize Health Connect and check status
   */
  const initializeSync = useCallback(async (): Promise<boolean> => {
    try {
      const isAvailable = await healthConnectService.initialize();
      const hasPermissions = isAvailable ? await healthConnectService.checkPermissions() : false;
      
      const lastSyncString = localStorage.getItem('lastSmartwatchSync');
      const lastSyncTime = lastSyncString ? new Date(lastSyncString) : null;
      
      setSyncStatus({
        isConnected: isAvailable && hasPermissions,
        lastSyncTime,
        isAvailable,
        hasPermissions,
        error: healthConnectService.getLastError()
      });
      
      return isAvailable && hasPermissions;
    } catch (error) {
      console.error('Failed to initialize smartwatch sync:', error);
      return false;
    }
  }, []);

  /**
   * Request Health Connect permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await healthConnectService.requestPermissions();
      
      setSyncStatus(prev => ({
        ...prev,
        hasPermissions: granted,
        isConnected: prev.isAvailable && granted,
        error: healthConnectService.getLastError()
      }));
      
      if (granted) {
        toast.success('Health Connect permissions granted successfully');
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      toast.error('Failed to request Health Connect permissions');
      return false;
    }
  }, []);

  /**
   * Sync all data from smartwatch (Workouts + Metrics)
   */
  const syncWorkouts = useCallback(async (days: number = 7): Promise<void> => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await syncSmartwatchWorkouts();
      
      const now = new Date();
      localStorage.setItem('lastSmartwatchSync', now.toISOString());
      
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: now,
        error: null
      }));
    } catch (error) {
       // Error handled in syncSmartwatchWorkouts toast
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, syncSmartwatchWorkouts]);

  const clearError = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    syncStatus,
    isSyncing,
    initializeSync,
    requestPermissions,
    syncWorkouts,
    clearError
  };
};