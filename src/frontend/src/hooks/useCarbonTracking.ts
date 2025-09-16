import { useState, useEffect, useCallback } from 'react';
import { distanceMatrixService, TransportMode, type Location, type CarbonEmissionData, type DistanceMatrixResult } from '@/services/distanceMatrix';

interface CarbonTrackingSession {
  isActive: boolean;
  startTime: number | null;
  endTime: number | null;
  startLocation: Location | null;
  currentLocation: Location | null;
  waypoints: Location[];
  transportMode: TransportMode;
  totalDistance: number;
  totalDuration: number;
  totalCarbonEmitted: number;
  totalCarbonSaved: number;
  totalFuelSaved: number;
  cdriveTokesEarned: number;
}

interface CarbonTrackingHook {
  session: CarbonTrackingSession;
  isTracking: boolean;
  error: string | null;
  startTracking: (transportMode: TransportMode) => Promise<void>;
  stopTracking: () => Promise<CarbonTrackingSession>;
  updateLocation: (location: Location) => void;
  calculateRouteEmissions: () => Promise<void>;
  compareTransportModes: (destination: Location) => Promise<{
    [key in TransportMode]?: {
      distance: DistanceMatrixResult;
      emissions: CarbonEmissionData;
      available: boolean;
    };
  }>;
  resetSession: () => void;
}

const initialSession: CarbonTrackingSession = {
  isActive: false,
  startTime: null,
  endTime: null,
  startLocation: null,
  currentLocation: null,
  waypoints: [],
  transportMode: TransportMode.CAR,
  totalDistance: 0,
  totalDuration: 0,
  totalCarbonEmitted: 0,
  totalCarbonSaved: 0,
  totalFuelSaved: 0,
  cdriveTokesEarned: 0
};

export const useCarbonTracking = (): CarbonTrackingHook => {
  const [session, setSession] = useState<CarbonTrackingSession>(initialSession);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Inicializar serviço Distance Matrix
  useEffect(() => {
    const initService = async () => {
      try {
        await distanceMatrixService.initialize();
      } catch (err) {
        setError('Erro ao inicializar serviço de distância');
        console.error(err);
      }
    };
    
    initService();
  }, []);

  // Função para obter localização atual
  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Erro de geolocalização: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Atualizar localização atual
  const updateLocation = useCallback((newLocation: Location) => {
    setSession(prevSession => {
      if (!prevSession.isActive) return prevSession;

      // Verificar se a nova localização é significativamente diferente
      const lastLocation = prevSession.currentLocation;
      if (lastLocation) {
        const distance = calculateDistance(lastLocation, newLocation);
        // Só adicionar se a distância for maior que 10 metros
        if (distance < 10) return prevSession;
      }

      return {
        ...prevSession,
        currentLocation: newLocation,
        waypoints: [...prevSession.waypoints, newLocation]
      };
    });
  }, []);

  // Calcular distância entre dois pontos (fórmula de Haversine)
  const calculateDistance = (point1: Location, point2: Location): number => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Iniciar rastreamento
  const startTracking = useCallback(async (transportMode: TransportMode) => {
    try {
      setError(null);
      const startLocation = await getCurrentLocation();
      
      const newSession: CarbonTrackingSession = {
        ...initialSession,
        isActive: true,
        startTime: Date.now(),
        startLocation,
        currentLocation: startLocation,
        waypoints: [startLocation],
        transportMode
      };

      setSession(newSession);
      setIsTracking(true);

      // Iniciar monitoramento contínuo da localização
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation: Location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            updateLocation(newLocation);
          },
          (error) => {
            console.error('Erro no rastreamento:', error);
            setError(`Erro no rastreamento: ${error.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 1000
          }
        );
        setWatchId(id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao iniciar rastreamento:', err);
    }
  }, [updateLocation]);

  // Parar rastreamento
  const stopTracking = useCallback(async (): Promise<CarbonTrackingSession> => {
    try {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }

      const endTime = Date.now();
      const finalSession = {
        ...session,
        isActive: false,
        endTime
      };

      // Calcular emissões finais se houver waypoints suficientes
      if (session.waypoints.length > 1) {
        const routeData = await distanceMatrixService.calculateRouteEmissions(
          session.waypoints,
          session.transportMode
        );

        finalSession.totalDistance = routeData.totalDistance;
        finalSession.totalDuration = routeData.totalDuration;
        finalSession.totalCarbonEmitted = routeData.totalCarbonEmitted;
        finalSession.totalCarbonSaved = routeData.totalCarbonSaved;
        finalSession.totalFuelSaved = routeData.totalFuelSaved;
        
        // Calcular tokens CDRIVE baseado no carbono economizado
        // 1 kg CO2 economizado = 1 CDRIVE token
        finalSession.cdriveTokesEarned = Math.round(routeData.totalCarbonSaved * 100) / 100;
      }

      setSession(finalSession);
      setIsTracking(false);
      
      return finalSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao parar rastreamento');
      console.error('Erro ao parar rastreamento:', err);
      throw err;
    }
  }, [session, watchId]);

  // Calcular emissões da rota atual
  const calculateRouteEmissions = useCallback(async () => {
    if (session.waypoints.length < 2) return;

    try {
      const routeData = await distanceMatrixService.calculateRouteEmissions(
        session.waypoints,
        session.transportMode
      );

      setSession(prevSession => ({
        ...prevSession,
        totalDistance: routeData.totalDistance,
        totalDuration: routeData.totalDuration,
        totalCarbonEmitted: routeData.totalCarbonEmitted,
        totalCarbonSaved: routeData.totalCarbonSaved,
        totalFuelSaved: routeData.totalFuelSaved,
        cdriveTokesEarned: Math.round(routeData.totalCarbonSaved * 100) / 100
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular emissões');
      console.error('Erro ao calcular emissões:', err);
    }
  }, [session.waypoints, session.transportMode]);

  // Comparar diferentes modos de transporte
  const compareTransportModes = useCallback(async (destination: Location) => {
    if (!session.currentLocation) {
      throw new Error('Localização atual não disponível');
    }

    try {
      return await distanceMatrixService.compareTransportModes(
        session.currentLocation,
        destination
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao comparar transportes');
      throw err;
    }
  }, [session.currentLocation]);

  // Resetar sessão
  const resetSession = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setSession(initialSession);
    setIsTracking(false);
    setError(null);
  }, [watchId]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    session,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateLocation,
    calculateRouteEmissions,
    compareTransportModes,
    resetSession
  };
};