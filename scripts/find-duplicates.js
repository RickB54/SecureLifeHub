
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findDuplicates() {
    try {
        const { data: items, error } = await supabase
            .from('vault_items')
            .select('*');

        if (error) {
            console.error('Error fetching items:', error);
            return;
        }

        console.log(`Total items found: ${items.length}`);

        const seen = new Map();
        const toDelete = [];

        items.forEach(item => {
            const key = `${item.user_id}-${item.title}-${item.type}-${item.username || ''}`;
            if (seen.has(key)) {
                const first = seen.get(key);
                // If content is identical or one is empty, it's a safe duplicate
                if (item.notes === first.notes || !item.notes) {
                    toDelete.push(item.id);
                    console.log(`Found duplicate: "${item.title}" (${item.type}) ID: ${item.id}`);
                }
            } else {
                seen.set(key, item);
            }
        });

        if (toDelete.length > 0) {
            console.log(`\nDeleting ${toDelete.length} duplicates...`);
            // Careful: Actually delete
            const { error: delError } = await supabase
                .from('vault_items')
                .delete()
                .in('id', toDelete);

            if (delError) console.error('Delete error:', delError);
            else console.log('Successfully removed duplicates.');
        } else {
            console.log('No exact duplicates found.');
        }

    } catch (err) {
        console.error('Script failed:', err);
    }
}

findDuplicates();
