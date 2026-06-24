/**
 * Utility functions for formatting values
 */

/**
 * Formats a number to have at most two decimal places.
 * If the number is a whole number, it will not show any decimal places.
 * 
 * @param value - The number to format
 * @returns A string representation of the number with at most two decimal places
 */
export const formatNumber = (value: number): string => {
  // Handle potential NaN or invalid numbers
  if (isNaN(value) || !isFinite(value)) {
    return "0";
  }
  
  // Enforce 2 decimal places max
  const formatted = Number(Math.round(Number(value + 'e2')) + 'e-2').toString();
  return formatted;
};

/**
 * Formats seconds into HH:MM:SS or MM:SS format
 */
export const formatTimeDisplay = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds < 0) return "0:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  const parts = [];
  if (h > 0) parts.push(h);
  parts.push(h > 0 ? m.toString().padStart(2, '0') : m);
  parts.push(s.toString().padStart(2, '0'));
  
  return parts.join(':');
};

/**
 * Parses time string (HH:MM:SS or MM:SS) into total seconds
 */
export const parseTimeInput = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(p => parseInt(p, 10) || 0);
  
  if (parts.length === 3) {
    // HH:MM:SS
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return (parts[0] * 60) + parts[1];
  } else if (parts.length === 1) {
    // Just seconds or whatever
    return parts[0];
  }
  return 0;
};

/**
 * Formats a distance value (miles, kilometers, etc.) with up to two decimal places
 */
