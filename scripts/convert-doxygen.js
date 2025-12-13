#!/usr/bin/env node
/**
 * Convert Doxygen Markdown to Fumadocs MDX
 * 
 * Usage: node convert-doxygen.js <input.md> <output.mdx>
 */

const fs = require('fs');
const path = require('path');

function convertDoxygenToMdx(content, title = 'Untitled') {
  let output = content;
  
  // Extract title from Doxygen page command if present
  const pageMatch = output.match(/\\page\s+\w+\s+(.+)/);
  if (pageMatch) {
    title = pageMatch[1].trim();
  }
  
  // Remove Doxygen page commands
  output = output.replace(/\\page\s+\w+\s+.+\n?/g, '');
  
  // Convert \ref commands to markdown links
  // \ref pagename -> [pagename](/docs/pagename)
  output = output.replace(/\\ref\s+(\w+)/g, '[$1](/docs/$1)');
  output = output.replace(/\(@ref\s+(\w+)\)/g, '[$1](/docs/$1)');
  output = output.replace(/\[([^\]]+)\]\s*\(@ref\s+(\w+)\)/g, '[$1](/docs/$2)');
  
  // Convert \code ... \endcode to fenced code blocks
  output = output.replace(/\\code(\{\.(\w+)\})?/g, (match, p1, lang) => {
    return '```' + (lang || 'cpp');
  });
  output = output.replace(/\\endcode/g, '```');
  
  // Convert \snippet to placeholder (needs manual replacement)
  output = output.replace(/\\snippet\s+(\S+)\s+(\S+)/g, (match, file, tag) => {
    return `{/* TODO: Insert code from ${file} tagged with ${tag} */}\n\`\`\`cpp\n// Code from ${file} [${tag}]\n\`\`\``;
  });
  
  // Convert \image html to markdown image
  output = output.replace(/\\image\s+html\s+(\S+)/g, '![](/images/$1)');
  
  // Convert \htmlinclude to iframe or placeholder
  output = output.replace(/\\htmlinclude\s+(\S+)/g, '{/* TODO: Convert HTML from $1 */}');
  
  // Convert \note to Callout
  output = output.replace(/\\note\s+(.+)/g, '<Callout type="info">\n$1\n</Callout>');
  
  // Convert \warning to Callout
  output = output.replace(/\\warning\s+(.+)/g, '<Callout type="warn">\n$1\n</Callout>');
  
  // Remove \copyright lines
  output = output.replace(/\\copyright.*/g, '');
  
  // Convert Doxygen-style headers (underlined) to ATX headers
  output = output.replace(/^(.+)\n=+$/gm, '# $1');
  output = output.replace(/^(.+)\n-+$/gm, '## $1');
  
  // Convert {#anchor} syntax
  output = output.replace(/\{#\w+\}/g, '');
  
  // Clean up multiple blank lines
  output = output.replace(/\n{3,}/g, '\n\n');
  
  // Add frontmatter
  const description = output.substring(0, 150).replace(/[#\n\*]/g, '').trim() + '...';
  const frontmatter = `---
title: ${title}
description: ${description.substring(0, 150)}
---

`;
  
  return frontmatter + output.trim();
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node convert-doxygen.js <input.md> <output.mdx>');
    console.log('       node convert-doxygen.js <input.md> <output.mdx> "Page Title"');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  const title = args[2] || path.basename(inputFile, path.extname(inputFile));
  
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(inputFile, 'utf8');
  const converted = convertDoxygenToMdx(content, title);
  
  fs.writeFileSync(outputFile, converted);
  console.log(`Converted: ${inputFile} -> ${outputFile}`);
}

module.exports = { convertDoxygenToMdx };
