# CarbonDrive 🌱

**Plataforma de tokenização de créditos de carbono baseada na blockchain Stellar**

CarbonDrive é uma solução inovadora que permite aos motoristas ganhar tokens $CDRIVE através de práticas de eco-condução, contribuindo para a sustentabilidade ambiental.

## 🚀 Como Executar a Plataforma

### Método Rápido (Recomendado)

1. **Instalar dependências:**
   ```bash
   npm run install:all
   ```

2. **Executar em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

   Isso iniciará automaticamente:
   - Backend na porta 3000
   - Frontend na porta 8080

### Usando VSCode

1. **Via Command Palette (Ctrl+Shift+P):**
   - Digite: `Tasks: Run Task`
   - Selecione: `🚀 Iniciar CarbonDrive (Dev)`

2. **Via Debug (F5):**
   - Selecione: `🚀 Debug Full Stack`

### Execução Manual

**Backend:**
```bash
npm run backend:dev
```

**Frontend:**
```bash
npm run frontend:dev
```

## 📋 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia backend e frontend simultaneamente |
| `npm run backend:dev` | Inicia apenas o backend |
| `npm run frontend:dev` | Inicia apenas o frontend |
| `npm run frontend:build` | Build do frontend para produção |
| `npm run install:all` | Instala todas as dependências |
| `npm run clean` | Remove todas as pastas node_modules |

## 🛠️ Configuração do Ambiente

1. **Variáveis de ambiente:**
   - Configure o arquivo `.env` no diretório `src/backend/`

2. **Dependências:**
   - Node.js >= 18.0.0
   - npm >= 9.0.0

## 🌐 URLs de Acesso

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000
- **Dashboard Motorista:** http://localhost:8080/dashboard
- **Admin Dashboard:** http://localhost:8080/admin

## 💰 Sistema de Conversão

- **1 kg CO² economizado = 1 $CDRIVE**
- **1 $CDRIVE = 0.05 USD**
- **Conversão para BRL:** Cotação automática via AwesomeAPI

## 🔧 Desenvolvimento

### Tarefas do VSCode
- `🚀 Iniciar CarbonDrive (Dev)` - Execução completa
- `🔧 Backend - Desenvolvimento` - Apenas backend
- `🎨 Frontend - Desenvolvimento` - Apenas frontend
- `📦 Instalar Dependências` - Instalar tudo
- `🏗️ Build Frontend` - Build de produção
- `🧹 Limpar node_modules` - Limpeza completa

### Debug
- `🐛 Debug Backend (Node.js)` - Debug do backend
- `🌐 Debug Frontend (Chrome)` - Debug no Chrome
- `🚀 Debug Full Stack` - Debug completo

## 📁 Estrutura do Projeto

```
CarbonDrive_Project/
├── src/
│   ├── backend/          # API Node.js
│   ├── frontend/         # Interface React/Vite
│   └── contracts/        # Contratos Stellar
├── .vscode/              # Configurações VSCode
├── package.json          # Scripts centralizados
└── README.md
```

## 🔐 Blockchain

**ID do contrato $CDRIVE:** `CCVVDPP2VE222NK256KZFUU7WXJ6C2ZPJXUI3BBQIKKWWGYLHZKKMVOU`

## 🤝 Contribuição

1. Clone o repositório
2. Execute `npm run install:all`
3. Execute `npm run dev`
4. Faça suas alterações
5. Teste com `npm run dev`

---

**Desenvolvido com ❤️ pela equipe CarbonDrive**