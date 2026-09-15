import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '', anonKey = '';
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && k.trim() === 'NEXT_PUBLIC_SUPABASE_URL') url = v.join('=').trim();
  if (k && k.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') anonKey = v.join('=').trim();
});

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
const supabase = createClient(url, serviceKey);

console.log('--- Vault Base64 to Supabase Storage Migrator ---');
console.log('Supabase URL:', url);

async function run() {
  try {
    // 1. Ensure storage bucket exists
    console.log('\n1. Checking/Creating storage bucket "vault_attachments"...');
    const { data: buckets } = await supabase.storage.listBuckets();
    const hasBucket = (buckets || []).some(b => b.name === 'vault_attachments');
    if (!hasBucket) {
      const { error: bErr } = await supabase.storage.createBucket('vault_attachments', { public: true });
      if (bErr) {
        console.warn('Bucket creation note (may already exist or need admin):', bErr.message);
      } else {
        console.log('Created bucket: vault_attachments');
      }
    } else {
      console.log('Bucket "vault_attachments" is verified.');
    }

    // 2. Query vault_items with base64 attachments
    console.log('\n2. Scanning vault_items for base64 data URLs...');
    const { data: items, error } = await supabase.from('vault_items').select('*');
    if (error) {
      console.error('Error fetching vault_items:', error.message);
      return;
    }

    console.log(`Scanned ${items.length} total vault_items.`);
    
    // Backup snapshot before any migration
    const backupPath = `vault_items_backup_${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(items, null, 2));
    console.log(`Saved pre-migration backup snapshot: ${backupPath}`);

    let migratedRows = 0;
    let totalBase64BytesMigrated = 0;

    for (const item of items) {
      let isUpdated = false;
      const meta = item.item_metadata || {};
      const updatedMeta = { ...meta };

      // Check fields in item_metadata for data:image
      for (const [key, value] of Object.entries(meta)) {
        if (typeof value === 'string' && value.startsWith('data:image')) {
          const match = value.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            const ext = match[1].replace('jpeg', 'jpg');
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${item.user_id || 'general'}/${item.id}_${key}_${Date.now()}.${ext}`;

            console.log(`Uploading base64 attachment for item "${item.title || item.id}" (${key}: ${buffer.length} bytes)...`);
            const { data: uploadData, error: upErr } = await supabase.storage
              .from('vault_attachments')
              .upload(fileName, buffer, {
                contentType: `image/${match[1]}`,
                upsert: true
              });

            if (upErr) {
              console.error(`Upload failed for item ${item.id}:`, upErr.message);
              continue;
            }

            const { data: urlData } = supabase.storage
              .from('vault_attachments')
              .getPublicUrl(fileName);

            updatedMeta[key] = urlData.publicUrl;
            totalBase64BytesMigrated += buffer.length;
            isUpdated = true;
          }
        }
      }

      if (isUpdated) {
        const { error: updateErr } = await supabase
          .from('vault_items')
          .update({ item_metadata: updatedMeta })
          .eq('id', item.id);

        if (updateErr) {
          console.error(`Failed to update DB for item ${item.id}:`, updateErr.message);
        } else {
          migratedRows++;
          console.log(`Successfully migrated item ${item.id} -> Storage URLs.`);
        }
      }
    }

    console.log('\n--- Migration Complete ---');
    console.log(`Total Rows Migrated: ${migratedRows}`);
    console.log(`Total Base64 Bytes Migrated to Storage: ${(totalBase64BytesMigrated / 1024).toFixed(2)} KB`);
  } catch (err) {
    console.error('Migration encountered error:', err);
  }
}

run();
