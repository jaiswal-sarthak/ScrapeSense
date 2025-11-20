#!/usr/bin/env node
/**
 * Start script for Render that ensures Playwright browsers are installed
 */
const { execSync } = require('child_process');
const { spawn } = require('child_process');

console.log('🚀 Starting ScrapeSense server...');

// Check and install Playwright browsers
try {
  console.log('📦 Checking Playwright browsers...');
  execSync('npx playwright install chromium', {
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
    },
  });
  console.log('✅ Playwright browsers ready');
} catch (error) {
  console.error('⚠️  Playwright installation warning:', error.message);
  // Continue anyway - might already be installed
}

// Start Next.js server
console.log('🌐 Starting Next.js...');
const nextServer = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
});

nextServer.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

nextServer.on('exit', (code) => {
  process.exit(code || 0);
});

