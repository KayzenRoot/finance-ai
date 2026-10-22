# Modelo de domínio inicial

Status: proposta atualizada pela PR FAI-PLAN-001.

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
