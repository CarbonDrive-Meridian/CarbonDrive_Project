import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripData, LocationData } from '../types';
import { tripApi } from '../services/api';
import { useLocation } from './useLocation';

interface UseTripReturn {
  currentTrip: TripData | null;
  isTripActive: boolean;
  startTrip: () => Promise<void>;
  endTrip: () => Promise<void>;
  tripDistance: number;
  tripDuration: number;
  carbonSaved: number;
  tokensEarned: number;
  ecoScore: number;
}

const TRIP_STORAGE_KEY = 'current_trip';

export const useTrip = (): UseTripReturn => {
  const [currentTrip, setCurrentTrip] = useState<TripData | null>(null);
  const [tripDistance, setTripDistance] = useState(0);
  const [tripDuration, setTripDuration] = useState(0);
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [ecoScore, setEcoScore] = useState(0);
  
  const { location, isTracking } = useLocation();
  const lastLocation = useRef<LocationData | null>(null);
  const tripStartTime = useRef<Date | null>(null);
  const distanceInterval = useRef<NodeJS.Timeout | null>(null);

  const isTripActive = !!currentTrip;

  // Load trip from storage on mount
  useEffect(() => {
    loadTripFromStorage();
  }, []);

  // Calculate distance and update trip data
  useEffect(() => {
    if (isTripActive && location && lastLocation.current) {
      const distance = calculateDistance(
        lastLocation.current.latitude,
        lastLocation.current.longitude,
        location.latitude,
        location.longitude
      );
      
      setTripDistance(prev => prev + distance);
      updateTripMetrics();
    }
    
    if (location) {
      lastLocation.current = location;
    }
  }, [location, isTripActive]);

  // Update trip duration
  useEffect(() => {
    if (isTripActive && tripStartTime.current) {
      distanceInterval.current = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - tripStartTime.current!.getTime()) / 1000);
        setTripDuration(duration);
      }, 1000);
    } else {
      if (distanceInterval.current) {
        clearInterval(distanceInterval.current);
        distanceInterval.current = null;
      }
    }

    return () => {
      if (distanceInterval.current) {
        clearInterval(distanceInterval.current);
      }
    };
  }, [isTripActive]);

  const loadTripFromStorage = async () => {
    try {
      const storedTrip = await AsyncStorage.getItem(TRIP_STORAGE_KEY);
      if (storedTrip) {
        const trip: TripData = JSON.parse(storedTrip);
        setCurrentTrip(trip);
        setTripDistance(trip.distance);
        setCarbonSaved(trip.carbonSaved);
        setTokensEarned(trip.tokensEarned);
        setEcoScore(trip.ecoScore);
        
        if (trip.isActive) {
          tripStartTime.current = new Date(trip.startTime);
        }
      }
    } catch (error) {
      console.error('Error loading trip from storage:', error);
    }
  };

  const saveTripToStorage = async (trip: TripData) => {
    try {
      await AsyncStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trip));
    } catch (error) {
      console.error('Error saving trip to storage:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const updateTripMetrics = () => {
    // Calculate carbon saved based on distance and eco-driving factors
    const baseCarbonPerKm = 0.12; // kg CO2 per km for average car
    const ecoEfficiencyFactor = 0.8; // 20% improvement with eco-driving
    const carbon = tripDistance * baseCarbonPerKm * ecoEfficiencyFactor;
    
    // Calculate tokens earned (1 kg CO2 = 1 $CDRIVE)
    const tokens = carbon;
    
    // Calculate eco score based on smooth driving patterns
    const baseScore = Math.min(100, Math.max(0, 100 - (tripDistance * 2)));
    const score = Math.round(baseScore);
    
    setCarbonSaved(carbon);
    setTokensEarned(tokens);
    setEcoScore(score);
  };

  const startTrip = async () => {
    try {
      const now = new Date();
      tripStartTime.current = now;
      
      const newTrip: TripData = {
        id: `trip_${Date.now()}`,
        startTime: now,
        distance: 0,
        carbonSaved: 0,
        tokensEarned: 0,
        ecoScore: 100,
        isActive: true,
      };
      
      setCurrentTrip(newTrip);
      setTripDistance(0);
      setTripDuration(0);
      setCarbonSaved(0);
      setTokensEarned(0);
      setEcoScore(100);
      
      await saveTripToStorage(newTrip);
      
      // Start location tracking
      // This would be handled by the parent component
      
    } catch (error) {
      console.error('Error starting trip:', error);
      throw error;
    }
  };

  const endTrip = async () => {
    if (!currentTrip) return;
    
    try {
      const now = new Date();
      const finalTrip: TripData = {
        ...currentTrip,
        endTime: now,
        distance: tripDistance,
        carbonSaved,
        tokensEarned,
        ecoScore,
        isActive: false,
      };
      
      setCurrentTrip(finalTrip);
      await saveTripToStorage(finalTrip);
      
      // Send trip data to API
      try {
        await tripApi.endTrip(finalTrip.id);
      } catch (error) {
        console.error('Error sending trip to API:', error);
      }
      
      // Clear storage after successful API call
      await AsyncStorage.removeItem(TRIP_STORAGE_KEY);
      
    } catch (error) {
      console.error('Error ending trip:', error);
      throw error;
    }
  };

  return {
    currentTrip,
    isTripActive,
    startTrip,
    endTrip,
    tripDistance,
    tripDuration,
    carbonSaved,
    tokensEarned,
    ecoScore,
  };
};
