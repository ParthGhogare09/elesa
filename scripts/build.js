import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const frontendDir = path.join(rootDir, 'frontend');
const frontendDist = path.join(frontendDir, 'dist');
const backendPublic = path.join(rootDir, 'backend', 'public');

console.log('==> Building PlacePro Evaluate for Unified Cloud Deployment...');

try {
  // Step 1: Install frontend dependencies
  console.log('==> [1/3] Installing frontend dependencies...');
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

  // Step 2: Build frontend distribution bundle
  console.log('==> [2/3] Building frontend production bundle with Vite...');
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

  // Step 3: Sync frontend/dist to backend/public
  console.log('==> [3/3] Synchronizing static assets to backend/public...');
  if (fs.existsSync(backendPublic)) {
    fs.rmSync(backendPublic, { recursive: true, force: true });
  }
  fs.cpSync(frontendDist, backendPublic, { recursive: true });

  console.log('==> Unified Full-Stack Build Completed Successfully! 🎉');
} catch (err) {
  console.error('Build Error:', err.message);
  process.exit(1);
}
