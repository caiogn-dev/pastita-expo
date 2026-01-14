import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationAddress {
  street?: string;
  streetNumber?: string;
  neighborhood?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  formattedAddress?: string;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  
  if (foregroundStatus !== 'granted') {
    console.log('Foreground location permission not granted');
    return false;
  }

  return true;
};

export const checkLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async (): Promise<LocationCoords | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

export const getLastKnownLocation = async (): Promise<LocationCoords | null> => {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getLastKnownPositionAsync();
    if (!location) {
      return null;
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
    };
  } catch (error) {
    console.error('Error getting last known location:', error);
    return null;
  }
};

export const reverseGeocodeLocation = async (
  latitude: number,
  longitude: number
): Promise<LocationAddress | null> => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    return {
      street: result.street || undefined,
      streetNumber: result.streetNumber || undefined,
      neighborhood: result.district || undefined,
      city: result.city || undefined,
      region: result.region || undefined,
      postalCode: result.postalCode || undefined,
      country: result.country || undefined,
      formattedAddress: result.formattedAddress || undefined,
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

export const geocodeAddress = async (address: string): Promise<LocationCoords | null> => {
  try {
    const results = await Location.geocodeAsync(address);

    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: result.accuracy || undefined,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

export const watchLocation = (
  callback: (location: LocationCoords) => void,
  options?: {
    accuracy?: Location.Accuracy;
    distanceInterval?: number;
    timeInterval?: number;
  }
): Promise<Location.LocationSubscription> => {
  return Location.watchPositionAsync(
    {
      accuracy: options?.accuracy || Location.Accuracy.Balanced,
      distanceInterval: options?.distanceInterval || 10,
      timeInterval: options?.timeInterval || 5000,
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      });
    }
  );
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export default {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentLocation,
  getLastKnownLocation,
  reverseGeocodeLocation,
  geocodeAddress,
  watchLocation,
  calculateDistance,
};
