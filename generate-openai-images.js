const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const https = require('https');

// ==========================================
// 1. PASTE YOUR API KEY HERE
// ==========================================
const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY_HERE', 
});

const dataFile = path.join(__dirname, 'components/gdft/lib/data.ts');

// The strict global prompt rules
const BASE_PROMPT = "A highly realistic photo of a fitness model, a 30 year old man with short dark hair, wearing a white tank top and dark grey gym shorts, standing in a studio against a solid bright white background. He is facing exactly 45 degrees to the camera. No text, no anatomical diagrams, no red highlights, no medical illustrations. Only the character and the equipment should be visible.";

// Helper to download image
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
};

async function processExercises() {
  let content = fs.readFileSync(dataFile, 'utf-8');
  
  // Find all exercises across categories
  const exerciseRegex = /name:\s*"([^"]+)",\s*category:\s*"([^"]+)"/g;
  let match;
  const toProcess = [];

  while ((match = exerciseRegex.exec(content)) !== null) {
    const name = match[1];
    const category = match[2];
    
    // STRICT FILTERING RULES
    if (category === "Slide Board") continue; // Never touch SlideBoard
    if (/^CF[A-Z]\s/.test(name)) continue; // Never touch CF# custom exercises
    
    // Skip the 6 already processed ones
    const alreadyDone = [
      'Hammer Strength MTS Triceps Extension', 
      'Hammer Strength MTS Biceps Curl',
      'Cybex Eagle Row', 
      'Cybex Eagle Overhand Press', 
      'Cybex Eagle Chest Press', 
      'Cybex Eagle Arm Curl'
    ];
    if (alreadyDone.includes(name)) continue;

    // STRICTEST SAFETY RULE: 
    // If the exercise ALREADY has a custom photo, it will NOT be an .svg file.
    // The old stick figures are all .svg files. We ONLY target .svg placeholders.
    const blockRegex = new RegExp(`name:\\s*"(${name})"([^}]+)startPositionUrl:\\s*"([^"]+)"`);
    const blockMatch = blockRegex.exec(content);
    if (blockMatch) {
      const currentUrl = blockMatch[3];
      if (!currentUrl.endsWith('.svg')) {
          console.log(`Skipping ${name} because it already has a custom image (${currentUrl})`);
          continue; 
      }
    }

    if (["Weights", "Cardio", "No Equipment"].includes(category)) {
      toProcess.push({ name, category });
    }
  }

  console.log(`Found ${toProcess.length} pending exercises to generate...`);

  for (const ex of toProcess) {
    console.log(`Generating images for ${ex.name}...`);
    const safeName = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const folder = ex.category === 'Weights' ? 'weights' : ex.category === 'Cardio' ? 'cardio' : 'no-equipment';
    const destDir = path.join(__dirname, 'public', 'icons', folder, 'realistic');
    
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const pos1Path = path.join(destDir, `${safeName}-pos1.png`);
    const pos2Path = path.join(destDir, `${safeName}-pos2.png`);

    try {
      // Generate Position 1 (Start)
      const pos1Res = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${BASE_PROMPT} He is at the STARTING position of the exercise: ${ex.name}.`,
        n: 1,
        size: "1024x1024",
      });
      await downloadImage(pos1Res.data[0].url, pos1Path);

      // Generate Position 2 (End)
      const pos2Res = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${BASE_PROMPT} He is at the ENDING/FLEXED position of the exercise: ${ex.name}.`,
        n: 1,
        size: "1024x1024",
      });
      await downloadImage(pos2Res.data[0].url, pos2Path);

      console.log(`✔ Downloaded ${ex.name} pos1 and pos2`);

      // Update data.ts
      const nameIndex = content.indexOf(`name: "${ex.name}"`);
      if (nameIndex !== -1) {
        const nextStartIdx = content.indexOf('startPositionUrl:', nameIndex);
        const nextEndIdx = content.indexOf('endPositionUrl:', nameIndex);
        const endOfLine = content.indexOf('\n', nextEndIdx);
        
        if (nextStartIdx !== -1 && nextStartIdx - nameIndex < 300) {
            const newLine = `startPositionUrl: "/icons/${folder}/realistic/${safeName}-pos1.png",\n    endPositionUrl: "/icons/${folder}/realistic/${safeName}-pos2.png"`;
            content = content.substring(0, nextStartIdx) + newLine + content.substring(endOfLine);
            fs.writeFileSync(dataFile, content);
            console.log(`✔ Updated data.ts for ${ex.name}`);
        }
      }
    } catch (e) {
      console.error(`Failed on ${ex.name}:`, e.message);
    }
  }
  
  console.log("All finished!");
}

processExercises();
