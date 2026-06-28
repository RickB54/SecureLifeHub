const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'components', 'gdft', 'lib', 'data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

const exercises = [
  "Bicycle Crunches", "Bird Dog", "Bodyweight Squats", "Donkey Kicks (Left)", "Donkey Kicks (Right)", 
  "Fire Hydrants (Left)", "Fire Hydrants (Right)", "Glute Bridges", "Inchworms", "Jumping Jacks", 
  "Leg Raises", "Plank", "Plank Shoulder Taps", "Pushups", "Russian Twists", "Side Plank (Left)", 
  "Side Plank (Right)", "Sit-Ups", "Superman Hold", "Tricep Dips (Chair)", "Wall Sit"
];

function slugify(name) {
  let cleanName = name.replace(/\(/g, '').replace(/\)/g, '');
  return cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

exercises.forEach(ex => {
  const escapedEx = ex.replace(/\(/g, '\\\\(').replace(/\)/g, '\\\\)');
  const regex = new RegExp("(name:\\\\s*[\\'\\\"]" + escapedEx + "[\\'\\\"],)", "g");
  
  const slug = slugify(ex);
  const startUrl = '/icons/no-equipment/animated/' + slug + '-pos1.svg';
  const endUrl = '/icons/no-equipment/animated/' + slug + '-pos2.svg';
  
  if (!content.includes(startUrl)) {
    content = content.replace(regex, '$1\\n    startPositionUrl: "' + startUrl + '",\\n    endPositionUrl: "' + endUrl + '",');
  }
});

fs.writeFileSync(dataPath, content);
console.log('Updated data.ts with startPositionUrl and endPositionUrl for no-equipment');
