# Checkpoint

## Estado canônico atual — 22/10/2026

- **M00 integrado** via PR #16, squash SHA `04797f1d058b5a37586383b60a5a3e6dc4037926`, após 10/10 checks SUCCESS. Issue #2 fechada.
- **Ruleset** #25657724: `main` protegida, `required_approving_review_count=0`, cinco checks exigidos, squash, histórico linear, branch up-to-date, sem force push, deleção ou bypass.
- **M01 integrado**: PR #17 squash-merged na `main` protegida `2fcdb5bf21ddb5f3293585a554f56525d34d2bd7`, issue #3 closed; 49/49 pgTAP e gates de segurança aprovados no HEAD da PR.
- **Evidência de banco**: run [39831779921](https://github.com/KayzenRoot/finance-ai/actions/runs/39831779921), migração/RLS/Web3 e restauração sintéticas SUCCESS. Testes M00/M01 verificados; sem projeto privado de produção, pagamentos ou dados reais.
- **Produção separada**: secret scanning/push protection ainda precisam de confirmação administrativa, bem como backup independente, implantação e testes de carteira real. O histórico abaixo inclui bloqueios anteriores já resolvidos; o estado acima prevalece.

## Baseline

- Repositório: KayzenRoot/finance-ai.
- Branch principal: main.
- Baseline inicial: 7f6997f8e5797e43f2cc8c1b282998112cb09265.
- Branch de planejamento: planning/FAI-PLAN-001-source-pack.
- HEAD integrado na `main`: `2fcdb5bf21ddb5f3293585a554f56525d34d2bd7` (M01, PR #17).
- Branch local de implementação: `feature/fai-m00-secure-foundation`.
- Código de produto: scaffold Next.js 16/Supabase SSR na PR #16, incluindo correção de titular único. Consulte o HEAD atual da PR para evitar referência obsoleta.
- Projeto Supabase hospedado para Finance AI: ainda não criado.
- CI de aplicação: workflows de app e Supabase adicionados. Lint, typecheck, teste PGlite/RLS, `npm audit --audit-level=high` e build passaram localmente; a execução completa com Docker, pgTAP, login Web3 e restauração sintética também passou no GitHub Actions.
- Open Finance: avaliação documental; nenhuma integração.
- Dados reais: proibidos no repositório público.

## Evidência observada

- PR de planejamento: [#1](https://github.com/KayzenRoot/finance-ai/pull/1), squash-merged em `main` no commit `08f3cc45f64e889f00900cadfb409910607875ef` após CI e CodeQL passarem.
- Issues FAI-M00 a FAI-M11: #2–#13.
- CI #12 (run 39783505384) e CodeQL Actions #12 (run 39783505477) passaram no HEAD da PR de planejamento antes do merge.
- Verificações pós-merge em `main` passaram: CI run 39783841804, CodeQL Actions run 39783841695, Dependabot config run 119841761656 e Socket Security “Project Report” run 119841716398.
- Dependabot npm run 39783878739 falhou antes de o manifesto existir (`dependency_file_not_found`); `package.json` e lockfile agora estão no branch M00. GitHub Actions updates estavam em execução quando o checkpoint anterior foi escrito.
- Copilot review não ficou disponível devido ao limite de quota da conta solicitante; não houve revisão substantiva independente nem threads inline na PR #1.
- As capturas mostram 25 GitHub Apps na conta; quatro mostram pedidos de novas permissões. Veja [auditoria dos apps](github-app-audit.md). As capturas comprovam instalação na conta, não escopo por repositório ou funcionamento.
- Socket Security também tem run comprovado. Isso ainda não comprova SonarQube, Codecov, CircleCI, Cirrus CI ou outros apps.
- Histórico: em auditorias anteriores, `main` estava desprotegida. Em 22/10/2026 foi confirmado `protected:true` e ruleset ativo #25657724, com cinco required checks e uma aprovação obrigatória. A conexão GitHub permite verificar, mas não alterar o ruleset.
- A PR #1 foi mesclada; nenhuma aplicação foi implantada e nenhum projeto Supabase de produção foi criado.
- A PR #16 está aberta, sem merge. O teste de container Supabase não pôde ser executado localmente porque Docker não está disponível neste ambiente.
- Na PR #16, CI passou (run `39790095995`), CodeQL JS/TS passou (run `39790095999`), CodeQL Actions passou (run `39790095996`) e Supabase migration/RLS/Web3/restore passou (run `39790096119`). Socket Security PR Alerts e Project Report também passaram.
- Dependency Review passou no HEAD de auditoria `d987599deacf7df35a8dc51ef718a7380e162cd0` (run `39806167328`), após uma primeira tentativa bloqueada pelo Dependency Graph. CI (`39806167432`), CodeQL Actions (`39806167313`), CodeQL JS/TS (`39806167393`), Supabase migration/pgTAP/Web3/RLS/restore (`39806167336`) também passaram nesse HEAD.

## Direção adicionada

- Supabase Postgres selecionado pelo titular; RLS obrigatório.
- M00 escolhe Supabase Auth Web3 nativo para SIWE/Ethereum e SIWS/Solana, com gate de titular no servidor e RLS; Privy é alternativa futura condicionada a requisito.
- Criptoativos somente leitura e fora do caixa disponível.
- Cloudinary condicionado a uma funcionalidade de imagem aprovada; não exigido agora.
- GitHub Actions permanece como único CI obrigatório; SonarQube Cloud é candidato após prova de vínculo e elegibilidade OSS.
- Dependabot continua preferido; Renovate, CircleCI e Cirrus não serão ativados em paralelo sem necessidade demonstrada.

## Próximo gate

FAI-M00: auditar a [PR #16](https://github.com/KayzenRoot/finance-ai/pull/16) no HEAD mais recente e a proteção de titular único recém-implementada. O ruleset de proteção da `main` está ativo e comprovado. Permanecem pendentes uma aprovação independente elegível, configuração recomendada de invalidar reviews antigos (atualmente desativada), verificação administrativa de secret scanning/push protection e revalidação do HEAD após o presente delta documental. A fundação não recebe dados reais até autorização, ambiente privado e backup independente com restauração ensaiada. M01–M11 seguem bloqueados até APPROVED do M00 e dos contratos compartilhados.

## Delta proposto de auditoria (não promovido)

- Segurança: uma carteira Web3 autenticada não obtém espaço financeiro até provisionamento administrativo; RLS exige titular único e vínculo de proprietário. Função pública sem argumento apenas informa autorização da própria sessão.
- Evidências no commit `b6c5a84cfd823c8402eac27273fe442f724db0c7`: [CI 39807369421](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369421), [CodeQL Actions 39807369743](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369743), [CodeQL JS/TS 39807369454](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369454), [Dependency Review 39807369600](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369600), [Supabase 39807369464](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369464). Ambos checks Socket Security passaram.
- Contratos e ameaça inicial: `docs/contracts-m00.md` e `docs/threat-model-m00.md`, criados na mesma branch para auditoria. Ainda não são contratos aprovados na `main`.
- Histórico do Delta 01: `main.protected=false` e rulesets ausentes na época; resolvido em 22/10/2026 pelo ruleset #25657724. Revisão Copilot não substantiva (quota). `kayzenweb3` tem permissão `read`, sem aprovação independente comprovada.
- Pendências: revisar o HEAD final, confirmar configurações de secret scanning/push protection e required checks, obter revisão independente elegível e auditar tests/diff. Projeto hospedado, dados reais e deploy continuam proibidos.
- **Veredito nesta branch:** BLOCKED para merge e M01, mesmo com CI verde; manter PR e issue abertas. Não promover o checkpoint até auditoria final e aprovação.

### Audit Delta 02 — checks exigíveis sem deadlock (proposto)

- A PR #16 foi corrigida para executar sempre o detector `Detect Supabase scope` e o job `Dependency Review`; o job pesado `Migration, RLS and synthetic wallet checks` usa `needs` e `if` conforme alterações relevantes. A implementação aguarda validação dos workflows no HEAD definitivo.
- Antes dessa correção, os workflows usavam `paths` no gatilho; torná-los globalmente obrigatórios faria PRs documentais aguardarem checks ausentes. Os critérios e nomes de required checks estão em [ci.md](ci.md).
- Os dois workflows CodeQL continuam condicionais, portanto NÃO são elegíveis como checks universais neste desenho; usar seus resultados como gate de auditoria nos PRs em que são acionados.
- Branch rules foram configuradas pelo administrador no ruleset #25657724 (sem mudança no código da `main`). A confirmação de secret scanning/push protection e revisão independente continuam pendentes.

### Audit Delta 03 — proteção de branch aplicada, merge ainda bloqueado

**Registro verificável em 22/10/2026:** ruleset [Finance AI - Main Protection](https://github.com/KayzenRoot/finance-ai/rules/25657724), `enforcement=active`, `conditions.ref_name.include=["~DEFAULT_BRANCH"]`, `bypass_actors=[]` e `main.protected=true`. Impõe PR, **1 aprovação**, resolução de threads, histórico linear, **squash** como único merge permitido, bloqueio de deleção e force-push, `strict_required_status_checks_policy=true` e os cinco checks obrigatórios: `Markdown lint`, `Application checks`, `Dependency Review`, `Detect Supabase scope`, `Migration, RLS and synthetic wallet checks` (app GitHub Actions). Branch `main` ainda em `08f3cc45f64e889f00900cadfb409910607875ef`, sem merge.

**Evidência antes deste commit documental:** [CI 39810344512](https://github.com/KayzenRoot/finance-ai/actions/runs/39810344512), [CodeQL Actions 39810344167](https://github.com/KayzenRoot/finance-ai/actions/runs/39810344167), [CodeQL JS/TS 39810344213](https://github.com/KayzenRoot/finance-ai/actions/runs/39810344213), [Dependency Review 39810344222](https://github.com/KayzenRoot/finance-ai/actions/runs/39810344222), [Supabase 39810344171](https://github.com/KayzenRoot/finance-ai/actions/runs/39810344171) com 21 pgTAP; Socket Security PR Alerts e Project Report SUCCESS. O GitHub ainda informa `mergeable_state=blocked` na PR #16: **não autoriza merge**.

**Gates restantes:** `dismiss_stale_reviews_on_push=true` confirmado em leitura posterior do mesmo ruleset; ajuste administrativo realizado. O Copilot publicou apenas `COMMENTED` por limite de quota, sem `APPROVED`; não há revisor independente elegível comprovado. Secret scanning e push protection não puderam ser verificados com a permissão conectada. Sem dados reais, deploy, backups de produção ou M01. Este delta é **proposto** até revisão e promoção pós-merge.

### Audit Delta 04 — aprovação antiga invalidada (proposto)

Em segunda consulta ao ruleset #25657724, foi confirmado `dismiss_stale_reviews_on_push=true`: aprovações anteriores são invalidadas com novos commits. Esta correção administrativa não altera o código da main. O HEAD documental `87494985f41b4799db940cce688bb20bfd48156f` passou 10/10 checks (CI 39818608427, CodeQL Actions 39818608348, CodeQL JS/TS 39818608358, Dependency Review 39818608363 e Supabase 39818608446, mais Socket/CodeQL). O novo commit documental precisa de revalidação própria. Ainda não há APPROVED independente nem confirmação acessível de secret scanning/push protection: M00 **BLOCKED**, PR #16 aberta e M01 não iniciado.

### Audit Delta 06 — titular encerra obrigação de review humano (22/10/2026)

**Política vigente, substituindo os requisitos humanos dos Deltas históricos:** o titular decidiu **0 approvals** no ruleset `Finance AI - Main Protection`, preservando PR, required checks e segurança. Não exigir `kayzenweb3` nem outra pessoa como reviewer; o workflow de solicitação automática foi retirado da PR #16. A conexão ao GitHub **não permite modificar o ruleset**, então `required_approving_review_count=0` só é efetivo após confirmação via API da alteração do administrador. No momento da primeira consulta deste delta, a regra ainda exigia `1`.

A PR #16 permanece aberta na branch `feature/fai-m00-secure-foundation`; conferir novo HEAD e checks após este commit. O critério para encerramento técnico do M00 é a evidência objetiva de migração/RLS, CI e Sonar/CodeQL se aplicáveis, registro da decisão de risco e aceitação de squash merge normal pelo GitHub sem bypass. Recursos de produção, secret scanning/push protection e backups reais são verificações de pré-produção; **não bloquear a escrita do M01 por ausência de infraestrutura de produção**. Dados reais e deploy permanecem proibidos até gates específicos.

### M01 — Delta proposto (não promovido)

A fundação M00 foi integrada por squash normal na PR #16, `main=04797f1d058b5a37586383b60a5a3e6dc4037926`, com 10/10 checks SUCCESS. O GitHub confirmou `required_approving_review_count=0` e 5 required checks. O M01 inicia em `feature/fai-m01-spaces-accounts-transfers` a partir dessa base. Primeira fatia: contas vinculadas por FK composta aos espaços Pessoal/Loja; transferências internas imutáveis via RPC e views security_invoker de saldos/legs; testes pgTAP sintéticos e contrato M01. Até os checks do HEAD e toda a UI estarem validados, M01 permanece IN PROGRESS, sem deploy, dados reais nem integração à main.

### M01 — Delta de reforço REST e manutenção (proposto, 22/10/2026)

Na PR #17 foram incluídos testes end-to-end **na Data API Supabase local** em `tests/auth/web3-smoke.mjs`, sem dados reais: dono/space, conta de outro titular bloqueada, view `security_invoker`, inserção direta de transferências bloqueada, duas pernas internas de soma zero, revogação e precisão em centavos. Incluída opção de renomear conta ativa no dashboard mediante Server Action autenticada e RLS. A versão de código imediatamente anterior `bd24e14485f8befafd12abc319ee56d15c54875c` teve required checks SUCCESS e Supabase 49/49 pgTAP; **estes testes REST novos não estão cobertos pelo bundle anterior**. Após esta mudança, revalidar o HEAD integral e registrar runs concretos. PR fica DRAFT e M01 não integrado até comprovar critérios de aceitação; sem deploy, gastos, dados reais ou revisão humana obrigatória.

### M01 — Evidence Bundle confirmado no HEAD de código f4096b1f (22/10/2026)

- **Base** `04797f1d058b5a37586383b60a5a3e6dc4037926`; **HEAD de código validado** `f4096b1fc886877bde781e9fcc8c978381ab13a3`. Integração à main: **não realizada**, PR #17 mantida DRAFT.
- **CI / aplicação** [39833918956](https://github.com/KayzenRoot/finance-ai/actions/runs/39833918956): SUCCESS (Markdown lint, ESLint, typecheck, test:ci, build, npm audit).
- **Supabase/RLS/Web3** [39833918885](https://github.com/KayzenRoot/finance-ai/actions/runs/39833918885): SUCCESS; `Files=2, Tests=49, Result: PASS` (pgTAP M00=21, M01=28). Smoke API EVM sintética comprova contas Pessoal/Loja, tentativa de conta forjada bloqueada, RLS invoker, INSERT de transferência direto negado, RPC de transferência válida com soma zero, leitura estrangeira/revogação negadas. Export/restauração sintética concluída.
- **Supply chain** [39833919180](https://github.com/KayzenRoot/finance-ai/actions/runs/39833919180): Dependency Review SUCCESS; **CodeQL JS/TS** [39833918868](https://github.com/KayzenRoot/finance-ai/actions/runs/39833918868) SUCCESS; **Socket Security** Pull Request Alerts/Project Report SUCCESS. Check agregado de code-scanning foi `neutral` e não é required, o job CodeQL JS/TS passou.
- **Proteção main**: ruleset #25657724 ativo, 0 aprovações humanas obrigatórias e 5 required checks, todos SUCCESS no HEAD de código. 0 threads pendentes.
- **Riscos pendentes antes de uso real**, não confundidos com CI: não há projeto Supabase privado hospedado, dados financeiros reais, teste E2E de navegador/carteira real, Secret Scanning/Push Protection confirmados administrativamente ou backup independente de produção. Nada disso foi provisionado ou gasto.
- **Status**: módulo pronto para avaliação automatizada final. Este commit documental altera o HEAD; revalidar required checks nele antes de promover ao canônico da main. Não fazer deploy.

### M01 fechado / M02 iniciado (22/10/2026)

A PR #17 foi integrada por squash normal na main `2fcdb5bf21ddb5f3293585a554f56525d34d2bd7`, depois de 5/5 required checks SUCCESS, CodeQL JS/TS e Socket Security SUCCESS; 49/49 pgTAP (21 M00, 28 M01), EVM/Data API sintéticos e restore em CI. Issue #3 encerrada como completed. M02 issue #4 / branch `feature/fai-m02-auditable-ledger`: primeira fatia do ledger auditável, categoria por espaço, RPCs de inclusão/cancelamento/correção e saldos derivados. Status M02 IN PROGRESS até testes, interface, filtros e Evidence Bundle final. Sem deploy, gastos ou dados reais.

### M02 — Evidence Bundle verified on ccf31b03a09abaa48657d424f57b9ca19ac60bf2 (2026-10-22)

- M01: PR #17 merged normally (squash) into protected main at 2fcdb5bf21ddb5f3293585a554f56525d34d2bd7; issue #3 closed as completed.
- M02: PR #18, issue #4, branch feature/fai-m02-auditable-ledger. HEAD of validated code: ccf31b03a09abaa48657d424f57b9ca19ac60bf2; M02 not merged.
- CI: [run 39840031471](https://github.com/KayzenRoot/finance-ai/actions/runs/39840031471) — SUCCESS (Markdown lint, lint, typecheck, tests, build).
- Dependency Review: [run 39840031593](https://github.com/KayzenRoot/finance-ai/actions/runs/39840031593) — SUCCESS.
- CodeQL JS/TS: [run 39840031475](https://github.com/KayzenRoot/finance-ai/actions/runs/39840031475) — SUCCESS. Aggregated CodeQL status neutral (not required); SonarCloud and Socket Security checks SUCCESS.
- Supabase: [run 39840031499](https://github.com/KayzenRoot/finance-ai/actions/runs/39840031499) — SUCCESS; Files=3, Tests=84, Result: PASS (M00 21 + M01 28 + M02 35). Synthetic EVM Data API owner isolation, authenticated entries, immutable correction/cancellation, internal transfers and revocation PASS. Synthetic export/restore PASS.
- M02 delivered: categories by owner/space/type; RLS-protected immutable ledger, exact BRL cents, balance view with neutral internal transfers; SSR interface to create/rename/archive categories, post/correct/cancel entries and filter history by kind, category and date. Filtered history uses a separate reversal lookup to avoid displaying canceled entries as active.
- Findings corrected: non-namespaced pgTAP variables; Next.js protected route requiring Suspense under cache components.
- This document update creates a new HEAD requiring its own checks. Before final promotion validate HEAD, five required checks, CodeQL, Socket Security, and ruleset. No M02 merge, deploy, spending, real financial data, or M03.

### M02 — Correção de integridade pré-READY

Auditoria identificou risco de reescrita silenciosa do saldo/data inicial de conta após lançamentos do M02, sem transferências M01. Adicionado `finance_ledger_reference_guard` para bloquear alterações de `opening_balance_cents` e `opening_balance_date` após existir evento de ledger, preservando renomeação/arquivamento. Acrescentados **2 testes pgTAP** e um negativo EVM REST. Meta: **86 pgTAP** (21+28+37), além da smoke Data API, exigindo novos checks. Bundle anterior no SHA `057acb69c8baf82daa204ef9b031c419f7602d2b`: Supabase [39841322596](https://github.com/KayzenRoot/finance-ai/actions/runs/39841322596) SUCCESS, 84/84, smoke PASS, restore sintético PASS; CI [39841322559](https://github.com/KayzenRoot/finance-ai/actions/runs/39841322559), Dependency [39841322616](https://github.com/KayzenRoot/finance-ai/actions/runs/39841322616), CodeQL JS/TS [39841322554](https://github.com/KayzenRoot/finance-ai/actions/runs/39841322554), SonarCloud e Socket PASS. O job Markdown lint concluiu etapas com sucesso mas status agregado ainda estava IN_PROGRESS na última consulta. **Não utilizar o bundle anterior como PASS no novo commit.** M02 sem merge/deploy/gastos/dados reais; PR DRAFT até todos gates do novo HEAD verdes.

### M02 — 86/86 proven on implementation HEAD `3be49c6380d55b24b7220ef76b37f95f182c2fb4`

- Revalidated GitHub protected main: `2fcdb5bf21ddb5f3293585a554f56525d34d2bd7`. Ruleset #25657724 active; `required_approving_review_count=0`; no bypass; five required checks green, zero unresolved review threads.
- CI [39843603198](https://github.com/KayzenRoot/finance-ai/actions/runs/39843603198): SUCCESS (Markdown lint, application checks, lint, types, unit tests, build). Dependency Review [39843603233](https://github.com/KayzenRoot/finance-ai/actions/runs/39843603233): SUCCESS.
- CodeQL JS/TS [39843603228](https://github.com/KayzenRoot/finance-ai/actions/runs/39843603228): SUCCESS. SonarCloud and Socket Security PR Alerts / Project Report: SUCCESS. Aggregate CodeQL `neutral` is not among required checks.
- Supabase [39843603200](https://github.com/KayzenRoot/finance-ai/actions/runs/39843603200): SUCCESS. Log `Files=3, Tests=86, Result: PASS`; M00=21, M01=28, M02=37. EVM synthetic Data API smoke: owner, scope, immutable correction, denied initial-balance rewrite, transfers, revocation PASS. Synthetic restore rehearsal PASS.
- Review finding fixed: account reference amount and date now freeze after M02 ledger activity; two new pgTAP negative cases and one REST case cover the bypass.
- This checkpoint amendment itself creates a new Git SHA. Promote PR #18 to READY only after all five required checks and the security workflows are checked again against that final SHA. Do not merge or deploy in this work order.

### M02 integrado e M03 iniciado (22/10/2026)

- A PR #18 foi integrada por squash normal e sem bypass sobre a main protegida `96edc40dfafd8d111574dc1eda5ca7cf2a62cbb0`. Issue #4 fechada como `completed`. No HEAD `416185e1e38925496f4b67f55490462039255aa7`, 5/5 required checks SUCCESS, 86/86 pgTAP, smoke EVM RLS e restauração sintéticos, CI, CodeQL JS/TS, SonarCloud e Socket Security SUCCESS.
- **M03 IN PROGRESS**: issue #5 / branch `feature/fai-m03-payables-receivables` a partir do SHA da main acima. Primeira fatia de tabelas de compromissos, planos recorrentes, settlements 1:1, RPCs e forecast isolado. M03 não declarado pronto antes dos testes sintéticos, interface e Evidence Bundle; não merge/deploy/gastos/dados reais.

### M03 — Correção de integridade dos totais (22/10/2026)

A PR #19 (`feature/fai-m03-payables-receivables`) passou inicialmente com 129 pgTAP, RLS EVM/Data API e backup/restore sintéticos no SHA `6ba22f040bce7294736d3207757d20a587503420`, [run 39847244959](https://github.com/KayzenRoot/finance-ai/actions/runs/39847244959). CI [39847244980](https://github.com/KayzenRoot/finance-ai/actions/runs/39847244980), Dependency Review [39847244957](https://github.com/KayzenRoot/finance-ai/actions/runs/39847244957), CodeQL JS/TS [39847244993](https://github.com/KayzenRoot/finance-ai/actions/runs/39847244993), SonarCloud e Socket Security PASS. Auditoria detectou que a UI calculava totais apenas dos 100 registros paginados. Corrigido por `finance_commitment_summary`, view `security_invoker` com soma SQL completa e exata por titular/espaço/tipo, filtro de status independente, nove novos pgTAP e smoke REST da agregação e RLS. **Novo total previsto 138 pgTAP**; resultados anteriores não servem para novo HEAD. PR segue DRAFT e main M02 protegida `96edc40dfafd8d111574dc1eda5ca7cf2a62cbb0` inalterada. Sem merge/deploy/gastos/dados reais.

### M03 — Evidence Bundle 138/138 no HEAD de implementação `ff64a1152f65bd4217f6f258855d5dc1d56f4a37`

- Branch `feature/fai-m03-payables-receivables`, PR [#19](https://github.com/KayzenRoot/finance-ai/pull/19), issue [#5](https://github.com/KayzenRoot/finance-ai/issues/5), base main protegida `96edc40dfafd8d111574dc1eda5ca7cf2a62cbb0`. PR não integrada.
- **Supabase** [run 39848587460](https://github.com/KayzenRoot/finance-ai/actions/runs/39848587460): SUCCESS, log `Files=4, Tests=138, Result: PASS` (M00 21 + M01 28 + M02 37 + M03 52). Smoke EVM REST sintético confirmou owner, espaço, RLS, previsão sem alterar caixa, liquidação 1:1, bloqueio de transação duplicada, agregação completa `finance_commitment_summary`, revogação; ensaio de exportação e restauração sintética SUCCESS.
- **CI** [run 39848587081](https://github.com/KayzenRoot/finance-ai/actions/runs/39848587081): SUCCESS (Markdown lint, Application checks, lint, typecheck, testes unitários, build). **Dependency Review** [39848587215](https://github.com/KayzenRoot/finance-ai/actions/runs/39848587215): SUCCESS. **CodeQL JS/TS** [39848587328](https://github.com/KayzenRoot/finance-ai/actions/runs/39848587328): SUCCESS. SonarCloud Code Analysis e Socket Security PR Alerts/Project Report SUCCESS. O check genérico CodeQL é `neutral`, não é requerido.
- Ruleset #25657724 ativo, 0 approvals humanos, cinco required checks SUCCESS, 0 threads, mergeable clean, sem bypass. **Finding P1 corrigido:** totais não dependem de limite de 100 itens da interface; view agregada invoker+RLS usa numeric exato em texto.
- **Limites**: CI sintético não valida navegador com carteira real, ambiente Supabase hospedado, Secret Scanning/Push Protection administrativo ou backup externo de produção. Sem deploy, gastos, Pix/boleto, pagamentos, dados financeiros reais ou credenciais.
- **Gate documental:** esta atualização do checkpoint gera novo HEAD. A PR só passa a READY após confirmação dos checks nesse SHA final, sem reaproveitar o bundle do HEAD anterior como prova do novo.

### M03 integrado; M04 iniciado (22/10/2026)

- PR #19 de HEAD `a5b9bac7416b6f1aaa4a897c8e3ff278909c83a3` integrada com squash merge normal e sem bypass na main protegida `62d9fd54b0d850376bb4f7ee430e11075be2c54e`; issue #5 encerrada. Gates no HEAD M03: cinco required SUCCESS, 138/138 pgTAP e EVM Data API sintética, CodeQL JS/TS, SonarCloud e Socket Security SUCCESS.
- M04: issue #6 / branch `feature/fai-m04-debt-register` criada a partir da main acima. Primeira implementação de dívidas/snapshots append-only, RLS, campos desconhecidos NULL, taxas com fonte e unidade explícitas, sem estimativas de custo. **IN PROGRESS; não comprovar testes que ainda não rodaram.** Sem merge M04, deploy, custos ou dados financeiros reais.
