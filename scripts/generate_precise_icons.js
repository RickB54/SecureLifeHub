const fs = require('fs');
const path = require('path');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getTemplate(name) {
  name = name.toLowerCase();
  
  // Specific complex exercises
  if (name.includes('woodchop')) return 'woodchop';
  if (name.includes('russian twist')) return 'russian_twist';
  if (name.includes('bicycle crunch')) return 'bicycle_crunch';
  if (name.includes('torso rotation')) return 'machine_torso_rotation';
  if (name.includes('face pull')) return 'cable_face_pull';
  if (name.includes('inchworm')) return 'inchworm';
  if (name.includes('jumping jack')) return 'jumping_jack';
  if (name.includes('burpee')) return 'burpee';
  if (name.includes('glute bridge')) return 'glute_bridge';
  if (name.includes('donkey kick')) return 'all_fours_kick';
  if (name.includes('fire hydrant')) return 'all_fours_side';
  if (name.includes('bird dog')) return 'all_fours_reach';
  if (name.includes('hip thrust')) return 'hip_thrust_barbell';
  if (name.includes('shrug') && name.includes('barbell')) return 'shrug_barbell';
  if (name.includes('shrug')) return 'shrug_dumbbell'; // default dumbbell
  if (name.includes('calf raise')) return 'calf_raise';
  
  // Planks
  if (name.includes('side plank')) return 'side_plank';
  if (name.includes('plank')) return 'plank';
  
  // Crunches / Abs
  if (name.includes('leg raise')) return 'leg_raise';
  if (name.includes('crunch') || name.includes('sit-up')) return 'crunch';

  // Dumbbell vs Barbell vs Machine vs Cable
  const isDumbbell = name.includes('dumbbell');
  const isBarbell = name.includes('barbell');
  const isCable = name.includes('cable');
  const isMachine = name.includes('machine') || name.includes('mts');
  
  // Squats / Lunges
  if (name.includes('squat') || name.includes('lunge') || name.includes('step')) {
    if (isDumbbell || name.includes('bodyweight') || name.includes('split squat')) return 'squat_dumbbell'; // bodyweight/dumbbell hands at side
    return 'squat_barbell';
  }
  
  // Bench Press
  if (name.includes('bench press') || (name.includes('press') && name.includes('decline'))) {
    if (isDumbbell) return 'press_dumbbell_bench';
    return 'press_barbell_bench';
  }
  
  // Overhead Press
  if (name.includes('press') && !isMachine && !isCable) {
    if (isDumbbell || name.includes('arnold')) return 'press_dumbbell_overhead';
    return 'press_barbell_overhead';
  }
  
  // Machine Press
  if (name.includes('press') && isMachine) return 'machine_seated_push';
  if (name.includes('pec deck') || name.includes('fly machine')) return 'machine_seated_push';
  
  // Leg Press / Ext / Curl
  if (name.includes('leg press')) return 'machine_leg_press';
  if (name.includes('leg extension')) return 'machine_leg_ext';
  if (name.includes('leg curl')) return 'machine_leg_curl';
  
  // Curls
  if (name.includes('curl') && !name.includes('leg')) {
    if (isBarbell) return 'curl_barbell';
    return 'curl_dumbbell'; // default dumbbell
  }
  
  // Triceps
  if (name.includes('tricep') || name.includes('skull crusher')) {
    if (isCable) return 'cable_push';
    return 'curl_dumbbell'; // overhead triceps etc can look like a curl/extension
  }
  
  // Rows / Pulls
  if (name.includes('row') || name.includes('pull')) {
    if (isMachine || name.includes('lat pulldown')) return 'machine_seated_pull';
    if (isCable) return 'cable_pull';
    if (isDumbbell) return 'row_dumbbell';
    if (name.includes('pull-up') || name.includes('pullup')) return 'pullup';
    return 'row_barbell'; // Bent over row, T-bar row
  }
  
  // Deadlifts
  if (name.includes('deadlift')) {
    if (isDumbbell) return 'deadlift_dumbbell';
    return 'deadlift_barbell';
  }
  
  // Flys
  if (name.includes('fly') && !isMachine && !isCable) return 'fly_dumbbell';
  
  // Cardio
  if (name.includes('run') || name.includes('sprint') || name.includes('walk') || name.includes('climber') || name.includes('high knees')) return 'running';
  if (name.includes('cycle') || name.includes('cycling') || name.includes('elliptical')) return 'cycling';
  if (name.includes('jump') || name.includes('skip') || name.includes('hop')) return 'jumping';
  
  return 'standing'; // ultimate fallback
}

