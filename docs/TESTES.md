# 🧪 Documentação dos Testes - Queens Puzzle Ranking

## 📋 Visão Geral

Este documento descreve a implementação de testes unitários para o projeto **Queens Puzzle Ranking**, com **Vitest** + **jsdom** + **React Testing Library** (testes colocados junto ao código em `src/`).

## 🎯 Objetivos dos Testes

### Funcionalidades Testadas
- ✅ **Cálculos de Estatísticas**: Funções de cálculo de rankings e estatísticas
- ✅ **Componentes de Interface**: Renderização e interações dos componentes
- ✅ **Validações**: Verificação de entrada de dados
- ✅ **Acessibilidade**: Testes de navegação e estrutura semântica
- ✅ **Prevenção de Erros**: Testes específicos para evitar regressões

### Cobertura Alcançada
- **229 testes** em **20 ficheiros** (referência ao estado atual do repositório)
- **Limiares em `vite.config.js` (`test.coverage.thresholds`)**: ≥95% em statements, lines e functions (branches não entram no limiar global)
- **Cobertura típica** (exemplo de execução local): ~99% statements, ~93% branches, 100% functions, 100% lines no conjunto reportado
- **Todos os testes passando**: 229/229 (100% de sucesso) quando `npm run test:ci` está verde

## 🏗 Estrutura dos Testes

### Organização dos Arquivos
Os testes ficam **ao lado** do código que exercitam, padrão `*.test.{js,jsx}` (ou `*.spec.*`):

```
src/
├── App.test.jsx
├── main.test.jsx
├── setupVitest.js              # setup global (mocks Firebase, matchMedia, etc.)
├── components/
│   ├── *.jsx
│   └── *.test.jsx
├── hooks/
│   ├── *.js
│   └── *.test.js
└── utils/
    ├── *.js
    └── *.test.js
```

### Configuração
- **Vitest**: runner de testes (Vite)
- **React Testing Library**: Biblioteca para testar componentes
- **jsdom**: Ambiente DOM para testes
- **@vitest/coverage-v8**: cobertura

## 🧪 Testes Implementados

## ⚠️ Lições Aprendidas e Problemas Resolvidos

### Problema de Timezone nos Testes

#### Contexto
Durante o desenvolvimento, encontramos um problema crítico onde os testes passavam localmente mas falhavam no CI (GitHub Actions). O problema estava relacionado à interpretação de datas sem especificação de timezone.

#### Problema Identificado
```javascript
// ❌ PROBLEMÁTICO: Interpretação dependente do timezone local
const selectedDate = new Date('2024-01-01');
// Pode ser interpretado como 2023-12-31 em UTC dependendo do timezone

// ✅ SOLUÇÃO: Especificação explícita de timezone UTC
const selectedDate = new Date('2024-01-01T12:00:00Z');
// Sempre interpretado como 2024-01-01 em UTC
```

#### Impacto
- **Testes locais**: Passavam ✅
- **Testes no CI**: Falhavam ❌
- **Causa**: Diferenças de timezone entre ambiente local e CI

#### Solução Implementada
1. **Correção na função `calculateMonthlyPodium`**:
   ```javascript
   // Antes
   const scoreDate = new Date(score.date + 'T12:00:00');

   // Depois
   const scoreDate = new Date(score.date + 'T12:00:00Z');
   ```

2. **Correção em todos os testes**:
   ```javascript
   // Antes
   const selectedDate = new Date('2024-01-01');

   // Depois
   const selectedDate = new Date('2024-01-01T12:00:00Z');
   ```

#### Testes Afetados e Corrigidos
- ✅ `should handle edge case where no sorting conditions match in monthly podium`
- ✅ `should handle fallback alphabetical sorting in weekly podium`
- ✅ `should handle fallback alphabetical sorting in monthly podium`
- ✅ `should handle edge case where all sorting conditions are equal in monthly podium`

### Testes Duplicados Identificados pelo Copilot

#### Problemas Encontrados
1. **PlayerManagerModal.test.jsx**: Teste duplicado "desabilita botão salvar quando não há jogadores"
2. **calculations.test.js**: Teste duplicado "should handle edge case where no sorting conditions match in monthly podium"

