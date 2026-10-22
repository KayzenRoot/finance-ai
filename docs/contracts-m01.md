# M01 — Espaços, contas e transferências internas

Work Order: FAI-WO-M01-001, issue #3. **Estado: implementação em PR, ainda não integrado.** Base M00: `04797f1d058b5a37586383b60a5a3e6dc4037926`.

## Contrato da persistência

- `finance_spaces` (M00) permanece restrito ao único titular provisionado.
- `finance_accounts`: vincula `owner_id` e `space_id` por chave estrangeira composta; tipos `bank`, `cash`, `card`; moeda BRL; `opening_balance_cents` inteiro assinado e `opening_balance_date`; arquivamento via `archived_at`.
- `finance_transfers`: registro **interno e imutável**, sem envio bancário, assinatura de transação ou integração de pagamento. O cliente não tem permissão SQL para inserir transferências diretamente.
- RPC `finance_record_transfer(from, to, amount_cents, date)`: SECURITY DEFINER com `search_path` vazio; verifica JWT, singleton autorizado, mesma titularidade, contas não arquivadas, origem distinta, montante positivo e data de referência.
- `finance_transfer_legs`: view `security_invoker` cria os dois lançamentos vinculados `-x,+x` de cada transferência. Sua soma consolidada é sempre **0**.
- `finance_account_balances`: view `security_invoker` calcula `opening_balance_cents + soma(legs)`. Os valores são `numeric` no Postgres para evitar overflow e aritmética decimal imprecisa; no cliente converter exclusivamente para texto/centavos e nunca float.
- Migração existente de M00 não é modificada. O novo script é sequencial e depende dela.

## Gates e riscos

- Teste pgTAP com usuários sintéticos confirma isolamento de espaço, conta e transferência; valor exato, soma zero, arquivamento, imutabilidade e revogação.
- Conta pode ser renomeada/arquivada. Titular, espaço, moeda e ID são imutáveis; saldo de referência fica congelado depois de qualquer transferência. M02 adicionará lançamentos sem transformar transferência interna em receita/despesa.
- Valores da loja/pessoal nunca devem aparecer em logs GitHub nem fixtures reais.
- O backend Supabase hospedado e dados reais permanecem fora de escopo. A PR #17 inclui dashboard SSR e Server Actions para criar espaços/contas, arquivar e registrar transferências internas, com filtragem por espaço aplicada na consulta Supabase. Saldos são referências, sem sincronização bancária. O módulo ainda não foi integrado.

## Precisão de saldos e histórico arquivado

A coluna `current_balance_cents` da view retorna **texto decimal exato**, não JSON number: transferências de diversas contas podem produzir agregados acima de `Number.MAX_SAFE_INTEGER` mesmo com cada montante individual dentro do limite. A interface usa `BigInt` e formatação pt-BR, nunca `Number(...)` ou aritmética de ponto flutuante. O total consolidado e os totais por espaço incluem contas arquivadas para que arquivar uma conta não apague metade de uma transferência histórica; **não representam saldo disponível em banco ou caixa atual**. Contas arquivadas não admitem novas transferências.

## Evidence Bundle anterior à consolidação documental

- HEAD `176a48227ae2d14895ee93f27a5334d313b064d2`: workflows CI [39831779899](https://github.com/KayzenRoot/finance-ai/actions/runs/39831779899), CodeQL JS/TS [39831779906](https://github.com/KayzenRoot/finance-ai/actions/runs/39831779906), Dependency Review [39831779878](https://github.com/KayzenRoot/finance-ai/actions/runs/39831779878) e Supabase [39831779921](https://github.com/KayzenRoot/finance-ai/actions/runs/39831779921) concluídos SUCCESS.
- Supabase pgTAP inclui 21 testes M00 e 28 M01 em dados sintéticos. Revisar log para contagem exata do run antes da promoção; nenhuma simulação foi chamada de teste real com usuário financeiro.
- M01 deve permanecer PR até evidência de checks obrigatórios no HEAD final e auditoria objetiva, sem review humano exigido.

## Validação de contrato na Data API (M01)

A smoke test `tests/auth/web3-smoke.mjs` agora verifica acesso via Supabase REST com duas carteiras EVM **efêmeras e sintéticas**: criação de contas em espaços Pessoal/Loja, autorização por titular, tentativa de conta forjada, consulta segregada com `security_invoker`, proibição de INSERT direto em transferências, registro válido via RPC, duas pernas de soma zero e revogação de leitura após remoção da allowlist. CI de Supabase deve comprovar sucesso antes da promoção. A interface também permite renomear conta ativa com uma Server Action que revalida sessão, allowlist e owner_id; arquivamento preserva o histórico. Nenhum banco real é acessado.

## Evidência final da API local e limites

No HEAD de implementação `f4096b1fc886877bde781e9fcc8c978381ab13a3`, o workflow Supabase [39833918885](https://github.com/KayzenRoot/finance-ai/actions/runs/39833918885) concluiu com `Files=2, Tests=49, Result: PASS`, executou autenticação EVM sintética e o smoke via Data API de contas/transferências/isolamento/revogação e restaurou um registro sintético. CI [39833918956](https://github.com/KayzenRoot/finance-ai/actions/runs/39833918956), CodeQL JS/TS [39833918868](https://github.com/KayzenRoot/finance-ai/actions/runs/39833918868) e Dependency Review [39833919180](https://github.com/KayzenRoot/finance-ai/actions/runs/39833919180) passaram. Este registro não demonstra operação com instituição bancária, Solana real, infraestrutura hospedada ou ambiente de produção; a PR segue separada da main. Alteração documental subsequente exige check no HEAD final.
