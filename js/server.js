// ========================================
// DIGITAL LOGBOOK - BACKEND SERVER
// ========================================
// Handles file uploads to assets folder

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// ========================================
// ASSET FOLDER SETUP
// ========================================
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// ========================================
// MULTER CONFIGURATION
// ========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assetsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${timestamp}-${randomStr}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP allowed.'));
    }
  }
});

// ========================================
// API ROUTES
// ========================================

// Upload single image
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imagePath = `assets/${req.file.filename}`;
  console.log(`✅ Image uploaded: ${imagePath}`);

  res.json({
    success: true,
    message: 'Image uploaded successfully',
    imagePath: imagePath,
    filename: req.file.filename
  });
});

// Delete image
app.post('/api/delete-image', (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ error: 'Filename required' });
  }

  const filePath = path.join(assetsDir, filename);

  // Security check: ensure file is in assets folder
  if (!filePath.startsWith(assetsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
    console.log(`✅ Image deleted: ${filename}`);
    res.json({ success: true, message: 'Image deleted successfully' });
  });
});

// Get all images
app.get('/api/assets', (req, res) => {
  fs.readdir(assetsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read assets' });
    }

    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    res.json({ success: true, images });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', port: PORT });
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`
  🚀 Digital Logbook Server Running
  📍 http://localhost:${PORT}
  📁 Assets folder: ${assetsDir}
  ✅ Ready to handle file uploads
  `);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
