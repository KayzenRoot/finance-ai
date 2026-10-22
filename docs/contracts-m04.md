# FAI-M04 — Dívidas, dados faltantes e custo de atraso

**Issue:** #6 (`FAI-WO-M04-001`). **Branch:** `feature/fai-m04-debt-register`.
**Base:** `62d9fd54b0d850376bb4f7ee430e11075be2c54e` (M03 integrado).
**Status:** migração, UI e teste EVM sintético implementados na PR #20; revalidação final pendente. Sem deploy nem dados reais.

## Decisões

- `finance_debts` contém somente identidade do credor, owner e espaço. Criação RPC exclusiva.
- `finance_debt_observations` preserva snapshots imutáveis com fonte e data obrigatórias: saldo, mínimo, vencimento, juros percentuais e período explícito (daily/monthly/annual), fonte da taxa, CET percentual e período e fonte, multa fixa e consequências conhecidas. Cada campo não informado é **NULL**, não zero.
- Não se estimam juros, CET, consequências nem multas inexistentes. Não se convertem taxas de períodos diferentes sem premissas e modelo revisado. A tela precisa mostrar o estado incompleto, não uma taxa inventada. A fonte textual identifica documento informado pelo titular, não prova sua veracidade.
- `finance_debt_latest`, com `security_invoker=true`, usa o maior `as_of_date` (desempate por gravação e id), expondo números exatos como texto; histórico bruto imutável permanece consultável. `has_missing_cost_data` sinaliza que uma comparação completa de custo não é confiável.
- DB restringe duas superfícies por RLS e owner-only allowlist. Nenhuma permissão de INSERT/UPDATE/DELETE é concedida ao cliente; RPCs SECURITY DEFINER obtêm owner de `auth.uid()`, conferem espaço e rejeitam fontes/unidades incoerentes.
- M04 é apenas cadastro e proveniência, não calcula prioridade de pagamento nem aconselhamento legal (M05/M06), nem contrata crédito ou renegocia.
- Antes de READY: criar UI com aviso de campos desconhecidos, histórico append-only, testes pgTAP e smoke sintética REST (incluindo IDOR, RLS, taxas sem unidades, histórico e revogação), CI, CodeQL, SonarCloud, Socket Security e Evidence Bundle no HEAD.

## Invariantes de precisão e preenchimento

- A RPC recusa taxas de juros/CET com mais de oito casas decimais efetivas; assim o tipo `numeric(14,8)` não arredonda silenciosamente um número informado pelo titular. Dois pgTAP e duas negações Data API exercitam esse limite. Meta de testes após a alteração: **178 (M00=21, M01=28, M02=37, M03=52, M04=40)**.
- A observação é um *snapshot completo*, não uma alteração parcial. A interface agora apresenta os valores existentes como padrão e exige fonte e data novas para cada registro. O titular pode explicitamente limpar um campo e transformá-lo em desconhecido; a versão anterior continua no histórico append-only.
- A UI possui limite declarado de 100 credores e 100 observações exibidas por espaço; a tabela retém todo o histórico. Navegação histórica completa e paginação detalhada são melhorias futuras de UX e não são sinônimo de perda dos dados.
- **Não calcular** custo exato de atraso nem prioridade de pagamento sem base suficiente, períodos consistentes, regra e fonte verificáveis. Campos desconhecidos são NULL.
