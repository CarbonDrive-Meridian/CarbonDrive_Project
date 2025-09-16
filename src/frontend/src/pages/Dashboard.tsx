import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Leaf, 
  Car, 
  DollarSign, 
  TrendingUp, 
  Zap,
  User,
  ThumbsUp,
  Trophy,
  ChevronDown,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [driverBalance, setDriverBalance] = useState(247.5);
  const [dailyEarnings] = useState(15.5);
  const [tripsToday] = useState(12);
  const [ecoScore] = useState(85);
  const [ranking] = useState(23);

  const [transactions] = useState([
    { id: 1, date: "15/09/2024", time: "14:30", description: "Eco-condução - Rota Centro", amount: 8.5 },
    { id: 2, date: "15/09/2024", time: "12:15", description: "Eco-condução - Rota Norte", amount: 7.0 },
    { id: 3, date: "14/09/2024", time: "18:45", description: "Troca PIX", amount: -50.0 },
    { id: 4, date: "14/09/2024", time: "16:20", description: "Eco-condução - Rota Sul", amount: 9.2 },
  ]);

  const handleEcoSimulation = () => {
    const earnedTokens = Math.random() * 10 + 5;
    setDriverBalance(prev => prev + earnedTokens);
    
    toast({
      title: "Eco-condução Simulada!",
      description: `Você ganhou ${earnedTokens.toFixed(2)} $CDRIVE tokens`,
    });
  };

  const handlePixExchange = () => {
    if (driverBalance >= 10) {
      const exchangeAmount = Math.floor(driverBalance / 10) * 10;
      const realValue = exchangeAmount * 0.2;
      setDriverBalance(prev => prev - exchangeAmount);
      
      toast({
        title: "Troca Realizada!",
        description: `R$ ${realValue.toFixed(2)} foi enviado para sua chave PIX`,
      });
    } else {
      toast({
        title: "Saldo Insuficiente",
        description: "Você precisa de pelo menos 10 $CDRIVE para fazer uma troca",
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
              <p className="text-sm text-muted-foreground">Condução Sustentável</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">João Silva</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
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
                <p className="text-primary-foreground/80 text-sm mb-2">Seu Saldo</p>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {driverBalance.toFixed(1)} $CDRIVE
                  </div>
                  <div className="text-primary-foreground/90 text-lg">
                    = R$ {(driverBalance * 0.2).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-accent">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">+{dailyEarnings.toFixed(1)} hoje</span>
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
            Simular Eco-Condução
          </Button>
          
          <Button 
            onClick={handlePixExchange}
            variant="secondary" 
            size="eco" 
            className="h-16 text-lg"
          >
            <DollarSign className="h-6 w-6" />
            Trocar por Reais (PIX)
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-3 bg-accent/20 rounded-full w-fit">
                <Car className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-sm text-muted-foreground font-medium">Viagens Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{tripsToday}</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-3 bg-accent/20 rounded-full w-fit">
                <ThumbsUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-sm text-muted-foreground font-medium">Pontuação Eco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{ecoScore}%</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-3 bg-accent/20 rounded-full w-fit">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-sm text-muted-foreground font-medium">Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">#{ranking}</div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Transações
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