# Checkpoint

Status: auditoria técnica do FAI-PLAN-001 aprovada para revisão do titular. O titular autorizou a continuação para FAI-M00; PR #1 permanece aberta e sem merge. O Source Pack segue como proposta até a integração da PR.

## Baseline

- Repositório: KayzenRoot/finance-ai.
- Branch principal: main.
- Baseline inicial: 7f6997f8e5797e43f2cc8c1b282998112cb09265.
- Branch de planejamento: planning/FAI-PLAN-001-source-pack.
- HEAD verificado antes desta correção de evidência: d60a65a4285ca7efe276b064c8110b1e3f89ad21.
- Código de produto: ainda inexistente.
- Banco Finance AI: nenhum projeto selecionado ou criado.
- CI de aplicação: scaffold ainda não existe; lint/test/typecheck/build do produto aguardam package.json e lockfile.
- Open Finance: avaliação documental; nenhuma integração.
- Dados reais: proibidos no repositório público.

## Evidência observada

- PR de planejamento: [#1](https://github.com/KayzenRoot/finance-ai/pull/1), aberta e sem merge; continuação para M00 autorizada pelo titular.
- Issues FAI-M00 a FAI-M11: #2–#13.
- CI #11 (run 39781522129) passou no HEAD d60a65a4285ca7efe276b064c8110b1e3f89ad21: Markdown lint e gate de scaffold passaram; Node e comandos npm foram pulados porque ainda não existe package.json.
- CodeQL Actions #11 (run 39781522477) passou no HEAD d60a65a4285ca7efe276b064c8110b1e3f89ad21.
- Dependency Review não executou porque não há manifesto/lockfile. Confirmar Dependency Graph em M00 antes do scaffold.
- Auditoria técnica do FAI-PLAN-001: APPROVED, sem achados bloqueadores.
- A revisão automática do Copilot foi tentada, mas não ficou disponível devido ao limite de quota da conta solicitante. Não houve revisão substantiva independente nem threads inline.
- As capturas mostram 25 GitHub Apps na conta; quatro mostram pedidos de novas permissões. Veja [auditoria dos apps](github-app-audit.md). As capturas comprovam instalação na conta, não escopo por repositório ou funcionamento.
- Neste HEAD, somente GitHub Actions e CodeQL Actions têm runs comprovados no Finance AI. Isso não comprova SonarQube, Codecov, CircleCI, Cirrus CI ou outros apps.
- Nenhum merge ou deploy foi realizado.

## Direção adicionada

- Supabase Postgres selecionado pelo titular; RLS obrigatório.
- Privy solicitado para login com carteira; validar compatibilidade e segurança no M00/M11.
- Criptoativos somente leitura e fora do caixa disponível.
- Cloudinary condicionado a uma funcionalidade de imagem aprovada; não exigido agora.
- GitHub Actions permanece como único CI obrigatório; SonarQube Cloud é candidato após prova de vínculo e elegibilidade OSS.
- Dependabot continua preferido; Renovate, CircleCI e Cirrus não serão ativados em paralelo sem necessidade demonstrada.

## Próximo gate

FAI-M00: fechar ADRs e autenticação, habilitar/verificar Dependency Graph, conferir secret scanning e branch checks nas configurações, testar a fundação e registrar limites do Supabase Free e estratégia de backup independente antes de dados reais. M01–M11 permanecem bloqueados até revisão dos contratos compartilhados da fundação.
