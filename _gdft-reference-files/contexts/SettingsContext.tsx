import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type UnitSystem = 'imperial' | 'metric';

interface TestOverrides {
  caloriesBurned: number | null;
  duration: number | null;
  steps: number | null;
}

interface SettingsContextType {
  timerSound: boolean;
  setTimerSound: (enabled: boolean) => void;
  timerVibration: boolean;
  setTimerVibration: (enabled: boolean) => void;
  notificationSound: boolean;
  setNotificationSound: (enabled: boolean) => void;
  notificationVibration: boolean;
  setNotificationVibration: (enabled: boolean) => void;
  defaultRestTime: number;
  setDefaultRestTime: (seconds: number) => void;
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  toggleUnitSystem: () => void;
  testingModeEnabled: boolean;
  setTestingModeEnabled: (enabled: boolean) => void;
  testOverrides: TestOverrides;
  setTestOverrides: (overrides: TestOverrides) => void;
  clearAllOverrides: () => void;
  voiceLoggingEnabled: boolean;
  setVoiceLoggingEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem') as UnitSystem | null;
    return savedUnitSystem || 'imperial'; // Default to imperial
  });

  const [timerSound, setTimerSoundState] = useState<boolean>(() => {
    const saved = localStorage.getItem('timerSound');
    return saved !== 'false'; // Default to true
  });

  const [timerVibration, setTimerVibrationState] = useState<boolean>(() => {
    const saved = localStorage.getItem('timerVibration');
    return saved !== 'false'; // Default to true
  });

  const [notificationSound, setNotificationSoundState] = useState<boolean>(() => {
    const saved = localStorage.getItem('notificationSound');
    return saved !== 'false'; // Default to true
  });

  const [notificationVibration, setNotificationVibrationState] = useState<boolean>(() => {
    const saved = localStorage.getItem('notificationVibration');
    return saved !== 'false'; // Default to true
  });

  const [defaultRestTime, setDefaultRestTimeState] = useState<number>(() => {
    const saved = localStorage.getItem('defaultRestTime');
    return saved ? parseInt(saved, 10) : 60;
  });

  const [testingModeEnabled, setTestingModeEnabledState] = useState<boolean>(() => {
    const savedTestingMode = localStorage.getItem('testingModeEnabled');
    return savedTestingMode === 'true';
  });

  const [testOverrides, setTestOverridesState] = useState<TestOverrides>(() => {
    const savedOverrides = localStorage.getItem('testOverrides');
    return savedOverrides ? JSON.parse(savedOverrides) : {
      caloriesBurned: null,
      duration: null,
      steps: null
    };
  });
  
  const [voiceLoggingEnabled, setVoiceLoggingEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('voiceLoggingEnabled');
    return saved === 'true'; // Default to false
  });

  useEffect(() => {
    localStorage.setItem('unitSystem', unitSystem);
  }, [unitSystem]);

  useEffect(() => {
    localStorage.setItem('timerSound', timerSound.toString());
  }, [timerSound]);

  useEffect(() => {
    localStorage.setItem('timerVibration', timerVibration.toString());
  }, [timerVibration]);

  useEffect(() => {
    localStorage.setItem('notificationSound', notificationSound.toString());
  }, [notificationSound]);

  useEffect(() => {
    localStorage.setItem('notificationVibration', notificationVibration.toString());
  }, [notificationVibration]);

  useEffect(() => {
    localStorage.setItem('defaultRestTime', defaultRestTime.toString());
  }, [defaultRestTime]);

  useEffect(() => {
    localStorage.setItem('testingModeEnabled', testingModeEnabled.toString());
  }, [testingModeEnabled]);

  useEffect(() => {
    localStorage.setItem('testOverrides', JSON.stringify(testOverrides));
  }, [testOverrides]);

  useEffect(() => {
    localStorage.setItem('voiceLoggingEnabled', voiceLoggingEnabled.toString());
  }, [voiceLoggingEnabled]);

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
  };

  const toggleUnitSystem = () => {
    setUnitSystemState((prev) => {
      const newUnit = prev === 'metric' ? 'imperial' : 'metric';
      console.log('SettingsProvider: Toggled to', newUnit);
      return newUnit;
    });
  };

  const setTimerSound = (enabled: boolean) => {
    setTimerSoundState(enabled);
  };

  const setTimerVibration = (enabled: boolean) => {
    setTimerVibrationState(enabled);
  };

  const setNotificationSound = (enabled: boolean) => {
    setNotificationSoundState(enabled);
  };

  const setNotificationVibration = (enabled: boolean) => {
    setNotificationVibrationState(enabled);
  };

  const setDefaultRestTime = (seconds: number) => {
    setDefaultRestTimeState(seconds);
  };

  const setVoiceLoggingEnabled = (enabled: boolean) => {
    setVoiceLoggingEnabledState(enabled);
  };

  const setTestingModeEnabled = (enabled: boolean) => {
    setTestingModeEnabledState(enabled);
  };

  const setTestOverrides = (overrides: TestOverrides) => {
    setTestOverridesState(overrides);
  };

  const clearAllOverrides = () => {
    const clearedOverrides = {
      caloriesBurned: null,
      duration: null,
      steps: null
    };
    setTestOverridesState(clearedOverrides);
  };

  return (
    <SettingsContext.Provider value={{ 
      unitSystem, 
      setUnitSystem, 
      toggleUnitSystem,
      timerSound,
      setTimerSound,
      timerVibration,
      setTimerVibration,
      notificationSound,
      setNotificationSound,
      notificationVibration,
      setNotificationVibration,
      defaultRestTime,
      setDefaultRestTime,
      testingModeEnabled,
      setTestingModeEnabled,
      testOverrides,
      setTestOverrides,
      clearAllOverrides,
      voiceLoggingEnabled,
      setVoiceLoggingEnabled
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};