# Checkpoint

Status: Source Pack FAI-PLAN-001 integrado na `main` pela PR #1. O titular autorizou a continuação para FAI-M00; a implementação está sendo preparada como PR separada vinculada à issue #2. Não mesclar esta Work Order.

## Baseline

- Repositório: KayzenRoot/finance-ai.
- Branch principal: main.
- Baseline inicial: 7f6997f8e5797e43f2cc8c1b282998112cb09265.
- Branch de planejamento: planning/FAI-PLAN-001-source-pack.
- HEAD integrado na `main`: `08f3cc45f64e889f00900cadfb409910607875ef`.
- Branch local de implementação: `feature/fai-m00-secure-foundation`.
- Código de produto: scaffold Next.js 16/Supabase SSR em preparação; PR e SHA ainda serão registrados neste checkpoint.
- Projeto Supabase hospedado para Finance AI: ainda não criado.
- CI de aplicação: `package.json` e `package-lock.json` adicionados no branch; testes locais em execução antes da PR.
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

## Direção adicionada

- Supabase Postgres selecionado pelo titular; RLS obrigatório.
- M00 escolhe Supabase Auth Web3 nativo para SIWE/Ethereum e SIWS/Solana, com gate de titular no servidor e RLS; Privy é alternativa futura condicionada a requisito.
- Criptoativos somente leitura e fora do caixa disponível.
- Cloudinary condicionado a uma funcionalidade de imagem aprovada; não exigido agora.
- GitHub Actions permanece como único CI obrigatório; SonarQube Cloud é candidato após prova de vínculo e elegibilidade OSS.
- Dependabot continua preferido; Renovate, CircleCI e Cirrus não serão ativados em paralelo sem necessidade demonstrada.

## Próximo gate

FAI-M00: executar CI completo da PR, validar migração/RLS, login com carteiras sintéticas, export/restore sintético, registrar evidências e conferir a política de segurança do repositório. A fundação não recebe dados reais até o titular revisar a PR, configurar proteção de `main` e haver backup independente hospedado com restauração ensaiada. M01–M11 seguem bloqueados até revisão dos contratos compartilhados.
