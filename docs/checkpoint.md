# Checkpoint

Status: FAI-PLAN-001 integrado à main. FAI-WO-M00-001 na PR #16, com Audit Delta 01 para bloquear carteiras autenticadas não autorizadas diretamente no RLS. O HEAD auditado `b8ea1ce006020b0d4d325277bc0f15ea6ca87ff4` passou todos os dez checks, incluindo os cinco obrigatórios e Supabase/pgTAP (21 testes), RPC de autorização, carteira Web3 sintética e restauração sintética. Commits subsequentes requerem revalidação do novo HEAD. Esta é uma proposta de Checkpoint Delta; M00 não foi APPROVED/merged e M01–M11 seguem bloqueados.

## Baseline

- Repositório: KayzenRoot/finance-ai.
- Branch principal: main.
- Baseline inicial: 7f6997f8e5797e43f2cc8c1b282998112cb09265.
- Branch de planejamento: planning/FAI-PLAN-001-source-pack.
- HEAD integrado na `main`: `08f3cc45f64e889f00900cadfb409910607875ef`.
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

**Gates restantes:** `dismiss_stale_reviews_on_push=false` apesar da política de hardening recomendar `true`; requer ajuste administrativo. O Copilot publicou apenas `COMMENTED` por limite de quota, sem `APPROVED`; não há revisor independente elegível comprovado. Secret scanning e push protection não puderam ser verificados com a permissão conectada. Sem dados reais, deploy, backups de produção ou M01. Este delta é **proposto** até revisão e promoção pós-merge.
