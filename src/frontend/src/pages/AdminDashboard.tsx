import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Package, Building, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input"; // Importe o componente Input
import { useToast } from "@/hooks/use-toast";
import axios from "axios"; // Importe o axios para chamadas de API

const AdminDashboard = () => {
  const { toast } = useToast();
  const [inventoryBalance, setInventoryBalance] = useState(1500); // Exemplo de saldo
  const [purchaseQuantity, setPurchaseQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [cdriveToBrlcRate] = useState(0.50); // Exemplo de cotação: 1 $CDRIVE = R$ 0.50

  useEffect(() => {
    // Calcula o custo total sempre que a quantidade de compra muda
    const cost = purchaseQuantity * cdriveToBrlcRate;
    setTotalCost(cost);
  }, [purchaseQuantity, cdriveToBrlcRate]);

  const handleSellToCompany = async () => {
    try {
      // Exemplo de como obter o token de autenticação
      const token = localStorage.getItem('jwt');
      if (!token) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado como admin para realizar esta ação.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/vender-lote-empresas`,
        { quantity: purchaseQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Simulação: atualiza o saldo do inventário após a venda
      setInventoryBalance(prevBalance => prevBalance - purchaseQuantity);
      setPurchaseQuantity(0);

      toast({
        title: "Venda Realizada!",
        description: `Lote de ${purchaseQuantity} $CDRIVE vendido por R$ ${totalCost.toFixed(2)}.`,
      });

    } catch (error) {
      console.error("Erro ao vender lote:", error);
      toast({
        title: "Erro na Venda",
        description: "Não foi possível vender o lote. Tente novamente.",
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
            <p className="text-sm text-muted-foreground">Painel Administrativo</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Painel da Plataforma</h2>
          <p className="text-muted-foreground">Gerencie o inventário e vendas de créditos de carbono</p>
        </div>

        {/* Inventory Card (exibe saldo total e valor) */}
        <Card className="bg-primary text-primary-foreground overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary-foreground/80" />
                  <h3 className="text-xl font-semibold text-primary-foreground/90">
                    Inventário de $CDRIVE
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
            <CardTitle>Vender Créditos para Empresa</CardTitle>
            <CardDescription>
              Informe a quantidade de $CDRIVE que deseja vender.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-grow">
                <Input
                  type="number"
                  placeholder="Quantidade a vender"
                  value={purchaseQuantity === 0 ? "" : purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                  min="0"
                  max={inventoryBalance}
                />
              </div>
              <p className="text-muted-foreground">x R$ {cdriveToBrlcRate.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Valor a Receber:</span>
              <span>R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <Button
              onClick={handleSellToCompany}
              disabled={purchaseQuantity <= 0 || purchaseQuantity > inventoryBalance}
              className="w-full h-12"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Confirmar Venda
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;