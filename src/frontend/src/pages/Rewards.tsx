import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RewardSystem } from "@/components/RewardSystem";
import { ArrowLeft, Trophy, Star, Gift } from "lucide-react";

const Rewards = () => {
  const navigate = useNavigate();
  
  // Estados para dados de recompensas (em uma aplicação real, viriam de uma API)
  const [rewardData, setRewardData] = useState({
    totalDistance: 0,
    totalCarbonSaved: 0,
    brakeEvents: 0,
    smoothDrivingScore: 0,
    sessionsCompleted: 0
  });

  // Carregar dados do localStorage (simulando persistência)
  useEffect(() => {
    const savedData = localStorage.getItem('carbonDriveRewards');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setRewardData(parsed);
      } catch (error) {
        console.error('Erro ao carregar dados de recompensas:', error);
      }
    }
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">Sistema de Recompensas</h1>
          </div>
        </div>

        {/* Introdução */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Como Funciona
            </CardTitle>
            <CardDescription>
              Ganhe $CDRIVE tokens dirigindo de forma eco-consciente e completando conquistas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-600 font-semibold mb-2">🌱 Direção Eco-Consciente</div>
                <p className="text-sm text-muted-foreground">
                  Ganhe tokens baseado na distância percorrida e carbono economizado
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 font-semibold mb-2">🚗 Frenagem Inteligente</div>
                <p className="text-sm text-muted-foreground">
                  Receba recompensas por frenagens suaves e direção segura
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-600 font-semibold mb-2">🏆 Conquistas</div>
                <p className="text-sm text-muted-foreground">
                  Desbloqueie conquistas especiais e ganhe tokens extras
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Recompensas */}
        {rewardData.totalDistance > 0 ? (
          <RewardSystem
            totalDistance={rewardData.totalDistance}
            totalCarbonSaved={rewardData.totalCarbonSaved}
            brakeEvents={rewardData.brakeEvents}
            smoothDrivingScore={rewardData.smoothDrivingScore}
            sessionsCompleted={rewardData.sessionsCompleted}
          />
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum Dado de Recompensas</h3>
              <p className="text-muted-foreground mb-4">
                Comece a dirigir para ver suas conquistas e recompensas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Rewards;