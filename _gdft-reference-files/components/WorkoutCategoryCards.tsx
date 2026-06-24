import React from 'react';
import { cn } from '@/lib/utils';


// High-quality fitness images (Pexels/Unsplash free-to-use URLs)
const WEIGHTS_IMAGE = '/weights_bench_press.png';
const CARDIO_IMAGE =
  'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800';
const NO_EQUIPMENT_IMAGE =
  'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800';
// Slide Board: use local image; Supabase query may override if a better one exists
const SLIDE_BOARD_FALLBACK = '/slide_board_rowing.png';

interface Category {
  type: string;
  label: string;
  image: string;
  gradient: string;
  glowColor: string;
}

interface WorkoutCategoryCardsProps {
  /** Called when a card is clicked. Receives the workout type string. */
  onSelect: (type: string) => void;
  /** Optional: highlight the card whose type matches this value (Calendar use-case). */
  selectedType?: string;
  /** Extra className applied to the grid wrapper. */
  className?: string;
}

const WorkoutCategoryCards: React.FC<WorkoutCategoryCardsProps> = ({
  onSelect,
  selectedType,
  className,
}) => {
  const slideBoardImage = SLIDE_BOARD_FALLBACK;


  const categories: Category[] = [
    {
      type: 'Weights',
      label: 'Weights',
      image: WEIGHTS_IMAGE,
      gradient: 'from-blue-900/70 via-blue-800/40 to-transparent',
      glowColor: 'ring-blue-500',
    },
    {
      type: 'Cardio',
      label: 'Cardio',
      image: CARDIO_IMAGE,
      gradient: 'from-red-900/70 via-red-800/40 to-transparent',
      glowColor: 'ring-red-500',
    },
    {
      type: 'Slide Board',
      label: 'Slide Board',
      image: slideBoardImage,
      gradient: 'from-green-900/70 via-green-800/40 to-transparent',
      glowColor: 'ring-green-500',
    },
    {
      type: 'No Equipment',
      label: 'No Equipment',
      image: NO_EQUIPMENT_IMAGE,
      gradient: 'from-purple-900/70 via-purple-800/40 to-transparent',
      glowColor: 'ring-purple-500',
    },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4',
        className
      )}
    >
      {categories.map((cat) => {
        const isSelected = selectedType === cat.type;
        return (
          <button
            key={cat.type}
            onClick={() => onSelect(cat.type)}
            className={cn(
              // Base layout
              'relative w-full overflow-hidden rounded-xl cursor-pointer',
              // Aspect ratio – wider than tall (16:9 feel)
              'aspect-video',
              // Transition & hover effects
              'transition-all duration-300 ease-out',
              'hover:scale-[1.04] hover:shadow-2xl',
              // Focus ring
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
              // Selected ring (Calendar mode)
              isSelected && `ring-2 ring-offset-2 ring-offset-gray-900 ${cat.glowColor}`
            )}
            aria-label={`Start ${cat.label} workout`}
          >
            {/* Background image */}
            <img
              src={cat.image}
              alt={cat.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                // If image fails to load, show a dark placeholder
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />

            {/* Dark overlay – always present so text is readable */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Gradient overlay from bottom */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-t',
                cat.gradient
              )}
            />

            {/* Hover glow pulse */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/5" />

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
              <span className="block text-white font-bold text-sm sm:text-base drop-shadow-lg tracking-wide">
                {cat.label}
              </span>
            </div>

            {/* Selected checkmark badge */}
            {isSelected && (
              <div className="absolute top-2 right-2 bg-white/90 rounded-full w-5 h-5 flex items-center justify-center shadow">
                <svg
                  className="w-3 h-3 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default WorkoutCategoryCards;
