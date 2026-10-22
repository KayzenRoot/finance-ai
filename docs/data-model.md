# Modelo de domínio inicial

Status: modelo V1; M00 integrado e M01 em PR #17, sem deploy.

## Entidades

- Titular: usuário autenticado; a identidade precisa ser verificada pelo provedor escolhido.
- Espaço financeiro: Pessoal ou Loja; cada objeto financeiro pertence a exatamente um espaço.
- Conta: banco, carteira, caixa ou cartão, com nome amigável, moeda, saldo inicial e data de referência.
- Identidade externa: vínculo entre usuário da aplicação e identificador verificado do provedor de autenticação.
- Carteira conectada: endereço público, rede, provedor e estado de conexão, vinculados ao titular.
- Snapshot cripto: rede, ativo, quantidade exata, valor e moeda de referência, fonte, timestamp e estado de atualização.
- Lançamento: valor, moeda, data efetiva, descrição, categoria, conta, tipo, origem e estado de confirmação.
- Obrigação a pagar: credor/fornecedor, valor, vencimento, recorrência, situação e consequência conhecida.
- Recebível: origem, valor, data esperada, recorrência e confiança de recebimento.
- Dívida: credor, saldo informado, taxa e período, CET quando disponível, mínimo, vencimento e multa.
- Importação: arquivo/origem, mapeamento, prévia, linhas rejeitadas, duplicidades e confirmação.
- Recomendação: dados de entrada, período, regra, opções, premissas, limitações e horário de cálculo.
- Rascunho do assistente: proposta de alteração aguardando confirmação ou descarte.

## Integridade financeira

- Moeda financeira V1: BRL; quantidade cripto preserva casas decimais do ativo.
- Valores não usam ponto flutuante binário para cálculos financeiros. Valor de mercado tem preço, moeda, fonte e timestamp.
- Obrigação liquidada referencia o lançamento de pagamento correspondente.
- Transferência possui pares de origem/destino; o consolidado elimina a transferência interna.
- Recebível incerto é cenário, não caixa confirmado.
- Criptoativo é patrimônio estimado separado de dinheiro disponível para pagar contas.
- Atualização manual de saldo preserva origem e data de referência.
- Arquivo bruto de importação só é retido se necessário e com política definida; dados brutos não entram em logs.
- Hashes de deduplicação não devem revelar dados pessoais.

## Projeções

Projeção = saldo confirmado + entradas e saídas previstas no horizonte. Cada item mantém data, estado e confiança. Cripto não aumenta o saldo disponível para pagamentos. Cenários conservador e estimado permanecem visivelmente distintos.

## Estado da implementação M01

A PR #17 cria contas `finance_accounts` com chave estrangeira composta `(space_id, owner_id)`, tipos banco/caixa/cartão, BRL exato em centavos e data de referência. `finance_transfers` é trilha interna imutável, com RPC autenticada e dois legs derivados que somam zero no consolidado. Views `security_invoker` preservam RLS. Saldos históricos incluem contas arquivadas para manter o efeito dos dois lados de transferências anteriores; isso não representa caixa disponível ou extrato bancário real. Consulte [contratos M01](contracts-m01.md).
