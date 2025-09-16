import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, User, CreditCard, Save, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  user_type: string;
  pix_key: string | null;
}

interface AxiosError {
  response?: {
    status: number;
    data?: {
      error?: string;
    };
  };
  code?: string;
  message?: string;
}

// Type guard para verificar se o erro é do tipo AxiosError
const isAxiosError = (error: unknown): error is AxiosError => {
  return typeof error === 'object' && error !== null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    pix_key: "",
  });

  // Carregar dados do perfil ao montar o componente
  useEffect(() => {
    const loadProfile = async () => {
      // Verificar se há token antes de fazer a requisição
      const token = localStorage.getItem('jwt');
      if (!token) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar o perfil.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Tentar carregar dados do localStorage primeiro
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setProfile(userData);
          setFormData({
            name: userData.name || "",
            pix_key: userData.pix_key || "",
          });
          setIsLoadingProfile(false);
          return; // Se temos dados no localStorage, não precisamos fazer requisição
        } catch (error) {
          console.error("Erro ao carregar dados do localStorage:", error);
          // Se houver erro, continua com a requisição à API
        }
      }

      try {
        const response = await api.get('/auth/profile');
        const userData = response.data;
        
        setProfile(userData);
        setFormData({
          name: userData.name || "",
          pix_key: userData.pix_key || "",
        });
        
        // Atualizar localStorage com dados mais recentes
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error: unknown) {
        console.error("Erro ao carregar perfil:", error);
        
        // Tratamento específico para diferentes tipos de erro
        if (isAxiosError(error) && error.response?.status === 401) {
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou. Faça login novamente.",
            variant: "destructive",
          });
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          navigate('/login');
        } else if (isAxiosError(error) && error.response?.status === 404) {
          toast({
            title: "Usuário não encontrado",
            description: "Perfil não encontrado. Tente fazer login novamente.",
            variant: "destructive",
          });
          navigate('/login');
        } else {
          toast({
            title: "Erro ao carregar perfil",
            description: isAxiosError(error) ? error.response?.data?.error || "Não foi possível carregar os dados do perfil." : "Não foi possível carregar os dados do perfil.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verificar se há token antes de fazer a requisição
    const token = localStorage.getItem('jwt');
    if (!token) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para salvar alterações.",
        variant: "destructive",
      });
      navigate('/login');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.put('/auth/profile', {
        name: formData.name,
        pix_key: formData.pix_key,
      });

      // Atualizar estado local com dados retornados
      setProfile(response.data.user);
      
      // Atualizar localStorage com dados mais recentes
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

    } catch (error: unknown) {
      console.error("Erro ao atualizar perfil:", error);
      
      // Tratamento específico para diferentes tipos de erro
      if (isAxiosError(error) && error.response?.status === 401) {
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Faça login novamente.",
          variant: "destructive",
        });
        localStorage.removeItem('jwt');
        navigate('/login');
      } else if (isAxiosError(error) && error.response?.status === 404) {
        toast({
          title: "Usuário não encontrado",
          description: "Perfil não encontrado. Tente fazer login novamente.",
          variant: "destructive",
        });
        navigate('/login');
      } else if (isAxiosError(error) && error.response?.status === 400) {
        toast({
          title: "Dados inválidos",
          description: isAxiosError(error) ? error.response?.data?.error || "Verifique os dados informados." : "Verifique os dados informados.",
          variant: "destructive",
        });
      } else if (isAxiosError(error) && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'))) {
        toast({
          title: "Erro de conexão",
          description: "Verifique sua conexão com a internet e tente novamente.",
          variant: "destructive",
        });
      } else {
        const errorMessage = isAxiosError(error) ? error.response?.data?.error || "Erro ao atualizar perfil. Tente novamente." : "Erro ao atualizar perfil. Tente novamente.";
        toast({
          title: "Erro ao salvar",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Meu Perfil
          </CardTitle>
          <CardDescription className="text-gray-600">
            Gerencie suas informações pessoais
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (somente leitura) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="pl-10 bg-gray-50 text-gray-500"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nome Completo
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Digite seu nome completo"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Chave PIX */}
            <div className="space-y-2">
              <Label htmlFor="pix_key" className="text-sm font-medium text-gray-700">
                Chave PIX
              </Label>
              <div className="relative">
                <Input
                  id="pix_key"
                  name="pix_key"
                  type="text"
                  value={formData.pix_key}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Digite sua chave PIX (CPF, email, telefone ou chave aleatória)"
                />
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Sua chave PIX será usada para receber pagamentos dos tokens $CDRIVE
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Informações do usuário */}
          {profile && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tipo de usuário:</span>
                <span className="font-medium capitalize">
                  {profile.user_type === 'driver' ? 'Motorista' : 'Empresa'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;