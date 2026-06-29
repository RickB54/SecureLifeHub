const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let anonKey = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
  anonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
}

async function run() {
  const token = fs.readFileSync('token.txt', 'utf8').trim();
  const res = await fetch(supabaseUrl + '/rest/v1/exercises?select=id,name,user_id', {
    headers: { apikey: anonKey, Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  
  const counts = {};
  data.forEach(ex => {
    counts[ex.name] = (counts[ex.name] || 0) + 1;
  });
  
  const duplicates = Object.entries(counts).filter(([name, count]) => count > 1);
  console.log('Total exercises:', data.length);
  console.log('Unique names:', Object.keys(counts).length);
  console.log('Sample duplicates:', duplicates.slice(0, 5));
}
run();
