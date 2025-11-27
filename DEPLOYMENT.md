# GitHub Pages Deployment Guide

## Quick Deployment Steps

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., `electrical-checklist`)
4. Choose "Public" (required for free GitHub Pages)
5. Click "Create repository"

### 2. Push Your Code to GitHub

Open a terminal in your project folder and run:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your files
git commit -m "Initial commit - Electrical Service Checklist PWA"

# Add your GitHub repository as remote (replace with your username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" (gear icon)
3. In the left sidebar, click "Pages"
4. Under "Source", select "Deploy from a branch"
5. Under "Branch", select `main` and `/ (root)`
6. Click "Save"

### 4. Access Your App

After a few minutes, your app will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

You'll see a green success message with the URL on the Pages settings page.

## Updating Your App

To make updates after the initial deployment:

```bash
# Make your changes to the files

# Add the changes
git add .

# Commit with a descriptive message
git commit -m "Description of changes"

# Push to GitHub
git push
```

Your site will automatically rebuild and update within a few minutes.

## Custom Domain (Optional)

To use a custom domain like `electrical-checklist.com`:

1. Purchase a domain from a registrar (GoDaddy, Namecheap, etc.)
2. In GitHub Pages settings, enter your custom domain
3. In your domain registrar, add these DNS records:
   - Type: `A` → Points to: `185.199.108.153`
   - Type: `A` → Points to: `185.199.109.153`
   - Type: `A` → Points to: `185.199.110.153`
   - Type: `A` → Points to: `185.199.111.153`
   - Type: `CNAME` → Points to: `YOUR_USERNAME.github.io`

## HTTPS Configuration

GitHub Pages automatically provides HTTPS for your site. Make sure "Enforce HTTPS" is checked in the Pages settings.

## PWA Installation

Once deployed, users can install your app:

### Desktop (Chrome/Edge)
1. Visit your GitHub Pages URL
2. Look for the install icon in the address bar
3. Click to install

### Mobile (iOS)
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Mobile (Android)
1. Open in Chrome
2. Tap the menu (⋮)
3. Select "Install app"

## Troubleshooting

### Site Not Loading
- Wait 5-10 minutes after enabling Pages
- Check that `index.html` is in the root directory
- Verify the repository is public

### PWA Not Installing
- Make sure you're accessing via HTTPS
- Check browser console for manifest errors
- Verify `manifest.json` and `service-worker.js` are accessible

### Icons Not Showing
- Ensure `icon-192.png` and `icon-512.png` are in the root directory
- Clear browser cache and reload

## Files Required for PWA

Make sure these files are in your repository:
- ✅ `index.html` - Main application
- ✅ `styles.css` - Styling
- ✅ `app.js` - Application logic
- ✅ `manifest.json` - PWA configuration
- ✅ `service-worker.js` - Offline functionality
- ✅ `icon-192.png` - App icon (192x192)
- ✅ `icon-512.png` - App icon (512x512)
- ✅ `README.md` - Documentation
- ✅ `.gitignore` - Files to ignore

## Testing Locally

Before deploying, test locally:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve

# Then visit http://localhost:8080
```

## Support

For issues with:
- GitHub Pages: [GitHub Pages Documentation](https://docs.github.com/pages)
- PWA: [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- Git: [Git Documentation](https://git-scm.com/doc)
