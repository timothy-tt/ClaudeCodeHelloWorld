# Portfolio Website

A modern, responsive single-page portfolio website built with HTML and CSS.

## Features

- Hero section with animated visual elements
- Responsive design for all screen sizes
- Modern UI with smooth animations
- Projects showcase section
- Contact information section

## GitHub Pages Deployment

This repository is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. Go to your repository settings on GitHub: `https://github.com/timothy-tt/ClaudeCodeHelloWorld/settings/pages`

2. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"

3. Once configured, the site will automatically deploy when you push to the `main` or `claude/portfolio-website-BP5KK` branch

4. Your site will be available at: `https://timothy-tt.github.io/ClaudeCodeHelloWorld/`

### Manual Deployment

You can also trigger a manual deployment:
- Go to the "Actions" tab in your repository
- Select "Deploy to GitHub Pages" workflow
- Click "Run workflow"

## Customization

### Update Content

Edit `index.html` to customize:
- Your name and title
- About section text
- Project descriptions
- Contact information

### Update Styling

Edit `styles.css` to customize:
- Colors (see CSS variables at the top)
- Fonts
- Layout and spacing
- Animations

### CSS Variables

```css
--primary-color: #6366f1;
--secondary-color: #8b5cf6;
--text-dark: #1f2937;
--text-light: #6b7280;
```

## Local Development

Simply open `index.html` in your web browser to preview the site locally.

## License

Feel free to use this template for your own portfolio!
