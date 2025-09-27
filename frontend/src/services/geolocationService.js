// frontend/src/services/geolocationService.js
class GeolocationService {
  constructor() {
    this.defaultLocation = {
      latitude: 28.6139, // New Delhi default
      longitude: 77.2090,
      city: 'New Delhi',
      country: 'India'
    };
  }

  async getCurrentLocation() {
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported, using default location');
        return this.defaultLocation;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Get location details using reverse geocoding
      const locationDetails = await this.reverseGeocode(latitude, longitude);
      
      return {
        latitude,
        longitude,
        city: locationDetails.city,
        country: locationDetails.country,
        state: locationDetails.state,
        accuracy: position.coords.accuracy
      };
      
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Try to get location from IP if GPS fails
      try {
        return await this.getLocationFromIP();
      } catch (ipError) {
        console.warn('IP location failed, using default location');
        return this.defaultLocation;
      }
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      // Use a free geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      return {
        city: data.city || data.locality || 'Unknown',
        state: data.principalSubdivision || 'Unknown',
        country: data.countryName || 'Unknown',
        countryCode: data.countryCode || 'IN'
      };
      
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        city: 'Unknown',
        state: 'Unknown',
        country: 'India',
        countryCode: 'IN'
      };
    }
  }

  async getLocationFromIP() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('IP geolocation failed');
      }
      
      const data = await response.json();
      
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        state: data.region,
        country: data.country_name,
        countryCode: data.country_code
      };
      
    } catch (error) {
      console.error('IP geolocation failed:', error);
      throw error;
    }
  }

  async requestLocationPermission() {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        throw new Error('Location permission denied');
      }
      
      return permission.state;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'unknown';
    }
  }

  // Get cached location if available
  getCachedLocation() {
    try {
      const cached = localStorage.getItem('user_location');
      if (cached) {
        const location = JSON.parse(cached);
        const cacheTime = localStorage.getItem('user_location_timestamp');
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        if (cacheTime && parseInt(cacheTime) > fiveMinutesAgo) {
          return location;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached location:', error);
      return null;
    }
  }

  // Cache location for future use
  cacheLocation(location) {
    try {
      localStorage.setItem('user_location', JSON.stringify(location));
      localStorage.setItem('user_location_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  // Get location with caching
  async getLocationWithCaching() {
    // Try cached location first
    const cached = this.getCachedLocation();
    if (cached) {
      console.log('Using cached location:', cached);
      return cached;
    }

    // Get fresh location
    const location = await this.getCurrentLocation();
    
    // Cache the new location
    this.cacheLocation(location);
    
    return location;
  }
}

export default new GeolocationService();