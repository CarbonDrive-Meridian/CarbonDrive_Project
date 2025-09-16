import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Adicione o useNavigate
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
  Car
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios"; // Importe o axios

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Estado para dados vindos da API
  const [driverBalance, setDriverBalance] = useState(247.5);
  const [dailyEarnings] = useState(15.5);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [sessionData, setSessionData] = useState({
    carbonSaved: 0,
    sessionTokens: 0,
    kilometersDriven: 0,
  });

  // Cotação: 1 $CDRIVE = R$ 0.20 (Exemplo B2C)
  const cdriveToBrlcRate = 0.20;

  // Transações de exemplo, serão substituídas por dados reais da API
  const [transactions] = useState([
    { id: 1, date: "15/09/2024", time: "14:30", description: "Eco-condução - Rota Centro", amount: 8.5 },
    { id: 2, date: "15/09/2024", time: "12:15", description: "Eco-condução - Rota Norte", amount: 7.0 },
    { id: 3, date: "14/09/2024", time: "18:45", description: "Troca PIX", amount: -50.0 },
    { id: 4, date: "14/09/2024", time: "16:20", description: "Eco-condução - Rota Sul", amount: 9.2 },
  ]);

  const handleEcoSimulation = async () => {
    // Obter o token de autenticação
    const token = localStorage.getItem('jwt');
    if (!token) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para iniciar uma jornada.",
        variant: "destructive",
      });
      navigate('/login'); // Redireciona para o login se não houver token
      return;
    }

    if (!isJourneyActive) {
      // INICIAR a jornada
      setIsJourneyActive(true);
      toast({
        title: "Jornada Iniciada!",
        description: "Agora estamos monitorando sua condução.",
      });
    } else {
      // FINALIZAR a jornada e chamar a API para calcular ganhos
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/motorista/eco-conducao`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { carbonSaved, sessionTokens, kilometersDriven } = response.data;

        // Atualiza os estados com dados reais da API
        setDriverBalance(prev => prev + sessionTokens);
        setSessionData({ carbonSaved, sessionTokens, kilometersDriven });
        setIsJourneyActive(false);

        toast({
          title: "Jornada Finalizada!",
          description: `Você economizou ${carbonSaved.toFixed(2)} kg de carbono e ganhou ${sessionTokens.toFixed(2)} $CDRIVE.`,
        });

      } catch (error) {
        console.error("Erro ao finalizar jornada:", error);
        toast({
          title: "Erro na Jornada",
          description: "Não foi possível calcular seus ganhos. Tente novamente.",
          variant: "destructive",
        });
        setIsJourneyActive(false);
      }
    }
  };

  const handlePixExchange = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer a troca.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/motorista/trocar-cdr-por-pix`,
        { amount: driverBalance }, // Ou o valor específico que o usuário deseja trocar
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { newBalance, pixValue } = response.data;
      setDriverBalance(newBalance);

      toast({
        title: "Troca Realizada!",
        description: `R$ ${pixValue.toFixed(2)} foi enviado para sua chave PIX`,
      });

    } catch (error) {
      console.error("Erro na troca PIX:", error);
      toast({
        title: "Erro na Troca",
        description: "Saldo insuficiente ou erro na transação. Tente novamente.",
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
                <p className="text-primary-foreground/80 text-sm mb-2">Acumule tokens</p>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {driverBalance.toFixed(1)} $CDRIVE
                  </div>
                  <div className="text-primary-foreground/90 text-lg">
                    = R$ {(driverBalance * cdriveToBrlcRate).toFixed(2)}
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
            {isJourneyActive ? "Finalizar Jornada" : "Iniciar Jornada Ecológica"}
          </Button>
          
          <Button 
            onClick={handlePixExchange}
            variant="secondary" 
            size="eco" 
            className="h-16 text-lg"
          >
            <DollarSign className="h-6 w-6" />
            Trocar por Reais (Pix)
          </Button>
        </div>

        {/* Resumo da Jornada (condicional) */}
        {isJourneyActive ? (
          <div className="flex items-center justify-center p-6 bg-green-100 rounded-lg shadow-inner">
            <Bolt className="h-6 w-6 text-green-600 mr-3 animate-pulse" />
            <span className="text-green-800 text-lg font-medium">Sua jornada está ativa... Dirija ecologicamente!</span>
          </div>
        ) : (
          (sessionData.sessionTokens > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-accent">Resumo da sua Jornada</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" /> Carbono Economizado
                  </p>
                  <p className="text-3xl font-bold">{sessionData.carbonSaved.toFixed(2)} kg</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-500" /> KM Percorridos
                  </p>
                  <p className="text-3xl font-bold">{sessionData.kilometersDriven.toFixed(1)} km</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-500" /> $CDRIVE Ganhos
                  </p>
                  <p className="text-3xl font-bold text-accent">{sessionData.sessionTokens.toFixed(2)}</p>
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