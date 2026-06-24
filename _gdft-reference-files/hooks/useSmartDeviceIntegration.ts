import { useCallback } from 'react';
import { prepareHealthConnect, prepareGoogleFit } from '@/lib/formatters';

/**
 * Hook for smart device integration preparation
 * Prepares the app for Samsung Health/Google Fit integration
 */
export const useSmartDeviceIntegration = () => {
  const checkHealthConnectAvailability = useCallback(() => {
    prepareHealthConnect();
    return !!(navigator as any).health;
  }, []);

  const checkGoogleFitAvailability = useCallback(() => {
    prepareGoogleFit();
    return !!(window as any).gapi;
  }, []);

  const initializeSmartDeviceSync = useCallback(() => {
    console.log("🔗 Initializing smart device sync preparation...");
    
    const healthConnectAvailable = checkHealthConnectAvailability();
    const googleFitAvailable = checkGoogleFitAvailability();
    
    console.log("🔗 Smart Device Status:", {
      healthConnect: healthConnectAvailable,
      googleFit: googleFitAvailable,
      android: navigator.userAgent.includes('Android'),
      ios: navigator.userAgent.includes('iPhone')
    });
    
    return {
      healthConnect: healthConnectAvailable,
      googleFit: googleFitAvailable,
      ready: healthConnectAvailable || googleFitAvailable
    };
  }, [checkHealthConnectAvailability, checkGoogleFitAvailability]);

  return {
    checkHealthConnectAvailability,
    checkGoogleFitAvailability,
    initializeSmartDeviceSync
  };
};