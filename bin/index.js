#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import * as geolib from 'geolib';
import Table from 'cli-table3';
import cliProgress from 'cli-progress';
import qrcode from 'qrcode-terminal';
import moment from 'moment';
import axios from 'axios';
import fs from 'fs-extra';

import ApiManager from '../config/apiManager.js';
import GeocodingService from '../services/geocodingService.js';
import HistoryManager from '../utils/historyManager.js';


class PelakoorAdvanced {
  constructor() {
    this.initialize();
  }

  async initialize() {
    this.apiManager = new ApiManager();
    this.geocodingService = new GeocodingService(this.apiManager);
    this.historyManager = new HistoryManager();
    await this.apiManager.loadConfig();
    
    this.showBanner();
    await this.checkFirstRun();
    this.mainMenu();
  }

  showBanner() {
    console.clear();
    console.log(
      chalk.cyan(
        figlet.textSync('PELAKOOR', {
          font: 'Big',
          horizontalLayout: 'default',
          verticalLayout: 'default'
        })
      )
    );
    console.log(chalk.yellow('🌍 Advanced Coordinate Toolkit v2.0'));
    console.log(chalk.gray('Your Ultimate Geographic Companion\n'));
    console.log(chalk.gray('━'.repeat(60)));
  }

  async checkFirstRun() {
    const activeProviders = this.apiManager.getActiveProviders();
    
    if (activeProviders.length === 1 && activeProviders[0] === 'osm') {
      console.log(chalk.yellow('\n⚠️  First time setup detected!'));
      console.log(chalk.white('You\'re currently using OpenStreetMap (free, no API key required)'));
      console.log(chalk.white('For enhanced features, you can configure additional providers.\n'));
      
      const { setupNow } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'setupNow',
          message: 'Would you like to configure additional API providers now?',
          default: false
        }
      ]);

      if (setupNow) {
        await this.apiManager.setupApiKeys();
        console.log(chalk.green('\n✅ Setup complete! Restarting application...\n'));
        await this.sleep(2000);
        this.showBanner();
      }
    }
  }

  async mainMenu() {
    const choices = [
      new inquirer.Separator(chalk.cyan('📍 GEOCODING SERVICES')),
      {
        name: '🏠 Address to Coordinate',
        value: 'addressToCoord'
      },
      {
        name: '📍 Coordinate to Address',
        value: 'coordToAddress'
      },
      {
        name: '🔍 Batch Geocoding',
        value: 'batchGeocode'
      },
      
      new inquirer.Separator(chalk.cyan('📏 DISTANCE & CALCULATIONS')),
      {
        name: '📏 Calculate Distance Between Points',
        value: 'calculateDistance'
      },
      {
        name: '🧭 Get Bearing & Compass Direction',
        value: 'getBearing'
      },
      {
        name: '📐 Area Calculator (Polygon)',
        value: 'calculateArea'
      },
      {
        name: '🎯 Find Center Point',
        value: 'findCenter'
      },
      
      new inquirer.Separator(chalk.cyan('🗺️ LOCATION SERVICES')),
      {
        name: '🎯 Find Nearby Places',
        value: 'findNearby'
      },
      {
        name: '🌍 Get Timezone Information',
        value: 'getTimezone'
      },
      {
        name: '🌅 Sunrise & Sunset Times',
        value: 'getSunTimes'
      },
      {
        name: '🏔️ Get Elevation Data',
        value: 'getElevation'
      },
      
      new inquirer.Separator(chalk.cyan('🛠️ UTILITIES & TOOLS')),
      {
        name: '📐 Generate Random Coordinate',
        value: 'randomCoord'
      },
      {
        name: '🔄 Coordinate Format Converter',
        value: 'convertFormats'
      },
      {
        name: '🎲 Coordinate Game & Quiz',
        value: 'coordinateQuiz'
      },
      {
        name: '📱 Generate QR Code for Location',
        value: 'generateQR'
      },
      
      new inquirer.Separator(chalk.cyan('⚙️ SYSTEM & SETTINGS')),
      {
        name: '📊 View History',
        value: 'viewHistory'
      },
      {
        name: '🔧 API Configuration',
        value: 'apiConfig'
      },
      {
        name: '⚙️ Application Settings',
        value: 'settings'
      },
      {
        name: '❌ Exit',
        value: 'exit'
      }
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.cyan('What would you like to do?'),
        choices: choices,
        pageSize: 15
      }
    ]);

    await this.handleAction(action);
  }

  async handleAction(action) {
    console.log('\n' + chalk.gray('━'.repeat(60)));
    
    switch (action) {
      case 'addressToCoord':
        await this.addressToCoordinate();
        break;
      case 'coordToAddress':
        await this.coordinateToAddress();
        break;
      case 'batchGeocode':
        await this.batchGeocode();
        break;
      case 'calculateDistance':
        await this.calculateDistance();
        break;
      case 'getBearing':
        await this.getBearing();
        break;
      case 'calculateArea':
        await this.calculateArea();
        break;
      case 'findCenter':
        await this.findCenterPoint();
        break;
      case 'findNearby':
        await this.findNearbyPlaces();
        break;
      case 'getTimezone':
        await this.getTimezone();
        break;
      case 'getSunTimes':
        await this.getSunTimes();
        break;
      case 'getElevation':
        await this.getElevation();
        break;
      case 'randomCoord':
        await this.generateRandomCoordinate();
        break;
      case 'convertFormats':
        await this.convertCoordinateFormats();
        break;
      case 'coordinateQuiz':
        await this.coordinateQuiz();
        break;
      case 'generateQR':
        await this.generateQRCode();
        break;
      case 'viewHistory':
        await this.viewHistory();
        break;
      case 'apiConfig':
        await this.apiConfiguration();
        break;
      case 'settings':
        await this.applicationSettings();
        break;
      case 'exit':
        this.exitApp();
        return;
    }

    await this.askContinue();
  }

  async addressToCoordinate() {
    console.log(chalk.blue('\n🏠 Address to Coordinate Converter'));
    
    const provider = await this.apiManager.selectProvider();
    
    const { address, showMultiple } = await inquirer.prompt([
      {
        type: 'input',
        name: 'address',
        message: 'Enter the address:',
        validate: input => input.length > 0 || 'Please enter a valid address'
      },
      {
        type: 'confirm',
        name: 'showMultiple',
        message: 'Show multiple results if available?',
        default: false
      }
    ]);

    try {
      const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
      progressBar.start(100, 0);
      
      for (let i = 0; i <= 100; i += 20) {
        progressBar.update(i);
        await this.sleep(200);
      }
      
      const results = await this.geocodingService.geocodeAddress(address, provider);
      progressBar.stop();

      if (results.length > 0) {
        const resultsToShow = showMultiple ? results : [results[0]];
        
        resultsToShow.forEach((result, index) => {
          const table = new Table({
            title: `Result ${index + 1} (${result.provider})`,
            head: [chalk.cyan('Property'), chalk.cyan('Value')],
            colWidths: [25, 50]
          });

          table.push(
            ['📍 Address', result.address],
            ['🌐 Latitude', result.lat.toFixed(6)],
            ['🌐 Longitude', result.lon.toFixed(6)],
            ['📋 Coordinates', `${result.lat.toFixed(6)}, ${result.lon.toFixed(6)}`],
            ['🗺️ Google Maps', `https://maps.google.com/?q=${result.lat},${result.lon}`],
            ['📱 Apple Maps', `https://maps.apple.com/?q=${result.lat},${result.lon}`]
          );

          if (result.details) {
            Object.entries(result.details).forEach(([key, value]) => {
              if (value) {
                table.push([`📄 ${key}`, value]);
              }
            });
          }

          console.log('\n' + table.toString());
        });

        // Save to history
        await this.historyManager.addEntry('geocode', address, results[0], provider);
        
      } else {
        console.log(chalk.red('\n❌ Address not found. Please try a different address.'));
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Error: ${error.message}`));
    }
  }

  async batchGeocode() {
    console.log(chalk.blue('\n🔍 Batch Geocoding'));
    console.log(chalk.yellow('Enter multiple addresses (one per line, empty line to finish):\n'));
    
    const addresses = [];
    let address = '';
    
    do {
      const { inputAddress } = await inquirer.prompt([
        {
          type: 'input',
          name: 'inputAddress',
          message: `Address ${addresses.length + 1} (or press Enter to finish):`
        }
      ]);
      
      address = inputAddress.trim();
      if (address) {
        addresses.push(address);
      }
    } while (address);

    if (addresses.length === 0) {
      console.log(chalk.red('\n❌ No addresses provided.'));
      return;
    }

    const provider = await this.apiManager.selectProvider();
    
    console.log(chalk.yellow(`\n🔄 Processing ${addresses.length} addresses...`));
    
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(addresses.length, 0);
    
    const results = [];
    
    for (let i = 0; i < addresses.length; i++) {
      try {
        const result = await this.geocodingService.geocodeAddress(addresses[i], provider);
        results.push({
          address: addresses[i],
          success: true,
          data: result[0] || null
        });
      } catch (error) {
        results.push({
          address: addresses[i],
          success: false,
          error: error.message
        });
      }
      
      progressBar.update(i + 1);
      await this.sleep(500); // Rate limiting
    }
    
    progressBar.stop();

    // Display results
    const table = new Table({
      head: [chalk.cyan('Address'), chalk.cyan('Status'), chalk.cyan('Coordinates')],
      colWidths: [40, 15, 25]
    });

    results.forEach(result => {
      if (result.success && result.data) {
        table.push([
          result.address.substring(0, 38),
          chalk.green('✅ Success'),
          `${result.data.lat.toFixed(4)}, ${result.data.lon.toFixed(4)}`
        ]);
      } else {
        table.push([
          result.address.substring(0, 38),
          chalk.red('❌ Failed'),
          result.error || 'Not found'
        ]);
      }
    });

    console.log('\n' + chalk.green('📊 Batch Geocoding Results:'));
    console.log(table.toString());

    const successCount = results.filter(r => r.success).length;
    console.log(chalk.blue(`\n📈 Summary: ${successCount}/${results.length} addresses processed successfully`));
  }

  async calculateArea() {
    console.log(chalk.blue('\n📐 Polygon Area Calculator'));
    console.log(chalk.yellow('Enter polygon vertices (minimum 3 points):\n'));
    
    const coordinates = [];
    
    do {
      const { lat, lon, addMore } = await inquirer.prompt([
        {
          type: 'input',
          name: 'lat',
          message: `Point ${coordinates.length + 1} - Latitude:`,
          validate: input => {
            const num = parseFloat(input);
            return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
          }
        },
        {
          type: 'input',
          name: 'lon',
          message: `Point ${coordinates.length + 1} - Longitude:`,
          validate: input => {
            const num = parseFloat(input);
            return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
          }
        },
        {
          type: 'confirm',
          name: 'addMore',
          message: 'Add another point?',
          default: coordinates.length < 2,
          when: () => coordinates.length >= 2
        }
      ]);

      coordinates.push({ lat: parseFloat(lat), lng: parseFloat(lon) });
      
      if (coordinates.length >= 3 && !addMore) break;
      
    } while (coordinates.length < 3 || (coordinates.length >= 3 && coordinates.length < 100));

    if (coordinates.length < 3) {
      console.log(chalk.red('\n❌ Need at least 3 points to calculate area.'));
      return;
    }

    const areaSquareMeters = geolib.getAreaOfPolygon(coordinates);
    const areaHectares = areaSquareMeters / 10000;
    const areaKmSquared = areaSquareMeters / 1000000;
    const areaAcres = areaSquareMeters * 0.000247105;

    const table = new Table({
      head: [chalk.cyan('Unit'), chalk.cyan('Area')],
      colWidths: [20, 30]
    });

    table.push(
      ['📏 Square Meters', `${areaSquareMeters.toLocaleString()} m²`],
      ['📏 Hectares', `${areaHectares.toFixed(2)} ha`],
['📏 Square Kilometers', `${areaKmSquared.toFixed(4)} km²`],
     ['📏 Acres', `${areaAcres.toFixed(2)} acres`]
   );

   console.log('\n' + chalk.green('✅ Polygon Area Calculation:'));
   console.log(table.toString());

   // Show polygon details
   console.log(chalk.blue('\n📍 Polygon Vertices:'));
   coordinates.forEach((coord, index) => {
     console.log(chalk.white(`  ${index + 1}. ${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}`));
   });

   const perimeter = this.calculatePolygonPerimeter(coordinates);
   console.log(chalk.blue(`\n📐 Perimeter: ${(perimeter / 1000).toFixed(2)} km`));
 }

 calculatePolygonPerimeter(coordinates) {
   let perimeter = 0;
   for (let i = 0; i < coordinates.length; i++) {
     const nextIndex = (i + 1) % coordinates.length;
     perimeter += geolib.getDistance(coordinates[i], coordinates[nextIndex]);
   }
   return perimeter;
 }

 async findCenterPoint() {
   console.log(chalk.blue('\n🎯 Find Center Point'));
   console.log(chalk.yellow('Enter multiple coordinates to find their center:\n'));
   
   const coordinates = [];
   
   do {
     const { lat, lon, addMore } = await inquirer.prompt([
       {
         type: 'input',
         name: 'lat',
         message: `Point ${coordinates.length + 1} - Latitude:`,
         validate: input => {
           const num = parseFloat(input);
           return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
         }
       },
       {
         type: 'input',
         name: 'lon',
         message: `Point ${coordinates.length + 1} - Longitude:`,
         validate: input => {
           const num = parseFloat(input);
           return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
         }
       },
       {
         type: 'confirm',
         name: 'addMore',
         message: 'Add another point?',
         default: coordinates.length < 1,
         when: () => coordinates.length >= 1
       }
     ]);

     coordinates.push({ lat: parseFloat(lat), lng: parseFloat(lon) });
     
     if (coordinates.length >= 2 && !addMore) break;
     
   } while (coordinates.length < 50);

   if (coordinates.length < 2) {
     console.log(chalk.red('\n❌ Need at least 2 points to find center.'));
     return;
   }

   const center = geolib.getCenter(coordinates);
   const centroid = geolib.getCenterOfBounds(coordinates);

   const table = new Table({
     head: [chalk.cyan('Method'), chalk.cyan('Latitude'), chalk.cyan('Longitude')],
     colWidths: [20, 15, 15]
   });

   table.push(
     ['🎯 Geometric Center', center.latitude.toFixed(6), center.longitude.toFixed(6)],
     ['📐 Centroid', centroid.latitude.toFixed(6), centroid.longitude.toFixed(6)]
   );

   console.log('\n' + chalk.green('✅ Center Point Results:'));
   console.log(table.toString());

   // Calculate distances from center to all points
   console.log(chalk.blue('\n📏 Distances from Geometric Center:'));
   coordinates.forEach((coord, index) => {
     const distance = geolib.getDistance(center, coord);
     console.log(chalk.white(`  Point ${index + 1}: ${(distance / 1000).toFixed(2)} km`));
   });
 }

 async getTimezone() {
   console.log(chalk.blue('\n🌍 Timezone Information'));
   
   const { lat, lon } = await inquirer.prompt([
     {
       type: 'input',
       name: 'lat',
       message: 'Enter latitude:',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
       }
     },
     {
       type: 'input',
       name: 'lon',
       message: 'Enter longitude:',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
       }
     }
   ]);

   try {
     console.log(chalk.yellow('\n🔍 Getting timezone information...'));
     
     // Using TimeZoneDB API (free tier available)
     const response = await axios.get('http://api.timezonedb.com/v2.1/get-time-zone', {
       params: {
         key: process.env.TIMEZONEDB_API_KEY || 'demo', // Free demo key
         format: 'json',
         by: 'position',
         lat: parseFloat(lat),
         lng: parseFloat(lon)
       }
     });

     if (response.data.status === 'OK') {
       const tz = response.data;
       
       const table = new Table({
         head: [chalk.cyan('Property'), chalk.cyan('Value')],
         colWidths: [25, 35]
       });

       const localTime = moment.unix(tz.timestamp).format('YYYY-MM-DD HH:mm:ss');
       const utcOffset = `UTC${tz.gmtOffset >= 0 ? '+' : ''}${tz.gmtOffset / 3600}`;

       table.push(
         ['🌍 Timezone', tz.zoneName],
         ['🏙️ Country Code', tz.countryCode],
         ['⏰ Local Time', localTime],
         ['🌐 UTC Offset', utcOffset],
         ['☀️ DST Active', tz.dst ? 'Yes' : 'No'],
         ['📍 Coordinates', `${lat}, ${lon}`]
       );

       console.log('\n' + chalk.green('✅ Timezone Information:'));
       console.log(table.toString());
       
     } else {
       console.log(chalk.red('\n❌ Could not retrieve timezone information.'));
     }
   } catch (error) {
     console.log(chalk.red('\n❌ Error getting timezone information. Using fallback method...'));
     
     // Simple timezone estimation based on longitude
     const estimatedOffset = Math.round(parseFloat(lon) / 15);
     const utcOffset = `UTC${estimatedOffset >= 0 ? '+' : ''}${estimatedOffset}`;
     
     console.log(chalk.yellow(`🔍 Estimated timezone: ${utcOffset} (based on longitude)`));
     console.log(chalk.gray('Note: This is an approximation. For accurate timezone data, configure TimeZoneDB API key.'));
   }
 }

 async getSunTimes() {
   console.log(chalk.blue('\n🌅 Sunrise & Sunset Times'));
   
   const { lat, lon, date } = await inquirer.prompt([
     {
       type: 'input',
       name: 'lat',
       message: 'Enter latitude:',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
       }
     },
     {
       type: 'input',
       name: 'lon',
       message: 'Enter longitude:',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
       }
     },
     {
       type: 'input',
       name: 'date',
       message: 'Enter date (YYYY-MM-DD) or press Enter for today:',
       default: moment().format('YYYY-MM-DD'),
       validate: input => {
         return moment(input, 'YYYY-MM-DD', true).isValid() || 'Please enter a valid date (YYYY-MM-DD)';
       }
     }
   ]);

   try {
     console.log(chalk.yellow('\n🔍 Calculating sun times...'));
     
     // Using sunrise-sunset API
     const response = await axios.get('https://api.sunrise-sunset.org/json', {
       params: {
         lat: parseFloat(lat),
         lng: parseFloat(lon),
         date: date,
         formatted: 0
       }
     });

     if (response.data.status === 'OK') {
       const sun = response.data.results;
       
       const table = new Table({
         head: [chalk.cyan('Event'), chalk.cyan('UTC Time'), chalk.cyan('Local Time*')],
         colWidths: [20, 20, 20]
       });

       const events = [
         ['🌅 Sunrise', sun.sunrise],
         ['🌄 Sunset', sun.sunset],
         ['🌇 Civil Twilight Begin', sun.civil_twilight_begin],
         ['🌆 Civil Twilight End', sun.civil_twilight_end],
         ['🌌 Nautical Twilight Begin', sun.nautical_twilight_begin],
         ['🌃 Nautical Twilight End', sun.nautical_twilight_end],
         ['⭐ Astronomical Twilight Begin', sun.astronomical_twilight_begin],
         ['🌠 Astronomical Twilight End', sun.astronomical_twilight_end],
         ['☀️ Solar Noon', sun.solar_noon]
       ];

       events.forEach(([event, utcTime]) => {
         const utcMoment = moment(utcTime);
         const localTime = utcMoment.format('HH:mm:ss');
         table.push([event, utcMoment.format('HH:mm:ss'), localTime]);
       });

       console.log('\n' + chalk.green('✅ Sun Times Information:'));
       console.log(table.toString());
       
       const dayLength = moment(sun.sunset).diff(moment(sun.sunrise), 'minutes');
       console.log(chalk.blue(`\n☀️ Day Length: ${Math.floor(dayLength / 60)}h ${dayLength % 60}m`));
       console.log(chalk.gray('* Local times are approximate. For exact local times, configure timezone information.'));
       
     } else {
       console.log(chalk.red('\n❌ Could not retrieve sun times information.'));
     }
   } catch (error) {
     console.log(chalk.red('\n❌ Error getting sun times information.'));
   }
 }

 async getElevation() {
   console.log(chalk.blue('\n🏔️ Elevation Data'));
   
   const { lat, lon } = await inquirer.prompt([
     {
       type: 'input',
       name: 'lat',
       message: 'Enter latitude:',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
       }
     },
     {
       type: 'input',
       name: 'lon',
       message: 'Enter longitude:',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
       }
     }
   ]);

   try {
     console.log(chalk.yellow('\n🔍 Getting elevation data...'));
     
     // Using Open Elevation API
     const response = await axios.post('https://api.open-elevation.com/api/v1/lookup', {
       locations: [
         {
           latitude: parseFloat(lat),
           longitude: parseFloat(lon)
         }
       ]
     });

     if (response.data.results && response.data.results.length > 0) {
       const elevation = response.data.results[0].elevation;
       
       const table = new Table({
         head: [chalk.cyan('Property'), chalk.cyan('Value')],
         colWidths: [20, 25]
       });

       table.push(
         ['📍 Coordinates', `${lat}, ${lon}`],
         ['🏔️ Elevation', `${elevation} meters`],
         ['🏔️ Elevation', `${(elevation * 3.28084).toFixed(2)} feet`],
         ['🌊 Above Sea Level', elevation > 0 ? 'Yes' : 'No']
       );

       console.log('\n' + chalk.green('✅ Elevation Information:'));
       console.log(table.toString());

       // Additional elevation context
       if (elevation < 0) {
         console.log(chalk.blue('\n🌊 This location is below sea level!'));
       } else if (elevation > 3000) {
         console.log(chalk.blue('\n🏔️ This is a high altitude location!'));
       } else if (elevation > 1000) {
         console.log(chalk.blue('\n⛰️ This location has moderate elevation.'));
       } else {
         console.log(chalk.blue('\n🏞️ This location is at low elevation.'));
       }
       
     } else {
       console.log(chalk.red('\n❌ Could not retrieve elevation data.'));
     }
   } catch (error) {
     console.log(chalk.red('\n❌ Error getting elevation data.'));
   }
 }

 async convertCoordinateFormats() {
   console.log(chalk.blue('\n🔄 Coordinate Format Converter'));
   
   const { lat, lon } = await inquirer.prompt([
     {
       type: 'input',
       name: 'lat',
       message: 'Enter latitude (decimal degrees):',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
       }
     },
     {
       type: 'input',
       name: 'lon',
       message: 'Enter longitude (decimal degrees):',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
       }
     }
   ]);

   const latitude = parseFloat(lat);
   const longitude = parseFloat(lon);

   // Convert to DMS (Degrees, Minutes, Seconds)
   const latDMS = this.convertToDMS(latitude, 'lat');
   const lonDMS = this.convertToDMS(longitude, 'lon');

   // Convert to UTM (simplified)
   const utm = this.convertToUTM(latitude, longitude);

   const table = new Table({
     head: [chalk.cyan('Format'), chalk.cyan('Latitude'), chalk.cyan('Longitude')],
     colWidths: [25, 25, 25]
   });

   table.push(
     ['📐 Decimal Degrees', `${latitude.toFixed(6)}°`, `${longitude.toFixed(6)}°`],
     ['📐 Degrees Minutes', this.convertToDM(latitude, 'lat'), this.convertToDM(longitude, 'lon')],
     ['📐 Degrees Min Seconds', latDMS, lonDMS],
     ['📐 UTM Coordinates', utm.easting, utm.northing],
     ['📐 UTM Zone', utm.zone, utm.hemisphere],
     ['📐 Plus Codes', await this.convertToPlusCodes(latitude, longitude), ''],
     ['📐 Geohash', this.convertToGeohash(latitude, longitude), ''],
     ['📐 MGRS', 'Not implemented', 'Not implemented']
   );

   console.log('\n' + chalk.green('✅ Coordinate Format Conversions:'));
   console.log(table.toString());

   // Additional formats
   console.log(chalk.blue('\n📋 Additional Formats:'));
   console.log(chalk.white(`Google Maps: https://maps.google.com/?q=${latitude},${longitude}`));
   console.log(chalk.white(`OpenStreetMap: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`));
   console.log(chalk.white(`What3Words: Use API to get 3-word address`));
 }

 convertToDMS(decimal, type) {
   const absolute = Math.abs(decimal);
   const degrees = Math.floor(absolute);
   const minutesFloat = (absolute - degrees) * 60;
   const minutes = Math.floor(minutesFloat);
   const seconds = (minutesFloat - minutes) * 60;

   const direction = type === 'lat' 
     ? (decimal >= 0 ? 'N' : 'S')
     : (decimal >= 0 ? 'E' : 'W');

   return `${degrees}° ${minutes}' ${seconds.toFixed(2)}" ${direction}`;
 }

 convertToDM(decimal, type) {
   const absolute = Math.abs(decimal);
   const degrees = Math.floor(absolute);
   const minutes = (absolute - degrees) * 60;

   const direction = type === 'lat' 
     ? (decimal >= 0 ? 'N' : 'S')
     : (decimal >= 0 ? 'E' : 'W');

   return `${degrees}° ${minutes.toFixed(4)}' ${direction}`;
 }

 convertToUTM(lat, lon) {
   // Simplified UTM conversion (not perfectly accurate)
   const zone = Math.floor((lon + 180) / 6) + 1;
   const hemisphere = lat >= 0 ? 'N' : 'S';
   
   // This is a very simplified calculation
   const easting = ((lon + 180) % 6) * 111320;
   const northing = lat * 111320;

   return {
     zone: `${zone}${hemisphere}`,
     hemisphere: hemisphere,
     easting: `${Math.abs(easting).toFixed(0)}m E`,
     northing: `${Math.abs(northing).toFixed(0)}m N`
   };
 }

 async convertToPlusCodes(lat, lon) {
   try {
     // This would require the Open Location Code library
     // For now, return a placeholder
     return 'Requires Plus Codes library';
   } catch (error) {
     return 'Not available';
   }
 }

 convertToGeohash(lat, lon) {
   // Simple geohash implementation (basic version)
   return 'Geohash calculation requires additional library';
 }

 async coordinateQuiz() {
   console.log(chalk.blue('\n🎲 Coordinate Geography Quiz'));
   console.log(chalk.yellow('Test your geographic knowledge!\n'));

   const quizTypes = [
     { name: '🏛️ Capital Cities Quiz', value: 'capitals' },
     { name: '🏔️ Famous Landmarks Quiz', value: 'landmarks' },
     { name: '🌍 Country Centers Quiz', value: 'countries' },
     { name: '🏝️ Island Locations Quiz', value: 'islands' }
   ];

   const { quizType } = await inquirer.prompt([
     {
       type: 'list',
       name: 'quizType',
       message: 'Select quiz type:',
       choices: quizTypes
     }
   ]);

   const questions = this.getQuizQuestions(quizType);
   let score = 0;
   const totalQuestions = Math.min(5, questions.length);

   for (let i = 0; i < totalQuestions; i++) {
     const question = questions[i];
     console.log(chalk.cyan(`\n❓ Question ${i + 1}/${totalQuestions}`));
     console.log(chalk.white(`📍 Coordinates: ${question.lat}, ${question.lon}`));

     const { answer } = await inquirer.prompt([
       {
         type: 'list',
         name: 'answer',
         message: 'What location is this?',
         choices: question.options
       }
     ]);

     if (answer === question.correct) {
       console.log(chalk.green('✅ Correct!'));
       score++;
     } else {
       console.log(chalk.red(`❌ Wrong! The correct answer is: ${question.correct}`));
     }

     console.log(chalk.gray(`🗺️ Google Maps: https://maps.google.com/?q=${question.lat},${question.lon}`));
   }

   const percentage = (score / totalQuestions) * 100;
   console.log(chalk.blue(`\n🏆 Final Score: ${score}/${totalQuestions} (${percentage.toFixed(1)}%)`));

   if (percentage >= 80) {
     console.log(chalk.green('🎉 Excellent! You\'re a geography expert!'));
   } else if (percentage >= 60) {
     console.log(chalk.yellow('👍 Good job! Keep practicing!'));
   } else {
     console.log(chalk.red('📚 Keep studying geography!'));
   }
 }

 getQuizQuestions(type) {
   const questions = {
     capitals: [
       {
         lat: '48.8566', lon: '2.3522',
         correct: 'Paris, France',
         options: ['Paris, France', 'London, UK', 'Berlin, Germany', 'Rome, Italy']
       },
       {
         lat: '35.6762', lon: '139.6503',
         correct: 'Tokyo, Japan',
         options: ['Seoul, South Korea', 'Tokyo, Japan', 'Beijing, China', 'Bangkok, Thailand']
       },
       {
         lat: '-33.8688', lon: '151.2093',
         correct: 'Sydney, Australia',
         options: ['Melbourne, Australia', 'Sydney, Australia', 'Auckland, New Zealand', 'Perth, Australia']
       },
       {
         lat: '40.7128', lon: '-74.0060',
         correct: 'New York, USA',
         options: ['Washington DC, USA', 'New York, USA', 'Boston, USA', 'Philadelphia, USA']
       },
       {
         lat: '-6.2088', lon: '106.8456',
         correct: 'Jakarta, Indonesia',
         options: ['Jakarta, Indonesia', 'Bangkok, Thailand', 'Manila, Philippines', 'Kuala Lumpur, Malaysia']
       }
     ],
     landmarks: [
       {
         lat: '27.1751', lon: '78.0421',
         correct: 'Taj Mahal, India',
         options: ['Red Fort, India', 'Taj Mahal, India', 'Golden Temple, India', 'Qutub Minar, India']
       },
       {
         lat: '40.6892', lon: '-74.0445',
         correct: 'Statue of Liberty, USA',
         options: ['Empire State Building, USA', 'Statue of Liberty, USA', 'Brooklyn Bridge, USA', 'Central Park, USA']
       },
       {
         lat: '51.5014', lon: '-0.1419',
         correct: 'Big Ben, UK',
         options: ['Tower Bridge, UK', 'Big Ben, UK', 'London Eye, UK', 'Buckingham Palace, UK']
       }
     ],
     countries: [
       {
         lat: '39.9042', lon: '116.4074',
         correct: 'China',
         options: ['China', 'Mongolia', 'Russia', 'Kazakhstan']
       },
       {
         lat: '55.7558', lon: '37.6176',
         correct: 'Russia',
         options: ['Finland', 'Russia', 'Poland', 'Ukraine']
       }
     ],
     islands: [
       {
         lat: '-8.3405', lon: '115.0920',
         correct: 'Bali, Indonesia',
         options: ['Bali, Indonesia', 'Java, Indonesia', 'Lombok, Indonesia', 'Flores, Indonesia']
       }
     ]
   };

   return questions[type] || questions.capitals;
 }

 async generateQRCode() {
   console.log(chalk.blue('\n📱 Generate QR Code for Location'));
   
   const { lat, lon, includeAddress } = await inquirer.prompt([
     {
       type: 'input',
       name: 'lat',
       message: 'Enter latitude:',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
       }
     },
     {
       type: 'input',
       name: 'lon',
       message: 'Enter longitude:',
       validate: input => {
         const num = parseFloat(input);
         return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
       }
     },
     {
       type: 'confirm',
       name: 'includeAddress',
       message: 'Include address in QR code?',
       default: false
     }
   ]);

   try {
     let qrData = `${lat},${lon}`;
     
     if (includeAddress) {
       console.log(chalk.yellow('\n🔍 Getting address information...'));
       const provider = await this.apiManager.selectProvider();
       const addressResult = await this.geocodingService.reverseGeocode(parseFloat(lat), parseFloat(lon), provider);
       qrData = `${addressResult.address}\n${lat},${lon}`;
     }

     console.log(chalk.green('\n📱 QR Code Generated:'));
     console.log(chalk.gray('Scan with your phone to open location in maps\n'));
     
     qrcode.generate(`geo:${lat},${lon}`, { small: true });
     
     console.log(chalk.blue('\n🔗 Alternative URLs:'));
     console.log(chalk.white(`Google Maps: https://maps.google.com/?q=${lat},${lon}`));
     console.log(chalk.white(`Apple Maps: https://maps.apple.com/?q=${lat},${lon}`));
     console.log(chalk.white(`OpenStreetMap: https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`));
     
   } catch (error) {
     console.log(chalk.red(`\n❌ Error generating QR code: ${error.message}`));
   }
 }

 async viewHistory() {
   console.log(chalk.blue('\n📊 Operation History'));
   
   const history = this.historyManager.getHistory(20);
   
   if (history.length === 0) {
     console.log(chalk.yellow('\n📭 No history found. Start using the app to build your history!'));
     return;
   }

   const table = new Table({
     head: [chalk.cyan('Time'), chalk.cyan('Operation'), chalk.cyan('Input'), chalk.cyan('Provider')],
     colWidths: [20, 15, 40, 15]
   });

   history.forEach(entry => {
     table.push([
       entry.timestamp,
       entry.type,
       entry.input.substring(0, 38),
       entry.provider
     ]);
   });

   console.log('\n' + table.toString());

   const { action } = await inquirer.prompt([
     {
       type: 'list',
       name: 'action',
       message: 'History actions:',
       choices: [
         { name: '🔄 Refresh', value: 'refresh' },
         { name: '🗑️ Clear History', value: 'clear' },
         { name: '📤 Export History', value: 'export' },
         { name: '◀️ Back to Main Menu', value: 'back' }
       ]
     }
   ]);

   switch (action) {
     case 'refresh':
       await this.viewHistory();
       break;
     case 'clear':
       const { confirm } = await inquirer.prompt([
         {
           type: 'confirm',
           name: 'confirm',
           message: 'Are you sure you want to clear all history?',
           default: false
         }
       ]);
       if (confirm) {
         await this.historyManager.clearHistory();
         console.log(chalk.green('\n✅ History cleared!'));
       }
       break;
     case 'export':
       await this.exportHistory();
       break;
     case 'back':
       return;
   }
 }

 async exportHistory() {
   const history = this.historyManager.getHistory(1000);
   const filename = `pelakoor_history_${moment().format('YYYY-MM-DD')}.json`;
   
   try {
     await fs.writeJson(filename, history, { spaces: 2 });
     console.log(chalk.green(`\n✅ History exported to ${filename}`));
   } catch (error) {
     console.log(chalk.red(`\n❌ Error exporting history: ${error.message}`));
   }
 }

 async apiConfiguration() {
   console.log(chalk.blue('\n🔧 API Configuration'));
   
   const { action } = await inquirer.prompt([
     {
       type: 'list',
       name: 'action',
       message: 'Configuration options:',
       choices: [
         { name: '🔑 Setup/Update API Keys', value: 'setup' },
         { name: '📊 View Current Configuration', value: 'view' },
         { name: '🎯 Set Default Provider', value: 'default' },
         { name: '✅ Test API Connections', value: 'test' },
         { name: '◀️ Back to Main Menu', value: 'back' }
       ]
     }
   ]);

   switch (action) {
     case 'setup':
       await this.apiManager.setupApiKeys();
       break;
     case 'view':
       await this.viewCurrentConfig();
       break;
     case 'default':
       await this.setDefaultProvider();
       break;
     case 'test':
       await this.testApiConnections();
       break;
     case 'back':
       return;
   }
 }

 async viewCurrentConfig() {
   const config = this.apiManager.config;
   
   const table = new Table({
     head: [chalk.cyan('Provider'), chalk.cyan('Status'), chalk.cyan('API Key'), chalk.cyan('Default')],
     colWidths: [20, 10, 15, 10]
   });

   Object.entries(config.providers).forEach(([provider, settings]) => {
     const hasKey = process.env[`${provider.toUpperCase()}_API_KEY`] ? '✅' : '❌';
     const status = settings.active ? chalk.green('Active') : chalk.red('Inactive');
     const isDefault = config.defaultProvider === provider ? '⭐' : '';
     
     table.push([
       settings.name,
       status,
       settings.requiresKey ? hasKey : 'N/A',
       isDefault
     ]);
   });

   console.log('\n' + table.toString());
 }

  async setDefaultProvider() {
    const activeProviders = this.apiManager.getActiveProviders();
    
    if (activeProviders.length <= 1) {
        console.log(chalk.yellow('\nℹ️ Hanya ada satu provider aktif. Tidak perlu mengatur default.'));
        return;
    }

    const choices = activeProviders.map(provider => ({
      name: this.apiManager.config.providers[provider].name,
      value: provider
    }));

    const { newDefault } = await inquirer.prompt([
        {
            type: 'list',
            name: 'newDefault',
            message: 'Pilih provider default baru:',
            choices: choices,
            default: this.apiManager.config.defaultProvider
        }
    ]);

    this.apiManager.config.defaultProvider = newDefault;
    await this.apiManager.saveConfig();
    console.log(chalk.green(`\n✅ Provider default telah diubah menjadi ${this.apiManager.config.providers[newDefault].name}.`));
  }

  async testApiConnections() {
    console.log(chalk.blue('\n🧪 Testing API Connections...'));
    const providersToTest = Object.keys(this.apiManager.config.providers).filter(p => {
        const providerConf = this.apiManager.config.providers[p];
        return providerConf.active && providerConf.requiresKey;
    });

    if (providersToTest.length === 0) {
        console.log(chalk.yellow('\nTidak ada provider aktif yang memerlukan kunci API untuk dites.'));
        return;
    }

    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(providersToTest.length, 0);

    const results = [];

    for(const provider of providersToTest) {
        let status = chalk.red('❌ Failed');
        let errorMsg = 'Unknown error';
        try {
            // Tes dengan permintaan sederhana (misalnya, mencari 'Paris')
            const testResult = await this.geocodingService.geocodeAddress('Paris', provider);
            if (testResult && testResult.length > 0) {
                status = chalk.green('✅ Success');
                errorMsg = '';
            } else {
                errorMsg = 'No results returned';
            }
        } catch (error) {
            errorMsg = error.message;
        }
        results.push({ provider: this.apiManager.config.providers[provider].name, status, error: errorMsg });
        progressBar.increment();
    }
    progressBar.stop();

    const table = new Table({
        head: [chalk.cyan('Provider'), chalk.cyan('Status'), chalk.cyan('Notes')],
        colWidths: [25, 12, 40]
    });
    results.forEach(res => table.push([res.provider, res.status, res.error]));
    console.log('\n' + table.toString() + '\n');
  }

  async applicationSettings() {
    console.log(chalk.blue('\n⚙️ Application Settings'));
    const features = this.apiManager.config.features;

    const { newSettings } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'newSettings',
            message: 'Pilih fitur aplikasi untuk diaktifkan:',
            choices: [
                { name: 'Simpan riwayat operasi', value: 'saveHistory', checked: features.saveHistory },
                { name: 'Tampilkan progress bar', value: 'showProgress', checked: features.showProgress },
                { name: 'Gunakan output berwarna', value: 'colorOutput', checked: features.colorOutput },
            ]
        }
    ]);

    this.apiManager.config.features.saveHistory = newSettings.includes('saveHistory');
    this.apiManager.config.features.showProgress = newSettings.includes('showProgress');
    this.apiManager.config.features.colorOutput = newSettings.includes('colorOutput');

    await this.apiManager.saveConfig();
    this.historyManager.setSaveEnabled(this.apiManager.config.features.saveHistory);
    console.log(chalk.green('\n✅ Pengaturan aplikasi berhasil disimpan!'));
  }

  async askContinue() {
    console.log('\n' + chalk.gray('━'.repeat(60)));
    
    const { continueApp } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueApp',
        message: chalk.cyan('Apakah Anda ingin melakukan operasi lain?'),
        default: true
      }
    ]);

    if (continueApp) {
      this.showBanner();
      await this.mainMenu();
    } else {
      this.exitApp();
    }
  }

  exitApp() {
    console.log('\n' + chalk.green('Terima kasih telah menggunakan Pelakoor! 🌍'));
    console.log(chalk.yellow('Sampai jumpa lagi! 👋\n'));
    process.exit(0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the application
new PelakoorAdvanced();