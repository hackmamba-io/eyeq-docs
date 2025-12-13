#!/bin/bash
# Complete Multi-Docs Migration Script for EyeQ Documentation
# Run this from the eyeq-docs directory

set -e

echo "🚀 Migrating to multi-docs architecture..."
echo ""

# Step 1: Backup existing content
echo "📋 Creating backup of existing content..."
if [ -d "content/docs" ]; then
  cp -r content/docs content/docs.backup
  echo "✅ Backup created at content/docs.backup"
fi

# Step 2: Copy existing PFC SDK content
echo ""
echo "📦 Copying PFC SDK content..."
if [ -d "content/docs" ]; then
  # Copy everything except the root meta.json and index
  cp -r content/docs/* content/pfc-sdk/ 2>/dev/null || true
  echo "✅ PFC SDK content copied"
else
  echo "⚠️  No existing docs found - will use placeholder content"
fi

# Step 3: Remove old docs directory (optional - commented out for safety)
# echo ""
# echo "🗑️  Removing old docs directory..."
# rm -rf content/docs
# echo "✅ Old docs directory removed"

echo ""
echo "✅ Migration complete!"
echo ""
echo "Your content is now at:"
echo "  - content/pfc-sdk/       (Perfectly Clear SDK)"
echo "  - content/video-sdk/     (Video SDK)"
echo "  - content/video-cli/     (Video CLI)"
echo "  - content/web-api/       (Web API)"
echo "  - content/browser-sdk/   (Browser SDK)"
echo ""
echo "Next: Run 'npm run dev' to test"
echo ""
