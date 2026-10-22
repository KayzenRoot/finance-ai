# Checkpoint

Status: FAI-PLAN-001 integrado à main. FAI-WO-M00-001 na PR #16, com Audit Delta 01 para bloquear carteiras autenticadas não autorizadas diretamente no RLS. Todos os cinco workflows no commit funcional `b6c5a84cfd823c8402eac27273fe442f724db0c7` passaram, incluindo Dependency Review, migrações, RLS, RPC de autorização, carteira Web3 sintética e restauração sintética. Commits documentais subsequentes requerem revalidação do HEAD final. Esta é uma proposta de Checkpoint Delta; M00 não foi APPROVED/merged e M01–M11 seguem bloqueados.

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
- `main` está desprotegida (`protected:false`). A integração GitHub conectada não tem permissão administrativa para mudar regras/required checks.
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

FAI-M00: auditar a [PR #16](https://github.com/KayzenRoot/finance-ai/pull/16) no HEAD mais recente e a proteção de titular único recém-implementada. A `main` segue sem branch protection ou required checks; revisão, configuração e comprovação são gates pendentes para merge. A fundação não recebe dados reais até autorização, ambiente privado e backup independente com restauração ensaiada. M01–M11 seguem bloqueados até APPROVED do M00 e dos contratos compartilhados.

## Delta proposto de auditoria (não promovido)

- Segurança: uma carteira Web3 autenticada não obtém espaço financeiro até provisionamento administrativo; RLS exige titular único e vínculo de proprietário. Função pública sem argumento apenas informa autorização da própria sessão.
- Evidências no commit `b6c5a84cfd823c8402eac27273fe442f724db0c7`: [CI 39807369421](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369421), [CodeQL Actions 39807369743](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369743), [CodeQL JS/TS 39807369454](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369454), [Dependency Review 39807369600](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369600), [Supabase 39807369464](https://github.com/KayzenRoot/finance-ai/actions/runs/39807369464). Ambos checks Socket Security passaram.
- Contratos e ameaça inicial: `docs/contracts-m00.md` e `docs/threat-model-m00.md`, criados na mesma branch para auditoria. Ainda não são contratos aprovados na `main`.
- Bloqueios administrativos comprovados: `main.protected=false`, rulesets vazios, checks não exigidos; revisão Copilot não substantiva (quota). `kayzenweb3` tem permissão `read`, insuficiente como comprovante de aprovação independente com requisito de write.
- Pendências: revisar o HEAD final, confirmar configurações de secret scanning/push protection e required checks, obter revisão independente elegível e auditar tests/diff. Projeto hospedado, dados reais e deploy continuam proibidos.
- **Veredito nesta branch:** BLOCKED para merge e M01, mesmo com CI verde; manter PR e issue abertas. Não promover o checkpoint até auditoria final e aprovação.
