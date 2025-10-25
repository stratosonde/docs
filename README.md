# Radiosonde Project Documentation Site

This repository contains the Jekyll-based documentation site and blog for the radiosonde project.

## Project Organization

The radiosonde project is organized into multiple repositories:

- **firmware** - Core firmware for the radiosonde device
- **h3lite** - Embedded H3 geospatial indexing for automatic LoRaWAN region detection
- **hardware** - PCB designs, schematics, and component information
- **tools** - Support tools and utilities
- **docs** - This documentation site

## Quick Start

### Prerequisites

- Ruby (2.7 or later)
- Bundler
- Git

### Local Development

1. Install dependencies:
```bash
bundle install
```

2. Run the site locally:
```bash
bundle exec jekyll serve
```

3. Open your browser to `http://localhost:4000`

The site will automatically rebuild when you make changes to files.

## Publishing to GitHub Pages

### Initial Setup

1. Create a new repository on GitHub named `docs` (or your preferred name)

2. Update the `_config.yml` file with your GitHub information:
   - Replace `your-email@example.com` with your email
   - Update repository links in `index.md`

3. Add the remote and push:
```bash
git add .
git commit -m "Initial Jekyll site setup"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/docs.git
git push -u origin main
```

### Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select the `main` branch
4. Save the settings

Your site will be available at `https://YOUR-ORG.github.io/docs/` within a few minutes.

## Writing Blog Posts

### Creating a New Post

1. Create a new file in the `_posts` directory with the format:
   ```
   YYYY-MM-DD-title-of-post.md
   ```

2. Add front matter at the top:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD HH:MM:SS +0000
   categories: category-name
   tags: [tag1, tag2, tag3]
   ---
   ```

3. Write your content in Markdown below the front matter

### Example Post

```markdown
---
layout: post
title: "H3 Geospatial Indexing Deep Dive"
date: 2025-10-25 15:00:00 +0000
categories: technical
tags: [h3lite, geospatial, embedded]
---

# Your Content Here

Write your blog post content using Markdown formatting.

## Code Examples

```c
#include <h3lite.h>

int main() {
    // Your code here
    return 0;
}
```

## Images

![Alt text](/assets/images/your-image.png)
```

## Site Structure

```
docs/
├── _config.yml           # Site configuration
├── _posts/               # Blog posts
├── _firmware/            # Firmware documentation (collection)
├── _hardware/            # Hardware documentation (collection)
├── _h3lite/              # H3lite documentation (collection)
├── assets/               # Images, CSS, JS
├── Gemfile               # Ruby dependencies
├── index.md              # Home page
└── about.md              # About page
```

## Customization

### Theme

The site uses the Minima theme by default. To use a different theme:

1. Update `_config.yml`:
   ```yaml
   theme: theme-name
   ```

2. Update `Gemfile` to include the theme gem

3. Run `bundle install`

### Collections

The site includes three collections for organizing documentation:
- `_firmware/` - Firmware-related documentation
- `_hardware/` - Hardware-related documentation
- `_h3lite/` - H3lite-related documentation

To add a new document to a collection, create a markdown file in the respective directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-post`)
3. Commit your changes (`git commit -am 'Add new post'`)
4. Push to the branch (`git push origin feature/new-post`)
5. Create a Pull Request

## License

This documentation site is part of the radiosonde project. Check individual repositories for specific license information.

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Markdown Guide](https://www.markdownguide.org/)