export const formatDistance = (value: number, unit?: string): string => {
  const formatted = formatNumber(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

/**
 * Formats a time value in minutes to a readable format
 */
export const formatTime = (minutes: number): string => {
  return `${formatNumber(minutes)} min`;
};

/**
 * Formats a weight value with one decimal place
 * 
 * @param value - The weight value to format
 * @param unit - Optional unit to append (e.g., 'lbs', 'kg')
 * @returns Formatted weight string
 */
export const formatWeight = (value: number, unit?: string): string => {
  const formatted = formatNumber(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

/**
 * Converts a Google Drive sharing URL to a direct image URL with CORS proxy
 * ONLY converts Google Drive URLs, and leaves all other URLs completely unchanged
 * 
 * @param url - The URL to check and potentially convert
 * @returns The proxied direct image URL if it's a Google Drive URL, or the original URL otherwise
 */
export const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url;
  
  // If it's not a Google Drive URL, return it completely unchanged
  if (!url.includes('drive.google.com')) {
    return url;
  }
  
  // Only process Google Drive URLs below this point
  console.log("Converting Google Drive URL:", url);
  
  // Extract the file ID from various Google Drive URL formats
  let fileId: string | null = null;
  
  // Format: /file/d/FILE_ID/view
  const filePathMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (filePathMatch && filePathMatch[1]) {
    fileId = filePathMatch[1];
  }
  
  // Format: id=FILE_ID
  if (!fileId) {
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    }
  }
  
  // If we found a file ID, convert to direct URL
  if (fileId) {
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Proxy the URL to bypass CORS issues
    const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(directUrl)}`;
    console.log("Proxied Google Drive URL:", proxiedUrl);
    
    return proxiedUrl;
  }
  
  // If we couldn't extract a file ID, return the original URL
  return url;
};

/**
 * Formats a 24-hour time string (HH:mm) to a 12-hour format with AM/PM.
 * 
 * @param timeString - The time string to format (e.g., "14:30", "09:00")
 * @returns Formatted time string (e.g., "2:30 PM", "9:00 AM")
 */
export const formatTimeString = (timeString: string): string => {
  console.log('formatTimeString input:', timeString); // for debugging
  if (!timeString || !timeString.includes(':')) {
    return timeString; // Return as is if invalid or empty
  }

  const [hours, minutes] = timeString.split(':');
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  
  if (isNaN(h) || isNaN(m)) {
    return timeString; // Return original if parsing fails
  }
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  
  const formattedMinutes = m < 10 ? '0' + m : m;

  return `${h}:${formattedMinutes} ${ampm}`;
};

/**
 * Calculates calories burned during a workout using MET values
 * @param durationMinutes - Duration of the workout in minutes
 * @param weightKg - Weight of the person in kilograms
 * @param isCardio - Whether the exercise is cardio (true) or weightlifting (false)
 * @returns Calories burned during the workout
 */
export const calculateCalories = (durationMinutes: number, weightKg: number, isCardio: boolean): number => {
  const durationHours = durationMinutes / 60;
  const met = isCardio ? 6.0 : 3.5;
  return Math.round(met * weightKg * durationHours);
};

/**
 * Enhanced calculation for a single set based on its specific metrics
 */
export const calculateCaloriesPerSet = (
    set: any, 
    exercise: any, 
    weightKg: number = 70
): number => {
    const category = (exercise?.category || '').toLowerCase();
    const name = (exercise?.name || '').toLowerCase();
    const isWeight = category === 'weights' || category === 'bodyweight';
    const isCardio = category === 'cardio' || name.includes('treadmill') || name.includes('elliptical');
    
    // 1. Duration estimation in minutes
    let durationMins = (set.duration || set.time || 0) / 60;
    if (durationMins <= 0) {
        if (isWeight && set.reps) durationMins = (set.reps * 4) / 60; // Estimate 4s per rep
        else if (isCardio && set.distance) durationMins = set.distance * 10; // estimate 10 min per mile/km
        else durationMins = 0.5; // default 30 seconds
    }

    // 2. MET value adjustment
    let met = isCardio ? 7.0 : isWeight ? 5.0 : 3.5;
    
    // Intensity adjustments
    if (set.incline && set.incline > 0) met += (set.incline * 0.5);
    if (isWeight && set.weight && set.weight > 50) met *= 1.2; // intense weight lifting

    const calories = met * weightKg * (durationMins / 60);
    return Math.round(calories * 10) / 10; // 1 decimal place
};

/**
 * Formats calories value with the 🔥 emoji
 * @param calories - The number of calories to format
 * @returns Formatted calories string with emoji
 */
export const formatCalories = (calories: number | null): string => {
  if (calories === null || isNaN(calories)) {
    return "🔥 --";
  }
  
  if (calories >= 1000000) {
    return `🔥 ${(calories / 1000000).toFixed(1)}M cal`;
  }
  
  if (calories >= 1000) {
    return `🔥 ${(calories / 1000).toFixed(1)}k cal`;
  }
  
  return `🔥 ${Math.round(calories)} cal`;
};

/**
 * Formats duration in seconds to HH:MM:SS, MM:SS, or M:SS format
 * @param totalSeconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (totalSeconds: number | null): string => {
  if (totalSeconds === null || isNaN(totalSeconds) || totalSeconds <= 0) {
    return "⏱️ --";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `⏱️ ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Formats duration in minutes to HH:MM:SS, MM:SS, or M:SS format  
 * @param totalMinutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatDurationFromMinutes = (totalMinutes: number | null): string => {
  if (totalMinutes === null || isNaN(totalMinutes) || totalMinutes <= 0) {
    return "⏱️ --";
  }

  return formatDuration(totalMinutes * 60);
};

/**
 * Smart device integration preparation functions
 */
export const prepareHealthConnect = (): void => {
  console.log("🔗 Health Connect API Status:", (navigator as any).health || "Not Available");
  // Check for Samsung Health integration capabilities
  if ((navigator as any).health) {
    console.log("✅ Health Connect API detected - Samsung Health integration ready");
  } else {
    console.log("❌ Health Connect API not available - Samsung Health integration not supported");
  }
};

export const prepareGoogleFit = (): void => {
  console.log("🔗 Google Fit API Status:", (window as any).gapi || "Not Available");  
  // Check for Google Fit integration capabilities
  if ((window as any).gapi) {
    console.log("✅ Google APIs detected - Google Fit integration ready");
  } else {
    console.log("❌ Google APIs not available - Google Fit integration not supported");
  }
};

/**
 * Enhanced duration formatting with proper HH:MM:SS, MM:SS, or M:SS format
 * Handles both seconds and minutes input
 */
export const formatWorkoutDuration = (durationInSeconds: number): string => {
  if (!durationInSeconds || durationInSeconds <= 0) {
    return "0:00";
  }

  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};
