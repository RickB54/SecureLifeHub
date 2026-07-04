const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'components/gdft/lib/data.ts');
let content = fs.readFileSync(dataFile, 'utf-8');

// Use regex to find all "name:" lines inside the arrays
const matches = [...content.matchAll(/name:\s*"([^"]+)"/g)];
const names = matches.map(m => m[1]);

const uniqueNames = new Set();
const duplicates = [];

let blankNames = 0;

for (const name of names) {
  if (name.trim() === '') {
    blankNames++;
  } else if (uniqueNames.has(name)) {
    duplicates.push(name);
  } else {
    uniqueNames.add(name);
  }
}

console.log("Total unique names:", uniqueNames.size);
console.log("Total duplicates found:", duplicates.length);
if (duplicates.length > 0) {
  console.log("Duplicate names:", duplicates);
}
console.log("Blank names:", blankNames);
