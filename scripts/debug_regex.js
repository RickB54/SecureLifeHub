const fs = require('fs');
const dataContent = fs.readFileSync('components/gdft/lib/data.ts', 'utf8');
const exerciseRegex = /name:\s*["']([^"']+)["'],(?:\s*category:\s*["'][^"']+["'],)?\s*startPositionUrl:\s*["']([^"']+)["'],\s*endPositionUrl:\s*["']([^"']+)["']/g;
console.log(dataContent.match(exerciseRegex));
