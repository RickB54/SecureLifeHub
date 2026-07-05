const fs = require('fs'); 
const content = fs.readFileSync('components/gdft/lib/data.ts', 'utf-8'); 
const regex = /name:\s*["']([^"']+)["']/g; 
const names = []; 
let match; 
while ((match = regex.exec(content)) !== null) { 
  names.push(match[1]); 
} 
const duplicates = names.filter((item, index) => names.indexOf(item) !== index); 
console.log('Duplicates:', duplicates);
