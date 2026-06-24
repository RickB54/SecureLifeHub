import React, { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MuscleGroup {
  id: string;
  label: string;
  color: string;         // gradient start
  color2: string;        // gradient end
  icon: string;          // emoji / symbol used in the SVG body silhouette
  exercises: string[];
  description: string;
  // Which SVG body parts to highlight (keys into the body path map)
  highlights: string[];
}

// ─── Muscle Group Data ───────────────────────────────────────────────────────

const MUSCLE_GROUPS: MuscleGroup[] = [
  {
    id: 'full-body',
    label: 'Full Body',
    color: '#f97316', color2: '#ea580c',
    icon: '🏋️',
    highlights: ['chest','shoulders','biceps','triceps','abs','quads','hamstrings','glutes','back','calves'],
    exercises: ['Deadlift', 'Clean & Press', 'Burpee', 'Squat', 'Turkish Get-Up'],
    description: 'Engages all major muscle groups for maximum caloric burn and functional strength.',
  },
  {
    id: 'abs',
    label: 'Abs',
    color: '#8b5cf6', color2: '#7c3aed',
    icon: '🔥',
    highlights: ['abs','obliques'],
    exercises: ['Crunch', 'Plank', 'Leg Raise', 'Russian Twist', 'Bicycle Crunch'],
    description: 'Targets the rectus abdominis, transverse abdominis, and obliques for a strong core.',
  },
  {
    id: 'chest',
    label: 'Chest',
    color: '#ef4444', color2: '#dc2626',
    icon: '💪',
    highlights: ['chest'],
    exercises: ['Bench Press', 'Push-Up', 'Chest Fly', 'Cable Crossover', 'Dumbbell Press'],
    description: 'Focuses on the pectoralis major and minor for a powerful, defined chest.',
  },
  {
    id: 'arms',
    label: 'Arms',
    color: '#06b6d4', color2: '#0891b2',
    icon: '💪',
    highlights: ['biceps','triceps','forearms'],
    exercises: ['Bicep Curl', 'Tricep Pushdown', 'Hammer Curl', 'Dips', 'Skull Crusher'],
    description: 'Targets biceps, triceps and forearms for balanced arm development.',
  },
  {
    id: 'legs',
    label: 'Legs',
    color: '#10b981', color2: '#059669',
    icon: '🦵',
    highlights: ['quads','hamstrings','glutes','calves','adductors'],
    exercises: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Calf Raise'],
    description: 'Works the quads, hamstrings, glutes and calves for lower body power.',
  },
  {
    id: 'back',
    label: 'Back',
    color: '#f59e0b', color2: '#d97706',
    icon: '🏃',
    highlights: ['back','traps','lats'],
    exercises: ['Pull-Up', 'Bent-Over Row', 'Lat Pulldown', 'Face Pull', 'Deadlift'],
    description: 'Develops the lats, rhomboids, traps and erector spinae for a wide, strong back.',
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    color: '#3b82f6', color2: '#2563eb',
    icon: '🔝',
    highlights: ['shoulders'],
    exercises: ['Shoulder Press', 'Lateral Raise', 'Front Raise', 'Arnold Press', 'Reverse Fly'],
    description: 'Targets all three deltoid heads for broad, rounded shoulders.',
  },
  {
    id: 'glutes',
    label: 'Glutes',
    color: '#ec4899', color2: '#db2777',
    icon: '🍑',
    highlights: ['glutes','hamstrings'],
    exercises: ['Hip Thrust', 'Glute Bridge', 'Donkey Kick', 'Sumo Squat', 'Cable Kickback'],
    description: 'Isolates the gluteus maximus, medius and minimus for shape and power.',
  },
];

// ─── Mini Body Silhouette SVG ─────────────────────────────────────────────────
// Simple stylized male torso silhouette with muscle zone path IDs
// Each "zone" is a simplified rounded rect / ellipse over the correct body area

const HIGHLIGHT_COLOR = 'rgba(255,80,50,0.82)';
const BASE_BODY = 'rgba(255,255,255,0.08)';

const BodySilhouette: React.FC<{ highlights: string[]; gradient: string }> = ({ highlights, gradient }) => {
  const hi = (id: string) => highlights.includes(id) ? HIGHLIGHT_COLOR : BASE_BODY;

  return (
    <svg viewBox="0 0 100 160" className="w-full h-full" style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`bg-${gradient}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Head */}
      <ellipse cx="50" cy="10" rx="9" ry="10" fill="rgba(255,255,255,0.15)" />
      {/* Neck */}
      <rect x="46" y="18" width="8" height="7" rx="2" fill="rgba(255,255,255,0.12)" />

      {/* Left shoulder */}
      <ellipse cx="33" cy="28" rx="9" ry="7" fill={hi('shoulders')} />
      {/* Right shoulder */}
      <ellipse cx="67" cy="28" rx="9" ry="7" fill={hi('shoulders')} />

      {/* Chest */}
      <rect x="38" y="25" width="24" height="18" rx="5" fill={hi('chest')} />

      {/* Left bicep */}
      <rect x="23" y="28" width="9" height="20" rx="4" fill={hi('biceps')} />
      {/* Right bicep */}
      <rect x="68" y="28" width="9" height="20" rx="4" fill={hi('biceps')} />

      {/* Left forearm */}
      <rect x="20" y="49" width="8" height="18" rx="3" fill={hi('forearms')} />
      {/* Right forearm */}
      <rect x="72" y="49" width="8" height="18" rx="3" fill={hi('forearms')} />

      {/* Left tricep (back of arm — shown on side) */}
      <rect x="23" y="30" width="5" height="18" rx="3" fill={hi('triceps')} style={{ opacity: 0.7 }} />
      {/* Right tricep */}
      <rect x="72" y="30" width="5" height="18" rx="3" fill={hi('triceps')} style={{ opacity: 0.7 }} />

      {/* Abs */}
      <rect x="42" y="44" width="16" height="22" rx="4" fill={hi('abs')} />
      {/* Left oblique */}
      <rect x="36" y="46" width="8" height="18" rx="3" fill={hi('obliques')} />
      {/* Right oblique */}
      <rect x="56" y="46" width="8" height="18" rx="3" fill={hi('obliques')} />

      {/* Back / lats (shown as side flanks) */}
      <rect x="33" y="28" width="7" height="30" rx="3" fill={hi('back')} style={{ opacity: 0.8 }} />
      <rect x="60" y="28" width="7" height="30" rx="3" fill={hi('back')} style={{ opacity: 0.8 }} />
      {/* Lats */}
      <ellipse cx="35" cy="42" rx="6" ry="10" fill={hi('lats')} style={{ opacity: 0.85 }} />
      <ellipse cx="65" cy="42" rx="6" ry="10" fill={hi('lats')} style={{ opacity: 0.85 }} />

      {/* Traps center */}
      <ellipse cx="50" cy="26" rx="10" ry="5" fill={hi('traps')} style={{ opacity: 0.7 }} />

      {/* Hips */}
      <rect x="38" y="65" width="24" height="12" rx="4" fill="rgba(255,255,255,0.10)" />

      {/* Left quad */}
      <rect x="38" y="77" width="10" height="32" rx="5" fill={hi('quads')} />
      {/* Right quad */}
      <rect x="52" y="77" width="10" height="32" rx="5" fill={hi('quads')} />

      {/* Glutes (overlap behind hips) */}
      <ellipse cx="44" cy="74" rx="8" ry="7" fill={hi('glutes')} style={{ opacity: 0.75 }} />
      <ellipse cx="56" cy="74" rx="8" ry="7" fill={hi('glutes')} style={{ opacity: 0.75 }} />

      {/* Adductors (inner thigh) */}
      <rect x="44" y="80" width="6" height="26" rx="3" fill={hi('adductors')} style={{ opacity: 0.8 }} />
      {/* Hamstrings (behind thigh — darker shade) */}
      <rect x="38" y="78" width="10" height="30" rx="4" fill={hi('hamstrings')} style={{ opacity: 0.5 }} />
      <rect x="52" y="78" width="10" height="30" rx="4" fill={hi('hamstrings')} style={{ opacity: 0.5 }} />

      {/* Left calf */}
      <rect x="39" y="110" width="9" height="24" rx="4" fill={hi('calves')} />
      {/* Right calf */}
      <rect x="52" y="110" width="9" height="24" rx="4" fill={hi('calves')} />

      {/* Feet */}
      <ellipse cx="43" cy="136" rx="7" ry="4" fill="rgba(255,255,255,0.10)" />
      <ellipse cx="57" cy="136" rx="7" ry="4" fill="rgba(255,255,255,0.10)" />
    </svg>
  );
};

// ─── Muscle Group Card ────────────────────────────────────────────────────────

const MuscleCard: React.FC<{
  group: MuscleGroup;
  isSelected: boolean;
  onClick: () => void;
}> = ({ group, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-end pb-2 transition-all duration-200 focus:outline-none"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${group.color}, ${group.color2})`
          : 'rgba(255,255,255,0.05)',
        border: isSelected ? `2px solid ${group.color}` : '2px solid rgba(255,255,255,0.08)',
        boxShadow: isSelected ? `0 0 18px ${group.color}55` : 'none',
      }}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md z-10">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Body silhouette */}
      <div className="absolute inset-0 flex items-center justify-center px-2 pt-2" style={{ opacity: isSelected ? 1 : 0.7 }}>
        <BodySilhouette highlights={group.highlights} gradient={group.id} />
      </div>

      {/* Label */}
      <div className="relative z-10 w-full px-1">
        <span
          className="block text-center text-xs font-black tracking-widest uppercase"
          style={{
            color: isSelected ? 'white' : 'rgba(255,255,255,0.85)',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}
        >
          {group.label}
        </span>
      </div>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const COLS = 2; // 2-column grid

const DetailPanel: React.FC<{ group: MuscleGroup; onClose: () => void }> = ({ group, onClose }) => (
  <div
    className="col-span-2 rounded-2xl p-4 shadow-xl"
    style={{
      background: `linear-gradient(135deg, ${group.color}28, ${group.color2}14)`,
      border: `1px solid ${group.color}55`,
    }}
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-bold text-white text-sm">{group.label}</h4>
      <button onClick={onClose} className="text-gray-400 hover:text-white text-xs leading-none">✕</button>
    </div>
    <p className="text-gray-300 text-xs mb-3 leading-relaxed">{group.description}</p>
    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: group.color }}>
      Top Exercises
    </p>
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
      {group.exercises.map(ex => (
        <li key={ex} className="text-white text-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: group.color }} />
          {ex}
        </li>
      ))}
    </ul>
  </div>
);

