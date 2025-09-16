import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
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
        title: "Invalid password",
      description: "Please meet all password requirements.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.user_type) {
      toast({
        title: "Tipo de usuário obrigatório",
        description: "Please select whether you are a driver or company.",
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
      });

      const { token, user } = response.data;
      localStorage.setItem('jwt', token);
      
      // Salvar dados do usuário no localStorage para acesso imediato
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Welcome to CarbonDrive! You will be redirected shortly.",
      });

      // Redireciona baseado no tipo de usuário
      if (formData.user_type === 'driver') {
        navigate('/dashboard');
      } else if (formData.user_type === 'company') {
        navigate('/admin');
      }

    } catch (error: unknown) {
      console.error("Erro no cadastro:", error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Error creating account. Please try again."
        : "Error creating account. Please try again.";
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
            Join the sustainable driving revolution
          </p>
        </div>

        {/* Register Form */}
        <Card className="carbon-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Join CarbonDrive and start earning rewards for eco-friendly driving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

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
                <Label htmlFor="user_type" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Type
                </Label>
                <Select onValueChange={handleSelectChange} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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

                {/* Password validations */}
                 {formData.password && (
                   <div className="space-y-2 mt-3 p-3 bg-muted/30 rounded-lg">
                     <p className="text-sm font-medium text-muted-foreground">Password requirements:</p>
                     <div className="space-y-1">
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.minLength} />
                         <span className={passwordValidations.minLength ? "text-green-600" : "text-red-600"}>
                           Minimum 4 characters
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.maxLength} />
                         <span className={passwordValidations.maxLength ? "text-green-600" : "text-red-600"}>
                           Maximum 8 characters
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.hasUpperCase} />
                         <span className={passwordValidations.hasUpperCase ? "text-green-600" : "text-red-600"}>
                           At least one uppercase letter
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.hasLowerCase} />
                         <span className={passwordValidations.hasLowerCase ? "text-green-600" : "text-red-600"}>
                           At least one lowercase letter
                         </span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <ValidationIcon isValid={passwordValidations.hasNumber} />
                         <span className={passwordValidations.hasNumber ? "text-green-600" : "text-red-600"}>
                           At least one number
                         </span>
                       </div>
                     </div>
                   </div>
                 )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
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

                {/* Password confirmation validation */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <ValidationIcon isValid={passwordValidations.passwordsMatch} />
                    <span className={passwordValidations.passwordsMatch ? "text-green-600" : "text-red-600"}>
                      {passwordValidations.passwordsMatch ? "Passwords match" : "Passwords don't match"}
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
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-accent hover:text-accent/90 font-medium">
                  Sign in
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