import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Bike, 
  PersonStanding, 
  Bus, 
  Leaf,
  Fuel,
  Clock
} from 'lucide-react';
import { TransportMode } from '@/services/distanceMatrix';

interface TransportOption {
  mode: TransportMode;
  name: string;
  icon: React.ReactNode;
  description: string;
  emissionFactor: number; // kg CO2/km
  color: string;
  benefits: string[];
}

const transportOptions: TransportOption[] = [
  {
    mode: TransportMode.BICYCLE,
    name: 'Bicicleta',
    icon: <Bike className="h-6 w-6" />,
    description: 'Zero emissões, exercício físico',
    emissionFactor: 0.0,
    color: 'bg-green-500',
    benefits: ['Zero CO₂', 'Exercício', 'Economia total']
  },
  {
    mode: TransportMode.WALKING,
    name: 'Caminhada',
    icon: <PersonStanding className="h-6 w-6" />,
    description: 'Zero emissões, saúde em primeiro lugar',
    emissionFactor: 0.0,
    color: 'bg-green-600',
    benefits: ['Zero CO₂', 'Saúde', 'Gratuito']
  },
  {
    mode: TransportMode.PUBLIC_TRANSPORT,
    name: 'Transporte Público',
    icon: <Bus className="h-6 w-6" />,
    description: 'Baixas emissões compartilhadas',
    emissionFactor: 0.089,
    color: 'bg-blue-500',
    benefits: ['Baixo CO₂', 'Econômico', 'Social']
  },
  {
    mode: TransportMode.MOTORCYCLE,
    name: 'Motocicleta',
    icon: <Bike className="h-6 w-6" />,
    description: 'Emissões moderadas, ágil no trânsito',
    emissionFactor: 0.113,
    color: 'bg-orange-500',
    benefits: ['Ágil', 'Econômico', 'Compacto']
  },
  {
    mode: TransportMode.CAR,
    name: 'Carro',
    icon: <Car className="h-6 w-6" />,
    description: 'Maior emissão, máximo conforto',
    emissionFactor: 0.21,
    color: 'bg-red-500',
    benefits: ['Conforto', 'Privacidade', 'Capacidade']
  }
];

interface TransportModeSelectorProps {
  selectedMode: TransportMode;
  onModeSelect: (mode: TransportMode) => void;
  disabled?: boolean;
  showEmissions?: boolean;
  onStartJourney?: () => Promise<void>;
  onCancel?: () => void;
}

export const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  disabled = false,
  showEmissions = true,
  onStartJourney,
  onCancel
}) => {
  const getEmissionLevel = (factor: number) => {
    if (factor === 0) return { level: 'Zero', color: 'bg-green-100 text-green-800' };
    if (factor < 0.1) return { level: 'Baixo', color: 'bg-blue-100 text-blue-800' };
    if (factor < 0.15) return { level: 'Médio', color: 'bg-orange-100 text-orange-800' };
    return { level: 'Alto', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Escolha seu Meio de Transporte</h3>
        <p className="text-sm text-muted-foreground">
          Selecione como você pretende se locomover para calcular as emissões de carbono
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transportOptions.map((option) => {
          const isSelected = selectedMode === option.mode;
          const emission = getEmissionLevel(option.emissionFactor);
          
          return (
            <Card 
              key={option.mode}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-md' 
                  : 'hover:ring-1 hover:ring-muted-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onModeSelect(option.mode)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${option.color} text-white`}>
                      {option.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{option.name}</CardTitle>
                      {showEmissions && (
                        <Badge variant="secondary" className={emission.color}>
                          {emission.level} CO₂
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="mb-3">
                  {option.description}
                </CardDescription>
                
                {showEmissions && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span>{option.emissionFactor} kg CO₂/km</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {option.benefits.map((benefit, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showEmissions && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium">Como calculamos as emissões?</h4>
                <p className="text-sm text-muted-foreground">
                  Utilizamos fatores de emissão padrão da indústria para cada meio de transporte. 
                  Os valores são calculados em kg de CO₂ por quilômetro percorrido.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-orange-500" />
                    <span>Combustível economizado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Tempo de viagem estimado</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons when used in modal */}
      {(onStartJourney || onCancel) && (
        <div className="flex gap-3 mt-6">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          {onStartJourney && (
            <Button 
              onClick={onStartJourney}
              className="flex-1"
              disabled={disabled}
            >
              Iniciar Jornada
            </Button>
          )}
        </div>
      )}
    </div>
  );
};