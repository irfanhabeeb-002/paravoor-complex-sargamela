# 🚀 Deployment Guide

## Quick Deploy Commands

### For GitHub Pages
```bash
npm run build:github
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### For Netlify
```bash
npm run build:netlify
# Then drag and drop the 'dist' folder to Netlify dashboard
# OR connect your GitHub repo to Netlify for auto-deployment
```

## GitHub Pages Setup

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "GitHub Actions" as source

2. **Push your code**:
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

3. **Automatic deployment**:
   - The GitHub Action will automatically build and deploy
   - Your site will be available at: `https://yourusername.github.io/sargamela-results-hub/`

## Netlify Setup

### Option 1: Drag & Drop
1. Run `npm run build:netlify`
2. Go to [Netlify](https://netlify.com)
3. Drag the `dist` folder to the deploy area

### Option 2: Git Integration
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build:netlify`
3. Set publish directory: `dist`
4. Deploy automatically on every git push

## Troubleshooting

### Blank Page Issues
- Make sure `VITE_BASE_URL` is set correctly
- For GitHub Pages: `/sargamela-results-hub/`
- For Netlify: `/`

### 404 Errors
- Ensure `_redirects` file exists in `public/` folder
- For GitHub Pages, the workflow handles this automatically
- For Netlify, the `netlify.toml` handles redirects

### Certificate Download Issues
- Verify certificate files are in `public/certificates/` folder
- Check file paths in data files match actual file locations
- Ensure certificates are committed to git repository

## Environment Variables

Create `.env` file for local development:
```bash
VITE_BASE_URL=/
```

For production, set in your deployment platform:
- GitHub Pages: Set in workflow file
- Netlify: Set in dashboard or `netlify.toml`