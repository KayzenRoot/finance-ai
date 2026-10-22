# Pipeline de CI e segurança

Status: configuração inicial proposta na PR FAI-PLAN-001; app de produto ainda sem scaffold. O inventário e as decisões sobre GitHub Apps estão em [github-app-audit.md](github-app-audit.md).

## Pipeline por PR

| Job | Ação | Custo/velocidade |
|---|---|---|
| Markdown | Lint de README e docs | Rápido, sem build de produto |
| Aplicação | Node 24, cache npm, npm ci/audit, lint, typecheck, test:ci e build | Pula somente até existir package.json; sem matriz |
| Dependency Review | Bloqueia nova dependência vulnerável HIGH/CRITICAL | Roda só em PR que altera manifest/lockfile |
| CodeQL Actions | SAST dos workflows | Só quando workflows mudarem |
| CodeQL JS/TS | SAST de código TypeScript/JavaScript | Só quando código/manifests JS/TS mudarem |
| Dependabot | Atualizações agrupadas de Actions e npm | Semanal, PRs pequenos |
| Secret scanning | Detecção nativa do GitHub para repositório público | Ativar/verificar nas configurações |

Jobs independentes rodam em paralelo, cancelam execuções antigas da mesma PR e usam runners padrão. Não há matriz duplicada, E2E em toda alteração trivial, imagem/container ou deploy automático. E2E ampla, banco local Supabase e migrações entram em checks de alto risco/release após o scaffold.

## Regras

- Workflows usam permissões mínimas e ações externas pinadas em SHA completo.
- Eventos de PR usam pull_request; não usar pull_request_target para executar código não confiável.
- CI não recebe secrets de produção e usa somente fixtures sintéticas.
- O check de aplicação exige lockfile e scripts lint, typecheck, test:ci e build quando package.json passar a existir.
- npm audit bloqueia vulnerabilidades HIGH/CRITICAL na árvore instalada.
- Dependency Review usa filtro por manifest/lockfile para não gastar runner em PRs de documentação. Requer Dependency Graph habilitado antes do scaffold.
- Dependabot agrupa minor/patch para limitar volume; major continua revisão separada.
- Tornar o repositório privado pode mudar os limites gratuitos de runners/armazenamento; reavaliar antes da mudança.
- Nenhum workflow publica, faz deploy ou altera dados Supabase.

## Ferramentas e uso nesta fase

- **GitHub Actions:** único provedor obrigatório de CI. Runners padrão são gratuitos e ilimitados enquanto o repositório usar plano público; as condições mudam ao tornar o repositório privado.
- **CodeQL e secret scanning:** recursos nativos apropriados a repositório público; confirmar status efetivo nas configurações.
- **Dependency Review e Dependabot:** configurados; Dependency Review ainda não rodou porque o repositório não possui manifestos/lockfiles. Dependabot para npm começa com o manifesto.
- **SonarQube Cloud:** app visível na conta e plano OSS disponível para organizações open source. Candidato a check complementar depois de confirmar acesso ao Finance AI, elegibilidade e quality gate; ainda não há execução comprovada.
- **StepSecurity:** plano Community gratuito para repositórios públicos; candidato a auditoria/hardening de workflow. Não está comprovado como check ativo neste repositório.
- **Codecov e Chromatic:** avaliar após existirem, respectivamente, relatórios de cobertura e UI/Storybook.
- **CircleCI/Cirrus CI:** opções alternativas, não executar em paralelo ao GitHub Actions sem necessidade concreta.
- **Dependabot vs. Renovate:** manter Dependabot, já configurado; não ligar Renovate em duplicidade.
- O inventário completo e a situação dos pedidos de permissões estão em [Auditoria dos GitHub Apps](github-app-audit.md).

## Links oficiais

- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [CodeQL code scanning](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning)
- [Secret scanning](https://docs.github.com/code-security/secret-scanning/about-secret-scanning)
- [Dependency Review](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review)
- [Dependabot security updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates)
- [SonarQube Cloud plans](https://docs.sonarsource.com/sonarqube-cloud/administering-sonarcloud/managing-subscription/subscription-plans)
- [StepSecurity pricing](https://www.stepsecurity.io/pricing)
- [Supabase pricing](https://supabase.com/pricing)
- [Privy pricing](https://www.privy.io/pricing)
