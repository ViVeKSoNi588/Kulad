import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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
    console.log(`ℹ️ No image files found in ${uploadDir}. Please add your .png, .jpg, or .webp images there first!`);
    await pool.end();
    return;
  }

  console.log(`⚡ Found ${files.length} images. Linking to database...`);

  for (const file of files) {
    const ext = path.extname(file);
    const idOrName = path.basename(file, ext); // e.g. "p1" or "mitti-cup"
    const imageUrl = `/uploads/${file}`;

    // 1. Try to match by product ID (e.g. "p1")
    const matchRes = await pool.query(
      'UPDATE products SET image_url = $1 WHERE id = $2 RETURNING name',
      [imageUrl, idOrName]
    );

    if (matchRes.rowCount > 0) {
      console.log(`✅ Linked image "${file}" to existing product "${matchRes.rows[0].name}"`);
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
      console.log(`🌱 Created new draft product "${cleanedName}" for image "${file}"`);
    }
  }

  await pool.end();
  console.log('🎉 Seeding complete! All images linked in the database.');
}

runSeeder().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