#### Solução
- **Remoção de testes duplicados** para evitar confusão e manutenção desnecessária
- **Consolidação de cenários similares** em um único teste mais abrangente

### Recomendações para o Futuro

#### 1. Padrão para Criação de Datas
```javascript
// ✅ SEMPRE usar timezone explícito
const date = new Date('2024-01-01T12:00:00Z');

// ❌ EVITAR datas sem timezone
const date = new Date('2024-01-01');
```

#### 2. Verificação de Testes Duplicados
- **Revisar regularmente** os testes para identificar duplicações
- **Usar ferramentas de análise** como Copilot para detectar duplicações
- **Consolidar cenários similares** em testes mais abrangentes

#### 3. Testes em Ambiente CI
- **Executar testes no CI** regularmente durante o desenvolvimento
- **Não confiar apenas** em testes locais
- **Usar `npm run test:ci`** para simular ambiente de CI

#### 4. Debug de Problemas de Timezone
```javascript
// Script de debug para verificar interpretação de datas
const debugDate = (dateString) => {
  const date = new Date(dateString);
  console.log('Input:', dateString);
  console.log('Interpreted as:', date);
  console.log('Year:', date.getFullYear());
  console.log('Month:', date.getMonth());
  console.log('Day:', date.getDate());
};

debugDate('2024-01-01');
debugDate('2024-01-01T12:00:00Z');
```

### Resultado Final
- **Todos os testes passando** ✅
- **Cobertura dentro dos limiares** ✅
- **Testes funcionando tanto localmente quanto no CI** ✅
- **Problemas de timezone resolvidos** ✅
- **Testes duplicados removidos** ✅

---

### 1. App principal (`src/App.test.jsx`)

Testa o shell da aplicação com mock de `src/App.jsx` (o arquivo-fonte fica na raiz de `src/`, não em `components/`).

#### Funcionalidades Testadas
- ✅ Renderização da estrutura principal da aplicação
- ✅ Presença de todos os componentes principais
- ✅ Toggle de modo escuro
- ✅ Tela de login
- ✅ Modal de configuração de jogadores
- ✅ Formulário de entrada de tempos
- ✅ Sistema de notificações
- ✅ Página de estatísticas
- ✅ **Integração com funções de cálculo** (novo)
- ✅ **Prevenção de erros de chamada sem parâmetros** (novo)

#### Cenários de Teste
```javascript
// Exemplo de teste de estrutura principal
test('deve renderizar estrutura principal da aplicação', () => {
  render(<div data-testid="app-container"><MockApp /></div>);
  expect(screen.getByTestId('app-container')).toBeInTheDocument();
  expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
  expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
  expect(screen.getByTestId('login-screen')).toBeInTheDocument();
});

// Novo teste de integração
test('deve simular cenário real do App com parâmetros corretos', () => {
  const selectedDate = new Date('2024-01-15');
  const monthName = getMonthName(selectedDate);
  const weekRange = getWeekRange(selectedDate);

  expect(getMonthName).toHaveBeenCalledWith(selectedDate);
  expect(getWeekRange).toHaveBeenCalledWith(selectedDate);
  expect(monthName).toBe('janeiro de 2024');
  expect(weekRange).toBe('08/01 - 14/01');
});
```

### 2. Utilitários de Cálculo (`src/utils/calculations.test.js`)

#### Funções Testadas
- `calculatePlayerStats()`: Cálculo de estatísticas por jogador
- `calculateDailyPodium()`: Pódio diário
- `calculateWeeklyPodium()`: Pódio semanal
- `calculateMonthlyPodium()`: Pódio mensal
- `validateTimes()`: Validação de tempos
- `getWeekRange()`: Formatação do intervalo da semana
- `getMonthName()`: Formatação do nome do mês

#### Cenários de Teste
```javascript
// Exemplo de teste de cálculo de estatísticas
test('deve calcular estatísticas corretas para um jogador', () => {
  const stats = calculatePlayerStats('João', mockScores);
  expect(stats).toEqual({
    name: 'João',
    wins: 1,
    podiums: 2,
    bestTime: 100,
    avgTime: '110',
    timeHistory: [...]
  });
});

// Novos testes de validação
test('deve prevenir erro de chamada sem parâmetros', () => {
  expect(() => getMonthName()).not.toThrow();
  expect(getMonthName()).toBe('');
});

test('deve retornar string vazia para data inválida', () => {
  expect(getMonthName(null)).toBe('');
  expect(getMonthName(undefined)).toBe('');
  expect(getMonthName('invalid')).toBe('');
});
```

