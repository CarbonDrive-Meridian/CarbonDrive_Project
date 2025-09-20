import { useState, useEffect, useRef } from 'react';
import { useObdReader, ObdData } from './useObdReader';
import { obdApi } from '../services/api';
import { useLocation } from './useLocation';

interface ObdTripData {
  tripId: string;
  timestamp: number;
  rpm: number;
  maf: number;
  speed: number;
  throttle: number;
  engineLoad: number;
  fuelLevel: number;
  coolantTemp: number;
  latitude?: number;
  longitude?: number;
}

interface UseObdTripReturn {
  obdData: ObdData;
  isObdConnected: boolean;
  isSendingData: boolean;
  lastSentData: ObdTripData | null;
  error: string | null;
  startObdTrip: (tripId: string) => void;
  stopObdTrip: () => void;
  sendObdData: (tripId: string) => Promise<void>;
}

export const useObdTrip = (): UseObdTripReturn => {
  const { obdData, isConnected, startReading, stopReading, isReading } = useObdReader();
  const { location } = useLocation();
  
  const [isSendingData, setIsSendingData] = useState(false);
  const [lastSentData, setLastSentData] = useState<ObdTripData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  
  const dataBuffer = useRef<ObdTripData[]>([]);
  const sendInterval = useRef<NodeJS.Timeout | null>(null);
  const batchSize = 10; // Send data in batches of 10
  const sendIntervalMs = 15000; // Send every 15 seconds

  const isObdConnected = isConnected && obdData.isConnected;

  // Start OBD trip
  const startObdTrip = (tripId: string) => {
    setCurrentTripId(tripId);
    setError(null);
    dataBuffer.current = [];
    
    if (isObdConnected) {
      startReading();
      startDataSending();
    } else {
      setError('OBD-II não conectado. Conecte primeiro o dispositivo.');
    }
  };

  // Stop OBD trip
  const stopObdTrip = () => {
    if (sendInterval.current) {
      clearInterval(sendInterval.current);
      sendInterval.current = null;
    }
    
    stopReading();
    setCurrentTripId(null);
    
    // Send remaining buffered data
    if (dataBuffer.current.length > 0) {
      sendBufferedData();
    }
  };

  // Start sending data at intervals
  const startDataSending = () => {
    if (sendInterval.current) {
      clearInterval(sendInterval.current);
    }
    
    sendInterval.current = setInterval(() => {
      if (dataBuffer.current.length > 0) {
        sendBufferedData();
      }
    }, sendIntervalMs);
  };

  // Send buffered data to API
  const sendBufferedData = async () => {
    if (dataBuffer.current.length === 0 || !currentTripId) return;
    
    try {
      setIsSendingData(true);
      setError(null);
      
      await obdApi.sendObdBatch([...dataBuffer.current]);
      
      // Update last sent data
      if (dataBuffer.current.length > 0) {
        setLastSentData(dataBuffer.current[dataBuffer.current.length - 1]);
      }
      
      // Clear buffer
      dataBuffer.current = [];
      
    } catch (err) {
      console.error('Error sending OBD data:', err);
      setError('Erro ao enviar dados OBD para o servidor');
    } finally {
      setIsSendingData(false);
    }
  };

  // Send single OBD data point
  const sendObdData = async (tripId: string) => {
    if (!isObdConnected || !obdData) return;
    
    try {
      setIsSendingData(true);
      setError(null);
      
      const obdTripData: ObdTripData = {
        tripId,
        timestamp: Date.now(),
        rpm: obdData.rpm,
        maf: obdData.maf,
        speed: obdData.speed,
        throttle: obdData.throttle,
        engineLoad: obdData.engineLoad,
        fuelLevel: obdData.fuelLevel,
        coolantTemp: obdData.coolantTemp,
        latitude: location?.latitude,
        longitude: location?.longitude,
      };
      
      await obdApi.sendObdData(obdTripData);
      setLastSentData(obdTripData);
      
    } catch (err) {
      console.error('Error sending OBD data:', err);
      setError('Erro ao enviar dados OBD para o servidor');
    } finally {
      setIsSendingData(false);
    }
  };

  // Buffer OBD data for batch sending
  useEffect(() => {
    if (isObdConnected && currentTripId && obdData) {
      const obdTripData: ObdTripData = {
        tripId: currentTripId,
        timestamp: Date.now(),
        rpm: obdData.rpm,
        maf: obdData.maf,
        speed: obdData.speed,
        throttle: obdData.throttle,
        engineLoad: obdData.engineLoad,
        fuelLevel: obdData.fuelLevel,
        coolantTemp: obdData.coolantTemp,
        latitude: location?.latitude,
        longitude: location?.longitude,
      };
      
      dataBuffer.current.push(obdTripData);
      
      // Send immediately if buffer is full
      if (dataBuffer.current.length >= batchSize) {
        sendBufferedData();
      }
    }
  }, [obdData, currentTripId, isObdConnected, location]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sendInterval.current) {
        clearInterval(sendInterval.current);
      }
    };
  }, []);

  return {
    obdData,
    isObdConnected,
    isSendingData,
    lastSentData,
    error,
    startObdTrip,
    stopObdTrip,
    sendObdData,
  };
};
