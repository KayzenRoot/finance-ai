# Finance AI

Assistente financeiro privado para organizar finanças pessoais e da loja, projetar caixa e explicar prioridades com critérios verificáveis.

## Estado

Planejamento e CI inicial integrados à `main` pela PR #1. A fundação do produto está sendo preparada na issue [FAI-M00 #2](https://github.com/KayzenRoot/finance-ai/issues/2); ainda não há banco de produção, dados financeiros ou deploy. O repositório é público: dados financeiros, endereços de carteira associados ao titular, credenciais, segredos e identificadores pessoais não podem entrar em commits, issues, exemplos, fixtures ou logs.

## Direção da V1

- Espaços Pessoal e Loja separados, contas, lançamentos, obrigações, recebíveis, dívidas, projeções e prioridades explicáveis.
- Supabase Postgres como banco selecionado; tabelas expostas usam permissões explícitas e RLS por titular.
- A fundação usa Supabase Auth Web3 nativo para Ethereum (SIWE) e Solana (SIWS). A assinatura serve somente para autenticação; Privy fica adiado enquanto essa opção atende à V1.
- O acesso requer identificação do titular no servidor (`FINANCE_AI_OWNER_USER_ID`) **e** provisionamento administrativo na lista privada `finance_private.authorized_owners` do Supabase; carteira autenticada não significa autorização automática.
- Carteiras e criptoativos serão somente leitura. Não há assinatura de transação ou movimentação de fundos.
- Valores de cripto ficam separados de caixa disponível para pagar contas.
- IA explica cálculos determinísticos e pode preparar rascunhos que exigem confirmação.
- Sem Open Finance, assinatura de transações, pagamentos ou movimentação automática na V1.
- Cloudinary só será adicionado se uma funcionalidade real de imagem, como anexos de comprovantes, for aprovada.

## Engenharia

- Stack de aplicação: Next.js 16, TypeScript, Node.js 24 e npm; Supabase SSR para sessões seguras.
- CI: [docs/ci.md](docs/ci.md)
- Workflows: GitHub Actions para lint, typecheck, testes, build, `npm audit`, Dependency Review e CodeQL; um workflow seletivo de Supabase executa migrações, pgTAP, carteiras sintéticas e exportação/restauração de teste.
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
- [Threat Model inicial do M00](docs/threat-model-m00.md)
- [Contratos compartilhados do M00](docs/contracts-m00.md)
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

## Desenvolvimento local

Requer Node.js 24, npm e Docker se quiser executar o Supabase local.

```sh
npm ci
cp .env.example .env.local
npx supabase start
npx supabase status
npm run dev
```

Preencha em `.env.local` a URL e a chave pública/anon exibidas pelo Supabase local. Para acesso autorizado ao dashboard, configure `FINANCE_AI_OWNER_USER_ID` somente no ambiente do servidor. Rode `npm run lint`, `npm run typecheck`, `npm run test:ci` e `npm run build` para validar a fundação. `npm run test:wallet` e `npm run supabase:test` dependem do Supabase local ativo.
