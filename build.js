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

// Read templates
const baseTemplate = fs.readFileSync('src/templates/base.html', 'utf8');
const blogTemplate = fs.readFileSync('src/templates/blog.html', 'utf8');

// Convert template string to HTML
function applyTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (key === 'date' && data[key]) {
            // Format date as YYYY-MM-DD
            return new Date(data[key]).toISOString().split('T')[0];
        }
        return data[key] || '';
    }).replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/g, (match, key, content) => {
        return data[key] ? content : '';
    });
}

// Process markdown files
function processMarkdownFile(filePath, outputPath, isBlogPost = false) {
    const markdown = fs.readFileSync(filePath, 'utf8');
    const { attributes, body } = frontMatter(markdown);
    const html = marked.parse(body);
    
    // Add current date if not specified for blog posts
    if (isBlogPost && !attributes.date) {
        attributes.date = new Date().toISOString();
    }

    const pageHtml = applyTemplate(isBlogPost ? blogTemplate : baseTemplate, {
        title: attributes.title || 'Untitled',
        content: html,
        date: attributes.date,
        author: attributes.author
    });

    // Ensure the output directory exists
    fs.ensureDirSync(path.dirname(outputPath));
    fs.writeFileSync(outputPath, pageHtml);
}

// Create content directories if they don't exist
fs.ensureDirSync('content');
fs.ensureDirSync('content/blog');

// Create sample content if it doesn't exist
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

// Process all markdown files in content directory except index.md
function processDirectory(sourceDir, targetDir, isBlogDir = false) {
    if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        files.forEach(file => {
            // Skip index.md as we're handling index.html directly
            if (file.endsWith('.md') && file !== 'index.md') {
                const inputPath = path.join(sourceDir, file);
                const outputPath = path.join(targetDir, file.replace('.md', '.html'));
                processMarkdownFile(inputPath, outputPath, isBlogDir);
            }
        });
    }
}

// Process main pages
processDirectory('content', 'dist');
// Process blog posts with blog template
processDirectory('content/blog', 'dist/blog', true);

// Generate blog index page
const blogDir = 'content/blog';
if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
            const { attributes } = frontMatter(content);
            return {
                title: attributes.title || file.replace('.md', ''),
                date: attributes.date || new Date().toISOString().split('T')[0],
                slug: file.replace('.md', '')
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const blogIndexContent = `---
title: Blog
---
# Blog Posts

${blogFiles.map(post => `- [${post.title}](/blog/${post.slug}) - ${post.date}`).join('\n')}`;

    fs.writeFileSync('content/blog/index.md', blogIndexContent);
    processMarkdownFile('content/blog/index.md', 'dist/blog/index.html');
}

// Ensure index.html exists in dist
if (!fs.existsSync('dist/index.html')) {
    // Copy from src if it exists, otherwise create default
    if (fs.existsSync('src/index.html')) {
        fs.copySync('src/index.html', 'dist/index.html');
    }
}

console.log('Build complete! Run npm run serve to view your site.'); 