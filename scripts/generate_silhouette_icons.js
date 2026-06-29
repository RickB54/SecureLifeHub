const fs = require('fs');
const path = require('path');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getType(name) {
  name = name.toLowerCase();
  if (name.includes('press') || name.includes('push')) return 'press';
  if (name.includes('squat') || name.includes('lunge') || name.includes('step')) return 'squat';
  if (name.includes('curl') || name.includes('extension') || name.includes('kickback')) return 'curl';
  if (name.includes('pull') || name.includes('row') || name.includes('fly')) return 'pull';
  if (name.includes('run') || name.includes('sprint') || name.includes('walk') || name.includes('climber')) return 'run';
  if (name.includes('cycle') || name.includes('cycling') || name.includes('elliptical')) return 'cycle';
  if (name.includes('jump') || name.includes('skip') || name.includes('hop') || name.includes('burpee') || name.includes('jack')) return 'jump';
  if (name.includes('plank')) return 'plank';
  if (name.includes('crunch') || name.includes('sit-up')) return 'crunch';
  return 'generic';
}

function getSilhouetteSVG(type, isPos2, categoryColor) {
  const baseSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="color: ${categoryColor}">`;
  
  // Base style group for the solid figure
  let content = `<g fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">`;
  
  let head = '';
  let torso = '';
  let arms = '';
  let legs = '';
  let equipment = '';

  const eqStyle = `stroke="#94a3b8" fill="#94a3b8"`; // slate-400 for equipment

  if (type === 'press') {
    head = `<circle cx="50" cy="22" r="9" />`;
    torso = `<line x1="50" y1="36" x2="50" y2="60" stroke-width="16" />`;
    legs = `<path d="M48 58 L40 85 M52 58 L60 85" stroke-width="12" />`;
    if (isPos2) {
      arms = `<path d="M47 38 L35 25 M53 38 L65 25" stroke-width="10" />`;
      equipment = `<line x1="20" y1="20" x2="80" y2="20" stroke-width="6" stroke-linecap="square" stroke="#94a3b8"/>
                   <rect x="20" y="15" width="10" height="10" rx="2" ${eqStyle}/>
                   <rect x="70" y="15" width="10" height="10" rx="2" ${eqStyle}/>`;
    } else {
      arms = `<path d="M47 38 L35 45 L35 35 M53 38 L65 45 L65 35" stroke-width="10" fill="none" />`;
      equipment = `<line x1="20" y1="35" x2="80" y2="35" stroke-width="6" stroke-linecap="square" stroke="#94a3b8"/>
                   <rect x="20" y="30" width="10" height="10" rx="2" ${eqStyle}/>
                   <rect x="70" y="30" width="10" height="10" rx="2" ${eqStyle}/>`;
    }
  } else if (type === 'squat') {
    head = `<circle cx="50" cy="22" r="9" />`;
    torso = `<line x1="50" y1="36" x2="50" y2="60" stroke-width="16" />`;
    if (isPos2) { // Stand
      legs = `<path d="M48 58 L40 88 M52 58 L60 88" stroke-width="12" />`;
      arms = `<path d="M47 38 L35 55 M53 38 L65 55" stroke-width="10" />`;
      equipment = `<line x1="20" y1="30" x2="80" y2="30" stroke-width="6" stroke-linecap="square" stroke="#94a3b8"/>
                   <rect x="20" y="22" width="8" height="16" rx="2" ${eqStyle}/>
                   <rect x="72" y="22" width="8" height="16" rx="2" ${eqStyle}/>`;
    } else { // Squat down
      head = `<circle cx="50" cy="32" r="9" />`;
      torso = `<line x1="50" y1="46" x2="50" y2="70" stroke-width="16" />`;
      legs = `<path d="M48 68 L35 68 L40 92 M52 68 L65 68 L60 92" stroke-width="12" fill="none" />`;
      arms = `<path d="M47 48 L35 60 M53 48 L65 60" stroke-width="10" />`;
      equipment = `<line x1="20" y1="40" x2="80" y2="40" stroke-width="6" stroke-linecap="square" stroke="#94a3b8"/>
                   <rect x="20" y="32" width="8" height="16" rx="2" ${eqStyle}/>
                   <rect x="72" y="32" width="8" height="16" rx="2" ${eqStyle}/>`;
    }
  } else if (type === 'curl') {
    head = `<circle cx="50" cy="22" r="9" />`;
    torso = `<line x1="50" y1="36" x2="50" y2="60" stroke-width="16" />`;
    legs = `<path d="M48 58 L40 88 M52 58 L60 88" stroke-width="12" />`;
    if (isPos2) {
      arms = `<path d="M47 38 L35 55 L35 38 M53 38 L65 55 L65 38" stroke-width="10" fill="none" />`;
      equipment = `<circle cx="35" cy="38" r="5" ${eqStyle}/><circle cx="65" cy="38" r="5" ${eqStyle}/>`;
    } else {
      arms = `<path d="M47 38 L35 55 L35 70 M53 38 L65 55 L65 70" stroke-width="10" fill="none" />`;
      equipment = `<circle cx="35" cy="70" r="5" ${eqStyle}/><circle cx="65" cy="70" r="5" ${eqStyle}/>`;
    }
  } else if (type === 'pull') {
    head = `<circle cx="50" cy="22" r="9" />`;
    torso = `<line x1="50" y1="36" x2="50" y2="60" stroke-width="16" />`;
    legs = `<path d="M48 58 L40 88 M52 58 L60 88" stroke-width="12" />`;
    if (isPos2) { // Pulled in
      arms = `<path d="M47 38 L35 50 L40 40 M53 38 L65 50 L60 40" stroke-width="10" fill="none" />`;
      equipment = `<line x1="30" y1="40" x2="70" y2="40" stroke-width="6" stroke="#94a3b8"/>`;
    } else {
      arms = `<path d="M47 38 L30 20 M53 38 L70 20" stroke-width="10" />`;
      equipment = `<line x1="20" y1="20" x2="80" y2="20" stroke-width="6" stroke="#94a3b8"/>`;
    }
  } else if (type === 'run') {
    head = `<circle cx="50" cy="22" r="9" />`;
    torso = `<line x1="50" y1="36" x2="50" y2="60" stroke-width="16" />`;
    if (isPos2) {
      legs = `<path d="M48 58 L60 85 M52 58 L35 70 L40 85" stroke-width="12" fill="none" />`;
      arms = `<path d="M47 38 L65 48 L60 62 M53 38 L35 48 L40 62" stroke-width="10" fill="none" />`;
    } else {
      legs = `<path d="M48 58 L40 85 M52 58 L65 70 L60 85" stroke-width="12" fill="none" />`;
      arms = `<path d="M47 38 L35 48 L40 62 M53 38 L65 48 L60 62" stroke-width="10" fill="none" />`;
    }
  } else if (type === 'cycle') {
    head = `<circle cx="65" cy="30" r="9" />`;
    torso = `<line x1="50" y1="40" x2="65" y2="55" stroke-width="16" />`; // lean forward
    if (isPos2) {
      legs = `<path d="M50 55 L65 70 L55 85 M50 55 L40 70 L55 85" stroke-width="12" fill="none" />`; // pedaling down
    } else {
      legs = `<path d="M50 55 L40 70 L55 85 M50 55 L65 70 L55 85" stroke-width="12" fill="none" />`; // pedaling up
    }
    arms = `<path d="M60 45 L80 55" stroke-width="10" />`;
    equipment = `<circle cx="75" cy="85" r="12" fill="none" stroke="#94a3b8" stroke-width="4"/>
                 <circle cx="35" cy="85" r="12" fill="none" stroke="#94a3b8" stroke-width="4"/>
                 <line x1="75" y1="85" x2="70" y2="55" stroke="#94a3b8" stroke-width="4"/>
                 <line x1="35" y1="85" x2="50" y2="55" stroke="#94a3b8" stroke-width="4"/>
                 <line x1="50" y1="55" x2="80" y2="55" stroke="#94a3b8" stroke-width="4"/>`;
  } else if (type === 'jump') {
    if (isPos2) { // mid-air
      head = `<circle cx="50" cy="15" r="9" />`;
      torso = `<line x1="50" y1="29" x2="50" y2="50" stroke-width="16" />`;
      legs = `<path d="M48 48 L35 65 M52 48 L65 65" stroke-width="12" />`;
      arms = `<path d="M47 32 L30 15 M53 32 L70 15" stroke-width="10" />`;
      equipment = `<line x1="20" y1="90" x2="80" y2="90" stroke-width="4" stroke="#e2e8f0"/>`; // floor
    } else { // crouched before jump
      head = `<circle cx="50" cy="40" r="9" />`;
      torso = `<line x1="50" y1="54" x2="50" y2="70" stroke-width="16" />`;
      legs = `<path d="M48 68 L35 68 L40 88 M52 68 L65 68 L60 88" stroke-width="12" fill="none" />`;
      arms = `<path d="M47 56 L35 70 M53 56 L65 70" stroke-width="10" />`;
      equipment = `<line x1="20" y1="90" x2="80" y2="90" stroke-width="4" stroke="#e2e8f0"/>`; // floor
    }
  } else if (type === 'plank') {
    head = `<circle cx="80" cy="65" r="9" />`;
    if (isPos2) { // slightly shifted or tapped
      torso = `<line x1="75" y1="65" x2="40" y2="75" stroke-width="16" />`;
      legs = `<path d="M40 75 L15 85 M40 75 L20 85" stroke-width="12" />`;
      arms = `<path d="M70 65 L70 85 M70 65 L55 60" stroke-width="10" fill="none" />`; // one arm tapped up
    } else {
      torso = `<line x1="75" y1="65" x2="40" y2="75" stroke-width="16" />`;
      legs = `<path d="M40 75 L15 85" stroke-width="12" />`;
      arms = `<path d="M70 65 L70 85 M75 65 L75 85" stroke-width="10" />`;
    }
    equipment = `<line x1="10" y1="90" x2="90" y2="90" stroke-width="4" stroke="#e2e8f0"/>`;
  } else if (type === 'crunch') {
    head = `<circle cx="30" cy="80" r="9" />`;
    if (isPos2) { // crunched up
      head = `<circle cx="45" cy="55" r="9" />`;
      torso = `<path d="M40 65 Q50 75 70 85" stroke-width="16" fill="none" />`;
      legs = `<path d="M70 85 L85 65 L95 85" stroke-width="12" fill="none" />`;
      arms = `<path d="M45 65 L65 65" stroke-width="10" />`;
    } else { // lying flat
      torso = `<line x1="38" y1="85" x2="70" y2="85" stroke-width="16" />`;
      legs = `<path d="M70 85 L85 65 L95 85" stroke-width="12" fill="none" />`;
      arms = `<path d="M45 85 L65 85" stroke-width="10" />`;
    }
    equipment = `<line x1="10" y1="92" x2="90" y2="92" stroke-width="4" stroke="#e2e8f0"/>`;
  } else {
    // Generic energetic movement
    head = `<circle cx="50" cy="22" r="9" />`;
    torso = `<line x1="50" y1="36" x2="50" y2="60" stroke-width="16" />`;
    if (isPos2) { 
      legs = `<path d="M48 58 L30 85 M52 58 L70 85" stroke-width="12" />`;
      arms = `<path d="M47 38 L25 20 M53 38 L75 20" stroke-width="10" />`;
    } else { 
      legs = `<path d="M48 60 L40 85 M52 60 L60 85" stroke-width="12" />`;
      arms = `<path d="M47 40 L35 65 M53 40 L65 65" stroke-width="10" />`;
    }
  }

  paths = head + torso + arms + legs;
  return baseSVG + content + paths + `</g>` + equipment + `</svg>`;
}

