const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const frontMatter = require('front-matter');

// Configure marked for security
marked.setOptions({
    headerIds: false,
    mangle: false
});

// Ensure build directories exist
fs.ensureDirSync('dist');
fs.ensureDirSync('dist/blog');
fs.ensureDirSync('dist/css');

// Copy static assets
fs.copySync('src/css', 'dist/css');

// Read base template
const baseTemplate = fs.readFileSync('src/templates/base.html', 'utf8');

// Convert template string to HTML
function applyTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || '');
}

// Process markdown files
function processMarkdownFile(filePath, outputPath) {
    const markdown = fs.readFileSync(filePath, 'utf8');
    const { attributes, body } = frontMatter(markdown);
    const html = marked.parse(body);
    
    const pageHtml = applyTemplate(baseTemplate, {
        title: attributes.title || 'Untitled',
        content: html
    });

    // Ensure the output directory exists
    fs.ensureDirSync(path.dirname(outputPath));
    fs.writeFileSync(outputPath, pageHtml);
}

// Create content directories if they don't exist
fs.ensureDirSync('content');
fs.ensureDirSync('content/blog');

// Create sample content if it doesn't exist
if (!fs.existsSync('content/index.md')) {
    fs.writeFileSync('content/index.md', `---
title: Welcome to Your Site
---
# Welcome to Your Site

This is your beautiful landing page. Edit this content in \`content/index.md\`.

## Features

- Simple and fast
- Markdown support
- Blog ready
- Easy to customize`);
}

if (!fs.existsSync('content/about.md')) {
    fs.writeFileSync('content/about.md', `---
title: About
---
# About

Tell your story here.`);
}

if (!fs.existsSync('content/faq.md')) {
    fs.writeFileSync('content/faq.md', `---
title: FAQ
---
# Frequently Asked Questions

Add your FAQs here.`);
}

// Process all markdown files
function processDirectory(sourceDir, targetDir) {
    if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        files.forEach(file => {
            if (file.endsWith('.md')) {
                const inputPath = path.join(sourceDir, file);
                const outputPath = path.join(targetDir, file.replace('.md', '.html'));
                processMarkdownFile(inputPath, outputPath);
            }
        });
    }
}

// Process main pages
processDirectory('content', 'dist');
// Process blog posts
processDirectory('content/blog', 'dist/blog');

console.log('Build complete! Run npm run serve to view your site.'); 