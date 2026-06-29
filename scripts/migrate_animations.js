const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let anonKey = '';
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
  if (keyMatch) anonKey = keyMatch[1].trim();
  
  const srvMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
  if (srvMatch && !serviceKey) serviceKey = srvMatch[1].trim();
}

async function run() {
  console.log('\\n--- GDFT Animated Icons Migrator ---');
  console.log('Mode: DRY RUN (Default)\\n');
  
  const isApply = process.argv.includes('--apply') || process.argv.includes('--live');
  if (isApply) {
    console.warn('WARNING: --apply flag detected. Writes WILL be committed to Supabase!\\n');
  } else {
    console.log('INFO: Dry run mode. No changes will be written to Supabase. Pass --apply to execute.\\n');
  }

  const tokenIndex = process.argv.findIndex(arg => arg === '--token');
  let token = tokenIndex > -1 ? process.argv[tokenIndex + 1] : null;

  const tokenFileIndex = process.argv.findIndex(arg => arg === '--token-file');
  if (tokenFileIndex > -1) {
    const tokenFilePath = process.argv[tokenFileIndex + 1];
    if (fs.existsSync(tokenFilePath)) {
      token = fs.readFileSync(tokenFilePath, 'utf8').trim();
    } else {
      console.error('ERROR: Token file not found at ' + tokenFilePath);
      process.exit(1);
    }
  }

  if (!token && !serviceKey) {
    console.error('ERROR: Missing Authentication!');
    console.error('Please either:');
    console.error('  1. Add SUPABASE_SERVICE_ROLE_KEY=your_key to .env.local');
    console.error('  2. Pass your JWT session token via: node scripts/migrate_animations.js --token "YOUR_TOKEN"');
    console.error('  3. OR pass a text file containing the token via: node scripts/migrate_animations.js --token-file token.txt');
    process.exit(1);
  }

  const authHeader = token ? 'Bearer ' + token : 'Bearer ' + serviceKey;

  // Parse data.ts to get the target 139 exercises
  const dataPath = path.join(__dirname, '..', 'components', 'gdft', 'lib', 'data.ts');
  const dataContent = fs.readFileSync(dataPath, 'utf8');
  
  const exerciseRegex = /name:\s*(["'])(.+?)\1,(?:\s*category:\s*(["'])(.+?)\3,)?\s*startPositionUrl:\s*(["'])(.+?)\5,\s*endPositionUrl:\s*(["'])(.+?)\7/g;
  
  const localExercises = new Map();
  let match;
  while ((match = exerciseRegex.exec(dataContent)) !== null) {
    const name = match[2].trim();
    localExercises.set(name, {
      startPositionUrl: match[6],
      endPositionUrl: match[8]
    });
  }
  
  console.log('Found ' + localExercises.size + ' animated exercises in local data.ts.\\n');

  console.log('Fetching live exercises from Supabase...');
  const res = await fetch(supabaseUrl + '/rest/v1/exercises?select=id,name,user_id,start_position_url,end_position_url', {
    headers: {
      apikey: anonKey || serviceKey,
      Authorization: authHeader
    }
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Failed to fetch from Supabase:', err);
    process.exit(1);
  }

  const liveExercises = await res.json();
  console.log('Found ' + liveExercises.length + ' total exercises in your Supabase account.\\n');

  if (liveExercises.length === 0) {
    console.log('No exercises found. Are you using a Service Key, or did you provide the correct user token?');
    process.exit(0);
  }

  const uniqueUsers = [...new Set(liveExercises.map(e => e.user_id).filter(Boolean))];
  if (uniqueUsers.length > 1) {
    console.error('Multiple users found in DB. To prevent modifying other users, please supply a user token instead of a service key, or filter this script.');
    process.exit(1);
  }

  let matchedCount = 0;
  let skippedCount = 0;
  let wouldUpdateCount = 0;
  const updates = [];

  for (const liveEx of liveExercises) {
    if (localExercises.has(liveEx.name)) {
      matchedCount++;
      const localData = localExercises.get(liveEx.name);
      
      // Skip if ALREADY SET to a different URL (meaning user overrode it)
      if (liveEx.start_position_url && liveEx.start_position_url !== localData.startPositionUrl) {
         console.log('⏭️  SKIPPED: "' + liveEx.name + '" (Already has a custom override URL)');
         skippedCount++;
         continue;
      }
      
      if (liveEx.start_position_url === localData.startPositionUrl && liveEx.end_position_url === localData.endPositionUrl) {
         continue;
      }

      wouldUpdateCount++;
      updates.push({
        id: liveEx.id,
        name: liveEx.name,
        start_position_url: localData.startPositionUrl,
        end_position_url: localData.endPositionUrl
      });
      
      console.log('🔄 PLAN UPDATE: "' + liveEx.name + '"');
      console.log('      start: null -> ' + localData.startPositionUrl);
      console.log('      end:   null -> ' + localData.endPositionUrl);
    }
  }

  console.log('\\n--- SUMMARY ---');
  console.log('Total Live Exercises Checked: ' + liveExercises.length);
  console.log('Total Matched to local data: ' + matchedCount);
  console.log('Total Skipped (User Overrides): ' + skippedCount);
  console.log('Total Scheduled for Update: ' + wouldUpdateCount);

  if (!isApply) {
    console.log('\\n✅ Dry run complete. Run with --apply to commit these changes.\\n');
    return;
  }

  if (wouldUpdateCount === 0) {
    console.log('\\n✅ Nothing to update!\\n');
    return;
  }

  console.log('\\n🚀 EXECUTING UPDATES...');
  let successCount = 0;
  for (const update of updates) {
    const { id, name, ...payload } = update;
    const patchRes = await fetch(supabaseUrl + '/rest/v1/exercises?id=eq.' + id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey || serviceKey,
        Authorization: authHeader,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!patchRes.ok) {
      console.error('Failed to update ' + name + ':', await patchRes.text());
    } else {
      successCount++;
    }
  }

  console.log('\\n🎉 Successfully updated ' + successCount + ' / ' + wouldUpdateCount + ' exercises!\\n');
}

run();
