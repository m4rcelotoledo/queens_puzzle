# Queens Puzzle — Regras de projeto e boas práticas

Este documento consolida a auditoria do repositório: domínio (regras de negócio), padrões de código, testes, infraestrutura e orientações para manter consistência em desenvolvimento e em interações assistidas por IA.

---

## 1. Visão do produto

Aplicação web para **registrar tempos** de um grupo no "Queens Puzzle", calcular **pódios** (diário, semanal, mensal) e **estatísticas** por jogador. Dados em **Firestore**; acesso com **Firebase Auth (Google)** e permissão administrativa via **custom claim** `isAllowed`.

---

## 2. Regras de negócio (domínio)

### 2.1 Pontuação

- **Dia útil (seg-sáb):** 1 ponto por vitória no dia.
- **Domingo:** 3 pontos por vitória (`dayOfWeek === 0`).
- Vitória = **1º lugar** no ranking **do dia**, após ordenar os resultados (ver abaixo). Apenas entradas com `totalTime > 0` contam para vitória e para acumulados de tempo/partidas.

### 2.2 Ordenação dentro de um mesmo dia

1. Jogadores com `totalTime > 0` vêm **antes** dos com tempo 0.
2. Entre quem tem tempo > 0: **menor tempo primeiro**; empate → `localeCompare` por **nome** (`a.name.localeCompare(b.name)`).
3. Entre quem tem tempo = 0: **ordem alfabética** por nome.

### 2.3 Pódio diário (`calculateDailyPodium`)

- Retorna `null` se não houver dados válidos ou se **todos** os tempos forem 0.
- Caso contrário, aplica a ordenação do §2.2.

### 2.4 Pódio semanal e mensal (`calculateWeeklyPodium`, `calculateMonthlyPodium`)

Critérios, **nesta ordem**:

1. **Pontuação** (`wins`) — maior primeiro.
2. **Partidas jogadas** (`gamesPlayed`) — maior primeiro. Conta dias em que o jogador teve `totalTime > 0` (não apenas vitórias).
3. **Tempo total** no período (`totalTime`) — **soma de todos os dias** com tempo > 0; **menor** total primeiro.
4. **Nome** — ordem alfabética.

**Semana:** segunda a domingo; início da semana na **segunda-feira** (domingo "volta" 6 dias).

**Mês:** filtra scores cujo `date` cai no mês/ano da data selecionada (uso de `T12:00:00Z` no parse mensal para estabilidade de fuso).

### 2.5 Estatísticas do jogador (`calculatePlayerStats`)

- Percorre todos os scores; em cada dia, ordena como no §2.2 e calcula vitórias (1º), pódios (top 3), melhor tempo, tempo total e histórico.
- Jogadores só entram nos cálculos do dia se tiverem `totalTime > 0` onde aplicável.

### 2.6 Validação de envio de placar (`validateTimes`)

- Deve existir **pelo menos um** jogador com `time + bonusTime > 0` (bônus só conta em domingo).

### 2.7 Jogadores (UI)

- **Setup inicial:** três campos fixos; todos obrigatórios (`PlayerSetupModal`).
- **Gestão posterior:** nomes 2-20 caracteres, sem duplicatas (case-insensitive); remoção com confirmação se houver histórico com tempo > 0 (`PlayerManagerModal`).
- O README menciona limites genéricos (ex.: 2-10 jogadores); o fluxo inicial assume **3** nomes — ao evoluir limites, alinhar **código, testes e documentação**.

### 2.8 Tempos (UI atual)

- Entrada numérica ≥ 0; o README cita faixas (ex.: 1-999 s, bônus domingo até 300 s) como **regra de produto desejada** — validação estrita no backend/UI pode ainda não refletir tudo; mudanças devem ser **consistentes** entre `App.jsx` / formulários e testes.

---

## 3. Padrões de código e arquitetura

### 3.1 Stack

- **React** (hooks), **Vite**, **Tailwind CSS** (v4 no `package.json`), **Framer Motion**, **Recharts**, **Firebase** (app, auth, firestore, analytics).
- **ES modules** (`"type": "module"` no `package.json`).
- Lógica de ranking e datas centralizada em **`src/utils/calculations.js`** — evitar duplicar regras de ordenação em componentes.

### 3.2 Organização

