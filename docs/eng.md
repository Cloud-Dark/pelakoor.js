
# 🌍 PELAKOOR - English Documentation

**Advanced Coordinate Toolkit - Your Ultimate Geographic Companion**

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Features](#features)
- [API Providers](#api-providers)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [CLI Commands](#cli-commands)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Introduction

Pelakoor is a comprehensive geographic coordinate toolkit that provides various geocoding services, distance calculations, coordinate format conversions, and other geographic utilities through an interactive and user-friendly command-line interface.

### Key Features

- **🏠 Geocoding & Reverse Geocoding** - Convert addresses to coordinates and vice versa
- **📏 Distance & Bearing Calculations** - Calculate distance and direction between points
- **📐 Polygon Area Calculator** - Calculate area from multiple coordinate points
- **🎯 Center Point Finder** - Find center point from coordinate collections
- **🌍 Timezone Information** - Get timezone data based on location
- **🌅 Sunrise & Sunset Times** - Calculate sunrise and sunset times
- **🏔️ Elevation Data** - Get elevation information for locations
- **🔄 Coordinate Format Converter** - Convert between various formats (DMS, UTM, etc.)
- **📱 QR Code Generator** - Generate QR codes for locations
- **🎲 Coordinate Quiz** - Educational geography game
- **📊 Operation History** - Save and manage usage history
- **🔍 Batch Geocoding** - Process multiple addresses simultaneously

## Installation

### Global Installation (Recommended)

```bash
npm install -g pelakoor
```

### Local Installation

```bash
npm install pelakoor
```

### System Requirements

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **Operating System**: Windows, macOS, Linux

## Getting Started

### Quick Start

After global installation, run:

```bash
pelakoor
```

For local installation:

```bash
npx pelakoor
```

### First Run Setup

On first run, Pelakoor will use OpenStreetMap (free, no API key required). For enhanced features, you can configure additional API providers:

```bash
pelakoor setup
```

## Features

### 1. Geocoding Services

#### Address to Coordinate
Convert physical addresses to geographic coordinates.

**Features:**
- Multiple provider support
- Batch processing capability
- Detailed address breakdown
- Map links generation

#### Coordinate to Address
Convert geographic coordinates to physical addresses.

**Features:**
- Reverse geocoding
- Detailed location information
- Administrative level details

#### Batch Geocoding
Process multiple addresses simultaneously with progress tracking.

### 2. Distance & Calculations

#### Distance Calculator
Calculate distance between two or more points using various methods:
- Great circle distance (Haversine formula)
- Vincenty's formula for high precision
- Multiple unit support (km, miles, nautical miles)

#### Bearing & Compass Direction
Get bearing and compass direction between points:
- True bearing in degrees
- Compass direction (N, NE, E, SE, etc.)
- Initial and final bearings for long distances

#### Polygon Area Calculator
Calculate area of polygons defined by coordinate points:
- Support for complex polygons
- Multiple units (square meters, hectares, acres, square kilometers)
- Perimeter calculation

#### Center Point Finder
Find center point of multiple coordinates:
- Geometric center calculation
- Centroid calculation
- Distance analysis from center to all points

### 3. Location Services

#### Nearby Places Finder
Find points of interest near specific coordinates:
- Customizable search radius
- Category filtering
- Distance sorting

#### Timezone Information
Get comprehensive timezone data:
- Current local time
- UTC offset
- DST status
- Timezone name

#### Sunrise & Sunset Times
Calculate solar events:
- Sunrise and sunset times
- Civil, nautical, and astronomical twilight
- Solar noon
- Day length calculation

#### Elevation Data
Get elevation information:
- Meters and feet
- Sea level reference
- Elevation context (high altitude, below sea level, etc.)

### 4. Utilities & Tools

#### Coordinate Format Converter
Convert between various coordinate formats:
- Decimal Degrees (DD)
- Degrees Minutes (DM)
- Degrees Minutes Seconds (DMS)
- UTM coordinates
- Plus Codes (Open Location Code)
- Geohash
- MGRS (Military Grid Reference System)

#### Random Coordinate Generator
Generate random coordinates:
- Global random coordinates
- Country-specific coordinates
- Land-only coordinates option

#### QR Code Generator
Generate QR codes for locations:
- Geo URI format
- Map service links
- Terminal display
- Address inclusion option

#### Coordinate Geography Quiz
Educational geography game:
- Multiple quiz types (capitals, landmarks, countries, islands)
- Scoring system
- Map links for reference
- Performance tracking

### 5. System & Settings

#### Operation History
Track and manage usage history:
- Automatic operation logging
- History viewing with filtering
- Export functionality
- History clearing

#### API Configuration
Manage API providers:
- Key setup and validation
- Provider activation/deactivation
- Default provider selection
- Connection testing

#### Application Settings
Customize application behavior:
- History saving preferences
- Progress bar display
- Color output settings
- Default configurations

## API Providers

### OpenStreetMap (Nominatim)
- **Cost**: Free
- **API Key**: Not required
- **Rate Limit**: 1 request per second
- **Features**: Basic geocoding, reverse geocoding
- **Best for**: Development, basic usage

### Google Maps API
- **Cost**: Pay-per-use with free tier
- **API Key**: Required
- **Rate Limit**: High (depends on plan)
- **Features**: High accuracy, detailed results, global coverage
- **Best for**: Production applications, high accuracy requirements

### Mapbox API
- **Cost**: Generous free tier, pay-per-use
- **API Key**: Required
- **Rate Limit**: High
- **Features**: Fast performance, good global coverage
- **Best for**: High-volume applications, performance-critical usage

### HERE API
- **Cost**: Free tier available, enterprise plans
- **API Key**: Required
- **Rate Limit**: High
- **Features**: Enterprise-grade reliability, excellent global coverage
- **Best for**: Enterprise applications, reliable service requirements

## Configuration

### Environment Variables

Create a `.env` file in your working directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
MAPBOX_API_KEY=your_mapbox_api_key_here
HERE_API_KEY=your_here_api_key_here
TIMEZONEDB_API_KEY=your_timezonedb_api_key_here
```

### Configuration File

Pelakoor automatically creates a `config.json` file to store settings:

```json
{
  "defaultProvider": "osm",
  "providers": {
    "osm": {
      "name": "OpenStreetMap (Nominatim)",
      "requiresKey": false,
      "active": true
    },
    "google": {
      "name": "Google Maps API",
      "requiresKey": true,
      "active": false
    }
  },
  "features": {
    "autoSave": true,
    "showProgress": true,
    "colorOutput": true,
    "saveHistory": true
  }
}
```

### Getting API Keys

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Geocoding API
4. Create credentials (API Key)
5. Restrict key to Geocoding API

#### Mapbox API
1. Sign up at [Mapbox](https://account.mapbox.com/)
2. Navigate to Access Tokens
3. Create new token with appropriate scopes
4. Copy the access token

#### HERE API
1. Register at [HERE Developer Portal](https://developer.here.com/)
2. Create a new project
3. Generate API key
4. Copy the API key

#### TimeZoneDB API
1. Register at [TimeZoneDB](https://timezonedb.com/api)
2. Get your free API key
3. Copy the API key

## Usage Examples

### Basic Geocoding

```bash
pelakoor
# Select: Address to Coordinate
# Enter: "1600 Pennsylvania Avenue NW, Washington, DC"
# Result: 38.8977, -77.0365
```

### Batch Processing

```bash
pelakoor
# Select: Batch Geocoding
# Enter multiple addresses:
# - "Times Square, New York"
# - "Golden Gate Bridge, San Francisco"
# - "Space Needle, Seattle"
# Results: Processing with progress bar
```

### Distance Calculation

```bash
pelakoor
# Select: Calculate Distance Between Points
# Point 1: 40.7128, -74.0060 (New York)
# Point 2: 34.0522, -118.2437 (Los Angeles)
# Result: 3944.42 km
```

### Area Calculation

```bash
pelakoor
# Select: Area Calculator (Polygon)
# Enter polygon vertices:
# Point 1: 40.7829, -73.9654
# Point 2: 40.7829, -73.9481
# Point 3: 40.7489, -73.9481
# Point 4: 40.7489, -73.9654
# Result: Area in various units
```

## CLI Commands

### Interactive Mode (Default)

```bash
pelakoor
```

### Setup Mode

```bash
pelakoor setup
```

### Help

```bash
pelakoor --help
```

### Version

```bash
pelakoor --version
```

## Troubleshooting

### Common Issues

#### 1. API Key Not Working

**Problem**: Error messages about invalid API keys

**Solution**:
- Verify API key is correct
- Check if API is enabled in provider console
- Ensure proper permissions/restrictions
- Test connection using built-in test feature

#### 2. Rate Limit Exceeded

**Problem**: Too many requests error

**Solution**:
- Use different API provider
- Wait before making more requests
- Upgrade to higher rate limit plan
- Use OpenStreetMap for basic needs

#### 3. Installation Issues

**Problem**: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Install with verbose logging
npm install -g pelakoor --verbose

# Try with different registry
npm install -g pelakoor --registry https://registry.npmjs.org/
```

#### 4. Permission Errors

**Problem**: Permission denied on installation

**Solution**:
```bash
# Use sudo (Linux/Mac)
sudo npm install -g pelakoor

# Or use npx without global install
npx pelakoor
```

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=pelakoor* pelakoor
```

### Log Files

Check log files in:
- **Windows**: `%APPDATA%/pelakoor/logs/`
- **macOS**: `~/Library/Logs/pelakoor/`
- **Linux**: `~/.local/share/pelakoor/logs/`

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

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

# Build for production
npm run build
```

### Coding Standards

- Use ES6+ features
- Follow ESLint configuration
- Write comprehensive tests
- Document all functions
- Use meaningful commit messages

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

---

**Need Help?**

- 📧 Email: apipedia22@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Cloud-Dark/pelakoor/issues)
