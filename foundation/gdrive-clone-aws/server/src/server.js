import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import Database from 'better-sqlite3';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// DB init
const dbFile = path.join(__dirname, '..', 'data', 'app.db');
const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    s3_key TEXT NOT NULL UNIQUE,
    s3_bucket TEXT NOT NULL,
    size INTEGER NOT NULL,
    mimetype TEXT NOT NULL,
    uploaded_at TEXT NOT NULL
  );
`);

// AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Multer setup - memory storage (keep files <= 50MB by default)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/files', (req, res) => {
  const rows = db.prepare('SELECT * FROM files ORDER BY uploaded_at DESC').all();
  res.json(rows);
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { originalname, buffer, mimetype, size } = req.file;
  const bucket = process.env.S3_BUCKET_NAME;
  const timestamp = Date.now();
  const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${timestamp}_${safeName}`;

  // Upload to S3
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype
  }));

  // Save metadata
  const stmt = db.prepare(`
    INSERT INTO files (filename, s3_key, s3_bucket, size, mimetype, uploaded_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  const info = stmt.run(originalname, key, bucket, size, mimetype);

  const row = db.prepare('SELECT * FROM files WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.delete('/api/files/:id', async (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM files WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  // Delete from S3 first
  await s3.send(new DeleteObjectCommand({
    Bucket: row.s3_bucket,
    Key: row.s3_key
  }));

  // Delete from DB
  db.prepare('DELETE FROM files WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', detail: String(err?.message || err) });
});

app.listen(PORT, () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});
