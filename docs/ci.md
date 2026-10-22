# Pipeline de CI e segurança

Status: configuração inicial na PR FAI-PLAN-001. O app ainda não tem scaffold; o check de aplicação fica preparado para começar assim que o manifesto e lockfile existirem.

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

Jobs independentes rodam em paralelo, cancelam execuções antigas da mesma PR e usam runners padrão. Não há matriz duplicada, E2E em toda alteração trivial, imagem/container ou deploy automático. E2E ampla, banco local Supabase e migrações são incluídos em checks de alto risco/release após o scaffold.

## Regras

- Workflows usam permissões mínimas e ações externas pinadas em SHA completo.
- Eventos de PR usam pull_request; não usar pull_request_target para executar código não confiável.
- CI não recebe secrets de produção e usa apenas fixtures sintéticas.
- O check de aplicação exige lockfile e scripts lint, typecheck, test:ci e build quando package.json passar a existir.
- npm audit bloqueia vulnerabilidades HIGH/CRITICAL na árvore instalada.
- Dependency Review fica em workflow com filtro por manifest/lockfile para não gastar runner em PRs de documentação. Requer Dependency Graph habilitado nas configurações antes do scaffold.
- Dependabot agrupa minor/patch para limitar volume; major continua revisão separada.
- SonarQube Cloud será adicionado somente se a auditoria confirmar app instalada, repositório vinculado, plano OSS e check útil sem duplicar CodeQL.
- Tornar o repositório privado pode alterar os limites gratuitos de runners/armazenamento; reavaliar antes da mudança.
- Nenhum workflow publica, faz deploy ou altera dados Supabase.

## Ferramentas

- GitHub Actions: runners padrão são gratuitos em repositórios públicos.
- CodeQL e secret scanning: recursos nativos apropriados a repositório público; confirmar o status efetivo em Settings.
- Dependency Review e Dependabot: usados após manifests e lockfiles existirem.
- SonarQube Cloud: plano OSS pode ser gratuito para projetos públicos, sujeito a confirmar instalação e vinculação.
- Aplicativos Marketplace instalados na conta/repositório ainda precisam ser verificados na tela do GitHub.

## Links oficiais

- [GitHub Actions billing](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [CodeQL code scanning](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning)
- [Secret scanning](https://docs.github.com/code-security/secret-scanning/about-secret-scanning)
- [Dependency Review](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review)
- [Dependabot security updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates)
- [SonarQube Cloud plans](https://docs.sonarsource.com/sonarqube-cloud/administering-sonarcloud/managing-subscription/subscription-plans)
- [Supabase pricing](https://supabase.com/pricing)
- [Privy pricing](https://www.privy.io/pricing)
