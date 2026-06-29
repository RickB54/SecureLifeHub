const fs = require('fs');
const path = require('path');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const excludedExercises = [
  'Bench Press',
  'Bulgarian Split Squats',
  'Chest Press Machine',
  'Dumbbell Rows',
  'Hammer Strength MTS High Row',
  'Hammer Strength MTS Pull',
  'Hammer Strength MTS Row',
  'Hammer Strength MTS Shoulder Press',
  'Pec Deck / Machine Chest Fly',
  'Pectoral Fly Machine',
  'Rear Delt Fly Machine',
  'Seated Row Machine'
].map(s => s.toLowerCase());

function shouldTouch(name) {
  return !excludedExercises.some(ex => name.toLowerCase().includes(ex));
}

function getTemplate(name) {
  name = name.toLowerCase();

  // No Equipment specific requests
  if (name.includes('leg raise')) return 'leg_raise';
  if (name.includes('plank shoulder tap')) return 'plank_shoulder_taps';
  if (name.includes('side plank (left)')) return 'side_plank_left';
  if (name.includes('side plank (right)')) return 'side_plank_right';
  if (name === 'plank') return 'plank';
  if (name.includes('pushup')) return 'pushup';
  if (name.includes('russian twist')) return 'russian_twist';
  if (name.includes('sit-up') || name.includes('sit up')) return 'crunch';
  if (name.includes('superman')) return 'superman';
  if (name.includes('tricep dips (chair)')) return 'dip_chair';
  if (name.includes('wall sit')) return 'wall_sit';
  
  if (name.includes('inchworm')) return 'inchworm';
  if (name.includes('jumping jack')) return 'jumping_jack';
  if (name.includes('burpee')) return 'burpee';
  if (name.includes('glute bridge')) return 'glute_bridge';
  if (name.includes('donkey kick')) return 'all_fours_kick';
  if (name.includes('fire hydrant')) return 'all_fours_side';
  if (name.includes('bird dog')) return 'all_fours_reach';
  if (name.includes('bicycle crunch')) return 'bicycle_crunch';
  
  // Cardio
  if (name.includes('treadmill') || name.includes('walk') || name.includes('sprint') || name.includes('run') || name.includes('high knees') || name.includes('fast feet')) return 'running_treadmill';
  if (name.includes('elliptical')) return 'elliptical';
  if (name.includes('jump rope')) return 'jump_rope';
  if (name.includes('cycl')) return 'cycling';
  if (name.includes('rowing')) return 'rowing_erg';
  if (name.includes('stair')) return 'stair_climber';
  if (name.includes('mountain climber')) return 'mountain_climbers';
  if (name.includes('box jump')) return 'box_jump';
  if (name.includes('skater')) return 'skater_jumps';
  if (name.includes('battle rope')) return 'battle_ropes';
  if (name.includes('box') || name.includes('shadow')) return 'boxing';
  if (name.includes('tuck jump')) return 'tuck_jump';
  if (name.includes('lateral shuffle') || name.includes('side-to-side')) return 'lateral_shuffle';
  if (name.includes('power skip')) return 'power_skip';
  if (name.includes('med') || name.includes('slam')) return 'med_ball_slam';
  if (name.includes('lunge') && name.includes('jump')) return 'jumping_lunge';
  if (name.includes('broad jump')) return 'broad_jump';
  if (name.includes('squat jump')) return 'squat_jump';
  if (name.includes('step aerobic')) return 'step_aerobics';
  if (name.includes('zumba')) return 'zumba';
  
  // Weights
  if (name.includes('woodchop')) return 'woodchop';
  if (name.includes('torso rotation')) return 'machine_torso_rotation';
  if (name.includes('face pull')) return 'cable_face_pull';
  if (name.includes('hip thrust')) return 'hip_thrust_barbell';
  if (name.includes('shrug') && name.includes('barbell')) return 'shrug_barbell';
  if (name.includes('shrug')) return 'shrug_dumbbell';
  if (name.includes('calf raise')) return 'calf_raise';
  if (name.includes('abdominal crunch machine')) return 'machine_ab_crunch';
  if (name.includes('back extension')) return 'machine_back_extension';
  if (name.includes('hip abduction')) return 'machine_hip_abduction';
  if (name.includes('hip adduction')) return 'machine_hip_adduction';
  if (name.includes('leg extension')) return 'machine_leg_ext';
  if (name.includes('leg curl')) return 'machine_leg_curl';
  if (name.includes('leg press')) return 'machine_leg_press';
  if (name.includes('t-bar row')) return 't_bar_row';
  if (name.includes('pullover')) return 'dumbbell_pullover';
  if (name.includes('side bend')) return 'side_bend';
  if (name.includes('skull crusher')) return 'skull_crusher';
  if (name.includes('kickback')) return 'tricep_kickback';
  if (name.includes('fly') && name.includes('cable')) return 'fly_cable';
  if (name.includes('lat pulldown') && name.includes('cable')) return 'cable_lat_pulldown';
  if (name.includes('overhead tricep') && name.includes('cable')) return 'cable_tricep_overhead';
  if (name.includes('tricep pushdown')) return 'cable_tricep_pushdown';
  if (name.includes('bicep curl') && name.includes('cable')) return 'cable_bicep_curl';
  if (name.includes('dip') && name.includes('machine')) return 'machine_assisted_dip';
  if (name.includes('pull-up') && name.includes('machine')) return 'machine_assisted_pullup';
  if (name.includes('dip')) return 'dip';
  
  const isDumbbell = name.includes('dumbbell');
  const isBarbell = name.includes('barbell');
  const isCable = name.includes('cable');
  const isMachine = name.includes('machine') || name.includes('mts');
  
  if (name.includes('squat') || name.includes('lunge') || name.includes('step')) {
    if (isDumbbell || name.includes('bodyweight') || name.includes('split squat')) return 'squat_dumbbell';
    return 'squat_barbell';
  }
  
  if (name.includes('bench press') || (name.includes('press') && name.includes('decline'))) {
    if (isDumbbell) return 'press_dumbbell_bench';
    return 'press_barbell_bench';
  }
  
  if (name.includes('press') && !isMachine && !isCable) {
    if (isDumbbell || name.includes('arnold')) return 'press_dumbbell_overhead';
    return 'press_barbell_overhead';
  }
  
  if (name.includes('press') && isMachine) return 'machine_seated_push';
  if (name.includes('pec deck') || name.includes('fly machine')) return 'machine_seated_push';
  
  if (name.includes('curl') && !name.includes('leg')) {
    if (isBarbell) return 'curl_barbell';
    return 'curl_dumbbell';
  }
  
  if (name.includes('row') || name.includes('pull')) {
    if (isMachine || name.includes('lat pulldown')) return 'machine_seated_pull';
    if (isCable) return 'cable_pull';
    if (isDumbbell) return 'row_dumbbell';
    if (name.includes('pull-up') || name.includes('pullup')) return 'pullup';
    return 'row_barbell';
  }
  
  if (name.includes('deadlift')) {
    if (isDumbbell) return 'deadlift_dumbbell';
    return 'deadlift_barbell';
  }
  
  if (name.includes('fly') && !isMachine && !isCable) return 'fly_dumbbell';
  
  return 'standing';
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

  bgEquip = `<line x1="10" y1="95" x2="90" y2="95" ${floorStyle}/>`;

  if (template === 'plank') {
      head = `<circle cx="85" cy="70" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M75 70 L70 80 L35 80 L40 70 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(40, 70, 20, 85, 15, 95, 10, 8, darkColor);
      nearLeg = drawLimb(35, 80, 15, 90, 10, 95, 10, 8, baseColor);
      farArm = drawLimb(70, 70, 75, 90, 85, 95, 8, 6, darkColor);
      nearArm = drawLimb(70, 80, 75, 90, 85, 95, 8, 6, baseColor);
  }
  else if (template === 'pushup') {
      head = `<circle cx="85" cy="${isPos2 ? 80 : 70}" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M75 ${isPos2 ? 80 : 70} L70 ${isPos2 ? 85 : 80} L35 ${isPos2 ? 85 : 80} L40 ${isPos2 ? 80 : 70} Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(40, isPos2 ? 80 : 70, 20, 85, 15, 95, 10, 8, darkColor);
      nearLeg = drawLimb(35, isPos2 ? 85 : 80, 15, 90, 10, 95, 10, 8, baseColor);
      if (isPos2) {
          farArm = drawLimb(70, 80, 60, 85, 75, 95, 8, 6, darkColor);
          nearArm = drawLimb(70, 85, 60, 90, 75, 95, 8, 6, baseColor);
      } else {
          farArm = drawLimb(70, 70, 75, 85, 75, 95, 8, 6, darkColor);
          nearArm = drawLimb(70, 80, 70, 90, 70, 95, 8, 6, baseColor);
      }
  }
  else if (template === 'plank_shoulder_taps') {
      head = `<circle cx="85" cy="70" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M75 70 L70 80 L35 80 L40 70 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(40, 70, 20, 85, 15, 95, 10, 8, darkColor);
      nearLeg = drawLimb(35, 80, 15, 90, 10, 95, 10, 8, baseColor);
      if (isPos2) {
          farArm = drawLimb(70, 70, 75, 85, 75, 95, 8, 6, darkColor);
          nearArm = drawLimb(70, 80, 60, 75, 70, 70, 8, 6, baseColor);
      } else {
          farArm = drawLimb(70, 70, 75, 85, 75, 95, 8, 6, darkColor);
          nearArm = drawLimb(70, 80, 70, 90, 70, 95, 8, 6, baseColor);
      }
  }
  else if (template === 'leg_raise') {
      head = `<circle cx="20" cy="85" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M25 85 L30 95 L55 95 L50 85 Z" fill="${baseColor}"/>`;
      farArm = drawLimb(30, 85, 45, 90, 55, 95, 8, 6, darkColor);
      nearArm = drawLimb(35, 90, 50, 90, 60, 95, 8, 6, baseColor);
      if (isPos2) {
          farLeg = drawLimb(50, 85, 55, 60, 60, 35, 10, 8, darkColor);
          nearLeg = drawLimb(55, 95, 65, 70, 70, 45, 10, 8, baseColor);
      } else {
          farLeg = drawLimb(50, 85, 75, 85, 95, 85, 10, 8, darkColor);
          nearLeg = drawLimb(55, 95, 80, 95, 100, 95, 10, 8, baseColor);
      }
  }
  else if (template === 'crunch') {
      head = `<circle cx="${isPos2 ? 35 : 20}" cy="${isPos2 ? 65 : 85}" r="7" fill="${baseColor}"/>`;
      if (isPos2) {
          torso = `<path d="M40 65 L45 95 L55 95 L50 65 Z" fill="${baseColor}"/>`;
          farArm = drawLimb(45, 65, 55, 75, 60, 70, 8, 6, darkColor);
          nearArm = drawLimb(50, 65, 60, 75, 65, 70, 8, 6, baseColor);
      } else {
          torso = `<path d="M25 85 L30 95 L55 95 L50 85 Z" fill="${baseColor}"/>`;
          farArm = drawLimb(30, 85, 45, 85, 50, 75, 8, 6, darkColor);
          nearArm = drawLimb(35, 90, 50, 90, 55, 80, 8, 6, baseColor);
      }
      farLeg = drawLimb(50, 95, 70, 75, 80, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 95, 75, 80, 85, 95, 10, 8, baseColor);
  }
  else if (template === 'russian_twist') {
      head = `<circle cx="35" cy="55" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M40 55 L45 85 L55 85 L50 55 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(50, 85, 70, 70, 80, 75, 10, 8, darkColor);
      nearLeg = drawLimb(55, 85, 75, 75, 85, 80, 10, 8, baseColor);
      if (isPos2) {
          farArm = drawLimb(45, 55, 60, 65, 75, 70, 8, 6, darkColor);
          nearArm = drawLimb(50, 55, 65, 70, 75, 75, 8, 6, baseColor);
      } else {
          farArm = drawLimb(45, 55, 30, 65, 25, 70, 8, 6, darkColor);
          nearArm = drawLimb(50, 55, 35, 70, 25, 75, 8, 6, baseColor);
      }
  }
  else if (template === 'side_plank_left') {
      head = `<circle cx="75" cy="${isPos2 ? 65 : 75}" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M65 ${isPos2 ? 65 : 75} L65 ${isPos2 ? 75 : 85} L35 85 L35 75 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(35, 75, 20, 85, 10, 95, 10, 8, darkColor);
      nearLeg = drawLimb(35, 85, 20, 90, 10, 95, 10, 8, baseColor);
      farArm = drawLimb(65, 75, 70, 85, 70, 95, 8, 6, darkColor);
      nearArm = drawLimb(65, 65, 55, 60, 55, 50, 8, 6, baseColor);
  }
  else if (template === 'side_plank_right') {
      head = `<circle cx="25" cy="${isPos2 ? 65 : 75}" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M35 ${isPos2 ? 65 : 75} L35 ${isPos2 ? 75 : 85} L65 85 L65 75 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(65, 75, 80, 85, 90, 95, 10, 8, darkColor);
      nearLeg = drawLimb(65, 85, 80, 90, 90, 95, 10, 8, baseColor);
      farArm = drawLimb(35, 75, 30, 85, 30, 95, 8, 6, darkColor);
      nearArm = drawLimb(35, 65, 45, 60, 45, 50, 8, 6, baseColor);
  }
  else if (template === 'superman') {
      head = `<circle cx="85" cy="${isPos2 ? 70 : 85}" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M75 ${isPos2 ? 70 : 85} L70 95 L35 95 L40 ${isPos2 ? 70 : 85} Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(40, isPos2 ? 70 : 85, 25, isPos2 ? 65 : 95, 10, isPos2 ? 70 : 95, 10, 8, darkColor);
      nearLeg = drawLimb(35, 95, 20, isPos2 ? 75 : 95, 5, isPos2 ? 80 : 95, 10, 8, baseColor);
      farArm = drawLimb(70, isPos2 ? 70 : 85, 80, isPos2 ? 65 : 95, 90, isPos2 ? 70 : 95, 8, 6, darkColor);
      nearArm = drawLimb(75, isPos2 ? 70 : 85, 85, isPos2 ? 65 : 95, 95, isPos2 ? 70 : 95, 8, 6, baseColor);
  }
  else if (template === 'wall_sit') {
      bgEquip = `<line x1="20" y1="20" x2="20" y2="95" ${eqStyle} stroke-width="8"/>` + bgEquip;
      head = `<circle cx="35" cy="40" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M30 40 L40 40 L40 70 L30 70 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(35, 70, 70, 70, 70, 95, 10, 8, darkColor);
      nearLeg = drawLimb(40, 70, 75, 70, 75, 95, 10, 8, baseColor);
      farArm = drawLimb(35, 45, 55, 45, 70, 65, 8, 6, darkColor);
      nearArm = drawLimb(40, 45, 60, 45, 75, 65, 8, 6, baseColor);
  }
  else if (template === 'dip_chair') {
      bgEquip = `<line x1="30" y1="65" x2="45" y2="65" ${eqStyle}/> <line x1="30" y1="65" x2="30" y2="95" ${eqStyle}/> <line x1="45" y1="65" x2="45" y2="95" ${eqStyle}/>` + bgEquip;
      head = `<circle cx="55" cy="${isPos2 ? 40 : 25}" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M50 ${isPos2 ? 40 : 25} L60 ${isPos2 ? 40 : 25} L60 ${isPos2 ? 70 : 55} L50 ${isPos2 ? 70 : 55} Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(50, isPos2 ? 70 : 55, 75, 75, 95, 95, 10, 8, darkColor);
      nearLeg = drawLimb(60, isPos2 ? 70 : 55, 85, 75, 95, 95, 10, 8, baseColor);
      if (isPos2) {
          farArm = drawLimb(50, 40, 35, 40, 45, 65, 8, 6, darkColor);
          nearArm = drawLimb(60, 40, 40, 40, 45, 65, 8, 6, baseColor);
      } else {
          farArm = drawLimb(50, 25, 40, 45, 45, 65, 8, 6, darkColor);
          nearArm = drawLimb(60, 25, 45, 45, 45, 65, 8, 6, baseColor);
      }
  }
  
  // Weights + Missing templates!
  else if (template === 'all_fours_kick' || template === 'all_fours_side' || template === 'all_fours_reach') {
    head = `<circle cx="75" cy="55" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M65 60 L60 70 L30 70 L35 60 Z" fill="${baseColor}"/>`;
    farArm = drawLimb(60, 60, 60, 75, 60, 95, 8, 6, darkColor);
    nearArm = drawLimb(60, 70, 65, 80, 65, 95, 8, 6, baseColor);
    if (isPos2) {
      if (template === 'all_fours_kick') {
        farLeg = drawLimb(35, 60, 20, 50, 10, 30, 10, 8, darkColor); 
        nearLeg = drawLimb(30, 70, 30, 85, 30, 95, 10, 8, baseColor); 
      } else if (template === 'all_fours_side') {
        farLeg = drawLimb(35, 60, 35, 80, 35, 95, 10, 8, darkColor); 
        nearLeg = drawLimb(30, 70, 45, 70, 55, 85, 10, 8, baseColor); 
      } else { 
        nearArm = drawLimb(60, 70, 75, 60, 90, 50, 8, 6, baseColor); 
        farLeg = drawLimb(35, 60, 20, 60, 10, 60, 10, 8, darkColor); 
        nearLeg = drawLimb(30, 70, 30, 85, 30, 95, 10, 8, baseColor);
      }
    } else {
      farLeg = drawLimb(35, 60, 35, 80, 35, 95, 10, 8, darkColor);
      nearLeg = drawLimb(30, 70, 30, 85, 30, 95, 10, 8, baseColor);
    }
  }
  else if (template === 'glute_bridge') {
    head = `<circle cx="20" cy="85" r="7" fill="${baseColor}"/>`;
    if (isPos2) {
      torso = `<path d="M25 85 L30 90 L55 70 L50 65 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(50, 65, 75, 65, 75, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 70, 80, 70, 80, 95, 10, 8, baseColor);
    } else {
      torso = `<path d="M25 85 L30 90 L55 90 L50 85 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(50, 85, 75, 75, 75, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 90, 80, 80, 80, 95, 10, 8, baseColor);
    }
    farArm = drawLimb(30, 85, 45, 85, 60, 85, 8, 6, darkColor);
    nearArm = drawLimb(35, 90, 50, 90, 65, 90, 8, 6, baseColor);
  }
  else if (template === 'inchworm') {
    if (isPos2) { 
      head = `<circle cx="85" cy="70" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M75 70 L70 80 L35 80 L40 70 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(40, 70, 20, 85, 15, 95, 10, 8, darkColor);
      nearLeg = drawLimb(35, 80, 15, 90, 10, 95, 10, 8, baseColor);
      farArm = drawLimb(70, 70, 75, 85, 75, 95, 8, 6, darkColor);
      nearArm = drawLimb(70, 80, 70, 90, 70, 95, 8, 6, baseColor);
    } else { 
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
    if (isPos2) { 
      farLeg = drawLimb(45, 55, 30, 75, 25, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 55, 70, 75, 75, 95, 10, 8, baseColor);
      farArm = drawLimb(45, 32, 25, 20, 15, 10, 8, 6, darkColor);
      nearArm = drawLimb(55, 32, 75, 20, 85, 10, 8, 6, baseColor);
    } else { 
      farLeg = drawLimb(45, 55, 45, 75, 45, 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, 55, 55, 75, 55, 95, 10, 8, baseColor);
      farArm = drawLimb(45, 32, 40, 55, 35, 75, 8, 6, darkColor);
      nearArm = drawLimb(55, 32, 60, 55, 65, 75, 8, 6, baseColor);
    }
  }
  else if (template === 'squat_barbell') {
    head = `<circle cx="50" cy="${isPos2 ? 20 : 35}" r="7" fill="${baseColor}"/> <line x1="50" y1="${isPos2 ? 20 : 35}" x2="50" y2="${isPos2 ? 30 : 45}" stroke="${baseColor}" stroke-width="6"/>`;
    torso = drawTorso(50, isPos2 ? 30 : 45, 16, 14, 25);
    farLeg = drawLimb(45, isPos2 ? 55 : 70, 35, isPos2 ? 75 : 75, 40, 95, 11, 9, darkColor);
    nearLeg = drawLimb(55, isPos2 ? 55 : 70, 65, isPos2 ? 75 : 75, 60, 95, 11, 9, baseColor);
    farArm = drawLimb(42, isPos2 ? 32 : 47, 35, isPos2 ? 45 : 60, 42, isPos2 ? 55 : 70, 8, 6, darkColor);
    nearArm = drawLimb(58, isPos2 ? 32 : 47, 65, isPos2 ? 45 : 60, 58, isPos2 ? 55 : 70, 8, 6, baseColor);
    fgEquip = `<line x1="30" y1="${isPos2 ? 30 : 45}" x2="70" y2="${isPos2 ? 30 : 45}" ${eqStyle} stroke-width="5"/>`; 
  }
  else if (template === 'squat_dumbbell') {
      head = `<circle cx="50" cy="${isPos2 ? 20 : 35}" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, isPos2 ? 30 : 45, 16, 14, 25);
      farLeg = drawLimb(45, isPos2 ? 55 : 70, 35, isPos2 ? 75 : 75, 40, 95, 11, 9, darkColor);
      nearLeg = drawLimb(55, isPos2 ? 55 : 70, 65, isPos2 ? 75 : 75, 60, 95, 11, 9, baseColor);
      farArm = drawLimb(42, isPos2 ? 32 : 47, 42, isPos2 ? 50 : 65, 42, isPos2 ? 65 : 80, 8, 6, darkColor);
      nearArm = drawLimb(58, isPos2 ? 32 : 47, 58, isPos2 ? 50 : 65, 58, isPos2 ? 65 : 80, 8, 6, baseColor);
      fgEquip = `<circle cx="42" cy="${isPos2 ? 65 : 80}" r="4" ${eqStyle}/> <circle cx="58" cy="${isPos2 ? 65 : 80}" r="4" ${eqStyle}/>`;
  }
  else if (template === 'press_barbell_bench') {
    head = `<circle cx="75" cy="50" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M45 50 L70 50 L70 56 L45 56 Z" fill="${baseColor}"/>`; 
    farLeg = drawLimb(45, 50, 35, 65, 35, 95, 11, 9, darkColor); 
    nearLeg = drawLimb(45, 56, 45, 75, 45, 95, 11, 9, baseColor);
    bgEquip = `<line x1="30" y1="60" x2="80" y2="60" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>` + bgEquip;
    if (isPos2) { 
      farArm = drawLimb(65, 50, 65, 30, 65, 15, 8, 6, darkColor);
      nearArm = drawLimb(60, 56, 60, 35, 60, 15, 8, 6, baseColor);
      fgEquip = `<line x1="40" y1="15" x2="80" y2="15" ${eqStyle} stroke-width="5"/>`; 
    } else { 
      farArm = drawLimb(65, 50, 60, 70, 65, 45, 8, 6, darkColor);
      nearArm = drawLimb(60, 56, 55, 75, 60, 45, 8, 6, baseColor);
      fgEquip = `<line x1="40" y1="45" x2="80" y2="45" ${eqStyle} stroke-width="5"/>`; 
    }
  }
  else if (template === 'press_dumbbell_bench') {
    head = `<circle cx="75" cy="50" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M45 50 L70 50 L70 56 L45 56 Z" fill="${baseColor}"/>`;
    farLeg = drawLimb(45, 50, 35, 65, 35, 95, 11, 9, darkColor);
    nearLeg = drawLimb(45, 56, 45, 75, 45, 95, 11, 9, baseColor);
    bgEquip = `<line x1="30" y1="60" x2="80" y2="60" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>` + bgEquip;
    if (isPos2) { 
      farArm = drawLimb(65, 50, 65, 30, 65, 15, 8, 6, darkColor);
      nearArm = drawLimb(60, 56, 60, 35, 60, 15, 8, 6, baseColor);
      fgEquip = `<circle cx="65" cy="15" r="4" ${eqStyle}/> <circle cx="60" cy="15" r="4" ${eqStyle}/>`; 
    } else {
      farArm = drawLimb(65, 50, 60, 70, 65, 45, 8, 6, darkColor);
      nearArm = drawLimb(60, 56, 55, 75, 60, 45, 8, 6, baseColor);
      fgEquip = `<circle cx="65" cy="45" r="4" ${eqStyle}/> <circle cx="60" cy="45" r="4" ${eqStyle}/>`;
    }
  }
  else if (template === 'press_barbell_overhead') {
      head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, 30, 16, 14, 25);
      farLeg = drawLimb(45, 55, 45, 75, 45, 95, 11, 9, darkColor);
      nearLeg = drawLimb(55, 55, 55, 75, 55, 95, 11, 9, baseColor);
      if (isPos2) {
          farArm = drawLimb(42, 32, 42, 15, 42, 5, 8, 6, darkColor);
          nearArm = drawLimb(58, 32, 58, 15, 58, 5, 8, 6, baseColor);
          fgEquip = `<line x1="30" y1="5" x2="70" y2="5" ${eqStyle}/>`;
      } else {
          farArm = drawLimb(42, 32, 35, 45, 42, 35, 8, 6, darkColor);
          nearArm = drawLimb(58, 32, 65, 45, 58, 35, 8, 6, baseColor);
          fgEquip = `<line x1="30" y1="35" x2="70" y2="35" ${eqStyle}/>`;
      }
  }
  else if (template === 'press_dumbbell_overhead') {
      head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, 30, 16, 14, 25);
      farLeg = drawLimb(45, 55, 45, 75, 45, 95, 11, 9, darkColor);
      nearLeg = drawLimb(55, 55, 55, 75, 55, 95, 11, 9, baseColor);
      if (isPos2) {
          farArm = drawLimb(42, 32, 42, 15, 42, 5, 8, 6, darkColor);
          nearArm = drawLimb(58, 32, 58, 15, 58, 5, 8, 6, baseColor);
          fgEquip = `<circle cx="42" cy="5" r="4" ${eqStyle}/> <circle cx="58" cy="5" r="4" ${eqStyle}/>`;
      } else {
          farArm = drawLimb(42, 32, 35, 45, 42, 35, 8, 6, darkColor);
          nearArm = drawLimb(58, 32, 65, 45, 58, 35, 8, 6, baseColor);
          fgEquip = `<circle cx="42" cy="35" r="4" ${eqStyle}/> <circle cx="58" cy="35" r="4" ${eqStyle}/>`;
      }
  }
  else if (template === 'machine_seated_push' || template === 'machine_seated_pull') {
    head = `<circle cx="40" cy="30" r="7" fill="${baseColor}"/>`;
    torso = drawTorso(40, 40, 16, 16, 25);
    farLeg = drawLimb(40, 65, 55, 75, 55, 95, 11, 9, darkColor);
    nearLeg = drawLimb(40, 65, 65, 75, 65, 95, 11, 9, baseColor);
    bgEquip = `<rect x="25" y="40" width="10" height="40" fill="#cbd5e1" rx="2"/> <rect x="35" y="65" width="20" height="10" fill="#94a3b8" rx="2"/>` + bgEquip; 
    if (isPos2) { 
      farArm = drawLimb(40, 45, 65, 45, 85, 45, 8, 6, darkColor);
      nearArm = drawLimb(40, 45, 70, 45, 90, 45, 8, 6, baseColor);
      fgEquip = `<rect x="85" y="40" width="5" height="10" fill="#64748b"/>`; 
    } else { 
      farArm = drawLimb(40, 45, 30, 55, 50, 50, 8, 6, darkColor);
      nearArm = drawLimb(40, 45, 35, 60, 55, 55, 8, 6, baseColor);
      fgEquip = `<rect x="50" y="45" width="5" height="10" fill="#64748b"/>`;
    }
  }
  else if (template === 'curl_dumbbell') {
      head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, 30, 16, 14, 25);
      farLeg = drawLimb(45, 55, 45, 75, 45, 95, 11, 9, darkColor);
      nearLeg = drawLimb(55, 55, 55, 75, 55, 95, 11, 9, baseColor);
      if (isPos2) { // Curled up
          farArm = drawLimb(42, 32, 42, 50, 42, 35, 8, 6, darkColor);
          nearArm = drawLimb(58, 32, 58, 50, 58, 35, 8, 6, baseColor);
          fgEquip = `<circle cx="42" cy="35" r="4" ${eqStyle}/> <circle cx="58" cy="35" r="4" ${eqStyle}/>`;
      } else { // Down
          farArm = drawLimb(42, 32, 42, 50, 42, 65, 8, 6, darkColor);
          nearArm = drawLimb(58, 32, 58, 50, 58, 65, 8, 6, baseColor);
          fgEquip = `<circle cx="42" cy="65" r="4" ${eqStyle}/> <circle cx="58" cy="65" r="4" ${eqStyle}/>`;
      }
  }
  else if (template === 'curl_barbell') {
      head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, 30, 16, 14, 25);
      farLeg = drawLimb(45, 55, 45, 75, 45, 95, 11, 9, darkColor);
      nearLeg = drawLimb(55, 55, 55, 75, 55, 95, 11, 9, baseColor);
      if (isPos2) { 
          farArm = drawLimb(42, 32, 42, 50, 42, 35, 8, 6, darkColor);
          nearArm = drawLimb(58, 32, 58, 50, 58, 35, 8, 6, baseColor);
          fgEquip = `<line x1="30" y1="35" x2="70" y2="35" ${eqStyle}/>`;
      } else { 
          farArm = drawLimb(42, 32, 42, 50, 42, 65, 8, 6, darkColor);
          nearArm = drawLimb(58, 32, 58, 50, 58, 65, 8, 6, baseColor);
          fgEquip = `<line x1="30" y1="65" x2="70" y2="65" ${eqStyle}/>`;
      }
  }
  else if (template === 'row_barbell' || template === 'deadlift_barbell') {
    head = `<circle cx="70" cy="${isPos2 ? 30 : 40}" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M65 ${isPos2 ? 40 : 50} L45 55 L45 65 L65 ${isPos2 ? 50 : 60} Z" fill="${baseColor}"/>`; 
    farLeg = drawLimb(45, 55, 45, 75, 45, 95, 11, 9, darkColor);
    nearLeg = drawLimb(45, 65, 50, 80, 50, 95, 11, 9, baseColor);
    if (isPos2) { 
      farArm = drawLimb(65, 40, 55, 60, 50, 55, 8, 6, darkColor);
      nearArm = drawLimb(65, 50, 60, 70, 55, 65, 8, 6, baseColor);
      fgEquip = `<line x1="30" y1="60" x2="70" y2="60" ${eqStyle} stroke-width="5"/>`; 
    } else { 
      farArm = drawLimb(65, 50, 55, 70, 50, 85, 8, 6, darkColor);
      nearArm = drawLimb(65, 60, 60, 80, 55, 90, 8, 6, baseColor);
      fgEquip = `<line x1="30" y1="88" x2="70" y2="88" ${eqStyle} stroke-width="5"/>`;
    }
  }
  else if (template === 'row_dumbbell' || template === 'deadlift_dumbbell') {
    head = `<circle cx="70" cy="${isPos2 ? 30 : 40}" r="7" fill="${baseColor}"/>`;
    torso = `<path d="M65 ${isPos2 ? 40 : 50} L45 55 L45 65 L65 ${isPos2 ? 50 : 60} Z" fill="${baseColor}"/>`; 
    farLeg = drawLimb(45, 55, 45, 75, 45, 95, 11, 9, darkColor);
    nearLeg = drawLimb(45, 65, 50, 80, 50, 95, 11, 9, baseColor);
    if (isPos2) {
      farArm = drawLimb(65, 40, 55, 60, 50, 55, 8, 6, darkColor);
      nearArm = drawLimb(65, 50, 60, 70, 55, 65, 8, 6, baseColor);
      fgEquip = `<circle cx="50" cy="55" r="4" ${eqStyle}/> <circle cx="55" cy="65" r="4" ${eqStyle}/>`; 
    } else {
      farArm = drawLimb(65, 50, 55, 70, 50, 85, 8, 6, darkColor);
      nearArm = drawLimb(65, 60, 60, 80, 55, 90, 8, 6, baseColor);
      fgEquip = `<circle cx="50" cy="85" r="4" ${eqStyle}/> <circle cx="55" cy="90" r="4" ${eqStyle}/>`;
    }
  }
  else if (template === 'machine_leg_press') {
      head = `<circle cx="20" cy="70" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M25 70 L30 75 L60 85 L55 80 Z" fill="${baseColor}"/>`;
      farArm = drawLimb(30, 75, 40, 80, 45, 85, 8, 6, darkColor);
      nearArm = drawLimb(35, 75, 45, 80, 50, 85, 8, 6, baseColor);
      bgEquip = `<line x1="10" y1="90" x2="50" y2="90" stroke="#cbd5e1" stroke-width="8"/>` + bgEquip;
      if (isPos2) {
          farLeg = drawLimb(55, 80, 75, 60, 90, 45, 11, 9, darkColor);
          nearLeg = drawLimb(60, 85, 80, 65, 95, 50, 11, 9, baseColor);
          fgEquip = `<line x1="85" y1="35" x2="100" y2="55" ${eqStyle}/> <rect x="90" y="45" width="10" height="20" fill="#64748b"/>`;
      } else {
          farLeg = drawLimb(55, 80, 65, 65, 70, 75, 11, 9, darkColor);
          nearLeg = drawLimb(60, 85, 70, 70, 75, 80, 11, 9, baseColor);
          fgEquip = `<line x1="65" y1="65" x2="80" y2="85" ${eqStyle}/> <rect x="70" y="75" width="10" height="20" fill="#64748b"/>`;
      }
  }
  else if (template === 'machine_leg_ext') {
      head = `<circle cx="35" cy="30" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(35, 40, 16, 16, 25);
      farArm = drawLimb(35, 45, 30, 60, 30, 65, 8, 6, darkColor);
      nearArm = drawLimb(35, 45, 40, 60, 40, 65, 8, 6, baseColor);
      bgEquip = `<rect x="20" y="40" width="10" height="30" fill="#cbd5e1" rx="2"/> <rect x="30" y="65" width="20" height="10" fill="#94a3b8" rx="2"/>` + bgEquip;
      if (isPos2) {
          farLeg = drawLimb(35, 65, 55, 65, 75, 65, 11, 9, darkColor);
          nearLeg = drawLimb(35, 65, 60, 65, 80, 65, 11, 9, baseColor);
          fgEquip = `<circle cx="75" cy="65" r="8" fill="#64748b"/> <line x1="50" y1="65" x2="75" y2="65" ${eqStyle}/>`;
      } else {
          farLeg = drawLimb(35, 65, 50, 75, 50, 95, 11, 9, darkColor);
          nearLeg = drawLimb(35, 65, 55, 75, 55, 95, 11, 9, baseColor);
          fgEquip = `<circle cx="50" cy="90" r="8" fill="#64748b"/> <line x1="50" y1="65" x2="50" y2="90" ${eqStyle}/>`;
      }
  }
  else if (template === 'fly_dumbbell') {
      head = `<circle cx="75" cy="50" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M45 50 L70 50 L70 56 L45 56 Z" fill="${baseColor}"/>`;
      farLeg = drawLimb(45, 50, 35, 65, 35, 95, 11, 9, darkColor);
      nearLeg = drawLimb(45, 56, 45, 75, 45, 95, 11, 9, baseColor);
      bgEquip = `<line x1="30" y1="60" x2="80" y2="60" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>` + bgEquip;
      if (isPos2) {
          farArm = drawLimb(65, 50, 65, 30, 65, 15, 8, 6, darkColor);
          nearArm = drawLimb(60, 56, 60, 35, 60, 15, 8, 6, baseColor);
          fgEquip = `<circle cx="65" cy="15" r="4" ${eqStyle}/> <circle cx="60" cy="15" r="4" ${eqStyle}/>`; 
      } else { // arms out wide
          farArm = drawLimb(65, 50, 70, 70, 75, 85, 8, 6, darkColor);
          nearArm = drawLimb(60, 56, 45, 75, 40, 90, 8, 6, baseColor);
          fgEquip = `<circle cx="75" cy="85" r="4" ${eqStyle}/> <circle cx="40" cy="90" r="4" ${eqStyle}/>`;
      }
  }
  else if (template === 'pullup') {
      bgEquip = `<line x1="30" y1="10" x2="70" y2="10" ${eqStyle}/>` + bgEquip; // bar
      head = `<circle cx="50" cy="${isPos2 ? 15 : 30}" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, isPos2 ? 25 : 40, 16, 12, 25);
      farLeg = drawLimb(45, isPos2 ? 50 : 65, 45, isPos2 ? 70 : 85, 45, isPos2 ? 80 : 95, 10, 8, darkColor);
      nearLeg = drawLimb(55, isPos2 ? 50 : 65, 55, isPos2 ? 70 : 85, 55, isPos2 ? 80 : 95, 10, 8, baseColor);
      if (isPos2) { // up
          farArm = drawLimb(42, 25, 35, 20, 42, 10, 8, 6, darkColor);
          nearArm = drawLimb(58, 25, 65, 20, 58, 10, 8, 6, baseColor);
      } else { // hanging down
          farArm = drawLimb(42, 40, 35, 25, 42, 10, 8, 6, darkColor);
          nearArm = drawLimb(58, 40, 65, 25, 58, 10, 8, 6, baseColor);
      }
  }
  else if (template === 'running_treadmill' || template === 'mountain_climbers' || template === 'stair_climber' || template === 'power_skip') {
      head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, 30, 16, 12, 25);
      if (isPos2) { 
        farLeg = drawLimb(45, 55, 30, 75, 30, 95, 11, 9, darkColor);
        nearLeg = drawLimb(55, 55, 65, 75, 50, 95, 11, 9, baseColor);
        farArm = drawLimb(42, 32, 30, 45, 35, 60, 8, 6, darkColor);
        nearArm = drawLimb(58, 32, 70, 40, 65, 30, 8, 6, baseColor);
      } else { 
        farLeg = drawLimb(45, 55, 65, 75, 50, 95, 11, 9, darkColor);
        nearLeg = drawLimb(55, 55, 30, 75, 30, 95, 11, 9, baseColor);
        farArm = drawLimb(42, 32, 70, 40, 65, 30, 8, 6, darkColor);
        nearArm = drawLimb(58, 32, 30, 45, 35, 60, 8, 6, baseColor);
      }
      if (template === 'stair_climber') {
          bgEquip = `<path d="M10 95 L40 95 L40 75 L70 75 L70 55" fill="none" stroke="#cbd5e1" stroke-width="8"/>` + bgEquip;
      }
  }
  else if (template === 'elliptical') {
      head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, 30, 16, 12, 25);
      if (isPos2) { 
        farLeg = drawLimb(45, 55, 35, 75, 35, 90, 11, 9, darkColor);
        nearLeg = drawLimb(55, 55, 65, 75, 65, 90, 11, 9, baseColor);
        farArm = drawLimb(42, 32, 35, 50, 35, 75, 8, 6, darkColor);
        nearArm = drawLimb(58, 32, 65, 50, 65, 75, 8, 6, baseColor);
      } else { 
        farLeg = drawLimb(45, 55, 65, 75, 65, 90, 11, 9, darkColor);
        nearLeg = drawLimb(55, 55, 35, 75, 35, 90, 11, 9, baseColor);
        farArm = drawLimb(42, 32, 65, 50, 65, 75, 8, 6, darkColor);
        nearArm = drawLimb(58, 32, 35, 50, 35, 75, 8, 6, baseColor);
      }
      bgEquip = `<circle cx="50" cy="90" r="20" fill="none" stroke="#cbd5e1" stroke-width="5"/>` + bgEquip;
  }
  else if (template === 'cycling') {
      head = `<circle cx="45" cy="30" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M40 40 L50 40 L55 60 L45 60 Z" fill="${baseColor}"/>`;
      farArm = drawLimb(40, 40, 25, 50, 25, 50, 8, 6, darkColor);
      nearArm = drawLimb(50, 40, 30, 50, 30, 50, 8, 6, baseColor);
      if (isPos2) { 
        farLeg = drawLimb(45, 60, 45, 80, 50, 90, 11, 9, darkColor);
        nearLeg = drawLimb(55, 60, 65, 70, 70, 75, 11, 9, baseColor);
      } else { 
        farLeg = drawLimb(45, 60, 60, 70, 65, 75, 11, 9, darkColor);
        nearLeg = drawLimb(55, 60, 50, 80, 55, 90, 11, 9, baseColor);
      }
      bgEquip = `<circle cx="50" cy="80" r="15" fill="none" stroke="#cbd5e1" stroke-width="4"/> <line x1="25" y1="50" x2="35" y2="80" stroke="#cbd5e1" stroke-width="6"/>` + bgEquip;
  }
  else if (template === 'rowing_erg') {
      head = `<circle cx="${isPos2 ? 35 : 65}" cy="50" r="7" fill="${baseColor}"/>`;
      if (isPos2) {
          torso = `<path d="M30 60 L40 60 L45 80 L35 80 Z" fill="${baseColor}"/>`;
          farLeg = drawLimb(35, 80, 55, 80, 75, 80, 11, 9, darkColor);
          nearLeg = drawLimb(45, 80, 65, 80, 85, 80, 11, 9, baseColor);
          farArm = drawLimb(30, 60, 50, 65, 65, 65, 8, 6, darkColor);
          nearArm = drawLimb(40, 60, 60, 65, 75, 65, 8, 6, baseColor);
      } else {
          torso = `<path d="M60 60 L70 60 L60 80 L50 80 Z" fill="${baseColor}"/>`;
          farLeg = drawLimb(50, 80, 60, 70, 75, 80, 11, 9, darkColor);
          nearLeg = drawLimb(60, 80, 70, 70, 85, 80, 11, 9, baseColor);
          farArm = drawLimb(60, 60, 75, 65, 85, 65, 8, 6, darkColor);
          nearArm = drawLimb(70, 60, 85, 65, 95, 65, 8, 6, baseColor);
      }
      bgEquip = `<line x1="10" y1="85" x2="90" y2="85" stroke="#cbd5e1" stroke-width="6"/> <rect x="75" y="75" width="10" height="10" fill="#94a3b8"/>` + bgEquip;
  }
  else if (template === 'jump_rope') {
      head = `<circle cx="50" cy="${isPos2 ? 15 : 20}" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, isPos2 ? 25 : 30, 16, 12, 25);
      farLeg = drawLimb(45, isPos2 ? 50 : 55, 45, isPos2 ? 70 : 75, 45, isPos2 ? 85 : 95, 11, 9, darkColor);
      nearLeg = drawLimb(55, isPos2 ? 50 : 55, 55, isPos2 ? 70 : 75, 55, isPos2 ? 85 : 95, 11, 9, baseColor);
      farArm = drawLimb(42, isPos2 ? 27 : 32, 35, isPos2 ? 45 : 50, 25, isPos2 ? 55 : 60, 8, 6, darkColor);
      nearArm = drawLimb(58, isPos2 ? 27 : 32, 65, isPos2 ? 45 : 50, 75, isPos2 ? 55 : 60, 8, 6, baseColor);
      if (isPos2) {
          fgEquip = `<path d="M25 55 Q50 -10 75 55" fill="none" stroke="#94a3b8" stroke-width="2"/>`;
      } else {
          fgEquip = `<path d="M25 60 Q50 110 75 60" fill="none" stroke="#94a3b8" stroke-width="2"/>`;
      }
  }
  else if (template === 'boxing' || template === 'battle_ropes' || template === 'med_ball_slam') {
      head = `<circle cx="45" cy="25" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(45, 35, 16, 12, 25);
      farLeg = drawLimb(40, 60, 35, 75, 30, 95, 11, 9, darkColor);
      nearLeg = drawLimb(50, 60, 60, 75, 65, 95, 11, 9, baseColor);
      if (isPos2) { 
        farArm = drawLimb(37, 37, 30, 40, 20, 35, 8, 6, darkColor);
        nearArm = drawLimb(53, 37, 75, 35, 90, 35, 8, 6, baseColor);
      } else { 
        farArm = drawLimb(37, 37, 25, 35, 15, 35, 8, 6, darkColor);
        nearArm = drawLimb(53, 37, 60, 45, 50, 35, 8, 6, baseColor);
      }
  }
  else if (template === 'squat_jump' || template === 'box_jump' || template === 'broad_jump' || template === 'tuck_jump') {
      head = `<circle cx="50" cy="${isPos2 ? 15 : 35}" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, isPos2 ? 25 : 45, 16, 14, 25);
      if (isPos2) {
          farLeg = drawLimb(45, 50, 45, 60, 45, 70, 11, 9, darkColor);
          nearLeg = drawLimb(55, 50, 55, 60, 55, 70, 11, 9, baseColor);
          farArm = drawLimb(42, 27, 42, 10, 42, 5, 8, 6, darkColor);
          nearArm = drawLimb(58, 27, 58, 10, 58, 5, 8, 6, baseColor);
      } else {
          farLeg = drawLimb(45, 70, 35, 80, 40, 95, 11, 9, darkColor);
          nearLeg = drawLimb(55, 70, 65, 80, 60, 95, 11, 9, baseColor);
          farArm = drawLimb(42, 47, 35, 60, 25, 70, 8, 6, darkColor);
          nearArm = drawLimb(58, 47, 65, 60, 75, 70, 8, 6, baseColor);
      }
      if (template === 'box_jump') {
          bgEquip = `<rect x="60" y="70" width="30" height="25" fill="#cbd5e1"/>` + bgEquip;
      }
  }
  else if (template === 'lateral_shuffle' || template === 'skater_jumps' || template === 'jumping_lunge' || template === 'step_aerobics' || template === 'zumba') {
      head = `<circle cx="${isPos2 ? 60 : 40}" cy="25" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(isPos2 ? 60 : 40, 35, 16, 14, 25);
      if (isPos2) {
          farLeg = drawLimb(55, 60, 45, 75, 55, 95, 11, 9, darkColor);
          nearLeg = drawLimb(65, 60, 85, 75, 95, 95, 11, 9, baseColor);
          farArm = drawLimb(52, 37, 40, 45, 30, 40, 8, 6, darkColor);
          nearArm = drawLimb(68, 37, 80, 45, 90, 40, 8, 6, baseColor);
      } else {
          farLeg = drawLimb(35, 60, 15, 75, 5, 95, 11, 9, darkColor);
          nearLeg = drawLimb(45, 60, 55, 75, 45, 95, 11, 9, baseColor);
          farArm = drawLimb(32, 37, 20, 45, 10, 40, 8, 6, darkColor);
          nearArm = drawLimb(48, 37, 60, 45, 70, 40, 8, 6, baseColor);
      }
  }
  else {
      // Very robust fallback that looks like generic standing or moving.
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
  if (startUrl.startsWith('/icons/') && shouldTouch(name)) {
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

console.log(`Successfully updated SVGs for ${exercises.length} exercises!`);
