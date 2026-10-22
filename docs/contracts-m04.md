# FAI-M04 — Dívidas, dados faltantes e custo de atraso

**Issue:** #6 (`FAI-WO-M04-001`). **Branch:** `feature/fai-m04-debt-register`.
**Base:** `62d9fd54b0d850376bb4f7ee430e11075be2c54e` (M03 integrado).
**Status:** implementação inicial de banco, aguardando CI e interface. Sem deploy nem dados reais.

## Decisões
- `finance_debts` contém somente identidade do credor, owner e espaço. Criação RPC exclusiva.
- `finance_debt_observations` preserva snapshots imutáveis com fonte e data obrigatórias: saldo, mínimo, vencimento, juros percentuais e período explícito (daily/monthly/annual), fonte da taxa, CET percentual e período e fonte, multa fixa e consequências conhecidas. Cada campo não informado é **NULL**, não zero.
- Não se estimam juros, CET, consequências nem multas inexistentes. Não se convertem taxas de períodos diferentes sem premissas e modelo revisado. A tela precisa mostrar o estado incompleto, não uma taxa inventada. A fonte textual identifica documento informado pelo titular, não prova sua veracidade.
- `finance_debt_latest`, com `security_invoker=true`, usa o maior `as_of_date` (desempate por gravação e id), expondo números exatos como texto; histórico bruto imutável permanece consultável. `has_missing_cost_data` sinaliza que uma comparação completa de custo não é confiável.
- DB restringe duas superfícies por RLS e owner-only allowlist. Nenhuma permissão de INSERT/UPDATE/DELETE é concedida ao cliente; RPCs SECURITY DEFINER obtêm owner de `auth.uid()`, conferem espaço e rejeitam fontes/unidades incoerentes.
- M04 é apenas cadastro e proveniência, não calcula prioridade de pagamento nem aconselhamento legal (M05/M06), nem contrata crédito ou renegocia.
- Antes de READY: criar UI com aviso de campos desconhecidos, histórico append-only, testes pgTAP e smoke sintética REST (incluindo IDOR, RLS, taxas sem unidades, histórico e revogação), CI, CodeQL, SonarCloud, Socket Security e Evidence Bundle no HEAD.
