import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================
// CONFIGURATION
// ==========================================
// Your Supabase Project Reference
const SUPABASE_PROJECT_REF = 'kcvgzzpdhfwadsxxdbjn';

// The name of the public bucket you created in Supabase Storage
const SUPABASE_BUCKET_NAME = 'product-images'; 
// ==========================================

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSeeder() {
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseKey) {
    console.error('❌ Error: SUPABASE_KEY is missing in your .env file.');
    console.error('   Please go to Supabase Dashboard -> Project Settings -> API, copy the "anon" / "public" key, and add it as SUPABASE_KEY=... in .env');
    await pool.end();
    process.exit(1);
  }

  console.log(`📡 Fetching file list from Supabase Storage bucket "${SUPABASE_BUCKET_NAME}"...`);

  // DEBUG: List all buckets in the project
  try {
    const bucketResponse = await fetch(
      `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/bucket`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    if (bucketResponse.ok) {
      const buckets = await bucketResponse.json();
      console.log('DEBUG: Available buckets in your project:', buckets.map(b => ({ name: b.name, public: b.public })));
    } else {
      console.log('DEBUG: Failed to retrieve buckets list:', bucketResponse.status);
    }
  } catch (bucketErr) {
    console.log('DEBUG: Error listing buckets:', bucketErr.message);
  }

  let files = [];
  try {
    const response = await fetch(
      `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/list/${SUPABASE_BUCKET_NAME}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prefix: '',
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase API responded with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log('DEBUG: Raw items from Supabase Storage API:', data);
    if (!Array.isArray(data)) {
      throw new Error(`Unexpected API response structure: ${JSON.stringify(data)}`);
    }

    // Filter to keep only image objects (ignoring placeholders or folders)
    files = data.filter(item => {
      if (!item.name || item.name === '.emptyFolderPlaceholder') return false;
      const ext = item.name.split('.').pop().toLowerCase();
      return ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
    });

  } catch (err) {
    console.error('❌ Failed to fetch files from Supabase Storage:', err.message);
    await pool.end();
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(`ℹ️ No image files found in the Supabase Storage bucket "${SUPABASE_BUCKET_NAME}". Make sure you uploaded images there!`);
    await pool.end();
    return;
  }

  console.log(`⚡ Found ${files.length} images in Supabase Storage. Linking to database...`);

  for (const item of files) {
    const file = item.name;
    const ext = file.substring(file.lastIndexOf('.'));
    const idOrName = file.substring(0, file.lastIndexOf('.')); // e.g. "p1" or "mitti-cup"
    
    // Construct the public URL of the Supabase Storage object
    const imageUrl = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET_NAME}/${encodeURIComponent(file)}`;

    // 1. Try to match by product ID (e.g. "p1")
    const matchRes = await pool.query(
      'UPDATE products SET image_url = $1 WHERE id = $2 RETURNING name',
      [imageUrl, idOrName]
    );

    if (matchRes.rowCount > 0) {
      console.log(`✅ Linked: "${file}" ➔ product "${matchRes.rows[0].name}"`);
    } else {
      // 2. If it does not match an existing ID, create a new product draft automatically
      const cleanedName = idOrName
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const newId = `p_bulk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      await pool.query(
        `INSERT INTO products (id, name, category, description, price, unit, capacity, tone, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newId,
          cleanedName || "Bulk Clay Product",
          "Cups & Kulhads",
          `Premium hand-crafted ${cleanedName || "terracotta item"} made from organic Pune clay.`,
          120,
          "Pack of 6",
          "150ml",
          "#D96B43",
          imageUrl
        ]
      );
      console.log(`🌱 Created draft: "${cleanedName}" ➔ "${imageUrl}"`);
    }
  }

  await pool.end();
  console.log('\n🎉 Seeding complete! All Supabase Storage images successfully linked in your database.');
}

runSeeder().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
