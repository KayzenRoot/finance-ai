# Auditoria dos GitHub Apps

Status: inventário visual concluído; Source Pack integrado pela PR #1. Checks e limites de configuração revalidados em 2026-10-22 para o M00.

## Método e limites

O inventário foi transcrito das capturas da página de GitHub Apps instalados na conta pessoal KayzenRoot. A presença do botão `Configure` e do nome do app comprova que ele aparece na lista da conta, mas não revela a seleção de repositórios, as permissões efetivas, o plano, nem se o serviço executa no Finance AI.

Na PR #1, CI #12 (run `39783505384`) e CodeQL Actions #12 (run `39783505477`) passaram. Após o merge, CI (run `39783841804`), CodeQL Actions (run `39783841695`), Dependabot config (run `119841761656`) e Socket Security “Project Report” (run `119841716398`) passaram em `main`. O run npm do Dependabot (run `39783878739`) falhou por falta de `package.json`; o scaffold agora adiciona o manifesto/lockfile. Essa evidência comprova esses apps no repositório; não comprova outros apps da lista.

A branch `main` foi observada `protected:false`, sem required checks. A integração GitHub disponível não tem permissão administrativa para alterar regras de proteção. Secret scanning e push protection devem ser conferidos no Settings; não afirmar que estão ativos até confirmação.

## Solicitações de permissões

As capturas mostram solicitação de atualização de permissões para Google AI Studio, Greptile Apps, Qwen Coding Agent e Vercel. A atualização só entra em vigor após aprovação; sem aprová-la, o app mantém as permissões já concedidas e pode não funcionar como esperado caso a função dependa da permissão nova. Revisar cada mudança e o repositório solicitado antes de aprovar. A lista, por si só, não é justificativa para ampliar acesso.

## Inventário e decisão para Finance AI

| Aplicativo | Área esperada | Decisão nesta fase |
|---|---|---|
| ChatGPT Codex Connector | Integração de Codex com GitHub | Ferramenta de desenvolvimento, não check de CI. |
| Chromatic.com | Comparação visual de Storybook | FUTURE: avaliar quando houver interface e histórias; plano gratuito tem limite de snapshots. |
| CircleCI App | Execução de CI | Não duplicar GitHub Actions. Manter como alternativa caso haja necessidade concreta de runner/integração. |
| Cirrus CI | Execução de CI | Não duplicar GitHub Actions; cota/plano não comprovados nesta auditoria. |
| Claude | Assistência/revisão de código (função exata não confirmada) | Opcional; não tornar check obrigatório sem confirmar produto, política de dados e custo. |
| Cloudflare Workers and Pages | Hospedagem/serverless | Alternativa de deploy; decidir plataforma no FAI-M00, sem deploy nesta Work Order. |
| Codecov | Relatórios de cobertura | FUTURE: conectar depois que testes reais produzirem relatórios; cobertura de produto ainda não existe. |
| Coinblink Owner Solo Gate | App customizado (função exata não confirmada) | Não vincular ao Finance AI sem validar proprietário, permissões e necessidade. |
| Cursor | Assistência de desenvolvimento | Ferramenta opcional, não check de CI. |
| DigitalOcean | Hospedagem/infraestrutura | Alternativa de deploy; decisão posterior no FAI-M00. |
| Google AI Studio | Acesso a modelos/serviços Google (escopo exato não confirmado) | Opcional; solicitação de permissão pendente. Não aprovar antes de revisar escopo e necessidade. |
| Greptile Apps | Revisão de código com IA (escopo exato não confirmado) | Opcional; solicitação de permissão pendente. Não usar como gate antes de avaliar acesso, qualidade e custo. |
| Linear | Gestão de issues | Redundante para este fluxo: o backlog atual usa GitHub Issues #2–#13. |
| lovable.dev | Criação assistida de aplicações | Ferramenta de desenvolvimento opcional; sem papel necessário no CI. |
| Qwen Coding Agent | Agente de programação (escopo exato não confirmado) | Opcional; solicitação de permissão pendente. Não aprovar antes de revisar escopo e necessidade. |
| Railway App | Hospedagem/deploy | Alternativa; não configurar antes do ADR de hospedagem. |
| Render | Hospedagem/deploy | Alternativa; não configurar antes do ADR de hospedagem. |
| Renovate | Atualizações de dependências | Alternativa ao Dependabot. Manter Dependabot já configurado para evitar bots/PRs duplicados. |
| reviewdog | Anotações de ferramentas de lint/revisão em PR | Opcional; não necessário no baseline, pois os checks já publicam o resultado. |
| Sentry | Monitoramento de erros/desempenho em runtime | Avaliar após existir aplicação implantada; não é check de CI. |
| Socket Security | Análise de risco de dependências/código | Candidato para avaliação após existir manifesto npm; pode complementar ou sobrepor npm audit/Dependency Review. |
| SonarQubeCloud | Qualidade e análise estática de código | Candidato recomendado para M00/scaffold: conta lista o app e o plano OSS é gratuito para organizações open source. Ainda falta comprovar vinculação ao Finance AI e executar um check. |
| StepSecurity Actions Security | Segurança de workflows/supply chain | Candidato a auditoria/hardening dos workflows; plano Community gratuito para repositórios públicos. Não é prova de check ativo no Finance AI. |
| Supabase | Integração com banco e deploy de migrações | Supabase Postgres já foi escolhido como banco; o app ainda não está comprovado ligado a um projeto Finance AI, que não foi criado. |
| Vercel | Hospedagem/deploy | Alternativa de deploy; solicitação de permissão pendente. Decidir no FAI-M00; não aprovar ou publicar agora. |

## Decisão recomendada de pipeline

1. **GitHub Actions fica como o único provedor obrigatório de CI.** Em repositório público, runners padrão são gratuitos; executar em CircleCI e Cirrus em paralelo aumentaria manutenção e tempo sem evidência de ganho.
2. **Manter o baseline atual:** Markdown lint; checks Node condicionais ao scaffold; Dependency Review quando houver alterações de manifests/lockfiles; CodeQL Actions e JS/TS; Dependabot agrupado; permissões mínimas e actions fixadas por SHA completo.
3. **SonarQube Cloud:** integrar depois de confirmar acesso ao Finance AI, plano OSS e configuração da quality gate; então medir se acrescenta achados úteis além de CodeQL sem gerar ruído. Não é check ativo hoje.
4. **StepSecurity:** considerar uma auditoria de segurança do workflow e runtime hardening como melhoria separada, sem adicioná-la como gate até validar o resultado e o custo de manutenção.
5. **Codecov e Chromatic:** avaliar quando houver testes de produto e UI/Storybook, respectivamente.
6. **Hospedagem, Sentry, Supabase App, provedores de IA/agentes e Linear** são integrações de produto/operação; não devem alongar o CI de PR no estágio atual.

Tornar o repositório privado muda as condições de gratuidade dos runners padrão do GitHub Actions e pode alterar elegibilidade de tiers para projetos open source. Revalidar os planos antes da mudança.

## Fontes oficiais consultadas

- [GitHub Actions — cobrança e uso](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [SonarQube Cloud — planos](https://docs.sonarsource.com/sonarqube-cloud/administering-sonarcloud/managing-subscription/subscription-plans)
- [StepSecurity — preços](https://www.stepsecurity.io/pricing)
- [CircleCI — planos](https://circleci.com/pricing/)
- [Chromatic — planos](https://www.chromatic.com/pricing)
- [GitHub — aprovação de permissões atualizadas de apps](https://docs.github.com/en/apps/using-github-apps/approving-updated-permissions-for-a-github-app)
