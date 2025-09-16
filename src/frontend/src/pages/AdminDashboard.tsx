import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf, Package, Building, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from '@/services/api'; // Importa a instância do Axios que criamos

const AdminDashboard = () => {
  const { toast } = useToast();
  const [inventoryBalance, setInventoryBalance] = useState(0);
  const [purchaseQuantity, setPurchaseQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  // State for dynamic dollar exchange rate
  const [dollarRate, setDollarRate] = useState(5.50); // Default value
  const [cdriveToBrlcRate, setCdriveToBrlcRate] = useState(0.275); // 1 $CDRIVE = 0.05 USD converted to BRL
  
  // Fetch dollar exchange rate when component loads
  useEffect(() => {
    const fetchDollarRate = async () => {
      try {
        // Use AbortController for better timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
          console.warn('API response invalid, using default values');
          setDollarRate(5.50); // Default BRL/USD rate
          setCdriveToBrlcRate(0.275); // 5.50 * 0.05
        }
      } catch (error) {
        // Silent error handling - don't show errors to user for currency API
        console.warn('Erro ao buscar cotação do dólar (usando valores padrão):', error);
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

  useEffect(() => {
    const cost = purchaseQuantity * cdriveToBrlcRate;
    setTotalCost(cost);
  }, [purchaseQuantity, cdriveToBrlcRate]);

  const handleSellToCompany = async () => {
    try {
      // Use the 'api' instance to make the request
      await api.post('/admin/vender-lote-empresas', { quantity: purchaseQuantity });

      setInventoryBalance(prevBalance => prevBalance - purchaseQuantity);
      setPurchaseQuantity(0);

      toast({
        title: "Sale Completed!",
        description: `Batch of ${purchaseQuantity} $CDRIVE sold for R$ ${totalCost.toFixed(2)}.`,
      });
    } catch (error) {
      console.error("Error selling batch:", error);
      const errorMessage = error.response?.data?.message || "Could not sell the batch. Please try again.";
      toast({
        title: "Sale Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">CarbonDrive</h1>
            <p className="text-sm text-muted-foreground">Administrative Panel</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Inventory Card (displays total balance and value) */}
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-primary-foreground/80" />
                    <h3 className="text-xl font-semibold text-primary-foreground/90">
                      $CDRIVE Inventory
                    </h3>
                  </div>
                <div className="space-y-2">
                  <div className="text-5xl font-bold">
                    {inventoryBalance.toLocaleString()} $CDRIVE
                  </div>
                  <p className="text-primary-foreground/80 text-lg">
                    ≈ R$ {(inventoryBalance * cdriveToBrlcRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="p-4 bg-primary-foreground/10 rounded-full">
                  <Building className="h-12 w-12 text-primary-foreground/60" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Interface */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Sell Credits to Company</CardTitle>
              <CardDescription>
                Enter the amount of $CDRIVE you want to sell.
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-grow">
                <Input
                  type="number"
                  placeholder="Amount to sell"
                  value={purchaseQuantity === 0 ? "" : purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                  min="0"
                  max={inventoryBalance}
                />
              </div>
              <p className="text-muted-foreground">x R$ {cdriveToBrlcRate.toFixed(3)} (1 $CDRIVE = 0.05 USD)</p>
            </div>
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Amount to Receive:</span>
              <span>R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <Button
              onClick={handleSellToCompany}
              disabled={purchaseQuantity <= 0 || purchaseQuantity > inventoryBalance}
              className="w-full h-12"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Confirm Sale
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;