# Simple Static Site Generator

A lightweight static site generator that converts Markdown files to HTML. No complicated frameworks, just simple HTML, CSS, and JavaScript.

## Features

- Markdown support for all content
- Blog-ready
- Simple and fast
- Easy to customize
- No complex frameworks

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create or edit content:
   - Edit pages in the `content/` directory
   - Add blog posts in the `content/blog/` directory
   - All content files should be in Markdown format (.md)
   - Use front matter for page metadata (title, date, etc.)

3. Build the site:
   ```bash
   npm run build
   ```

4. Preview the site:
   ```bash
   npm run serve
   ```
   Then visit http://localhost:3000

## Content Structure

- `content/index.md` - Home page
- `content/about.md` - About page
- `content/faq.md` - FAQ page
- `content/blog/*.md` - Blog posts

## Customization

- Edit `src/templates/base.html` to modify the site template
- Edit `src/css/style.css` to change the styling
- Modify `build.js` to add new features to the build process

## Adding a Blog Post

Create a new .md file in `content/blog/` with front matter:

```markdown
---
title: Your Post Title
date: YYYY-MM-DD
---

Your content here...
```