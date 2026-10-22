# Backlog modular

Status: issues de planejamento criadas para V1; todas dependências usam IDs estáveis FAI-Mxx. IDs e escopos são baseline proposto pela PR FAI-PLAN-001.

## Sequência e paralelismo

| Ordem | ID / módulo | Depende de | Trabalho paralelo |
|---|---|---|---|
| 0 | FAI-M00 — Fundação, decisões de stack e segurança | — | Bloqueia implementação dos demais |
| 1 | FAI-M01 — Espaços e contas | M00 | Contrato de domínio compartilhado |
| 2 | FAI-M02 — Livro, lançamentos e categorias | M01 | Base para obrigações e importação |
| 3 | FAI-M03 — Contas a pagar e receber | M01, M02 | Pode ser paralelizado com M04 após contrato estabilizado |
| 3 | FAI-M04 — Cadastro de dívidas | M01, M02 | Pode ser paralelizado com M03 |
| 4 | FAI-M05 — Projeção de caixa | M02, M03, M04 | Só depois dos modelos de entrada estabilizados |
| 5 | FAI-M06 — Motor de prioridade e cenários | M04, M05 | Cálculos determinísticos |
| 5 | FAI-M07 — Painel e central de ações | M01 a M06 | UI pode avançar com contratos aprovados |
| 4 | FAI-M08 — Importação, deduplicação e exportação CSV | M01, M02 | Independente da IA após modelo de lançamentos |
| 6 | FAI-M09 — Assistente de IA e rascunhos confirmáveis | M05, M06, M07 | Somente após APIs tipadas |
| 7 | FAI-M10 — Segurança, backup, recuperação e release | M00 a M09 | Auditoria transversal final |

Issues GitHub: uma issue por módulo, título prefixado com o ID e Work Order no corpo. PRs devem fechar ou referenciar a issue correspondente. Os IDs mantêm rastreio caso números do GitHub mudem.

## Ondas de execução

- Onda A: M00.
- Onda B: M01.
- Onda C: M02, depois M03/M04 em paralelo; M08 pode iniciar após contrato de lançamentos.
- Onda D: M05; em seguida M06 e M07.
- Onda E: M09 após domínio, regras e interfaces estáveis.
- Onda F: M10 e Definition of Done da V1.

Paralelismo só é aceito quando diretórios, interfaces e proprietários de arquivos estão definidos nos Work Orders; mudanças concorrentes em contrato compartilhado precisam de decisão antes da execução.
