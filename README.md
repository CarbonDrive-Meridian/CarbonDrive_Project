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

# CarbonDrive Project 

**CarbonDrive** is a B2B2C platform that transforms eco-driving behavior into digital carbon credits.
We use drivers’ GPS data to prove eco-driving, reward them with **$CDRIVE tokens** via micropayments on Stellar, and create a marketplace where these tokens can be cashed out or sold to companies seeking high-quality offsets.

## Problem

- Companies need to offset CO₂ emissions, but most available credits are **outdated**, **low-credibility**, or **hard to audit**.

- Ride-hailing drivers face **high fuel costs** and receive **no incentives to drive efficiently**.


## Solution

**CarbonDrive** connects drivers, companies, and blockchain in a seamless ecosystem:

- Drivers download the app → GPS tracks eco-driving → they earn **$CDRIVE** tokens.

- **Stellar blockchain** settles millions of micro-transactions instantly, at near-zero cost.

- Drivers cash out via PIX, while companies buy credits in bulk to offset emissions.

→ Turning everyday eco-driving into verifiable, blockchain-backed carbon assets.

## How It Works (Workflow)

**Data Collection** – App captures GPS + accelerometer data.

**Impact Calculation** – Fuel saved → CO₂ avoided.

**Tokenization** – Oracle mints **$CDRIVE** tokens on Stellar.

**Driver Rewards** – Instant micropayments in tokens.

**Cash Out** – Convert tokens to Reais via PIX.

**Corporate Offsets** – Companies purchase aggregated credits.

## Why Stellar?

- **Micropayments at scale:** instant, low-cost, auditable.

- **Transparency:** every credit is on-chain → no double counting.

- **Inclusion:** seamless cash-outs to local payment rails like PIX.

## The Team

[Alessandra Sena](https://www.linkedin.com/in/alessandra-ns-sena?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app) - Backend Developer 

[Daniel Augusto](https://www.linkedin.com/in/danielaraujogonncalves/) - Leader

[João Rodrigo](https://www.linkedin.com/in/joaorodrigodias) – Blockchain Developer (Stellar, Soroban)

[Laura Rodrigues](www.linkedin.com/in/laura-rodrigues31) – Frontend Developer

[Pietra Batista](https://www.linkedin.com/in/pietrabatista) – Business & Strategy

## Vision

- **CarbonDrive** is more than an app — it’s a sustainable ecosystem:

- Drivers save money and earn tokens.

- Companies get high-quality, domestic carbon credits.

- Society benefits from safer driving and reduced emissions.
