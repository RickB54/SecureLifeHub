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
    if (typeof window !== 'undefined') {
      const savedUnitSystem = localStorage.getItem('gdft_unitSystem') as UnitSystem | null;
      if (savedUnitSystem) return savedUnitSystem;
    }
    return 'imperial'; // Default to imperial
  });

  const [timerSound, setTimerSoundState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gdft_timerSound');
      return saved !== 'false'; // Default to true
    }
    return true;
  });

  const [timerVibration, setTimerVibrationState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gdft_timerVibration');
      return saved !== 'false'; // Default to true
    }
    return true;
  });

  const [notificationSound, setNotificationSoundState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gdft_notificationSound');
      return saved !== 'false'; // Default to true
    }
    return true;
  });

  const [notificationVibration, setNotificationVibrationState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gdft_notificationVibration');
      return saved !== 'false'; // Default to true
    }
    return true;
  });

  const [defaultRestTime, setDefaultRestTimeState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gdft_defaultRestTime');
      return saved ? parseInt(saved, 10) : 60;
    }
    return 60;
  });

  const [testingModeEnabled, setTestingModeEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTestingMode = localStorage.getItem('gdft_testingModeEnabled');
      return savedTestingMode === 'true';
    }
    return false;
  });

  const [testOverrides, setTestOverridesState] = useState<TestOverrides>(() => {
    if (typeof window !== 'undefined') {
      const savedOverrides = localStorage.getItem('gdft_testOverrides');
      if (savedOverrides) return JSON.parse(savedOverrides);
    }
    return {
      caloriesBurned: null,
      duration: null,
      steps: null
    };
  });
  
  const [voiceLoggingEnabled, setVoiceLoggingEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gdft_voiceLoggingEnabled');
      return saved === 'true'; // Default to false
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('gdft_unitSystem', unitSystem);
  }, [unitSystem]);

  useEffect(() => {
    localStorage.setItem('gdft_timerSound', timerSound.toString());
  }, [timerSound]);

  useEffect(() => {
    localStorage.setItem('gdft_timerVibration', timerVibration.toString());
  }, [timerVibration]);

  useEffect(() => {
    localStorage.setItem('gdft_notificationSound', notificationSound.toString());
  }, [notificationSound]);

  useEffect(() => {
    localStorage.setItem('gdft_notificationVibration', notificationVibration.toString());
  }, [notificationVibration]);

  useEffect(() => {
    localStorage.setItem('gdft_defaultRestTime', defaultRestTime.toString());
  }, [defaultRestTime]);

  useEffect(() => {
    localStorage.setItem('gdft_testingModeEnabled', testingModeEnabled.toString());
  }, [testingModeEnabled]);

  useEffect(() => {
    localStorage.setItem('gdft_testOverrides', JSON.stringify(testOverrides));
  }, [testOverrides]);

  useEffect(() => {
    localStorage.setItem('gdft_voiceLoggingEnabled', voiceLoggingEnabled.toString());
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