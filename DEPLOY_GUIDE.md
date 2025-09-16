# 🚀 Guia de Deploy - CarbonDrive

## 📋 Visão Geral

Este projeto CarbonDrive está configurado para deploy no **Vercel** como uma aplicação frontend estática. O backend não é deployado no Vercel, apenas o frontend React/Vite.

## 🔧 Configurações de Deploy

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "cd src/frontend && npm install && npm run build",
  "outputDirectory": "src/frontend/dist",
  "installCommand": "cd src/frontend && npm install",
  "framework": "vite",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "src/frontend/dist/**": {
      "includeFiles": "src/frontend/dist/**"
    }
  }
}
```

### .vercelignore
- Ignora arquivos do backend (`src/backend/`)
- Ignora contratos Rust (`src/contracts/`)
- Ignora arquivos de desenvolvimento
- Mantém apenas o necessário para o frontend

## 🚀 Processo de Deploy

### 1. Deploy Automático (Recomendado)
1. Faça push para o branch `main` no GitHub
2. O Vercel detectará automaticamente as mudanças
3. O build será executado automaticamente
4. A aplicação será deployada

### 2. Deploy Manual via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Teste Local do Build
```bash
# Navegar para o frontend
cd src/frontend

# Executar build
npm run build

# Testar localmente
npm run preview
```

## ⚠️ Pontos Importantes

### Frontend Only
- Apenas o frontend é deployado no Vercel
- O backend precisa ser deployado separadamente (ex: Railway, Heroku, etc.)
- Certifique-se de atualizar as URLs da API no frontend para produção

### Variáveis de Ambiente
- Configure as variáveis de ambiente no painel do Vercel
- Exemplo: `VITE_API_URL=https://sua-api-backend.com`

### Estrutura do Projeto
```
CarbonDrive_Project/
├── src/
│   ├── frontend/          # ✅ Deployado no Vercel
│   ├── backend/           # ❌ Ignorado pelo Vercel
│   └── contracts/         # ❌ Ignorado pelo Vercel
├── vercel.json           # Configuração do Vercel
└── .vercelignore         # Arquivos ignorados
```

## 🔍 Troubleshooting

### Build Falha
1. Verifique se `npm run build` funciona localmente
2. Confirme se todas as dependências estão no `package.json`
3. Verifique logs de erro no painel do Vercel

### Rotas não Funcionam
- O `vercel.json` está configurado para SPA (Single Page Application)
- Todas as rotas redirecionam para `/index.html`

### API não Funciona
- Verifique se as URLs da API estão corretas para produção
- Configure CORS no backend para aceitar requisições do domínio do Vercel

## 📊 Status do Build

✅ **Build Local**: Funcionando (463.82 kB gzipped)
✅ **Configuração**: Otimizada para Vite
✅ **Rotas**: Configuradas para SPA
✅ **Arquivos**: Ignorados corretamente

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router + Vercel](https://vercel.com/guides/deploying-react-with-vercel)