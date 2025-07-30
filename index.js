import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import axios from 'axios';
import geolib from 'geolib';
import { default as Table } from 'cli-table3';

class Pelakoor {
  constructor() {
    this.showBanner();
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
    console.log(chalk.yellow('🌍 Your Ultimate Coordinate Toolkit\n'));
    console.log(chalk.gray('━'.repeat(50)));
  }

  async mainMenu() {
    const choices = [
      {
        name: '📍 Address to Coordinate',
        value: 'addressToCoord'
      },
      {
        name: '🏠 Coordinate to Address',
        value: 'coordToAddress'
      },
      {
        name: '📏 Calculate Distance Between Points',
        value: 'calculateDistance'
      },
      {
        name: '🎯 Find Nearby Places',
        value: 'findNearby'
      },
      {
        name: '🧭 Get Bearing Between Points',
        value: 'getBearing'
      },
      {
        name: '📐 Generate Random Coordinate',
        value: 'randomCoord'
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
        pageSize: 10
      }
    ]);

    await this.handleAction(action);
  }

  async handleAction(action) {
    console.log('\n' + chalk.gray('━'.repeat(50)));
    
    switch (action) {
      case 'addressToCoord':
        await this.addressToCoordinate();
        break;
      case 'coordToAddress':
        await this.coordinateToAddress();
        break;
      case 'calculateDistance':
        await this.calculateDistance();
        break;
      case 'findNearby':
        await this.findNearbyPlaces();
        break;
      case 'getBearing':
        await this.getBearing();
        break;
      case 'randomCoord':
        await this.generateRandomCoordinate();
        break;
      case 'exit':
        this.exitApp();
        return;
    }

    await this.askContinue();
  }

  async addressToCoordinate() {
    console.log(chalk.blue('\n📍 Address to Coordinate Converter'));
    
    const { address } = await inquirer.prompt([
      {
        type: 'input',
        name: 'address',
        message: 'Enter the address:',
        validate: input => input.length > 0 || 'Please enter a valid address'
      }
    ]);

    try {
      console.log(chalk.yellow('\n🔍 Searching...'));
      
      // Using Nominatim API (OpenStreetMap)
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1
        }
      });

      if (response.data.length > 0) {
        const result = response.data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        const table = new Table({
          head: [chalk.cyan('Property'), chalk.cyan('Value')],
          colWidths: [20, 50]
        });

        table.push(
          ['📍 Address', result.display_name],
          ['🌐 Latitude', lat.toFixed(6)],
          ['🌐 Longitude', lon.toFixed(6)],
          ['📋 Coordinates', `${lat.toFixed(6)}, ${lon.toFixed(6)}`]
        );

        console.log('\n' + chalk.green('✅ Result:'));
        console.log(table.toString());

        // Additional coordinate formats
        console.log(chalk.blue('\n📋 Different Formats:'));
        console.log(chalk.white(`Decimal Degrees: ${lat.toFixed(6)}, ${lon.toFixed(6)}`));
        console.log(chalk.white(`Google Maps: https://maps.google.com/?q=${lat},${lon}`));
        
      } else {
        console.log(chalk.red('\n❌ Address not found. Please try a different address.'));
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Error occurred while searching. Please check your internet connection.'));
    }
  }

  async coordinateToAddress() {
    console.log(chalk.blue('\n🏠 Coordinate to Address Converter'));
    
    const { lat, lon } = await inquirer.prompt([
      {
        type: 'input',
        name: 'lat',
        message: 'Enter latitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude (-90 to 90)';
        }
      },
      {
        type: 'input',
        name: 'lon',
        message: 'Enter longitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude (-180 to 180)';
        }
      }
    ]);

    try {
      console.log(chalk.yellow('\n🔍 Reverse geocoding...'));
      
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          format: 'json'
        }
      });

      if (response.data && response.data.display_name) {
        const result = response.data;
        
        const table = new Table({
          head: [chalk.cyan('Property'), chalk.cyan('Value')],
          colWidths: [20, 50]
        });

        table.push(
          ['📍 Full Address', result.display_name],
          ['🏠 House Number', result.address?.house_number || 'N/A'],
          ['🛣️ Road', result.address?.road || 'N/A'],
          ['🏘️ Suburb', result.address?.suburb || result.address?.village || 'N/A'],
          ['🏙️ City', result.address?.city || result.address?.town || 'N/A'],
          ['🗺️ State', result.address?.state || 'N/A'],
          ['🏳️ Country', result.address?.country || 'N/A'],
          ['📮 Postcode', result.address?.postcode || 'N/A']
        );

        console.log('\n' + chalk.green('✅ Result:'));
        console.log(table.toString());
        
      } else {
        console.log(chalk.red('\n❌ No address found for these coordinates.'));
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Error occurred while searching. Please check your internet connection.'));
    }
  }

  async calculateDistance() {
    console.log(chalk.blue('\n📏 Distance Calculator'));
    
    const coordinates = await inquirer.prompt([
      {
        type: 'input',
        name: 'lat1',
        message: 'Enter first point latitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
        }
      },
      {
        type: 'input',
        name: 'lon1',
        message: 'Enter first point longitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
        }
      },
      {
        type: 'input',
        name: 'lat2',
        message: 'Enter second point latitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
        }
      },
      {
        type: 'input',
        name: 'lon2',
        message: 'Enter second point longitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
        }
      }
    ]);

    const point1 = { lat: parseFloat(coordinates.lat1), lng: parseFloat(coordinates.lon1) };
    const point2 = { lat: parseFloat(coordinates.lat2), lng: parseFloat(coordinates.lon2) };

    const distanceMeters = geolib.getDistance(point1, point2);
    const distanceKm = distanceMeters / 1000;
    const distanceMiles = distanceKm * 0.621371;

    const table = new Table({
      head: [chalk.cyan('Unit'), chalk.cyan('Distance')],
      colWidths: [20, 30]
    });

    table.push(
      ['📏 Meters', `${distanceMeters.toLocaleString()} m`],
      ['📏 Kilometers', `${distanceKm.toFixed(2)} km`],
      ['📏 Miles', `${distanceMiles.toFixed(2)} miles`],
      ['🚶 Walking Time', `${Math.round(distanceKm / 5 * 60)} minutes`],
      ['🚗 Driving Time', `${Math.round(distanceKm / 60 * 60)} minutes`]
    );

    console.log('\n' + chalk.green('✅ Distance Calculation Result:'));
    console.log(table.toString());
  }

  async getBearing() {
    console.log(chalk.blue('\n🧭 Bearing Calculator'));
    
    const coordinates = await inquirer.prompt([
      {
        type: 'input',
        name: 'lat1',
        message: 'Enter starting point latitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
        }
      },
      {
        type: 'input',
        name: 'lon1',
        message: 'Enter starting point longitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
        }
      },
      {
        type: 'input',
        name: 'lat2',
        message: 'Enter destination latitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -90 && num <= 90) || 'Please enter a valid latitude';
        }
      },
      {
        type: 'input',
        name: 'lon2',
        message: 'Enter destination longitude:',
        validate: input => {
          const num = parseFloat(input);
          return (!isNaN(num) && num >= -180 && num <= 180) || 'Please enter a valid longitude';
        }
      }
    ]);

    const point1 = { lat: parseFloat(coordinates.lat1), lng: parseFloat(coordinates.lon1) };
    const point2 = { lat: parseFloat(coordinates.lat2), lng: parseFloat(coordinates.lon2) };

    const bearing = geolib.getBearing(point1, point2);
    const compassBearing = geolib.getCompassDirection(point1, point2);

    const table = new Table({
      head: [chalk.cyan('Property'), chalk.cyan('Value')],
      colWidths: [25, 25]
    });

    table.push(
      ['🧭 Bearing (degrees)', `${bearing}°`],
      ['🧭 Compass Direction', `${compassBearing}`],
      ['📍 From', `${point1.lat}, ${point1.lng}`],
      ['📍 To', `${point2.lat}, ${point2.lng}`]
    );

    console.log('\n' + chalk.green('✅ Bearing Calculation Result:'));
    console.log(table.toString());
  }

  async generateRandomCoordinate() {
    console.log(chalk.blue('\n📐 Random Coordinate Generator'));
    
    const { region } = await inquirer.prompt([
      {
        type: 'list',
        name: 'region',
        message: 'Select region:',
        choices: [
          { name: '🌍 Global', value: 'global' },
          { name: '🇮🇩 Indonesia', value: 'indonesia' },
          { name: '🏙️ Jakarta', value: 'jakarta' },
          { name: '🏝️ Bali', value: 'bali' }
        ]
      }
    ]);

    let lat, lon;
    
    switch (region) {
      case 'global':
        lat = (Math.random() * 180 - 90).toFixed(6);
        lon = (Math.random() * 360 - 180).toFixed(6);
        break;
      case 'indonesia':
        lat = (Math.random() * (6 - (-11)) + (-11)).toFixed(6);
        lon = (Math.random() * (141 - 95) + 95).toFixed(6);
        break;
      case 'jakarta':
        lat = (Math.random() * ((-6.08) - (-6.35)) + (-6.35)).toFixed(6);
        lon = (Math.random() * (106.98 - 106.68) + 106.68).toFixed(6);
        break;
      case 'bali':
        lat = (Math.random() * ((-8.05) - (-8.85)) + (-8.85)).toFixed(6);
        lon = (Math.random() * (115.7 - 114.4) + 114.4).toFixed(6);
        break;
    }

    const table = new Table({
      head: [chalk.cyan('Property'), chalk.cyan('Value')],
      colWidths: [20, 30]
    });

    table.push(
      ['🎯 Region', region.charAt(0).toUpperCase() + region.slice(1)],
      ['🌐 Latitude', lat],
      ['🌐 Longitude', lon],
      ['📋 Coordinates', `${lat}, ${lon}`],
      ['🗺️ Google Maps', `https://maps.google.com/?q=${lat},${lon}`]
    );

    console.log('\n' + chalk.green('✅ Random Coordinate Generated:'));
    console.log(table.toString());
  }

  async findNearbyPlaces() {
    console.log(chalk.blue('\n🎯 Find Nearby Places'));
    console.log(chalk.yellow('Note: This feature uses OpenStreetMap data\n'));
    
    const { lat, lon, radius } = await inquirer.prompt([
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
        name: 'radius',
        message: 'Enter search radius (in meters):',
        default: '1000',
        validate: input => {
          const num = parseInt(input);
          return (!isNaN(num) && num > 0) || 'Please enter a valid radius';
        }
      }
    ]);

    try {
      console.log(chalk.yellow('\n🔍 Searching nearby places...'));
      
      // Using Overpass API to find nearby places
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"restaurant|cafe|hospital|bank|school|hotel"](around:${radius},${lat},${lon});
          node["shop"](around:${radius},${lat},${lon});
        );
        out center meta;
      `;
      
      const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
        headers: { 'Content-Type': 'text/plain' }
      });

      if (response.data.elements && response.data.elements.length > 0) {
        const places = response.data.elements.slice(0, 10); // Limit to 10 results
        
        const table = new Table({
          head: [chalk.cyan('Name'), chalk.cyan('Type'), chalk.cyan('Distance')],
          colWidths: [30, 20, 15]
        });

        places.forEach(place => {
          const name = place.tags.name || 'Unknown';
          const type = place.tags.amenity || place.tags.shop || 'Place';
          const distance = geolib.getDistance(
            { lat: parseFloat(lat), lng: parseFloat(lon) },
            { lat: place.lat, lng: place.lon }
          );
          
          table.push([
            name.substring(0, 28),
            type,
            `${distance}m`
          ]);
        });

        console.log('\n' + chalk.green(`✅ Found ${places.length} nearby places:`));
        console.log(table.toString());
        
      } else {
        console.log(chalk.red('\n❌ No nearby places found in the specified radius.'));
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Error occurred while searching. Please try again later.'));
    }
  }

  async askContinue() {
    console.log('\n' + chalk.gray('━'.repeat(50)));
    
    const { continueApp } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueApp',
        message: chalk.cyan('Would you like to perform another operation?'),
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
    console.log('\n' + chalk.green('Thanks for using Pelakoor! 🌍'));
    console.log(chalk.yellow('See you next time! 👋\n'));
    process.exit(0);
  }
}

// Start the application
new Pelakoor();