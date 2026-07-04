const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const dataFile = path.join(__dirname, 'components/gdft/lib/data.ts');
let content = fs.readFileSync(dataFile, 'utf-8');

// I will just use regex to count exactly how many '{' exist inside each array
function countObjects(arrayName) {
  const startIdx = content.indexOf(\`export const \${arrayName}: Exercise[] = [\`);
  if (startIdx === -1) return 0;
  
  let endIdx = content.indexOf('export const', startIdx + 1);
  if (endIdx === -1) endIdx = content.length;
  
  const arrayContent = content.substring(startIdx, endIdx);
  const matches = [...arrayContent.matchAll(/name:/g)];
  return matches.length;
}

const slide = countObjects('slideboardExercises');
const cardio = countObjects('cardioExercises');
const weight = countObjects('weightExercises');
const noEq = countObjects('noEquipmentExercises');

console.log('Slide:', slide);
console.log('Cardio:', cardio);
console.log('Weight:', weight);
console.log('No Eq:', noEq);
console.log('Total:', slide + cardio + weight + noEq);
