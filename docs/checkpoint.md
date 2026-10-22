# Checkpoint

Status: Source Pack, issues e pipeline inicial em revisão na PR FAI-PLAN-001. O inventário visual dos GitHub Apps foi adicionado nesta atualização; não é checkpoint APPROVED.

## Baseline

- Repositório: KayzenRoot/finance-ai.
- Branch principal: main.
- Baseline inicial: 7f6997f8e5797e43f2cc8c1b282998112cb09265.
- Branch de trabalho: planning/FAI-PLAN-001-source-pack.
- Último HEAD auditado antes do inventário: d6d309933d59709e9be747e5dff256131af2ec75.
- Código de produto: ainda inexistente.
- Banco Finance AI: nenhum projeto selecionado ou criado.
- CI de aplicação: scaffold ainda não existe; lint/test/typecheck/build do produto aguardam package.json e lockfile.
- Open Finance: avaliação documental; nenhuma integração.
- Dados reais: proibidos no repositório público.

## Evidência

- PR de planejamento: [#1](https://github.com/KayzenRoot/finance-ai/pull/1), ainda draft.
- Issues FAI-M00 a FAI-M11: #2–#13.
- CI run #4 `39773788629` passou no Markdown lint e no gate de scaffold. Os comandos de aplicação foram pulados porque não existe package.json.
- CodeQL Actions run #4 `39773788823` passou no HEAD `d6d309933d59709e9be747e5dff256131af2ec75`.
- Dependency Review não foi executado porque não há manifesto/lockfile. Confirmar Dependency Graph em M00 antes do scaffold.
- As capturas mostram 25 GitHub Apps na conta; quatro mostram pedidos de novas permissões. Veja [auditoria dos apps](github-app-audit.md). Configuração, escopo de repositório e execução fora de GitHub Actions permanecem não comprovados.
- Evidência de workflow no HEAD auditado contém CI e CodeQL Actions; não comprova SonarQube, Codecov, CircleCI, Cirrus ou outros apps.
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
