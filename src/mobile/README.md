# CarbonDrive Mobile App

App React Native para o CarbonDrive - Transforme sua direção em economia e recompensas.

## 📱 Funcionalidades

- **Autenticação**: Login e cadastro com PIX key
- **Dashboard**: Métricas de carbono, saldo $CDRIVE e economia
- **Tracking de Viagem**: Rastreamento GPS em tempo real
- **Sistema de Recompensas**: Ganhe $CDRIVE por direção eco-friendly
- **Conversão PIX**: Venda seus tokens por dinheiro real
- **Notificações**: Alertas de viagem e recompensas

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app no seu dispositivo móvel

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Executar no iOS
npm run ios

# Executar no Android
npm run android

# Executar no web
npm run web
```

### Usando Expo Go

1. Instale o app Expo Go no seu dispositivo
2. Execute `npm start`
3. Escaneie o QR code com o Expo Go
4. O app será carregado no seu dispositivo

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── ui/             # Componentes de interface
├── screens/            # Telas da aplicação
├── navigation/         # Configuração de navegação
├── hooks/              # Custom hooks
├── services/           # Serviços de API
├── types/              # Definições TypeScript
└── utils/              # Utilitários
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
API_BASE_URL=http://localhost:3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Permissões

O app requer as seguintes permissões:

- **Localização**: Para rastrear viagens
- **Notificações**: Para alertas de recompensas
- **Câmera**: Para escanear QR codes (futuro)

## 📦 Dependências Principais

- **React Navigation**: Navegação entre telas
- **Expo Location**: Rastreamento GPS
- **Expo Notifications**: Notificações push
- **AsyncStorage**: Armazenamento local
- **React Query**: Gerenciamento de estado da API
- **React Hook Form**: Formulários
- **Zod**: Validação de dados

## 🎨 Design System

O app segue um design system consistente com:

- **Cores**: Azul (#007AFF) como cor primária
- **Tipografia**: Sistema nativo do iOS/Android
- **Componentes**: Baseados em Material Design e Human Interface Guidelines
- **Ícones**: Ionicons para consistência

## 🔄 Integração com Backend

O app se conecta com o backend Node.js/Express:

- **Autenticação**: JWT tokens
- **API REST**: Comunicação HTTP
- **WebSocket**: Atualizações em tempo real (futuro)
- **Stellar**: Integração blockchain

## 📱 Build para Produção

### EAS Build

```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Configurar projeto
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

### Build Local

```bash
# Android
npx expo run:android

# iOS (apenas no macOS)
npx expo run:ios
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage
```

## 📊 Monitoramento

- **Expo Analytics**: Métricas de uso
- **Crashlytics**: Relatórios de crash
- **Performance**: Monitoramento de performance

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:

- Email: suporte@carbondrive.com
- Discord: CarbonDrive Community
- GitHub Issues: Para bugs e sugestões
