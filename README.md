# 🏆 Queens Puzzle Ranking

Um sistema de ranking semanal para acompanhar os resultados de jogadores do puzzle das rainhas, com interface moderna e funcionalidades avançadas de estatísticas.

[![Netlify Status](https://api.netlify.com/api/v1/badges/89cdb707-cd0c-411d-9701-fa89476e5633/deploy-status)](https://app.netlify.com/projects/queens-puzzle/deploys)

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Instalação e Configuração](#instalação-e-configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
- [Segurança](#segurança)
- [Deploy](#deploy)

## 🎯 Visão Geral

O **Queens Puzzle Ranking** é uma aplicação web moderna desenvolvida em React que permite registrar e acompanhar os tempos de resolução do puzzle das rainhas por diferentes jogadores. O sistema oferece rankings diários, semanais e mensais, além de estatísticas detalhadas para cada jogador.

### Características Principais

- **Interface Responsiva**: Design moderno com suporte a modo escuro
- **Autenticação Google**: Login seguro via Firebase Auth
- **Rankings Dinâmicos**: Pódios diários, semanais e mensais
- **Estatísticas Avançadas**: Gráficos de evolução e métricas detalhadas
- **Sistema de Permissões**: Controle de acesso baseado em claims customizados
- **Tempo Bônus**: Sistema especial para domingos

## 🚀 Funcionalidades

### Para Administradores
- ✅ Configuração de jogadores
- ✅ Registro de tempos diários
- ✅ Sistema de tempo bônus para domingos
- ✅ Visualização de estatísticas completas

### Para Usuários
- ✅ Visualização de rankings
- ✅ Consulta de estatísticas individuais
- ✅ Modo escuro/claro
- ✅ Interface responsiva

### Rankings Disponíveis
- **Diário**: Pódio do dia selecionado
- **Semanal**: Ranking da semana (domingo vale 3 pontos)
- **Mensal**: Ranking do mês com pontuação ponderada

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18.3.1**: Framework principal
- **Vite 7.0.3**: Build tool e dev server
- **Tailwind CSS 3.4.4**: Framework de estilização
- **Framer Motion 12.23.1**: Animações fluidas
- **Recharts 3.1.0**: Gráficos e visualizações

### Backend & Infraestrutura
- **Firebase**: Plataforma completa
  - **Firestore**: Banco de dados NoSQL
  - **Authentication**: Autenticação Google
  - **Functions**: Backend serverless
  - **Analytics**: Métricas de uso

### Desenvolvimento
- **PostCSS**: Processamento CSS
- **Autoprefixer**: Compatibilidade de navegadores

## 🏗 Arquitetura

### Estrutura de Dados

```
artifacts/queens-puzzle/
├── config/
│   └── players (documento)
│       └── names: string[]
└── public/data/scores/
    └── YYYY-MM-DD (documentos)
        ├── date: string
        ├── dayOfWeek: number
        └── results: array
            ├── name: string
            ├── time: number
            ├── bonusTime: number
            └── totalTime: number
```

### Fluxo de Autenticação

1. **Login Google** → Firebase Auth
2. **Verificação de Claims** → Custom claim `isAllowed`
3. **Controle de Acesso** → Permissões baseadas em claims

### Estados da Aplicação

- `LOADING_AUTH`: Verificando autenticação
- `LOGIN`: Tela de login
- `LOADING_DATA`: Carregando dados
- `SETUP_PLAYERS`: Configuração inicial (apenas admins)
- `READY`: Aplicação pronta

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Firebase

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/queens-puzzle.git
cd queens-puzzle
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication com Google
3. Configure Firestore Database
4. Configure as Functions (opcional)

### 5. Execute o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📁 Estrutura do Projeto

```
queens-puzzle/
├── src/
│   ├── components/           # Componentes React
│   │   ├── DarkModeToggle.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── Notification.jsx
│   │   ├── PlayerSetupModal.jsx
│   │   ├── PlayerStatsPage.jsx
│   │   ├── PodiumIcon.jsx
│   │   └── TimeInputForm.jsx
│   ├── utils/               # Utilitários
│   │   └── calculations.js
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Ponto de entrada
│   ├── index.css            # Estilos globais
│   └── setupTests.js        # Configuração de testes
├── tests/
│   ├── unit/                # Testes unitários
│   │   ├── components/      # Testes de componentes
│   │   │   ├── App.test.jsx
│   │   │   ├── TimeInputForm.test.jsx
│   │   │   ├── PlayerStatsPage.test.jsx
│   │   │   └── DarkModeToggle.test.jsx
│   │   ├── utils/           # Testes de utilitários
│   │   │   └── calculations.test.js
│   │   └── hooks/           # Testes de hooks (futuro)
│   └── __mocks__/           # Mocks globais
│       └── fileMock.js
├── docs/                    # Documentação
│   ├── DOCUMENTACAO_TECNICA.md
│   └── TESTES.md
├── functions/               # Firebase Functions
│   ├── index.js             # Função de claims customizados
│   └── package.json
├── public/                  # Arquivos estáticos
├── index.html               # HTML base
├── package.json             # Dependências
├── tailwind.config.js       # Configuração Tailwind
├── vite.config.js           # Configuração Vite
├── jest.config.cjs          # Configuração Jest
├── babel.config.cjs         # Configuração Babel
└── firebase.json            # Configuração Firebase
```

## 🔧 Funcionalidades Detalhadas

### Sistema de Pontuação

- **Dias Normais**: 1 ponto para o vencedor
- **Domingos**: 3 pontos para o vencedor (sistema bônus)
- **Tempo Total**: Tempo base + tempo bônus (domingos)

### Estatísticas dos Jogadores

- **Vitórias**: Número total de primeiros lugares
- **Pódios**: Número de vezes no top 3
- **Melhor Tempo**: Menor tempo registrado
- **Tempo Médio**: Média de todos os tempos
- **Evolução**: Gráfico de linha com histórico

### Sistema de Permissões

- **Usuários Comuns**: Apenas visualização
- **Administradores**: Registro de tempos e configuração
- **Claims Customizados**: Controle via Firebase Auth

## 🔒 Segurança

### Autenticação
- Login obrigatório via Google
- Claims customizados para controle de acesso
- Tokens JWT gerenciados pelo Firebase

### Dados
- Firestore com regras de segurança
- Dados públicos apenas para visualização
- Configurações restritas a administradores

### Functions
- Validação de entrada
- Tratamento de erros
- Logs de auditoria

## 🚀 Deploy

### Netlify (Recomendado)

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

### Firebase Hosting

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicialize o projeto
firebase init hosting

# Deploy
firebase deploy
```

### Variáveis de Ambiente para Produção

Configure as mesmas variáveis de ambiente no seu provedor de hosting:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# ... outras variáveis
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos issues do GitHub.

---

**Desenvolvido com ❤️ para a comunidade de puzzle das rainhas!**
