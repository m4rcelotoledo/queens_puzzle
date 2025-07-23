# 🏆 Queens Puzzle - Sistema de Ranking Inteligente

[![Netlify Status](https://api.netlify.com/api/v1/badges/89cdb707-cd0c-411d-9701-fa89476e5633/deploy-status)](https://app.netlify.com/projects/queens-puzzle/deploys)

Um sistema de ranking para o jogo Queens Puzzle com lógica de ordenação inteligente baseada em pontuação por vitórias e tempo total.

## 🎯 **Novas Funcionalidades Implementadas**

### **1. Sistema de Ordenação Inteligente**

#### **Pódio Semanal e Mensal:**
- **1º Critério:** Pontuação (maior primeiro)
- **2º Critério:** Tempo total de **TODOS os dias** (menor primeiro)
- **3º Critério:** Ordem alfabética

#### **Pódio Diário:**
- **1º Critério:** Jogadores com tempo > 0 ficam à frente
- **2º Critério:** Entre jogadores com tempo > 0, ordenar por tempo (menor primeiro)
- **3º Critério:** Entre jogadores com tempo = 0, ordenar alfabeticamente

### **2. Exemplos de Cenários**

#### **Cenário 1: Desempate por Tempo Total de Todos os Dias**
```
João: 2 vitórias, tempo total: 100+105+90+95 = 390s
Paulo: 1 vitória, tempo total: 130+95+125+110+85 = 545s
James: 1 vitória, tempo total: 120+110+115+105+100 = 550s

Resultado: 1º Paulo, 2º James, 3º João
```

#### **Cenário 2: Domingo com 3 Pontos**
```
Maria: 3 pontos (domingo), tempo total: 120+110 = 230s
João: 1 ponto (segunda), tempo total: 100s
Pedro: 0 pontos, tempo total: 130s

Resultado: 1º Maria, 2º João, 3º Pedro
```

#### **Cenário 3: Jogadores com Tempo Zero**
```
João: 100s (participou)
Ana: 0s (não participou)
Bruno: 0s (não participou)
Carlos: 0s (não participou)

Resultado: 1º João, 2º Ana, 3º Bruno, 4º Carlos
```

#### **Cenário 4: Exemplo Real do Usuário**
```
Segunda-feira:
- Jhonny: 15s (1 ponto)
- Marcelo: 19s (0 pontos)
- James: 31s (0 pontos)

Terça-feira:
- Jhonny: 59s (0 pontos)
- Marcelo: 44s (1 ponto)
- James: 75s (0 pontos)

Quarta-feira:
- Jhonny: 60s (0 pontos)
- Marcelo: 65s (0 pontos)
- James: 5s (1 ponto)

Rank semanal final:
1. James (1 ponto, tempo total: 31+75+5 = 111s)
2. Marcelo (1 ponto, tempo total: 19+44+65 = 128s)
3. Jhonny (1 ponto, tempo total: 15+59+60 = 134s)
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

- **93 testes** passando ✅
- **5 suites** de teste
- **97.98%** de cobertura de statements
- **99.2%** de cobertura de lines
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

// 2. Tempo total de TODOS os dias (menor primeiro)
if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime;

// 3. Ordem alfabética
return a.name.localeCompare(b.name);
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