- `src/components/` — UI; componentes recebem dados e callbacks por **props** (`TimeInputForm` é exemplo explícito).
- `src/utils/calculations.js` — funções puras exportadas; **JSDoc** em inglês para parâmetros e retornos.
- Comentários no código em **inglês**; textos de interface e mensagens ao utilizador em **português (pt-BR)** onde já é o padrão.
- `functions/` — Cloud Function v2 (`setAllowedUserClaim`) para definir `isAllowed`; região `southamerica-east1`.

### 3.3 Dados e Firestore

- `appId`: `queens-puzzle`.
- Jogadores: `artifacts/{appId}/config/players` — campo `names` (array de strings).
- Scores: `artifacts/{appId}/public/data/scores/{YYYY-MM-DD}` — `date`, `dayOfWeek`, `results[]` com `name`, `time`, `bonusTime`, `totalTime`.

### 3.4 Datas e timezone

- Chaves de dia em ISO `YYYY-MM-DD`; para evitar desvios entre CI e local, preferir padrões já usados nos testes e em `docs/DOCUMENTACAO_TECNICA.md` (ex.: ancoragem `T12:00:00` onde aplicável).
- **Alterar lógica de data** exige rever **testes de cálculo** e cenários de borda (ano bissexto, fim de ano).

### 3.5 UI / acessibilidade

- Manter `dark:` do Tailwind alinhado ao tema (classe `dark` no `documentElement`).
- Onde existir, preservar **aria-labels** e papéis testados (ver testes RTL).

---

## 4. Testes e qualidade

### 4.1 Ferramentas

- **Jest** + **jsdom**; **React Testing Library** + **@testing-library/user-event**.
- Setup global: `src/setupTests.js` — mocks de Firebase, `localStorage`, `matchMedia`, `import.meta.env` / `process.env` para variáveis Vite.

### 4.2 Convenções

- Testes em `tests/unit/**/*.test.{js,jsx}` (e padrões equivalentes em `src/` se existirem).
- Cobertura coletada de `src/components/**` e `src/utils/**` com exclusões definidas em `jest.config.cjs` (alguns componentes estão excluídos da cobertura — manter coerência ao adicionar arquivos).
- **Limiares globais:** statements/lines/functions **≥ 95%** (branches comentados no config).

### 4.3 Ao mudar regras de ranking

1. Atualizar **`calculations.js`**.
2. Atualizar ou adicionar testes em **`tests/unit/utils/calculations.test.js`** (e integração em `App.test.jsx` se o fluxo mudar).
3. Atualizar **README** / exemplos se o comportamento visível ou documentado mudar.

---

## 5. CI e deploy

- Workflow GitHub Actions em `.github/workflows/test.yml` — alinhar comandos com `npm run test:ci` e artefatos esperados (coverage, junit se aplicável).
- **Tags de release:** `.github/workflows/release-tag.yml` corre em **push** a `master`: cria a anotação `v{version}` a partir de `package.json` se essa tag ainda não existir no remoto. Antes de mergear para `master`, atualizar a versão em `package.json` (e lockfile se aplicável).
- Frontend tipicamente em **Netlify**; variáveis `VITE_*` para Firebase. A versão mostrada no rodapé vem de `process.env.VITE_APP_VERSION`, definida no build pelo `vite.config.js` a partir de `package.json`.
- **PWA:** `vite-plugin-pwa` com `registerType: 'autoUpdate'` — o browser obtém um novo service worker após deploys; tráfego Firebase/Google APIs usa `NetworkOnly` para não servir dados em cache.

---

## 6. Checklist para PRs e alterações

- [ ] Regras de negócio alteradas refletidas em **testes** e, se necessário, em **documentação**.
- [ ] Nenhuma divergência silenciosa entre **semanal** e **mensal** nos critérios de desempate (manter paridade salvo requisito explícito em contrário).
- [ ] Novas strings de UI em português consistente com o restante da app.
- [ ] Comentários novos em inglês.
- [ ] `npm run test:ci` (e build se tocar em dependências ou config Vite) passando localmente.

---

## 7. Interações com IA (Cursor / assistentes)

- Pedir mudanças **focalizadas**; evitar refactors amplos não solicitados.
- Para features de ranking: especificar **período** (dia/semana/mês) e **ordem dos critérios** para não ambiguidade.
- Sempre que possível, referir **`calculations.js`** e os **testes** como fonte da verdade.
- Não inventar limites de jogadores/tempos sem cruzar com **código atual** e README.

---

*Última revisão alinhada ao estado do repositório na auditoria interna; atualizar este documento quando regras de produto ou arquitetura mudarem.*
