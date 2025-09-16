# GitHub Pages Setup

Este repositório está configurado para deploy automático no GitHub Pages usando GitHub Actions.

## Configuração Automática

O deploy é realizado automaticamente através do workflow `.github/workflows/deploy.yml` sempre que há push ou pull request no branch `main`.

## Configurações Necessárias no GitHub

1. Vá para as configurações do repositório no GitHub
2. Navegue até **Settings** > **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. O workflow será executado automaticamente

## Estrutura do Projeto

- **Frontend**: Localizado em `src/frontend/`
- **Build Output**: `src/frontend/dist/`
- **Base Path**: Configurado para `/CarbonDrive_Project/` em produção

## Scripts Disponíveis

- `npm run build:gh-pages`: Build específico para GitHub Pages
- `npm run build`: Build padrão
- `npm run dev`: Servidor de desenvolvimento

## Arquivos de Configuração

- `.github/workflows/deploy.yml`: Workflow do GitHub Actions
- `src/frontend/vite.config.ts`: Configuração do Vite com base path
- `src/frontend/dist/.nojekyll`: Evita processamento Jekyll

## URL do Site

Após o deploy, o site estará disponível em:
`https://[seu-usuario].github.io/CarbonDrive_Project/`

## Troubleshooting

- Verifique se o GitHub Pages está habilitado nas configurações do repositório
- Confirme que o workflow tem permissões para escrever no repositório
- Verifique os logs do GitHub Actions em caso de falha no deploy