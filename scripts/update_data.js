const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'components', 'gdft', 'lib', 'data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

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

exercises.forEach(ex => {
  // Regex to match the block for this exercise. We look for 'name: "ex"' or 'name: 'ex''
  // and insert the urls after the name line if they don't already exist.
  const regex = new RegExp("(name:\\s*[\"']" + ex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "[\"'],)", "g");
  const slug = slugify(ex);
  const startUrl = '/icons/weights/animated/' + slug + '-pos1.svg';
  const endUrl = '/icons/weights/animated/' + slug + '-pos2.svg';
  
  if (!content.includes(startUrl)) {
    content = content.replace(regex, '$1\n    startPositionUrl: "' + startUrl + '",\n    endPositionUrl: "' + endUrl + '",');
  }
});

fs.writeFileSync(dataPath, content);
console.log('Updated data.ts with startPositionUrl and endPositionUrl');
