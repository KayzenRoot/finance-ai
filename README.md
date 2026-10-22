# Finance AI

Assistente financeiro privado para organizar finanças pessoais e da loja, projetar caixa e explicar prioridades com critérios verificáveis.

## Estado

Planejamento e fundação de CI em revisão pela PR FAI-PLAN-001. Ainda não há aplicação, dados de produto, banco de produção ou deploy. O repositório é público: dados financeiros, endereços de carteira associados ao titular, credenciais, segredos e identificadores pessoais não podem entrar em commits, issues, exemplos, fixtures ou logs.

## Direção da V1

- Espaços Pessoal e Loja separados, contas, lançamentos, obrigações, recebíveis, dívidas, projeções e prioridades explicáveis.
- Supabase Postgres como banco selecionado; RLS e políticas por titular são obrigatórios.
- Login com carteira usando Privy é uma meta, condicionada a provar a integração com Supabase e RLS. Carteiras e criptoativos serão somente leitura.
- Valores de cripto ficam separados de caixa disponível para pagar contas.
- IA explica cálculos determinísticos e pode preparar rascunhos que exigem confirmação.
- Sem Open Finance, assinatura de transações, pagamentos ou movimentação automática na V1.
- Cloudinary só será adicionado se uma funcionalidade real de imagem, como anexos de comprovantes, for aprovada.

## Engenharia

- CI: [docs/ci.md](docs/ci.md)
- Workflows: GitHub Actions para lint, testes da aplicação quando houver scaffold, Dependency Review e CodeQL.
- Dependabot agrupa atualizações semanais de Actions e npm.
- SonarQube Cloud será integrado se a instalação no repositório e o plano OSS gratuito forem confirmados.
- Plataforma de deploy será decidida depois; nenhum deploy está configurado.

## Source Pack

- [Visão do projeto](docs/project-overview.md)
- [Requisitos](docs/requirements.md)
- [Escopo](docs/scope.md)
- [Arquitetura](docs/architecture.md)
- [Modelo de dados](docs/data-model.md)
- [Segurança e privacidade](docs/security.md)
- [CI e verificações](docs/ci.md)
- [Plano de testes](docs/test-plan.md)
- [Implantação e operação](docs/deployment.md)
- [Backlog modular](docs/backlog.md)
- [Definition of Done](docs/definition-of-done.md)
- [Decisões](docs/decisions/DECISIONS.md)
- [Open Finance](docs/open-finance.md)
- [Checkpoint](docs/checkpoint.md)

## Fluxo de trabalho

Cada módulo tem Work Order e issue GitHub com dependências, critérios de aceite, testes, entregáveis e stop condition. PRs devem ser pequenas e vinculadas às issues. Trabalho paralelo começa após contratos compartilhados estarem aprovados.

## Segurança

Use apenas dados sintéticos em testes. Nunca coloque dados financeiros, bancários ou de carteira reais no GitHub. Não informe seed phrase, chave privada ou senha de carteira ao Finance AI.
