import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================
// CONFIGURATION
// ==========================================
// Set this to true to use Supabase Storage. Set to false to commit images to Git/Render.
const USE_SUPABASE_STORAGE = true; 

// Your Supabase Project Reference (extracted from your DATABASE_URL)
const SUPABASE_PROJECT_REF = 'kcvgzzpdhfwadsxxdbjn';

// The name of the public bucket you created in Supabase Storage (e.g. 'product-images')
const SUPABASE_BUCKET_NAME = 'product-images'; 
// ==========================================

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSeeder() {
  const uploadDir = './public/uploads';
  if (!fs.existsSync(uploadDir)) {
    console.log(`📁 Creating missing folder: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`💡 Put your 100+ product images inside ${uploadDir} and run this script again!`);
    await pool.end();
    process.exit(0);
  }

  const files = fs.readdirSync(uploadDir).filter(file => {
    return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(path.extname(file).toLowerCase());
  });

  if (files.length === 0) {
    console.log(`ℹ️ No image files found in ${uploadDir}. Please add your images there first to let us read their filenames!`);
    await pool.end();
    return;
  }

  console.log(`⚡ Found ${files.length} local filenames.`);
  console.log(USE_SUPABASE_STORAGE 
    ? `🔗 Generating Supabase Storage public links (Bucket: "${SUPABASE_BUCKET_NAME}")...` 
    : `🔗 Generating local static path links...`
  );

  for (const file of files) {
    const ext = path.extname(file);
    const idOrName = path.basename(file, ext); // e.g. "p1" or "mitti-cup"
    
    // Construct target URL based on configuration
    const imageUrl = USE_SUPABASE_STORAGE
      ? `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET_NAME}/${encodeURIComponent(file)}`
      : `/uploads/${file}`;

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
      console.log(`🌱 Created draft: "${cleanedName}" with link ➔ "${imageUrl}"`);
    }
  }

  await pool.end();
  console.log('\n🎉 Seeding complete! All images successfully linked in your Supabase database.');
}

runSeeder().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
