# 🏆 Queens Puzzle - Sistema de Ranking Inteligente

> **English speakers:** You can read this README in English [here](./README_EN.md)

[![Netlify Status](https://api.netlify.com/api/v1/badges/89cdb707-cd0c-411d-9701-fa89476e5633/deploy-status)](https://app.netlify.com/projects/queens-puzzle/deploys)

Um sistema de ranking para o jogo Queens Puzzle com lógica de ordenação inteligente baseada em pontuação por vitórias, número de partidas jogadas e tempo total.

## 🎯 **Novas Funcionalidades Implementadas**

### **1. Sistema de Ordenação Inteligente**

#### **Pódio Semanal e Mensal:**
- **1º Critério:** Pontuação (maior primeiro)
- **2º Critério:** Número de partidas jogadas (maior primeiro)
- **3º Critério:** Tempo total de **TODOS os dias** (menor primeiro)
- **4º Critério:** Ordem alfabética

#### **Pódio Diário:**
- **1º Critério:** Jogadores com tempo > 0 ficam à frente
- **2º Critério:** Entre jogadores com tempo > 0, ordenar por tempo (menor primeiro)
- **3º Critério:** Entre jogadores com tempo = 0, ordenar alfabeticamente

### **2. Nova Funcionalidade: Contagem de Partidas Jogadas**

O sistema agora considera o **número de partidas jogadas** como critério de desempate, priorizando jogadores que participaram mais vezes durante o período (semana/mês). Isso garante que:

- Jogadores que jogaram mais vezes tenham prioridade sobre aqueles que jogaram menos
- Apenas partidas com tempo > 0 são contadas como "jogadas"
- Jogadores que não participaram (tempo = 0) não são contados nas partidas jogadas

### **3. Exemplos de Cenários**

#### **Cenário 1: Desempate por Número de Partidas Jogadas**
```
Marcelo: 1 vitória, 2 partidas jogadas, tempo total: 44+95 = 139s
James: 1 vitória, 1 partida jogada, tempo total: 75+50 = 125s

Resultado: 1º Marcelo (mais partidas), 2º James (menos partidas)
```

#### **Cenário 2: Domingo com 3 Pontos**
```
Maria: 3 pontos (domingo), 2 partidas jogadas, tempo total: 120+110 = 230s
João: 1 ponto (segunda), 1 partida jogada, tempo total: 100s
Pedro: 0 pontos, 1 partida jogada, tempo total: 130s

Resultado: 1º Maria, 2º João, 3º Pedro
```

#### **Cenário 3: Jogadores com Tempo Zero**
```
João: 100s (participou - 1 partida)
Ana: 0s (não participou - 0 partidas)
Bruno: 0s (não participou - 0 partidas)
Carlos: 0s (não participou - 0 partidas)

Resultado: 1º João, 2º Ana, 3º Bruno, 4º Carlos
```

#### **Cenário 4: Exemplo Real do Usuário**
```
Segunda-feira:
- Jhonny: 15s (1 ponto, 1 partida)
- Marcelo: 19s (0 pontos, 1 partida)
- James: 31s (0 pontos, 1 partida)

Terça-feira:
- Jhonny: 59s (0 pontos, 1 partida)
- Marcelo: 44s (1 ponto, 1 partida)
- James: 75s (0 pontos, 1 partida)

Quarta-feira:
- Jhonny: 60s (0 pontos, 1 partida)
- Marcelo: 65s (0 pontos, 1 partida)
- James: 5s (1 ponto, 1 partida)

Rank semanal final:
1. James (1 ponto, 3 partidas, tempo total: 31+75+5 = 111s)
2. Marcelo (1 ponto, 3 partidas, tempo total: 19+44+65 = 128s)
3. Jhonny (1 ponto, 3 partidas, tempo total: 15+59+60 = 134s)
```

#### **Cenário 5: Priorização por Número de Partidas**
```
Marcelo: 1 vitória, 2 partidas jogadas, tempo total: 139s
James: 1 vitória, 1 partida jogada, tempo total: 125s

Resultado: 1º Marcelo (mais partidas), 2º James (menos partidas)
Mesmo com tempo pior, Marcelo fica em primeiro por ter jogado mais vezes.
```

## 🚀 **Como Usar**

### **Instalação e Configuração:**

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   # Criar arquivo .env.local
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   ```

3. **Executar testes:**
   ```bash
   npm test
   ```

4. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Build para produção:**
   ```bash
   npm run build
   ```

### **Scripts Disponíveis:**
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm test` - Executar testes
- `npm run test:coverage` - Testes com cobertura

## 🧪 **Testes Implementados**

### **Testes de Ordenação:**
- ✅ Pódio diário com jogadores de tempo zero
- ✅ Desempate por tempo total no pódio semanal
- ✅ Cenário complexo com múltiplas vitórias
- ✅ Pódio mensal com desempate por tempo
- ✅ Ordenação alfabética como último critério
- ✅ Nova regra de tempo total de todos os dias
- ✅ Cenário específico do usuário (Jhonny, Marcelo, James)

### **Testes de Robustez:**
- ✅ Validação de parâmetros
- ✅ Tratamento de dados inválidos
- ✅ Casos extremos (fim do ano, ano bissexto)
- ✅ Diferentes fusos horários
- ✅ Defesa contra chamadas sem parâmetros
- ✅ Tratamento de dados nulos/vazios

### **Testes de Componentes:**
- ✅ PlayerStatsPage - Estatísticas detalhadas
- ✅ DarkModeToggle - Alternância de tema
- ✅ TimeInputForm - Formulário de entrada
- ✅ App - Integração geral
- ✅ Acessibilidade (aria-labels, roles)

### **Testes de Integração:**
- ✅ Funções de cálculo com parâmetros válidos
- ✅ Simulação de cenários reais da aplicação
- ✅ Prevenção de erros de chamada sem parâmetros

## 📊 **Cobertura de Testes**

- **186 testes** passando ✅
- **9 suites** de teste
- **96.24%** de cobertura de statements
- **91.53%** de cobertura de branches
- **98.55%** de cobertura de functions
- **96.93%** de cobertura de lines
- **100%** de cobertura das funcionalidades críticas

## 🔧 **Arquitetura**

### **Funções Principais:**
- `calculateDailyPodium()` - Pódio diário com regras especiais
- `calculateWeeklyPodium()` - Pódio semanal com desempate por tempo
- `calculateMonthlyPodium()` - Pódio mensal com desempate por tempo
- `calculatePlayerStats()` - Estatísticas detalhadas por jogador
- `validateTimes()` - Validação de tempos inseridos
- `getWeekRange()` - Cálculo de range semanal
- `getMonthName()` - Formatação de nome do mês

### **Lógica de Ordenação:**
```javascript
// 1. Pontuação (maior primeiro)
if (b.wins !== a.wins) return b.wins - a.wins;

// 2. Número de partidas jogadas (maior primeiro)
if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;

// 3. Tempo total de TODOS os dias (menor primeiro)
if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime;

// 4. Ordem alfabética
return a.name.localeCompare(b.name);
```

### **📅 Cálculo de Períodos (Implementação Técnica):**

#### **Rank Semanal:**
```javascript
// Calcula o início da semana (segunda-feira)
const dayOfWeek = startOfWeek.getDay();
const diffToMonday = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
startOfWeek.setDate(diffToMonday);

// Itera por 7 dias (segunda a domingo)
for (let i = 0; i < 7; i++) {
  const currentDate = new Date(startOfWeek);
  currentDate.setDate(startOfWeek.getDate() + i);
  // Processa cada dia da semana
}
```

#### **Rank Mensal:**
```javascript
// Filtra scores do mês selecionado
const year = selectedDate.getFullYear();
const month = selectedDate.getMonth();

Object.values(scores).forEach(score => {
  const scoreDate = new Date(score.date + 'T12:00:00Z');
  if (scoreDate.getFullYear() === year && scoreDate.getMonth() === month) {
    // Processa apenas scores deste mês
  }
});
```

### **📋 Exemplos Práticos de Períodos:**

#### **Exemplo 1: Rank Semanal**
```
Data selecionada: 15 de janeiro de 2024 (segunda-feira)
Período considerado: 15/01/2024 (segunda) a 21/01/2024 (domingo)

Scores incluídos:
- 15/01/2024 (segunda): João vence
- 16/01/2024 (terça): Maria vence
- 17/01/2024 (quarta): João vence
- 18/01/2024 (quinta): Pedro vence
- 19/01/2024 (sexta): Maria vence
- 20/01/2024 (sábado): João vence
- 21/01/2024 (domingo): Pedro vence (3 pontos)
```

#### **Exemplo 2: Rank Mensal**
```
Data selecionada: 15 de janeiro de 2024
Período considerado: 01/01/2024 a 31/01/2024

Scores incluídos:
- 01/01/2024: João vence
- 07/01/2024: Maria vence (domingo = 3 pontos)
- 15/01/2024: Pedro vence
- 22/01/2024: João vence
- 28/01/2024: Maria vence (domingo = 3 pontos)

Scores NÃO incluídos:
- 31/12/2023: Score de dezembro (mês anterior)
- 01/02/2024: Score de fevereiro (mês posterior)
```

### **Estrutura de Dados:**
```javascript
// Estrutura de um score diário
{
  date: '2024-01-15',
  dayOfWeek: 1, // 0 = domingo, 1 = segunda, etc.
  results: [
    {
      name: 'João',
      time: 100,
      bonusTime: 0,
      totalTime: 100
    }
  ]
}
```

### **Tecnologias Utilizadas:**
- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Testes:** Jest + React Testing Library
- **Deploy:** Netlify
- **Autenticação:** Firebase
- **Estado:** React Hooks (useState, useEffect)

### **Estrutura do Projeto:**
```
queens_puzzle/
├── src/
│   ├── components/          # Componentes React
│   │   ├── App.jsx         # Componente principal
│   │   ├── PlayerStatsPage.jsx
│   │   ├── TimeInputForm.jsx
│   │   └── DarkModeToggle.jsx
│   ├── utils/
│   │   └── calculations.js  # Lógica de cálculo
│   └── main.jsx            # Entry point
├── tests/
│   └── unit/               # Testes unitários
├── public/                 # Assets estáticos
└── package.json
```

## 🎮 **Regras do Jogo**

### **📅 Definição de Períodos:**

#### **Rank Semanal:**
- **Período:** Segunda-feira (00:00) até Domingo (23:59)
- **Cálculo:** A partir de qualquer data, calcula a semana que contém essa data
- **Exemplo:** Se hoje é quarta-feira, considera de segunda a domingo da mesma semana

#### **Rank Mensal:**
- **Período:** Dia 1 (00:00) até o último dia do mês (23:59)
- **Cálculo:** Considera todos os scores do mês da data selecionada
- **Exemplo:** Se hoje é dia 15 de janeiro, considera todos os scores de 1º a 31 de janeiro

### **Sistema de Pontuação:**
- **Dias normais:** 1 ponto por vitória
- **Domingo:** 3 pontos por vitória (peso triplo)

### **Critérios de Desempate:**
- **Pódio Diário:** Tempo menor primeiro, jogadores com zero ficam por último
- **Pódio Semanal/Mensal:** Tempo total de **TODOS os dias** (menor primeiro)
- **Último critério:** Ordem alfabética

### **Validações:**
- **Tempo mínimo:** 1 segundo
- **Tempo máximo:** 999 segundos
- **Bônus domingo:** Máximo 300 segundos
- **Jogadores obrigatórios:** Mínimo 2, máximo 10

### **Funcionalidades:**
- **Modo escuro/claro:** Alternância automática
- **Estatísticas detalhadas:** Por jogador e período
- **Persistência:** Dados salvos no Firebase
- **Responsividade:** Funciona em mobile e desktop

## 📝 **Changelog**

### **v2.2.0 - Documentation and Testing Improvements**
- ✨ **README in English** - Complete English version available
- ✨ **Updated test coverage** - 186 tests (96.24% coverage)
- ✨ **Timezone issues resolved** - Tests working in both local and CI environments
- ✨ **Duplicate tests removed** - Cleaner test suite
- 📚 **Enhanced documentation** - Better examples and technical details
- 🧪 **Improved test reliability** - Consistent behavior across environments

### **v2.1.0 - Nova Regra de Desempate por Tempo Total**
- ✨ Implementado desempate por tempo total de **TODOS os dias** (não apenas vitórias)
- ✨ Nova regra mais justa que incentiva participação
- ✨ Mantida ordenação especial para jogadores com tempo zero
- 🧪 Atualizados todos os testes para a nova regra
- 📚 Documentação atualizada com exemplos práticos

### **v2.0.0 - Sistema de Ordenação Inteligente**
- ✨ Implementado desempate por tempo total das vitórias
- ✨ Adicionada ordenação especial para jogadores com tempo zero
- ✨ Melhorada lógica de ordenação em todos os pódios
- 🧪 Adicionados testes robustos para todos os cenários
- 📚 Documentação completa das novas funcionalidades

### **v1.0.0 - Versão Inicial**
- 🎯 Sistema básico de pontuação
- 📊 Pódios diário, semanal e mensal
- 🔐 Autenticação Firebase
- 📱 Interface responsiva
- 🌙 Modo escuro/claro
- 📈 Estatísticas detalhadas
- 🧪 Testes unitários
- 📱 Design responsivo
