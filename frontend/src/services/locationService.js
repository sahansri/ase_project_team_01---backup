import axios from '../config.js';

export const locationService = {
  // Send location to backend (for drivers)
  updateDriverLocation: async (locationData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/location/driver/location', locationData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Location updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  // Get all driver locations (for admin)
  getAllDriverLocations: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/driver-locations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching driver locations:', error);
      throw error;
    }
  },

  // Get current location once
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }
};