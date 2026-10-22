# Checkpoint

Status: Auditoria técnica do FAI-PLAN-001: APPROVED para revisão do titular. O Source Pack continua como proposta até a revisão e integração da PR #1; este delta registra somente o resultado e as pendências.

## Baseline

- Repositório: KayzenRoot/finance-ai.
- Branch principal: main.
- Baseline inicial: 7f6997f8e5797e43f2cc8c1b282998112cb09265.
- Branch de trabalho: planning/FAI-PLAN-001-source-pack.
- HEAD auditado antes deste delta de checkpoint: e8815ca93336fe0412cbf83c02fc1054a1ffead1.
- Código de produto: ainda inexistente.
- Banco Finance AI: nenhum projeto selecionado ou criado.
- CI de aplicação: scaffold ainda não existe; lint/test/typecheck/build do produto aguardam package.json e lockfile.
- Open Finance: avaliação documental; nenhuma integração.
- Dados reais: proibidos no repositório público.

## Evidência observada

- PR de planejamento: [#1](https://github.com/KayzenRoot/finance-ai/pull/1), aberta para revisão do titular; sem merge.
- Issues FAI-M00 a FAI-M11: #2–#13.
- CI #10 `39779473326`, no HEAD auditado acima, passou no Markdown lint e no gate de scaffold. Node e os comandos npm de lint, typecheck, testes e build foram pulados porque não existe package.json.
- CodeQL Actions #10 `39779473276` passou no HEAD auditado `e8815ca93336fe0412cbf83c02fc1054a1ffead1`.
- Dependency Review não executou porque não há manifesto/lockfile. Confirmar Dependency Graph em M00 antes do scaffold.
- Auditoria do FAI-PLAN-001: APPROVED, sem achados bloqueadores; não havia reviews formais nem threads inline na PR durante a verificação.
- As capturas mostram 25 GitHub Apps na conta; quatro mostram pedidos de novas permissões. Veja [auditoria dos apps](github-app-audit.md). Configuração, escopo de repositório e execução fora de GitHub Actions permanecem não comprovados.
- Nesse HEAD de referência, somente CI e CodeQL Actions têm runs comprovados no Finance AI. Isso não comprova SonarQube, Codecov, CircleCI, Cirrus ou outros apps.
- Nenhum merge ou deploy realizado.

## Direção adicionada

- Supabase Postgres selecionado pelo titular; RLS obrigatório.
- Privy solicitado para login com carteira; validar compatibilidade e segurança no M00/M11.
- Criptoativos somente leitura e fora do caixa disponível.
- Cloudinary condicionado a uma funcionalidade de imagem aprovada; não exigido agora.
- GitHub Actions permanece como único CI obrigatório; SonarQube Cloud é candidato após prova de vínculo e elegibilidade OSS.
- Dependabot continua preferido; Renovate, CircleCI e Cirrus não serão ativados em paralelo sem necessidade demonstrada.

## Próximo gate

Revisar o Source Pack, a auditoria de apps e as issues. Fechar ADRs e autenticação em M00, habilitar Dependency Graph e conferir secret scanning/branch checks nas configurações. Verificar o escopo de instalação dos apps candidatos antes de conectá-los. Executar módulos conforme dependências. Revisar limites Supabase Free e estratégia de backup independente antes de dados reais.
