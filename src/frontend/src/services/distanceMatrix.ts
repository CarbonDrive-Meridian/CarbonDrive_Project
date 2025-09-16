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

// Tipos de transporte e suas emissões (kg CO2 por km)
enum TransportMode {
  CAR = 'car',
  BICYCLE = 'bicycle',
  WALKING = 'walking',
  PUBLIC_TRANSPORT = 'public_transport',
  MOTORCYCLE = 'motorcycle'
}

const EMISSION_FACTORS = {
  [TransportMode.CAR]: 0.21, // kg CO2/km
  [TransportMode.BICYCLE]: 0.0, // kg CO2/km
  [TransportMode.WALKING]: 0.0, // kg CO2/km
  [TransportMode.PUBLIC_TRANSPORT]: 0.089, // kg CO2/km
  [TransportMode.MOTORCYCLE]: 0.113 // kg CO2/km
};

class DistanceMatrixService {
  private loader: Loader;
  private service: google.maps.DistanceMatrixService | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['geometry']
    });
  }

  // Inicializar o serviço
  async initialize(): Promise<void> {
    try {
      await this.loader.load();
      this.service = new google.maps.DistanceMatrixService();
    } catch (error) {
      console.error('Erro ao inicializar Distance Matrix Service:', error);
      throw error;
    }
  }

  // Calcular distância e duração entre dois pontos
  async calculateDistance(
    origin: Location,
    destination: Location,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<DistanceMatrixResult> {
    if (!this.service) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.service!.getDistanceMatrix({
        origins: [{ lat: origin.lat, lng: origin.lng }],
        destinations: [{ lat: destination.lat, lng: destination.lng }],
        travelMode: travelMode,
        unitSystem: google.maps.UnitSystem.METRIC,
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
  calculateCarbonEmissions(
    distance: number, // em metros
    transportMode: TransportMode
  ): CarbonEmissionData {
    const distanceKm = distance / 1000;
    const emissionFactor = EMISSION_FACTORS[transportMode];
    const carEmissionFactor = EMISSION_FACTORS[TransportMode.CAR];
    
    const carbonEmitted = distanceKm * emissionFactor;
    const carCarbonEmitted = distanceKm * carEmissionFactor;
    const carbonSaved = Math.max(0, carCarbonEmitted - carbonEmitted);
    
    // Cálculo aproximado de combustível economizado (1L gasolina ≈ 2.3kg CO2)
    const fuelSaved = carbonSaved / 2.3;

    return {
      transportMode,
      distance,
      carbonEmitted,
      carbonSaved,
      fuelSaved
    };
  }

  // Calcular rota completa com múltiplos pontos
  async calculateRouteEmissions(
    waypoints: Location[],
    transportMode: TransportMode = TransportMode.CAR
  ): Promise<{
    totalDistance: number;
    totalDuration: number;
    totalCarbonEmitted: number;
    totalCarbonSaved: number;
    totalFuelSaved: number;
    segments: Array<{
      from: Location;
      to: Location;
      distance: DistanceMatrixResult;
      emissions: CarbonEmissionData;
    }>;
  }> {
    const segments = [];
    let totalDistance = 0;
    let totalDuration = 0;
    let totalCarbonEmitted = 0;
    let totalCarbonSaved = 0;
    let totalFuelSaved = 0;

    // Mapear modo de transporte para Google Maps TravelMode
    const travelModeMap = {
      [TransportMode.CAR]: google.maps.TravelMode.DRIVING,
      [TransportMode.BICYCLE]: google.maps.TravelMode.BICYCLING,
      [TransportMode.WALKING]: google.maps.TravelMode.WALKING,
      [TransportMode.PUBLIC_TRANSPORT]: google.maps.TravelMode.TRANSIT,
      [TransportMode.MOTORCYCLE]: google.maps.TravelMode.DRIVING
    };

    const travelMode = travelModeMap[transportMode];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];

      try {
        const distanceResult = await this.calculateDistance(from, to, travelMode);
        const emissions = this.calculateCarbonEmissions(
          distanceResult.distance.value,
          transportMode
        );

        segments.push({
          from,
          to,
          distance: distanceResult,
          emissions
        });

        totalDistance += distanceResult.distance.value;
        totalDuration += distanceResult.duration.value;
        totalCarbonEmitted += emissions.carbonEmitted;
        totalCarbonSaved += emissions.carbonSaved;
        totalFuelSaved += emissions.fuelSaved;

      } catch (error) {
        console.error(`Erro ao calcular segmento ${i}:`, error);
        throw error;
      }
    }

    return {
      totalDistance,
      totalDuration,
      totalCarbonEmitted,
      totalCarbonSaved,
      totalFuelSaved,
      segments
    };
  }

  // Comparar diferentes modos de transporte para a mesma rota
  async compareTransportModes(
    origin: Location,
    destination: Location
  ): Promise<{
    [key in TransportMode]?: {
      distance: DistanceMatrixResult;
      emissions: CarbonEmissionData;
      available: boolean;
    };
  }> {
    const results: any = {};
    
    const modes = [
      { mode: TransportMode.CAR, travelMode: google.maps.TravelMode.DRIVING },
      { mode: TransportMode.BICYCLE, travelMode: google.maps.TravelMode.BICYCLING },
      { mode: TransportMode.WALKING, travelMode: google.maps.TravelMode.WALKING },
      { mode: TransportMode.PUBLIC_TRANSPORT, travelMode: google.maps.TravelMode.TRANSIT }
    ];

    for (const { mode, travelMode } of modes) {
      try {
        const distance = await this.calculateDistance(origin, destination, travelMode);
        const emissions = this.calculateCarbonEmissions(distance.distance.value, mode);
        
        results[mode] = {
          distance,
          emissions,
          available: true
        };
      } catch (error) {
        console.warn(`Modo ${mode} não disponível:`, error);
        results[mode] = {
          distance: null,
          emissions: null,
          available: false
        };
      }
    }

    return results;
  }

  // Converter coordenadas para endereço (geocoding reverso)
  async getAddressFromCoordinates(location: Location): Promise<string> {
    if (!this.service) {
      await this.initialize();
    }

    const geocoder = new google.maps.Geocoder();
    
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