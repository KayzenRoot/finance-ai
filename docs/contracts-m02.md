# M02 — Livro financeiro, categorias e trilha de correção

Work Order: FAI-WO-M02-001, issue #4. Base integrada M01: `2fcdb5bf21ddb5f3293585a554f56525d34d2bd7`. Estado: implementação inicial em branch.

## Contratos centrais

- `finance_categories`: categoria por `owner_id` + `space_id` + `kind` (`income`/`expense`), nome editável, arquivamento, unicidade insensível a maiúsculas para nomes ativos. Tipo/espaço/owner/id não podem ser alterados.
- `finance_ledger_entries`: trilha **append-only** de entradas/saídas confirmadas. Não concede INSERT/UPDATE/DELETE direto a `authenticated`. Todas as escritas passam pelas RPCs `finance_record_entry`, `finance_cancel_entry` e `finance_correct_entry`.
- Cada lançamento possui proprietário autorizado, espaço, conta, categoria compatível com o tipo e espaço, montante inteiro positivo em centavos, data efetiva, descrição, origem `manual` e papel (`original`, `reversal`, `replacement`). Sem receber dinheiro ou iniciador de pagamentos.
- Cancelamento insere evento de reversão. Correção insere reversão e substituição *na mesma transação*, com vínculo ao original; duplicar reversão é bloqueado com unique index. O histórico original não é alterado nem apagado.
- `finance_ledger_legs` usa `security_invoker=true` e fornece sinal de cada lançamento em texto decimal; `income` credita e `expense` debita, `reversal` inverte.
- `finance_account_balances` mantém o contrato do M01 (mesmas colunas, `current_balance_cents` como texto exato), acrescentando lançamento líquido ao saldo inicial + transferências internas. Arquivamento preserva histórico. Consolidação de transferências continua soma zero.
- Categoria pode ser editada sem reescrever eventos, mas mudança de nome atualiza a exibição histórica. Uma taxonomia versionada de nomes fica fora desta entrega inicial.

## Riscos e aceitação

Testes pgTAP e smoke Data API sintéticos devem provar: IDOR e RLS para todos os objetos, FK composta entre espaço/conta/categoria, precisão, receita/despesa, soma-zero interna, cancelamento único, correção atômica e imutabilidade, revogação de titular, nenhuma operação financeira externa. UI deve permitir criar categoria, registrar lançamento, filtrar histórico, cancelar ou corrigir sem apagar trilhas. Sem deploy, chaves de produção ou dados reais. Não confundir prova do banco local com testes de navegador real.
