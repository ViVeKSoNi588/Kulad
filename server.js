import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

// Cryptographic stateless token helper methods
function generateToken() {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // Token valid for 24 hours
  const payload = JSON.stringify({ user: 'admin', expiry });
  const secret = process.env.ADMIN_PASSWORD || 'admin123';
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  try {
    const payloadBase64 = parts[0];
    const signature = parts[1];
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    
    if (payload.expiry < Date.now()) return false; // Token expired
    
    const secret = process.env.ADMIN_PASSWORD || 'admin123';
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
    return signature === expectedSignature;
  } catch (err) {
    return false;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Setup static serving for uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Database connection
const { Pool } = pg;
let pool = null;
let dbConnected = false;

// Check if we have a valid PostgreSQL URL (avoid default template text)
const dbUrl = process.env.DATABASE_URL;
const isDefaultDbUrl = !dbUrl || dbUrl.includes('your_postgres_connection_string_here') || dbUrl.includes('postgres://postgres:postgres@localhost:5432/kulad');

if (dbUrl && !isDefaultDbUrl) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      // Require SSL for external services like Neon or Supabase, unless disabled explicitly
      ssl: dbUrl.includes('localhost') || dbUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
    });
    dbConnected = true;
    console.log("Database pool created. Attempting database initialization...");
  } catch (err) {
    console.error("Failed to initialize PostgreSQL pool connection:", err.message);
  }
} else {
  console.warn("=========================================================================");
  console.warn("⚠️  DATABASE_URL is not configured or is set to default.                  ");
  console.warn("   Running backend in LOCAL FALLBACK mode (reads productsData.js).        ");
  console.warn("   To run with an external database, configure DATABASE_URL in .env      ");
  console.warn("=========================================================================");
}

// Initialize tables and seed data if DB is connected
async function initializeDatabase() {
  if (!dbConnected || !pool) return;
  try {
    const client = await pool.connect();
    console.log("⚡ Connected to external PostgreSQL database.");
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL,
        unit VARCHAR(50),
        capacity VARCHAR(50),
        tone VARCHAR(50),
        image_url TEXT
      );
    `);
    
    // Check if products table is empty
    const res = await client.query('SELECT COUNT(*) FROM products');
    const count = parseInt(res.rows[0].count, 10);
    
    if (count === 0) {
      console.log("🌱 Products table is empty. Seeding initial catalog from productsData.js...");
      const { productsData } = await import('./src/data/productsData.js');
      
      for (const p of productsData) {
        await client.query(
          `INSERT INTO products (id, name, category, description, price, unit, capacity, tone, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [p.id, p.name, p.category, p.description, p.price, p.unit, p.capacity, p.tone, null]
        );
      }
      console.log(`✅ Database seeded with ${productsData.length} default products.`);
    } else {
      console.log(`ℹ️ Database contains ${count} products. Seeding skipped.`);
    }
    
    client.release();
  } catch (err) {
    console.error("❌ Database connection / initialization failed. Falling back to local data.");
    console.error("   Error details:", err.message);
    dbConnected = false;
  }
}

// Run DB init in the background
initializeDatabase();

// Middleware to authenticate admin requests
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Missing or invalid token.' });
  }
  const token = authHeader.split(' ')[1];
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
  next();
};

// Multer storage for bulk image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed.'));
    }
  }
});

// API Endpoints

// 1. Password login verification
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === correctPassword) {
    // Generate stateless token
    const token = generateToken();
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid administration password.' });
  }
});

// 1b. Invalidate session token (Logout - client clears the token statelessly)
app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 2. Fetch list of products (falls back to local data if DB not connected)
app.get('/api/products', async (req, res) => {
  if (dbConnected && pool) {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
      res.json(result.rows);
    } catch (err) {
      console.error("Error reading database:", err.message);
      res.status(500).json({ error: "Failed to read products from external database." });
    }
  } else {
    // Local fallback
    try {
      const { productsData } = await import('./src/data/productsData.js');
      res.json(productsData);
    } catch (err) {
      console.error("Local fallback error:", err);
      res.status(500).json({ error: "Failed to fetch local fallback products." });
    }
  }
});

