import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ObdConnectionScreen } from './src/screens/ObdConnectionScreen';
import { ObdData } from './src/hooks/useObdReader';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [isTripActive, setIsTripActive] = useState(false);
  const [tripDistance, setTripDistance] = useState(0);
  const [tripDuration, setTripDuration] = useState(0);
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [ecoScore, setEcoScore] = useState(100);
  const [tripHistory, setTripHistory] = useState([]);
  const [obdData, setObdData] = useState<ObdData | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  const handleLogin = () => {
    if (email && password) {
      setScreen('dashboard');
      Alert.alert('Sucesso', 'Login realizado!');
    } else {
      Alert.alert('Erro', 'Preencha email e senha');
    }
  };

  const handleSignup = () => {
    if (name && email && password && pixKey) {
      setScreen('dashboard');
      Alert.alert('Sucesso', 'Conta criada!');
    } else {
      Alert.alert('Erro', 'Preencha todos os campos');
    }
  };

  const startTrip = () => {
    const tripId = `trip_${Date.now()}`;
    setCurrentTripId(tripId);
    setIsTripActive(true);
    setTripDistance(0);
    setTripDuration(0);
    setCarbonSaved(0);
    setTokensEarned(0);
    setEcoScore(100);
    
    // Check if OBD is connected
    if (obdData && obdData.isConnected) {
      Alert.alert('Viagem Iniciada', 'Sua viagem eco-friendly com OBD-II começou! (Modo Simulação)');
    } else {
      Alert.alert('Viagem Iniciada', 'Sua viagem eco-friendly começou! (Sem OBD-II)');
    }
  };

  const handleObdConnected = (data: ObdData) => {
    setObdData(data);
    setScreen('dashboard');
  };

  const endTrip = () => {
    if (isTripActive) {
      setIsTripActive(false);
      const newTrip = {
        id: currentTripId || Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        distance: tripDistance.toFixed(1),
        duration: Math.floor(tripDuration / 60) + ':' + (tripDuration % 60).toString().padStart(2, '0'),
        carbonSaved: carbonSaved.toFixed(2),
        tokensEarned: tokensEarned.toFixed(2),
        ecoScore: Math.round(ecoScore),
        hasObdData: obdData && obdData.isConnected
      };
      setTripHistory(prev => [newTrip, ...prev]);
      setCurrentTripId(null);
      Alert.alert('Viagem Finalizada', `Você ganhou ${tokensEarned.toFixed(2)} $CDRIVE!`);
    }
  };

  // Simulate trip tracking
  React.useEffect(() => {
    let interval;
    if (isTripActive) {
      interval = setInterval(() => {
        setTripDuration(prev => prev + 1);
        setTripDistance(prev => prev + 0.1);
        setCarbonSaved(prev => prev + 0.01);
        setTokensEarned(prev => prev + 0.05);
        setEcoScore(prev => Math.max(60, prev - 0.1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTripActive]);

  if (screen === 'welcome') {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.title}>🌱 CarbonDrive</Text>
          <Text style={styles.subtitle}>Transforme sua direção em economia</Text>
          <Text style={styles.description}>
            Dirija de forma inteligente e ganhe recompensas em $CDRIVE
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('login')}>
            <Text style={styles.buttonText}>Fazer Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('signup')}>
            <Text style={styles.secondaryButtonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (screen === 'login') {
    return (
      <ScrollView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.title}>🌱 CarbonDrive</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('signup')}>
            <Text style={styles.linkText}>Ainda não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('welcome')}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'signup') {
    return (
      <ScrollView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.title}>🌱 CarbonDrive</Text>
          <Text style={styles.subtitle}>Crie sua conta</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Chave PIX"
            value={pixKey}
            onChangeText={setPixKey}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
            <Text style={styles.buttonText}>Criar Conta</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('login')}>
            <Text style={styles.linkText}>Já tem conta? Faça login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('welcome')}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'dashboard') {
    return (
      <ScrollView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.title}>🌱 CarbonDrive</Text>
          <Text style={styles.subtitle}>Dashboard</Text>
        </View>
        <View style={styles.dashboard}>
          {isTripActive && (
            <View style={[styles.card, styles.tripCard]}>
              <Text style={styles.tripTitle}>🚗 Viagem em Andamento</Text>
              <View style={styles.tripStats}>
                <View style={styles.tripStat}>
                  <Text style={styles.tripStatValue}>{tripDistance.toFixed(1)} km</Text>
                  <Text style={styles.tripStatLabel}>Distância</Text>
                </View>
                <View style={styles.tripStat}>
                  <Text style={styles.tripStatValue}>{Math.floor(tripDuration / 60)}:{(tripDuration % 60).toString().padStart(2, '0')}</Text>
                  <Text style={styles.tripStatLabel}>Tempo</Text>
                </View>
                <View style={styles.tripStat}>
                  <Text style={styles.tripStatValue}>{tokensEarned.toFixed(1)}</Text>
                  <Text style={styles.tripStatLabel}>$CDRIVE</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.endTripButton} onPress={endTrip}>
                <Text style={styles.buttonText}>Finalizar Viagem</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saldo $CDRIVE</Text>
            <Text style={styles.cardValue}>{(152.75 + tokensEarned).toFixed(2)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Valor PIX</Text>
            <Text style={styles.cardValue}>R$ {((152.75 + tokensEarned) * 0.175).toFixed(2)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Economia do Mês</Text>
            <Text style={styles.cardValue}>R$ {(725.00 + (carbonSaved * 10)).toFixed(2)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Eco-Score</Text>
            <Text style={styles.cardValue}>{Math.round(ecoScore)}/100</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${ecoScore}%` }]} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>CO² Economizado Hoje</Text>
            <Text style={styles.cardValue}>{carbonSaved.toFixed(2)} kg</Text>
          </View>

          {/* OBD-II Data Card */}
          {obdData && obdData.isConnected && (
            <View style={[styles.card, styles.obdCard]}>
              <Text style={styles.cardTitle}>📊 Dados do Veículo (OBD-II)</Text>
              <View style={styles.obdDataGrid}>
                <View style={styles.obdDataItem}>
                  <Text style={styles.obdDataLabel}>RPM</Text>
                  <Text style={styles.obdDataValue}>{obdData.rpm}</Text>
                </View>
                <View style={styles.obdDataItem}>
                  <Text style={styles.obdDataLabel}>Velocidade</Text>
                  <Text style={styles.obdDataValue}>{obdData.speed} km/h</Text>
                </View>
                <View style={styles.obdDataItem}>
                  <Text style={styles.obdDataLabel}>MAF</Text>
                  <Text style={styles.obdDataValue}>{obdData.maf} g/s</Text>
                </View>
                <View style={styles.obdDataItem}>
                  <Text style={styles.obdDataLabel}>Acelerador</Text>
                  <Text style={styles.obdDataValue}>{obdData.throttle}%</Text>
                </View>
              </View>
              
              {/* OBD Status */}
              <View style={styles.obdStatusContainer}>
                <View style={styles.obdStatusRow}>
                  <Text style={styles.obdStatusLabel}>Status:</Text>
                  <Text style={[styles.obdStatusValue, { color: obdData.isConnected ? '#30D158' : '#FF3B30' }]}>
                    {obdData.isConnected ? 'Conectado (Simulação)' : 'Desconectado'}
                  </Text>
                </View>
                <Text style={styles.obdStatusText}>
                  📊 Modo Simulação - Dados simulados para demonstração
                </Text>
              </View>
            </View>
          )}

          {!isTripActive && (
            <TouchableOpacity style={styles.primaryButton} onPress={startTrip}>
              <Text style={styles.buttonText}>🚗 Iniciar Viagem Eco</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('history')}>
            <Text style={styles.secondaryButtonText}>📊 Histórico de Viagens</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('obd')}>
            <Text style={styles.secondaryButtonText}>🔌 Conectar OBD-II</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert('Saque', 'Solicitando saque PIX...')}>
            <Text style={styles.secondaryButtonText}>💰 Vender $CDRIVE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={() => setScreen('welcome')}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'history') {
    return (
      <ScrollView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.title}>🌱 CarbonDrive</Text>
          <Text style={styles.subtitle}>Histórico de Viagens</Text>
        </View>
        <View style={styles.dashboard}>
          {tripHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma viagem registrada ainda</Text>
              <Text style={styles.emptySubtext}>Inicie uma viagem para ver o histórico aqui</Text>
            </View>
          ) : (
            tripHistory.map((trip) => (
              <View key={trip.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{trip.date}</Text>
                  <View style={styles.historyHeaderRight}>
                    <Text style={styles.historyEcoScore}>Eco: {trip.ecoScore}/100</Text>
                    {trip.hasObdData && (
                      <Text style={styles.historyObdBadge}>📊 OBD-II</Text>
                    )}
                  </View>
                </View>
                <View style={styles.historyStats}>
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatValue}>{trip.distance} km</Text>
                    <Text style={styles.historyStatLabel}>Distância</Text>
                  </View>
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatValue}>{trip.duration}</Text>
                    <Text style={styles.historyStatLabel}>Duração</Text>
                  </View>
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatValue}>{trip.carbonSaved} kg</Text>
                    <Text style={styles.historyStatLabel}>CO²</Text>
                  </View>
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatValue}>{trip.tokensEarned}</Text>
                    <Text style={styles.historyStatLabel}>$CDRIVE</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('dashboard')}>
            <Text style={styles.buttonText}>← Voltar ao Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'obd') {
    return (
      <ObdConnectionScreen
        onBack={() => setScreen('dashboard')}
        onConnected={handleObdConnected}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#6C757D',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  form: {
    padding: 20,
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  buttons: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  backText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  dashboard: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  tripCard: {
    backgroundColor: '#E8F5E8',
    borderColor: '#30D158',
    borderWidth: 2,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
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
  endTripButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#30D158',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6C757D',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyHeaderRight: {
    alignItems: 'flex-end',
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  historyEcoScore: {
    fontSize: 14,
    color: '#30D158',
    fontWeight: '500',
    marginBottom: 2,
  },
  historyObdBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyStat: {
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  historyStatLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  obdCard: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  obdDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  obdDataItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  obdDataLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  obdDataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  obdStatusContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  obdStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  obdStatusLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginRight: 8,
  },
  obdStatusValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  obdStatusText: {
    fontSize: 11,
    color: '#6C757D',
    marginTop: 2,
  },
});