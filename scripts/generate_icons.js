const fs = require('fs');
const path = require('path');

const exercises = [
  "Abdominal Crunch Machine", "Arnold Press", "Assisted Dip Machine", "Assisted Pull-up Machine",
  "Back Extension Machine", "Barbell Hip Thrusts", "Barbell Lunges", "Barbell Shrugs", "Bench Press", 
  "Bent-Over Rows", "Bulgarian Split Squats", "Cable Bicep Curls", "Cable Biceps Curl",
  "Cable Chest Fly", "Cable Lat Pulldown", "Cable Overhead Tricep Extension", "Cable Tricep Pushdown", 
  "Cable Triceps Pushdown", "Cable Woodchops", "Calf Raises", "Chest Flys", "Chest Press Machine", 
  "Chest-Supported Rows", "Close-Grip Bench Press", "Close-Grip Dumbbell Press", "Concentration Curls", 
  "Deadlifts", "Decline Dumbbell Press", "Dumbbell Curls", "Dumbbell Front Raises", "Dumbbell Lateral Raises", 
  "Dumbbell Pullover", "Dumbbell Rear Delt Flys", "Dumbbell Rows", "Dumbbell Shoulder Press", 
  "Dumbbell Side Bends", "Dumbbell Skull Crushers", "Dumbbell Step-Ups", "Dumbbell Thrusters", 
  "Dumbbell Tricep Kickbacks", "Dumbbell Tricep Overhead Extension", "Face Pulls", "Farmer's Carry", 
  "Goblet Squats", "Hammer Curls", "Hammer Strength MTS Biceps Curl", "Hammer Strength MTS High Row", 
  "Hammer Strength MTS Pull", "Hammer Strength MTS Row", "Hammer Strength MTS Shoulder Press", 
  "Hammer Strength MTS Triceps Extension", "Hip Abduction Machine", "Hip Adduction Machine", "Incline Bench Press", 
  "Incline Dumbbell Curls", "Incline Dumbbell Press", "Kettlebell Goblet Clean", "Kettlebell Swings", 
  "Lat Pulldown Machine", "Lat Pulldowns", "Leg Curls", "Leg Extension Machine", "Leg Extensions", 
  "Leg Press", "Leg Press Machine", "Lunges", "Machine Shoulder Press", "Matrix Cable Machine", 
  "Overhead Press", "Pec Deck / Machine Chest Fly", "Pectoral Fly Machine", "Preacher Curls", "Pull-Ups", 
  "Rear Delt Fly Machine", "Reverse Curls", "Romanian Deadlifts", "Seated Cable Rows", "Seated Leg Curl Machine", 
  "Seated Row Machine", "Squats", "Standing Calf Raise Machine", "Straight-Arm Cable Pulldown", "Sumo Deadlift", 
  "T-Bar Row", "Torso Rotation Machine", "Tricep Dips", "Upright Rows", "Weighted Plank"
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getSVGContent(type, isPos2) {
  const baseSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">`;
  
  let paths = '';
  // Generic minimalist stick figure:
  const head = `<circle cx="50" cy="25" r="8" fill="none" stroke="currentColor" stroke-width="4"/>`;
  const torso = `<line x1="50" y1="33" x2="50" y2="60"/>`;
  let arms = '';
  let legs = '';
  let equipment = '';

  if (type === 'press') {
    // Bench press / overhead press
    legs = `<path d="M50 60 L40 85 M50 60 L60 85" />`;
    if (isPos2) {
      arms = `<path d="M50 40 L35 25 M50 40 L65 25" />`;
      equipment = `<line x1="20" y1="20" x2="80" y2="20" stroke-width="6"/>`;
    } else {
      arms = `<path d="M50 40 L35 45 L35 35 M50 40 L65 45 L65 35" />`;
      equipment = `<line x1="20" y1="35" x2="80" y2="35" stroke-width="6"/>`;
    }
  } else if (type === 'squat') {
    if (isPos2) { // Stand
      legs = `<path d="M50 60 L40 90 M50 60 L60 90" />`;
      arms = `<path d="M50 40 L35 55 M50 40 L65 55" />`;
      equipment = `<line x1="20" y1="30" x2="80" y2="30" stroke-width="6"/>`; // barbell on back
    } else { // Squat down
      legs = `<path d="M50 70 L35 70 L40 95 M50 70 L65 70 L60 95" />`;
      arms = `<path d="M50 45 L35 60 M50 45 L65 60" />`;
      equipment = `<line x1="20" y1="40" x2="80" y2="40" stroke-width="6"/>`;
    }
  } else if (type === 'curl') {
    legs = `<path d="M50 60 L40 90 M50 60 L60 90" />`;
    if (isPos2) {
      arms = `<path d="M50 40 L35 55 L35 40 M50 40 L65 55 L65 40" />`;
      equipment = `<circle cx="35" cy="40" r="4" fill="currentColor"/><circle cx="65" cy="40" r="4" fill="currentColor"/>`;
    } else {
      arms = `<path d="M50 40 L35 55 L35 70 M50 40 L65 55 L65 70" />`;
      equipment = `<circle cx="35" cy="70" r="4" fill="currentColor"/><circle cx="65" cy="70" r="4" fill="currentColor"/>`;
    }
  } else if (type === 'pull') {
    legs = `<path d="M50 60 L40 90 M50 60 L60 90" />`;
    if (isPos2) { // Pulled in
      arms = `<path d="M50 40 L35 50 L40 40 M50 40 L65 50 L60 40" />`;
      equipment = `<line x1="30" y1="40" x2="70" y2="40" stroke-width="4"/>`;
    } else {
      arms = `<path d="M50 40 L30 20 M50 40 L70 20" />`;
      equipment = `<line x1="20" y1="20" x2="80" y2="20" stroke-width="4"/>`;
    }
  } else {
    // Generic movement (deadlift etc)
    if (isPos2) { // Stand
      legs = `<path d="M50 60 L45 90 M50 60 L55 90" />`;
      arms = `<path d="M50 40 L40 60 M50 40 L60 60" />`;
      equipment = `<line x1="30" y1="60" x2="70" y2="60" stroke-width="6"/>`;
    } else { // Bend
      legs = `<path d="M50 65 L40 90 M50 65 L60 90" />`;
      arms = `<path d="M50 45 L40 75 M50 45 L60 75" />`;
      equipment = `<line x1="30" y1="75" x2="70" y2="75" stroke-width="6"/>`;
    }
  }

  paths = head + torso + arms + legs + equipment;
  return baseSVG + paths + `</svg>`;
}

function getType(name) {
  name = name.toLowerCase();
  if (name.includes('press') || name.includes('push')) return 'press';
  if (name.includes('squat') || name.includes('lunge') || name.includes('step')) return 'squat';
  if (name.includes('curl') || name.includes('extension') || name.includes('kickback')) return 'curl';
  if (name.includes('pull') || name.includes('row')) return 'pull';
  return 'generic';
}

const outDir = path.join(__dirname, '..', 'public', 'icons', 'weights', 'animated');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

exercises.forEach(ex => {
  const type = getType(ex);
  const slug = slugify(ex);
  fs.writeFileSync(path.join(outDir, slug + '-pos1.svg'), getSVGContent(type, false));
  fs.writeFileSync(path.join(outDir, slug + '-pos2.svg'), getSVGContent(type, true));
});

console.log('Generated SVGs for 88 exercises');
