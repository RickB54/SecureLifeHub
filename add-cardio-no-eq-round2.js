const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'components/gdft/lib/data.ts');

const newCardioExercises = `
  {
    id: generateId(),
    name: "Stairmaster",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs", "Glutes"],
    equipment: "Machine",
    description: "Step onto the moving stairs and maintain an upright posture. Push through your full foot, especially the heel, to engage your glutes and hamstrings. Do not lean heavily on the handrails.",
    startPositionUrl: "stairmaster.svg",
    settings: { time: 20, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Assault Bike",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "Machine",
    description: "Sit on the assault bike and use both your arms and legs to pedal and push/pull the handles simultaneously. The harder you work, the greater the resistance.",
    startPositionUrl: "assault-bike.svg",
    settings: { time: 10, distance: 3 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Agility Ladder Drills",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs", "Core"],
    equipment: "None",
    description: "Perform fast-paced footwork drills through an agility ladder laid flat on the floor (like high knees, lateral shuffles, or icky shuffle). Focus on speed, coordination, and minimal ground contact time.",
    startPositionUrl: "agility-ladder-drills.svg",
    settings: { time: 15, distance: 0 } as CardioSettings,
  },
`;

const newNoEqExercises = `
  {
    id: generateId(),
    name: "Pistol Squats",
    category: "No Equipment",
    muscleGroups: ["Quadriceps", "Glutes", "Core"],
    equipment: "None",
    description: "Stand on one leg with the other leg extended straight out in front of you. Lower your body into a deep squat on the standing leg, keeping your extended leg off the floor. Push back up to the starting position.",
    startPositionUrl: "pistol-squats.svg",
    settings: { time: 0, sets: 3, reps: 5 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Handstand Pushups",
    category: "No Equipment",
    muscleGroups: ["Shoulders", "Triceps", "Core"],
    equipment: "None",
    description: "Kick up into a handstand against a wall. Lower your body by bending your elbows until your head gently touches the floor, then press back up until your arms are fully extended.",
    startPositionUrl: "handstand-pushups.svg",
    settings: { time: 0, sets: 3, reps: 8 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Bear Crawls",
    category: "No Equipment",
    muscleGroups: ["Full Body", "Core", "Shoulders"],
    equipment: "None",
    description: "Start on all fours with your knees hovering just above the ground. Crawl forward by moving your opposite hand and foot simultaneously. Keep your back flat and core tight throughout the movement.",
    startPositionUrl: "bear-crawls.svg",
    settings: { time: 60, sets: 3, reps: 1 } as NoEquipmentSettings,
  },
`;

try {
  let content = fs.readFileSync(dataFile, 'utf-8');
  
  if (content.includes('Stairmaster') || content.includes('Pistol Squats')) {
    console.log('The new Cardio/No Equipment exercises are already present in data.ts.');
    process.exit(0);
  }

  // Insert exactly after "export const cardioExercises: Exercise[] = ["
  const cardioTargetStr = 'export const cardioExercises: Exercise[] = [';
  const cardioIndex = content.indexOf(cardioTargetStr);
  
  if (cardioIndex !== -1) {
    const insertPos = cardioIndex + cardioTargetStr.length;
    content = content.substring(0, insertPos) + '\n' + newCardioExercises + content.substring(insertPos);
  } else {
    console.error('Could not find the cardioExercises array in data.ts');
  }

  // Insert exactly after "export const noEquipmentExercises: Exercise[] = ["
  const noEqTargetStr = 'export const noEquipmentExercises: Exercise[] = [';
  const noEqIndex = content.indexOf(noEqTargetStr);
  
  if (noEqIndex !== -1) {
    const insertPos = noEqIndex + noEqTargetStr.length;
    content = content.substring(0, insertPos) + '\n' + newNoEqExercises + content.substring(insertPos);
  } else {
    console.error('Could not find the noEquipmentExercises array in data.ts');
  }

  fs.writeFileSync(dataFile, content);
  console.log('Successfully injected 3 Cardio and 3 No Equipment exercises into data.ts!');
} catch (e) {
  console.error('Error updating data.ts:', e);
}
