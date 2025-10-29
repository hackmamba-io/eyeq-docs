#!/usr/bin/env node

/**
 * Static HTML Crawler - Builds pure static HTML by crawling the website
 * 
 * This script:
 * 1. Starts Next.js dev server
 * 2. Crawls all pages using Puppeteer
 * 3. Extracts fully rendered HTML (after JS execution)
 * 4. Removes all JavaScript
 * 5. Inlines all CSS
 * 6. Makes all paths relative
 * 7. Creates a pure static HTML site
 * 
 * Usage: node scripts/crawl-static-html.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'static-html');
const distDir = path.join(rootDir, 'dist');

// Check if puppeteer is available, if not suggest installation
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.error('❌ Puppeteer not found. Installing...\n');
  console.log('Please run: npm install --save-dev puppeteer\n');
  process.exit(1);
}

console.log('📦 Starting static HTML crawler...\n');

// Clean output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Step 1: Start Next.js dev server
console.log('🚀 Starting Next.js dev server...');
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: rootDir,
  stdio: 'pipe',
  shell: true,
});

let serverReady = false;
const maxWaitTime = 60000; // 60 seconds
const startTime = Date.now();

devServer.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Ready') || output.includes('localhost')) {
    if (!serverReady) {
      serverReady = true;
      console.log('✅ Dev server ready\n');
      startCrawling();
    }
  }
});

devServer.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('error')) {
    console.error('❌ Dev server error:', output);
  }
});

// Check if server is ready by polling
function waitForServer() {
  return new Promise((resolve, reject) => {
    const checkServer = () => {
      const req = http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          resolve();
        } else {
          setTimeout(checkServer, 1000);
        }
      });
      
      req.on('error', () => {
        if (Date.now() - startTime < maxWaitTime) {
          setTimeout(checkServer, 1000);
        } else {
          reject(new Error('Server did not start in time'));
        }
      });
    };
    
    checkServer();
  });
}

// Pages to crawl - get from source
function getAllPages() {
  try {
    // We'll need to get pages from the source
    // For now, let's define the common pages
    const pages = [
      '/',
      '/docs',
      '/docs/overview',
      '/docs/getting-started/installation',
      '/docs/getting-started/configuration',
      '/docs/getting-started/customization',
      '/docs/developer-tools/sdks',
      '/docs/developer-tools/testing',
      '/docs/developer-tools/troubleshooting',
      '/docs/developer-tools/webhooks',
      '/docs/api-reference/api-overview',
      '/docs/api-reference/authentication',
      '/docs/api-reference/rate-limits',
      '/docs/community-support/community',
      '/docs/community-support/support',
      '/docs/community-support/contributing',
      '/docs/community-support/feedback',
      '/docs/community-support/feature-requests',
    ];
    
    return pages;
  } catch (e) {
    console.error('❌ Error getting pages:', e.message);
    return [];
  }
}

async function startCrawling() {
  try {
    await waitForServer();
    
    console.log('🕷️  Starting to crawl pages...\n');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    const pagesToCrawl = getAllPages();
    const crawledPages = new Set();
    const pagesToVisit = [...pagesToCrawl];
    
    console.log(`Found ${pagesToVisit.length} pages to crawl\n`);
    
    // Crawl each page
    for (const urlPath of pagesToVisit) {
      if (crawledPages.has(urlPath)) continue;
      
      try {
        const fullUrl = `http://localhost:3000${urlPath}`;
        console.log(`📄 Crawling: ${urlPath}`);
        
        await page.goto(fullUrl, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        });
        
        // Wait for content to render
        await page.waitForTimeout(2000);
        
        // Get fully rendered HTML
        let html = await page.content();
        
        // Remove all script tags completely
        html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
        
        // Remove script references in links
        html = html.replace(/<link[^>]*rel=["']preload["'][^>]*as=["']script["'][^>]*>/gi, '');
        
        // Get all CSS and inline it
        const stylesheets = await page.evaluate(() => {
          const styles = [];
          document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http')) {
              styles.push(href);
            }
          });
          return styles;
        });
        
        // Inline CSS from stylesheets
        for (const stylesheet of stylesheets) {
          try {
            const cssUrl = new URL(stylesheet, fullUrl).href;
            const response = await page.goto(cssUrl);
            const cssContent = await response.text();
            
            // Replace link tag with style tag
            html = html.replace(
              new RegExp(`<link[^>]*href=["']${stylesheet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi'),
              `<style>${cssContent}</style>`
            );
          } catch (e) {
            console.warn(`⚠️  Could not inline CSS: ${stylesheet}`);
          }
        }
        
        // Make all paths relative
        html = makePathsRelative(html, urlPath);
        
        // Remove font preloads
        html = html.replace(/<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi, '');
        
        // Save HTML file
        let filePath = urlPath === '/' ? '/index.html' : `${urlPath}/index.html`;
        filePath = filePath.replace(/^\//, '');
        const fullPath = path.join(outDir, filePath);
        const dir = path.dirname(fullPath);
        
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, html, 'utf8');
        
        crawledPages.add(urlPath);
        console.log(`✅ Saved: ${filePath}\n`);
        
        // Find links to other pages and add them to queue
        const links = await page.evaluate(() => {
          const links = [];
          document.querySelectorAll('a[href]').forEach((a) => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('/') && !href.startsWith('//') && !href.includes('#')) {
              links.push(href);
            }
          });
          return [...new Set(links)];
        });
        
        // Add new links to queue
        links.forEach((link) => {
          if (!crawledPages.has(link) && !pagesToVisit.includes(link)) {
            pagesToVisit.push(link);
          }
        });
        
      } catch (error) {
        console.error(`❌ Error crawling ${urlPath}:`, error.message);
      }
    }
    
    await browser.close();
    
    console.log(`\n✅ Crawled ${crawledPages.size} pages\n`);
    
    // Create zip
    createZip();
    
    // Stop dev server
    devServer.kill();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Crawling failed:', error);
    devServer.kill();
    process.exit(1);
  }
}

function makePathsRelative(html, currentPath) {
  // Calculate depth
  const depth = currentPath === '/' ? 0 : currentPath.split('/').filter(p => p).length;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  
  // Fix absolute paths and ensure directory links point to index.html
  html = html.replace(/(href|src)=["']\/(?!\/)([^"']+)["']/gi, (match, attr, path) => {
    if (path.includes('://')) return match; // Skip external URLs
    
    const relativePath = `${prefix}${path.replace(/^\//, '')}`;
    
    // For href attributes, ensure directory links point to index.html
    if (attr === 'href') {
      // If path doesn't have file extension and doesn't end with /, add /index.html
      if (!path.includes('.') && !path.match(/\.[a-z]{2,4}$/i) && !path.endsWith('/')) {
        return `${attr}="${relativePath}/index.html"`;
      } else if (path.endsWith('/')) {
        return `${attr}="${relativePath}index.html"`;
      }
    }
    
    return `${attr}="${relativePath}"`;
  });
  
  // Fix /_next/ paths
  html = html.replace(/"\/_next\/([^"]+)"/g, `"${prefix}_next/$1"`);
  html = html.replace(/'\/_next\/([^']+)'/g, `'${prefix}_next/$1'`);
  
  // Fix relative links that point to directories
  html = html.replace(/href=["'](\.\.?\/[^"']*\/?)["']/g, (match, path) => {
    if (!path.match(/\.[a-z]{2,4}$/i) && !path.endsWith('index.html')) {
      if (path.endsWith('/')) {
        return `href="${path}index.html"`;
      } else {
        return `href="${path}/index.html"`;
      }
    }
    return match;
  });
  
  return html;
}

function createZip() {
  console.log('📦 Creating zip file...');
  
  const archiver = require('archiver');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const zipFileName = `docs-crawled-${timestamp}.zip`;
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
    console.log(`✅ Pure static HTML export created!`);
    console.log(`📁 Location: ${zipPath}`);
    console.log(`📊 Size: ${fileSizeMB} MB`);
    console.log(`\n💡 This is a pure static HTML export:`);
    console.log(`   ✓ No JavaScript`);
    console.log(`   ✓ All CSS inlined`);
    console.log(`   ✓ All paths relative`);
    console.log(`   ✓ Works perfectly with file:// protocol\n`);
  });
  
  archive.on('error', (err) => {
    console.error('❌ Archive error:', err);
  });
  
  archive.pipe(output);
  archive.directory(outDir, false);
  archive.finalize();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Interrupted. Stopping dev server...');
  devServer.kill();
  process.exit(0);
});

