// scripts/migrate-pfc-content.js
// Run with: node scripts/migrate-pfc-content.js

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../content/docs');
const destDir = path.join(__dirname, '../content/pfc-sdk');

// Directories to copy
const dirsToCopy = [
  'api-reference/data-structures',
  'api-reference/namespaces',
  'api-reference/files',
  'examples',
  'tools',
  'legal',
];

// Individual files to copy
const filesToCopy = [
  'api-reference/_meta.json',
  'api-reference/index.mdx',
  'api-reference/overview.mdx',
  'api-reference/c-api.mdx',
  'api-reference/csharp-api.mdx',
  'changelog.mdx',
];

// Function to update links in content
function updateLinks(content) {
  // Replace /docs/api-reference with /docs/pfc-sdk/api-reference
  // Replace /docs/guides with /docs/pfc-sdk/guides
  // Replace /docs/examples with /docs/pfc-sdk/examples
  // But don't replace /docs/pfc-sdk (already correct)
  
  const patterns = [
    { from: /\(\/docs\/api-reference/g, to: '(/docs/pfc-sdk/api-reference' },
    { from: /\(\/docs\/guides/g, to: '(/docs/pfc-sdk/guides' },
    { from: /\(\/docs\/examples/g, to: '(/docs/pfc-sdk/examples' },
    { from: /\(\/docs\/tools/g, to: '(/docs/pfc-sdk/tools' },
    { from: /\(\/docs\/getting-started/g, to: '(/docs/pfc-sdk/getting-started' },
    { from: /\(\/docs\/legal/g, to: '(/docs/pfc-sdk/legal' },
    { from: /href="\/docs\/api-reference/g, to: 'href="/docs/pfc-sdk/api-reference' },
    { from: /href="\/docs\/guides/g, to: 'href="/docs/pfc-sdk/guides' },
    { from: /href="\/docs\/examples/g, to: 'href="/docs/pfc-sdk/examples' },
  ];
  
  let result = content;
  for (const { from, to } of patterns) {
    result = result.replace(from, to);
  }
  return result;
}

// Copy a directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Update links in MDX files
      if (entry.name.endsWith('.mdx')) {
        content = updateLinks(content);
      }
      
      fs.writeFileSync(destPath, content);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

// Copy a single file
function copyFile(relativePath) {
  const srcPath = path.join(sourceDir, relativePath);
  const destPath = path.join(destDir, relativePath);
  
  // Ensure directory exists
  const destDirPath = path.dirname(destPath);
  if (!fs.existsSync(destDirPath)) {
    fs.mkdirSync(destDirPath, { recursive: true });
  }
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    
    if (relativePath.endsWith('.mdx')) {
      content = updateLinks(content);
    }
    
    fs.writeFileSync(destPath, content);
    console.log(`Copied: ${relativePath}`);
  } else {
    console.log(`Warning: ${srcPath} not found`);
  }
}

// Main execution
console.log('Starting PFC SDK content migration...\n');

// Copy directories
for (const dir of dirsToCopy) {
  const srcPath = path.join(sourceDir, dir);
  const destPath = path.join(destDir, dir);
  
  if (fs.existsSync(srcPath)) {
    console.log(`\nCopying directory: ${dir}`);
    copyDir(srcPath, destPath);
  } else {
    console.log(`Warning: Directory ${dir} not found`);
  }
}

// Copy individual files
console.log('\nCopying individual files...');
for (const file of filesToCopy) {
  copyFile(file);
}

console.log('\nMigration complete!');
console.log('\nNext steps:');
console.log('1. Review the migrated content in content/pfc-sdk/');
console.log('2. Run npm run dev to test');
console.log('3. Consider removing or archiving content/docs/ after verification');
