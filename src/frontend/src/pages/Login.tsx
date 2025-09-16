import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Mail, Lock } from "lucide-react";
import api from '@/services/api'; // Importe a instância do Axios que criamos

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", formData);
    
    try {
      // Faz a chamada para a rota de login do backend
      const response = await api.post('/login', formData);
      
      // O backend deve retornar o token JWT e o tipo de usuário
      const { token, userType } = response.data;
      
      // Salva o token no localStorage
      localStorage.setItem('jwt', token);
      
      // Redireciona o usuário com base no tipo de usuário retornado pelo backend
      if (userType === 'Motorista') {
        navigate('/dashboard');
      } else if (userType === 'Empresa') {
        navigate('/admin');
      }
      
    } catch (error) {
      // Lida com erros de autenticação
      console.error("Login failed:", error);
      // Aqui você pode adicionar um toast de erro para o usuário
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
            Sua plataforma de condução sustentável
          </p>
        </div>

        {/* Login Form */}
        <Card className="carbon-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo de Volta</CardTitle>
            <CardDescription>
              Entre em sua conta para continuar ganhando recompensas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <Button type="submit" variant="carbon" size="eco" className="w-full">
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/register" className="text-accent hover:text-accent/90 font-medium">
                  Cadastre-se
                </Link>
              </p>
              <Link to="#" className="text-sm text-primary hover:text-primary/90">
                Esqueceu sua senha?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;