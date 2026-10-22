# FAI-PLAN-001 — Design e planejamento inicial

Status: Source Pack e pipeline inicial registrados para revisão na PR #1; sem merge ou deploy.

## Objetivo

Definir a V1 do Finance AI, estabelecer Source Pack canônico, organizar módulos/issues e preparar PRs pequenas com critérios verificáveis e paralelismo seguro.

## Contexto

O repositório estava vazio. A V1 cobre finanças pessoais e da loja, contas, recebíveis, despesas, dívidas, projeções, prioridades explicáveis e um assistente controlado pelo titular. A direção aprovada exclui pagamentos automáticos e Open Finance em produção.

## Escopo desta Work Order

- Source Pack em português para visão, requisitos, escopo, arquitetura, dados, segurança, CI, testes, implantação, backlog, DoD, decisões, Open Finance e checkpoint.
- Issues FAI-M00 a FAI-M11 com Work Orders estáveis e dependências.
- CI rápido com Markdown lint, check condicional da aplicação, Dependency Review, CodeQL e Dependabot.
- Banco Supabase selecionado; Privy solicitado como candidato de login com carteira, sujeito a prova de RLS.
- Criptoativos como snapshots de leitura separados de caixa; Cloudinary só se houver imagens.
- Sequenciamento e paralelismo após contratos compartilhados.

## Fora do escopo

- Implementação da aplicação financeira, criação de banco de produção e deploy.
- Open Finance em produção, pagamentos, assinatura de transações, dados financeiros reais.
- Revisar/instalar apps Marketplace pelo usuário sem autenticação.
- Merge da PR de planejamento.

## Requisitos

Atender REQ-FIN-001 a 012, REQ-CRYPTO-001 a 005, REQ-SEC-001 a 006, REQ-REL-001 a 003 e REQ-UX-001 na versão de planejamento. Nenhum documento pode afirmar que produto, auth, segurança ou integração já existe.

## Regras de arquitetura

- Um titular; Pessoal e Loja separados.
- Supabase Postgres com RLS em dados expostos.
- Dinheiro em centavos/decimal exato; cripto em snapshot datado, fora do caixa disponível.
- Entradas incertas separadas do caixa confirmado.
- IA explica e propõe rascunhos; pagamentos e transações não existem na V1.
- Repositório público sem dados reais.
- Decisões técnicas de framework, auth, LLM e hospedagem fechadas por ADR antes de código.

## Critérios de aceite

1. Source Pack e workflows estão presentes e coerentes.
2. Escopo V1 e itens futuros estão identificados.
3. Módulos têm dependências, critérios, testes e limites.
4. CI executa checks e registra o resultado.
5. Open Finance permanece fora da produção V1.
6. Supabase/Privy/Cloudinary têm limites e condições declarados.
7. PR inclui hashes base/head e riscos técnicos pendentes.
