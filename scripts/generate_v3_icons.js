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
  else if (template === 'running_treadmill' || template === 'treadmill') {
      bgEquip = `<line x1="10" y1="95" x2="90" y2="95" ${eqStyle} stroke-width="8"/> <line x1="20" y1="95" x2="40" y2="60" ${eqStyle}/> <line x1="40" y1="60" x2="50" y2="60" ${eqStyle}/>`;
      head = `<circle cx="55" cy="25" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M50 25 L60 25 L55 55 L45 55 Z" fill="${baseColor}"/>`;
      if (isPos2) {
          farLeg = drawLimb(45, 55, 30, 65, 35, 95, 10, 8, darkColor);
          nearLeg = drawLimb(55, 55, 70, 75, 75, 85, 10, 8, baseColor);
          farArm = drawLimb(50, 25, 65, 35, 70, 20, 8, 6, darkColor);
          nearArm = drawLimb(60, 25, 45, 35, 40, 20, 8, 6, baseColor);
      } else {
          farLeg = drawLimb(45, 55, 60, 75, 65, 85, 10, 8, darkColor);
          nearLeg = drawLimb(55, 55, 40, 65, 45, 95, 10, 8, baseColor);
          farArm = drawLimb(50, 25, 35, 35, 30, 20, 8, 6, darkColor);
          nearArm = drawLimb(60, 25, 75, 35, 80, 20, 8, 6, baseColor);
      }
  }
  else if (template === 'elliptical') {
      bgEquip = `<ellipse cx="50" cy="85" rx="30" ry="10" stroke="#94a3b8" fill="none" stroke-width="4"/> <line x1="40" y1="85" x2="30" y2="30" ${eqStyle}/> <line x1="60" y1="85" x2="70" y2="30" ${eqStyle}/>`;
      head = `<circle cx="50" cy="20" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M45 20 L55 20 L55 50 L45 50 Z" fill="${baseColor}"/>`;
      if (isPos2) {
          farLeg = drawLimb(45, 50, 40, 65, 20, 85, 10, 8, darkColor);
          nearLeg = drawLimb(55, 50, 60, 65, 80, 85, 10, 8, baseColor);
          farArm = drawLimb(45, 20, 35, 35, 30, 30, 8, 6, darkColor);
          nearArm = drawLimb(55, 20, 65, 35, 70, 30, 8, 6, baseColor);
      } else {
          farLeg = drawLimb(45, 50, 60, 65, 80, 85, 10, 8, darkColor);
          nearLeg = drawLimb(55, 50, 40, 65, 20, 85, 10, 8, baseColor);
          farArm = drawLimb(45, 20, 65, 35, 70, 30, 8, 6, darkColor);
          nearArm = drawLimb(55, 20, 35, 35, 30, 30, 8, 6, baseColor);
      }
  }
  else if (template === 'cycling') {
      bgEquip = `<circle cx="30" cy="80" r="15" fill="none" stroke="#94a3b8" stroke-width="4"/> <circle cx="70" cy="80" r="15" fill="none" stroke="#94a3b8" stroke-width="4"/> <line x1="30" y1="80" x2="50" y2="80" ${eqStyle}/> <line x1="50" y1="80" x2="40" y2="50" ${eqStyle}/> <line x1="50" y1="80" x2="60" y2="50" ${eqStyle}/> <line x1="60" y1="50" x2="70" y2="80" ${eqStyle}/> <circle cx="50" cy="80" r="4" ${eqStyle}/>`;
      head = `<circle cx="45" cy="30" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M40 30 L50 30 L45 50 L35 50 Z" fill="${baseColor}"/>`;
      farArm = drawLimb(40, 30, 50, 40, 60, 50, 8, 6, darkColor);
      nearArm = drawLimb(50, 30, 60, 40, 60, 50, 8, 6, baseColor);
      if (isPos2) {
          farLeg = drawLimb(35, 50, 45, 65, 50, 75, 10, 8, darkColor);
          nearLeg = drawLimb(45, 50, 55, 60, 50, 70, 10, 8, baseColor);
      } else {
          farLeg = drawLimb(35, 50, 45, 60, 50, 70, 10, 8, darkColor);
          nearLeg = drawLimb(45, 50, 55, 65, 50, 75, 10, 8, baseColor);
      }
  }
  else if (template === 'rowing_erg') {
      bgEquip = `<line x1="10" y1="95" x2="90" y2="95" ${floorStyle}/> <line x1="20" y1="95" x2="30" y2="85" ${eqStyle}/> <line x1="30" y1="85" x2="70" y2="85" ${eqStyle}/> <rect x="70" y="70" width="10" height="25" fill="#94a3b8"/>`;
      head = `<circle cx="${isPos2 ? 35 : 55}" cy="50" r="7" fill="${baseColor}"/>`;
      if (isPos2) {
          torso = `<path d="M30 50 L40 50 L45 80 L35 80 Z" fill="${baseColor}"/>`;
          farLeg = drawLimb(35, 80, 55, 80, 75, 85, 10, 8, darkColor);
          nearLeg = drawLimb(45, 80, 65, 80, 75, 85, 10, 8, baseColor);
          farArm = drawLimb(30, 50, 40, 60, 50, 65, 8, 6, darkColor);
          nearArm = drawLimb(40, 50, 50, 60, 60, 65, 8, 6, baseColor);
          fgEquip = `<line x1="60" y1="65" x2="70" y2="75" ${eqStyle}/>`;
      } else {
          torso = `<path d="M50 50 L60 50 L45 80 L35 80 Z" fill="${baseColor}"/>`;
          farLeg = drawLimb(35, 80, 60, 70, 75, 85, 10, 8, darkColor);
          nearLeg = drawLimb(45, 80, 70, 70, 75, 85, 10, 8, baseColor);
          farArm = drawLimb(50, 50, 60, 50, 70, 65, 8, 6, darkColor);
          nearArm = drawLimb(60, 50, 70, 50, 75, 65, 8, 6, baseColor);
          fgEquip = `<line x1="75" y1="65" x2="75" y2="75" ${eqStyle}/>`;
      }
  }
  else if (template === 'jump_rope') {
      head = `<circle cx="50" cy="${isPos2 ? 15 : 25}" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, isPos2 ? 15 : 25, 16, 12, 25);
      if (isPos2) {
          farLeg = drawLimb(45, 40, 45, 55, 40, 75, 10, 8, darkColor);
          nearLeg = drawLimb(55, 40, 55, 55, 60, 75, 10, 8, baseColor);
          farArm = drawLimb(45, 15, 30, 30, 35, 45, 8, 6, darkColor);
          nearArm = drawLimb(55, 15, 70, 30, 65, 45, 8, 6, baseColor);
          fgEquip = `<path d="M35 45 Q50 95 65 45" fill="none" stroke="#94a3b8" stroke-width="2"/>`;
      } else {
          farLeg = drawLimb(45, 50, 45, 70, 45, 95, 10, 8, darkColor);
          nearLeg = drawLimb(55, 50, 55, 70, 55, 95, 10, 8, baseColor);
          farArm = drawLimb(45, 25, 30, 40, 35, 55, 8, 6, darkColor);
          nearArm = drawLimb(55, 25, 70, 40, 65, 55, 8, 6, baseColor);
          fgEquip = `<path d="M35 55 Q50 10 65 55" fill="none" stroke="#94a3b8" stroke-width="2"/>`;
      }
  }
  else if (template === 'burpee') {
      if (isPos2) {
          head = `<circle cx="50" cy="15" r="7" fill="${baseColor}"/>`;
          torso = drawTorso(50, 20, 16, 12, 25);
          farLeg = drawLimb(45, 45, 45, 60, 45, 75, 10, 8, darkColor);
          nearLeg = drawLimb(55, 45, 55, 60, 55, 75, 10, 8, baseColor);
          farArm = drawLimb(45, 20, 45, 5, 45, 0, 8, 6, darkColor);
          nearArm = drawLimb(55, 20, 55, 5, 55, 0, 8, 6, baseColor);
      } else {
          head = `<circle cx="85" cy="75" r="7" fill="${baseColor}"/>`;
          torso = `<path d="M75 75 L70 85 L35 85 L40 75 Z" fill="${baseColor}"/>`;
          farLeg = drawLimb(40, 75, 20, 90, 15, 95, 10, 8, darkColor);
          nearLeg = drawLimb(35, 85, 15, 95, 10, 95, 10, 8, baseColor);
          farArm = drawLimb(70, 75, 75, 90, 75, 95, 8, 6, darkColor); 
          nearArm = drawLimb(70, 85, 75, 95, 75, 95, 8, 6, baseColor);
      }
  }
  else if (template === 'stair_climber') {
      bgEquip = `<line x1="10" y1="95" x2="90" y2="95" ${floorStyle}/> <line x1="20" y1="95" x2="50" y2="60" ${eqStyle}/> <line x1="50" y1="60" x2="60" y2="60" ${eqStyle}/>`;
      head = `<circle cx="65" cy="25" r="7" fill="${baseColor}"/>`;
      torso = `<path d="M60 25 L70 25 L65 55 L55 55 Z" fill="${baseColor}"/>`;
      if (isPos2) {
          farLeg = drawLimb(55, 55, 40, 65, 45, 95, 10, 8, darkColor);
          nearLeg = drawLimb(65, 55, 50, 70, 50, 85, 10, 8, baseColor); // knee high stepping up
          farArm = drawLimb(60, 25, 75, 35, 80, 20, 8, 6, darkColor);
          nearArm = drawLimb(70, 25, 55, 35, 50, 20, 8, 6, baseColor);
      } else {
          farLeg = drawLimb(55, 55, 50, 70, 50, 85, 10, 8, darkColor);
          nearLeg = drawLimb(65, 55, 40, 65, 45, 95, 10, 8, baseColor);
          farArm = drawLimb(60, 25, 55, 35, 50, 20, 8, 6, darkColor);
          nearArm = drawLimb(70, 25, 75, 35, 80, 20, 8, 6, baseColor);
      }
  }
  else if (template === 'squat_dumbbell') {
      head = `<circle cx="50" cy="${isPos2 ? 20 : 35}" r="7" fill="${baseColor}"/>`;
      torso = drawTorso(50, isPos2 ? 30 : 45, 16, 14, 25);
      farLeg = drawLimb(45, isPos2 ? 55 : 70, 35, isPos2 ? 75 : 75, 40, 95, 11, 9, darkColor);
      nearLeg = drawLimb(55, isPos2 ? 55 : 70, 65, isPos2 ? 75 : 75, 60, 95, 11, 9, baseColor);
      farArm = drawLimb(42, isPos2 ? 32 : 47, 42, isPos2 ? 50 : 65, 42, isPos2 ? 65 : 80, 8, 6, darkColor); // arms down
      nearArm = drawLimb(58, isPos2 ? 32 : 47, 58, isPos2 ? 50 : 65, 58, isPos2 ? 65 : 80, 8, 6, baseColor);
      fgEquip = `<circle cx="42" cy="${isPos2 ? 65 : 80}" r="4" ${eqStyle}/> <circle cx="58" cy="${isPos2 ? 65 : 80}" r="4" ${eqStyle}/>`; // Dumbbells in hands
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
  else {
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
