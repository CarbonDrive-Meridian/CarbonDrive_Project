# 🔧 Guia de Solução de Problemas - CarbonDrive Mobile

## 🚨 Problema: Loop Infinito no Expo Go

### ✅ **Solução 1: App Simplificado (Recomendado)**

O app foi simplificado para evitar loops infinitos. Agora ele tem:

- **Tela de Login** simples
- **Dashboard básico** com métricas
- **Sem dependências complexas** que causam loops

### 🛠️ **Como Testar:**

1. **Parar todos os processos:**
```bash
pkill -f "expo" || true
```

2. **Limpar cache:**
```bash
npx expo start --clear
```

3. **Escanear QR code** no Expo Go

### 🔍 **Diagnóstico de Problemas Comuns:**

#### **1. Loop Infinito**
**Causa:** Dependências circulares ou contextos mal configurados
**Solução:** Use o App.tsx simplificado

#### **2. Erro de Metro Bundler**
**Causa:** Cache corrompido
**Solução:**
```bash
npx expo start --clear
# ou
rm -rf .expo
npx expo start
```

#### **3. Erro de Dependências**
**Causa:** Versões incompatíveis
**Solução:**
```bash
npx expo install --check
npx expo install --fix
```

#### **4. Erro de Permissões**
**Causa:** Permissões de localização não configuradas
**Solução:** Verificar app.json

### 📱 **Testando no Dispositivo:**

1. **Instalar Expo Go** no seu celular
2. **Conectar na mesma rede** WiFi
3. **Escanear QR code** que aparece no terminal
4. **Aguardar carregamento** (pode demorar na primeira vez)

### 🐛 **Logs de Debug:**

Para ver logs detalhados:
```bash
npx expo start --dev-client
```

### 🔄 **Reset Completo:**

Se nada funcionar:
```bash
# Parar tudo
pkill -f "expo" || true

# Limpar tudo
rm -rf node_modules
rm -rf .expo
npm cache clean --force

# Reinstalar
npm install
npx expo install --check

# Iniciar
npx expo start --clear
```

### 📞 **Se Ainda Não Funcionar:**

1. **Verificar versão do Node.js:**
```bash
node --version  # Deve ser 18+
```

2. **Verificar versão do Expo CLI:**
```bash
npx expo --version
```

3. **Verificar se o dispositivo está na mesma rede**

4. **Tentar no navegador primeiro:**
```bash
npx expo start --web
```

### ✅ **App Funcionando:**

Quando funcionar, você verá:
- Tela de login com campos de email/senha
- Botão "Entrar" que leva ao dashboard
- Dashboard com métricas do CarbonDrive
- Botão "Sair" para voltar ao login

### 🚀 **Próximos Passos:**

Depois que o app básico funcionar, podemos:
1. Adicionar navegação complexa
2. Integrar com API real
3. Adicionar tracking de localização
4. Implementar sistema de recompensas
