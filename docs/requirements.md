# Requirements

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001.

## Funcionais

- REQ-FIN-001 — Manter os espaços Pessoal e Loja isolados; apresentar transferências vinculadas para evitar dupla contagem.
- REQ-FIN-002 — Cadastrar contas bancárias, dinheiro em caixa e cartões, com saldo inicial, data de referência e status.
- REQ-FIN-003 — Registrar entradas, saídas, transferências, categorias e recorrência.
- REQ-FIN-004 — Gerir contas a pagar e a receber com valor, vencimento, recorrência, status e origem.
- REQ-FIN-005 — Manter dívidas com saldo atualizado informado, vencimento, mínimo, juros/CET, multa e consequências conhecidas.
- REQ-FIN-006 — Projetar fluxo de caixa por data usando saldos, compromissos e recebimentos com nível de confiança explícito.
- REQ-FIN-007 — Comparar cenários de pagamento e mostrar saldo remanescente, custos conhecidos, insuficiências e dados ausentes.
- REQ-FIN-008 — Produzir uma lista explicável de prioridades sem efetuar pagamentos.
- REQ-FIN-009 — Importar extratos CSV com mapeamento, prévia, detecção de duplicidade e confirmação antes de gravar.
- REQ-FIN-010 — Permitir consultas em linguagem natural sobre dados já armazenados.
- REQ-FIN-011 — Permitir que a IA prepare rascunhos de lançamentos; salvar somente após confirmação explícita do titular.
- REQ-FIN-012 — Exportar os dados do titular em formato legível e utilizável.

## Segurança e qualidade

- REQ-SEC-001 — Nenhum dado financeiro real, segredo, credencial ou identificador pessoal em repositório público, issues, fixtures ou logs.
- REQ-SEC-002 — Toda leitura ou escrita deve ser autorizada no servidor e vinculada ao titular e ao espaço financeiro.
- REQ-SEC-003 — A arquitetura deve suportar criptografia em trânsito e em repouso, gestão segura de segredos, exportação e exclusão de dados.
- REQ-SEC-004 — A IA não recebe autorização para efetuar pagamentos, iniciar transações, contratar crédito ou alterar registros sem confirmação.
- REQ-SEC-005 — Valores monetários usam aritmética decimal exata; não usar ponto flutuante binário para valores em BRL.
- REQ-REL-001 — Importações são idempotentes ou oferecem revisão de duplicidades antes de salvar.
- REQ-REL-002 — Falhas de integração não podem apagar lançamentos confirmados.
- REQ-UX-001 — A aplicação deve funcionar em celular e computador e explicar termos financeiros sem exigir conhecimento técnico.

## Critérios transversais

Cada recomendação deve identificar o período analisado, dados usados, premissas, limitações, confiança e motivo da prioridade. Dados insuficientes devem gerar pergunta ou ressalva explícita.
