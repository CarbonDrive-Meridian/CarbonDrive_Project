import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  accuracy?: number;
}

interface MovementData {
  isMoving: boolean;
  speed: number; // km/h
  acceleration: number; // m/s²
  isBraking: boolean;
  distance: number; // metros
}

interface MovementSession {
  startTime: number;
  endTime?: number;
  totalDistance: number;
  totalCarbonSaved: number;
  totalTokensEarned: number;
  brakeEvents: number;
  smoothDrivingScore: number;
}

export const useMovementDetection = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentMovement, setCurrentMovement] = useState<MovementData | null>(null);
  const [session, setSession] = useState<MovementSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Refs para manter estado entre renders
  const sessionRef = useRef<MovementSession | null>(null);
  const watchId = useRef<number | null>(null);
  const previousLocation = useRef<LocationData | null>(null);
  const smoothDrivingEvents = useRef<number[]>([]);
  const lastBrakeTime = useRef<number>(0);
  
  // Configurações
  const MIN_SPEED_THRESHOLD = 5; // km/h
  const BRAKE_THRESHOLD = -2; // m/s²
  const BRAKE_COOLDOWN = 3000; // ms
  const CARBON_FACTOR = 0.12; // kg CO² por km
  const CDRIVE_PER_KG_CO2 = 1.0; // $CDRIVE por kg CO²

  // Calcular distância usando fórmula de Haversine
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Raio da Terra em metros
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  // Calcular dados de movimento
  const calculateMovement = useCallback((previous: LocationData, current: LocationData): MovementData => {
    const timeDiff = (current.timestamp - previous.timestamp) / 1000; // segundos
    
    const distance = calculateDistance(
      previous.latitude, previous.longitude,
      current.latitude, current.longitude
    );

    // Calcular velocidade (km/h)
    const speed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0;

    // Calcular aceleração (m/s²)
    const previousSpeed = (previous.speed || 0) * 3.6; // converter para km/h
    const acceleration = timeDiff > 0 ? ((speed - previousSpeed) / 3.6) / timeDiff : 0;

    // Determinar se está se movendo
    const isMoving = speed > MIN_SPEED_THRESHOLD;

    // Determinar se está freando
    const isBraking = acceleration < BRAKE_THRESHOLD && isMoving;

    return {
      isMoving,
      speed: Math.max(0, speed),
      acceleration,
      isBraking,
      distance
    };
  }, [BRAKE_THRESHOLD, calculateDistance]);

  // Processar atualização de localização
  const handleLocationUpdate = useCallback((position: GeolocationPosition) => {
    const currentLocation: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      speed: position.coords.speed || 0,
      accuracy: position.coords.accuracy
    };

    if (previousLocation.current && sessionRef.current) {
      const movementData = calculateMovement(previousLocation.current, currentLocation);
      setCurrentMovement(movementData);

      // Atualizar sessão
      const distanceKm = movementData.distance / 1000;
      const carbonSaved = distanceKm * CARBON_FACTOR;
      const tokensEarned = carbonSaved * CDRIVE_PER_KG_CO2;

      let brakeEvents = sessionRef.current.brakeEvents;
      const currentTime = Date.now();

      // Detectar frenagem (com cooldown)
      if (movementData.isBraking && (currentTime - lastBrakeTime.current) > BRAKE_COOLDOWN) {
        brakeEvents += 1;
        lastBrakeTime.current = currentTime;
        
        toast({
          title: "Frenagem Detectada! 🚗",
          description: "Tente manter uma condução mais suave para ganhar mais tokens",
          duration: 2000,
        });
      }

      // Calcular pontuação de condução suave
      smoothDrivingEvents.current.push(Math.abs(movementData.acceleration));
      if (smoothDrivingEvents.current.length > 10) {
        smoothDrivingEvents.current.shift();
      }
      
      const avgAcceleration = smoothDrivingEvents.current.reduce((a, b) => a + b, 0) / smoothDrivingEvents.current.length;
      const smoothDrivingScore = Math.max(0, 100 - (avgAcceleration * 10));

      const updatedSession = {
        ...sessionRef.current,
        totalDistance: sessionRef.current.totalDistance + distanceKm,
        totalCarbonSaved: sessionRef.current.totalCarbonSaved + carbonSaved,
        totalTokensEarned: sessionRef.current.totalTokensEarned + tokensEarned,
        brakeEvents,
        smoothDrivingScore
      };

      sessionRef.current = updatedSession;
      setSession(updatedSession);
    }

    previousLocation.current = currentLocation;
  }, [toast, calculateMovement]);

  // Iniciar rastreamento
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocalização não suportada pelo navegador';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setError(null);
      
      const newSession: MovementSession = {
        startTime: Date.now(),
        totalDistance: 0,
        totalCarbonSaved: 0,
        totalTokensEarned: 0,
        brakeEvents: 0,
        smoothDrivingScore: 100
      };
      
      sessionRef.current = newSession;
      setSession(newSession);
      
      // Resetar arrays de controle
      smoothDrivingEvents.current = [];
      lastBrakeTime.current = 0;

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      };

      // Iniciar rastreamento de geolocalização
      watchId.current = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        (error) => {
          console.error('Erro de geolocalização:', error);
          setError(error.message);
          toast({
            title: "Erro de Localização",
            description: error.message,
            variant: "destructive",
          });
        },
        options
      );
      
      setIsTracking(true);
      
      toast({
        title: "Rastreamento Iniciado! 🌱",
        description: "Comece a dirigir para ganhar $CDRIVE tokens",
        duration: 3000,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      
      toast({
        title: "Erro ao Iniciar Rastreamento",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [handleLocationUpdate, toast]);

  // Parar rastreamento
  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    if (sessionRef.current) {
      const finalSession = {
        ...sessionRef.current,
        endTime: Date.now()
      };
      
      sessionRef.current = finalSession;
      setSession(finalSession);
      
      // Mostrar resumo da sessão
      toast({
        title: "Sessão Finalizada! 🎉",
        description: `Você ganhou ${finalSession.totalTokensEarned.toFixed(2)} $CDRIVE tokens!`,
        duration: 5000,
      });
    }
    
    setIsTracking(false);
    setCurrentMovement(null);
    previousLocation.current = null;
  }, [toast]);

  // Limpar ao desmontar componente
  useEffect(() => {
    return () => {
      if (isTracking && watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isTracking]);

  return {
    isTracking,
    currentMovement,
    session,
    startTracking,
    stopTracking,
    error
  };
};