### 3. Componente TimeInputForm (`TimeInputForm.test.jsx`)

#### Funcionalidades Testadas
- ✅ Renderização de campos para todos os jogadores
- ✅ Exibição condicional de campos de tempo bônus (domingos)
- ✅ Manipulação de eventos de input
- ✅ Validação de formulários
- ✅ Acessibilidade (labels, tipos de input)

#### Cenários de Teste
```javascript
// Exemplo de teste de interação
test('deve chamar handleTimeChange quando tempo é alterado', () => {
  render(<TimeInputForm {...defaultProps} />);
  const timeInput = screen.getAllByPlaceholderText('Ex: 125')[0];
  fireEvent.change(timeInput, { target: { value: '120' } });
  expect(defaultProps.handleTimeChange).toHaveBeenCalledWith('João', 'time', '120');
});
```

### 4. Componente PlayerStatsPage (`PlayerStatsPage.test.jsx`)

#### Funcionalidades Testadas
- ✅ Renderização de estatísticas detalhadas
- ✅ Exibição de gráficos (com mock do Recharts)
- ✅ Navegação (botão voltar)
- ✅ Tratamento de dados vazios
- ✅ Acessibilidade (headings, botões)

#### Cenários de Teste
```javascript
// Exemplo de teste de renderização
test('deve renderizar estatísticas do jogador corretamente', () => {
  render(<PlayerStatsPage {...defaultProps} />);
  expect(screen.getByText('João Silva - Estatísticas')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument(); // Vitórias
  expect(screen.getByText('95')).toBeInTheDocument(); // Melhor tempo
});
```

### 5. Componente DarkModeToggle (`DarkModeToggle.test.jsx`)

#### Funcionalidades Testadas
- ✅ Alternância entre modo claro/escuro
- ✅ Renderização de ícones corretos
- ✅ Interações de clique
- ✅ Classes CSS apropriadas
- ✅ Acessibilidade

#### Cenários de Teste
```javascript
// Exemplo de teste de interação
test('deve chamar setIsDarkMode quando clicado', async () => {
  const user = userEvent.setup();
  render(<DarkModeToggle {...defaultProps} />);
  const toggleButton = screen.getByRole('button');
  await user.click(toggleButton);
  expect(defaultProps.setIsDarkMode).toHaveBeenCalledWith(true);
});
```

## 🔧 Configuração Técnica

### Dependências de Teste (ver `package.json`)
Principais: `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.

### Configuração Vitest (`vite.config.js` → `test`)
- `environment: 'jsdom'`, `setupFiles: ['./src/setupVitest.js']`
- `include: ['src/**/*.{test,spec}.{js,jsx}']`
- Cobertura v8 (`test.coverage.*`), reporters `text` + `lcov` + junit em `./coverage/junit.xml`
- Alias `@` → `src`; em `VITEST`, `import.meta.env.VITE_APP_VERSION` é definido como `0.0.0-test` para asserções estáveis (ex.: rodapé)

### Setup de Testes (`src/setupVitest.js`)
```javascript
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));
// ... demais mocks Firebase, matchMedia, etc.
```

## 🚀 Execução dos Testes

### Comandos Disponíveis
```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes para CI/CD
npm run test:ci
```

### Saída de Exemplo
```
 RUN  v4.x /path/to/queens_puzzle
      Coverage enabled with v8

 ✓ src/utils/calculations.test.js (68 tests)
 ...
 Test Files  20 passed (20)
      Tests  229 passed (229)
```

## 🔄 CI/CD Pipeline

### GitHub Actions (`.github/workflows/test.yml`)
```yaml
name: Unit Tests
on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [24.x]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: npm ci
      - run: npm run test:ci
      # Codecov opcional; artefatos em coverage/lcov.info e coverage/junit.xml
