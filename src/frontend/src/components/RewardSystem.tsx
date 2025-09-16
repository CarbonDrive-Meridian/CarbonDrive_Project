import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Leaf, 
  Zap, 
  Target, 
  Award,
  TrendingUp,
  Shield
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  reward: number;
  unlocked: boolean;
  category: 'eco' | 'distance' | 'safety' | 'consistency';
}

interface RewardSystemProps {
  totalDistance: number;
  totalCarbonSaved: number;
  brakeEvents: number;
  smoothDrivingScore: number;
  sessionsCompleted: number;
}

export const RewardSystem: React.FC<RewardSystemProps> = ({
  totalDistance,
  totalCarbonSaved,
  brakeEvents,
  smoothDrivingScore,
  sessionsCompleted
}) => {
  // Definir conquistas disponíveis
  const achievements: Achievement[] = [
    {
      id: 'first-km',
      title: 'Primeiro Quilômetro',
      description: 'Complete seu primeiro quilômetro eco-consciente',
      icon: <Target className="h-5 w-5" />,
      progress: Math.min(totalDistance, 1),
      maxProgress: 1,
      reward: 0.5,
      unlocked: totalDistance >= 1,
      category: 'distance'
    },
    {
      id: 'eco-warrior',
      title: 'Guerreiro Ecológico',
      description: 'Economize 1kg de CO² em suas viagens',
      icon: <Leaf className="h-5 w-5" />,
      progress: Math.min(totalCarbonSaved, 1),
      maxProgress: 1,
      reward: 1.0,
      unlocked: totalCarbonSaved >= 1,
      category: 'eco'
    },
    {
      id: 'smooth-driver',
      title: 'Motorista Suave',
      description: 'Mantenha 90% de direção suave em uma sessão',
      icon: <Shield className="h-5 w-5" />,
      progress: smoothDrivingScore >= 90 ? 1 : 0,
      maxProgress: 1,
      reward: 0.8,
      unlocked: smoothDrivingScore >= 90,
      category: 'safety'
    },
    {
      id: 'brake-master',
      title: 'Mestre da Frenagem',
      description: 'Realize 10 frenagens eco-conscientes',
      icon: <Zap className="h-5 w-5" />,
      progress: Math.min(brakeEvents, 10),
      maxProgress: 10,
      reward: 2.0,
      unlocked: brakeEvents >= 10,
      category: 'safety'
    },
    {
      id: 'consistent-driver',
      title: 'Motorista Consistente',
      description: 'Complete 5 sessões de direção',
      icon: <TrendingUp className="h-5 w-5" />,
      progress: Math.min(sessionsCompleted, 5),
      maxProgress: 5,
      reward: 3.0,
      unlocked: sessionsCompleted >= 5,
      category: 'consistency'
    },
    {
      id: 'carbon-champion',
      title: 'Campeão do Carbono',
      description: 'Economize 10kg de CO² no total',
      icon: <Trophy className="h-5 w-5" />,
      progress: Math.min(totalCarbonSaved, 10),
      maxProgress: 10,
      reward: 5.0,
      unlocked: totalCarbonSaved >= 10,
      category: 'eco'
    }
  ];

  // Calcular estatísticas
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalRewardsEarned = unlockedAchievements.reduce((sum, a) => sum + a.reward, 0);
  const completionRate = (unlockedAchievements.length / achievements.length) * 100;

  // Agrupar conquistas por categoria
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryNames = {
    eco: 'Eco-Consciente',
    distance: 'Distância',
    safety: 'Segurança',
    consistency: 'Consistência'
  };

  const categoryColors = {
    eco: 'text-green-600',
    distance: 'text-blue-600',
    safety: 'text-yellow-600',
    consistency: 'text-purple-600'
  };

  return (
    <div className="space-y-6">
      {/* Resumo de Recompensas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Sistema de Recompensas
          </CardTitle>
          <CardDescription>
            Ganhe $CDRIVE tokens completando conquistas eco-conscientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {unlockedAchievements.length}/{achievements.length}
              </div>
              <div className="text-sm text-muted-foreground">Conquistas Desbloqueadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{totalRewardsEarned.toFixed(1)} $CDRIVE
              </div>
              <div className="text-sm text-muted-foreground">Recompensas Ganhas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {completionRate.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Progresso Total</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Conquistas por Categoria */}
      {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className={`text-lg ${categoryColors[category as keyof typeof categoryColors]}`}>
              {categoryNames[category as keyof typeof categoryNames]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                        {achievement.unlocked ? "Desbloqueada" : "Bloqueada"}
                      </Badge>
                      <div className="text-sm font-semibold text-yellow-600">
                        +{achievement.reward} $CDRIVE
                      </div>
                    </div>
                  </div>
                  
                  {achievement.maxProgress > 1 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{achievement.progress.toFixed(1)}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};