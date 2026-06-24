import React, { useState } from "react";
import { Edit, Play, Heart, Trash, Plus, LineChart } from "lucide-react";
import { convertGoogleDriveUrl } from "@/lib/formatters";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getExerciseImageUrl } from "@/lib/utils";

// Update the props interface to include addToWorkout
interface ExerciseCardProps {
  name: string;
  category: string;
  thumbnailUrl?: string;
  pictureUrl?: string;
  onStart: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  isFavorite: boolean;
  addToWorkout?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onViewProgress?: () => void;
}

const ExerciseCard = ({
  name,
  category,
  thumbnailUrl,
  pictureUrl,
  onStart,
  onEdit,
  onToggleFavorite,
  onDelete,
  isFavorite,
  addToWorkout,
  selectionMode,
  isSelected,
  onToggleSelection,
  onViewProgress,
}: ExerciseCardProps) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const imageUrl = pictureUrl || thumbnailUrl;
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    console.error("Image failed to load:", imageUrl);
    setImageError(true);
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectionMode) {
      onToggleSelection?.();
    } else {
      onStart();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };


  return (
    <>
      <div 
        className={`card-glass p-4 mb-4 animate-fadeIn transition-all duration-300 group ${
          isSelected 
            ? 'border-primary ring-1 ring-primary shadow-[0_0_15px_rgba(155,135,245,0.3)] bg-primary/10' 
            : 'border-transparent'
        } ${selectionMode ? 'cursor-pointer hover:bg-gym-card-hover' : ''}`}
        onClick={() => selectionMode && onToggleSelection?.()}
      >
        {/* Two-row layout: image on left spanning both rows; name fills top full-width; category + buttons on bottom row */}
        <div className="flex items-stretch gap-3">
          {/* Thumbnail */}
          <div 
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-md bg-gym-dark flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer relative self-center transition-transform duration-200 will-change-transform group-hover:scale-[2.0] group-hover:z-50 group-hover:shadow-2xl active:scale-[2.0]"
            onClick={(e) => {
              if (imageUrl) {
                e.stopPropagation();
                setShowFullImage(true);
              }
            }}
          >
            {imageUrl && !imageError ? (
              <img 
                src={imageUrl.includes('drive.google.com') ? convertGoogleDriveUrl(imageUrl) : imageUrl} 
                alt={name} 
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center text-muted-foreground">
                <span className="text-xs">No img</span>
              </div>
            )}
            {selectionMode && isSelected && (
              <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                <div className="bg-primary rounded-full p-1">
                  <Plus className="h-4 w-4 text-white rotate-45" />
                </div>
              </div>
            )}
          </div>

          {/* Text + buttons column */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            {/* Row 1: Full-width name */}
            <h3 className="font-medium text-sm sm:text-base leading-tight w-full" title={name}>{name}</h3>

            {/* Row 2: Category on left, buttons on right */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{category}</p>
              <div className="flex items-center flex-shrink-0 gap-0.5">
                <button onClick={handleFavoriteClick} className="bg-gym-dark hover:bg-gym-card-hover rounded-full p-1.5 transition-colors">
                  <Heart className={`h-3.5 w-3.5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </button>
                <button
                  onClick={handleStartClick}
                  className={`rounded-full p-1.5 transition-colors ${
                    selectionMode && isSelected 
                      ? 'bg-primary text-white' 
                      : 'bg-gym-dark hover:bg-gym-card-hover text-muted-foreground'
                  }`}
                >
                  {selectionMode ? (
                    isSelected ? <Plus className="h-3.5 w-3.5 rotate-45" /> : <Plus className="h-3.5 w-3.5" />
                  ) : addToWorkout ? (
                    <Plus className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </button>
                {!selectionMode && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onViewProgress?.();
                      }}
                      className="bg-gym-dark hover:bg-gym-card-hover rounded-full p-1.5 transition-colors"
                      title="View Progress"
                    >
                      <LineChart className="h-3.5 w-3.5 text-blue-400" />
                    </button>
                    <button
                      onClick={handleEditClick}
                      className="bg-gym-dark hover:bg-gym-card-hover rounded-full p-1.5 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={handleDeleteClick} className="bg-gym-dark hover:bg-gym-card-hover rounded-full p-1.5 transition-colors">
                      <Trash className="h-3.5 w-3.5 text-gym-red" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFullImage && imageUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <img 
            src={imageUrl.includes('drive.google.com') ? convertGoogleDriveUrl(imageUrl) : imageUrl} 
            alt={name} 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

export default ExerciseCard;
