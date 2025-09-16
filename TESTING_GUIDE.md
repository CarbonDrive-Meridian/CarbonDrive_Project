# 🧪 Guia de Testes - CarbonDrive no VS Code

## 🚀 Como Testar a Aplicação pelo VS Code

### **Método 1: Debug Integrado (Recomendado)**

#### **1. Abrir o Painel de Debug**
- Pressione `Ctrl + Shift + D` ou clique no ícone de debug na barra lateral
- Você verá as configurações criadas automaticamente

#### **2. Opções de Execução Disponíveis:**

**🚀 Launch Full Stack** (Recomendado)
- Inicia backend e frontend simultaneamente
- Ideal para desenvolvimento completo

**🚀 Launch Backend (Node.js)**
- Apenas o servidor backend na porta 3000
- Com breakpoints e debug completo

**🌐 Launch Frontend (Vite)**
- Apenas o frontend na porta 8080
- Hot reload automático

**🔧 Debug Backend + Frontend**
- Backend com debug + frontend automático

#### **3. Como Executar:**
1. Selecione "🚀 Launch Full Stack" no dropdown
2. Clique no botão ▶️ (Play) ou pressione `F5`
3. Aguarde os serviços iniciarem
4. Acesse: http://localhost:8080

---

### **Método 2: Terminal Integrado**

#### **1. Abrir Terminal Integrado**
- Pressione `Ctrl + `` (backtick) ou `View > Terminal`

#### **2. Executar Backend:**
```bash
cd src/backend
node index.js
```

#### **3. Executar Frontend (novo terminal):**
```bash
cd src/frontend  
npm run dev
```

---

### **Método 3: Tarefas Automatizadas**

#### **1. Abrir Command Palette**
- Pressione `Ctrl + Shift + P`

#### **2. Executar Tarefas:**
- Digite: `Tasks: Run Task`
- Escolha uma das opções:
  - `start-backend` - Inicia apenas o backend
  - `start-frontend` - Inicia apenas o frontend
  - `install-backend-deps` - Instala dependências do backend
  - `install-frontend-deps` - Instala dependências do frontend
  - `test-api-endpoints` - Testa endpoints da API

---

## 🔍 Como Debuggar

### **Breakpoints no Backend:**
1. Abra qualquer arquivo `.js` do backend
2. Clique na margem esquerda para adicionar breakpoint (bolinha vermelha)
3. Execute "🚀 Launch Backend (Node.js)"
4. Faça uma requisição para a API
5. O código pausará no breakpoint

### **Breakpoints no Frontend:**
1. Abra qualquer arquivo `.tsx` do frontend
2. Adicione `debugger;` no código ou use breakpoints do browser
3. Abra DevTools do navegador (`F12`)
4. Execute a ação que ativa o código

---

## 🧪 Testes Manuais

### **1. Teste de Registro:**
- Acesse: http://localhost:8080/register
- Preencha o formulário com dados válidos
- Verifique se as validações funcionam
- Teste o envio do formulário

### **2. Teste de Login:**
- Acesse: http://localhost:8080/login
- Teste credenciais válidas/inválidas
- Verifique redirecionamento após login

### **3. Teste do Dashboard:**
- Acesse: http://localhost:8080/dashboard
- Teste botões de ação
- Verifique simulações ecológicas

### **4. Teste da API:**
- Use a tarefa `test-api-endpoints`
- Ou use ferramentas como Postman/Insomnia
- Endpoints principais:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /motorista/trocar-cdr-por-pix`

---

## 🛠️ Ferramentas Úteis

### **Extensões Recomendadas:**
- **Thunder Client** - Testar APIs diretamente no VS Code
- **Live Server** - Preview de arquivos HTML
- **GitLens** - Controle de versão avançado
- **Prettier** - Formatação automática
- **ESLint** - Linting para JavaScript/TypeScript

### **Atalhos Úteis:**
- `F5` - Iniciar debug
- `Ctrl + F5` - Executar sem debug
- `Shift + F5` - Parar debug
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift + F11` - Step out

---

## 🚨 Solução de Problemas

### **Porta já em uso:**
```bash
# Verificar processos na porta 3000
netstat -ano | findstr :3000
# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

### **Dependências não instaladas:**
- Execute as tarefas `install-backend-deps` e `install-frontend-deps`

### **Erro de CORS:**
- Verifique se o backend está rodando na porta 3000
- Confirme a configuração de CORS no backend

### **Hot Reload não funciona:**
- Reinicie o servidor frontend
- Verifique se não há erros de sintaxe

---

## 📊 Monitoramento

### **Logs do Backend:**
- Visíveis no terminal integrado
- Erros aparecem em vermelho
- Requests são logados automaticamente

### **Logs do Frontend:**
- Console do navegador (`F12`)
- Terminal do Vite mostra hot reloads
- Erros de compilação aparecem no terminal

### **Performance:**
- Use DevTools do navegador
- Aba Network para requisições
- Aba Performance para análise

---

## ✅ Checklist de Testes

- [ ] Backend iniciando sem erros
- [ ] Frontend compilando sem erros  
- [ ] Página de registro carregando
- [ ] Validações de senha funcionando
- [ ] Página de login carregando
- [ ] Dashboard carregando
- [ ] API respondendo às requisições
- [ ] Hot reload funcionando
- [ ] Breakpoints funcionando (se usando debug)

---

**🎯 Dica:** Use sempre o "🚀 Launch Full Stack" para desenvolvimento completo. É a forma mais eficiente de testar toda a aplicação!