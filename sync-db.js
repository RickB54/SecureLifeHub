const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const dataTs = fs.readFileSync('components/gdft/lib/data.ts', 'utf8');
  const lines = dataTs.split('\n');
  
  const exercises = [];
  let currentName = null;
  let currentStart = null;
  let currentEnd = null;
  
  for (const line of lines) {
    if (line.includes('name: "')) {
      const match = line.match(/name:\s*"([^"]+)"/);
      if (match) currentName = match[1];
    }
    if (line.includes('startPositionUrl: "')) {
      const match = line.match(/startPositionUrl:\s*"([^"]+)"/);
      if (match) currentStart = match[1];
    }
    if (line.includes('endPositionUrl: "')) {
      const match = line.match(/endPositionUrl:\s*"([^"]+)"/);
      if (match) currentEnd = match[1];
    }
    
    // When we hit '},', we assume the exercise block is done
    if (line.trim() === '},' || line.trim() === '}') {
      if (currentName && currentStart) {
        exercises.push({ name: currentName, start: currentStart, end: currentEnd });
      }
      currentName = null;
      currentStart = null;
      currentEnd = null;
    }
  }

  console.log(`Found ${exercises.length} exercises with startPositionUrl in data.ts`);

  let updated = 0;
  for (const ex of exercises) {
     const { data, error } = await supabase
       .from('exercises')
       .update({ 
          start_position_url: ex.start,
          end_position_url: ex.end || null
       })
       .eq('name', ex.name)
       .select();
       
     if (error) {
       console.error(`Error updating ${ex.name}:`, error.message);
     } else if (data && data.length > 0) {
       updated += data.length;
     }
  }
  
  console.log(`Updated ${updated} exercise rows in Supabase DB.`);
}

run();
