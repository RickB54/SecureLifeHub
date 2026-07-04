const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const https = require('https');

// Load environment variables from .env.local if present
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const index = line.indexOf('=');
      if (index > 0) {
        process.env[line.substring(0, index).trim()] = line.substring(index + 1).trim();
      }
    }
  });
}

// ==========================================
// 1. PASTE YOUR API KEY HERE
// ==========================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
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
  
  // Rock-solid line-by-line parser to find the exercises correctly
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

  const toProcess = [];

  for (const ex of exercises) {
    if (!ex.name || !ex.category || !ex.url) continue;
    
    // STRICT FILTERING RULES
    if (ex.category === "Slide Board") continue; // Never touch SlideBoard
    if (/^CF[A-Z]\s/.test(ex.name)) continue; // Never touch CF# custom exercises
    
    if (["Weights", "Cardio", "No Equipment"].includes(ex.category)) {
      // ONLY process files that still have the old .svg stick figure placeholders!
      if (ex.url.endsWith('.svg')) {
        toProcess.push(ex);
      }
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
        model: "gpt-image-1",
        prompt: `${BASE_PROMPT} He is at the STARTING position of the exercise: ${ex.name}.`,
        n: 1,
        size: "1024x1024",
      });
      if (pos1Res.data[0].b64_json) {
        fs.writeFileSync(pos1Path, Buffer.from(pos1Res.data[0].b64_json, 'base64'));
      } else {
        await downloadImage(pos1Res.data[0].url, pos1Path);
      }

      // Generate Position 2 (End)
      const pos2Res = await openai.images.generate({
        model: "gpt-image-1",
        prompt: `${BASE_PROMPT} He is at the ENDING/FLEXED position of the exercise: ${ex.name}.`,
        n: 1,
        size: "1024x1024",
      });
      if (pos2Res.data[0].b64_json) {
        fs.writeFileSync(pos2Path, Buffer.from(pos2Res.data[0].b64_json, 'base64'));
      } else {
        await downloadImage(pos2Res.data[0].url, pos2Path);
      }

      console.log(`✔ Downloaded ${ex.name} pos1 and pos2`);

      // Update data.ts
      content = fs.readFileSync(dataFile, 'utf-8'); // read fresh to avoid index shifting bugs
      const nameIndex = content.indexOf(`name: "${ex.name}"`);
      if (nameIndex !== -1) {
        const nextStartIdx = content.indexOf('startPositionUrl:', nameIndex);
        const nextEndIdx = content.indexOf('endPositionUrl:', nameIndex);
        const endOfLine = content.indexOf('\n', nextEndIdx);
        
        if (nextStartIdx !== -1 && nextStartIdx - nameIndex < 300) {
            const newLine = `startPositionUrl: "/icons/${folder}/realistic/${safeName}-pos1.png",\n    endPositionUrl: "/icons/${folder}/realistic/${safeName}-pos2.png"`;
            const newContent = content.substring(0, nextStartIdx) + newLine + content.substring(endOfLine);
            fs.writeFileSync(dataFile, newContent);
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
