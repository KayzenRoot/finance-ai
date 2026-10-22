# Modelo de domínio inicial

Status: proposta de planejamento em revisão — Work Order FAI-PLAN-001.

## Entidades

- Titular: usuário autenticado e proprietário dos dados.
- Espaço financeiro: Pessoal ou Loja; todos os objetos financeiros pertencem exatamente a um espaço.
- Conta: banco, carteira, caixa ou cartão; guarda nome amigável, saldo inicial, data de referência e estado de conciliação.
- Lançamento: valor, moeda, data efetiva, descrição, categoria, conta, tipo, origem e estado de confirmação.
- Obrigação a pagar: credor/fornecedor, valor, vencimento, recorrência, situação e custo/consequência conhecida.
- Recebível: origem, valor, data esperada, recorrência e confiança de recebimento.
- Dívida: credor, saldo informado, taxa e período, CET quando disponível, mínimo, vencimento, multa e alternativas conhecidas.
- Importação: arquivo/origem, mapeamento de colunas, prévia, linhas rejeitadas, duplicidades e confirmação.
- Recomendação: dados de entrada, período, regra aplicada, opções, premissas, limitações e data de cálculo.
- Rascunho do assistente: proposta de alteração aguardando confirmação ou descarte.

## Integridade financeira

- Moeda V1: BRL.
- Valores são armazenados em centavos inteiros ou decimal exato; jamais em float.
- Uma obrigação liquidada referencia o lançamento de pagamento correspondente.
- Uma transferência tem pares de origem e destino vinculados; o consolidado elimina a transferência interna.
- Recebíveis incertos são cenários; não elevam o caixa confirmado antes da entrada.
- A atualização manual de saldo não apaga a origem do valor e a data de referência.
- Importações preservam o arquivo de origem apenas se necessário e sob política de retenção; dados brutos não entram em logs.
- Identificadores externos e hashes de deduplicação não devem revelar dados pessoais.

## Projeções

A projeção deriva de saldo confirmado + entradas e saídas previstas no horizonte selecionado. Cada item previsto mantém data, estado e confiança. A tela deve permitir cenário conservador e cenário com recebimentos estimados, sem apresentar ambos como saldo garantido.
