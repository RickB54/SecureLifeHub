import React, { useState } from 'react';

const VB_W = 400;
const VB_H = 620;

interface MuscleRegion {
  id: string;
  name: string;
  // Center of the clickable zone (for tooltip anchor)
  cx: number;
  cy: number;
  // Width/height of the invisible hit zone
  hw: number; // half-width
  hh: number; // half-height
  side: 'left' | 'right';
  exercises: string[];
}

// Front view: invisible tap zones over each muscle region
// cx/cy = center of the muscle on the body image
const FRONT_REGIONS: MuscleRegion[] = [
  { id: 'shoulders',   name: 'Deltoids',    cx: 140, cy: 148, hw: 28, hh: 22, side: 'left',  exercises: ['Shoulder Press', 'Lateral Raise', 'Front Raise', 'Arnold Press'] },
  { id: 'chest',       name: 'Pectorals',   cx: 200, cy: 175, hw: 38, hh: 28, side: 'right', exercises: ['Bench Press', 'Push-Up', 'Chest Fly', 'Cable Crossover'] },
  { id: 'biceps',      name: 'Biceps',      cx: 262, cy: 218, hw: 20, hh: 28, side: 'right', exercises: ['Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Chin-Up'] },
  { id: 'forearms',    name: 'Forearms',    cx: 278, cy: 278, hw: 18, hh: 28, side: 'right', exercises: ['Wrist Curl', 'Reverse Curl', "Farmer's Walk"] },
  { id: 'abdominals',  name: 'Abdominals',  cx: 200, cy: 252, hw: 30, hh: 35, side: 'right', exercises: ['Crunch', 'Sit-Up', 'Leg Raise', 'Plank'] },
  { id: 'obliques',    name: 'Obliques',    cx: 155, cy: 265, hw: 20, hh: 28, side: 'left',  exercises: ['Russian Twist', 'Side Plank', 'Bicycle Crunch'] },
  { id: 'hip-flexors', name: 'Hip Flexors', cx: 200, cy: 328, hw: 30, hh: 22, side: 'right', exercises: ['Hip Flexor Stretch', 'Leg Raise', 'Mountain Climber', 'Lunge'] },
  { id: 'adductors',   name: 'Adductors',   cx: 195, cy: 398, hw: 22, hh: 28, side: 'left',  exercises: ['Sumo Squat', 'Inner Thigh Machine', 'Side Lunge'] },
  { id: 'quadriceps',  name: 'Quadriceps',  cx: 168, cy: 435, hw: 25, hh: 35, side: 'left',  exercises: ['Squat', 'Leg Press', 'Leg Extension', 'Lunge'] },
  { id: 'calves',      name: 'Calves',      cx: 168, cy: 535, hw: 22, hh: 30, side: 'left',  exercises: ['Calf Raise', 'Seated Calf Raise', 'Jump Rope'] },
];

// Rear view: using coordinates from calibration clicks
const REAR_REGIONS: MuscleRegion[] = [
  { id: 'traps',       name: 'Trapezius',        cx: 200, cy: 115, hw: 35, hh: 25, side: 'right', exercises: ['Shrug', 'Upright Row', 'Face Pull', 'Deadlift'] },
  { id: 'rear-delt',   name: 'Rear Deltoids',    cx: 135, cy: 140, hw: 28, hh: 22, side: 'left',  exercises: ['Reverse Fly', 'Face Pull', 'Bent-Over Lateral Raise'] },
  { id: 'rhomboids',   name: 'Rhomboids',        cx: 200, cy: 168, hw: 32, hh: 25, side: 'right', exercises: ['Seated Row', 'Bent-Over Row', 'Band Pull-Apart'] },
  { id: 'triceps',     name: 'Triceps',          cx: 118, cy: 215, hw: 20, hh: 30, side: 'left',  exercises: ['Tricep Pushdown', 'Skull Crusher', 'Dips', 'Overhead Extension'] },
  { id: 'lats',        name: 'Latissimus Dorsi', cx: 150, cy: 238, hw: 25, hh: 35, side: 'left',  exercises: ['Pull-Up', 'Lat Pulldown', 'Bent-Over Row', 'Cable Row'] },
  { id: 'core',        name: 'Erector Spinae',   cx: 200, cy: 285, hw: 28, hh: 30, side: 'right', exercises: ['Deadlift', 'Back Extension', 'Bird Dog', 'Superman'] },
  { id: 'glutes',      name: 'Glutes',           cx: 200, cy: 355, hw: 40, hh: 35, side: 'right', exercises: ['Hip Thrust', 'Squat', 'Deadlift', 'Glute Bridge', 'Donkey Kick'] },
  { id: 'abductors',   name: 'Abductors',        cx: 148, cy: 395, hw: 22, hh: 28, side: 'left',  exercises: ['Side-Lying Leg Raise', 'Cable Abduction', 'Lateral Band Walk'] },
  { id: 'hamstrings',  name: 'Hamstrings',       cx: 168, cy: 445, hw: 25, hh: 35, side: 'left',  exercises: ['Romanian Deadlift', 'Leg Curl', 'Good Morning', 'Nordic Curl'] },
  { id: 'calves-rear', name: 'Calves',           cx: 232, cy: 530, hw: 22, hh: 30, side: 'right', exercises: ['Calf Raise', 'Seated Calf Raise', 'Jump Rope'] },
];

