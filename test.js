const content = require('fs').readFileSync('components/gdft/lib/data.ts', 'utf-8');
const matches = [...content.matchAll(/name:\s*"([^"]+)"[\s\S]*?startPositionUrl:\s*"([^"]+)"/g)];
matches.slice(0, 10).forEach(m => console.log(m[1], '->', m[2]));
