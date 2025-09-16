import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importe useNavigate
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, User, Mail, Lock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import api from "@/services/api"; // Importe a instância do Axios

const Register = () => {
  const navigate = useNavigate(); // Hook para redirecionar o usuário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "Motorista", // Novo estado para o tipo de usuário
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Faz a chamada para a rota de cadastro do backend
      // A rota não exige autenticação, então não precisamos de token
      const response = await api.post("/register", { ...formData });

      if (response.status === 201) {
        // Se o cadastro for bem-sucedido, redireciona para a página de login
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      // Aqui você pode adicionar um toast de erro para o usuário
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserTypeChange = (value: string) => {
    setFormData({
      ...formData,
      userType: value,
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
            Dirija sustentável, ganhe recompensas
          </p>
        </div>

        {/* Registration Form */}
        <Card className="carbon-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cadastre-se para Ganhar</CardTitle>
            <CardDescription>
              Crie sua conta e comece a ser recompensado por dirigir de forma eco-responsável
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Opção de Tipo de Usuário */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Tipo de Usuário
                </Label>
                <RadioGroup
                  defaultValue="Motorista"
                  onValueChange={handleUserTypeChange}
                  className="flex items-center justify-around w-full h-12 rounded-lg border px-4 py-2"
                >
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="Motorista" id="driver" />
                    <Label htmlFor="driver" className="cursor-pointer">Motorista</Label>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="Empresa" id="company" />
                    <Label htmlFor="company" className="cursor-pointer">Empresa</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

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
                  placeholder="Crie uma senha segura"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>
              {/* O campo Chave PIX foi removido */}

              <Button type="submit" variant="carbon" size="eco" className="w-full">
                Criar Conta
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-accent hover:text-accent/90 font-medium">
                  Fazer Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;