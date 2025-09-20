import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { LoginCredentials } from '../types';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(formData);
      // Navigation will be handled by the auth context
    } catch (error: any) {
      Alert.alert(
        'Erro no Login',
        error.response?.data?.error || 'Credenciais inválidas. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={40} color="#007AFF" />
            </View>
            <Text style={styles.title}>CarbonDrive</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
          </View>

          {/* Login Form */}
          <Card style={styles.formCard}>
            <Input
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              leftIcon="mail"
            />

            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              error={errors.password}
              leftIcon="lock-closed"
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
              rightIcon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Ainda não tem uma conta? </Text>
              <Button
                title="Cadastre-se"
                onPress={navigateToSignup}
                variant="ghost"
                style={styles.signupButton}
              />
            </View>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Transforme sua direção em economia e recompensas
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6C757D',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#6C757D',
  },
  signupButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
