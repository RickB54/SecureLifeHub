const fs = require('fs');
const path = require('path');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getType(name) {
  name = name.toLowerCase();
  // Complex flagged movements:
  if (name.includes('woodchop')) return 'woodchop';
  if (name.includes('russian twist')) return 'russian_twist';
  if (name.includes('bicycle crunch')) return 'bicycle_crunch';
  if (name.includes('torso rotation')) return 'torso_rotation';
  if (name.includes('face pull')) return 'face_pull';
  
  // Standard categorizations
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

function drawLimb(x1, y1, x2, y2, x3, y3, w1, w2, color) {
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w1}" stroke-linecap="round"/>
    <circle cx="${x2}" cy="${y2}" r="${w1/2 * 0.9}" fill="${color}"/>
    <line x1="${x2}" y1="${y2}" x2="${x3}" y2="${y3}" stroke="${color}" stroke-width="${w2}" stroke-linecap="round"/>
    <circle cx="${x3}" cy="${y3}" r="${w2/2}" fill="${color}"/>
  `;
}

function getDetailedSVG(type, isPos2, baseColor, darkColor) {
  const baseSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`;
  
  let bgEquip = '';
  let fgEquip = '';
  
  let farArm = '';
  let farLeg = '';
  
  let head = '';
  let torso = '';
  
  let nearArm = '';
  let nearLeg = '';

  const eqStyle = `stroke="#94a3b8" fill="#94a3b8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
  const floorStyle = `stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"`;

  const drawTorso = (x, y, wTop, wBot, h) => `
    <path d="M${x - wTop/2} ${y} L${x + wTop/2} ${y} L${x + wBot/2} ${y + h} L${x - wBot/2} ${y + h} Z" fill="${baseColor}" stroke="${baseColor}" stroke-width="4" stroke-linejoin="round"/>
  `;

  if (type === 'press') {
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 18, 12, 25); // x=50, y=30, waist y=55
    if (isPos2) { // Pressed out
      farLeg = drawLimb(45, 55, 35, 75, 45, 95, 10, 8, darkColor);
      farArm = drawLimb(42, 32, 35, 25, 45, 15, 8, 6, darkColor);
      nearLeg = drawLimb(55, 55, 65, 75, 55, 95, 10, 8, baseColor);
      nearArm = drawLimb(58, 32, 65, 25, 55, 15, 8, 6, baseColor);
      fgEquip = `
        <line x1="20" y1="15" x2="80" y2="15" ${eqStyle}/>
        <rect x="18" y="10" width="8" height="10" rx="2" fill="#64748b"/>
        <rect x="74" y="10" width="8" height="10" rx="2" fill="#64748b"/>
      `;
    } else { // Bent arms
      farLeg = drawLimb(45, 55, 35, 75, 45, 95, 10, 8, darkColor);
      farArm = drawLimb(42, 32, 35, 42, 35, 32, 8, 6, darkColor);
      nearLeg = drawLimb(55, 55, 65, 75, 55, 95, 10, 8, baseColor);
      nearArm = drawLimb(58, 32, 65, 42, 65, 32, 8, 6, baseColor);
      fgEquip = `
        <line x1="20" y1="32" x2="80" y2="32" ${eqStyle}/>
        <rect x="18" y="27" width="8" height="10" rx="2" fill="#64748b"/>
        <rect x="74" y="27" width="8" height="10" rx="2" fill="#64748b"/>
      `;
    }
  } else if (type === 'squat') {
    if (isPos2) { // Stand
      head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
      torso = drawTorso(50, 30, 16, 14, 25);
      farLeg = drawLimb(45, 55, 40, 75, 40, 95, 11, 9, darkColor);
      farArm = drawLimb(42, 32, 35, 45, 42, 55, 8, 6, darkColor);
      nearLeg = drawLimb(55, 55, 60, 75, 60, 95, 11, 9, baseColor);
      nearArm = drawLimb(58, 32, 65, 45, 58, 55, 8, 6, baseColor);
      bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
      fgEquip = `<line x1="30" y1="30" x2="70" y2="30" ${eqStyle} stroke-width="5"/>`; // Barbell on shoulders
    } else { // Squat down
      head = `<circle cx="50" cy="35" r="7" fill="${baseColor}"/> <line x1="50" y1="35" x2="50" y2="45" stroke="${baseColor}" stroke-width="6"/>`;
      torso = drawTorso(50, 45, 16, 14, 25); // y=45, waist=70
      farLeg = drawLimb(45, 70, 35, 75, 40, 95, 11, 9, darkColor);
      farArm = drawLimb(42, 47, 35, 60, 42, 70, 8, 6, darkColor);
      nearLeg = drawLimb(55, 70, 65, 75, 60, 95, 11, 9, baseColor);
      nearArm = drawLimb(58, 47, 65, 60, 58, 70, 8, 6, baseColor);
      bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
      fgEquip = `<line x1="30" y1="45" x2="70" y2="45" ${eqStyle} stroke-width="5"/>`;
    }
  } else if (type === 'curl') {
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 18, 12, 25);
    farLeg = drawLimb(45, 55, 40, 75, 40, 95, 10, 8, darkColor);
    nearLeg = drawLimb(55, 55, 60, 75, 60, 95, 10, 8, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    if (isPos2) { // Curled up
      farArm = drawLimb(42, 32, 35, 50, 35, 35, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 65, 50, 65, 35, 8, 6, baseColor);
      fgEquip = `<line x1="35" y1="30" x2="35" y2="40" ${eqStyle} stroke-width="6"/> <line x1="65" y1="30" x2="65" y2="40" ${eqStyle} stroke-width="6"/>`;
    } else { // Down
      farArm = drawLimb(42, 32, 35, 50, 35, 70, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 65, 50, 65, 70, 8, 6, baseColor);
      fgEquip = `<line x1="35" y1="65" x2="35" y2="75" ${eqStyle} stroke-width="6"/> <line x1="65" y1="65" x2="65" y2="75" ${eqStyle} stroke-width="6"/>`;
    }
  } else if (type === 'pull') {
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 18, 12, 25);
    farLeg = drawLimb(45, 55, 40, 75, 40, 95, 10, 8, darkColor);
    nearLeg = drawLimb(55, 55, 60, 75, 60, 95, 10, 8, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    if (isPos2) { // Pulled in
      farArm = drawLimb(42, 32, 35, 45, 45, 40, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 65, 45, 55, 40, 8, 6, baseColor);
      fgEquip = `<line x1="35" y1="40" x2="65" y2="40" ${eqStyle}/>`;
    } else { // Reached out
      farArm = drawLimb(42, 32, 30, 25, 40, 15, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 70, 25, 60, 15, 8, 6, baseColor);
      fgEquip = `<line x1="25" y1="15" x2="75" y2="15" ${eqStyle}/>`;
    }
  } else if (type === 'run' || type === 'jump') {
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 16, 12, 25);
    if (isPos2) {
      farLeg = drawLimb(45, 55, 65, 65, 60, 85, 10, 8, darkColor);
      nearLeg = drawLimb(55, 55, 35, 65, 40, 85, 10, 8, baseColor);
      farArm = drawLimb(42, 32, 60, 45, 55, 60, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 40, 45, 45, 60, 8, 6, baseColor);
      bgEquip = `<line x1="20" y1="90" x2="80" y2="90" ${floorStyle} stroke-dasharray="8"/>`;
    } else {
      farLeg = drawLimb(45, 55, 35, 65, 40, 85, 10, 8, darkColor);
      nearLeg = drawLimb(55, 55, 65, 65, 60, 85, 10, 8, baseColor);
      farArm = drawLimb(42, 32, 40, 45, 45, 60, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 60, 45, 55, 60, 8, 6, baseColor);
      bgEquip = `<line x1="20" y1="90" x2="80" y2="90" ${floorStyle}/>`;
    }
  } else if (type === 'plank') {
    bgEquip = `<line x1="10" y1="85" x2="90" y2="85" ${floorStyle}/>`;
    head = `<circle cx="85" cy="55" r="7" fill="${baseColor}"/> <line x1="85" y1="55" x2="75" y2="60" stroke="${baseColor}" stroke-width="6"/>`;
    if (isPos2) { // shifted slightly
      torso = `<path d="M75 55 L70 65 L35 75 L40 65 Z" fill="${baseColor}" stroke="${baseColor}" stroke-width="4" stroke-linejoin="round"/>`;
      farLeg = drawLimb(40, 65, 20, 75, 15, 85, 10, 8, darkColor);
      nearLeg = drawLimb(35, 75, 15, 80, 10, 85, 10, 8, baseColor);
      farArm = drawLimb(70, 55, 75, 70, 70, 85, 8, 6, darkColor);
      nearArm = drawLimb(65, 65, 65, 75, 60, 85, 8, 6, baseColor);
    } else {
      torso = `<path d="M75 55 L70 65 L40 75 L45 65 Z" fill="${baseColor}" stroke="${baseColor}" stroke-width="4" stroke-linejoin="round"/>`;
      farLeg = drawLimb(45, 65, 25, 75, 20, 85, 10, 8, darkColor);
      nearLeg = drawLimb(40, 75, 20, 80, 15, 85, 10, 8, baseColor);
      farArm = drawLimb(70, 55, 70, 70, 75, 85, 8, 6, darkColor);
      nearArm = drawLimb(65, 65, 65, 75, 70, 85, 8, 6, baseColor);
    }
  } else if (type === 'crunch') {
    bgEquip = `<line x1="10" y1="85" x2="90" y2="85" ${floorStyle}/>`;
    if (isPos2) { // crunched up
      head = `<circle cx="45" cy="45" r="7" fill="${baseColor}"/> <line x1="45" y1="45" x2="50" y2="55" stroke="${baseColor}" stroke-width="6"/>`;
      torso = `<path d="M45 52 L55 58 L75 80 L65 82 Z" fill="${baseColor}" stroke="${baseColor}" stroke-width="4" stroke-linejoin="round"/>`;
      farLeg = drawLimb(70, 75, 85, 60, 95, 85, 10, 8, darkColor);
      nearLeg = drawLimb(65, 82, 80, 65, 90, 85, 10, 8, baseColor);
      farArm = drawLimb(50, 52, 65, 60, 75, 65, 8, 6, darkColor);
      nearArm = drawLimb(45, 58, 60, 65, 70, 70, 8, 6, baseColor);
    } else { // flat
      head = `<circle cx="25" cy="75" r="7" fill="${baseColor}"/> <line x1="25" y1="75" x2="35" y2="80" stroke="${baseColor}" stroke-width="6"/>`;
      torso = `<path d="M35 75 L35 85 L65 85 L65 75 Z" fill="${baseColor}" stroke="${baseColor}" stroke-width="4" stroke-linejoin="round"/>`;
      farLeg = drawLimb(65, 75, 80, 60, 95, 85, 10, 8, darkColor);
      nearLeg = drawLimb(65, 85, 80, 70, 90, 85, 10, 8, baseColor);
      farArm = drawLimb(35, 75, 55, 75, 70, 75, 8, 6, darkColor);
      nearArm = drawLimb(35, 85, 55, 85, 70, 85, 8, 6, baseColor);
    }
  } else if (type === 'woodchop') {
    // Rotational depth: near arm light, far arm dark, overlapping body
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 16, 12, 25);
    farLeg = drawLimb(45, 55, 35, 75, 35, 95, 10, 8, darkColor);
    nearLeg = drawLimb(55, 55, 65, 75, 65, 95, 10, 8, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    if (isPos2) { // chopped down
      farArm = drawLimb(42, 32, 30, 50, 20, 70, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 45, 55, 30, 75, 8, 6, baseColor); // Crosses torso beautifully
      fgEquip = `<line x1="90" y1="10" x2="25" y2="72" ${eqStyle} stroke-width="3"/>`; // Cable line
    } else { // holding high
      farArm = drawLimb(42, 32, 60, 20, 80, 10, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 70, 25, 90, 15, 8, 6, baseColor);
      fgEquip = `<line x1="90" y1="10" x2="85" y2="12" ${eqStyle} stroke-width="4"/>`; 
    }
  } else if (type === 'russian_twist') {
    bgEquip = `<line x1="10" y1="85" x2="90" y2="85" ${floorStyle}/>`;
    head = `<circle cx="35" cy="45" r="7" fill="${baseColor}"/> <line x1="35" y1="45" x2="42" y2="52" stroke="${baseColor}" stroke-width="6"/>`;
    torso = `<path d="M38 48 L46 56 L60 78 L52 82 Z" fill="${baseColor}" stroke="${baseColor}" stroke-width="4" stroke-linejoin="round"/>`;
    farLeg = drawLimb(56, 75, 75, 60, 95, 65, 10, 8, darkColor); // legs elevated
    nearLeg = drawLimb(52, 82, 70, 65, 90, 70, 10, 8, baseColor);
    if (isPos2) { // twist right
      farArm = drawLimb(42, 50, 65, 60, 80, 55, 8, 6, darkColor);
      nearArm = drawLimb(46, 56, 60, 65, 75, 60, 8, 6, baseColor);
      fgEquip = `<circle cx="78" cy="58" r="6" ${eqStyle}/>`; // holding weight plate
    } else { // twist left
      farArm = drawLimb(42, 50, 30, 60, 20, 55, 8, 6, darkColor);
      nearArm = drawLimb(46, 56, 35, 65, 25, 60, 8, 6, baseColor);
      fgEquip = `<circle cx="22" cy="58" r="6" ${eqStyle}/>`; 
    }
  } else if (type === 'bicycle_crunch') {
    bgEquip = `<line x1="10" y1="85" x2="90" y2="85" ${floorStyle}/>`;
    head = `<circle cx="30" cy="65" r="7" fill="${baseColor}"/> <line x1="30" y1="65" x2="38" y2="72" stroke="${baseColor}" stroke-width="6"/>`;
    torso = `<path d="M34 68 L42 76 L65 82 L58 84 Z" fill="${baseColor}" stroke="${baseColor}" stroke-width="4" stroke-linejoin="round"/>`;
    // hands behind head
    farArm = drawLimb(38, 70, 35, 55, 28, 65, 8, 6, darkColor);
    nearArm = drawLimb(42, 76, 40, 60, 32, 68, 8, 6, baseColor);
    if (isPos2) { // left knee to right elbow
      farLeg = drawLimb(62, 78, 50, 65, 70, 65, 10, 8, darkColor); // pulled in
      nearLeg = drawLimb(58, 84, 75, 70, 95, 80, 10, 8, baseColor); // extended
    } else { // right knee to left elbow
      farLeg = drawLimb(62, 78, 80, 65, 95, 75, 10, 8, darkColor); // extended
      nearLeg = drawLimb(58, 84, 55, 70, 75, 70, 10, 8, baseColor); // pulled in
    }
  } else if (type === 'torso_rotation') {
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 18, 12, 25);
    bgEquip = `
      <rect x="35" y="55" width="30" height="40" rx="4" fill="#cbd5e1"/>
      <rect x="25" y="45" width="50" height="10" rx="2" fill="#94a3b8"/>
    `; // Seated machine
    farLeg = drawLimb(45, 55, 40, 75, 40, 95, 10, 8, darkColor);
    nearLeg = drawLimb(55, 55, 60, 75, 60, 95, 10, 8, baseColor);
    if (isPos2) { // twisted right
      farArm = drawLimb(42, 32, 60, 45, 75, 45, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 65, 48, 80, 48, 8, 6, baseColor); // crossing body
      fgEquip = `<line x1="75" y1="45" x2="80" y2="48" ${eqStyle}/>`; // handle
    } else { // twisted left
      farArm = drawLimb(42, 32, 35, 45, 20, 45, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 40, 48, 25, 48, 8, 6, baseColor); 
      fgEquip = `<line x1="20" y1="45" x2="25" y2="48" ${eqStyle}/>`;
    }
  } else if (type === 'face_pull') {
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 16, 12, 25);
    farLeg = drawLimb(45, 55, 35, 75, 35, 95, 10, 8, darkColor);
    nearLeg = drawLimb(55, 55, 65, 75, 65, 95, 10, 8, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    if (isPos2) { // pulled to face
      farArm = drawLimb(42, 32, 35, 25, 45, 20, 8, 6, darkColor); // elbows high, hands near face
      nearArm = drawLimb(58, 32, 65, 25, 55, 20, 8, 6, baseColor);
      fgEquip = `<line x1="90" y1="15" x2="50" y2="20" ${eqStyle} stroke-width="2"/>`; // cable to face
    } else { // extended
      farArm = drawLimb(42, 32, 65, 25, 80, 20, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 70, 30, 85, 25, 8, 6, baseColor);
      fgEquip = `<line x1="90" y1="15" x2="82" y2="22" ${eqStyle} stroke-width="2"/>`; // cable
    }
  } else {
    // Generic
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 16, 12, 25);
    if (isPos2) { 
      farLeg = drawLimb(45, 55, 30, 75, 25, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 55, 70, 75, 75, 95, 10, 8, baseColor);
      farArm = drawLimb(42, 32, 25, 30, 15, 20, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 75, 30, 85, 20, 8, 6, baseColor);
    } else { 
      farLeg = drawLimb(45, 55, 40, 75, 40, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 55, 60, 75, 60, 95, 10, 8, baseColor);
      farArm = drawLimb(42, 32, 35, 55, 35, 75, 8, 6, darkColor);
      nearArm = drawLimb(58, 32, 65, 55, 65, 75, 8, 6, baseColor);
    }
  }

  // Combine layers from back to front
  const content = bgEquip + farLeg + farArm + head + torso + nearLeg + nearArm + fgEquip;
  return baseSVG + content + `</svg>`;
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
  let baseColor = '#3b82f6'; // Weights = Blue 500
  let darkColor = '#1e40af'; // Blue 800
  
  if (startUrl.includes('/cardio/')) {
    folder = 'cardio';
    baseColor = '#ef4444'; // Cardio = Red 500
    darkColor = '#991b1b'; // Red 800
  } else if (startUrl.includes('/no-equipment/')) {
    folder = 'no-equipment';
    baseColor = '#22c55e'; // No Equipment = Green 500
    darkColor = '#166534'; // Green 800
  }

  const outDir = path.join(__dirname, '..', 'public', 'icons', folder, 'animated');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const slug = slugify(name);
  const type = getType(name);

  fs.writeFileSync(path.join(outDir, slug + '-pos1.svg'), getDetailedSVG(type, false, baseColor, darkColor));
  fs.writeFileSync(path.join(outDir, slug + '-pos2.svg'), getDetailedSVG(type, true, baseColor, darkColor));
  count++;
}

console.log(`Generated detailed two-tone SVGs for ${count} exercises!`);
