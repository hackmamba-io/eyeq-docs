#!/bin/bash
# Multi-Docs Setup Script for EyeQ Documentation
# Run this from the eyeq-docs directory

set -e

echo "🚀 Setting up multi-docs architecture..."

# Step 1: Create product content directories
echo "📁 Creating content directories..."
mkdir -p content/pfc-sdk
mkdir -p content/video-sdk
mkdir -p content/video-cli
mkdir -p content/web-api
mkdir -p content/browser-sdk

# Step 2: Move existing PFC SDK docs to new location
echo "📦 Moving PFC SDK docs..."
if [ -d "content/docs" ]; then
  # Move all existing docs content to pfc-sdk
  cp -r content/docs/* content/pfc-sdk/ 2>/dev/null || true
  
  # Remove the old docs index that's not needed
  rm -f content/pfc-sdk/overview.mdx 2>/dev/null || true
  
  echo "✅ PFC SDK docs moved to content/pfc-sdk/"
else
  echo "⚠️  No existing content/docs directory found"
fi

# Step 3: Create app directory structure for dynamic routing
echo "📁 Creating app route structure..."
mkdir -p app/docs/\[product\]/\[\[...slug\]\]

# Step 4: Backup old docs layout if exists
if [ -f "app/docs/layout.tsx" ]; then
  mv app/docs/layout.tsx app/docs/layout.tsx.backup
  echo "📋 Backed up old docs layout"
fi

if [ -d "app/docs/[[...slug]]" ]; then
  mv "app/docs/[[...slug]]" "app/docs/[[...slug]].backup"
  echo "📋 Backed up old slug route"
fi

echo ""
echo "✅ Directory structure created!"
echo ""
echo "Next steps:"
echo "1. Copy the new source.config.ts (already done)"
echo "2. Copy the new lib/source.ts (already done)"
echo "3. Copy the new lib/products.ts (already done)"
echo "4. Copy the app route files from the generated files"
echo "5. Run: npm run dev"
echo ""
