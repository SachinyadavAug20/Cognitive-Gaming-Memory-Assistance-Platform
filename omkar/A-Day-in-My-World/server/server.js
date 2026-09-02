import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4173;

// Never cache game files so the browser always gets the latest fixed version.
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));

// Expose three.js to the browser (bare specifier resolution)
const threePkg = path.join(__dirname, '..', 'node_modules', 'three');
app.use('/node_modules/three', express.static(threePkg));
// Map the 'three/addons/...' alias used by the game
app.use('/three/addons', express.static(path.join(threePkg, 'examples', 'jsm')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  const host = 'http://127.0.0.1';
  console.log('======================================================');
  console.log('  🏠 A Day in My World   -   3D therapeutic village');
  console.log('======================================================');
  console.log(`  Open your browser at:  ${host}:${PORT}`);
  console.log('  (Leave this window open while you play)');
  console.log('======================================================');
});
