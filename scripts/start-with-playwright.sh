#!/bin/bash
# Install Playwright browsers if not already installed, then start the app

echo "Checking for Playwright browsers..."
if ! npx playwright install chromium --dry-run 2>/dev/null; then
  echo "Installing Playwright Chromium..."
  npx playwright install chromium
else
  echo "Playwright browsers already installed"
fi

echo "Starting Next.js server..."
exec npm start