// 3. Create a single product (Admin only)
app.post('/api/products', authenticateAdmin, async (req, res) => {
  if (!dbConnected || !pool) {
    return res.status(400).json({ error: "Database not connected. Write actions are unavailable in local fallback mode." });
  }
  const { id, name, category, description, price, unit, capacity, tone, image_url } = req.body;
  const productId = id || `p_${Date.now()}`;
  
  try {
    await pool.query(
      `INSERT INTO products (id, name, category, description, price, unit, capacity, tone, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [productId, name, category, description, Number(price), unit, capacity, tone, image_url]
    );
    res.status(201).json({ success: true, product: { id: productId, name, category, description, price, unit, capacity, tone, image_url } });
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({ error: "Failed to write product to external database." });
  }
});

// 4. Update an existing product (Admin only)
app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  if (!dbConnected || !pool) {
    return res.status(400).json({ error: "Database not connected." });
  }
  const { id } = req.params;
  const { name, category, description, price, unit, capacity, tone, image_url } = req.body;
  
  try {
    await pool.query(
      `UPDATE products 
       SET name = $1, category = $2, description = $3, price = $4, unit = $5, capacity = $6, tone = $7, image_url = $8 
       WHERE id = $9`,
      [name, category, description, Number(price), unit, capacity, tone, image_url, id]
    );
    res.json({ success: true, message: "Product updated successfully." });
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ error: "Failed to update product in database." });
  }
});

// 5. Delete a product (Admin only)
app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  if (!dbConnected || !pool) {
    return res.status(400).json({ error: "Database not connected." });
  }
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ error: "Failed to delete product from database." });
  }
});

// 6. Bulk upload files and optionally auto-create drafts from filenames
app.post('/api/upload-bulk', authenticateAdmin, upload.array('images', 50), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded." });
  }
  
  const uploadedFiles = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    url: `/uploads/${file.filename}`
  }));
  
  const autoCreate = req.query.autoCreate === 'true';
  const createdProducts = [];
  
  if (autoCreate && dbConnected && pool) {
    for (const file of uploadedFiles) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      
      // Clean filename for product title
      const cleanedName = baseName
        .replace(/[-_]/g, ' ')
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim();
        
      const productId = `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const defaultProduct = {
        id: productId,
        name: cleanedName || "New Clay Product Draft",
        category: "Cups & Kulhads",
        description: `Handcrafted ${cleanedName || "terracotta item"} made from Pune's premium kiln-fired clay.`,
        price: 100,
        unit: "Pack of 6",
        capacity: "120ml",
        tone: "#D96B43",
        image_url: file.url
      };
      
      try {
        await pool.query(
          `INSERT INTO products (id, name, category, description, price, unit, capacity, tone, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            defaultProduct.id,
            defaultProduct.name,
            defaultProduct.category,
            defaultProduct.description,
            defaultProduct.price,
            defaultProduct.unit,
            defaultProduct.capacity,
            defaultProduct.tone,
            defaultProduct.image_url
          ]
        );
        createdProducts.push(defaultProduct);
      } catch (err) {
        console.error("Error creating draft from upload:", err.message);
      }
    }
  }
  
  res.json({
    success: true,
    files: uploadedFiles,
    createdProducts
  });
});

// Serve frontend for non-API, non-Upload routes (fallback to support SPAs)
app.get(/.*/, (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      // In dev mode, Vite handles page serving, so it's okay if dist/index.html doesn't exist
      res.status(404).send("Vite dev server is handling frontend. If in production, run 'npm run build' first.");
    }
  });
});

// Fallback Express error-handling middleware to prevent stack trace leaks
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend Server listening on http://localhost:${PORT}`);
  console.log(`📁 Static uploads folder: ${uploadDir}\n`);
});