```

### Execução Automática
- ✅ **Push para `master` / `develop`**: Executa testes
- ✅ **Pull Requests** para `master`: Validação antes do merge
- ✅ **Node.js 24.x** (alinhado a `engines` em `package.json`)

## 📊 Métricas de Qualidade

### Cobertura de Código
Valores exatos variam por alterações no código; o relatório de texto é gerado por `vitest run --coverage`. Exemplo de agregado:
```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|-------------------
All files          |   ~99   |    ~93   |    100  |    100  |
```

### Componentes com 100% de Cobertura
- ✅ `App.jsx` (componente principal)
- ✅ `DarkModeToggle.jsx`
- ✅ `PlayerStatsPage.jsx`
- ✅ `TimeInputForm.jsx`
- ✅ `calculations.js` (utilitários)

## 🔧 Correções Recentes e Melhorias

### Problema Resolvido: Erro de Chamada Sem Parâmetros
**Erro Original**: `Cannot read properties of undefined (reading 'toLocaleDateString')`

#### Causa do Problema
```javascript
// ❌ Código problemático (antes)
{getMonthName()}  // Chamada sem parâmetros
{getWeekRange()}  // Chamada sem parâmetros
```

#### Solução Implementada
```javascript
// ✅ Código corrigido (depois)
{getMonthName(selectedDate)}  // Com parâmetro correto
{getWeekRange(selectedDate)}  // Com parâmetro correto

// ✅ Validação robusta nas funções
export const getMonthName = (selectedDate) => {
  if (!selectedDate || !(selectedDate instanceof Date)) {
    return '';
  }
  return selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};
```

#### Testes de Prevenção Adicionados
```javascript
// Teste específico para prevenir o erro
test('deve prevenir erro de chamada sem parâmetros', () => {
  expect(() => getMonthName()).not.toThrow();
  expect(getMonthName()).toBe('');
});

// Teste de validação de parâmetros
test('deve retornar string vazia para data inválida', () => {
  expect(getMonthName(null)).toBe('');
  expect(getMonthName(undefined)).toBe('');
  expect(getMonthName('invalid')).toBe('');
});
```

### Melhorias na Configuração
- ✅ **Vitest** integrado ao Vite (sem Babel dedicado só para testes)
- ✅ **Cobertura**: `src/components`, `src/utils`, `src/main.jsx` com exclusões em `vite.config.js`
- ✅ **Limiares globais**: statements/lines/functions ≥95%
- ✅ **Cache no CI**: `npm` cache em `actions/setup-node`

### Resultados Atuais
- **229 testes** em **20 ficheiros** (100% de sucesso quando `npm run test:ci` passa)
- **Cobertura** dentro dos limiares definidos no projeto
- **CI/CD** com Node 24.x

## 🎯 Próximos Passos

### Melhorias Futuras
1. **Testes de Integração**: Fluxos completos da aplicação
2. **Testes de Performance**: Métricas de renderização
3. **Testes de Acessibilidade**: Validação WCAG 2.1
4. **Testes E2E**: Cypress para cenários completos

### Expansão de Cobertura
1. **App.jsx**: Componente principal da aplicação
2. **Firebase Functions**: Testes de backend
3. **Hooks Customizados**: Lógica reutilizável
4. **Utilitários Adicionais**: Funções auxiliares

## 📝 Boas Práticas Implementadas

### Estrutura de Testes
- ✅ **Arrange-Act-Assert**: Padrão AAA
- ✅ **Testes Isolados**: Sem dependências externas
- ✅ **Mocks Apropriados**: Firebase, localStorage, etc.
- ✅ **Nomes Descritivos**: Testes auto-documentados

### Acessibilidade
- ✅ **Roles Semânticos**: Verificação de roles adequados
- ✅ **Labels Associados**: Inputs com labels corretos
- ✅ **Navegação por Teclado**: Testes de interação
- ✅ **Estrutura HTML**: Validação de headings

### Performance
- ✅ **Testes Rápidos**: Execução em < 2 segundos
- ✅ **Mocks Eficientes**: Evita chamadas externas
- ✅ **Setup Otimizado**: Reutilização de configurações

---

**Documentação de Testes v1.0** - Queens Puzzle Ranking
