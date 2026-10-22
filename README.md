# Finance AI

Assistente financeiro de uso pessoal para organizar as finanças pessoais e da loja, projetar o caixa e explicar prioridades de pagamento com critérios verificáveis.

## Estado do projeto

Planejamento V1 em revisão pela PR FAI-PLAN-001. Não há implementação de produto. O repositório é público: dados financeiros reais, extratos, credenciais, segredos e identificadores pessoais são proibidos em commits, issues e exemplos.

## Hierarquia das fontes

1. docs/checkpoint.md
2. docs/decisions/DECISIONS.md e ADRs aprovados
3. docs/scope.md
4. docs/definition-of-done.md
5. docs/architecture.md
6. docs/requirements.md
7. project overview, security, test plan, deployment e data model
8. docs/backlog.md e issues GitHub

Decisões aprovadas e evidências verificáveis prevalecem sobre memória da conversa. Propostas em revisão não são baseline aprovado.

## Source Pack

- Visão do projeto: docs/project-overview.md
- Requisitos: docs/requirements.md
- Escopo: docs/scope.md
- Arquitetura: docs/architecture.md
- Modelo de domínio: docs/data-model.md
- Segurança e privacidade: docs/security.md
- Plano de testes: docs/test-plan.md
- Implantação e operação: docs/deployment.md
- Backlog modular: docs/backlog.md
- Definition of Done: docs/definition-of-done.md
- Decisões: docs/decisions/DECISIONS.md
- Open Finance: docs/open-finance.md
- Checkpoint: docs/checkpoint.md

## Fluxo

Cada módulo tem Work Order estável e issue GitHub com objetivo, escopo, dependências, critérios de aceite, testes, entregáveis e stop condition. As PRs devem ser pequenas e vinculadas às issues. Trabalho paralelo começa somente depois dos contratos compartilhados estarem congelados.

A implementação só começa depois que este planejamento for revisado, as decisões técnicas bloqueadoras forem fechadas e os Work Orders aplicáveis estiverem aprovados.

## Privacidade

Use somente dados sintéticos em testes. Nunca coloque dados pessoais ou financeiros reais no GitHub, inclusive em issues, prints ou logs.
