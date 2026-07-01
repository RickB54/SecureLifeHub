import React, { useEffect, useRef, useState } from 'react';
import { convertGoogleDriveUrl } from '@/components/gdft/lib/formatters';

interface AnimatedExerciseIconProps {
  startPositionUrl: string;
  endPositionUrl?: string;
  alt: string;
  fallbackUrl?: string;
  className?: string;
}

export const AnimatedExerciseIcon: React.FC<AnimatedExerciseIconProps> = ({
  startPositionUrl,
  endPositionUrl,
  alt,
  fallbackUrl,
  className = "h-full w-full object-contain"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPos2, setShowPos2] = useState(false);
  const [pos1Error, setPos1Error] = useState(false);
  const [pos2Error, setPos2Error] = useState(false);

  const parsedStartUrl = startPositionUrl.includes('drive.google.com') 
    ? convertGoogleDriveUrl(startPositionUrl) 
    : startPositionUrl;
    
  const parsedEndUrl = endPositionUrl 
    ? (endPositionUrl.includes('drive.google.com') ? convertGoogleDriveUrl(endPositionUrl) : endPositionUrl)
    : undefined;

  const parsedFallback = fallbackUrl 
    ? (fallbackUrl.includes('drive.google.com') ? convertGoogleDriveUrl(fallbackUrl) : fallbackUrl)
    : undefined;



  // Loop animation when both images are valid
  useEffect(() => {
    let interval: number;

    if (parsedEndUrl && !pos1Error && !pos2Error) {
      interval = window.setInterval(() => {
        setShowPos2((prev) => !prev);
      }, 2000);
    } else {
      setShowPos2(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [parsedEndUrl, pos1Error, pos2Error]);

  if (pos1Error && (!parsedEndUrl || pos2Error) && parsedFallback) {
    return (
      <img
        src={parsedFallback}
        alt={alt}
        className={className}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  // If pos1 fails but pos2 works, show pos2 static.
  // If pos2 fails but pos1 works, show pos1 static.
  // This is handled inherently by the error state toggles below.
  const activeUrl = showPos2 ? parsedEndUrl : parsedStartUrl;
  const showFallbackEnd = showPos2 && pos2Error;
  const showFallbackStart = !showPos2 && pos1Error;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Start Position Image */}
      {!pos1Error && (
        <img
          src={parsedStartUrl}
          alt={alt + " start position"}
          className={`absolute inset-0 transition-opacity duration-300 ${
            showPos2 && !pos2Error ? 'opacity-0' : 'opacity-100'
          } ${className}`}
          onError={() => {
            console.warn(`AnimatedExerciseIcon: Failed to load start pos for ${alt}`);
            setPos1Error(true);
          }}
        />
      )}

      {/* End Position Image */}
      {parsedEndUrl && !pos2Error && (
        <img
          src={parsedEndUrl}
          alt={alt + " end position"}
          className={`absolute inset-0 transition-opacity duration-300 ${
            !showPos2 && !pos1Error ? 'opacity-0' : 'opacity-100'
          } ${className}`}
          onError={() => {
            console.warn(`AnimatedExerciseIcon: Failed to load end pos for ${alt}`);
            setPos2Error(true);
            setShowPos2(false);
          }}
        />
      )}
      
      {/* Static text fallback if everything fails */}
      {pos1Error && (pos2Error || !parsedEndUrl) && !parsedFallback && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gym-dark">
          <span className="text-xs">No img</span>
        </div>
      )}
    </div>
  );
};
