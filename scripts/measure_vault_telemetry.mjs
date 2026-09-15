import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '', anonKey = '';
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && k.trim() === 'NEXT_PUBLIC_SUPABASE_URL') url = v.join('=').trim();
  if (k && k.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') anonKey = v.join('=').trim();
});

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
const supabase = createClient(url, serviceKey);

async function runTelemetry() {
  console.log('======================================================================');
  console.log('REAL SUPABASE TELEMETRY & MEASUREMENT: VAULT PAYLOAD & BASE64 ANALYSIS');
  console.log('======================================================================');
  console.log('Supabase Project URL:', url);

  // 1. Measure full select("*") query
  const startFull = Date.now();
  const { data: fullData, error: fullErr } = await supabase.from('vault_items').select('*');
  const fullDuration = Date.now() - startFull;

  if (fullErr) {
    console.error('Error fetching vault_items select(*):', fullErr);
    return;
  }

  const fullJsonString = JSON.stringify(fullData);
  const fullSizeBytes = Buffer.byteLength(fullJsonString, 'utf8');
  const fullSizeKB = (fullSizeBytes / 1024).toFixed(2);
  const fullSizeMB = (fullSizeBytes / (1024 * 1024)).toFixed(3);

  console.log(`\n--- 1. FULL QUERY [select("*")] ---`);
  console.log(`Total Rows Returned: ${fullData.length}`);
  console.log(`Total Raw JSON Payload Size: ${fullSizeBytes} bytes (${fullSizeKB} KB / ${fullSizeMB} MB)`);
  console.log(`Average Row Payload Size: ${(fullSizeBytes / fullData.length / 1024).toFixed(3)} KB / row`);
  console.log(`Query Fetch Latency: ${fullDuration} ms`);

  // 2. Base64 Attachment Breakdown
  console.log(`\n--- 2. BASE64 ATTACHMENT BREAKDOWN ---`);
  let rowsWithBase64 = 0;
  let totalBase64Fields = 0;
  let totalBase64Bytes = 0;
  const base64Details = [];

  for (const row of fullData) {
    let rowHasBase64 = false;
    const meta = row.item_metadata;
    
    // Check item_metadata
    if (meta && typeof meta === 'object') {
      for (const [key, value] of Object.entries(meta)) {
        if (typeof value === 'string' && value.startsWith('data:image')) {
          rowHasBase64 = true;
          totalBase64Fields++;
          const fieldBytes = Buffer.byteLength(value, 'utf8');
          totalBase64Bytes += fieldBytes;
          base64Details.push({
            id: row.id,
            title: row.title,
            category: row.category,
            field: `item_metadata.${key}`,
            sizeBytes: fieldBytes,
            sizeKB: (fieldBytes / 1024).toFixed(2)
          });
        }
      }
    }

    // Also scan entire row for any other fields with base64 data:
    for (const [col, val] of Object.entries(row)) {
      if (col !== 'item_metadata' && typeof val === 'string' && val.startsWith('data:image')) {
        rowHasBase64 = true;
        totalBase64Fields++;
        const fieldBytes = Buffer.byteLength(val, 'utf8');
        totalBase64Bytes += fieldBytes;
        base64Details.push({
          id: row.id,
          title: row.title,
          category: row.category,
          field: col,
          sizeBytes: fieldBytes,
          sizeKB: (fieldBytes / 1024).toFixed(2)
        });
      }
    }

    if (rowHasBase64) {
      rowsWithBase64++;
    }
  }

  console.log(`Rows containing base64 attachments: ${rowsWithBase64} of ${fullData.length} (${((rowsWithBase64 / fullData.length) * 100).toFixed(2)}%)`);
  console.log(`Total base64 fields found: ${totalBase64Fields}`);
  console.log(`Total Base64 Size: ${totalBase64Bytes} bytes (${(totalBase64Bytes / 1024).toFixed(2)} KB / ${(totalBase64Bytes / (1024 * 1024)).toFixed(3)} MB)`);
  if (rowsWithBase64 > 0) {
    console.log(`Average Base64 Size per affected row: ${(totalBase64Bytes / rowsWithBase64 / 1024).toFixed(2)} KB`);
  } else {
    console.log(`Average Base64 Size per affected row: 0 KB`);
  }

  if (base64Details.length > 0) {
    console.log('\nBase64 Items Detail:');
    base64Details.forEach(d => {
      console.log(` - [${d.id}] "${d.title}" (${d.category || 'No Cat'}) -> ${d.field}: ${d.sizeKB} KB`);
    });
  }

  // 3. Category Breakdown of rows
  const categoryCounts = {};
  fullData.forEach(r => {
    const cat = r.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  console.log('\n--- 3. CATEGORY DISTRIBUTION ---');
  Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, cnt]) => {
    console.log(` - ${cat}: ${cnt} rows`);
  });

  // 4. Measure Tier 1 Lightweight Index Query
  console.log(`\n--- 4. TIER 1 PROJECTION QUERY [select("id, user_id, type, title, username, website, category, folder_id, is_favorite, is_archived, created_at, updated_at")] ---`);
  const startTier1 = Date.now();
  const { data: tier1Data, error: tier1Err } = await supabase
    .from('vault_items')
    .select('id, user_id, type, title, username, website, category, folder_id, is_favorite, is_archived, created_at, updated_at');
  const tier1Duration = Date.now() - startTier1;

  if (tier1Err) {
    console.error('Error fetching Tier 1:', tier1Err);
    return;
  }

  const tier1JsonString = JSON.stringify(tier1Data);
  const tier1SizeBytes = Buffer.byteLength(tier1JsonString, 'utf8');
  const tier1SizeKB = (tier1SizeBytes / 1024).toFixed(2);

  console.log(`Total Rows Returned: ${tier1Data.length}`);
  console.log(`Total Raw JSON Payload Size: ${tier1SizeBytes} bytes (${tier1SizeKB} KB)`);
  console.log(`Average Row Payload Size: ${(tier1SizeBytes / tier1Data.length / 1024).toFixed(3)} KB / row`);
  console.log(`Query Fetch Latency: ${tier1Duration} ms`);

  // 5. Before vs After Comparison
  console.log(`\n======================================================================`);
  console.log(`BEFORE vs AFTER SUMMARY`);
  console.log(`======================================================================`);
  console.log(`Before (Full select("*")): ${fullSizeKB} KB (${fullSizeBytes} bytes)`);
  console.log(`After (Tier 1 Projection): ${tier1SizeKB} KB (${tier1SizeBytes} bytes)`);
  const savingsBytes = fullSizeBytes - tier1SizeBytes;
  const savingsPercent = ((savingsBytes / fullSizeBytes) * 100).toFixed(1);
  console.log(`Payload Egress Reduction: ${savingsPercent}% (Saved ${(savingsBytes / 1024).toFixed(2)} KB per session load)`);
  console.log(`======================================================================\n`);
}

runTelemetry();
