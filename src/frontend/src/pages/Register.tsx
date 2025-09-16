import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Mail, Lock, User, CreditCard, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: "",
    pix_key: "",
  });

  // Validações de senha
  const passwordValidations = {
    maxLength: formData.password.length <= 8,
    minLength: formData.password.length >= 4,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword !== "",
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validações do frontend
    if (!isPasswordValid) {
      toast({
        title: "Senha inválida",
        description: "Por favor, atenda a todos os requisitos de senha.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.user_type) {
      toast({
        title: "Tipo de usuário obrigatório",
        description: "Por favor, selecione se você é motorista ou empresa.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type,
        pix_key: formData.pix_key,
      });

      const { token } = response.data;
      localStorage.setItem('jwt', token);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao CarbonDrive! Você será redirecionado em instantes.",
      });

      // Redireciona baseado no tipo de usuário
      if (formData.user_type === 'driver') {
        navigate('/dashboard');
      } else if (formData.user_type === 'company') {
        navigate('/admin');
      }

    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      const errorMessage = error.response?.data?.error || "Erro ao criar conta. Tente novamente.";
      toast({
        title: "Erro no Cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      user_type: value,
    });
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    isValid ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  );

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
            Junte-se à revolução da condução sustentável
          </p>
        </div>

        {/* Register Form */}
        <Card className="carbon-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Comece a ganhar recompensas por dirigir de forma sustentável
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="user_type" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Tipo de Usuário
                </Label>
                <Select onValueChange={handleSelectChange} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Motorista</SelectItem>
                    <SelectItem value="company">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_key" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Chave PIX (opcional)
                </Label>
                <Input
                  id="pix_key"
                  name="pix_key"
                  type="text"
                  placeholder="Digite sua chave PIX"
                  value={formData.pix_key}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Validações de senha */}
                 {formData.password && (
                   <div className="space-y-2 mt-3 p-3 bg-muted/30 rounded-lg">
                     <p className="text-sm font-medium text-muted-foreground">Requisitos da senha:</p>
                     <div className="space-y-1">
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.minLength} />
                         <span className={passwordValidations.minLength ? "text-green-600" : "text-red-600"}>
                           Mínimo 4 caracteres
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.maxLength} />
                         <span className={passwordValidations.maxLength ? "text-green-600" : "text-red-600"}>
                           Máximo 8 caracteres
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.hasUpperCase} />
                         <span className={passwordValidations.hasUpperCase ? "text-green-600" : "text-red-600"}>
                           Pelo menos uma letra maiúscula
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.hasLowerCase} />
                         <span className={passwordValidations.hasLowerCase ? "text-green-600" : "text-red-600"}>
                           Pelo menos uma letra minúscula
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.hasNumber} />
                         <span className={passwordValidations.hasNumber ? "text-green-600" : "text-red-600"}>
                           Pelo menos um número (0-9)
                         </span>
                       </div>
                     </div>
                   </div>
                 )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Validação de confirmação de senha */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <ValidationIcon isValid={passwordValidations.passwordsMatch} />
                    <span className={passwordValidations.passwordsMatch ? "text-green-600" : "text-red-600"}>
                      {passwordValidations.passwordsMatch ? "Senhas coincidem" : "Senhas não coincidem"}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="carbon"
                size="eco"
                className="w-full"
                disabled={isLoading || !isPasswordValid}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-accent hover:text-accent/90 font-medium">
                  Faça login
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