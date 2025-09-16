import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Mail, Lock } from "lucide-react";
import api from "@/services/api"; // Mantenha a sua importação
import { useToast } from "@/hooks/use-toast"; // Adicione o useToast

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast(); // Adicione o hook
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Adicione o estado de carregamento

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Inicia o carregamento

    try {
      // Usa a sua chamada de API para a rota de login
      const response = await api.post('/login', formData);
      
      const { token, userType } = response.data;
      
      localStorage.setItem('jwt', token);
      
      // Mensagem de sucesso
      toast({
        title: "Login realizado com sucesso!",
        description: "Você será redirecionado em instantes.",
      });

      // Redireciona o usuário
      if (userType === 'Motorista') {
        navigate('/dashboard');
      } else if (userType === 'Empresa') {
        navigate('/admin');
      }
      
    } catch (error: any) {
      // Lida com erros de autenticação
      console.error("Erro no login:", error);
      const errorMessage = error.response?.data?.message || "Erro ao fazer login. Tente novamente.";
      toast({
        title: "Erro no Login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary p-3 rounded-xl">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">CarbonDrive</h1>
          </div>
          <p className="text-muted-foreground">
            Your sustainable driving platform
          </p>
        </div>

        {/* Login Form */}
        <Card className="carbon-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue earning rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <Button
                  type="submit"
                  variant="carbon"
                  size="eco"
                  className="w-full"
                  disabled={isLoading}
              >
                  {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-accent hover:text-accent/90 font-medium">
                  Sign up
                </Link>
              </p>
              <Link to="#" className="text-sm text-primary hover:text-primary/90">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;