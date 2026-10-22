# Pipeline de CI e segurança

Status: CI inicial integrado pela PR #1; checks de aplicação e Supabase adicionados no FAI-M00. O inventário e a evidência por integração estão em [github-app-audit.md](github-app-audit.md).

## Pipeline por PR

| Job | Ação | Custo/velocidade |
|---|---|---|
| Markdown | Lint de README e docs | Rápido, sem build de produto |
| Aplicação | Node 24, cache npm, npm ci/audit, lint, typecheck, test:ci e build | Toda PR; feedback rápido, sem matriz |
| Supabase | Detector de escopo em toda PR; migração local, pgTAP, login EVM, RLS na Data API e export/restore sintético quando necessário | Detector rápido; job Docker é omitido por `if` em mudanças irrelevantes |
| Dependency Review | Bloqueia nova dependência vulnerável HIGH/CRITICAL | Job leve em toda PR; sem dependências novas, aprova sem análise pesada |
| CodeQL Actions | SAST dos workflows | Só quando workflows mudarem |
| CodeQL JS/TS | SAST de código TypeScript/JavaScript | Só quando código/manifests JS/TS mudarem |
| Dependabot | Atualizações agrupadas de Actions e npm | Semanal, PRs pequenos |
| Secret scanning | Detecção nativa do GitHub para repositório público | Ativar/verificar nas configurações |

Jobs independentes rodam em paralelo, cancelam execuções antigas da mesma PR e usam runners padrão. Não há matriz duplicada, E2E em toda alteração trivial ou deploy automático. O detector de escopo do Supabase roda em toda PR. O job Docker/RLS só inicia quando mudam migrações, testes, manifestos, autenticação ou rotas financeiras, incluindo o próprio workflow. Assim checks exigidos permanecem disponíveis mesmo em PRs documentais.

## Regras

- Workflows usam permissões mínimas e ações externas pinadas em SHA completo.
- Eventos de PR usam pull_request; não usar pull_request_target para executar código não confiável.
- CI não recebe secrets de produção e usa somente fixtures sintéticas.
- O check de aplicação exige lockfile e scripts lint, typecheck, test:ci e build.
- npm audit bloqueia vulnerabilidades HIGH/CRITICAL na árvore instalada.
- Dependency Review executa em toda PR para fornecer um check obrigatório estável; quando nenhum manifesto muda, não há dependência nova a rejeitar. A primeira execução com lockfile falhou porque Dependency Graph estava desativado; após a ativação, o check passou no HEAD `d987599deacf7df35a8dc51ef718a7380e162cd0` (run `39806167328`). Isso não substitui revisão de dependências ou análise de licença.
- Dependabot agrupa minor/patch para limitar volume; major continua revisão separada.
- Tornar o repositório privado pode mudar os limites gratuitos de runners/armazenamento; reavaliar antes da mudança.
- Nenhum workflow publica, faz deploy ou altera dados Supabase.
- `main` foi verificada sem proteção de branch. A integração GitHub conectada não tem permissão administrativa para configurar required checks; antes de confiar no gate, exigir checks, bloquear force-push/deleção e exigir PR nas configurações do repositório.

## Ferramentas e uso nesta fase

- **GitHub Actions:** único provedor obrigatório de CI. Runners padrão são gratuitos e ilimitados enquanto o repositório usar plano público; as condições mudam ao tornar o repositório privado.
- **CodeQL e secret scanning:** recursos nativos apropriados a repositório público; confirmar status efetivo nas configurações.
- **Dependency Review e Dependabot:** configuração e workflow presentes. Dependabot está configurado; a primeira execução npm falhou antes do scaffold por não existir `package.json`. O Dependency Review agora passou na PR #16, em `d987599d`, após o Dependency Graph ter sido habilitado.
- **Socket Security:** o app executou seu check “Project Report” com sucesso após a integração da PR #1. Mantê-lo como sinal auxiliar até definir uma política de bloqueio.
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

## Status checks que podem ser exigidos em `main`

- Sempre presentes: `Markdown lint`, `Application checks`, `Dependency Review`, `Detect Supabase scope` e `Migration, RLS and synthetic wallet checks` (este último pode ficar **skipped** após detecção de escopo, condição considerada aprovada pelo GitHub).
- `CodeQL Actions` e `Analyze JavaScript and TypeScript` continuam condicionais ao tipo de alteração; não devem ser adicionados à lista universal de required checks enquanto não houver presença garantida em toda PR. Continuam gates obrigatórios da auditoria quando executados.
- O detector falha de forma segura se não conseguir comparar o HEAD com a base da PR. Comparação é feita com histórico completo e `git diff --name-only`, sem executar código da PR no contexto privilegiado.
- Ao configurar um ruleset: exigir PR, branches atualizadas, bloquear force-push e deleção, exigir os cinco checks estáveis, restringir bypass e definir revisão apropriada. Revalidar numa PR apenas documental e numa PR que altere migrações.
- A conexão atual não possui operação administrativa para aplicar estas regras; a ausência de proteção é bloqueio, não configuração suposta.
