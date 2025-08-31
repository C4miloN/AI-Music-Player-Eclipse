# Eclipse Music Player

![Eclipse Music Player](https://img.shields.io/badge/Version-1.0_Beta-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

A modern, customizable music player with a sleek dark interface and advanced features for music enthusiasts.

## ✨ Features

- **Multiple View Modes**: Grid, list, and table views for your music library
- **Customizable Interface**: Change colors, opacity, background images, and more
- **Metadata Editing**: Edit song information, ratings, and album art
- **Advanced Sorting & Filtering**: Sort by title, artist, genre, year, rating, and date added
- **Keyboard Shortcuts**: Full keyboard control for playback and navigation
- **Multi-language Support**: Available in English, Spanish, French, and German
- **Rating System**: 5-star rating system with golden vinyl effects for 5-star songs
- **Playback Modes**: Shuffle, repeat all, and repeat single song
- **Persistent Storage**: Your music library and settings are saved between sessions

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development due to CORS restrictions)

### Installation

1. Download or clone the project files
2. Set up a local web server:
   - **Python**: Run `python -m http.server 8000` in the project directory
   - **Node.js**: Install `http-server` with `npm install -g http-server` then run `http-server`
   - **VS Code**: Use the "Live Server" extension
3. Open your browser and navigate to `http://localhost:8000` (or the port your server uses)

### First Use

1. Click "Select Music Folder" to choose a folder containing your music files
2. Customize the appearance in the Settings modal if desired
3. Start playing your music!

## 🎮 Controls

### Mouse Controls
- Click on any song to play it
- Use the player controls at the bottom for playback
- Right-click on songs for additional options

### Keyboard Shortcuts
- **Space**: Play/Pause
- **Right Arrow**: Next track
- **Left Arrow**: Previous track
- **Ctrl + Right Arrow**: Skip forward 10 seconds
- **Ctrl + Left Arrow**: Skip backward 10 seconds
- **Up Arrow**: Increase volume
- **Down Arrow**: Decrease volume
- **M**: Mute/Unmute
- **S**: Toggle shuffle
- **R**: Toggle repeat mode

## ⚙️ Configuration

Eclipse offers extensive customization options:

### Appearance
- Change primary, secondary, and background colors
- Adjust opacity for UI elements, cards, and buttons
- Customize border radius
- Set custom background images

### Music Management
- Select multiple music folders
- Edit metadata for all songs
- Rate songs with a 5-star system
- Sort by various criteria

### Language Support
Switch between multiple languages in the settings:
- English (en)
- Spanish (es)
- French (fr)
- German (de)

## 📁 File Structure

```
eclipse-music-player/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # Main JavaScript functionality
├── config.json         # Application configuration
├── metadata.json       # Song metadata (auto-generated)
└── languages/          # Language files
    ├── en.json         # English translations
    ├── es.json         # Spanish translations
    ├── fr.json         # French translations
    └── de.json         # German translations
```

## 🔧 Technical Details

### Supported Audio Formats
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)
- FLAC (.flac)

### Data Persistence
- Configuration saved to `config.json` and localStorage
- Metadata saved to `metadata.json` and localStorage
- Music folder paths are remembered between sessions

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🐛 Known Issues

- CORS restrictions require a local server for development
- Large music libraries may experience slight loading delays
- Some metadata editing features may not work with all file types

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 💖 Donation

If you find Eclipse Music Player useful and would like to support its development, consider making a donation:

**PayPal**: [donate](https://www.paypal.me/C4miloN)

Your support helps ensure continued development and improvement of Eclipse Music Player!

## 👨‍💻 Development Team

**C4miloN** - Lead Developer  
**Deepseek** - AI Assistant

---

**v.1.0 Beta By C4miloN + Deepseek**


Thank you for using Eclipse Music Player! We hope you enjoy your music experience.

