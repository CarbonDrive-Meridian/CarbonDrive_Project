import { Loader } from '@googlemaps/js-api-loader';

// Configuração da API
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDIWFC7NNCZtYQvw8Y21aTe3YZdWNCUBLw';

// Interfaces para tipos de dados
interface Location {
  lat: number;
  lng: number;
}

interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number; // em metros
  };
  duration: {
    text: string;
    value: number; // em segundos
  };
  status: string;
}

interface CarbonEmissionData {
  transportMode: TransportMode;
  distance: number; // em metros
  carbonEmitted: number; // em kg CO2
  carbonSaved: number; // em kg CO2 (comparado ao carro)
  fuelSaved: number; // em litros
}

// Enum para modos de transporte
enum TransportMode {
  CAR = 'car',
  BICYCLE = 'bicycle',
  WALKING = 'walking',
  PUBLIC_TRANSPORT = 'public_transport',
  MOTORCYCLE = 'motorcycle'
}

// Classe principal para gerenciar cálculos de distância e emissões
class DistanceMatrixService {
  private loader: Loader;
  private service: google.maps.DistanceMatrixService | null = null;
  private isInitialized = false;

  constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['geometry', 'places']
    });
  }

  // Inicializar o serviço Google Maps
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loader.load();
      this.service = new google.maps.DistanceMatrixService();
      this.isInitialized = true;
    } catch (error) {
      console.error('Erro ao carregar Google Maps API:', error);
      throw new Error('Falha ao inicializar o serviço de mapas');
    }
  }

  // Calcular distância e duração entre dois pontos
  async calculateDistance(
    origin: Location,
    destination: Location,
    travelMode: string = 'DRIVING'
  ): Promise<DistanceMatrixResult> {
    if (!this.service) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.service!.getDistanceMatrix({
        origins: [{ lat: origin.lat, lng: origin.lng }],
        destinations: [{ lat: destination.lat, lng: destination.lng }],
        travelMode: travelMode as any,
        unitSystem: 0, // METRIC
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const element = response.rows[0].elements[0];
          
          if (element.status === 'OK') {
            resolve({
              distance: element.distance!,
              duration: element.duration!,
              status: element.status
            });
          } else {
            reject(new Error(`Erro no cálculo: ${element.status}`));
          }
        } else {
          reject(new Error(`Erro na API: ${status}`));
        }
      });
    });
  }

  // Calcular emissões de carbono baseado no modo de transporte
  calculateCarbonEmissions(distanceInMeters: number, transportMode: TransportMode): CarbonEmissionData {
    const distanceInKm = distanceInMeters / 1000;
    
    // Fatores de emissão (kg CO2 por km)
    const emissionFactors = {
      [TransportMode.CAR]: 0.21, // Carro médio
      [TransportMode.BICYCLE]: 0, // Bicicleta não emite CO2
      [TransportMode.WALKING]: 0, // Caminhada não emite CO2
      [TransportMode.PUBLIC_TRANSPORT]: 0.089, // Transporte público (média)
      [TransportMode.MOTORCYCLE]: 0.113 // Motocicleta
    };

    // Consumo de combustível (litros por km)
    const fuelConsumption = {
      [TransportMode.CAR]: 0.08, // 12.5 km/l
      [TransportMode.BICYCLE]: 0,
      [TransportMode.WALKING]: 0,
      [TransportMode.PUBLIC_TRANSPORT]: 0.035, // Estimativa
      [TransportMode.MOTORCYCLE]: 0.03 // 33 km/l
    };

    const carbonEmitted = distanceInKm * emissionFactors[transportMode];
    const carbonSaved = distanceInKm * (emissionFactors[TransportMode.CAR] - emissionFactors[transportMode]);
    const fuelSaved = distanceInKm * (fuelConsumption[TransportMode.CAR] - fuelConsumption[transportMode]);

    return {
      transportMode,
      distance: distanceInMeters,
      carbonEmitted: Math.max(0, carbonEmitted),
      carbonSaved: Math.max(0, carbonSaved),
      fuelSaved: Math.max(0, fuelSaved)
    };
  }

  // Calcular emissões para uma rota com múltiplos pontos
  async calculateRouteEmissions(
    waypoints: Location[],
    transportMode: TransportMode
  ): Promise<CarbonEmissionData> {
    if (waypoints.length < 2) {
      throw new Error('É necessário pelo menos 2 pontos para calcular uma rota');
    }

    let totalDistance = 0;
    let totalCarbonEmitted = 0;
    let totalCarbonSaved = 0;
    let totalFuelSaved = 0;

    // Mapear modo de transporte para Google Maps TravelMode
    const travelModeMap = {
      [TransportMode.CAR]: 'DRIVING',
      [TransportMode.BICYCLE]: 'BICYCLING',
      [TransportMode.WALKING]: 'WALKING',
      [TransportMode.PUBLIC_TRANSPORT]: 'TRANSIT',
      [TransportMode.MOTORCYCLE]: 'DRIVING'
    };

    const travelMode = travelModeMap[transportMode];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];

      try {
        const distanceResult = await this.calculateDistance(from, to, travelMode);
        const emissions = this.calculateCarbonEmissions(distanceResult.distance.value, transportMode);

        totalDistance += distanceResult.distance.value;
        totalCarbonEmitted += emissions.carbonEmitted;
        totalCarbonSaved += emissions.carbonSaved;
        totalFuelSaved += emissions.fuelSaved;
      } catch (error) {
        console.error(`Erro ao calcular segmento ${i + 1}:`, error);
        throw error;
      }
    }

    return {
      transportMode,
      distance: totalDistance,
      carbonEmitted: totalCarbonEmitted,
      carbonSaved: totalCarbonSaved,
      fuelSaved: totalFuelSaved
    };
  }

  // Comparar diferentes modos de transporte para uma rota
  async compareTransportModes(
    origin: Location,
    destination: Location
  ): Promise<{
    [key in TransportMode]: {
      emissions: CarbonEmissionData;
      available: boolean;
    };
  }> {
    const results: {
      [key in TransportMode]: {
        emissions: CarbonEmissionData;
        available: boolean;
      };
    } = {} as any;
    
    const modes = [
      { mode: TransportMode.CAR, travelMode: 'DRIVING' },
      { mode: TransportMode.BICYCLE, travelMode: 'BICYCLING' },
      { mode: TransportMode.WALKING, travelMode: 'WALKING' },
      { mode: TransportMode.PUBLIC_TRANSPORT, travelMode: 'TRANSIT' }
    ];

    for (const { mode, travelMode } of modes) {
      try {
        const distance = await this.calculateDistance(origin, destination, travelMode);
        const emissions = this.calculateCarbonEmissions(distance.distance.value, mode);
        
        results[mode] = {
          emissions,
          available: true
        };
      } catch (error) {
        console.warn(`Modo ${mode} não disponível:`, error);
        results[mode] = {
          emissions: {
            transportMode: mode,
            distance: 0,
            carbonEmitted: 0,
            carbonSaved: 0,
            fuelSaved: 0
          },
          available: false
        };
      }
    }

    return results;
  }

  // Converter coordenadas em endereço
  async getAddressFromCoordinates(location: Location): Promise<string> {
    if (!this.service) {
      await this.initialize();
    }

    const geocoder = new (window as any).google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { location: { lat: location.lat, lng: location.lng } },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error(`Erro no geocoding: ${status}`));
          }
        }
      );
    });
  }
}

// Exportar instância singleton
export const distanceMatrixService = new DistanceMatrixService();
export { TransportMode, type Location, type DistanceMatrixResult, type CarbonEmissionData };