const dataPath = path.join(__dirname, '..', 'components', 'gdft', 'lib', 'data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const exerciseRegex = /name:\s*(["'])(.+?)\1,(?:\s*category:\s*(["'])(.+?)\3,)?\s*startPositionUrl:\s*(["'])(.+?)\5,\s*endPositionUrl:\s*(["'])(.+?)\7/g;

let match;
let count = 0;
while ((match = exerciseRegex.exec(dataContent)) !== null) {
  const name = match[2];
  let categoryStr = match[4];
  const startUrl = match[6];
  const endUrl = match[8];
  
  if (!startUrl.startsWith('/icons/')) continue; // Skip custom user URLs
  
  let folder = 'weights';
  let color = '#3b82f6'; // Weights = Blue
  
  if (startUrl.includes('/cardio/')) {
    folder = 'cardio';
    color = '#ef4444'; // Cardio = Red
  } else if (startUrl.includes('/no-equipment/')) {
    folder = 'no-equipment';
    color = '#22c55e'; // No Equipment = Green
  }

  const outDir = path.join(__dirname, '..', 'public', 'icons', folder, 'animated');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const slug = slugify(name);
  const type = getType(name);

  fs.writeFileSync(path.join(outDir, slug + '-pos1.svg'), getSilhouetteSVG(type, false, color));
  fs.writeFileSync(path.join(outDir, slug + '-pos2.svg'), getSilhouetteSVG(type, true, color));
  count++;
}

console.log(`Generated solid silhouette SVGs for ${count} exercises!`);
