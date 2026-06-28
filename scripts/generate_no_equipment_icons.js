const fs = require('fs');
const path = require('path');

const exercises = [
  "Bicycle Crunches", "Bird Dog", "Bodyweight Squats", "Donkey Kicks (Left)", "Donkey Kicks (Right)", 
  "Fire Hydrants (Left)", "Fire Hydrants (Right)", "Glute Bridges", "Inchworms", "Jumping Jacks", 
  "Leg Raises", "Plank", "Plank Shoulder Taps", "Pushups", "Russian Twists", "Side Plank (Left)", 
  "Side Plank (Right)", "Sit-Ups", "Superman Hold", "Tricep Dips (Chair)", "Wall Sit"
];

function slugify(name) {
  let cleanName = name.split('(').join('').split(')').join('');
  return cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getSVGContent(name, type, isPos2) {
  const isMirrored = name.includes('(Right)');
  
  const baseSVGStart = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">';
  const groupStart = isMirrored ? '<g transform="scale(-1, 1) translate(-100, 0)">' : '<g>';
  const groupEnd = '</g>';
  const svgEnd = '</svg>';
  
  let paths = '';
  let head = '<circle cx="50" cy="25" r="8" fill="none" stroke="currentColor" stroke-width="4"/>';
  let torso = '<line x1="50" y1="33" x2="50" y2="60"/>';
  let arms = '';
  let legs = '';
  let equipment = '';

  if (type === 'floor_horizontal') {
    head = '<circle cx="25" cy="50" r="8" fill="none" stroke="currentColor" stroke-width="4"/>';
    torso = '<line x1="33" y1="50" x2="60" y2="50"/>';
    legs = '<path d="M60 50 L90 50 M60 50 L85 55" />';
    if (isPos2 && type === 'floor_horizontal') {
      arms = '<path d="M33 50 L33 70 M33 50 L40 70" />'; 
      equipment = '<line x1="10" y1="70" x2="95" y2="70" stroke-width="2"/>';
    } else {
      arms = '<path d="M33 50 L25 80 M33 50 L35 80" />'; 
      equipment = '<line x1="10" y1="80" x2="95" y2="80" stroke-width="2"/>';
    }
  } else if (type === 'floor_up') {
    head = '<circle cx="20" cy="70" r="8" fill="none" stroke="currentColor" stroke-width="4"/>';
    if (isPos2) {
      torso = '<line x1="28" y1="70" x2="55" y2="70"/>'; 
      legs = '<path d="M55 70 L75 50 L90 70" />'; 
      arms = '<path d="M35 70 L50 65" />';
    } else {
      torso = '<line x1="28" y1="70" x2="50" y2="40"/>'; 
      legs = '<path d="M50 40 L70 70 L90 70" />'; 
      arms = '<path d="M35 55 L50 45" />';
    }
    equipment = '<line x1="10" y1="80" x2="95" y2="80" stroke-width="2"/>';
  } else if (type === 'squat') {
    if (isPos2) {
      legs = '<path d="M50 60 L40 90 M50 60 L60 90" />';
      arms = '<path d="M50 40 L35 55 M50 40 L65 55" />';
    } else {
      legs = '<path d="M50 70 L35 70 L40 95 M50 70 L65 70 L60 95" />';
      arms = '<path d="M50 45 L35 60 M50 45 L65 60" />';
    }
    equipment = '<line x1="20" y1="95" x2="80" y2="95" stroke-width="2"/>';
  } else if (type === 'quadruped') {
    head = '<circle cx="25" cy="40" r="8" fill="none" stroke="currentColor" stroke-width="4"/>';
    torso = '<line x1="33" y1="45" x2="65" y2="45"/>'; 
    equipment = '<line x1="10" y1="80" x2="90" y2="80" stroke-width="2"/>';
    if (isPos2) {
      legs = '<path d="M65 45 L65 80 M65 45 L90 40" />'; 
      arms = '<path d="M35 45 L35 80 M35 45 L10 40" />'; 
    } else {
      legs = '<path d="M65 45 L65 80 M65 45 L75 80" />'; 
      arms = '<path d="M35 45 L35 80 M35 45 L40 80" />'; 
    }
  } else {
    if (isPos2) {
      legs = '<path d="M50 60 L30 90 M50 60 L70 90" />';
      arms = '<path d="M50 40 L30 10 M50 40 L70 10" />';
    } else {
      legs = '<path d="M50 65 L45 90 M50 65 L55 90" />';
      arms = '<path d="M50 45 L40 75 M50 45 L60 75" />';
    }
  }

  paths = head + torso + arms + legs + equipment;
  return baseSVGStart + groupStart + paths + groupEnd + svgEnd;
}

function getType(name) {
  name = name.toLowerCase();
  if (name.includes('plank') || name.includes('pushup') || name.includes('inchworm')) return 'floor_horizontal';
  if (name.includes('crunch') || name.includes('sit-up') || name.includes('leg raise') || name.includes('twist') || name.includes('bridge') || name.includes('superman')) return 'floor_up';
  if (name.includes('squat') || name.includes('sit') || name.includes('dip')) return 'squat';
  if (name.includes('dog') || name.includes('kick') || name.includes('hydrant')) return 'quadruped';
  return 'generic';
}

const outDir = path.join(__dirname, '..', 'public', 'icons', 'no-equipment', 'animated');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

exercises.forEach(ex => {
  const type = getType(ex);
  const slug = slugify(ex);
  fs.writeFileSync(path.join(outDir, slug + '-pos1.svg'), getSVGContent(ex, type, false));
  fs.writeFileSync(path.join(outDir, slug + '-pos2.svg'), getSVGContent(ex, type, true));
});

console.log('Generated SVGs for 21 no-equipment exercises');
