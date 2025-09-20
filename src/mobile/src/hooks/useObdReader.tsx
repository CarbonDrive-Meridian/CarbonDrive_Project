import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';

export interface ObdData {
  rpm: number;
  maf: number; // Mass Air Flow
  speed: number;
  throttle: number;
  engineLoad: number;
  fuelLevel: number;
  coolantTemp: number;
  isConnected: boolean;
  error?: string;
}

interface UseObdReaderReturn {
  obdData: ObdData;
  isScanning: boolean;
  isConnecting: boolean;
  connectedDevice: any | null;
  availableDevices: any[];
  scanForDevices: () => Promise<void>;
  connectToDevice: (device: any) => Promise<void>;
  disconnect: () => Promise<void>;
  startReading: () => void;
  stopReading: () => void;
  isReading: boolean;
}

// Simulated OBD data for demonstration
const simulateObdData = (): ObdData => ({
  rpm: Math.floor(Math.random() * 3000) + 800,
  maf: Math.floor(Math.random() * 50) + 10,
  speed: Math.floor(Math.random() * 120),
  throttle: Math.floor(Math.random() * 100),
  engineLoad: Math.floor(Math.random() * 100),
  fuelLevel: Math.floor(Math.random() * 100),
  coolantTemp: Math.floor(Math.random() * 40) + 80,
  isConnected: true,
});

export const useObdReader = (): UseObdReaderReturn => {
  const [obdData, setObdData] = useState<ObdData>({
    rpm: 0,
    maf: 0,
    speed: 0,
    throttle: 0,
    engineLoad: 0,
    fuelLevel: 0,
    coolantTemp: 0,
    isConnected: false,
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<any | null>(null);
  const [availableDevices, setAvailableDevices] = useState<any[]>([]);
  const [isReading, setIsReading] = useState(false);

  const readingInterval = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (readingInterval.current) {
        clearInterval(readingInterval.current);
      }
    };
  }, []);

  const scanForDevices = useCallback(async () => {
    try {
      setIsScanning(true);
      setAvailableDevices([]);

      // Simulate scanning for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate finding devices
      const simulatedDevices = [
        { id: '1', name: 'ELM327 Bluetooth', rssi: -45 },
        { id: '2', name: 'OBD-II Scanner', rssi: -52 },
        { id: '3', name: 'Car Diagnostic Tool', rssi: -38 },
      ];

      setAvailableDevices(simulatedDevices);
      setIsScanning(false);

    } catch (error) {
      console.error('Error scanning for devices:', error);
      Alert.alert('Erro', 'Erro ao escanear dispositivos Bluetooth');
      setIsScanning(false);
    }
  }, []);

  const connectToDevice = useCallback(async (device: any) => {
    try {
      setIsConnecting(true);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectedDevice(device);
      setObdData(prev => ({ ...prev, isConnected: true, error: undefined }));

      Alert.alert('Sucesso', 'Conectado ao dispositivo OBD-II! (Modo Simulação)');

    } catch (error) {
      console.error('Error connecting to device:', error);
      Alert.alert('Erro', 'Erro ao conectar com o dispositivo OBD-II');
      setObdData(prev => ({ ...prev, isConnected: false, error: 'Erro de conexão' }));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const startReading = useCallback(() => {
    if (!connectedDevice) {
      Alert.alert('Erro', 'Não conectado ao dispositivo OBD-II');
      return;
    }

    setIsReading(true);
    
    readingInterval.current = setInterval(() => {
      const newData = simulateObdData();
      setObdData(prev => ({
        ...prev,
        ...newData,
        isConnected: true,
        error: undefined,
      }));
    }, 1000); // Update every second
  }, [connectedDevice]);

  const stopReading = useCallback(() => {
    if (readingInterval.current) {
      clearInterval(readingInterval.current);
      readingInterval.current = null;
    }
    setIsReading(false);
  }, []);

  const disconnect = useCallback(async () => {
    try {
      stopReading();
      
      if (connectedDevice) {
        setConnectedDevice(null);
      }
      
      setObdData(prev => ({
        ...prev,
        isConnected: false,
        error: undefined,
      }));
      
      console.log('Disconnected from OBD device');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }, [connectedDevice, stopReading]);

  return {
    obdData,
    isScanning,
    isConnecting,
    connectedDevice,
    availableDevices,
    scanForDevices,
    connectToDevice,
    disconnect,
    startReading,
    stopReading,
    isReading,
  };
};