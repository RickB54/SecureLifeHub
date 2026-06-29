const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'components', 'gdft', 'lib', 'data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const exerciseRegex = /name:\s*(["'])(.+?)\1(?:[\s\S]*?)startPositionUrl:\s*(["'])(.+?)\3,\s*endPositionUrl:\s*(["'])(.+?)\5/g;

let match;
let exercises = [];
while ((match = exerciseRegex.exec(dataContent)) !== null) {
  const name = match[2];
  const url = match[4];
  if (url.startsWith('/icons/')) {
     let cat = 'weights';
     if (url.includes('cardio')) cat = 'cardio';
     if (url.includes('no-equipment')) cat = 'no-equipment';
     exercises.push({ name, category: cat, url });
  }
}

fs.writeFileSync('exercises_dump.json', JSON.stringify(exercises, null, 2));
console.log(`Dumped ${exercises.length} exercises!`);
