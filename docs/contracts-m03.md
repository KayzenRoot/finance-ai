# M03 — compromissos futuros, recebíveis e recorrências

Work Order `FAI-WO-M03-001`, issue #5. Base canônica M02 integrada: `96edc40dfafd8d111574dc1eda5ca7cf2a62cbb0`. Esta entrega inicial é **PR DRAFT**, não integrada nem implantada.

## Núcleo transacional

- `finance_commitments`: cada compromisso pertence a um titular e espaço, com `payable`/`receivable`, valor BRL em centavos, data de vencimento, descrição, confiança de recebível 0–100%, e status `open`, `settled`, `canceled`. Pagáveis têm confiança 100%; status não significa saldo bancário.
- `finance_recurring_plans`: modelos semanais/mensais, primeiros vencimentos ancorados; geração limitada a horizonte de 18 meses relativo à data atual e até 80 ocorrências por chamada. `finance_generate_commitments` retorna somente novas ocorrências; índice único de `series_id,due_date` impede duplicação inclusive em corridas concorrentes.
- Recorrência mensal usa `first_due_date + N months` sempre a partir da âncora, inclusive datas 29/30/31 que voltam ao dia original nos meses que o permitem.
- `finance_settle_commitment`: bloqueia a linha `FOR UPDATE`; apenas aberta, mesma identidade e espaço, conta ativa, valor integral positivo, categoria correspondente a `expense` (pagar) ou `income` (receber), data permitida. A mesma transação cria um lançamento original no M02 e um vínculo único `finance_commitment_settlements` e atualiza o status. Uma segunda chamada falha sem dupla receita/despesa.
- Cancelamento de compromisso em aberto usa RPC e não altera saldo. Um gatilho M03 rejeita o estorno/correção isolados do lançamento já associado à liquidação para não deixar status divergente.
- A view `finance_commitment_forecast` é `security_invoker` e **não participa da view de saldos confirmados**. Um recebível de confiança 30% é projeção incerta, não R$ disponível. Cenários/pesos serão tratados explicitamente em M05; não fazer projeções opacas.

## Restrições e próximos critérios

RPCs são `SECURITY DEFINER` com `search_path` vazio, `auth.uid()`, `finance_is_authorized_owner()` e checagens de espaço. Data API não recebe permissão de UPDATE/DELETE nos compromissos nem de INSERT na tabela de liquidações. FKs vinculam owner/space, e RLS forte restringe todas as leituras.

A UI protegida `/dashboard/commitments` já fornece cadastro de pagáveis/recebíveis, planos recorrentes, geração idempotente, cancelamento e liquidação manual, com filtro da agenda por status e separação visual de previsão/caixa. A smoke EVM Data API M03 exercita criação, leitura segregada, vínculo de liquidação 1:1 e a impossibilidade de reverter separadamente lançamentos quitados. Proibir pagamentos externos, Pix/boleto, dados reais, credenciais e deploy. Validar gates no HEAD final antes de READY.

### Totais completos sem truncamento

**Finding P1 corrigido:** o painel original somava somente as primeiras 100 linhas da agenda, podendo ocultar compromissos adicionais. Agora a view `finance_commitment_summary` com `security_invoker=true` agrega **todos** os compromissos `open` por proprietário/espaço/tipo em `numeric` exato e serializa `open_amount_cents` como texto, sob RLS. O limite de 100 linhas aplica-se somente à lista, jamais aos totais. O resumo não modifica `finance_account_balances`, e um recebível de baixa confiança continua apenas projetado. Foram adicionados 9 testes pgTAP e verificações REST sintéticas. Total esperado: **138 pgTAP (21+28+37+52)**, até ser comprovado no CI.
