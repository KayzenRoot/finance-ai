# Backlog modular

Status: issues de módulo criadas para V1; Work Orders e links são o baseline proposto pela PR FAI-PLAN-001.

## Sequência e paralelismo

| Ordem | ID / módulo | Depende de | Trabalho paralelo |
|---|---|---|---|
| 0 | FAI-M00 — Fundação, stack, autenticação e CI | — | Bloqueia todos os módulos |
| 1 | FAI-M01 — Espaços e contas | M00 | Contrato de domínio compartilhado |
| 2 | FAI-M02 — Livro, lançamentos e categorias | M01 | Base para obrigações e importação |
| 3 | FAI-M03 — Contas a pagar e receber | M01, M02 | Paralelo com M04 após contrato |
| 3 | FAI-M04 — Cadastro de dívidas | M01, M02 | Paralelo com M03 |
| 4 | FAI-M08 — Importação/exportação CSV | M01, M02 | Após modelo de lançamentos |
| 4 | FAI-M11 — Login com carteira e ativos cripto leitura | M00, M01 | Pode avançar após contratos de identidade/conta |
| 5 | FAI-M05 — Projeção de caixa | M02, M03, M04 | Modelos de entrada estabilizados |
| 6 | FAI-M06 — Prioridade e cenários | M04, M05 | Cálculos determinísticos |
| 6 | FAI-M07 — Painel e central de ações | M01 a M06 | UI com contratos aprovados |
| 7 | FAI-M09 — Assistente de IA e rascunhos | M05, M06, M07 | Somente após APIs tipadas |
| 8 | FAI-M10 — Segurança, backup, recuperação e release | M00 a M11 | Auditoria transversal |

## Issues GitHub

- FAI-M00: [#2](https://github.com/KayzenRoot/finance-ai/issues/2)
- FAI-M01: [#3](https://github.com/KayzenRoot/finance-ai/issues/3)
- FAI-M02: [#4](https://github.com/KayzenRoot/finance-ai/issues/4)
- FAI-M03: [#5](https://github.com/KayzenRoot/finance-ai/issues/5)
- FAI-M04: [#6](https://github.com/KayzenRoot/finance-ai/issues/6)
- FAI-M05: [#7](https://github.com/KayzenRoot/finance-ai/issues/7)
- FAI-M06: [#8](https://github.com/KayzenRoot/finance-ai/issues/8)
- FAI-M07: [#9](https://github.com/KayzenRoot/finance-ai/issues/9)
- FAI-M08: [#10](https://github.com/KayzenRoot/finance-ai/issues/10)
- FAI-M09: [#11](https://github.com/KayzenRoot/finance-ai/issues/11)
- FAI-M10: [#12](https://github.com/KayzenRoot/finance-ai/issues/12)
- FAI-M11: [#13](https://github.com/KayzenRoot/finance-ai/issues/13)

## Ondas

- A: M00.
- B: M01.
- C: M02, depois M03/M04 em paralelo; M08 e M11 após interfaces acordadas.
- D: M05, depois M06/M07.
- E: M09 após domínio e interfaces estáveis.
- F: M10, segurança e release da V1.

PRs de execução devem fechar ou referenciar a issue correspondente. Paralelismo começa somente quando diretórios, interfaces e proprietários de arquivos estiverem definidos.
