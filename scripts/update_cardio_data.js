const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'components', 'gdft', 'lib', 'data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

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

exercises.forEach(ex => {
  const regex = new RegExp("(name:\\\\s*[\\'\\\"]" + ex + "[\\'\\\"],)", "g");
  const slug = slugify(ex);
  const startUrl = '/icons/cardio/animated/' + slug + '-pos1.svg';
  const endUrl = '/icons/cardio/animated/' + slug + '-pos2.svg';
  
  if (!content.includes(startUrl)) {
    content = content.replace(regex, '$1\\n    startPositionUrl: "' + startUrl + '",\\n    endPositionUrl: "' + endUrl + '",');
  }
});

fs.writeFileSync(dataPath, content);
console.log('Updated data.ts with startPositionUrl and endPositionUrl for cardio');
