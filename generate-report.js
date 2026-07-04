const fs = require('fs');
const content = fs.readFileSync('components/gdft/lib/data.ts', 'utf-8');

// Compile it or manually extract. Let's extract line by line.
const lines = content.split('\n');
const exercises = [];
let currentEx = {};

for (const line of lines) {
  if (line.includes('{')) {
    if (Object.keys(currentEx).length > 2) {
      exercises.push(currentEx);
    }
    currentEx = {};
  }
  
  const nameMatch = line.match(/name:\s*"([^"]+)"/);
  if (nameMatch) currentEx.name = nameMatch[1];
  
  const catMatch = line.match(/category:\s*"([^"]+)"/);
  if (catMatch) currentEx.category = catMatch[1];
  
  const urlMatch = line.match(/startPositionUrl:\s*"([^"]+)"/);
  if (urlMatch) currentEx.url = urlMatch[1];
}
if (Object.keys(currentEx).length > 2) {
  exercises.push(currentEx);
}

const completed = [];
const pending = [];

for (const ex of exercises) {
  if (!ex.name || !ex.category || !ex.url) continue;
  
  if (ex.category === "Slide Board") continue;
  if (/^CF[A-Z]\s/.test(ex.name)) continue;
  
  if (["Weights", "Cardio", "No Equipment"].includes(ex.category)) {
    if (ex.url.endsWith('.svg')) {
      pending.push(ex);
    } else {
      completed.push(ex);
    }
  }
}

let report = `# Exercise Generation Status Report\n\n`;
report += `This list guarantees which files will **not** be touched by the generation script, and which files **will** be generated.\n\n`;
report += `## ✅ Protected (Already Realistic)\n`;
report += `These exercises already have \`.png\`, \`.jpg\`, or external link pictures assigned to them. The script has been strictly programmed to completely ignore them.\n\n`;
report += `| Exercise Name | Current Picture |\n`;
report += `|---|---|\n`;
for (const ex of completed) {
  report += `| ${ex.name} | \`${ex.url}\` |\n`;
}

report += `\n## ⏳ Pending (Will Be Generated)\n`;
report += `These exercises still use the blue stick-figure \`.svg\` files. These are the ONLY files the script will touch.\n\n`;
report += `| Exercise Name | Current Picture |\n`;
report += `|---|---|\n`;
for (const ex of pending) {
  report += `| ${ex.name} | \`${ex.url}\` |\n`;
}

report += `\n\n**Total Protected:** ${completed.length}\n`;
report += `**Total Pending:** ${pending.length}\n`;

fs.writeFileSync('Exercise_Generation_Status_Report.md', report);
console.log(`Protected: ${completed.length}, Pending: ${pending.length}`);
