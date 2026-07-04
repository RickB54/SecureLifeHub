const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'components/gdft/lib/data.ts');
let content = fs.readFileSync(dataFile, 'utf-8');

function countInArray(arrayName) {
  const regex = new RegExp('export const ' + arrayName + '.*?(?=export const|$)', 's');
  const match = content.match(regex);
  if (!match) return [];
  
  const arrayContent = match[0];
  const matches = [...arrayContent.matchAll(/name:\\s*"([^"]+)"/g)];
  return matches.map(m => m[1]);
}

const slide = countInArray('slideboardExercises');
const cardio = countInArray('cardioExercises');
const weight = countInArray('weightExercises');
const noEq = countInArray('noEquipmentExercises');

const allNames = [...slide, ...cardio, ...weight, ...noEq];
const unique = new Set(allNames);

console.log('Slide:', slide.length);
console.log('Cardio:', cardio.length);
console.log('Weight:', weight.length);
console.log('No Eq:', noEq.length);
console.log('Total Array Length:', allNames.length);
console.log('Unique:', unique.size);

const duplicates = [];
const seen = new Set();
for (const n of allNames) {
  if (seen.has(n)) duplicates.push(n);
  seen.add(n);
}
console.log('Duplicates in Arrays:', duplicates);
