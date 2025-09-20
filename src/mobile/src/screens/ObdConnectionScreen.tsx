import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useObdReader, ObdData } from '../hooks/useObdReader';

interface ObdConnectionScreenProps {
  onBack: () => void;
  onConnected: (obdData: ObdData) => void;
}

export const ObdConnectionScreen: React.FC<ObdConnectionScreenProps> = ({
  onBack,
  onConnected,
}) => {
  const {
    obdData,
    isScanning,
    isConnecting,
    connectedDevice,
    availableDevices,
    scanForDevices,
    connectToDevice,
    disconnect,
    startReading,
    stopReading,
    isReading,
  } = useObdReader();

  const [showData, setShowData] = useState(false);

  const handleConnect = async (device: any) => {
    try {
      await connectToDevice(device);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao conectar com o dispositivo');
    }
  };

  const handleStartReading = () => {
    startReading();
    setShowData(true);
    onConnected(obdData);
  };

  const handleDisconnect = async () => {
    await disconnect();
    setShowData(false);
  };

  const renderDevice = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnect(item)}
      disabled={isConnecting}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Dispositivo Desconhecido'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
        <Text style={styles.deviceRssi}>RSSI: {item.rssi} dBm</Text>
      </View>
      {isConnecting ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : (
        <Text style={styles.connectText}>Conectar</Text>
      )}
    </TouchableOpacity>
  );

  const renderObdData = () => (
    <View style={styles.dataContainer}>
      <Text style={styles.dataTitle}>Dados OBD-II em Tempo Real</Text>
      
      <View style={styles.dataGrid}>
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>RPM</Text>
          <Text style={styles.dataValue}>{obdData.rpm}</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>MAF (g/s)</Text>
          <Text style={styles.dataValue}>{obdData.maf}</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Velocidade (km/h)</Text>
          <Text style={styles.dataValue}>{obdData.speed}</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Acelerador (%)</Text>
          <Text style={styles.dataValue}>{obdData.throttle}%</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Carga Motor (%)</Text>
          <Text style={styles.dataValue}>{obdData.engineLoad}%</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Combustível (%)</Text>
          <Text style={styles.dataValue}>{obdData.fuelLevel}%</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Temp. Motor (°C)</Text>
          <Text style={styles.dataValue}>{obdData.coolantTemp}°C</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Status</Text>
          <Text style={[
            styles.dataValue,
            { color: obdData.isConnected ? '#30D158' : '#FF3B30' }
          ]}>
            {obdData.isConnected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
      </View>

      {obdData.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro: {obdData.error}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔌 Conexão OBD-II</Text>
        <Text style={styles.subtitle}>Conecte seu dongle ELM327</Text>
      </View>

      {!showData ? (
        <View style={styles.content}>
          {/* Connection Status */}
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Status da Conexão</Text>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: obdData.isConnected ? '#30D158' : '#FF3B30' }
              ]} />
              <Text style={styles.statusText}>
                {obdData.isConnected ? 'Conectado' : 'Desconectado'}
              </Text>
            </View>
            {connectedDevice && (
              <Text style={styles.connectedDevice}>
                Dispositivo: {connectedDevice.name || 'ELM327'}
              </Text>
            )}
          </View>

          {/* Scan Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isScanning && styles.disabledButton]}
            onPress={scanForDevices}
            disabled={isScanning}
          >
            {isScanning ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.buttonText}>Escanando...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>🔍 Escanear Dispositivos</Text>
            )}
          </TouchableOpacity>

          {/* Available Devices */}
          {availableDevices.length > 0 && (
            <View style={styles.devicesContainer}>
              <Text style={styles.devicesTitle}>Dispositivos Encontrados</Text>
              <FlatList
                data={availableDevices}
                renderItem={renderDevice}
                keyExtractor={(item) => item.id}
                style={styles.devicesList}
              />
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Como Conectar:</Text>
            <Text style={styles.instructionText}>
              1. Conecte o dongle ELM327 na porta OBD-II do seu veículo
            </Text>
            <Text style={styles.instructionText}>
              2. Ligue o dongle (LED deve piscar)
            </Text>
            <Text style={styles.instructionText}>
              3. Ative o Bluetooth no seu celular
            </Text>
            <Text style={styles.instructionText}>
              4. Toque em "Escanear Dispositivos"
            </Text>
            <Text style={styles.instructionText}>
              5. Selecione seu dongle ELM327 da lista
            </Text>
          </View>

          {/* Start Reading Button */}
          {obdData.isConnected && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartReading}
            >
              <Text style={styles.buttonText}>📊 Iniciar Leitura de Dados</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          {renderObdData()}
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={stopReading}
            >
              <Text style={styles.controlButtonText}>⏹️ Parar Leitura</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.disconnectButton]}
              onPress={handleDisconnect}
            >
              <Text style={styles.controlButtonText}>🔌 Desconectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  connectedDevice: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#8E8E93',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  devicesContainer: {
    marginBottom: 20,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  devicesList: {
    maxHeight: 200,
  },
  deviceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#6C757D',
  },
  connectText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 8,
    lineHeight: 20,
  },
  dataContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dataItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
    textAlign: 'center',
  },
  dataValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  stopButton: {
    backgroundColor: '#FF9500',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
