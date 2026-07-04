const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'components/gdft/lib/data.ts');

const newMachineExercises = `
  {
    id: generateId(),
    name: "Hack Squat Machine",
    category: "Weights",
    muscleGroups: ["Quadriceps", "Glutes"],
    equipment: "Machine",
    description: "Position your back against the backrest and shoulders under the shoulder pads of the hack squat machine. Place your feet shoulder-width apart on the platform. Lower the weight by bending your knees until your thighs are parallel to the platform, then push back up. Keep your back flat against the pad at all times.",
    startPositionUrl: "hack-squat-machine.svg",
    settings: { sets: 3, reps: 10, weight: 90 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Seated Calf Raise Machine",
    category: "Weights",
    muscleGroups: ["Calves", "Legs"],
    equipment: "Machine",
    description: "Sit on the machine and place your toes on the lower portion of the platform with your heels extending off. Place your lower thighs under the lever pad. Raise your heels by extending your ankles as high as possible, then lower them slowly until your calves are fully stretched.",
    startPositionUrl: "seated-calf-raise-machine.svg",
    settings: { sets: 3, reps: 12, weight: 45 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Chest Supported T-Bar Row",
    category: "Weights",
    muscleGroups: ["Back", "Lats"],
    equipment: "Machine",
    description: "Lie face down on the pad of the T-bar row machine. Grasp the handles and pull the weight up towards your chest, squeezing your shoulder blades together. Lower the weight slowly back to the starting position.",
    startPositionUrl: "chest-supported-t-bar-row.svg",
    settings: { sets: 3, reps: 10, weight: 45 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Cable Crossover",
    category: "Weights",
    muscleGroups: ["Chest", "Upper Chest"],
    equipment: "Cable",
    description: "Stand between two high cable pulleys with a handle attached to each. Grab the handles and step forward slightly. With a slight bend in your elbows, pull the handles down and across your body until your hands meet in front of your waist. Slowly return to the starting position.",
    startPositionUrl: "cable-crossover.svg",
    settings: { sets: 3, reps: 12, weight: 20 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Smith Machine Squat",
    category: "Weights",
    muscleGroups: ["Quadriceps", "Glutes"],
    equipment: "Machine",
    description: "Position the barbell of the Smith machine across your upper back and shoulders. Unrack the bar and stand with feet shoulder-width apart. Lower into a squat by bending your knees and pushing your hips back. Push back up to the starting position.",
    startPositionUrl: "smith-machine-squat.svg",
    settings: { sets: 3, reps: 10, weight: 90 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Preacher Curl Machine",
    category: "Weights",
    muscleGroups: ["Biceps", "Arms"],
    equipment: "Machine",
    description: "Sit at the preacher curl machine with your upper arms resting flat on the pad. Grab the handles and curl the weight up towards your shoulders, squeezing your biceps. Lower the weight slowly back to the starting position.",
    startPositionUrl: "preacher-curl-machine.svg",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
`;

try {
  let content = fs.readFileSync(dataFile, 'utf-8');
  
  if (content.includes('Hack Squat Machine')) {
    console.log('The new exercises are already present in data.ts.');
    process.exit(0);
  }

  // Insert exactly after "export const weightExercises: Exercise[] = ["
  const targetStr = 'export const weightExercises: Exercise[] = [';
  const index = content.indexOf(targetStr);
  
  if (index !== -1) {
    const insertPos = index + targetStr.length;
    const newContent = content.substring(0, insertPos) + '\\n' + newMachineExercises + content.substring(insertPos);
    fs.writeFileSync(dataFile, newContent);
    console.log('Successfully injected 6 new popular machine exercises into data.ts!');
    console.log('You can now run generate-openai-images.js again to generate their images.');
  } else {
    console.error('Could not find the weightExercises array in data.ts');
  }
} catch (e) {
  console.error('Error updating data.ts:', e);
}
