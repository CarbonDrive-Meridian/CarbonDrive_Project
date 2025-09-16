import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  Zap,
  User,
  ChevronDown,
  Clock,
  Bolt,
  Car,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api"; // Keep your import
        
const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Estado para dados vindos da API
  const [driverBalance, setDriverBalance] = useState(247.5);
  const [dailyEarnings] = useState(15.5);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [sessionData, setSessionData] = useState({
    carbonSaved: 0,
    tokensEarned: 0,
    kilometersDriven: 0
  });

  // State for dynamic dollar rate
  const [dollarRate, setDollarRate] = useState(5.50); // Default value
  const [cdriveToBrlcRate, setCdriveToBrlcRate] = useState(0.275); // 1 $CDRIVE = 0.05 USD convertido para BRL
  
  // Fetch dollar rate when component loads
  useEffect(() => {
    const fetchDollarRate = async () => {
      try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        const data = await response.json();
        if (data.USDBRL && data.USDBRL.bid) {
          const rate = parseFloat(data.USDBRL.bid);
          setDollarRate(rate);
          setCdriveToBrlcRate(rate * 0.05); // 1 $CDRIVE = 0.05 USD = (rate * 0.05) BRL
        }
      } catch (error) {
        console.warn('Erro ao buscar cotação do dólar:', error);
        // Keep default values in case of error
      }
    };
    
    fetchDollarRate();
    // Update exchange rate every 5 minutes
    const interval = setInterval(fetchDollarRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Rate: 1 $CDRIVE = R$ 0.20 (B2C Example)
  // Centralized conversion settings

  // Sample transactions, will be replaced by real API data
  const [transactions] = useState([
    { id: 1, date: "15/09/2024", time: "14:30", description: "Eco-driving - Downtown Route", amount: 8.5 },
    { id: 2, date: "15/09/2024", time: "12:15", description: "Eco-driving - North Route", amount: 7.0 },
    { id: 3, date: "14/09/2024", time: "18:45", description: "PIX Exchange", amount: -50.0 },
    { id: 4, date: "14/09/2024", time: "16:20", description: "Eco-driving - South Route", amount: 9.2 },
  ]);

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

    if (!isJourneyActive) {
      // START the journey
      setIsJourneyActive(true);
      toast({
        title: "Journey Started!",
        description: "We are now monitoring your driving.",
      });
    } else {
      // END the journey and call API to calculate earnings
      try {
        const response = await api.post(
          `/motorista/eco-conducao`,
          {},
        );

        const { carbonSaved, sessionTokens, kilometersDriven } = response.data;

        // Update states with real API data
        setDriverBalance(prev => prev + (sessionTokens || 0));
        setSessionData({
          carbonSaved: carbonSaved || 0,
          tokensEarned: sessionTokens || 0,
          kilometersDriven: kilometersDriven || 0
        });
        setIsJourneyActive(false);

        toast({
          title: "Journey Completed!",
          description: `You saved ${carbonSaved?.toFixed(2) || 0}kg of CO² and earned ${sessionTokens?.toFixed(2) || 0} $CDRIVE!`,
        });

      } catch (error) {
        console.error("Error completing journey:", error);
        toast({
          title: "Journey Error",
          description: "Could not calculate your earnings. Please try again.",
          variant: "destructive",
        });
        setIsJourneyActive(false);
      }
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
              <span className="font-medium">João Silva</span>
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
          >
            <Zap className="h-6 w-6" />
            {isJourneyActive ? "End Journey" : "Start Eco Journey"}
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

        {/* Journey Summary (conditional) */}
        {isJourneyActive ? (
          <div className="flex items-center justify-center p-6 bg-green-100 rounded-lg shadow-inner">
            <Bolt className="h-6 w-6 text-green-600 mr-3 animate-pulse" />
            <span className="text-green-800 text-lg font-medium">Your journey is active... Drive eco-friendly!</span>
          </div>
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
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {transaction.date} • {transaction.time}
                      </div>
                    </div>
                    <div className="font-medium mt-1">
                      {transaction.description}
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${
                    transaction.amount > 0 ? 'text-accent' : 'text-destructive'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(1)} $CDRIVE
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
  
export default Dashboard;