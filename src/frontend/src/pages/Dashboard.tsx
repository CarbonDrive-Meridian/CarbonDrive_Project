import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Car, 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Play, 
  Square,
  User,
  Settings,
  LogOut,
  Gauge,
  Zap,
  Trophy,
  Route,
  Fuel
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMovementDetection } from "@/hooks/useMovementDetection";
import { useCarbonTracking } from "@/hooks/useCarbonTracking";
import { TransportModeSelector } from "@/components/TransportModeSelector";
import { TransportMode } from "@/services/distanceMatrix";
import api from "@/services/api"; // Keep your import
        
const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado para dados do usuário
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    user_type: string;
  } | null>(null);
  
  // Hook para detecção de movimento
  const {
    isTracking,
    currentMovement,
    session,
    startTracking,
    stopTracking,
    error: movementError
  } = useMovementDetection();

  // Hook para rastreamento de carbono com Distance Matrix API
  const {
    session: carbonSession,
    isTracking: isCarbonTracking,
    error: carbonError,
    startTracking: startCarbonTracking,
    stopTracking: stopCarbonTracking,
    calculateRouteEmissions,
    resetSession: resetCarbonSession
  } = useCarbonTracking();
  
  // Estados locais
  const [driverBalance, setDriverBalance] = useState(0.0);
  const [dailyEarnings] = useState(0);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState<TransportMode>(TransportMode.CAR);
  const [showTransportSelector, setShowTransportSelector] = useState(false);
  const [sessionData, setSessionData] = useState({
    carbonSaved: 0,
    tokensEarned: 0,
    kilometersDriven: 0
  });

  // Atualizar saldo quando a sessão de movimento terminar
  useEffect(() => {
    if (session && session.endTime && session.totalTokensEarned > 0) {
      setDriverBalance(prev => prev + session.totalTokensEarned);
      setSessionData({
        carbonSaved: session.totalCarbonSaved,
        tokensEarned: session.totalTokensEarned,
        kilometersDriven: session.totalDistance
      });
    }
  }, [session]);

  // State for dynamic dollar rate
  const [dollarRate, setDollarRate] = useState(5.50); // Default value
  const [cdriveToBrlcRate, setCdriveToBrlcRate] = useState(0.275); // 1 $CDRIVE = 0.05 USD convertido para BRL
  
  // Buscar dados do perfil do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      // Primeiro, tentar carregar do localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUserProfile(userData);
        } catch (error) {
          console.error("Erro ao carregar dados do localStorage:", error);
        }
      }

      // Depois, buscar dados atualizados da API
      try {
        const response = await api.get('/auth/profile');
        setUserProfile(response.data);
        // Atualizar localStorage com dados mais recentes
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error: any) {
        console.error("Erro ao carregar perfil do usuário:", error);
        // Se não conseguir carregar o perfil, redirecionar para login
        if (error.response?.status === 401) {
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Fetch dollar rate when component loads
  useEffect(() => {
    const fetchDollarRate = async () => {
      try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.USDBRL && data.USDBRL.bid) {
          const rate = parseFloat(data.USDBRL.bid);
          setDollarRate(rate);
          setCdriveToBrlcRate(rate * 0.05); // 1 $CDRIVE = 0.05 USD = (rate * 0.05) BRL
        } else {
          // Use default values if API response is invalid
          console.warn('API response inválida, usando valores padrão');
          setDollarRate(5.50); // Default BRL/USD rate
          setCdriveToBrlcRate(0.275); // 5.50 * 0.05
        }
      } catch (error) {
        console.warn('Erro ao buscar cotação do dólar:', error);
        // Use default values in case of error
        setDollarRate(5.50); // Default BRL/USD rate
        setCdriveToBrlcRate(0.275); // 5.50 * 0.05
      }
    };
    
    fetchDollarRate();
    // Update exchange rate every 5 minutes
    const interval = setInterval(fetchDollarRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Rate: 1 $CDRIVE = R$ 0.20 (B2C Example)
  // Centralized conversion settings



  const handleEcoSimulation = async () => {
    // Get authentication token
    const token = localStorage.getItem('jwt');
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You need to be logged in to start a journey.",
        variant: "destructive",
      });
      navigate('/login'); // Redirect to login if no token
      return;
    }

    if (!isTracking && !isCarbonTracking) {
      // Mostrar seletor de transporte antes de iniciar
      setShowTransportSelector(true);
    } else {
      // END the journey
      try {
        const carbonResult = await stopCarbonTracking();
        stopTracking();
        setIsJourneyActive(false);
        
        // Atualizar saldo com tokens ganhos
        if (carbonResult.cdriveTokesEarned > 0) {
          setDriverBalance(prev => prev + carbonResult.cdriveTokesEarned);
          
          toast({
            title: "Jornada Concluída!",
            description: `Você ganhou ${carbonResult.cdriveTokesEarned.toFixed(2)} $CDRIVE tokens e economizou ${carbonResult.totalCarbonSaved.toFixed(2)} kg de CO₂!`,
          });
        }
      } catch (error) {
        console.error("Error stopping journey:", error);
        stopTracking();
        setIsJourneyActive(false);
      }
    }
  };

  const handleStartJourney = async () => {
    try {
      // Iniciar ambos os sistemas de rastreamento
      await Promise.all([
        startTracking(),
        startCarbonTracking(selectedTransportMode)
      ]);
      
      setIsJourneyActive(true);
      setShowTransportSelector(false);
      
      toast({
        title: "Jornada Iniciada!",
        description: `Rastreamento ativo com ${selectedTransportMode}. Dirija de forma eco-consciente para ganhar mais tokens!`,
      });
    } catch (error) {
      console.error("Error starting journey:", error);
      toast({
        title: "Erro ao Iniciar Jornada",
        description: "Não foi possível iniciar o rastreamento. Verifique as permissões de localização.",
        variant: "destructive",
      });
    }
  };

  const handlePixExchange = async () => {
    try {
      const response = await api.post(
        `/motorista/trocar-cdr-por-pix`,
        { amount: driverBalance }, // Or the specific amount the user wants to exchange
      );

      // Update local balance (in a real app, you would fetch from server)
      setDriverBalance(0);

      toast({
        title: "Exchange Completed!",
        description: `R$ ${response.data.amount_brl.toFixed(2)} was sent to your PIX key`,
      });

    } catch (error: any) {
      console.error("PIX exchange error:", error);
      const errorMessage = error.response?.data?.error || "Transaction error. Please try again.";
      toast({
        title: "Exchange Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">CarbonDrive</h1>
              <p className="text-sm text-muted-foreground">Sustainable Driving</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 hover:bg-muted px-3 py-2 rounded-lg transition-colors">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{userProfile?.name || "Usuário"}</span>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Balance Panel */}
        <Card className="bg-primary text-primary-foreground overflow-hidden">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-primary-foreground/80 text-sm mb-2">Earn tokens for sustainable driving</p>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {driverBalance.toFixed(1)} $CDRIVE
                  </div>
                  <div className="text-primary-foreground/90 text-lg">
                    = R$ {(driverBalance * cdriveToBrlcRate).toFixed(2)}
                  </div>
                  <div className="text-primary-foreground/70 text-sm">
                    1kg CO² = 1 $CDRIVE = R$ {cdriveToBrlcRate.toFixed(3)} (1 $CDRIVE = 0.05 USD)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-accent">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">+{dailyEarnings.toFixed(1)} today</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleEcoSimulation}
            variant="eco" 
            size="eco" 
            className="h-16 text-lg"
            disabled={!!movementError}
          >
            {isTracking || isCarbonTracking ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            {isTracking || isCarbonTracking ? "Stop Journey" : "Start Eco Journey"}
          </Button>
          
          <Button 
            onClick={handlePixExchange}
            variant="secondary" 
            size="eco" 
            className="h-16 text-lg"
          >
            <DollarSign className="h-6 w-6" />
            Exchange to BRL (PIX)
          </Button>
        </div>

        {/* Transport Mode Selector Modal */}
        {showTransportSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Selecione seu Meio de Transporte</h3>
              <TransportModeSelector
                selectedMode={selectedTransportMode}
                onModeSelect={setSelectedTransportMode}
                onStartJourney={handleStartJourney}
                onCancel={() => setShowTransportSelector(false)}
              />
            </div>
          </div>
        )}

        {/* Carbon Tracking Info */}
        {(isTracking || isCarbonTracking) && carbonSession && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Rastreamento de Carbono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {carbonSession.totalDistance.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">km percorridos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {carbonSession.totalCarbonEmitted.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">kg CO₂ emitido</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {carbonSession.totalCarbonSaved.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">kg CO₂ economizado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {carbonSession.cdriveTokesEarned.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">$CDRIVE ganhos</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Fuel className="h-4 w-4" />
                Modo: {selectedTransportMode}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rewards Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/rewards')}
            variant="outline" 
            size="lg" 
            className="flex items-center gap-2"
          >
            <Trophy className="h-5 w-5" />
            Ver Recompensas e Conquistas
          </Button>
        </div>

        {/* Journey Summary (conditional) */}
        {isTracking ? (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-2">
                <Gauge className="h-6 w-6 animate-pulse" />
                Journey Active - Real-time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-muted-foreground flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-500" /> Carbon Saved
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {session?.totalCarbonSaved.toFixed(3) || '0.000'} kg
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-500" /> Distance
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {session?.totalDistance.toFixed(2) || '0.00'} km
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yellow-500" /> Earning
                </p>
                <p className="text-2xl font-bold text-yellow-700">
                  {session?.totalTokensEarned.toFixed(3) || '0.000'} $CDRIVE
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" /> Brake Events
                </p>
                <p className="text-2xl font-bold text-purple-700">
                  {session?.brakeEvents || 0}
                </p>
              </div>
              {currentMovement && (
                <div className="md:col-span-4 mt-4 p-4 bg-white rounded-lg border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={currentMovement.isMoving ? "default" : "secondary"} className="ml-2">
                        {currentMovement.isMoving ? "Moving" : "Stopped"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speed:</span>
                      <span className="ml-2 font-semibold">{currentMovement.speed.toFixed(1)} km/h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Acceleration:</span>
                      <span className="ml-2 font-semibold">{currentMovement.acceleration.toFixed(2)} m/s²</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Braking:</span>
                      <Badge variant={currentMovement.isBraking ? "destructive" : "outline"} className="ml-2">
                        {currentMovement.isBraking ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          (sessionData.tokensEarned > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-accent">Your Journey Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" /> Carbon Saved
                  </p>
                  <p className="text-3xl font-bold">{sessionData.carbonSaved.toFixed(2)} kg</p>
                  <p className="text-sm text-muted-foreground">= {sessionData.carbonSaved.toFixed(2)} $CDRIVE</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-500" /> KM Traveled
                  </p>
                  <p className="text-3xl font-bold">{sessionData.kilometersDriven.toFixed(1)} km</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-500" /> $CDRIVE Earnings
                  </p>
                  <p className="text-3xl font-bold text-accent">{sessionData.tokensEarned.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma Transação</h3>
              <p className="text-muted-foreground">
                Suas transações aparecerão aqui quando você começar a dirigir
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
  
export default Dashboard;