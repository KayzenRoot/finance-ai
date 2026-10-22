# Decisions Ledger

Estado: propostas iniciais para revisão na PR FAI-PLAN-001. Decisões 001–004 refletem a direção que o titular aprovou em 2026-10-22; o documento ainda deve ser revisado e consolidado.

| ID | Decisão | Estado | Motivo / consequência |
|---|---|---|---|
| DEC-001 | V1 é para um único titular; multiusuário fica fora. | Aprovada em conversa; proposta escrita | Mantém o primeiro corte pequeno e privado. |
| DEC-002 | Pessoal e Loja são espaços financeiros separados; transferências internas são vinculadas e eliminadas do consolidado. | Aprovada em conversa; proposta escrita | Evita mistura de despesas e contagem duplicada. |
| DEC-003 | V1 começa com lançamento manual e importação CSV. Open Finance fica para avaliação futura. | Aprovada em conversa; proposta escrita | Permite iniciar controle sem esperar parceiro, elegibilidade e integração. |
| DEC-004 | A V1 recomenda e explica; não executa pagamentos. Cálculos financeiros são determinísticos; IA explica e prepara rascunhos confirmáveis. | Aprovada em conversa; proposta escrita | Mantém controle do titular e resultados reproduzíveis. |
| DEC-005 | Locale inicial proposto: pt-BR e BRL. | Proposta | Adequa a primeira instalação ao contexto informado; validar no Source Pack. |
| DEC-006 | Stack, hospedagem, autenticação e provedor LLM serão escolhidos antes da implementação por ADR. | Proposta / gate bloqueador | Evita assumir custo ou fluxo de dados sem avaliação. |
| DEC-007 | Interface web responsiva é a opção inicial recomendada. | Proposta | Permite uso em telefone e computador; validar na revisão. |
| DEC-008 | Repositório público não recebe dado financeiro real, segredo nem fixture identificável. | Regra de segurança proposta | Reduz exposição acidental. |
| DEC-009 | Classificação de risco do produto é ELEVATED enquanto processar dados sensíveis e gerar prioridades, sem executar transações. | Proposta | Requer testes de segurança, dados e recuperação antes do uso real. |

## Histórico

- 2026-10-22 — Titular aprovou a direção conceitual de uso pessoal, espaços separados, entrada manual/CSV, prioridades explicáveis, IA explicativa e ausência de pagamentos automáticos.
- Nenhuma decisão técnica de stack ou implantação foi aprovada nesta etapa.
