#!/usr/bin/env node
/**
 * Validate MDX files for common issues
 * 
 * Usage: node validate-mdx.js [directory]
 */

const fs = require('fs');
const path = require('path');

const DOXYGEN_PATTERNS = [
  { pattern: /\\ref\s+\w+/g, name: '\\ref command' },
  { pattern: /@ref\s+\w+/g, name: '@ref command' },
  { pattern: /\\code/g, name: '\\code block' },
  { pattern: /\\endcode/g, name: '\\endcode block' },
  { pattern: /\\snippet/g, name: '\\snippet command' },
  { pattern: /\\image\s+html/g, name: '\\image command' },
  { pattern: /\\page\s+\w+/g, name: '\\page command' },
  { pattern: /\\copyright/g, name: '\\copyright' },
  { pattern: /\\note/g, name: '\\note' },
  { pattern: /\\warning/g, name: '\\warning' },
  { pattern: /\\htmlinclude/g, name: '\\htmlinclude' },
];

function validateMdxFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];
  
  // Check for frontmatter
  if (!content.startsWith('---')) {
    errors.push('Missing frontmatter (file should start with ---)');
  } else {
    // Check frontmatter has required fields
    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      errors.push('Frontmatter not properly closed');
    } else {
      const frontmatter = content.substring(3, frontmatterEnd);
      if (!frontmatter.includes('title:')) {
        errors.push('Missing title in frontmatter');
      }
      if (!frontmatter.includes('description:')) {
        warnings.push('Missing description in frontmatter');
      }
    }
  }
  
  // Check for unconverted Doxygen commands
  DOXYGEN_PATTERNS.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      errors.push(`Found unconverted Doxygen ${name} (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`);
    }
  });
  
  // Check for relative image paths
  const imageMatches = content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g);
  for (const match of imageMatches) {
    const imgPath = match[2];
    if (!imgPath.startsWith('/') && !imgPath.startsWith('http')) {
      warnings.push(`Relative image path: ${imgPath} (should start with /)`);
    }
  }
  
  // Check for internal links
  const linkMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of linkMatches) {
    const linkPath = match[2];
    // Skip external links and anchors
    if (!linkPath.startsWith('http') && !linkPath.startsWith('#') && !linkPath.startsWith('/')) {
      warnings.push(`Relative link path: ${linkPath} (should start with /docs/)`);
    }
  }
  
  // Check for TODO comments
  const todoMatches = content.match(/\{\/\*\s*TODO/g);
  if (todoMatches) {
    warnings.push(`Contains ${todoMatches.length} TODO comment${todoMatches.length > 1 ? 's' : ''}`);
  }
  
  // Check for empty code blocks
  if (content.includes('```\n```') || content.includes('```cpp\n```')) {
    warnings.push('Contains empty code blocks');
  }
  
  return { errors, warnings };
}

function walkDir(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath, results);
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Main
const targetDir = process.argv[2] || path.join(__dirname, '../content/docs');

if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

console.log(`\n🔍 Validating MDX files in: ${targetDir}\n`);

const files = walkDir(targetDir);
let totalErrors = 0;
let totalWarnings = 0;

files.forEach(filePath => {
  const { errors, warnings } = validateMdxFile(filePath);
  const relativePath = path.relative(targetDir, filePath);
  
  if (errors.length > 0 || warnings.length > 0) {
    console.log(`📄 ${relativePath}`);
    
    errors.forEach(e => {
      console.log(`   ❌ ${e}`);
      totalErrors++;
    });
    
    warnings.forEach(w => {
      console.log(`   ⚠️  ${w}`);
      totalWarnings++;
    });
    
    console.log('');
  }
});

console.log('─'.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`   Files checked: ${files.length}`);
console.log(`   Errors: ${totalErrors}`);
console.log(`   Warnings: ${totalWarnings}`);

if (totalErrors === 0 && totalWarnings === 0) {
  console.log('\n✅ All files passed validation!\n');
} else if (totalErrors === 0) {
  console.log('\n⚠️  Validation complete with warnings.\n');
} else {
  console.log('\n❌ Validation found errors that need fixing.\n');
  process.exit(1);
}
