# 🌍 PELAKOOR

**Advanced Coordinate Toolkit - Your Ultimate Geographic Companion**

[![npm version](https://badge.fury.io/js/pelakoor.svg)](https://badge.fury.io/js/pelakoor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)](https://nodejs.org/)

## 📖 Description

Pelakoor is an advanced geographic coordinate toolkit that provides various geocoding services, distance calculations, coordinate format conversions, and other geographic utilities through an interactive and user-friendly command-line interface.

### ✨ Key Features

- 🏠 **Geocoding & Reverse Geocoding** - Convert addresses to coordinates and vice versa
- 📏 **Distance & Bearing Calculations** - Calculate distance and direction between points
- 📐 **Polygon Area Calculator** - Calculate area from multiple coordinate points
- 🎯 **Center Point Finder** - Find center point from coordinate collections
- 🌍 **Timezone Information** - Get timezone data based on location
- 🌅 **Sunrise & Sunset Times** - Calculate sunrise and sunset times
- 🏔️ **Elevation Data** - Get elevation information for locations
- 🔄 **Coordinate Format Converter** - Convert between various formats (DMS, UTM, etc.)
- 📱 **QR Code Generator** - Generate QR codes for locations
- 🎲 **Coordinate Quiz** - Educational geography game
- 📊 **Operation History** - Save and manage usage history
- 🔍 **Batch Geocoding** - Process multiple addresses simultaneously

### 🌐 Supported Providers

- **OpenStreetMap (Nominatim)** - Free, no API key required
- **Google Maps API** - High accuracy, requires API key
- **Mapbox API** - Fast performance, requires API key  
- **HERE API** - Reliable enterprise grade, requires API key

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g pelakoor
```

### Local Installation

```bash
npm install pelakoor
```

## 📋 System Requirements

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **OS**: Windows, macOS, Linux

## 🛠️ Usage

### Quick Start

After global installation, run:

```bash
pelakoor
```

Or if using local installation:

```bash
npx pelakoor
```

### Setup API Keys (Optional)

For enhanced features, configure API keys:

```bash
pelakoor setup
```

### Usage Examples

#### 1. Address Geocoding

```
🏠 Address to Coordinate
Enter the address: Jakarta, Indonesia
✅ Result: -6.2088, 106.8456
```

#### 2. Reverse Geocoding

```
📍 Coordinate to Address  
Enter latitude: -6.2088
Enter longitude: 106.8456
✅ Address: Jakarta, Special Capital Region of Jakarta, Indonesia
```

#### 3. Distance Calculation

```
📏 Calculate Distance Between Points
Point 1: -6.2088, 106.8456 (Jakarta)
Point 2: -7.2575, 112.7521 (Surabaya)
✅ Distance: 664.15 km
```

## 🔧 API Configuration

### Environment Variables

Create a `.env` file in your working directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
MAPBOX_API_KEY=your_mapbox_api_key_here
HERE_API_KEY=your_here_api_key_here
TIMEZONEDB_API_KEY=your_timezonedb_api_key_here
```

### Getting API Keys

- **Google Maps**: [Google Cloud Console](https://console.cloud.google.com/)
- **Mapbox**: [Mapbox Account](https://account.mapbox.com/)
- **HERE**: [HERE Developer Portal](https://developer.here.com/)
- **TimeZoneDB**: [TimeZoneDB](https://timezonedb.com/api)

## 📚 Documentation

- [📖 English Documentation](./docs/eng.md)
- [🔧 API Reference](./docs/api.md) - *coming soon*
- [💡 Examples](./docs/examples.md) - *coming soon*
- [❓ FAQ](./docs/faq.md) - *coming soon*

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

### Development Setup

```bash
# Clone repository
git clone https://github.com/Cloud-Dark/pelakoor.git
cd pelakoor

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

## 🐛 Bug Reports & Feature Requests

Report bugs or request new features at [GitHub Issues](https://github.com/Cloud-Dark/pelakoor/issues).

## 📞 Support

- 📧 Email: support@pelakoor.com
- 💬 Discord: [Pelakoor Community](https://discord.gg/pelakoor)
- 📱 Telegram: [@pelakoor_support](https://t.me/pelakoor_support)

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for free geographic data
- [Node Geocoder](https://github.com/nchaulet/node-geocoder) for geocoding library
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for CLI interface
- [Chalk](https://github.com/chalk/chalk) for colored output

## 🔄 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Cloud-Dark/pelakoor&type=Date)](https://star-history.com/#Cloud-Dark/pelakoor&Date)

---

<div align="center">
  <p>Made with ❤️ by Pelakoor Team</p>
  <p>
    <a href="https://github.com/Cloud-Dark/pelakoor">GitHub</a> •
    <a href="https://www.npmjs.com/package/pelakoor">npm</a> •
    <a href="https://pelakoor.com">Website</a>
  </p>
</div>
\