# Residential Electrical Service Checklist

A Progressive Web App (PWA) for calculating residential electrical service loads based on the 2024 Canadian Electrical Code.

## Features

- **Service Size Selection**: Choose between 60A, 100A, or 200A service
- **Square Footage Calculator**: Enter main floor and basement square footage
- **Appliance Assessment**: Check for heat pumps, electric heaters, water heaters, ranges, and more
- **Automatic Load Calculation**: Based on Canadian Electrical Code standards
- **Safety Survey Recommendations**: Automatic determination if safety survey is required
- **Print Summary**: Generate printable summary reports
- **Mobile Friendly**: Responsive design works on phones, tablets, and desktops
- **Offline Capable**: Works offline as a Progressive Web App

## Installation

### For Users

#### Desktop
1. Visit the website in Chrome, Edge, or Safari
2. Click the install icon in the address bar
3. The app will be installed as a desktop application

#### Mobile (iOS)
1. Open the website in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

#### Mobile (Android)
1. Open the website in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home Screen"

### For Developers

1. Clone this repository
2. Open `index.html` in a web browser
3. Or serve using a local web server:
   ```bash
   npx serve
   ```

## Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Push this code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select "Deploy from branch"
5. Choose "main" branch and "/ (root)" folder
6. Click Save
7. Your app will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## How It Works

The calculator follows the 2024 Canadian Electrical Code standards:

1. **Base Load**: 5000W for first 90 square meters, plus 1000W for each additional 90 square meters
2. **Heat Pumps**: 2880W per heat pump
3. **Electric Water Heater**: 3500W
4. **Electric Range**: 6000W
5. **Pool/Hot Tub/Sauna/Vehicle Charger**: 7680W
6. **Clothes Dryer**: 1440W
7. **Pottery Kiln**: 1440W

The app calculates total wattage and converts to amperage at 240V, then determines if a safety survey is required based on the service size and calculated load.

## Technologies Used

- HTML5
- CSS3 (Flexbox, Responsive Design)
- Vanilla JavaScript
- Service Worker API (for offline support)
- Web App Manifest (for PWA features)

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 90+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## License

This project is provided as-is for educational and professional use.

## Disclaimer

This checklist is intended for standard single-family dwellings only. It does not apply to multi-unit or commercial buildings. For accurate load testing, photos of nameplates from all heating and major appliances should be provided. If you are uncertain about any part of this assessment, please contact a certified Safety Surveyor.