const MuscleMap: React.FC = () => {
  const [view, setView] = useState<'front' | 'rear'>('front');
  const [active, setActive] = useState<MuscleRegion | null>(null);

  const regions = view === 'front' ? FRONT_REGIONS : REAR_REGIONS;
  const imgSrc = view === 'front'
    ? '/images/anatomy-front.png'
    : '/images/anatomy-rear.png';

  const handleRegionClick = (region: MuscleRegion) => {
    setActive(prev => prev?.id === region.id ? null : region);
  };

  const LINE_LEN = 36;
  const FONT_SIZE = 12;

  return (
    <div className="w-full">
      {/* Toggle */}
      <div className="flex justify-center mb-3 gap-2">
        {(['front', 'rear'] as const).map(v => (
          <button
            key={v}
            onClick={() => { setView(v); setActive(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              view === v
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {v === 'front' ? 'Front View' : 'Rear View'}
          </button>
        ))}
      </div>

      {/* SVG diagram — clean image, invisible tap zones, only active label shown */}
      <div className="w-full max-w-xs mx-auto">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto"
          style={{ display: 'block' }}
        >
          {/* Body image */}
          <image
            href={imgSrc}
            x="0" y="0"
            width={VB_W}
            height={VB_H}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Invisible tap zones — no visual until active */}
          {regions.map(region => (
            <rect
              key={region.id}
              x={region.cx - region.hw}
              y={region.cy - region.hh}
              width={region.hw * 2}
              height={region.hh * 2}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => handleRegionClick(region)}
            />
          ))}

          {/* Only render the active label */}
          {active && (() => {
            const r = active;
            const lineEndX = r.side === 'left' ? r.cx - LINE_LEN : r.cx + LINE_LEN;
            const textX = r.side === 'left' ? lineEndX - 4 : lineEndX + 4;
            const textAnchor = r.side === 'left' ? 'end' : 'start';
            return (
              <g>
                {/* Highlight glow on active zone */}
                <rect
                  x={r.cx - r.hw}
                  y={r.cy - r.hh}
                  width={r.hw * 2}
                  height={r.hh * 2}
                  fill="#38bdf8"
                  fillOpacity="0.18"
                  rx="6"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                {/* Dot */}
                <circle cx={r.cx} cy={r.cy} r={6} fill="#38bdf8" stroke="white" strokeWidth="1.5" />
                {/* Line */}
                <line x1={r.cx} y1={r.cy} x2={lineEndX} y2={r.cy} stroke="#38bdf8" strokeWidth="1.2" opacity="0.9" />
                {/* Label text */}
                <text
                  x={textX} y={r.cy} dy="0.35em"
                  textAnchor={textAnchor}
                  fontSize={FONT_SIZE}
                  fontWeight="700"
                  fontFamily="Inter, system-ui, sans-serif"
                  fill="white"
                  stroke="#05101f"
                  strokeWidth="3"
                  paintOrder="stroke"
                >
                  {r.name}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Info card — only shown when a muscle is selected */}
      {active ? (
        <div className="mt-3 mx-auto max-w-xs bg-gray-800 border border-sky-500/40 rounded-lg p-3 shadow-lg">
          <div className="flex justify-between items-start mb-1.5">
            <h4 className="text-sky-400 font-bold text-sm">{active.name}</h4>
            <button
              onClick={() => setActive(null)}
              className="text-gray-500 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400 text-xs mb-1.5 uppercase tracking-wider font-medium">Example Exercises</p>
          <ul className="space-y-1">
            {active.exercises.map(ex => (
              <li key={ex} className="text-white text-xs flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-sky-400 flex-shrink-0" />
                {ex}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-xs text-gray-500 mt-2">
          Tap a muscle region on the image to see its name and exercises
        </p>
      )}
    </div>
  );
};

export default MuscleMap;
