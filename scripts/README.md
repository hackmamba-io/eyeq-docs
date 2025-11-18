# Static HTML Export Scripts

These scripts export the documentation site as pure static HTML for offline use.

## Usage

### Standard Export (Recommended)

```bash
npm run export-static
```

This will:
1. Build Next.js static export
2. Process HTML files to remove all JavaScript
3. Inline all CSS styles
4. Convert all paths to relative (including directory links → `index.html`)
5. Create a zip file with pure static HTML

**Output**: `dist/docs-standalone-YYYY-MM-DD.zip`

### Crawler Export (Alternative)

```bash
npm run crawl-static
```

This will:
1. Start Next.js dev server
2. Use Puppeteer to crawl all pages (after JS execution)
3. Extract fully rendered HTML
4. Remove all JavaScript
5. Inline all CSS
6. Make all paths relative
7. Auto-discover pages by following links

**Output**: `dist/docs-crawled-YYYY-MM-DD.zip`

## Features

Both exports create pure static HTML that:
- ✅ **No JavaScript** - All `<script>` tags removed
- ✅ **Inline CSS** - All styles embedded in `<style>` tags
- ✅ **Relative paths** - All links work with `file://` protocol
- ✅ **Explicit index.html** - Directory links point to `index.html` files
- ✅ **System fonts** - No external font dependencies
- ✅ **Offline ready** - Works perfectly without internet

## Offline Use

1. Extract the zip file
2. Open `index.html` directly in any web browser
3. All links will work correctly - no server needed!

## File Structure

```
extracted-folder/
├── index.html                    # Homepage
├── docs/
│   ├── index.html               # Docs homepage
│   ├── overview/
│   │   └── index.html
│   ├── getting-started/
│   │   ├── installation/
│   │   │   └── index.html
│   │   └── ...
│   └── ...
└── _next/
    └── static/
        └── css/
            └── ...              # Inline styles embedded in HTML
```

## Notes

- The `dist/` directory is gitignored
- JavaScript is completely removed for full offline compatibility
- Interactive features (search, dynamic navigation) won't work (by design)
- Content and styling work perfectly offline
- All internal links are properly converted to relative paths

## Requirements

- Node.js 18+
- All dependencies installed (`npm install`)
- For crawler: Puppeteer (automatically installed)
