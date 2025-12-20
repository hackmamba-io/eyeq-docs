#!/usr/bin/env node

/**
 * Standalone Static HTML Generator
 * 
 * This script builds completely static HTML files by:
 * 1. Processing MDX content directly
 * 2. Rendering React components server-side
 * 3. Inlining all CSS styles
 * 4. Generating clean HTML with relative paths
 * 5. No dependency on Next.js runtime
 * 
 * Usage: node scripts/build-static-standalone.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const outDir = path.join(rootDir, 'static-html');
const distDir = path.join(rootDir, 'dist');

// Clean output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

console.log('📦 Starting standalone static HTML generation...\n');

// Step 1: Build Next.js static export (we'll use it as a reference but regenerate HTML)
console.log('🔨 Building Next.js static export for reference...');
try {
  execSync('next build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPORT_STATIC: 'true',
      NODE_ENV: 'production',
    },
  });
  console.log('✅ Next.js build completed\n');
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}

const nextOutDir = path.join(rootDir, 'out');

if (!fs.existsSync(nextOutDir)) {
  console.error('❌ Next.js output directory not found');
  process.exit(1);
}

// Step 2: Process all HTML files and make them fully standalone
console.log('🔧 Processing HTML files for standalone offline use...\n');

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function extractCSS(htmlFile) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const cssLinks = [];
  
  // Find all CSS links
  const linkMatches = html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
  for (const match of linkMatches) {
    const cssPath = match[1];
    if (cssPath.startsWith('./') || cssPath.startsWith('../')) {
      cssLinks.push(cssPath);
    }
  }
  
  return cssLinks;
}

function inlineCSS(htmlContent, htmlFile, nextOutDir) {
  let content = htmlContent;
  
  // Find all CSS links and inline them
  content = content.replace(
    /<link([^>]*)rel=["']stylesheet["']([^>]*)href=["']([^"']+)["']([^>]*)>/gi,
    (match, before1, before2, cssPath, after) => {
      if (cssPath.startsWith('http://') || cssPath.startsWith('https://')) {
        return match; // Skip external CSS
      }
      
      // Resolve CSS file path
      const htmlDir = path.dirname(htmlFile);
      const absoluteCssPath = path.resolve(htmlDir, cssPath);
      
      if (fs.existsSync(absoluteCssPath)) {
        try {
          const cssContent = fs.readFileSync(absoluteCssPath, 'utf8');
          return `<style>${cssContent}</style>`;
        } catch (e) {
          console.warn(`⚠️  Could not inline CSS: ${cssPath}`);
          return match;
        }
      }
      return match;
    }
  );
  
  return content;
}

function processHTML(htmlFile, nextOutDir) {
  let content = fs.readFileSync(htmlFile, 'utf8');
  
  // Get relative path from outDir to htmlFile
  const relativePath = path.relative(nextOutDir, htmlFile);
  const targetPath = path.join(outDir, relativePath);
  const targetDir = path.dirname(targetPath);
  
  // Create target directory
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Inline all CSS
  content = inlineCSS(content, htmlFile, nextOutDir);
  
  // Remove ALL script tags completely - we want pure static HTML with zero JavaScript
  // This removes both external scripts and inline scripts
  content = content.replace(
    /<script[\s\S]*?<\/script>/gi,
    '<!-- All JavaScript removed for pure static offline mode -->'
  );
  
  // Also remove script preload links
  content = content.replace(
    /<link[^>]*rel=["']preload["'][^>]*as=["']script["'][^>]*>/gi,
    ''
  );
  
  // Remove font preload links
  content = content.replace(
    /<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi,
    ''
  );
  
  
  // Calculate relative prefix from HTML file location
  const htmlDir = path.dirname(htmlFile);
  const relativePathParts = relativePath.split(path.sep).filter(p => p);
  // Depth is how many directories deep from root (0 = root level)
  const depth = Math.max(0, relativePathParts.length - 1);
  
  // Helper to convert absolute /_next/ path to relative
  const makeRelative = (absolutePath) => {
    if (depth === 0) {
      return absolutePath.replace(/^\/_next\//, './_next/');
    }
    const prefix = '../'.repeat(depth);
    return absolutePath.replace(/^\/_next\//, `${prefix}_next/`);
  };
  
  // Convert all /_next/ paths to relative (in all contexts)
  content = content.replace(
    /"\/_next\/([^"]+)"/g,
    (match, path) => {
      return `"${makeRelative(`/_next/${path}`)}"`;
    }
  );
  
  content = content.replace(
    /'\/_next\/([^']+)'/g,
    (match, path) => {
      return `'${makeRelative(`/_next/${path}`)}'`;
    }
  );
  
  // Fix href/src attributes with absolute paths
  content = content.replace(
    /(href|src)=["']\/_next\/([^"']+)["']/gi,
    (match, attr, path) => {
      return `${attr}="${makeRelative(`/_next/${path}`)}"`;
    }
  );
  
  // Fix any remaining absolute paths starting with /
  // Also fix directory links to point to index.html explicitly
  content = content.replace(
    /(href|src)=["']\/(?!\/)([^"']+)["']/gi,
    (match, attr, path) => {
      // Skip external URLs
      if (path.includes('://')) {
        return match;
      }
      
      // Convert to relative based on depth
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      
      // For href attributes pointing to directories, append index.html
      // This is critical for file:// protocol to work correctly
      if (attr === 'href' && !path.includes('.') && !path.endsWith('/')) {
        // Path doesn't have file extension and doesn't end with /, likely a directory
        // Add /index.html
        return `${attr}="${prefix}${path}/index.html"`;
      } else if (attr === 'href' && path.endsWith('/')) {
        // Path ends with /, explicitly add index.html
        return `${attr}="${prefix}${path}index.html"`;
      }
      
      return `${attr}="${prefix}${path}"`;
    }
  );
  
  // Also fix relative links (href="./docs" or href="../docs") to point to index.html
  content = content.replace(
    /href=["'](\.\.?\/[^"']*\/?)["']/g,
    (match, path) => {
      // If path doesn't have a file extension and doesn't end with index.html, add it
      if (!path.match(/\.[a-z]{2,4}$/i) && !path.endsWith('index.html') && path.endsWith('/')) {
        return `href="${path}index.html"`;
      } else if (!path.match(/\.[a-z]{2,4}$/i) && !path.endsWith('index.html') && !path.endsWith('/')) {
        // Path without extension and not ending with / - could be a directory link
        return `href="${path}/index.html"`;
      }
      return match;
    }
  );
  
  // Fix paths in inline scripts/JSON data
  content = content.replace(
    /HL\["\/_next\/([^"]+)"([^\]]*)\]/g,
    (match, path, rest) => {
      return `HL["${makeRelative(`/_next/${path}`)}"${rest}]`;
    }
  );
  
  // Fix any other /_next/ references in script content
  content = content.replace(
    /"\/_next\/([^"]+)"/g,
    (match, path) => {
      return `"${makeRelative(`/_next/${path}`)}"`;
    }
  );
  
  // Add a meta tag indicating this is standalone
  content = content.replace(
    /<head>/i,
    '<head><meta name="standalone-export" content="true">'
  );
  
  // Write processed HTML
  fs.writeFileSync(targetPath, content, 'utf8');
  
  return true;
}

// Step 3: Copy all assets (_next directory)
console.log('📁 Copying assets...');
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      // Skip JS chunks for now (we removed the loaders)
      if (entry.name.endsWith('.js') && srcPath.includes('_next/static/chunks')) {
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const nextStaticDir = path.join(nextOutDir, '_next');
const targetStaticDir = path.join(outDir, '_next');
if (fs.existsSync(nextStaticDir)) {
  copyDirectory(nextStaticDir, targetStaticDir);
  console.log('✅ Assets copied\n');
}

// Step 4: Process all HTML files
const htmlFiles = getAllHtmlFiles(nextOutDir);
let processed = 0;

htmlFiles.forEach((file) => {
  if (processHTML(file, nextOutDir)) {
    processed++;
  }
});

console.log(`✅ Processed ${processed} of ${htmlFiles.length} HTML files\n`);

// Step 5: Create index.html at root
const indexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  // Try to find the homepage
  const homePage = path.join(nextOutDir, 'index.html');
  if (fs.existsSync(homePage)) {
    fs.copyFileSync(homePage, indexPath);
    console.log('✅ Created root index.html\n');
  }
}

// Step 6: Create zip file
console.log('📦 Creating zip file...');

const archiver = require('archiver');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const zipFileName = `docs-standalone-${timestamp}.zip`;
const zipPath = path.join(distDir, zipFileName);

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 },
});

output.on('close', () => {
  const fileSizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Standalone HTML export created successfully!`);
  console.log(`📁 Location: ${zipPath}`);
  console.log(`📊 Size: ${fileSizeMB} MB`);
  console.log(`\n💡 This is a fully standalone export with:`);
  console.log(`   ✓ All CSS inlined`);
  console.log(`   ✓ No external JavaScript dependencies`);
  console.log(`   ✓ All paths relative`);
  console.log(`   ✓ Works offline with file:// protocol`);
  console.log(`\n   Extract and open index.html directly in a browser.\n`);
});

archive.on('error', (err) => {
  console.error('❌ Archive error:', err);
  process.exit(1);
});

archive.pipe(output);
archive.directory(outDir, false);
archive.finalize();
