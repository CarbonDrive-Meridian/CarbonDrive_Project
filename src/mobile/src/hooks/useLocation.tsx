import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationData } from '../types';
import { locationApi } from '../services/api';

interface UseLocationReturn {
  location: LocationData | null;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  requestPermissions: () => Promise<boolean>;
  hasPermission: boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const watchId = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    requestPermissions();
    
    return () => {
      if (watchId.current) {
        watchId.current.remove();
      }
    };
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      
      const hasForeground = status === 'granted';
      const hasBackground = backgroundStatus === 'granted';
      
      setHasPermission(hasForeground);
      
      if (hasForeground) {
        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const locationData: LocationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy || undefined,
          timestamp: currentLocation.timestamp,
        };
        
        setLocation(locationData);
      }
      
      return hasForeground;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  };

  const startTracking = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        throw new Error('Location permission denied');
      }
    }

    try {
      setIsTracking(true);
      
      watchId.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        async (newLocation) => {
          const locationData: LocationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy || undefined,
            timestamp: newLocation.timestamp,
          };
          
          setLocation(locationData);
          
          // Send location to API
          try {
            await locationApi.updateLocation({
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            });
          } catch (error) {
            console.error('Error sending location to API:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setIsTracking(false);
      throw error;
    }
  };

  const stopTracking = () => {
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    setIsTracking(false);
  };

  return {
    location,
    isTracking,
    startTracking,
    stopTracking,
    requestPermissions,
    hasPermission,
  };
};
