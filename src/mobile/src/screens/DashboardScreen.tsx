import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useTrip } from '../hooks/useTrip';
import { useLocation } from '../hooks/useLocation';
import { dashboardApi } from '../services/api';
import { DashboardData, ActivityItem } from '../types';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentTrip, 
    isTripActive, 
    startTrip, 
    endTrip, 
    tripDistance, 
    tripDuration, 
    carbonSaved, 
    tokensEarned, 
    ecoScore 
  } = useTrip();
  const { startTracking, stopTracking, isTracking } = useLocation();
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    name: user?.name || 'Usuário',
    cdriveBalance: 152.75,
    pixValue: 26.73,
    monthSavings: 725.0,
    ecoScore: 85,
  });
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In a real app, you would fetch this from the API
      // const data = await dashboardApi.getDashboardData();
      // setDashboardData(data);
      
      // Mock data for now
      setActivityData([
        {
          id: 1,
          type: 'earning',
          amount: 2.71,
          description: 'Viagem de hoje',
          date: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'withdrawal',
          amount: 150.0,
          description: 'Saque PIX solicitado',
          date: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          type: 'earning',
          amount: 4.36,
          description: 'Viagem de ontem',
          date: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleStartTrip = async () => {
    try {
      await startTracking();
      await startTrip();
      Alert.alert(
        'Viagem Iniciada',
        'Sua viagem eco-friendly foi iniciada! Dirija com segurança.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível iniciar a viagem. Verifique as permissões de localização.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEndTrip = async () => {
    try {
      await endTrip();
      stopTracking();
      Alert.alert(
        'Viagem Finalizada',
        `Parabéns! Você economizou ${carbonSaved.toFixed(2)}kg de CO² e ganhou ${tokensEarned.toFixed(2)} $CDRIVE!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível finalizar a viagem.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleWithdraw = () => {
    Alert.alert(
      'Saque PIX',
      `Você está prestes a vender ${dashboardData.cdriveBalance} $CDRIVE por um valor estimado de R$ ${dashboardData.pixValue.toFixed(2)}. Confirma o saque?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            // Handle withdrawal logic
            Alert.alert('Sucesso', 'Saque solicitado com sucesso!');
          }
        },
      ]
    );
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {dashboardData.name}!</Text>
            <Text style={styles.subtitle}>Como está sua direção hoje?</Text>
          </View>
          <View style={styles.ecoScoreContainer}>
            <Text style={styles.ecoScoreLabel}>Eco-Score</Text>
            <Text style={styles.ecoScoreValue}>{isTripActive ? ecoScore : dashboardData.ecoScore}/100</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Ionicons name="diamond" size={24} color="#007AFF" />
              <Text style={styles.kpiLabel}>Saldo $CDRIVE</Text>
            </View>
            <Text style={styles.kpiValue}>{dashboardData.cdriveBalance}</Text>
            <Text style={styles.kpiSubtext}>$CDRIVE</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Ionicons name="cash" size={24} color="#34C759" />
              <Text style={styles.kpiLabel}>Valor PIX</Text>
            </View>
            <Text style={styles.kpiValue}>R$ {dashboardData.pixValue.toFixed(2)}</Text>
            <Text style={styles.kpiSubtext}>Disponível</Text>
          </Card>
        </View>

        <View style={styles.kpiContainer}>
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Ionicons name="trending-up" size={24} color="#FF9500" />
              <Text style={styles.kpiLabel}>Economia Mês</Text>
            </View>
            <Text style={styles.kpiValue}>R$ {dashboardData.monthSavings.toFixed(2)}</Text>
            <Text style={styles.kpiSubtext}>+12% vs anterior</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Ionicons name="leaf" size={24} color="#30D158" />
              <Text style={styles.kpiLabel}>CO² Economizado</Text>
            </View>
            <Text style={styles.kpiValue}>{isTripActive ? carbonSaved.toFixed(2) : '0.00'}</Text>
            <Text style={styles.kpiSubtext}>kg hoje</Text>
          </Card>
        </View>

        {/* Trip Section */}
        {isTripActive ? (
          <Card style={styles.tripCard}>
            <Text style={styles.tripTitle}>Viagem em Andamento</Text>
            <View style={styles.tripStats}>
              <View style={styles.tripStat}>
                <Text style={styles.tripStatValue}>{tripDistance.toFixed(1)} km</Text>
                <Text style={styles.tripStatLabel}>Distância</Text>
              </View>
              <View style={styles.tripStat}>
                <Text style={styles.tripStatValue}>{formatDuration(tripDuration)}</Text>
                <Text style={styles.tripStatLabel}>Tempo</Text>
              </View>
              <View style={styles.tripStat}>
                <Text style={styles.tripStatValue}>{tokensEarned.toFixed(2)}</Text>
                <Text style={styles.tripStatLabel}>$CDRIVE</Text>
              </View>
            </View>
            <Button
              title="Finalizar Viagem"
              onPress={handleEndTrip}
              variant="outline"
              style={styles.tripButton}
            />
          </Card>
        ) : (
          <View style={styles.actionButtons}>
            <Button
              title="Iniciar Viagem Eco"
              onPress={handleStartTrip}
              style={styles.primaryButton}
              rightIcon={<Ionicons name="car" size={20} color="#FFFFFF" />}
            />
            <Button
              title="Vender $CDRIVE"
              onPress={handleWithdraw}
              variant="outline"
              style={styles.secondaryButton}
              rightIcon={<Ionicons name="cash" size={20} color="#007AFF" />}
            />
          </View>
        )}

        {/* Activity Feed */}
        <Card style={styles.activityCard}>
          <Text style={styles.activityTitle}>Atividade Recente</Text>
          {activityData.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[
                styles.activityIcon,
                { backgroundColor: activity.type === 'earning' ? '#E8F5E8' : '#FFE8E8' }
              ]}>
                <Ionicons
                  name={activity.type === 'earning' ? 'add' : 'remove'}
                  size={16}
                  color={activity.type === 'earning' ? '#30D158' : '#FF3B30'}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAmount}>
                  {activity.type === 'earning' ? '+' : '-'}{activity.amount.toFixed(2)} $CDRIVE
                </Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 4,
  },
  ecoScoreContainer: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ecoScoreLabel: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  ecoScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 16,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 8,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  kpiSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  tripCard: {
    margin: 20,
    marginTop: 0,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tripStat: {
    alignItems: 'center',
  },
  tripStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  tripStatLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  tripButton: {
    marginTop: 8,
  },
  actionButtons: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginBottom: 8,
  },
  activityCard: {
    margin: 20,
    marginTop: 0,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  activityDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
});
