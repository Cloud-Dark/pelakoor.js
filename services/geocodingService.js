// services/geocodingService.js
import axios from 'axios';
import NodeGeocoder from 'node-geocoder';


class GeocodingService {
  constructor(apiManager) {
    this.apiManager = apiManager;
  }

  async geocodeAddress(address, provider = 'osm') {
    switch (provider) {
      case 'osm':
        return await this.geocodeWithOSM(address);
      case 'google':
        return await this.geocodeWithGoogle(address);
      case 'mapbox':
        return await this.geocodeWithMapbox(address);
      case 'here':
        return await this.geocodeWithHere(address);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async reverseGeocode(lat, lon, provider = 'osm') {
    switch (provider) {
      case 'osm':
        return await this.reverseGeocodeWithOSM(lat, lon);
      case 'google':
        return await this.reverseGeocodeWithGoogle(lat, lon);
      case 'mapbox':
        return await this.reverseGeocodeWithMapbox(lat, lon);
      case 'here':
        return await this.reverseGeocodeWithHere(lat, lon);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // OpenStreetMap Implementation
  async geocodeWithOSM(address) {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 5,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Pelakoor/2.0'
      }
    });

    return response.data.map(result => ({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: result.display_name,
      details: result.address,
      boundingBox: result.boundingbox,
      provider: 'OpenStreetMap'
    }));
  }

  async reverseGeocodeWithOSM(lat, lon) {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: lon,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Pelakoor/2.0'
      }
    });

    return {
      address: response.data.display_name,
      details: response.data.address,
      provider: 'OpenStreetMap'
    };
  }

  // Google Maps Implementation
  async geocodeWithGoogle(address) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Google API key not configured');

    const geocoder = NodeGeocoder({
      provider: 'google',
      apiKey: apiKey
    });

    const results = await geocoder.geocode(address);
    return results.map(result => ({
      lat: result.latitude,
      lon: result.longitude,
      address: result.formattedAddress,
      details: {
        streetNumber: result.streetNumber,
        streetName: result.streetName,
        city: result.city,
        state: result.administrativeLevels?.level1long,
        country: result.country,
        countryCode: result.countryCode,
        zipcode: result.zipcode
      },
      provider: 'Google Maps'
    }));
  }

  async reverseGeocodeWithGoogle(lat, lon) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Google API key not configured');

    const geocoder = NodeGeocoder({
      provider: 'google',
      apiKey: apiKey
    });

    const results = await geocoder.reverse({ lat: lat, lon: lon });
    const result = results[0];
    
    return {
      address: result.formattedAddress,
      details: {
        streetNumber: result.streetNumber,
        streetName: result.streetName,
        city: result.city,
        state: result.administrativeLevels?.level1long,
        country: result.country,
        zipcode: result.zipcode
      },
      provider: 'Google Maps'
    };
  }

  // Mapbox Implementation
  async geocodeWithMapbox(address) {
    const apiKey = process.env.MAPBOX_API_KEY;
    if (!apiKey) throw new Error('Mapbox API key not configured');

    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
      params: {
        access_token: apiKey,
        limit: 5
      }
    });

    return response.data.features.map(feature => ({
      lat: feature.center[1],
      lon: feature.center[0],
      address: feature.place_name,
      details: feature.context?.reduce((acc, ctx) => {
        const [type] = ctx.id.split('.');
        acc[type] = ctx.text;
        return acc;
      }, {}),
      provider: 'Mapbox'
    }));
  }

  async reverseGeocodeWithMapbox(lat, lon) {
    const apiKey = process.env.MAPBOX_API_KEY;
    if (!apiKey) throw new Error('Mapbox API key not configured');

    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json`, {
      params: {
        access_token: apiKey
      }
    });

    const feature = response.data.features[0];
    return {
      address: feature.place_name,
      details: feature.context?.reduce((acc, ctx) => {
        const [type] = ctx.id.split('.');
        acc[type] = ctx.text;
        return acc;
      }, {}),
      provider: 'Mapbox'
    };
  }

  // HERE API Implementation
  async geocodeWithHere(address) {
    const apiKey = process.env.HERE_API_KEY;
    if (!apiKey) throw new Error('HERE API key not configured');

    const response = await axios.get('https://geocode.search.hereapi.com/v1/geocode', {
      params: {
        q: address,
        apiKey: apiKey,
        limit: 5
      }
    });

    return response.data.items.map(item => ({
      lat: item.position.lat,
      lon: item.position.lng,
      address: item.title,
      details: item.address,
      provider: 'HERE'
    }));
  }

  async reverseGeocodeWithHere(lat, lon) {
    const apiKey = process.env.HERE_API_KEY;
    if (!apiKey) throw new Error('HERE API key not configured');

    const response = await axios.get('https://revgeocode.search.hereapi.com/v1/revgeocode', {
      params: {
        at: `${lat},${lon}`,
        apiKey: apiKey
      }
    });

    const item = response.data.items[0];
    return {
      address: item.title,
      details: item.address,
      provider: 'HERE'
    };
  }
}

export default GeocodingService;