const MuscleGroupFocus: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const toggle = (id: string) => setSelected(prev => prev === id ? null : id);

  // Split groups into rows of COLS
  const rows: MuscleGroup[][] = [];
  for (let i = 0; i < MUSCLE_GROUPS.length; i += COLS) {
    rows.push(MUSCLE_GROUPS.slice(i, i + COLS));
  }

  // Which row index contains the selected card?
  const selectedIdx = MUSCLE_GROUPS.findIndex(g => g.id === selected);
  const selectedRowIdx = selectedIdx >= 0 ? Math.floor(selectedIdx / COLS) : -1;
  const selectedGroup = selectedIdx >= 0 ? MUSCLE_GROUPS[selectedIdx] : null;

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-white text-center mb-1">Hit Your Focus Areas</h3>
      <p className="text-center text-xs text-gray-400 mb-4">Select a muscle group to explore exercises</p>

      {/* Grid rendered row-by-row so we can inject the detail panel between rows */}
      <div className="grid grid-cols-2 gap-3">
        {rows.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {/* Cards in this row */}
            {row.map(group => (
              <MuscleCard
                key={group.id}
                group={group}
                isSelected={selected === group.id}
                onClick={() => toggle(group.id)}
              />
            ))}
            {/* Detail panel injected immediately after the row that has the selected card */}
            {selectedGroup && selectedRowIdx === rowIdx && (
              <DetailPanel group={selectedGroup} onClose={() => setSelected(null)} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MuscleGroupFocus;

