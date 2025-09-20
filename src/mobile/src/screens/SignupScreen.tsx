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
import { SignupData } from '../types';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signup, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<SignupData>({
    fullName: '',
    email: '',
    password: '',
    pixKey: '',
  });
  const [errors, setErrors] = useState<Partial<SignupData>>({});

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nome deve ter pelo menos 2 caracteres';
    }

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

    if (!formData.pixKey.trim()) {
      newErrors.pixKey = 'Chave PIX é obrigatória';
    } else if (formData.pixKey.trim().length < 5) {
      newErrors.pixKey = 'Chave PIX deve ter pelo menos 5 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signup(formData);
      // Navigation will be handled by the auth context
    } catch (error: any) {
      Alert.alert(
        'Erro no Cadastro',
        error.response?.data?.error || 'Erro ao criar conta. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
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
            <Text style={styles.subtitle}>Crie sua conta e comece a ganhar</Text>
          </View>

          {/* Signup Form */}
          <Card style={styles.formCard}>
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              autoCapitalize="words"
              error={errors.fullName}
              leftIcon="person"
            />

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
              placeholder="Digite uma senha segura"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              error={errors.password}
              leftIcon="lock-closed"
            />

            <Input
              label="Chave PIX"
              placeholder="Digite sua chave PIX"
              value={formData.pixKey}
              onChangeText={(value) => handleInputChange('pixKey', value)}
              error={errors.pixKey}
              leftIcon="card"
            />
            <Text style={styles.pixHelper}>
              Para você receber suas recompensas
            </Text>

            <Button
              title="Criar Minha Conta"
              onPress={handleSignup}
              loading={isLoading}
              style={styles.signupButton}
              rightIcon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <Button
                title="Faça Login"
                onPress={navigateToLogin}
                variant="ghost"
                style={styles.loginButton}
              />
            </View>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Junte-se a milhares de motoristas que já estão economizando e ganhando
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
  pixHelper: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: -8,
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#6C757D',
  },
  loginButton: {
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
