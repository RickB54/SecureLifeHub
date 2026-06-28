const fs = require('fs');
const path = require('path');

const exercises = [
  "Battle Ropes", "Box Jumps", "Brisk Walking", "Broad Jumps", "Burpees", "Cycle Sprints", "Cycling",
  "Elliptical Training", "Fast Feet", "High Knees", "Incline Treadmill Walk", "Jump Rope", "Jumping Lunges",
  "Kickboxing Drills", "Lateral Shuffles", "Medicine Ball Slams", "Mountain Climbers", "Power Skips",
  "Rowing", "Rowing Sprints", "Shadow Boxing", "Side-to-Side Hops", "Skater Jumps", "Sprint Intervals",
  "Squat Jumps", "Stair Climbing", "Step Aerobics", "Treadmill Run", "Tuck Jumps", "Zumba Dance"
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getSVGContent(type, isPos2) {
  const baseSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">`;
  
  let paths = '';
  // Generic minimalist stick figure:
  const head = `<circle cx="50" cy="25" r="8" fill="none" stroke="currentColor" stroke-width="4"/>`;
  let torso = `<line x1="50" y1="33" x2="50" y2="60"/>`;
  let arms = '';
  let legs = '';
  let equipment = '';

  if (type === 'run' || type === 'walk') {
    if (isPos2) {
      legs = `<path d="M50 60 L60 90 M50 60 L35 70 L40 90" />`;
      arms = `<path d="M50 40 L65 50 L60 65 M50 40 L35 50 L40 65" />`;
      equipment = type === 'run' ? `<line x1="10" y1="90" x2="90" y2="90" stroke-width="2" stroke-dasharray="4"/>` : '';
    } else {
      legs = `<path d="M50 60 L40 90 M50 60 L65 70 L60 90" />`;
      arms = `<path d="M50 40 L35 50 L40 65 M50 40 L65 50 L60 65" />`;
      equipment = type === 'run' ? `<line x1="10" y1="90" x2="90" y2="90" stroke-width="2" stroke-dasharray="4"/>` : '';
    }
  } else if (type === 'cycle') {
    torso = `<line x1="50" y1="33" x2="60" y2="55"/>`; // lean forward
    if (isPos2) {
      legs = `<path d="M60 55 L70 70 L60 85 M60 55 L50 70 L60 85" />`; // pedaling down
    } else {
      legs = `<path d="M60 55 L50 70 L60 85 M60 55 L70 70 L60 85" />`; // pedaling up
    }
    arms = `<path d="M50 40 L70 50" />`;
    equipment = `<circle cx="75" cy="85" r="10"/><circle cx="45" cy="85" r="10"/><line x1="75" y1="85" x2="70" y2="50"/><line x1="45" y1="85" x2="60" y2="55"/><line x1="60" y1="55" x2="75" y2="85"/>`;
  } else if (type === 'jump') {
    if (isPos2) {
      // mid-air
      head_pos = `<circle cx="50" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="4"/>`;
      torso = `<line x1="50" y1="23" x2="50" y2="50"/>`;
      legs = `<path d="M50 50 L40 70 M50 50 L60 70" />`;
      arms = `<path d="M50 30 L35 15 M50 30 L65 15" />`;
      equipment = `<line x1="20" y1="90" x2="80" y2="90" stroke-width="2"/>`; // floor
      return baseSVG + head_pos + torso + arms + legs + equipment + `</svg>`;
    } else {
      // crouched before jump
      head_pos = `<circle cx="50" cy="40" r="8" fill="none" stroke="currentColor" stroke-width="4"/>`;
      torso = `<line x1="50" y1="48" x2="50" y2="70"/>`;
      legs = `<path d="M50 70 L35 70 L40 90 M50 70 L65 70 L60 90" />`;
      arms = `<path d="M50 55 L35 70 M50 55 L65 70" />`;
      equipment = `<line x1="20" y1="90" x2="80" y2="90" stroke-width="2"/>`; // floor
      return baseSVG + head_pos + torso + arms + legs + equipment + `</svg>`;
    }
  } else if (type === 'row') {
    if (isPos2) {
      // pulled back
      torso = `<line x1="50" y1="33" x2="30" y2="60"/>`; 
      legs = `<path d="M30 60 L70 60 L75 75" />`;
      arms = `<path d="M50 40 L35 50 M50 40 L30 50" />`;
      equipment = `<line x1="10" y1="75" x2="90" y2="75" stroke-width="2"/>`; 
    } else {
      // reached forward
      torso = `<line x1="50" y1="33" x2="70" y2="60"/>`;
      legs = `<path d="M70 60 L45 50 L75 75" />`;
      arms = `<path d="M50 40 L70 50" />`;
      equipment = `<line x1="10" y1="75" x2="90" y2="75" stroke-width="2"/>`; 
    }
  } else {
    // Generic energetic movement (e.g. burpees, battle ropes)
    if (isPos2) { 
      legs = `<path d="M50 60 L30 90 M50 60 L70 90" />`;
      arms = `<path d="M50 40 L20 20 M50 40 L80 20" />`;
    } else { 
      legs = `<path d="M50 65 L40 90 M50 65 L60 90" />`;
      arms = `<path d="M50 45 L35 75 M50 45 L65 75" />`;
    }
  }

  paths = head + torso + arms + legs + equipment;
  return baseSVG + paths + `</svg>`;
}

function getType(name) {
  name = name.toLowerCase();
  if (name.includes('run') || name.includes('sprint') || name.includes('walk') || name.includes('step') || name.includes('climber')) return 'run';
  if (name.includes('cycle') || name.includes('cycling') || name.includes('elliptical')) return 'cycle';
  if (name.includes('jump') || name.includes('skip') || name.includes('hop') || name.includes('burpee')) return 'jump';
  if (name.includes('row')) return 'row';
  return 'generic';
}

const outDir = path.join(__dirname, '..', 'public', 'icons', 'cardio', 'animated');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

exercises.forEach(ex => {
  const type = getType(ex);
  const slug = slugify(ex);
  fs.writeFileSync(path.join(outDir, slug + '-pos1.svg'), getSVGContent(type, false));
  fs.writeFileSync(path.join(outDir, slug + '-pos2.svg'), getSVGContent(type, true));
});

console.log('Generated SVGs for 30 cardio exercises');