function drawLimb(x1, y1, x2, y2, x3, y3, w1, w2, color) {
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w1}" stroke-linecap="round"/>
    <circle cx="${x2}" cy="${y2}" r="${w1/2 * 0.9}" fill="${color}"/>
    <line x1="${x2}" y1="${y2}" x2="${x3}" y2="${y3}" stroke="${color}" stroke-width="${w2}" stroke-linecap="round"/>
    <circle cx="${x3}" cy="${y3}" r="${w2/2 * 0.9}" fill="${color}"/>
  `;
}

function getSVGForTemplate(template, isPos2, baseColor, darkColor) {
  const baseSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="color: ${baseColor}">\n    <g stroke-linejoin="round">`;
  const eqStyle = `stroke="#94a3b8" fill="#94a3b8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
  const floorStyle = `stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"`;
  
  let head = ''; let torso = ''; let bgEquip = ''; let fgEquip = '';
  let farArm = ''; let nearArm = ''; let farLeg = ''; let nearLeg = '';

  const drawTorso = (x, y, wTop, wBot, h) => `
    <path d="M${x - wTop/2} ${y} L${x + wTop/2} ${y} L${x + wBot/2} ${y + h} L${x - wBot/2} ${y + h} Z" fill="${baseColor}" stroke="${baseColor}" stroke-width="4" stroke-linejoin="round"/>
  `;

  // --- Squats & Lower Body ---
  if (template === 'squat_barbell') {
    head = `<circle cx="50" cy="${isPos2 ? 20 : 35}" r="7" fill="${baseColor}"/> <line x1="50" y1="${isPos2 ? 20 : 35}" x2="50" y2="${isPos2 ? 30 : 45}" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, isPos2 ? 30 : 45, 16, 14, 25);
    farLeg = drawLimb(45, isPos2 ? 55 : 70, 35, isPos2 ? 75 : 75, 40, 95, 11, 9, darkColor);
    nearLeg = drawLimb(55, isPos2 ? 55 : 70, 65, isPos2 ? 75 : 75, 60, 95, 11, 9, baseColor);
    farArm = drawLimb(42, isPos2 ? 32 : 47, 35, isPos2 ? 45 : 60, 42, isPos2 ? 55 : 70, 8, 6, darkColor);
    nearArm = drawLimb(58, isPos2 ? 32 : 47, 65, isPos2 ? 45 : 60, 58, isPos2 ? 55 : 70, 8, 6, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    fgEquip = `<line x1="30" y1="${isPos2 ? 30 : 45}" x2="70" y2="${isPos2 ? 30 : 45}" ${eqStyle} stroke-width="5"/>`; // Barbell on shoulders
  } 
  else if (template === 'squat_dumbbell') {
    head = `<circle cx="50" cy="${isPos2 ? 20 : 35}" r="7" fill="${baseColor}"/> <line x1="50" y1="${isPos2 ? 20 : 35}" x2="50" y2="${isPos2 ? 30 : 45}" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, isPos2 ? 30 : 45, 16, 14, 25);
    farLeg = drawLimb(45, isPos2 ? 55 : 70, 35, isPos2 ? 75 : 75, 40, 95, 11, 9, darkColor);
    nearLeg = drawLimb(55, isPos2 ? 55 : 70, 65, isPos2 ? 75 : 75, 60, 95, 11, 9, baseColor);
    farArm = drawLimb(42, isPos2 ? 32 : 47, 42, isPos2 ? 50 : 65, 42, isPos2 ? 65 : 80, 8, 6, darkColor); // arms down
    nearArm = drawLimb(58, isPos2 ? 32 : 47, 58, isPos2 ? 50 : 65, 58, isPos2 ? 65 : 80, 8, 6, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    fgEquip = `<circle cx="42" cy="${isPos2 ? 65 : 80}" r="4" ${eqStyle}/> <circle cx="58" cy="${isPos2 ? 65 : 80}" r="4" ${eqStyle}/>`; // Dumbbells in hands
  }
  // --- Bench Presses ---
  else if (template === 'press_barbell_bench') {
    head = `<circle cx="75" cy="50" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M45 50 L70 50 L70 56 L45 56 Z" fill="${baseColor}"/>`; // lying flat
    farLeg = drawLimb(45, 50, 35, 65, 35, 95, 11, 9, darkColor); // feet on floor
    nearLeg = drawLimb(45, 56, 45, 75, 45, 95, 11, 9, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/> <line x1="30" y1="60" x2="80" y2="60" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>`; // bench
    if (isPos2) { // Pressed up
      farArm = drawLimb(65, 50, 65, 30, 65, 15, 8, 6, darkColor);
      nearArm = drawLimb(60, 56, 60, 35, 60, 15, 8, 6, baseColor);
      fgEquip = `<line x1="40" y1="15" x2="80" y2="15" ${eqStyle} stroke-width="5"/>`; // barbell high
    } else { // Down to chest
      farArm = drawLimb(65, 50, 60, 70, 65, 45, 8, 6, darkColor);
      nearArm = drawLimb(60, 56, 55, 75, 60, 45, 8, 6, baseColor);
      fgEquip = `<line x1="40" y1="45" x2="80" y2="45" ${eqStyle} stroke-width="5"/>`; // barbell on chest
    }
  }
  else if (template === 'press_dumbbell_bench') {
    head = `<circle cx="75" cy="50" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M45 50 L70 50 L70 56 L45 56 Z" fill="${baseColor}"/>`;
    farLeg = drawLimb(45, 50, 35, 65, 35, 95, 11, 9, darkColor);
    nearLeg = drawLimb(45, 56, 45, 75, 45, 95, 11, 9, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/> <line x1="30" y1="60" x2="80" y2="60" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>`;
    if (isPos2) { // Pressed up
      farArm = drawLimb(65, 50, 65, 30, 65, 15, 8, 6, darkColor);
      nearArm = drawLimb(60, 56, 60, 35, 60, 15, 8, 6, baseColor);
      fgEquip = `<circle cx="65" cy="15" r="4" ${eqStyle}/> <circle cx="60" cy="15" r="4" ${eqStyle}/>`; // 2 dumbbells
    } else { // Down to chest
      farArm = drawLimb(65, 50, 60, 70, 65, 45, 8, 6, darkColor);
      nearArm = drawLimb(60, 56, 55, 75, 60, 45, 8, 6, baseColor);
      fgEquip = `<circle cx="65" cy="45" r="4" ${eqStyle}/> <circle cx="60" cy="45" r="4" ${eqStyle}/>`;
    }
  }
  // --- Deadlifts & Rows ---
  else if (template === 'deadlift_barbell' || template === 'row_barbell') {
    head = `<circle cx="70" cy="${isPos2 ? 30 : 40}" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M65 ${isPos2 ? 40 : 50} L45 55 L45 65 L65 ${isPos2 ? 50 : 60} Z" fill="${baseColor}"/>`; // bent over
    farLeg = drawLimb(45, 55, 45, 75, 45, 95, 11, 9, darkColor);
    nearLeg = drawLimb(45, 65, 50, 80, 50, 95, 11, 9, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    if (isPos2) { // Pulled up / Stood up
      farArm = drawLimb(65, 40, 55, 60, 50, 55, 8, 6, darkColor);
      nearArm = drawLimb(65, 50, 60, 70, 55, 65, 8, 6, baseColor);
      fgEquip = `<line x1="30" y1="60" x2="70" y2="60" ${eqStyle} stroke-width="5"/>`; // barbell at shins/hips
    } else { // Reaching down
      farArm = drawLimb(65, 50, 55, 70, 50, 85, 8, 6, darkColor);
      nearArm = drawLimb(65, 60, 60, 80, 55, 90, 8, 6, baseColor);
      fgEquip = `<line x1="30" y1="88" x2="70" y2="88" ${eqStyle} stroke-width="5"/>`;
    }
  }
  else if (template === 'row_dumbbell' || template === 'deadlift_dumbbell') {
    head = `<circle cx="70" cy="${isPos2 ? 30 : 40}" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M65 ${isPos2 ? 40 : 50} L45 55 L45 65 L65 ${isPos2 ? 50 : 60} Z" fill="${baseColor}"/>`; // bent over
    farLeg = drawLimb(45, 55, 45, 75, 45, 95, 11, 9, darkColor);
    nearLeg = drawLimb(45, 65, 50, 80, 50, 95, 11, 9, baseColor);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    if (isPos2) {
      farArm = drawLimb(65, 40, 55, 60, 50, 55, 8, 6, darkColor);
      nearArm = drawLimb(65, 50, 60, 70, 55, 65, 8, 6, baseColor);
      fgEquip = `<circle cx="50" cy="55" r="4" ${eqStyle}/> <circle cx="55" cy="65" r="4" ${eqStyle}/>`; // 2 dumbbells
    } else {
      farArm = drawLimb(65, 50, 55, 70, 50, 85, 8, 6, darkColor);
      nearArm = drawLimb(65, 60, 60, 80, 55, 90, 8, 6, baseColor);
      fgEquip = `<circle cx="50" cy="85" r="4" ${eqStyle}/> <circle cx="55" cy="90" r="4" ${eqStyle}/>`;
    }
  }
  // --- Machines ---
  else if (template === 'machine_seated_push' || template === 'machine_seated_pull') {
    head = `<circle cx="40" cy="30" r="7" fill="${baseColor}"/>`;
    torso = drawTorso(40, 40, 16, 16, 25);
    farLeg = drawLimb(40, 65, 55, 75, 55, 95, 11, 9, darkColor);
    nearLeg = drawLimb(40, 65, 65, 75, 65, 95, 11, 9, baseColor);
    bgEquip = `<rect x="25" y="40" width="10" height="40" fill="#cbd5e1" rx="2"/> <rect x="35" y="65" width="20" height="10" fill="#94a3b8" rx="2"/>`; // seat back and pad
    if (isPos2) { // arms extended forward (push pos2, pull pos1)
      farArm = drawLimb(40, 45, 65, 45, 85, 45, 8, 6, darkColor);
      nearArm = drawLimb(40, 45, 70, 45, 90, 45, 8, 6, baseColor);
      fgEquip = `<rect x="85" y="40" width="5" height="10" fill="#64748b"/>`; // handles
    } else { // arms bent near chest
      farArm = drawLimb(40, 45, 30, 55, 50, 50, 8, 6, darkColor);
      nearArm = drawLimb(40, 45, 35, 60, 55, 55, 8, 6, baseColor);
      fgEquip = `<rect x="50" y="45" width="5" height="10" fill="#64748b"/>`;
    }
  }
  // --- Crunches / Floor ---
  else if (template === 'inchworm') {
    bgEquip = `<line x1="10" y1="95" x2="90" y2="95" ${floorStyle}/>`;
    if (isPos2) { // in plank
      head = `<circle cx="85" cy="70" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M75 70 L70 80 L35 80 L40 70 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(40, 70, 20, 85, 15, 95, 10, 8, darkColor);
      nearLeg = drawLimb(35, 80, 15, 90, 10, 95, 10, 8, baseColor);
      farArm = drawLimb(70, 70, 75, 85, 75, 95, 8, 6, darkColor);
      nearArm = drawLimb(70, 80, 70, 90, 70, 95, 8, 6, baseColor);
    } else { // bent over touching toes
      head = `<circle cx="30" cy="50" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M25 60 L45 70 L50 60 L30 50 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(45, 70, 45, 85, 45, 95, 10, 8, darkColor);
      nearLeg = drawLimb(50, 60, 50, 80, 50, 95, 10, 8, baseColor);
      farArm = drawLimb(30, 50, 35, 75, 40, 95, 8, 6, darkColor);
      nearArm = drawLimb(25, 60, 30, 85, 35, 95, 8, 6, baseColor);
    }
  }
  else if (template === 'jumping_jack') {
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/>`;
    torso = drawTorso(50, 30, 16, 12, 25);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
    if (isPos2) { // arms up, legs out
      farLeg = drawLimb(45, 55, 30, 75, 25, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 55, 70, 75, 75, 95, 10, 8, baseColor);
      farArm = drawLimb(45, 32, 25, 20, 15, 10, 8, 6, darkColor);
      nearArm = drawLimb(55, 32, 75, 20, 85, 10, 8, 6, baseColor);
    } else { // arms down, legs in
      farLeg = drawLimb(45, 55, 45, 75, 45, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 55, 55, 75, 55, 95, 10, 8, baseColor);
      farArm = drawLimb(45, 32, 40, 55, 35, 75, 8, 6, darkColor);
      nearArm = drawLimb(55, 32, 60, 55, 65, 75, 8, 6, baseColor);
    }
  }
  else if (template === 'all_fours_kick' || template === 'all_fours_side' || template === 'all_fours_reach') {
    bgEquip = `<line x1="10" y1="95" x2="90" y2="95" ${floorStyle}/>`;
    head = `<circle cx="75" cy="55" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M65 60 L60 70 L30 70 L35 60 Z" fill="${baseColor}"/>`;
    farArm = drawLimb(60, 60, 60, 75, 60, 95, 8, 6, darkColor);
    nearArm = drawLimb(60, 70, 65, 80, 65, 95, 8, 6, baseColor);
    if (isPos2) {
      if (template === 'all_fours_kick') {
        farLeg = drawLimb(35, 60, 20, 50, 10, 30, 10, 8, darkColor); // kicked back and up
        nearLeg = drawLimb(30, 70, 30, 85, 30, 95, 10, 8, baseColor); // planted
      } else if (template === 'all_fours_side') {
        farLeg = drawLimb(35, 60, 35, 80, 35, 95, 10, 8, darkColor); // planted
        nearLeg = drawLimb(30, 70, 45, 70, 55, 85, 10, 8, baseColor); // lifted to side (overlapping torso slightly)
      } else { // reach (bird dog)
        nearArm = drawLimb(60, 70, 75, 60, 90, 50, 8, 6, baseColor); // reach forward
        farLeg = drawLimb(35, 60, 20, 60, 10, 60, 10, 8, darkColor); // kicked straight back
        nearLeg = drawLimb(30, 70, 30, 85, 30, 95, 10, 8, baseColor);
      }
    } else { // default all fours
      farLeg = drawLimb(35, 60, 35, 80, 35, 95, 10, 8, darkColor);
      nearLeg = drawLimb(30, 70, 30, 85, 30, 95, 10, 8, baseColor);
    }
  }
  else if (template === 'glute_bridge') {
    bgEquip = `<line x1="10" y1="95" x2="90" y2="95" ${floorStyle}/>`;
    head = `<circle cx="20" cy="85" r="7" fill="${baseColor}"/>`;
    if (isPos2) { // hips high
      torso = `<path d="M25 85 L30 90 L55 70 L50 65 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(50, 65, 75, 65, 75, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 70, 80, 70, 80, 95, 10, 8, baseColor);
    } else { // hips down
      torso = `<path d="M25 85 L30 90 L55 90 L50 85 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(50, 85, 75, 75, 75, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 90, 80, 80, 80, 95, 10, 8, baseColor);
    }
    farArm = drawLimb(30, 85, 45, 85, 60, 85, 8, 6, darkColor);
    nearArm = drawLimb(35, 90, 50, 90, 65, 90, 8, 6, baseColor);
  }
  else {
    // Fallback: standard detailed standing (handles jumps, unknown running etc gracefully)
    head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/> <line x1="50" y1="20" x2="50" y2="30" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, 30, 16, 12, 25);
    bgEquip = `<line x1="20" y1="95" x2="80" y2="95" ${floorStyle}/>`;
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

  return baseSVG + bgEquip + farLeg + farArm + head + torso + nearLeg + nearArm + fgEquip + `</g></svg>`;
}

const dataPath = path.join(__dirname, '..', 'components', 'gdft', 'lib', 'data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const exerciseRegex = /name:\s*(["'])(.+?)\1(?:[\s\S]*?)startPositionUrl:\s*(["'])(.+?)\3,\s*endPositionUrl:\s*(["'])(.+?)\5/g;

let match;
let exercises = [];
while ((match = exerciseRegex.exec(dataContent)) !== null) {
  const name = match[2];
  const startUrl = match[4];
  if (startUrl.startsWith('/icons/')) {
     let cat = 'weights';
     let baseColor = '#3b82f6';
     let darkColor = '#1e40af';
     if (startUrl.includes('cardio')) { cat = 'cardio'; baseColor = '#ef4444'; darkColor = '#991b1b'; }
     if (startUrl.includes('no-equipment')) { cat = 'no-equipment'; baseColor = '#22c55e'; darkColor = '#166534'; }
     exercises.push({ name, cat, startUrl, baseColor, darkColor });
  }
}

exercises.forEach(ex => {
  const outDir = path.join(__dirname, '..', 'public', 'icons', ex.cat, 'animated');
  if (!fs.existsSync(outDir)) { fs.mkdirSync(outDir, { recursive: true }); }
  const slug = slugify(ex.name);
  const tpl = getTemplate(ex.name);
  fs.writeFileSync(path.join(outDir, slug + '-pos1.svg'), getSVGForTemplate(tpl, false, ex.baseColor, ex.darkColor));
  fs.writeFileSync(path.join(outDir, slug + '-pos2.svg'), getSVGForTemplate(tpl, true, ex.baseColor, ex.darkColor));
});

console.log(`Successfully generated highly-accurate bespoke SVGs for ${exercises.length} exercises!`);

// Generate review grid
let html = `<html><head><style>
  body { font-family: system-ui; background: #0f172a; color: #f8fafc; padding: 2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
  .card { background: #1e293b; padding: 1rem; border-radius: 8px; text-align: center; }
  .icons { display: flex; justify-content: center; gap: 10px; margin-top: 10px; }
  img { width: 64px; height: 64px; object-fit: contain; }
  h2 { margin-top: 2rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
</style></head><body><h1>GDFT Icon Review</h1>`;

['weights', 'cardio', 'no-equipment'].forEach(c => {
  html += `<h2>${c.toUpperCase()}</h2><div class="grid">`;
  exercises.filter(e => e.cat === c).forEach(e => {
    const slug = slugify(e.name);
    html += `<div class="card">
      <div style="font-size: 0.9rem; font-weight: 500">${e.name}</div>
      <div style="font-size: 0.7rem; color: #94a3b8">Template: ${getTemplate(e.name)}</div>
      <div class="icons">
        <img src="public/icons/${c}/animated/${slug}-pos1.svg">
        <img src="public/icons/${c}/animated/${slug}-pos2.svg">
      </div>
    </div>`;
  });
  html += `</div>`;
});

html += `</body></html>`;
fs.writeFileSync(path.join(__dirname, '..', 'icon-review-grid.html'), html);
console.log('Created icon-review-grid.html in project root.');
